import stringify from 'json-stringify-safe'

import { fundSymbolPrefix, validateFundSymbol } from '../modules/format.js'

import Vue from 'vue'
import BigNumber from 'bignumber.js'
import { FundState, Module } from '@helium'

var fundMixin = {
  methods: {
    /**
     * Create an object representing a Fund, with the exact same structure as in the database and 2 additional fields:
     *  - company
     *  - fundManagerEmail
     * Optionally the caller can request the extended fields.
     */
    createNewFund(state, extend) {
      const newFund = {
        address: '',
        allocation: {
          inception: { date: '', assets: [] }
          // latest: { date: '', assets: [] }
        },
        pendingModules: [],
        initializedModules: [],
        modules: [],
        rebalance: {
          state: 'Regular',
          minimumDelay: 0,
          proposalTimestamp: 0,
          proposalEndTimestamp: 0,
          tradedFundTokens: new BigNumber(0.0),
          maxTradedFundTokens: new BigNumber(0.0),
          in: { assets: [] },
          out: { assets: [] },
          slippage: new BigNumber(0.0),
          rationale: ''
        },
        initialized: false,
        assets: [],
        image: '',
        canInvest: false,
        canModify: true,
        canRebalance: false,
        canRedeem: false,
        description: '',
        fundManager: '',
        // isActive: true, // not used
        visibleToInvestors: true,
        launchDate: '',
        name: '',
        // noOfTransactions: 0, // not used
        symbol: '',
        risk: 1,
        targetPrice: 100.0,
        transaction: '',
        // Additional
        company: '',
        fundManagerEmail: '',
        uniswap: '',
        uniswapInfo: {},
        isTop: false,
        performance: 0,
        color: '#ffffff'
      }

      if (state) {
        newFund.color = state.defaultFundColor
        if (state.user && state.user.isFundManager) {
          // newFund.symbol = state.currentNetwork.fundPrefix + state.user.company
          const company = state.companies.find((c) => c.id === state.user.company)
          if (company) {
            newFund.company = company.name
            newFund.image = state.user.companyImage || company.image || newFund.image
            const imagepath = 'images/'
            if (!newFund.image.startsWith(imagepath)) {
              newFund.image = imagepath + newFund.image
            }
          }
          newFund.fundManager = state.user.firstName + ' ' + state.user.familyName
          newFund.fundManagerEmail = state.user.userId
        }
      }

      if (extend) {
        this.extendFund(state, newFund)
      }
      return newFund
    },
    /**
     * Create a clone of a Fund.
     */
    cloneFund(state, fund) {
      if (fund) {
        // console.log('cloneFund', fund)

        // 1. Full copy using JSON
        const f = JSON.stringify(fund)
        const newFund = JSON.parse(f)

        newFund.balance = new BigNumber(fund.balance ? '' + fund.balance : '0.0')

        // 2. re-construct the allocation
        Object.keys(newFund.allocation).forEach((key) => {
          newFund.allocation[key].assets.forEach((a) => {
            // Replace the strings with BigNumbers
            a.price = new BigNumber(a.price || 0)
            a.unitQuantity = new BigNumber(a.unitQuantity || 0)
          })
        })

        // 3. re-construct the assets
        newFund.assets.forEach((asset) => {
          // Proper references to the definition objects (safeguard reactivity)
          const assetDef = state.assets.find((a) => a.symbol === asset.symbol)
          if (assetDef) {
            asset.definition = assetDef
          } else {
            console.warn(asset.symbol, 'is undefined')
          }

          // Replace the unitQuantity and launchPrice with BigNumbers
          asset.unitQuantity = new BigNumber(asset.unitQuantity ? '' + asset.unitQuantity : '0.0')
          asset.launchPrice = new BigNumber(asset.launchPrice ? '' + asset.launchPrice : '0.0')
        })

        // Replace the rebalance tradedFundTokens, maxTradedFundTokens and slippage with BigNumbers
        newFund.rebalance.tradedFundTokens = new BigNumber(newFund.rebalance.tradedFundTokens)
        newFund.rebalance.maxTradedFundTokens = new BigNumber(newFund.rebalance.maxTradedFundTokens)
        newFund.rebalance.slippage = new BigNumber(newFund.rebalance.slippage)

        // Replace the streamingFeePercentage, lastStreamingFeeTimestamp and earnedFees with BigNumbers
        const feeModule = newFund.modules.find((m) => m.name == Module.StreamingFeeModule)
        if (feeModule) {
          feeModule.settings.streamingFeeSettings.streamingFeePercentage = new BigNumber(
            feeModule.settings.streamingFeeSettings.streamingFeePercentage
          )
          feeModule.settings.streamingFeeSettings.lastStreamingFeeTimestamp = new BigNumber(
            feeModule.settings.streamingFeeSettings.lastStreamingFeeTimestamp
          )
          feeModule.settings.streamingFeeSettings.earnedFees = new BigNumber(
            feeModule.settings.streamingFeeSettings.earnedFees
          )
        }

        // console.log('newFund', newFund)
        return newFund
      }
      return undefined
    },
    extendFund(state, fund) {
      if (!fund) return

      fund.isFof = false

      // Loop thru the Fund's Assets and for each one:
      // 1- add a ref to the Asset definition object
      // 2- add a reactive 'amounts' object
      let countKyberAssets = 0
      for (var j = fund.assets.length - 1; j >= 0; j--) {
        var asset = fund.assets[j]

        // Replace the unitQuantity and launchPrice with BigNumbers
        asset.unitQuantity = new BigNumber(asset.unitQuantity ? '' + asset.unitQuantity : '0.0')
        asset.launchPrice = new BigNumber(asset.launchPrice ? '' + asset.launchPrice : '0.0')

        // ** DAPP-229: DELETE AFTER V1 > V2 MIGRATION ***
        if (asset.definition) {
          // Asset already extended, copy the value
          asset.unitQuantity = asset.definition.unitQuantity
        }
        fund.clonedFromV1 = fund.clonedFromV1 && !asset.unitQuantity.eq(0)
        // *************************************

        if (!asset.definition) {
          const assetDef = state.assets.find((a) => a.symbol === asset.symbol)
          if (assetDef) {
            asset.definition = assetDef
            if (assetDef.isFund) {
              fund.isFof = true
            }
            if (assetDef.isKyberCompatible) {
              countKyberAssets++
            }
          } else {
            console.warn(fund.symbol, ', asset', asset.symbol, ': undefined')
          }
        }
        // Add a reactive 'amounts' property
        /*
        Vue.set(asset, 'amounts', {
          required: new BigNumber(0.0)
          // authorized: new BigNumber(0.0)
        })
        */
      }

      // Replace the streamingFeePercentage, lastStreamingFeeTimestamp and earnedFees with BigNumbers
      const feeModule = fund.modules.find((m) => m.name == Module.StreamingFeeModule)
      if (feeModule) {
        feeModule.settings.streamingFeeSettings.streamingFeePercentage = new BigNumber(
          feeModule.settings.streamingFeeSettings.streamingFeePercentage
        )
        feeModule.settings.streamingFeeSettings.lastStreamingFeeTimestamp = new BigNumber(
          feeModule.settings.streamingFeeSettings.lastStreamingFeeTimestamp
        )
        feeModule.settings.streamingFeeSettings.earnedFees = new BigNumber(
          feeModule.settings.streamingFeeSettings.earnedFees
        )
      }

      fund.isKyberCompatible = countKyberAssets === fund.assets.length

      // Create the latest allocation if not present
      if (!fund.allocation.latest) {
        fund.allocation.latest = { assets: [] }
        fund.allocation.latest.date = fund.allocation.inception.date
        fund.allocation.latest.assets = fund.allocation.inception.assets.map((a) => ({
          percentage: a.percentage,
          price: new BigNumber(a.price),
          symbol: a.symbol,
          unitQuantity: new BigNumber(a.unitQuantity)
        }))
      }

      // Create the current allocation copying the value from the latest, biut later
      // the store will refresh it getting the latest quantities from the blockchain
      fund.allocation.current = { assets: [] }
      fund.allocation.current.assets = fund.allocation.latest.assets.map((a) => {
        const asset = {
          percentage: 0, // updated dynamically every time .currentPrice() is called
          price: new BigNumber(0),
          symbol: a.symbol,
          unitQuantity: new BigNumber(a.unitQuantity)
        }
        const assetDef = state.assets.find((asset) => asset.symbol === a.symbol)
        if (assetDef) {
          asset.price = assetDef.price
        }
        return asset
      })
      fund.allocation.current.totalPrice = this.calculateAllocationTotal(
        fund.allocation.current.assets
      )
      fund.allocation.current.slippage = new BigNumber(0) // updated in the store

      // Make some fields reactive
      Vue.set(fund, 'pendingModules', fund.pendingModules || [])
      Vue.set(fund, 'initializedModules', fund.initializedModules || [])
      /*
      Vue.set(fund, 'state', fund.state || FundState[0])
      Vue.set(fund, 'minimumDelay', fund.minimumDelay || FundState[0])
      Vue.set(fund, 'proposalTimestamp', fund.proposalTimestamp || FundState[0])
      Vue.set(fund, 'proposalEndTimestamp', fund.proposalEndTimestamp || FundState[0])
      Vue.set(
        fund,
        'tradedFundTokens',
        fund.tradedFundTokens || new BigNumber(0.0)
      )
      Vue.set(
        fund,
        'maxTradedFundTokens',
        fund.maxTradedFundTokens || new BigNumber(0.0)
      )
      */
      Vue.set(
        fund,
        'rebalance',
        fund.rebalance || {
          state: 'Regular',
          minimumDelay: 60,
          proposalTimestamp: Math.round(Date.now() / 1000),
          proposalEndTimestamp: Math.round(Date.now() / 1000) + 60,
          tradedFundTokens: new BigNumber(0.0),
          maxTradedFundTokens: new BigNumber(0.0),
          in: { assets: [] },
          out: { assets: [] },
          slippage: new BigNumber(0.0),
          rationale: ''
        }
      )

      if (fund.refreshing === undefined) {
        Vue.set(fund, 'refreshing', true)
      }
      Vue.set(fund, 'modules', fund.modules || [])
      Vue.set(fund, 'balance', new BigNumber(0.0))
      Vue.set(fund, 'totalNoOfTokens', new BigNumber(0.0))
      Vue.set(fund, 'currentUniswapPrice', new BigNumber(0.0))
      Vue.set(fund, 'takerBuyPositions', [])
      Vue.set(fund, 'takerSellPositions', [])

      this.evalFundStatus(fund, 'extendFund', true)

      // For some properties we use a function (do they really need to be reactive? the function would be executed in any case...)
      Vue.set(fund, 'currentPrice', function() {
        let currentPrice = new BigNumber(0.0)
        fund.allocation.current.assets.forEach((a, i) => {
          currentPrice = currentPrice.plus(a.unitQuantity.times(a.price))

          /*
          console.log(
            i,
            'fundMixins.totalling',
            fund.symbol,
            a.symbol,
            a.unitQuantity.toString(),
            a.price.toString(),
            currentPrice.toString()
          )
          */
        })

        // Update the current allocation's percentages
        fund.allocation.current.assets.forEach((a) => {
          a.percentage =
            1 *
            a.unitQuantity
              .times(a.price)
              .div(currentPrice)
              .times(100)
              .toFormat(4)
        })

        /*
        currentPrice = new BigNumber(0.0)
        fund.assets.forEach((a) => {
          if (a.definition) {
            if (fund.symbol === 'XTF2000F01')
              console.log(
                'v2)',
                a.symbol,
                a.unitQuantity.toString(),
                a.definition.price.toString()
              )
            currentPrice = currentPrice.plus(
              a.unitQuantity.times(a.definition.price)
            )

            // console.log(
            //   'fundMixins.totalling',
            //   fund.symbol,
            //   a.symbol,
            //   a.unitQuantity.toString(),
            //   a.definition.price.toString(),
            //   currentPrice.toString()
            // )
          }
        })
        */

        // BigNumber with max 15 significant digits
        currentPrice = new BigNumber(currentPrice.toNumber().toPrecision(15))

        /*
        console.log(
          fund.symbol,
          'currentPrice',
          currentPrice.toString(),
          fund.allocation.current.assets[0].percentage.toString()
        )
        */

        // Update the performance
        fund.performance = (currentPrice / 100 - 1) * 100

        return currentPrice
      })
      Vue.set(fund, 'aum', function() {
        /*
        let aum = fund.totalNoOfTokens.times(fund.currentPrice())
        // BigNumber with max 15 significant digits
        aum = new BigNumber(aum.toNumber().toPrecision(15))
        return aum
        */
        return fund.totalNoOfTokens.times(fund.currentPrice())
      })
    },
    /**
     * Update the following fund properties:
     *   - launching
     *   - creating
     *   - initializing
     *   - created
     *   - initialized
     *   - launched
     *   - launching
     *   - canRebalance
     *   - status
     */
    evalFundStatus(fund, caller, firstInit = false) {
      if (firstInit) {
        Vue.set(fund, 'launching', false)
        Vue.set(fund, 'creating', false)
        Vue.set(fund, 'initializing', false)
        // Dependent properties
        Vue.set(fund, 'created', false)
        Vue.set(fund, 'initialized', false)
        Vue.set(fund, 'hasDextfTradeModule', false)
        Vue.set(fund, 'hasStreamingFeeModule', false)
        Vue.set(fund, 'launched', false)
        Vue.set(fund, 'status', 'new')
      }

      fund.launchDate = fund.launchDate || fund.allocation.inception.date

      /*
      console.log(
        'evalFundStatus',
        caller,
        ' | symbol',
        fund.symbol,
        ' | address',
        fund.address,
        ' | launchDate',
        fund.launchDate,
        ' | not a date',
        isNaN(Date.parse(fund.launchDate)),
        ' | initialized',
        fund.initialized,
        ' | modules',
        fund.modules
      )
      */

      fund.created = !!fund.address

      fund.initialized = fund.initializedModules.includes(Module.IssuanceModule)
      /*
        !!fund.modules &&
        fund.modules.IssuanceModule !== undefined &&
        fund.modules.IssuanceModule >= 2
      */

      fund.canInvest = fund.canInvest && fund.initialized
      fund.canRedeem = fund.canRedeem && fund.initialized

      /*
        !!fund.modules && fund.modules.DextfTradeModule !== undefined
      */

      fund.launched = fund.created && fund.initialized && !isNaN(Date.parse(fund.launchDate))

      const hasDextfTradeModuleInDb = fund.modules.some((m) => m.name === Module.DextfTradeModule)

      fund.hasDextfTradeModule =
        hasDextfTradeModuleInDb &&
        (!fund.launched || fund.initializedModules.includes(Module.DextfTradeModule))

      const hasStreamingFeeModuleInDb = fund.modules.some(
        (m) => m.name === Module.StreamingFeeModule
      )

      fund.hasStreamingFeeModule =
        hasStreamingFeeModuleInDb &&
        (!fund.launched || fund.initializedModules.includes(Module.StreamingFeeModule))

      if (!fund.hasDextfTradeModule && hasDextfTradeModuleInDb) {
        fund.rebalance.state = 'Upgradeable'
      }

      fund.canRebalance = fund.canRebalance && fund.launched && fund.hasDextfTradeModule
      /*
      fund.launched &&
      fund.hasDextfTradeModule &&
      fund.modules.DextfTradeModule == 2
      */

      fund.launching = fund.creating || (fund.created && fund.initializing)

      fund.status = fund.launched
        ? 'launched'
        : fund.creating
        ? 'creating'
        : fund.initializing
        ? 'initializing'
        : fund.created
        ? 'created'
        : 'new'

      /*
      console.log(
        fund.symbol,
        '+++++',
        'created',
        fund.created,
        ' | creating',
        fund.creating,
        ' | initialized',
        fund.initialized,
        ' | hasDextfTradeModule',
        fund.hasDextfTradeModule,
        ' | hasStreamingFeeModule',
        fund.hasStreamingFeeModule,
        ' | DextfTradeModule initialized',
        fund.initializedModules.includes(Module.DextfTradeModule),
        ' | launched',
        fund.launched,
        ' | launching',
        fund.launching,
        ' | status',
        fund.status
      )
      */
    },
    /**
     *  Given an array of items, calculate the total price as sum of (unitQuantity * price).
     * @param {Object[]} items - Array of allocation objects [ { price: <BigNumber>, unitQuantity: <BigNumber> }, ... ]
     * @returns
     */
    calculateAllocationTotal(items, caller = '') {
      // this.log('calculateAllocationTotal', caller, items)
      let totalPrice = new BigNumber(0)

      // Calculate the total as sum of the prices
      items.forEach((item) => {
        totalPrice = totalPrice.plus(item.unitQuantity.times(item.price))
      })
      // console.log('Total', totalPrice.toString())
      return totalPrice
    },
    /**
     *  Given an array of items, update each item's percentage.
     * @param {Object[]} items - Array of allocation objects [ { price: <BigNumber>, unitQuantity: <BigNumber> }, ... ]
     * @param {BigNumber} totalPrice
     * @param {number} [decimals=4]
     */
    updateAllocationPercentages(items, totalPrice, decimals = 4) {
      // this.log('calculateAllocationPercentages', items)
      // Calculate the percentage based on the price and total
      items.forEach((item) => {
        item.percentage =
          1 *
          item.unitQuantity
            .times(item.price)
            .div(totalPrice)
            .times(100)
            .toFormat(decimals)
      })
    },
    /**
     * Extend an Asset definition.
     * @param {*} state
     * @param {*} asset
     */
    extendAsset(state, asset) {
      if (!asset) return

      // Add extra fields (will be reactive)
      Vue.set(asset, 'balance', {
        wallet: new BigNumber(0.0),
        authorized: new BigNumber(0.0)
      })
      Vue.set(asset, 'selected', false) // this should go to the Fund's asset holder
      Vue.set(asset, 'percentage', 0.0) // this should go to the Fund's asset holder
      Vue.set(asset, 'required', new BigNumber(0.0)) // this should go to the Fund's asset holder
      Vue.set(asset, 'unitQuantity', new BigNumber(0.0)) // this should go to the Fund's asset holder
      Vue.set(asset, 'balanceError', false) // this should go to the Fund's asset holder
      Vue.set(asset, 'price', new BigNumber(0.0))
      Vue.set(asset, 'open24hour', 0.0)
      Vue.set(asset, 'change24HourPct', new BigNumber(0.0))
    }
  }
}

export { fundMixin }
