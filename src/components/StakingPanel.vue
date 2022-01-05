<template>
  <div class="ui fluid card" style="background-color: black !important">
    <div class="content">
      <div class="ui three column grid">
        <div class="column">
          <Token
            class="_muted _pointer"
            :font-size="'large'"
            :label="header"
            :image="'https://cdn.dextf.com/images/assets/dextf.png'"
            font-weight="bold"
          >
          </Token>
        </div>
        <div class="column">
          <div v-if="isAdmin">
            <span class="ui text white">
              {{ formatQuantity(totalStaked.toNumber(), 100000) }}
            </span>
            (
            <span class="ui text primary">
              {{ formatWallet(totalStaked2Usd.toNumber(), 100000) }}
              <span class="_muted" style="font-size: 0.8rem">USD</span>
            </span>
            )
            <span style="font-size: smaller; margin-left: 0.5rem"> TOTAL STAKED </span>
          </div>
        </div>
        <div class="right aligned column">
          <span class="ui text primary">
            {{ formatPct(stakingApr.toNumber()) }}
          </span>
          <span style="font-size: smaller; margin-left: 0.5rem"> ANNUAL PERCENTAGE RATE </span>
        </div>
      </div>

      <div class="ui four column grid" style="margin-top: 0.5rem">
        <div class="column">
          <div class="ui header _muted">
            Balance <br />
            <span class="ui text" style="font-size: smaller; color: white">
              {{ formatQuantity(dextfBalance.toNumber(), 100000) }}
            </span>
            (
            <span class="ui text primary" style="font-size: smaller">
              {{ formatWallet(dextfBalance2Usd.toNumber(), 100000) }}
              <span class="_muted" style="font-size: 0.8rem">USD</span>
            </span>
            )
          </div>
        </div>
        <div class="column">
          <div class="ui header _muted">
            Token price <br />
            <span class="ui text primary" style="font-size: smaller">
              {{ formatWallet(dextfPrice.toNumber(), 100000, 4) }}
              <span class="_muted" style="font-size: 0.8rem">USD</span>
            </span>
          </div>
        </div>
        <div class="column">
          <div class="ui header _muted">
            Staked <br />
            <span class="ui text" style="font-size: smaller; color: white">
              {{ formatQuantity(stakeBalance.toNumber(), 100000) }}
            </span>
            (
            <span class="ui text primary" style="font-size: smaller">
              {{ formatWallet(stakeBalanceUsd.toNumber(), 100000) }}
              <span class="_muted" style="font-size: 0.8rem">USD</span>
            </span>
            )
          </div>
        </div>
        <div class="column">
          <div class="ui header _muted">
            Earned <br />
            <span class="ui text" style="font-size: smaller; color: white">
              {{ formatQuantity(earnedBalance.toNumber(), 100000) }}
            </span>
            (
            <span class="ui text primary" style="font-size: smaller">
              {{ formatWallet(earnedBalanceUsd.toNumber(), 100000) }}
              <span class="_muted" style="font-size: 0.8rem">USD</span>
            </span>
            )
          </div>
        </div>
      </div>
      <div class="ui four column grid" style="margin-top: 0">
        <div class="column">
          <Stake
            action="stake"
            :price="dextfPrice"
            :max="dextfBalance"
            max-button-tooltip="Stake all your DEXTF Tokens"
            :disabled="workInProgress || dextfBalance.eq(0)"
            :unavailable="dextfBalance.eq(0)"
            @stake="onStake"
            style="height: 100%"
          />
        </div>
        <div class="column">
          <Unlock
            :status="statusUnlock"
            :unlock-time="unlockTime"
            :relock-time="relockTime"
            :unlock-period="unlockPeriod"
            :disabled="workInProgress || (stakeBalance.eq(0) && earnedBalance.eq(0))"
            :unavailable="stakeBalance.eq(0) && earnedBalance.eq(0)"
            @unlock="activateUnlockTime"
            style="height: 100%"
          />
        </div>
        <div class="column">
          <Stake
            action="unstake"
            :price="dextfPrice"
            :max="stakeBalance"
            max-button-tooltip="Unstake all your DEXTF Tokens"
            :disabled="workInProgress || statusUnlock !== 'claimable' || stakeBalance.eq(0)"
            :unavailable="statusUnlock !== 'claimable' || stakeBalance.eq(0)"
            @unstake="onUnStake"
            style="height: 100%"
          />
        </div>
        <div class="column">
          <Claim
            :disabled="workInProgress || statusUnlock !== 'claimable'"
            :unavailable="statusUnlock !== 'claimable'"
            @claim="onClaim"
            style="height: 100%"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Token from './Token.vue'
import Stake from './Stake.vue'
import Unlock from './Unlock.vue'
import Claim from './Claim.vue'
import BigNumber from 'bignumber.js'
import numeral from 'numeral'
import { mapGetters } from 'vuex'
import axios from 'axios'

export default {
  name: 'StakingPanel',
  components: {
    Token,
    Stake,
    Unlock,
    Claim
  },
  data() {
    return {
      unlockTime: 0,
      relockTime: 0,
      unlockPeriod: 0,
      currentTime: 0,
      currentTimeInterval: undefined,
      galliumInterval: undefined,
      totalStaked: new BigNumber(0),
      header:
        'DEXTF Staking&nbsp;&nbsp;<a href="https://dextf.notion.site/Single-side-staking-c2582eb4a30044938e6ab5a508525f1f" target="wiki"><i class="circular colored primary question tiny icon" style="margin: 0"></i></a>'
    }
  },
  computed: {
    ...mapGetters(['galliumConnector']),
    stakePoolApi() {
      return this.galliumConnector.stakePoolApi
    },
    dextfAsset() {
      return this.$store.getters.getAssetBySymbol('DEXTF')
    },
    dextfPrice() {
      return this.dextfAsset ? this.dextfAsset.price : new BigNumber(0)
    },
    dextfBalance() {
      return this.dextfAsset ? this.dextfAsset.balance.wallet : new BigNumber(0)
    },
    dextfBalance2Usd() {
      return this.dextfAsset ? this.dextfBalance.multipliedBy(this.dextfPrice) : new BigNumber(0)
    },
    totalStaked2Usd() {
      return this.totalStaked.multipliedBy(this.dextfPrice)
    },
    stakeBalance() {
      return this.$store.state.currentAccount.cryptos.DEXTF.staked
    },
    stakeBalanceUsd() {
      return this.stakeBalance.multipliedBy(this.dextfPrice)
    },
    earnedBalance() {
      return this.$store.state.currentAccount.cryptos.DEXTF.earned
    },
    earnedBalanceUsd() {
      return this.earnedBalance.multipliedBy(this.dextfPrice)
    },
    stakingApr() {
      return this.$store.state.currentAccount.cryptos.DEXTF.apr
    },
    statusUnlock() {
      if (this.currentTime < this.unlockTime && this.currentTime < this.relockTime)
        return 'unlocking'
      if (this.currentTime >= this.unlockTime && this.currentTime < this.relockTime)
        return 'claimable'
      return 'idle'
    }
  },
  // watch: {
  //   async galliumConnector(connector) {
  //     console.log('galliumConnector changed')
  //     this.getGalliumInfo(connector)
  //   }
  // },
  created() {
    this.log(this.$options.name + ' created')
    if (this.galliumConnector) this.getGalliumInfo()

    // Get Current Time frequently so that it will be updated
    this.currentTime = Math.floor(new Date().getTime() / 1000)
    this.currentTimeInterval = setInterval(() => {
      this.currentTime = Math.floor(new Date().getTime() / 1000)
    }, 1000)
    // Need to get Gallium User Info frequently because all the actions
    // are done in metamask and it takes some time to be performed.
    this.galliumInterval = setInterval(() => {
      this.getGalliumInfo()
    }, 10 * 1000)
  },
  beforeDestroy() {
    this.log(this.$options.name + ' beforeDestroy')
    clearInterval(this.currentTimeInterval)
    clearInterval(this.galliumInterval)
  },
  methods: {
    formatQuantity(n, limit = 1000000) {
      if (isNaN(n)) return '-'

      // numeral returns NaN for numbers with precision less than 10^-6
      if (Math.abs(n) < 0.000001) {
        return '0'
      }

      let s
      if (n < limit) {
        s = numeral(n).format('0,0.[000]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.[00]a')
      }
      return s == 'NaN' ? '0' : s
    },
    formatWallet(n, limit = 1000000, decimals = 2) {
      if (isNaN(n)) return '-'

      // numeral returns NaN for numbers with precision less than 10^-6
      if (Math.abs(n) < 0.000001) {
        return '$0'
      }
      const noOfZeroes = '0'.repeat(decimals)

      let s
      if (n < limit) {
        s = numeral(n).format(`0,0.[${noOfZeroes}]`)
      } else {
        // Use m for millions, etc...
        s = numeral(n).format(`0,0.[${noOfZeroes}]a`)
      }
      return s == 'NaN' ? '0' : '$' + s
    },
    formatPct(n) {
      if (isNaN(n)) return '-'

      return n == 0 ? '0%' : numeral(n).format('0.[00]') + '%'
    },
    async getGalliumInfo() {
      if (!this.galliumConnector || !this.isConnected || !this.isNetworkValid) {
        return
      }

      const accountAddress = this.$store.state.currentAccount.address

      const promises = [
        this.stakePoolApi.balanceOf(accountAddress),
        this.stakePoolApi.rewardsEarned(accountAddress),
        this.stakePoolApi.userInfo(accountAddress),
        this.stakePoolApi.getUnlockTime(),

        this.stakePoolApi.getRewardsDistributionRate(),
        this.stakePoolApi.totalStaked(),

        axios.get(this.$store.state.APIs.stakingDailyTokensPerBlock)
      ]

      Promise.all(promises)
        .then((results) => {
          const stakedAmount = results[0]
          const earnedAmount = results[1]

          const userInfo = results[2]
          const unlockPeriod = results[3]

          const tokenPerBlock = results[4]
          this.totalStaked = results[5]
          const dailyBlocks = results[6].data

          if (this.dextfAsset) this.$store.dispatch('updateAssetBalance', this.dextfAsset.symbol)

          this.$store.dispatch('updateStakedAmount', stakedAmount)
          this.$store.dispatch('updateStakingEarnedAmount', earnedAmount)

          this.unlockTime = userInfo.unlockTime.toNumber()
          this.relockTime = userInfo.relockTime.toNumber()
          this.unlockPeriod = unlockPeriod.toNumber()

          //
          // Calculate APR
          //

          const apr = tokenPerBlock
            .times(dailyBlocks)
            .div(this.totalStaked)
            .times(365.25)
            .times(100)

          /*
          console.log('stakedAmount', stakedAmount.toString())
          console.log('earnedAmount', earnedAmount.toString())

          console.log('unlockTime', this.unlockTime)
          console.log('relockTime', this.relockTime)
          console.log('unlockPeriod', this.unlockPeriod, 'mins')

          console.log('tokenPerBlock', tokenPerBlock.toString())
          console.log('totalStaked', this.totalStaked.toString())
          console.log('dailyBlocks', dailyBlocks.toString())

          console.log('APR', apr.toString())
          */

          this.$store.dispatch('updateStakingApr', apr)
        })
        .catch((error) => {
          console.error('Error in getGalliumInfo', error)
        })
        .finally(() => {
          // console.timeEnd('getGalliumInfo')
        })
    },
    async activateUnlockTime() {
      if (this.galliumConnector === null || this.galliumConnector === undefined) return

      let hash
      let msg
      let header = 'Start unlock period'
      this.$store.dispatch('setWorkInProgress', true)

      try {
        msg = {
          type: '',
          header: header,
          subHeaders: ['Please accept the transaction in MetaMask...']
        }
        this.setDimmer(true, false, msg)

        const result = await this.stakePoolApi.activateUnlockTime()

        if (result.errors.length === 0) {
          hash = result.data.contractTransaction.hash
          await this.waitForTransactionComplete(hash, header)
        } else {
          const errorMessages = result.errors.map((logMessage) => logMessage.message.message)
          let msg = {
            type: 'error',
            header: header,
            subHeaders: ['Oops, something went wrong'],
            lines: errorMessages
          }
          this.setDimmer(true, true, msg)
        }
      } catch (unlockError) {
        console.error('Failed to activateUnlockTime', unlockError)

        let msg = {
          type: 'error',
          header: header,
          subHeaders: ['Oops, something went wrong'],
          lines: [unlockError]
        }
        this.setDimmer(true, true, msg)
      }

      this.$store.dispatch('setWorkInProgress', false)
    },

    async onStake(amount) {
      if (this.galliumConnector === null || this.galliumConnector === undefined) return

      const accountAddress = this.$store.state.currentAccount.address

      let hash
      let msg
      let header

      this.$store.dispatch('setWorkInProgress', true)

      try {
        const stakedToken = await this.stakePoolApi.getStakedToken()
        const tokenApi = this.connector.createTokenApi(stakedToken.address)
        const allowance = await tokenApi.getAllowance(
          accountAddress,
          this.galliumConnector.config['stakePoolAddress']
        )

        const allowanceBN = allowance.data.allowance
        const allowanceUnlimited = allowance.data.allowanceUnlimited

        let noOfSteps = 1

        if (!allowanceUnlimited && allowanceBN.lt(amount)) {
          noOfSteps = 2
          // Need to confirm approve Allowance

          header = 'Step 1/2 - Asset transfer authorization'
          msg = {
            type: '',
            header: header,
            subHeaders: [
              'Please accept the authorization transaction in MetaMask...',
              '',
              `${amount.toString()} DEXTF spending authorization`
            ]
          }
          this.setDimmer(true, false, msg)

          if (!(await this.approveAllowance(amount, tokenApi, header))) return
        }

        header =
          (noOfSteps == 2 ? 'Step 2/2 - ' : '') +
          `Stake ${this.formatQuantity(amount.toNumber())} ${this.dextfAsset.symbol} tokens`

        // Wait for user to confirm the transaction
        msg = {
          type: '',
          header: header,
          subHeaders: ['Please accept the authorization transaction in MetaMask...']
        }
        this.setDimmer(true, false, msg)

        this.$store.dispatch('setWorkInProgress', true)

        const result = await this.stakePoolApi.stake(amount)

        if (result.errors.length === 0) {
          hash = result.data.contractTransaction.hash
          await this.waitForTransactionComplete(hash, header)
        } else {
          const errorMessages = result.errors.map((logMessage) => logMessage.message.message)
          msg = {
            type: 'error',
            header: header,
            subHeaders: [`Oops, something went wrong`],
            lines: errorMessages
          }
          this.setDimmer(true, true, msg)
        }
      } catch (stakeError) {
        console.error('Failed to Stake', stakeError)

        msg = {
          type: 'error',
          header: header,
          subHeaders: [`Oops, something went wrong`],
          lines: [stakeError]
        }
        this.setDimmer(true, true, msg)
      }

      this.$store.dispatch('setWorkInProgress', false)
    },
    async approveAllowance(amount, tokenApi, header) {
      if (this.galliumConnector === null || this.galliumConnector === undefined) return

      try {
        const result = await tokenApi.approve(
          this.galliumConnector.config['stakePoolAddress'],
          amount,
          true
        )

        if (result.errors.length === 0) {
          // Approve Transaction
          let hash = result.data.contractTransaction.hash

          await this.waitForTransactionComplete(hash, header)
          return true
        } else {
          const errorMessages = result.errors.map((logMessage) => logMessage.message.message)
          let msg = {
            type: 'error',
            header: header,
            subHeaders: ['Oops, something went wrong'],
            lines: errorMessages
          }
          this.setDimmer(true, true, msg)
        }
      } catch (approvalError) {
        console.error('Failed to approve Allowance', approvalError)

        let msg = {
          type: 'error',
          header: header,
          subHeaders: ['Oops, something went wrong'],
          lines: [approvalError]
        }
        this.setDimmer(true, true, msg)
      }
      this.$store.dispatch('setWorkInProgress', false)

      return false
    },
    async onUnStake(amount) {
      if (this.galliumConnector === null || this.galliumConnector === undefined) return

      // Withdraw
      let hash
      let msg
      try {
        msg = {
          type: '',
          header: 'Step 1/1 - Confirm Transaction on Metamask',
          subHeaders: [`Check your wallet to confirm.`]
        }
        this.setDimmer(true, false, msg)
        this.$store.dispatch('setWorkInProgress', true)

        const result = await this.stakePoolApi.withdraw(amount)

        if (result.errors.length === 0) {
          hash = result.data.contractTransaction.hash
          await this.waitForTransactionComplete(hash, 'Step 1/1 - Withdrawing Your Tokens')
        } else {
          const errorMessages = result.errors.map((logMessage) => logMessage.message.message)
          let msg = {
            type: 'error',
            header: `Step 1/1 - Withdrawing Failed`,
            subHeaders: [`Oops, something went wrong during withdrawing your tokens.`],
            lines: errorMessages
          }
          this.setDimmer(true, true, msg)

          this.$store.dispatch('setWorkInProgress', false)
        }
      } catch (withdrawError) {
        console.error('Failed to WithDraw', withdrawError, amount)
        let msg = {
          type: 'error',
          header: `Step 1/1 - Withdrawing Failed`,
          subHeaders: [`Oops, something went wrong during withdrawing your tokens.`],
          lines: [withdrawError]
        }
        this.setDimmer(true, true, msg)

        this.$store.dispatch('setWorkInProgress', false)
      }
    },
    async onClaim() {
      if (this.galliumConnector === null || this.galliumConnector === undefined) return

      // Redeem
      let hash

      let msg = {
        type: '',
        header: 'Step 1/1 - Confirm Transaction on Metamask',
        subHeaders: [`Check your wallet to confirm.`]
      }
      this.setDimmer(true, false, msg)
      this.$store.dispatch('setWorkInProgress', true)
      try {
        const result = await this.stakePoolApi.redeemRewards()

        if (result.errors.length === 0) {
          hash = result.data.contractTransaction.hash
          await this.waitForTransactionComplete(hash, 'Step 1/1 - Claiming Your Tokens')
        } else {
          const errorMessages = result.errors.map((logMessage) => logMessage.message.message)
          let msg = {
            type: 'error',
            header: `Step 1/1 - Claim Failed`,
            subHeaders: [`Oops, something went wrong during staking your tokens.`],
            lines: errorMessages
          }
          this.setDimmer(true, true, msg)

          this.$store.dispatch('setWorkInProgress', false)
        }
      } catch (claimError) {
        console.error('Failed to Claim', claimError)

        let msg = {
          type: 'error',
          header: `Step 1/1 - Claim Failed`,
          subHeaders: [`Oops, something went wrong during claiming your tokens.`],
          lines: [claimError]
        }
        this.setDimmer(true, true, msg)

        this.$store.dispatch('setWorkInProgress', false)
      }
    },
    async waitForTransactionComplete(transactionAddress, header) {
      let msg = {
        type: '',
        header: header,
        subHeaders: [
          `Processing transaction: ${transactionAddress}`,
          '',
          'Do not change the transaction in MetaMask',
          '',
          'Please wait...'
        ]
      }
      this.setDimmer(true, false, msg)
      this.$store.dispatch('setWorkInProgress', true)

      // Check transaction status
      const totalTimeoutInMillis = 30 * 60 * 1000 // 30 mins

      try {
        const txStatusResponse = await this.connector.waitForTransaction(
          transactionAddress,
          1,
          totalTimeoutInMillis
        )

        if (txStatusResponse.errors.length === 0) {
          msg = {
            type: 'ok',
            header: 'Transaction processed',
            subHeaders: [`Transaction ${transactionAddress}`]
          }

          this.setDimmer(true, true, msg)

          this.$store.dispatch('setWorkInProgress', false)
        } else {
          const errorMessages = txStatusResponse.errors.map(
            (logMessage) => logMessage.message.message
          )
          msg = {
            type: 'error',
            header: header,
            subHeaders: ['Oops, something went wrong'],
            lines: errorMessages
          }
          this.setDimmer(true, true, msg)
          this.$store.dispatch('setWorkInProgress', false)
        }
      } catch (err) {
        console.error('Failed to wait for transaction', err)

        msg = {
          type: 'error',
          header: header,
          subHeaders: ['Oops, something went wrong'],
          lines: [err]
        }
        this.setDimmer(true, true, msg)
        this.$store.dispatch('setWorkInProgress', false)
      }
    },
    setDimmer(show, closable = false, msg = {}) {
      this.$emit('setDimmer', { show, closable, msg })
    }
  }
}
</script>