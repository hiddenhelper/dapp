import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'
import BigNumber from 'bignumber.js'
// import Web3 from 'web3'
import { FundState, Module } from '@helium'
import { utilsMixin } from '../mixins/utilsMixin.js'
import { fundMixin } from '../mixins/fundMixins.js'
import {
  fetchCurrentPrices,
  fetchCurrentFullData,
  fetchETHPrice,
  fetchUniswapPrice
} from '../modules/cryptoPriceHelpers.js'
import { caseInsensitiveEquality } from '../modules/utils.js'
import { createHeliumConnector, createGalliumConnector } from '../modules/connectorUtils.js'
// import { gasEstimationMixin } from '../mixins/gasEstimationMixin.js'

Vue.use(Vuex)

// const LOCAL_SERVER = '//localhost:3000'
// const LOCAL_SERVER = '//192.168.1.208:3000'

const REMOTE_SERVER = 'https://asia-east2-dextf-poc.cloudfunctions.net'
const AWS_REMOTE_SERVER = 'https://api.dextf.com'

// const ENVIRONMENT = process.env.ENVIRONMENT == 'production' ? 'prod' : 'dev'
// const ENVIRONMENT = 'prod'
// const ENVIRONMENT = 'ropsten'
const ENVIRONMENT = 'dev'

const AWS_API_ENV = 'd' + ENVIRONMENT.substring(0, 1)
const AWS_API_SERVER = `${AWS_REMOTE_SERVER}/${AWS_API_ENV}/`

// console.log('AWS_API_SERVER', AWS_API_SERVER)

const AWS_API_ENV2 = 'w' + ENVIRONMENT.substring(0, 1)
const AWS_API_SERVER2 = `${AWS_REMOTE_SERVER}/${AWS_API_ENV2}/`

// console.log('AWS_API_SERVER2', AWS_API_SERVER2)

const AWS_API_ENV3 = 'dc' + ENVIRONMENT.substring(0, 1)
const AWS_API_SERVER3 = `${AWS_REMOTE_SERVER}/${AWS_API_ENV3}/`

// console.log('AWS_API_SERVER3', AWS_API_SERVER3)

const API_ENV = ENVIRONMENT == 'dev' ? '' : ENVIRONMENT == 'ropsten' ? 'beta-' : ENVIRONMENT + '-'
const API_SERVER = REMOTE_SERVER + (API_ENV ? '/' + API_ENV : '/')

// console.log('API_SERVER', API_SERVER)

const FUND_SYMBOL_MAX_LENGH = 10

const fundApis = new Map()
const assetApis = new Map()
const chainChangedEvents = {
  connectorId: undefined,
  provider: undefined,
  intervalId: undefined,
  listeners: new Map()
}

function getFundApiByContract(state, contract) {
  let api = fundApis.get(contract)
  if (!api) {
    api = state.connector.createFundApi(contract)
    fundApis.set(contract, api)
  }
  return api
}

function getAssetApiByContract(state, contract) {
  let api = assetApis.get(contract)
  if (!api) {
    api = state.connector.createTokenApi(contract)
    assetApis.set(contract, api)
  }
  return api
}

function fetchFundBalance(state, fund) {
  // TO TEST: remove
  /*
  fund.balance = new BigNumber(117.920002537352710739)
  return Promise.resolve({
    symbol: fund.symbol,
    balance: fund.balance
  })
  */
  /*
  if (fund.symbol == 'XTF2000F01') {
    fund.balance = new BigNumber(3)
    return Promise.resolve({ symbol: fund.symbol, balance: fund.balance })
  }
  if (fund.symbol == 'XTF2000F02') {
    fund.balance = new BigNumber(4)
    return Promise.resolve({ symbol: fund.symbol, balance: fund.balance })
  }
  */
  // //////////////////////

  if (!state.connector || !state.networkValid || !state.currentAccount.address || !fund.address) {
    fund.balance = new BigNumber(0.0)
    return Promise.resolve({ symbol: fund.symbol, balance: fund.balance })
  }

  return new Promise((resolve, reject) => {
    // getErc20Balance(state.connector, state.currentAccount.address, fund.address)
    const fundApi = getFundApiByContract(state, fund.address)
    fundApi
      .getBalance(state.currentAccount.address)
      .then((balance) => {
        // console.log(fund.symbol, 'balance', balance.toNumber())
        fund.balance = balance || new BigNumber(0.0)
        resolve({ symbol: fund.symbol, balance: fund.balance })
      })
      .catch((error) => {
        console.error('error', error)
        fund.balance = new BigNumber(0.0)
        reject(error)
      })
  })
}

function fetchFundTotalSupply(state, fund) {
  if (
    !state.networkValid ||
    !state.connector ||
    !state.currentAccount.address ||
    !state.user ||
    !fund.address
  ) {
    fund.totalNoOfTokens = new BigNumber(0.0)
    return Promise.resolve({
      symbol: fund.symbol,
      totalNoOfTokens: fund.totalNoOfTokens
    })
  }

  return new Promise((resolve, reject) => {
    const assetApi = getAssetApiByContract(state, fund.address)
    assetApi
      .getTotalSupply()
      .then((result) => {
        // console.log('SUPPLY', fund.symbol, result.data.totalSupply.toString())
        fund.totalNoOfTokens = result.data.totalSupply || new BigNumber(0.0)
        if (fund.totalNoOfTokens.gt(0) && fund.totalNoOfTokens.lt(0.000001)) {
          if (ENVIRONMENT === 'dev')
            console.warn(
              `${fund.symbol}: total supply too small (${fund.totalNoOfTokens.toString()})`
            )
          fund.totalNoOfTokens = new BigNumber(0.0)
        }
        resolve({
          symbol: fund.symbol,
          totalNoOfTokens: fund.totalNoOfTokens
        })
      })
      .catch((error) => {
        console.error('error', error)
        fund.totalNoOfTokens = new BigNumber(0.0)
        reject(error)
      })
  })
}

function fetchAssetBalance(state, asset, caller) {
  if (!state.connector || !state.networkValid || !state.currentAccount.address) {
    asset.balance.wallet = new BigNumber(0.0)
    return Promise.resolve({ symbol: asset.symbol, balance: asset.balance })
  }

  return new Promise((resolve, reject) => {
    const assetApi = getAssetApiByContract(state, asset.contract)
    assetApi
      .getBalance(state.currentAccount.address)
      .then((balance) => {
        asset.balance.wallet = balance || new BigNumber(0.0)
        resolve({ symbol: asset.symbol, balance: asset.balance })
      })
      .catch((error) => {
        console.error('error fetchAssetBalance', asset.symbol, error)
        asset.balance.wallet = new BigNumber(0.0)
        // Fail silently: I still resolve (and don't reject)
        resolve({ symbol: asset.symbol, balance: asset.balance })
      })
  })
}

function fetchEtherBalance(state, data) {
  if (!state.networkValid || !state.connector || !data || !data.address) {
    return Promise.resolve({ balance: new BigNumber(0.0) })
  }

  return new Promise((resolve, reject) => {
    state.connector
      .getBalance(data.address)
      .then((result) => {
        data.balance = result.data.balanceEth
        resolve({ balance: data.balance })
      })
      .catch((error) => {
        console.error('error', error)
        // Fail silently: I still resolve (and don't reject)
        resolve({ balance: new BigNumber(0.0) })
      })
  })
}

const store = new Vuex.Store({
  // Do not enable strict mode when deploying for production to avoid the performance cost.
  // strict: process.env.NODE_ENV !== 'production',
  state: {
    dappLoaded: false,
    user: {
      /* DAPP-164
      txOptions: {
        from: '0x',
        gas: 2000000,
        gasPriceInGwei: 110
      }
      */
    },
    gasOptions: {},
    options: {
      filters: {
        cnt: 0,
        invested: false,
        favourite: false,
        uniswap: false,
        kyber: false,
        inactive: false,
        risks: [true, true, true, true, true],
        assets: '',
        myTokens: false,
        staticFunds: true,
        dynamicFunds: true
      },
      sortOptions: {
        by: 'AUM',
        order: 'desc'
      },
      userMode: 'simple',
      wallet: 'MetaMask',
      network: {}
    },
    // environmentBlockchain: null,
    metamaskInstalled: false,
    connector: null,
    galliumConnector: null,
    networkValid: false,
    primaryColor: { rgbString: 'rgb(149, 252, 112)', rgb: '149, 252, 112' },
    uniswap: {
      ethPriceUSD: 0,
      dextfPriceUsd: 0
    },
    currentNetwork: null,
    currentAccount: {
      address: null,
      cryptos: {
        DEXTF: {
          address: '0x', // this will reference the corresponding asset in Assets
          balance: new BigNumber(0.0), // this will reference the corresponding asset in Assets
          priceUSD: 0.0,
          priceSymbol: 'DEXTF',
          image: 'images/assets/dextf.png',
          isActive: true,
          staked: new BigNumber(0),
          earned: new BigNumber(0),
          apr: new BigNumber(0)
        },
        WETH: {
          address: '0x', // this will reference the corresponding asset in Assets
          balance: new BigNumber(0.0), // this will reference the corresponding asset in Assets
          priceUSD: 0.0,
          priceSymbol: 'ETH',
          image: 'images/assets/weth.svg',
          isActive: true
        },
        DAI: {
          address: '0x', // this will reference the corresponding asset in Assets
          balance: new BigNumber(0.0), // this will reference the corresponding asset in Assets
          priceUSD: 0.0,
          priceSymbol: 'DAI',
          image: 'images/assets/dai.svg',
          isActive: true
        },
        WBTC: {
          address: '0x', // this will reference the corresponding asset in Assets
          balance: new BigNumber(0.0), // this will reference the corresponding asset in Assets
          priceUSD: 0.0,
          priceSymbol: 'BTC',
          image: 'images/assets/wbtc.svg',
          isActive: false
        },
        USDC: {
          address: '0x', // this will reference the corresponding asset in Assets
          balance: new BigNumber(0.0), // this will reference the corresponding asset in Assets
          priceUSD: 0.0,
          priceSymbol: 'USDC',
          image: 'images/assets/usdc.svg',
          isActive: true
        }
      }
    },
    connectingFm: false,
    networks: [],
    companies: [],
    makerOrders: [],
    assets: [],
    assetsByContract: new Map(),
    fund: fundMixin.methods.createNewFund(),
    defaultFundColor: '#8c8c8c',
    funds: [],
    topFundSymbols: [],
    ratings: {},
    workInProgress: false,
    workInProgressMessage: '',
    environment: ENVIRONMENT,
    riskAssessments: [],
    APIs: {
      login: API_SERVER + 'login',
      logout: API_SERVER + 'logout',
      assets: AWS_API_SERVER3 + 'assets',
      signup: AWS_API_SERVER + 'signup',
      companies: AWS_API_SERVER3 + 'companies',
      fee: AWS_API_SERVER + 'fee',
      funds: API_SERVER + 'funds-v2',
      leaderboardFunds: AWS_API_SERVER3 + 'stats/funds/leaderboard',
      launchFund: API_SERVER + 'launchFund-v2',
      addFund: API_SERVER + 'addFund-v2',
      updateFund: API_SERVER + 'updateFund-v2',
      issueFund: API_SERVER + 'issueFund-v2',
      redeemFund: API_SERVER + 'redeemFund-v2',
      updateRebalanceState: API_SERVER + 'update-rebalance-state',
      broadcastProposalToDiscord: AWS_API_SERVER + 'rebalance/proposal/broadcast/discord',
      broadcastProposalToTelegram: AWS_API_SERVER + 'rebalance/proposal/broadcast/telegram',
      changePassword: API_SERVER + 'changePassword',
      addMakerOrder: AWS_API_SERVER + 'maker/add-order',
      makerOrders: AWS_API_SERVER + 'maker/orders',
      takerFillOrder: AWS_API_SERVER + 'taker/fill-order',
      changeUserDetails: API_SERVER + 'changeUserDetails',
      getAllRiskAssessments: AWS_API_SERVER + 'risk/assessments',
      submitRiskAssessment: AWS_API_SERVER + 'risk/submit',
      tokenTotalSupply: AWS_API_SERVER + 'token/supply/total',
      tokenTotalCirculating: AWS_API_SERVER + 'token/supply/circulating',
      tokenDailyAirdrop: AWS_API_SERVER3 + 'token/airdrop/daily',
      investorDailyAirdrop: AWS_API_SERVER3 + 'token/investor/airdrop/daily',
      xtfFundsApy: AWS_API_SERVER2 + 'stats/apy',
      xtfAllApy: AWS_API_SERVER3 + 'stats/pools/all/apy',
      xtfAllLiquidity: AWS_API_SERVER3 + 'stats/pools/all/liquidity',
      xtfDextfFundsApy: AWS_API_SERVER3 + 'stats/pools/dextf/apy',
      xtfDextfFundsLiquidity: AWS_API_SERVER3 + 'stats/pools/dextf/liquidity',
      xtfOthersFundsApy: AWS_API_SERVER3 + 'stats/pools/others/apy',
      xtfOthersFundsLiquidity: AWS_API_SERVER3 + 'stats/pools/others/liquidity',
      pool2Apy: AWS_API_SERVER3 + 'stats/pool2/apy',
      pool2Liquidity: AWS_API_SERVER3 + 'stats/pool2/liquidity',
      getTopUniswapPools: AWS_API_SERVER3 + 'stats/pools/top5',
      getTopFunds: AWS_API_SERVER3 + 'stats/funds/top',
      featuredFunds: AWS_API_SERVER3 + 'stats/funds/featured',
      dappTvl: AWS_API_SERVER3 + 'stats/funds/tvl',
      getGasOptions: AWS_API_SERVER3 + 'gas',
      fundPrices: AWS_API_SERVER + 'stats/fundPrice',
      fundAum: AWS_API_SERVER + 'stats/fund-aum',
      fundExists: AWS_API_SERVER3 + 'fund/exists',
      stakingDailyTokensPerBlock: AWS_API_SERVER3 + 'stats/ethereum/blocks/daily',
      feeCollectorRecipient: AWS_API_SERVER3 + '/fee-collector-recipient'
    }
  },
  mutations: {
    SET_USER_DATA(state, userData) {
      state.user = userData

      if (!state.user.photo) {
        state.user.photo = 'images/users/john_doe.jpg'
        // state.user.photo = 'images/users/image.jpg'
      }
      localStorage.setItem('user', JSON.stringify(state.user))

      // Inject the Session Token in the Authorization header (Bearer schema)
      // so that all future requests will have it:

      // eslint-disable-next-line
      axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`
    },
    CLEAR_DATA(state) {
      localStorage.removeItem('user')
      state.user = undefined
      // Clear other "user-related" data
      state.companies = []
      state.makerOrders = []
      state.assets = []
      state.assetsByContract = new Map()
      state.funds = []
      state.connector = null
      state.galliumConnector = null
    },
    SET_CURRENT_NETWORK(state, network) {
      state.currentNetwork = network
    },
    SET_CURRENT_ACCOUNT(state, address) {
      // console.log('SET_CURRENT_ACCOUNT', address)
      state.currentAccount.address = address
      if (state.user) {
        if (state.user.type === 'address') {
          state.user.userId = address
        }
        if (state.user.txOptions) {
          state.user.txOptions.from = state.currentAccount.address
        }
        localStorage.setItem('user', JSON.stringify(state.user))
      }
    },
    SET_NETWORKS(state, networks) {
      state.networks = networks || []
    },
    // SET_ENVIRONMENT_BLOCKCHAIN(state, environmentBlockchain) {
    //   state.environmentBlockchain = environmentBlockchain
    // },
    SET_CONNECTOR(state, connector) {
      state.connector = connector
    },
    SET_GALLIUMCONNECTOR(state, connector) {
      state.galliumConnector = connector
    },
    SET_COMPANIES(state, companies) {
      state.companies = companies || []
    },
    SET_MAKER_ORDERS(state, makerOrders) {
      state.makerOrders = makerOrders || []
    },
    SET_ASSETS(state, assets) {
      state.assets = assets || []
      state.assetsByContract = new Map()

      state.assets.forEach((asset) => {
        state.assetsByContract.set(asset.contract, asset)
      })
    },
    ADD_FUND(state, fund) {
      state.funds.push(fund)
    },
    REPLACE_FUND(state, fund) {
      let i = -1
      let f = state.funds.find((f) => {
        i++
        return f.symbol == fund.symbol
      })
      if (f) {
        state.funds.splice(i, 1, fund)
      }
    },
    SET_FUNDS(state, funds) {
      state.funds = funds || []
    },
    SET_TOP_FUNDS(state, topFundSymbols) {
      state.topFundSymbols = topFundSymbols || []
    },
    UPDATE_PRIMARY_COLOR(state, rgbValues) {
      state.primaryColor.rgbString = `rbg(${rgbValues})`
      state.primaryColor.rgb = rgbValues
    },
    LOAD_COOKIES(state, whatToLoad) {
      // Ratings (Favourite)
      if (whatToLoad.ratings === true) {
        let ratings = window.localStorage.getItem('ratings')
        if (ratings === null) {
          state.ratings = {}
          window.localStorage.setItem('ratings', JSON.stringify(state.ratings))
        } else {
          state.ratings = JSON.parse(ratings)
        }
      }

      // Options (Filters, SortOptions, userMode...)
      if (whatToLoad.options === true) {
        let cookieValues = window.localStorage.getItem('options')
        if (cookieValues) {
          cookieValues = JSON.parse(cookieValues)
          cookieValues.cnt = 0 // used for reactivity, can be reset
          // Deep merge using jquery
          $.extend(true, state.options, cookieValues)
        }
        // Always save merged version to be sure to include new options
        window.localStorage.setItem('options', JSON.stringify(state.options))
      }
    },
    UPDATE_FUND_MODULES(state, data) {
      if (data && data.fund) {
        /*
        console.log(
          'update modules of',
          data.fund.symbol,
          data.pendingModules.length,
          data.initializedModules.length
        )
        */
        data.fund.pendingModules = data.pendingModules
        data.fund.initializedModules = data.initializedModules
      }
    },
    UPDATE_FUND_FEE_MODULE_SETTINGS(state, data) {
      if (data && data.feeModule) {
        data.feeModule.settings.streamingFeeSettings.streamingFeePercentage =
          data.streamingFeePercentage
        data.feeModule.settings.streamingFeeSettings.maxStreamingFeePercentage =
          data.maxStreamingFeePercentage
        data.feeModule.settings.streamingFeeSettings.lastStreamingFeeTimestamp =
          data.lastStreamingFeeTimestamp
        data.feeModule.settings.streamingFeeSettings.earnedFees = data.earnedFees
      }
    },
    UPDATE_REBALANCE_STATE(state, data) {
      if (data && data.fund) {
        data.fund.rebalance.state = data.info.state
        data.fund.rebalance.rationale = data.info.rationale
        data.fund.rebalance.tradingTimestamp = data.info.tradingTimestamp
        data.fund.rebalance.minimumDelay = data.info.minimumDelay
        data.fund.rebalance.proposalTimestamp = data.info.proposalTimestamp
        data.fund.rebalance.proposalEndTimestamp = data.info.proposalEndTimestamp
        data.fund.rebalance.tradedFundTokens = data.info.tradedFundTokens
        data.fund.rebalance.maxTradedFundTokens = data.info.maxTradedFundTokens
        data.fund.rebalance.in.assets = data.info.in.assets
        data.fund.rebalance.out.assets = data.info.out.assets
        data.fund.rebalance.slippage = data.info.slippage
      }
    },
    UPDATE_FUND_BALANCE(state, data) {
      if (data && data.fund) {
        if (data.fund.balance && !data.fund.balance.eq(data.balance)) {
          data.fund.balance = data.balance
        }
        if (data.fund.totalNoOfTokens && !data.fund.totalNoOfTokens.eq(data.totalNoOfTokens)) {
          data.fund.totalNoOfTokens = data.totalNoOfTokens
        }
      }
    },
    UPDATE_FUND_STATE(state, data) {
      if (data && data.fund) {
        data.fund.refreshing = data.refreshing === true
      }
    },
    UPDATE_ASSET_BALANCE(state, data) {
      if (data) {
        const assetNewBalance = data.asset.balance
        assetNewBalance.wallet = data.balance.wallet || new BigNumber(0.0)
      }
    },
    UPDATE_ETHER_BALANCE(state, data) {
      if (data) {
        state.currentAccount.cryptos.ETH.balance = data.balance
      }
    },
    UPDATE_DEFAULT_GAS_LIMITS(state, limits) {
      if (limits) {
        let changed = false
        if (limits.gas && limits.gas != state.user.txOptions.gas) {
          changed = true
          state.user.txOptions.gas = limits.gas
        }
        if (limits.gasPriceInGwei && limits.gasPriceInGwei != state.user.txOptions.gasPriceInGwei) {
          changed = true
          state.user.txOptions.gasPriceInGwei = limits.gasPriceInGwei
        }
        if (changed) {
          localStorage.setItem('user', JSON.stringify(state.user))
        }
      }
    },
    METAMASK_INSTALLED(state, value) {
      state.metamaskInstalled = value
    },
    SET_WORK_IN_PROGRESS(state, value) {
      state.workInProgress = value
    },
    UPDATE_USER_COOKIE(state) {
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    UPDATE_OPTIONS_COOKIE(state) {
      window.localStorage.setItem('options', JSON.stringify(state.options))
    },
    UPDATE_OPTIONS_VALUES(state, values) {
      // Deep merge using jquery
      state.options = $.extend(true, state.options, values)
    },
    SET_RISK_ASSESSMENTS(state, value) {
      state.riskAssessments = value
    },
    QUERY_RISK_ADDRESS(state, address) {
      let exists = state.riskAssessments.findIndex((one) => {
        if (one.address === address) return true
        return false
      })
      if (exists === -1) {
        state.riskAssessments.unshift({
          address,
          generationDate: '',
          report: {},
          status: ''
        })
      } else {
        state.riskAssessments.splice(0, 0, state.riskAssessments.splice(exists, 1)[0])
      }
    },
    UPDATE_RATING(state, data) {
      if (data.value == 0) {
        /*
        console.log(
          'UPDATE_RATING Vue.delete',
          data.symbol,
          data.value,
          'missing?',
          !state.ratings[data.symbol]
        )
        */
        Vue.delete(state.ratings, data.symbol)
      } else {
        /*
        console.log(
          'UPDATE_RATING Vue.set',
          data.symbol,
          data.value,
          'missing?',
          !state.ratings[data.symbol]
        )*/
        Vue.set(state.ratings, data.symbol, data.value)
      }
      localStorage.setItem('ratings', JSON.stringify(state.ratings))
    },
    ADDRESS_SUBMITTED(state, address) {
      state.riskAssessments.map((item, idx) => {
        if (item.address === address) {
          Vue.set(state.riskAssessments, idx, {
            address: address,
            generationDate: '',
            report: {},
            status: 'in progress'
          })
        }
      })
    },
    SET_GAS_OPTIONS(state, data) {
      state.gasOptions = data
    },
    UPDATE_STAKED_AMOUNT(state, amount) {
      state.currentAccount.cryptos.DEXTF.staked = amount
    },
    UPDATE_STAKING_EARNED_AMOUNT(state, amount) {
      state.currentAccount.cryptos.DEXTF.earned = amount
    },
    UPDATE_STAKING_APR(state, amount) {
      state.currentAccount.cryptos.DEXTF.apr = amount
    },
    UPDATE_ETH_PRICE(state, amount) {
      state.uniswap.ethPriceUSD = amount
    }
  },
  actions: {
    async register({ commit }, data) {
      console.time('store.register')
      // Use async/await to be sure the operation is completed before continuing
      await axios
        .post(this.state.APIs.signup, data)
        .then((result) => {
          // console.log('Sign Up request ID', result.data.requestId)
        })
        .finally(() => {
          console.timeEnd('store.register')
        })
    },
    async login({ commit }, credentials) {
      console.time('store.login')

      credentials.type = credentials.type || 'email'

      this.state.connectingFm = credentials.type === 'email'

      // Use async/await to be sure the operation is completed before continuing
      await axios
        .post(this.state.APIs.login, credentials)
        .then(({ data }) => {
          // console.log(data)
          data.type = credentials.type
          if (data.isFundManager === undefined) {
            // Fix the gcp login function to always returen a value
            data.isFundManager = false
          }
          // TODO: gas options should come from the DB
          data.txOptions = {
            from: this.state.currentAccount.address,
            gas: 2000000,
            gasPriceInGwei: 110
          }
          commit('SET_USER_DATA', data)
        })
        .finally(() => {
          this.state.connectingFm = false
          console.timeEnd('store.login')
        })
    },
    logout({ commit }, doApiCall = true) {
      console.log('store.logout')
      if (!this.state.user) {
        return Promise.resolve('Logout unnecessary')
      }

      const resultPromise = new Promise(async (resolve, reject) => {
        console.time('store.logout')
        let operationResult = 'successfully'

        if (doApiCall) {
          await axios
            .post(this.state.APIs.logout, { userId: this.state.user.userId })
            .catch((error) => {
              console.error(error)
              operationResult = 'with error'
            })
        }

        commit('CLEAR_DATA')
        this.clearUnlockedInterval()
        utilsMixin.log(`User logged out ${operationResult}`)
        console.timeEnd('store.logout')
        resolve(`User logged out ${operationResult}`)
      })

      return resultPromise
    },
    setNetworks({ commit }, networks) {
      commit('SET_NETWORKS', networks)
    },
    // setEnvironmentBlockchain({ commit }, environmentBlockchain) {
    //   commit('SET_ENVIRONMENT_BLOCKCHAIN', environmentBlockchain)
    // },
    connect({ dispatch, commit }, params) {
      console.log('store.connect', params)
      console.time('store.connect')

      const resultPromise = new Promise((resolve, reject) => {
        createHeliumConnector(params.wallet, params.wallet, params.deploymentName)
          .then((heliumConnector) => {
            // Clear listeners of the previous connector(s)
            this.removeChainChangedListeners()

            // Set new connector
            heliumConnector.id = Date.now()
            chainChangedEvents.connectorId = heliumConnector.id
            chainChangedEvents.provider = heliumConnector.provider.provider
            this.addChainChangedListener()

            commit('SET_CONNECTOR', heliumConnector)

            const network = this.state.networks.find(
              (n) => n.deploymentName === params.deploymentName
            )
            dispatch('setCurrentNetwork', network)
            dispatch('updateOptionsValues', { wallet: params.wallet })

            if (params.network === 'ethereum') {
              // Will be used for the Staking feature
              createGalliumConnector(params.wallet, params.wallet, params.deploymentName)
                .then((galliumConnector) => {
                  commit('SET_GALLIUMCONNECTOR', galliumConnector)
                })
                .catch((error) => {
                  console.log('Non-blocking error creating GalliumConnector', error)
                  commit('SET_GALLIUMCONNECTOR', null)
                })
            }

            heliumConnector.provider.getNetwork().then((network) => {
              const valid = network.chainId === this.state.currentNetwork.chainId
              if (this.state.networkValid !== valid) {
                this.state.networkValid = valid
              }

              chainChangedEvents.provider
                .request({
                  method: 'eth_accounts'
                })
                .then((accounts) => {
                  const address = accounts[0]

                  const credentials = {
                    userId: address,
                    type: 'address',
                    network: this.state.currentNetwork.chainId
                  }

                  if (params.network === 'avalanche') {
                    // Capital A for fund manager login
                    credentials.type = 'Address'
                  }

                  if (params.login === true) {
                    dispatch('login', credentials)
                      .then(() => {
                        commit('SET_CURRENT_ACCOUNT', address)
                        console.timeEnd('store.connect')
                        resolve(credentials)
                      })
                      .catch((error) => {
                        console.log('Error during login', error)
                        commit('SET_CURRENT_ACCOUNT', null)
                        console.timeEnd('store.connect')
                        reject(error)
                      })
                  } else {
                    commit('SET_CURRENT_ACCOUNT', address)
                    console.timeEnd('store.connect')
                    resolve(credentials)
                  }
                })
            })
          })
          .catch((error) => {
            console.log('Error creating HeliumConnector', error)
            commit('SET_CONNECTOR', null)
            commit('SET_GALLIUMCONNECTOR', null)
            console.timeEnd('store.connect')
            reject(error)
          })
      })

      return resultPromise
    },
    fetchGasOptions({ commit }) {
      console.time('store.fetchGasOptions')
      axios
        .get(this.state.APIs.getGasOptions)
        .then(({ data }) => {
          commit('SET_GAS_OPTIONS', data)
        })
        .finally(() => {
          console.timeEnd('store.fetchGasOptions')
        })
    },
    setCurrentNetwork({ dispatch, commit }, network) {
      const currentNetwork = this.state.networks.find((n) => n.chainId === network.chainId)
      commit('SET_CURRENT_NETWORK', currentNetwork)
      dispatch('updateOptionsValues', { network: currentNetwork })
    },
    setCurrentAccount({ dispatch, commit }, address) {
      commit('SET_CURRENT_ACCOUNT', address)
      dispatch('reloadCookies', { ratings: true })
      dispatch('updateEtherBalance')
      if (this.state.assets) {
        // Update the Asset balance
        this.state.assets.forEach((a) => {
          dispatch('updateAssetBalance', a.symbol)
        })
      }
      if (this.state.funds) {
        // Update the Fund balance
        this.state.funds.forEach((f) => {
          dispatch('updateFundBalance', f.symbol)
        })
      }
    },
    // setConnector({ commit }, connector) {
    //   commit('SET_CONNECTOR', connector)
    // },
    // setGalliumConnector({ commit }, connector) {
    //   commit('SET_GALLIUMCONNECTOR', connector)
    // },
    // setConnectorValid({ commit }, valid) {
    //   if (this.state.connectorValid !== valid) {
    //     commit('SET_CONNECTOR_VALID', valid)
    //     // This will assure account totals are updated
    //     this.dispatch('setCurrentAccount', this.state.currentAccount.address)
    //   }
    // },
    setCompanies({ commit }, companies) {
      commit('SET_COMPANIES', companies)
    },
    setMakerOrders({ commit }, makerOrders) {
      commit('SET_MAKER_ORDERS', makerOrders)
    },
    setAssets({ commit }, assets) {
      if (!assets || assets.length == 0) {
        commit('SET_ASSETS', [])
        return Promise.resolve(0)
      }

      return new Promise((resolve, reject) => {
        // Loop and add some extra fields
        const promises = []
        assets.forEach((a) => {
          // const a1 = a.contract
          // const a2 = Web3.utils.toChecksumAddress(a1.toLowerCase())
          // if (a1 != a2) {
          //   console.warn('Wrong checksum of', a.symbol, a2)
          //   a.contract = a2
          // }
          fundMixin.methods.extendAsset(this.state, a)
          promises.push(fetchAssetBalance(this.state, a, '1'))
        })
        Promise.all(promises)
          .then((values) => {
            // Initialize the swap cryptos
            Object.entries(this.state.currentAccount.cryptos).forEach(([key, value]) => {
              const crypto = assets.find((a) => {
                if (a.symbol === key) {
                  // Exact match
                  return true
                } else if (
                  this.state.currentNetwork.network === 'avalanche' &&
                  a.symbol === `${key}.e`
                ) {
                  // Avalanche: match the .e version of the token
                  return true
                }
                return false
              })
              if (crypto) {
                value.address = crypto.contract
                value.balance = crypto.balance.wallet
              } else {
                console.warn(`Cannot find asset for swap crypto ${key} - drop it`)
                delete this.state.currentAccount.cryptos[key]
              }
            })
            commit('SET_ASSETS', assets)
            resolve(values.length)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    addFund({ commit }, fund) {
      if (!fund) {
        return Promise.resolve(0)
      }

      const existingFund = this.getters.getFundBySymbol(fund.symbol)
      if (existingFund) {
        console.warn('Fund', fund.symbol, 'already exists')
        return Promise.resolve(0)
      }

      return new Promise((resolve, reject) => {
        // Re-eval some db fields
        fund.isTop = this.getters.isTopFund(fund.symbol)
        fund.color = fund.color || this.state.defaultFundColor
        // Add some extra fields/info
        fundMixin.methods.extendFund(this.state, fund)
        Promise.all([fetchFundTotalSupply(this.state, fund), fetchFundBalance(this.state, fund)])
          .then(() => {
            commit('ADD_FUND', fund)
            resolve(1)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    replaceFund({ commit }, fund) {
      if (!fund) {
        return Promise.resolve(0)
      }

      const existingFund = this.getters.getFundBySymbol(fund.symbol)
      if (!existingFund) {
        console.warn('Fund', fund.symbol, 'does not exist')
        return Promise.resolve(0)
      }

      return new Promise((resolve, reject) => {
        // Re-eval some db fields
        fund.isTop = this.getters.isTopFund(fund.symbol)
        fund.color = fund.color || this.state.defaultFundColor
        // Add some extra fields/info
        fundMixin.methods.extendFund(this.state, fund)
        Promise.all([fetchFundTotalSupply(this.state, fund), fetchFundBalance(this.state, fund)])
          .then(() => {
            commit('REPLACE_FUND', fund)
            resolve(1)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    setFunds({ commit }, funds) {
      if (!funds || funds.length == 0) {
        commit('SET_FUNDS', [])
        return Promise.resolve(0)
      }

      console.time('store.setFunds')

      // Sorting
      funds.sort((a, b) => {
        // Uniswap funds go first
        let aPrio = !a.uniswap
        let bPrio = !b.uniswap
        // Our funds XTF2000xxx go first
        if (aPrio < bPrio) return -1
        if (aPrio > bPrio) return 1
        aPrio = a.symbol.startsWith('XTF2000')
        bPrio = b.symbol.startsWith('XTF2000')
        if (aPrio < bPrio) return 1
        if (aPrio > bPrio) return -1
        if (a.symbol < b.symbol) return -1
        if (a.symbol > b.symbol) return 1
        return 0
      })

      return new Promise((resolve, reject) => {
        const promises = []
        const createdFunds = []
        funds.forEach((f) => {
          // Re-eval some db fields
          f.isTop = this.getters.isTopFund(f.symbol)
          f.color = f.color || this.state.defaultFundColor

          // Temporary, for those funds using a String array instead of a Object array  - TO REMOVE IN FUTURE
          if (f.modules && f.modules.length >= 0 && !f.modules[0].name) {
            // Convert String array to Object array
            const objectArray = []
            f.modules.forEach((item) => {
              objectArray.push({ name: item, settings: {} })
            })
            f.modules = objectArray
            console.warn(f.symbol, ' modules: converted to Object array')
          }

          // To assure DB setting is correct - TO REMOVE IN FUTURE
          if (!f.modules) {
            f.modules = []
            console.warn(f.symbol, 'has no DB module')
          } else if (!f.modules.find((item) => item.name == Module.IssuanceModule)) {
            // Mandatory module
            f.modules.push({ name: Module.IssuanceModule, settings: {} })
            console.warn(f.symbol, 'has no', Module.IssuanceModule, 'DB module')
          }

          if (f.address) {
            // Whatever come from the db refers to the initialization,
            // while the latest allocation needs to be fetched from the blockchain
            // delete f.assets

            // For every fund, get the pending and initialised modules
            const fundApi = getFundApiByContract(this.state, f.address)
            const fundData = Promise.all([
              fundApi.getPendingModules(),
              fundApi.getModules()
              // fundApi.getRequiredAllowanceForIssue(new BigNumber(1))
            ])
            promises.push(fundData)
          }
        })

        Promise.all(promises)
          .then((values) => {
            let i = 0
            const fundsToAdd = []

            // Extend all the funds with extra fields
            funds.forEach((fund) => {
              if (fund.address) {
                const results = values[i++]
                fund.pendingModules = results[0]
                fund.initializedModules = results[1]
                // fund.assets = results[2]
              } else {
                fund.pendingModules = []
                fund.initializedModules = []
              }

              // Sort the assets
              fund.assets.sort((a, b) => {
                if (a.symbol > b.symbol) return 1
                if (a.symbol < b.symbol) return -1
                return 0
              })

              const initialized = fund.initializedModules.includes(Module.IssuanceModule)
              if (
                !initialized &&
                (!this.state.user.isFundManager || fund.fundManagerEmail !== this.state.user.userId)
              ) {
                // Discard uninitialized fund that does not belong to the user
                // console.warn(fund.symbol, 'discarded because not initialized yet')
              } else {
                fundMixin.methods.extendFund(this.state, fund)
                fundsToAdd.push(fund)
              }
            })

            commit('SET_FUNDS', fundsToAdd)

            resolve(fundsToAdd.length)
          })
          .catch((error) => {
            reject(error)
          })
          .finally(() => {
            console.timeEnd('store.setFunds')
          })
      })
    },
    setTopFunds({ commit }, topFundSymbols) {
      commit('SET_TOP_FUNDS', topFundSymbols)
    },
    reloadCookies({ commit }, whatToLoad = { ratings: true, options: true }) {
      commit('LOAD_COOKIES', whatToLoad)
    },
    updateAllFundsModules({ dispatch, commit }) {
      // console.log('updateAllFundsModules')
      const promises = []
      this.state.funds.forEach((fund) => {
        promises.push(dispatch('updateFundModules', fund.symbol))
      })
      return Promise.all(promises)
    },
    updateFundModules({ dispatch, commit }, symbol) {
      // console.log('updateFundModules', symbol)
      const fund = this.getters.getFundBySymbol(symbol)
      if (!fund || !fund.address) {
        return Promise.resolve(`Nothing to do, fund ${symbol} does not exist)`)
      }

      const resultPromise = new Promise((resolve, reject) => {
        // Get the pending and initialised modules
        const fundApi = getFundApiByContract(this.state, fund.address)
        Promise.all([fundApi.getPendingModules(), fundApi.getModules()])
          .then((modules) => {
            const pendingModules = modules[0] || []
            const initializedModules = modules[1] || []

            // Modules with settings to fetch
            const promises = initializedModules.map((m) => {
              switch (m) {
                case Module.StreamingFeeModule:
                  return dispatch('fetchStreamingFeeModuleSettings', symbol)
                  break
                default:
                  return 'not a promise'
              }
            })

            Promise.all(promises)
              .then(() => {
                commit('UPDATE_FUND_MODULES', {
                  fund,
                  pendingModules,
                  initializedModules
                })

                resolve('success')
              })
              .catch((err) => {
                console.error('x1', err)
              })
          })
          .catch((error) => {
            console.log('x2', error)
            reject(error)
          })
      })

      return resultPromise
    },
    fetchStreamingFeeModuleSettings({ commit }, symbol) {
      if (!this.state.connector) {
        return Promise.resolve('no connector')
      }

      const fund = this.getters.getFundBySymbol(symbol)
      if (!fund) {
        return Promise.resolve(`no fund`)
      }

      const feeModule = fund.modules.find((m) => m.name === Module.StreamingFeeModule)
      if (feeModule) {
        const resultPromise = new Promise((resolve, reject) => {
          Promise.all([
            this.state.connector.streamingFeeApi.getFeeStates(fund.address),
            this.state.connector.streamingFeeApi.getFee(fund.address)
          ])
            .then((results) => {
              const result1 = results[0]
              const result2 = results[1]

              const lastStreamingFeeTimestamp = result1.data.lastStreamingFeeTimestamp.times(1000)

              commit('UPDATE_FUND_FEE_MODULE_SETTINGS', {
                symbol,
                feeModule,
                streamingFeePercentage: result1.data.feePercentage.times(100),
                maxStreamingFeePercentage: result1.data.maxFeePercentage
                  .times(100)
                  .integerValue(BigNumber.ROUND_DOWN),
                lastStreamingFeeTimestamp: lastStreamingFeeTimestamp,
                earnedFees: result2.data.fee
              })

              resolve('success')
            })
            .catch((error) => {
              reject(error)
            })
        })

        return resultPromise
      } else {
        return Promise.resolve(`no ${Module.StreamingFeeModule} module`)
      }
    },
    updateAllRebalanceInfo({ dispatch, commit }) {
      // console.log('updateAllRebalanceInfo')

      if (!this.state.connector) {
        return Promise.resolve('no connector')
      }

      const promises = []
      this.state.funds.forEach((fund) => {
        promises.push(dispatch('updateRebalanceInfo', fund.symbol))
      })
      return Promise.all(promises)
    },
    updateRebalanceInfo({ commit }, symbol) {
      // console.log('updateRebalanceInfo', symbol)
      if (!this.state.connector) {
        return Promise.resolve('no connector')
      }

      const fund = this.getters.getFundBySymbol(symbol)
      if (!fund || !fund.address || fund.canRebalance === false) {
        return Promise.resolve('success')
      }

      const resultPromise = new Promise((resolve, reject) => {
        let info = {
          state: '',
          tradingTimestamp: undefined,
          minimumDelay: 0,
          proposalTimestamp: 0,
          proposalEndTimestamp: 0,
          tradedFundTokens: new BigNumber(0.0),
          maxTradedFundTokens: new BigNumber(0.0),
          in: { assets: [] },
          out: { assets: [] },
          slippage: new BigNumber(0.0)
        }
        const dextfTradeApi = this.state.connector.dextfTradeApi
        const promises = [
          dextfTradeApi.getFundState(fund.address),
          dextfTradeApi.getProposalDetails(fund.address)
        ]

        Promise.all(promises)
          .then((results) => {
            const stateResult = results[0]
            const detailsResult = results[1]
            if (stateResult.errors.length == 0) {
              info.state = FundState[stateResult.data.fundState]
              info.tradingTimestamp =
                info.state == 'Trading' &&
                fund.rebalanceState &&
                fund.rebalanceState.state == FundState['Trading']
                  ? fund.rebalanceState.updateTimestamp
                  : undefined
              info.rationale =
                info.state !== 'Regular' &&
                fund.rebalanceState &&
                fund.rebalanceState.state !== FundState['Regular']
                  ? fund.rebalanceState.note
                  : undefined
            } else {
              console.error('updateRebalanceInfo - stateResult', stateResult.errors)
            }
            if (info.state !== 'Regular' && detailsResult.errors.length == 0) {
              info.minimumDelay = detailsResult.data.proposalConstraints.minimumDelay
              info.proposalTimestamp = detailsResult.data.proposalTimestamp
              info.proposalEndTimestamp = info.proposalTimestamp + info.minimumDelay
              info.tradedFundTokens = detailsResult.data.tradedFundTokens
              info.maxTradedFundTokens = detailsResult.data.maxTradedFundTokens
            } else if (detailsResult.errors.length > 0) {
              console.error(
                'updateRebalanceInfo - detailsResult',
                fund.symbol,
                detailsResult.errors
              )
            }
          })
          .catch((error) => {
            console.error(error)
            info.state = 'Error'
          })
          .finally(async () => {
            if (info.state !== 'Regular') {
              const inOutQuantitiesResult = await dextfTradeApi.computeInboundOutboundComponents(
                fund.address,
                new BigNumber(1)
              )

              if (inOutQuantitiesResult.errors.length == 0) {
                inOutQuantitiesResult.data.inboundComponents.forEach((c) => {
                  const assetDef = this.getters.getAssetByContract(c.componentAddress)
                  info.in.assets.push({
                    symbol: assetDef.symbol,
                    unitQuantity: c.position,
                    price: assetDef.price
                  })
                })
                inOutQuantitiesResult.data.outboundComponents.forEach((c) => {
                  const assetDef = this.getters.getAssetByContract(c.componentAddress)
                  info.out.assets.push({
                    symbol: assetDef.symbol,
                    unitQuantity: c.position,
                    price: assetDef.price
                  })
                })

                let totalPrice = fundMixin.methods.calculateAllocationTotal(info.in.assets)
                // console.log('Total IN', fund.symbol, totalPrice.toString())
                info.in.totalPrice = totalPrice
                totalPrice = fundMixin.methods.calculateAllocationTotal(info.out.assets)
                // console.log('Total OUT', fund.symbol, totalPrice.toString())
                info.out.totalPrice = totalPrice
              } else {
                console.error(
                  'updateRebalanceInfo - inOutQuantitiesResult',
                  inOutQuantitiesResult.errors
                )
              }

              if (info.state == 'Trading' && info.tradedFundTokens.gt(0)) {
                await this.dispatch('updateFundCurrentAllocation', symbol)
              }

              if (info.state !== 'Regular') {
                /*
                  console.log(
                    fund.symbol,
                    info.in.totalPrice.toString(),
                    info.out.totalPrice.toString()
                  )
                  */
                const slippage = info.in.totalPrice
                  .minus(info.out.totalPrice)
                  .div(fund.currentPrice())
                  .times(100)

                // console.log('Slippage', fund.symbol, slippage.toNumber())

                info.slippage = slippage
              }
            }

            commit('UPDATE_REBALANCE_STATE', {
              fund,
              info
            })

            resolve('success')
          })
      })

      return resultPromise
    },
    updateAllFundsBalances({ dispatch, commit }) {
      // console.log('updateAllFundsBalances')
      const promises = []
      this.state.funds.forEach((fund) => {
        promises.push(dispatch('updateFundBalance', fund.symbol))
      })
      return Promise.all(promises)
    },
    updateFundState({ commit }, { symbol, refreshing }) {
      const fund = this.getters.getFundBySymbol(symbol)
      if (fund) {
        commit('UPDATE_FUND_STATE', {
          fund,
          refreshing
        })
      }
    },
    updateFundBalance({ commit }, symbol) {
      // console.log('updateFundBalance', symbol)
      const fund = this.getters.getFundBySymbol(symbol)
      if (!fund || !fund.address) {
        return Promise.resolve(`Nothing to do, fund ${symbol} does not exist / not launched)`)
      }

      const tmpFund = {
        symbol: fund.symbol,
        address: fund.address,
        balance: new BigNumber(0.0),
        totalNoOfTokens: new BigNumber(0.0),
        currentPrice: new BigNumber(0.0)
      }

      const resultPromise = new Promise((resolve, reject) => {
        Promise.all([
          fetchFundTotalSupply(this.state, tmpFund),
          fetchFundBalance(this.state, tmpFund)
        ]).then(() => {
          commit('UPDATE_FUND_BALANCE', {
            fund,
            balance: tmpFund.balance,
            totalNoOfTokens: tmpFund.totalNoOfTokens
          })

          resolve('success')
        })
      })

      return resultPromise
    },
    updateAllFundsCurrentAllocations({ dispatch, commit }) {
      // console.log('updateAllFundsCurrentAllocations')
      const promises = []
      this.state.funds.forEach((fund) => {
        promises.push(dispatch('updateFundCurrentAllocation', fund.symbol))
      })
      return Promise.all(promises)
    },
    updateFundCurrentAllocation({ commit }, symbol) {
      // console.log('updateFundCurrentAllocation', symbol)
      const fund = this.getters.getFundBySymbol(symbol)
      if (!fund) {
        // console.log(`success (fund ${symbol} does not exist)`)
        return Promise.resolve(`success (fund ${symbol} does not exist)`)
      } else if (!fund.address) {
        // console.log(`success (fund ${symbol} does not exist in the blockchain)`)
        return Promise.resolve(`success (fund ${symbol} does not exist in the blockchain)`)
      } else if (!fund.initialized) {
        // console.log(`success (fund ${symbol} has not been initialized)`)
        return Promise.resolve(`success (fund ${symbol} has not been initialized)`)
      }

      const resultPromise = new Promise((resolve, reject) => {
        // The blockchain has the latest unit quantities,
        // and we update the current allocation accordingly.
        const fundApi = getFundApiByContract(this.state, fund.address)
        fundApi
          .getRequiredAllowanceForIssue(new BigNumber(1))
          .then((currentUnitQuantitiesResult) => {
            if (currentUnitQuantitiesResult.errors.length == 0) {
              const currentAssetAllocations = []
              const data = currentUnitQuantitiesResult.data

              data.components.forEach((c, i) => {
                const assetDef = this.getters.getAssetByContract(c)
                if (assetDef) {
                  currentAssetAllocations.push({
                    percentage: 0, // updated dynamically
                    price: assetDef.price,
                    symbol: assetDef.symbol,
                    unitQuantity: new BigNumber(data.tokens[i])
                  })
                } else {
                  console.error('Unknown asset with contract', c)
                }
              })

              fund.allocation.current.assets = currentAssetAllocations

              // const totalPrice0 = fund.currentPrice()
              const totalPrice = fundMixin.methods.calculateAllocationTotal(
                fund.allocation.current.assets,
                'updateFundCurrentAllocation'
              )

              fund.allocation.current.totalPrice = totalPrice

              fundMixin.methods.updateAllocationPercentages(currentAssetAllocations, totalPrice)
            } else {
              console.error(
                'updateFundCurrentAllocation - currentUnitQuantitiesResult',
                fund.symbol,
                currentUnitQuantitiesResult.errors
              )
            }

            resolve('success')
          })
      })

      return resultPromise
    },
    updateAssetBalance({ commit }, symbol) {
      const asset = this.getters.getAssetBySymbol(symbol)
      if (asset && asset.contract) {
        const tmpAsset = {
          symbol: asset.symbol,
          contract: asset.contract,
          balance: {
            wallet: new BigNumber(0.0)
          }
        }
        fetchAssetBalance(this.state, tmpAsset, '2').then(() => {
          commit('UPDATE_ASSET_BALANCE', { asset, balance: tmpAsset.balance })
          // Update the balance of the swap cryptos
          Object.entries(this.state.currentAccount.cryptos).forEach(([key, value]) => {
            if (asset.symbol == key) {
              value.balance = asset.balance.wallet
            }
          })
        })
      }
    },
    async fetchCurrentAssetPrices({ commit }, options) {
      if (!options) {
        options = { fetchFullData: false }
      }

      const caller = options.caller || ''
      // console.log('caller', caller)

      let assetPrices = {}
      if (options.symbols) {
        options.symbols.forEach((symbol) => {
          const asset = this.getters.getAssetBySymbol(symbol)
          if (asset) {
            if (asset.isFund) {
              // Asset (fund)
              // console.log('Asset (fund)', asset.symbol)
              const fund = this.getters.getFundBySymbol(asset.symbol)
              if (fund) {
                asset.price = fund.currentPrice()
              } else {
                if (process.env.NODE_ENV !== 'production')
                  console.warn('Cannot find asset (fund)', asset.symbol)
              }
            } else {
              // Asset (crypto)
              if (
                asset.category != 'Yield' &&
                asset.category != 'Option' &&
                asset.category != 'Fund'
              ) {
                // console.log('Asset (crypto)', asset.symbol)
                if (!assetPrices[asset.priceSymbol]) {
                  assetPrices[asset.priceSymbol] = [asset]
                } else {
                  assetPrices[asset.priceSymbol].push(asset)
                }
              }
            }
          } else {
            console.warn('Cannot find asset', symbol)
          }
        })
      } else {
        this.state.assets.forEach((asset) => {
          // console.log(asset.symbol, asset.category)
          if (asset.isFund) {
            // Asset (fund)
            // console.log('Asset (fund)', asset.symbol)
            const fund = this.getters.getFundBySymbol(asset.symbol)
            if (fund) {
              asset.price = fund.currentPrice()
            } else {
              if (process.env.NODE_ENV !== 'production')
                console.warn('Cannot find asset (fund)', asset.symbol)
            }
          } else {
            // Asset (crypto)
            if (
              asset.category != 'Yield' &&
              asset.category != 'Option' &&
              asset.category != 'Fund'
            ) {
              // console.log('Asset (crypto)', asset.symbol)
              if (!assetPrices[asset.priceSymbol]) {
                assetPrices[asset.priceSymbol] = [asset]
              } else {
                assetPrices[asset.priceSymbol].push(asset)
              }
            }
          }
        })
      }

      let assetKeys = Object.keys(assetPrices)

      if (assetKeys.length > 0) {
        const to = 'USD'
        if (options.fetchFullData) {
          const apiData = await fetchCurrentFullData(assetKeys, to)

          Object.values(assetPrices).forEach((assetsForSymbol) => {
            assetsForSymbol.forEach((a) => {
              const assetApiData = apiData[a.priceSymbol]
              if (assetApiData) {
                const data = assetApiData[to]
                // Create BigNumbers with max 15 significant digits
                let newPrice
                if (data.PRICE) {
                  newPrice = new BigNumber(data.PRICE.toPrecision(15))
                } else {
                  console.warn(`CryptoCompare: failed to fetct PRICE of ${a.priceSymbol}`)
                  newPrice = new BigNumber(0)
                }

                let newChange24HourPct
                if (data.CHANGEPCT24HOUR) {
                  newChange24HourPct = new BigNumber(data.CHANGEPCT24HOUR.toPrecision(15))
                } else {
                  console.warn(`CryptoCompare: failed to fetct CHANGEPCT24HOUR of ${a.priceSymbol}`)
                  newChange24HourPct = new BigNumber(0)
                }
                // Change only if required (avoid unnecessary reactivity)
                if (!a.price.eq(newPrice)) a.price = newPrice
                if (!a.change24HourPct.eq(newChange24HourPct))
                  a.change24HourPct = newChange24HourPct
              } else {
                a.price = new BigNumber(0.0)
                a.change24HourPct = new BigNumber(0.0)
              }
            })
          })
        } else {
          const apiData = await fetchCurrentPrices(assetKeys, to)

          Object.values(assetPrices).forEach((assetsForSymbol) => {
            assetsForSymbol.forEach((a) => {
              const assetApiData = apiData[a.priceSymbol]
              if (assetApiData) {
                // Create BigNumber with max 15 significant digits
                const newPrice = new BigNumber(assetApiData[to].toPrecision(15))
                // Change only if required (avoid unnecessary reactivity)
                if (!a.price.eq(newPrice)) a.price = newPrice
              } else {
                a.price = new BigNumber(0.0)
              }
            })
          })
        }

        // Update the prices of the swap cryptos
        Object.entries(this.state.currentAccount.cryptos).forEach(([key, value]) => {
          const asset = assetPrices[value.priceSymbol][0]
          if (asset) {
            value.priceUSD = asset.price
          } else {
            console.warn('Cannot set price of swap crypto', key)
          }
        })
      }
    },
    async fetchEthPrice({ commit }) {
      const ethPriceUSD = new BigNumber(await fetchETHPrice())
      commit('UPDATE_ETH_PRICE', ethPriceUSD)
    },
    async fetchFundUniswapPrices({ dispatch, commit }) {
      this.state.funds.forEach(async function(fund) {
        if (fund.uniswap !== undefined) {
          dispatch('fetchFundUniswapPrice', fund.symbol)
        }
      })
    },
    async fetchFundUniswapPrice({ commit }, symbol) {
      const fund = this.getters.getFundBySymbol(symbol)
      if (fund && fund.uniswap !== undefined) {
        const derivedETH = new BigNumber(await fetchUniswapPrice(fund.address))

        fund.currentUniswapPrice = derivedETH.times(this.state.uniswap.ethPriceUSD)
      }
    },
    updateEtherBalance({ commit }) {
      if (!this.state.currentAccount.cryptos.ETH) return
      const data = {
        address: this.state.currentAccount.address,
        balance: new BigNumber(0.0)
      }
      fetchEtherBalance(this.state, data).then(() => {
        commit('UPDATE_ETHER_BALANCE', { balance: data.balance })
      })
    },
    updateDefaultGasLimits({ commit }, limits) {
      // TODO: save to the DB
      commit('UPDATE_DEFAULT_GAS_LIMITS', limits)
    },
    setWorkInProgress({ commit }, value) {
      commit('SET_WORK_IN_PROGRESS', value)
    },
    updatePrimaryColor({ commit }, rgbString) {
      let rgbValues = rgbString.substring(4)
      rgbValues = rgbValues.substring(0, rgbValues.length - 1)
      commit('UPDATE_PRIMARY_COLOR', rgbValues)
    },
    updateUserCookie({ commit }) {
      commit('UPDATE_USER_COOKIE')
    },
    updateOptionsValues({ commit }, value) {
      commit('UPDATE_OPTIONS_VALUES', value)
      commit('UPDATE_OPTIONS_COOKIE')
    },
    updateRating({ commit }, data) {
      commit('UPDATE_RATING', data)
    },
    getAllRiskAssessments({ commit, state }, userId) {
      return new Promise((resolve, reject) => {
        axios
          .get(state.APIs.getAllRiskAssessments, {
            params: {
              userId: userId,
              networkId: this.state.currentNetwork.chainId
            }
          })
          .then((res) => {
            commit('SET_RISK_ASSESSMENTS', res.data.body)
            resolve('success')
          })
          .catch((err) => {
            console.error('getAllRiskAssessments failed!', err)
            reject('failed')
          })
      })
    },
    queryRiskAddress({ commit }, address) {
      commit('QUERY_RISK_ADDRESS', address)
    },
    submitRiskAssessment({ commit, state }, payload) {
      return new Promise((resolve, reject) => {
        axios
          .post(state.APIs.submitRiskAssessment, {
            userId: payload.userId,
            address: payload.address,
            networkId: this.state.currentNetwork.chainId
          })
          .then((res) => {
            // console.log(res)
            if (res.data.body.status === 'busy') {
              reject('busy')
            } else if (res.data.body.status === 'submitted') {
              resolve('success')
              commit('ADDRESS_SUBMITTED', payload.address)
            }
          })
          .catch((err) => {
            console.error('submitRiskAssessment failed!', err)
            reject('failed')
          })
      })
    },
    setCookieConsent() {
      localStorage.setItem('cookieConsent', true)
    },
    updateStakedAmount({ commit }, amount) {
      commit('UPDATE_STAKED_AMOUNT', amount)
    },
    updateStakingEarnedAmount({ commit }, amount) {
      commit('UPDATE_STAKING_EARNED_AMOUNT', amount)
    },
    updateStakingApr({ commit }, amount) {
      commit('UPDATE_STAKING_APR', amount)
    }
  },
  getters: {
    loggedIn(state) {
      const loggedIn = !!state.user && !!state.user.token
      /*
      if (loggedIn) {
        const userString = localStorage.getItem('user')
        let hasCookie = !!userString

        if (hasCookie) {
          const userData = JSON.parse(userString)
          // Check if token is expired
          const expirationTimestamp = userData.expirationTimestamp || ''
          const nowTimestamp = new Date().toISOString()
          const expired = expirationTimestamp < nowTimestamp
          console.log(expirationTimestamp, nowTimestamp, 'expired ?', expired)
          if (expired) {
            loggedIn = false
          }
        }
      }
      */
      return loggedIn
    },
    connector(state) {
      return state.connector
    },
    provider(state) {
      return state.connector ? state.connector.provider.provider : undefined
    },
    connectorId(state) {
      return state.connector ? state.connector.id : -1
    },
    galliumConnector(state) {
      return state.galliumConnector
    },
    getFundBySymbol: (state) => (symbol) => {
      return state.funds.find((f) => f.symbol === symbol)
    },
    getFundApiByContract: (state) => (contract) => {
      return getFundApiByContract(state, contract)
    },
    getFundModule: (state, getters) => (symbol, moduleName) => {
      const fund = getters.getFundBySymbol(symbol)
      return fund ? fund.modules.find((m) => m.name === moduleName) : undefined
    },
    getAssetBySymbol: (state) => (symbol) => {
      return state.assets.find((a) => a.symbol === symbol)
    },
    getAssetByContract: (state) => (contract) => {
      return state.assetsByContract.get(contract)
    },
    getAssetApiByContract: (state) => (contract) => {
      return getAssetApiByContract(state, contract)
    },
    getCompanyById: (state) => (id) => {
      return state.companies.find((c) => c.id === id)
    },
    getMakerOrdersByFundSymbol: (state) => (symbol, takerPositionIsBuyFund = true) => {
      const orders = state.makerOrders.filter(
        (o) => o.fund === symbol && o.takerPositionIsBuyFund == takerPositionIsBuyFund
      )
      orders.sort((a, b) => {
        if (a.cashToken.symbol < b.cashToken.symbol) return -1
        if (a.cashToken.symbol > b.cashToken.symbol) return 1
        if (a.fundPriceInCashTokens < b.fundPriceInCashTokens) return -1
        if (a.fundPriceInCashTokens > b.fundPriceInCashTokens) return 1
        return 0
      })
      return orders
    },
    walletAddress(state) {
      const w = state.currentAccount.address
      if (w && typeof w === 'string') {
        return w
      }
      return ''
    },
    walletAddressMasked(state) {
      const w = state.currentAccount.address
      if (w && typeof w === 'string') {
        return w.substring(0, 6) + '...' + w.substring(w.length - 4)
      }
      return ''
    },
    riskAssessments(state) {
      return state.riskAssessments
    },
    /*
    getTxOptions: (state) => async (noOfAssets, action = 'other') => {
      let estimations
      if (state.environment == 'prod') {
        estimations = await gasEstimationMixin.methods.fetchEstimations()
      } else {
        // for Ropsten we do not need real gas prices
        estimations = {
          safeLow: {
            priceInGwei: 20
          },
          average: {
            priceInGwei: 20
          },
          fast: {
            priceInGwei: 20
          },
          fastest: {
            priceInGwei: 20
          }
        }
      }

      let limits = state.gasOptions.limits[action]
      if (limits === undefined) {
        console.warn('Invalid action', action)
        limits = state.gasOptions.limits['other']
      }

      let gas = limits.find((i) => i.noOfAssets === noOfAssets)
      if (gas === undefined) {
        console.warn('Invalid noOfAssets', noOfAssets)
        gas = limits[limits.length - 1]
      }

      // console.log(
      //   action,
      //   gas.value,
      //   state.gasOptions.speed,
      //   estimations[state.gasOptions.speed].priceInGwei
      // )

      return {s
        from: state.user.txOptions.from,
        gas: gas.value,
        gasPriceInGwei: estimations[state.gasOptions.speed].priceInGwei
      }
    },
    */
    cookieConsent() {
      return !!localStorage.getItem('cookieConsent')
    },
    isTopFund: (state) => (symbol) => {
      return state.topFundSymbols.includes(symbol)
    },
    walletTokenList: (state) => {
      return state.assets
        .filter((asset) => asset.balance.wallet.gt(0))
        .map((asset) => asset.symbol.toLowerCase())
    },
    /**
     * Generate the fund symbol prefix based on the format rules defined for the given network.
     * @param {object} currentNetwork - The network
     * @param {string} parts - The parts required to generate the prefix
     * @returns the fund symbol prefix
     */
    fundSymbolPrefix: (state) => {
      let p = '??????'
      if (state.currentNetwork.network === 'ethereum' && state.user && state.user.company) {
        p = state.currentNetwork.fundPrefix + state.user.company
      } else if (state.currentNetwork.network === 'avalanche') {
        p = state.currentNetwork.fundPrefix
      } else {
        console.warn('Cannot calculate fund prefix (unknown network)')
      }
      return p
    },
    /**
     * Validate the fund symbol based on the format rules defined for the given network.

     * @param {string} fundSymbol - The fund symbol
     * @returns an error string describing the validation failure, or undefined is the fund symbol is valid
     */
    validateFundSymbol: (state, getters) => (fundSymbol) => {
      if (!state.currentNetwork || !state.networkValid) {
        return 'Cannot validate fund symbol (unavailable network)'
      }

      if (!fundSymbol) {
        return 'Invalid symbol (empty)'
      }

      // Check length
      let minLength = state.currentNetwork.fundPrefix.length + 3
      if (fundSymbol.length > FUND_SYMBOL_MAX_LENGH) {
        return `Invalid symbol (more than ${FUND_SYMBOL_MAX_LENGH} characters)`
      } else if (fundSymbol.length < minLength) {
        return `Invalid symbol (minimum ${state.currentNetwork.fundPrefix.length +
          3} characters, including the ${state.currentNetwork.fundPrefix} prefix)`
      }

      // Check prefix
      if (!fundSymbol.startsWith(getters.fundSymbolPrefix)) {
        return `Invalid symbol (does not start with ${getters.fundSymbolPrefix})`
      }

      // check network format rules
      if (state.currentNetwork.network === 'ethereum') {
        // Other rules for Ethereum here
      } else if (state.currentNetwork.network === 'avalanche') {
        // Other rules for Avalanche here
      } else {
        return 'Cannot validate fund symbol (unknown network)'
      }

      const format = new RegExp(`^[0-9A-Z]{${minLength},${FUND_SYMBOL_MAX_LENGH}}$`)
      if (!format.test(fundSymbol)) {
        return 'Invalid symbol (can contain only letters and numbers)'
      }
      return undefined
    }
  }
})

//
// Add helper methods (note: refer to the store with store. rather than this.)
//

store.chainChanged = function(chainId) {
  const newChainId = parseInt(chainId, 16)
  const valid = newChainId === store.state.currentNetwork.chainId
  if (store.state.networkValid !== valid) {
    console.log((valid ? 'validate' : 'invalidate') + ' the newtwork')
    store.state.networkValid = valid
  }
}

store.addChainChangedListener = function() {
  // console.log('add listener for', chainChangedEvents.connectorId)

  // Handle chain (network) and chainChanged (per EIP-1193)
  chainChangedEvents.provider.addListener('chainChanged', store.chainChanged)
  chainChangedEvents.listeners.set(chainChangedEvents.connectorId, store.chainChanged)

  // At the moment MetaMask does not trigger any event when the plugin is unlocked,
  // therefore I have to poll every 500ms and check if there is a connected account
  this.startUnlockedInterval()
}

store.removeChainChangedListeners = function() {
  chainChangedEvents.listeners.forEach((value, key) => {
    // console.log(`remove listener for`, key)
    chainChangedEvents.provider.removeListener('chainChanged', value)
    chainChangedEvents.listeners.delete(key)
  })
  this.clearUnlockedInterval()
}

store.startUnlockedInterval = function() {
  chainChangedEvents.intervalId = setInterval(store.checkConnectedAccount, 500)
  // console.log('interval started', chainChangedEvents.intervalId)
}

store.clearUnlockedInterval = function() {
  if (chainChangedEvents.intervalId) {
    clearInterval(chainChangedEvents.intervalId)
    // console.log('interval stopped', chainChangedEvents.intervalId)
    chainChangedEvents.intervalId = undefined
  }
}

store.checkConnectedAccount = function() {
  chainChangedEvents.provider.request({ method: 'eth_accounts' }).then(store.accountsChanged)
}

store.accountsChanged = function(accounts) {
  let newAddress
  if (accounts.length === 0) {
    // MetaMask is locked or the user has not connected any accounts
    newAddress = null
  } else {
    newAddress = accounts[0]
  }

  if (!caseInsensitiveEquality(newAddress, store.state.currentAccount.address)) {
    store.dispatch('setCurrentAccount', newAddress)
  }
}

export default store
