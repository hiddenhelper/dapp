<template>
  <div>
    <div
      class="ui attached segment"
      style="padding-left: 32px; padding-right: 32px"
      :style="{ height: heightInPx }"
    >
      <form v-show="showRebalanceInfo" class="ui form">
        <fieldset
          :disabled="workInProgress || !connector || !isConnected || !isNetworkValid"
          style="margin: 0; padding: 0; border-style: none"
        >
          <div
            v-show="trading"
            class="ui segment"
            style="border-radius: 8px; padding: 7px 0 7px 0; background-color: #2a2a2a"
          >
            <a
              class="ui right corner label"
              style="border-color: transparent !important"
              href="https://dextf.notion.site/Rebalancing-Guide-I-ea67f8ecaee3409991f4022916158453"
              target="wiki"
            >
              <i class="circular colored question green small icon"></i>
            </a>
            <table style="width: 100%">
              <tr>
                <td style="width: 100%">
                  <div class="field">
                    <label class="_muted" style="font-weight: normal; margin: 0 0 0 18px">
                      Rebalance
                    </label>
                    <div
                      class="ui left icon input"
                      :class="{ disabled: !isConnected }"
                      :data-tooltip="wrongInput"
                      data-position="bottom left"
                      data-inverted=""
                    >
                      <BigNumberInput
                        :input-value="bigNumberInputValue"
                        :text-align="'left'"
                        id="rebalance-input"
                        @changed="noOfTokensChanged($event, 'BigNumberInput')"
                        style="
                          padding: 0 9px 0 18px;
                          font-size: 27px;
                          font-weight: 600;
                          background-color: transparent;
                          border-radius: 0;
                          width: 100%;
                        "
                      />

                      <!-- The icon will be used for the loading -->
                      <i
                        class="small icon"
                        :class="{
                          stopwatch: false && wrongInput === undefined && computeStatus == 1,
                          'clock outline': wrongInput === undefined && computeStatus == 1,
                          exclamation: wrongInput !== undefined,
                          _error: wrongInput !== undefined
                        }"
                        style="width: 15px"
                      ></i>
                    </div>
                    <label
                      v-if="false"
                      class="_muted"
                      style="font-weight: normal; margin: 0 0 0 18px"
                    >
                      {{ formatPrice(noOfTokensPrice) }}
                    </label>
                    <label v-else class="_muted" style="font-weight: normal; margin: 0 0 0 18px">
                      tokens
                    </label>
                  </div>
                </td>
                <td
                  class="right floated right aligned"
                  style="white-space: nowrap; padding-top: 1.8rem; padding-right: 14px"
                >
                  <Token class="_muted" :image="fund.image" :label="fund.symbol" />
                  <div v-if="maxTradeable.gt(0)" style="padding-right: 0.1rem">
                    <span
                      style="text-decoration: underline; cursor: pointer"
                      @click="setMax()"
                      data-tooltip="Rebalance as many tokens as possible"
                      data-position="bottom right"
                      data-inverted=""
                    >
                      SET MAX
                    </span>
                  </div>
                </td>
              </tr>
            </table>
          </div>

          <RebalanceInfoBar
            :fund="fund"
            :user="'Trader'"
            :show-rationale="!!fund.rebalance.rationale"
            style="margin: 0"
            :style="{ height: rebalanceInfoBarHeightInPx }"
          ></RebalanceInfoBar>

          <div
            class="ui top attached segment"
            style="margin: 0 !important; padding: 0.5rem !important; background-color: #2a2a2a"
          >
            <TokenList
              :parent-id="id"
              :tokens="tokens"
              :styles="tokenListStyles"
              :format-quantity="formatQuantity"
              :format-wallet="formatQuantity"
              :show-full-name="false"
              :font-size="'smaller'"
              :max-height="tokenListHeight"
            />
          </div>

          <div
            class="ui bottom attached segment center aligned _muted"
            style="margin: 0 !important; padding: 0.5 !important; background-color: #2a2a2a"
          >
            <b style="color: white">
              {{ !trading || this.noOfTokens.eq(0) ? '1' : formatQuantity(noOfTokens.toNumber()) }}
            </b>
            rebalanced {{ noOfTokens.gt(1) ? 'tokens' : 'token' }}

            <i class="arrow right icon" style="margin: 0"></i>

            <span
              :class="{
                _green: earning.gt(0),
                _error: !earning.gt(0)
              }"
              style="margin-right: 0.5rem"
            >
              <b>
                {{ formatPrice(earning.toNumber()) }}
              </b>
              {{ earning.gt(0) ? 'profit' : 'loss' }}
            </span>
            <i
              id="infoProfitLoss"
              class="info circle icon _pointer"
              style="margin: 0"
              data-content="Estimate based on the current asset prices"
              data-position="top right"
              data-variation="wide inverted"
            ></i>
          </div>
        </fieldset>
      </form>
    </div>

    <!-- Action button -->
    <div
      v-show="connector && isConnected && isNetworkValid"
      :class="{ _notAllowedPointer: buttonErrorMessage }"
      :data-tooltip="buttonErrorMessage"
      data-position="top center"
      data-inverted=""
    >
      <div
        class="ui fluid primary button bottom attached"
        :class="{
          disabled: !operationAllowed
        }"
        style="margin: 0 1px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px"
        @click="performOperation()"
      >
        Rebalance
      </div>
    </div>
    <div
      v-show="!connector || !isConnected || !isNetworkValid"
      class="ui negative message center aligned bottom attached _notAllowedPointer"
      style="margin: 0 1px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px"
    >
      {{ !connector || !isConnected ? 'Wallet not connected' : 'Wrong network' }}
    </div>
  </div>
</template>
    
<script>
import numeral from 'numeral'
import BigNumber from 'bignumber.js'
import { Module } from '@helium'

import { blockchainMixin } from '../mixins/blockchainMixin.js'

import Token from './Token.vue'
import TokenList from './TokenList.vue'
import BigNumberInput from './BigNumberInput.vue'
import RebalanceInfoBar from './RebalanceInfoBar.vue'

export default {
  name: 'FundTrade',
  components: { Token, TokenList, BigNumberInput, RebalanceInfoBar },
  mixins: [blockchainMixin],
  props: {
    fund: {
      type: Object,
      required: true
    },
    height: {
      type: Number,
      default: 500
    },
    activated: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      computeStatus: 0, // 0 = to do, 1 = in progress, 2 = done
      bigNumberInputValue: undefined,
      prevNoOfTokens: undefined,
      noOfTokens: new BigNumber(0),
      tokens: [],
      totals: {
        in: new BigNumber(0),
        out: new BigNumber(0)
      },
      isMint: false,
      imageSource: '',
      balanceErrors: 0,
      wrongInput: undefined,
      dimmerMessage: {}
    }
  },
  computed: {
    id() {
      return this.$options.name + this._uid
    },
    trading() {
      return this.fund.rebalance.state === 'Trading'
    },
    heightInPx() {
      return this.height + 'px'
    },
    inputHeight() {
      return 105
    },
    totalSectionHeight() {
      return 50
    },
    rebalanceInfoBarHeight() {
      const h = 90
      return h
    },
    rebalanceInfoBarHeightInPx() {
      return this.rebalanceInfoBarHeight + 'px'
    },
    tokenListHeight() {
      let h = this.height - 40
      h -= this.trading ? this.inputHeight : 0
      h -= this.rebalanceInfoBarHeight
      h -= this.totalSectionHeight
      return h
    },
    tokenListStyles() {
      const firstColWidth = 22
      const otherColsWidth = (100 - firstColWidth) / (this.trading ? 3 : 2)
      const widths = {
        firstCol: `min-width: ${firstColWidth}%; width: ${firstColWidth}%`,
        otherCols: `min-width: ${otherColsWidth}%; width: ${otherColsWidth}%`
      }
      const styles = {
        asset: {
          header: 'Asset',
          style: `${widths.firstCol}; xbackground-color: yellow`
        },
        quantity: {
          header: this.trading ? 'Send' : 'Quantity In',
          style: `${widths.otherCols}; xbackground-color: pink`,
          key: 'sendQuantity'
        },
        quantity2: {
          header: this.trading ? 'Receive' : 'Quantity Out',
          style: `${widths.otherCols}; xbackground-color: blue`,
          key: 'receiveQuantity'
        }
      }
      if (this.trading) {
        styles.wallet = {
          header: 'Wallet',
          style: `${widths.otherCols}; xbackground-color: orange`
        }
      }
      return styles
    },
    rebalanceCompleted() {
      return this.remainingTokens.eq(0)
    },
    noOfTokensMin() {
      return new BigNumber(0.0000000001) // This should be the min. investible qty
    },
    noOfTokensMax() {
      const totalSupply = this.fund.totalNoOfTokens
      if (totalSupply.eq(0)) {
        return new BigNumber(0)
      }

      const maxTradeable = this.maxTradeable
      if (maxTradeable.eq(0)) {
        return new BigNumber(0)
      }

      // The smallest among remainingTokens, totalSupply and maxTradeable
      return BigNumber.minimum(this.remainingTokens, totalSupply, maxTradeable)
    },
    noOfTokensPrice() {
      return this.fund.currentPrice().times(this.noOfTokens)
    },
    remainingTokens() {
      return this.fund.rebalance.maxTradedFundTokens.minus(this.fund.rebalance.tradedFundTokens)
    },
    /**
     * How much the user can rebalance with his wallet
     */
    maxTradeable() {
      if (this.fund.rebalance.in.assets.length == 0) {
        return BigNumber(0)
      }

      let min = new BigNumber(Infinity)
      let minSymbol = ''
      this.fund.rebalance.in.assets.forEach((a) => {
        if (a.unitQuantity.lt(min)) {
          min = a.unitQuantity
          minSymbol = a.symbol
        }
      })

      const assetDef = this.$store.getters.getAssetBySymbol(minSymbol)
      if (assetDef.balance.wallet.eq(0)) {
        // User cannot rebalance anything
        return BigNumber(0)
      }

      const maxNoOfTokensToRebalance = assetDef.balance.wallet.div(min)

      return maxNoOfTokensToRebalance
    },
    earning() {
      const n = this.noOfTokens.gt(0) ? this.noOfTokens : 1
      return this.totals.out.minus(this.totals.in).times(n)
    },
    operationAllowed() {
      // console.log(
      //   'operationAllowed',
      //   this.workInProgress,
      //   !this.trading,
      //   this.rebalanceCompleted,
      //   this.balanceErrors > 0,
      //   this.computeStatus < 2
      // )
      if (
        this.workInProgress ||
        !this.trading ||
        this.rebalanceCompleted ||
        this.balanceErrors > 0 ||
        this.computeStatus < 2
      ) {
        return false
      }

      return this.noOfTokens.gt(0) && this.noOfTokensMax.gte(this.noOfTokens)
    },
    buttonErrorMessage() {
      if (!this.connector || !this.isConnected) {
        return 'Wallet not connected'
      } else if (!this.isNetworkValid) {
        return 'Wrong network'
      } else if (!this.trading) {
        return `Rebalance in ${this.fund.rebalance.state} state`
      } else if (this.rebalanceCompleted) {
        return 'No more tokens to rebalance'
      } else if (this.noOfTokens.gt(0) && this.noOfTokens.gt(this.noOfTokensMax)) {
        return `Cannot rebalance more than ${this.noOfTokensMax.toString()} tokens`
      } else if (this.balanceErrors > 0) {
        return 'No allowance for some assets'
      }
      return undefined
    },
    showRebalanceInfo() {
      return (
        this.fund.canRebalance &&
        this.fund.rebalance.state !== 'Error' &&
        this.fund.rebalance.state !== 'Regular'
      )
    }
  },
  watch: {
    fund(f) {
      this.reset()
    },
    activated(v) {
      if (!v) {
        this.reset()
      }
    }
  },
  beforeCreate() {},
  created() {
    // console.time(this.$options.name + '.created')
    this.initializeTokens()
    // console.timeEnd(this.$options.name + '.created')
  },
  beforeMount() {},
  mounted() {
    $('#infoProfitLoss').popup()
    // this.cacheCompute(this.fund)
  },
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    formatQuantity(n) {
      if (isNaN(n)) return '-'
      let s

      if (n >= 1000000) {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.[000]a')
      } else {
        let precision
        if (n < 100000) {
          precision = '0'.repeat(6)
        } else if (n < 1000000) {
          precision = '0'.repeat(5)
        }
        s = numeral(n).format(`0,0.[${precision}]`)
      }
      return s == 'NaN' ? '0' : s
    },
    formatPrice(n, fmt = '0,0', limit = 1000000) {
      if (isNaN(n)) return '-'

      let s
      // numeral returns NaN for numbers with precision less than 10^-6
      if (Math.abs(n) < 0.000001) {
        s = '$0'
      } else if (n < 1000000) {
        s = numeral(n).format('$0,0.[00]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('$0,0.00a')
      }

      return s == 'NaN' ? '$0' : s
    },
    reset() {
      this.initializeTokens().then(() => {
        this.prevNoOfTokens = undefined
        this.bigNumberInputValue = new BigNumber(0)
        this.wrongInput = undefined
        this.noOfTokensChanged(new BigNumber(0), 'watch-fund')
        // this.cacheCompute(f)
      })
    },
    initializeTokens() {
      // this.log(this.$options.name,'initializeTokens')

      if (!this.connector || !this.isConnected || !this.isNetworkValid) {
        // I probably need to watch for the connection to become valid and trigger a reset()
        return Promise.resolve('not connected / wrong network')
      }

      let totalIn = new BigNumber(0)
      let totalOut = new BigNumber(0)

      const promises = []

      const toSend = this.fund.rebalance.in.assets.map((a) => {
        const assetDef = this.$store.getters.getAssetBySymbol(a.symbol)

        totalIn = totalIn.plus(a.unitQuantity.times(assetDef.price))

        const assetApi = this.$store.getters.getAssetApiByContract(assetDef.contract)
        promises.push(
          assetApi.getAllowanceForModule(
            this.$store.state.currentAccount.address,
            Module.DextfTradeModule
          )
        )

        return {
          address: assetDef.contract,
          symbol: a.symbol,
          image: assetDef.image,
          unitQuantity: a.unitQuantity,
          sendQuantity: a.unitQuantity,
          receiveQuantity: new BigNumber(0),
          price: assetDef.price.toString(),
          balance: assetDef.balance.wallet,
          authorized: new BigNumber(0),
          balanceError: assetDef.balance.wallet.eq(0),
          in: true
        }
      })

      const toReceive = this.fund.rebalance.out.assets.map((a) => {
        const assetDef = this.$store.getters.getAssetBySymbol(a.symbol)

        totalOut = totalOut.plus(a.unitQuantity.times(assetDef.price))

        return {
          address: assetDef.contract,
          symbol: a.symbol,
          image: assetDef.image,
          unitQuantity: a.unitQuantity,
          sendQuantity: new BigNumber(0),
          receiveQuantity: a.unitQuantity,
          price: assetDef.price.toString(),
          balance: assetDef.balance.wallet,
          authorized: new BigNumber(0),
          balanceError: false,
          in: false
        }
      })

      return new Promise((resolve, reject) => {
        Promise.all(promises).then((results) => {
          results.forEach((r, i) => {
            // console.log(toSend[i].symbol, 'allowance', r.data.allowance.toString())
            toSend[i].authorized = r.data.allowanceUnlimited
              ? new BigNumber(Infinity)
              : r.data.allowance
          })

          this.totals.in = totalIn
          this.totals.out = totalOut

          this.tokens = toSend.concat(toReceive)

          resolve(this.tokens.length)
        })
      })
    },
    setDimmer(show, closable = false, msg = {}) {
      this.$emit('setDimmer', { show, closable, msg })
    },
    noOfTokensChanged(noOfTokens, caller = '?') {
      /*
      this.log(
        `noOfTokensChanged(noOfTokens, ${caller})`,
        typeof noOfTokens,
        typeof noOfTokens === 'object' ? noOfTokens.toString() : noOfTokens
      )
      */
      if (!noOfTokens) {
        this.noOfTokens = new BigNumber(0)
      } else {
        // this.noOfTokens = noOfTokens
        this.noOfTokens = new BigNumber(noOfTokens)
      }

      this.computeStatus = 0
      this.refreshInOutQuantities()
    },
    setMax() {
      if (this.workInProgress || !this.connector || !this.isConnected || !this.isNetworkValid) {
        return
      }

      this.computeStatus = 0
      this.bigNumberInputValue = new BigNumber(this.noOfTokensMax)
      this.noOfTokensChanged(this.noOfTokensMax)
    },
    refreshInOutQuantities() {
      // this.log('refreshInOutQuantities', this.noOfTokens.toString())
      this.wrongInput = this.validateNoOfTokens()

      if (this.noOfTokens.eq(this.prevNoOfTokens)) {
        // this.log('no change', this.noOfTokens.toString(), this.prevNoOfTokens.toString())
        return
      }

      this.prevNoOfTokens = new BigNumber(this.noOfTokens)

      if (this.computeStatus !== 0) {
        this.log('already computing/computed')
        return
      }

      if (this.workInProgress) {
        this.log('Work in progress')
        return
      }

      if (!this.connector || !this.isConnected || !this.isNetworkValid) {
        this.log('not connected / wrong network')
        return
      }

      if (this.tokens.length > 0) {
        this.computeStatus = 1
        this.evalInOutQuantities(this.noOfTokens.eq(0))
      }
    },
    validateNoOfTokens() {
      // console.log('validateNoOfTokens', this.noOfTokens)

      if (this.noOfTokens.gt(0)) {
        if (this.noOfTokens.lt(this.noOfTokensMin)) {
          return `Min ${this.noOfTokensMin}`
        }

        if (this.noOfTokens.gt(this.noOfTokensMax)) {
          return this.noOfTokensMax.gt(0) ? `Max ${this.noOfTokensMax.toString()}` : 'No allowance'
        }
      }

      return undefined
    },
    evalInOutQuantities(reset = false) {
      if (this.tokens.length == 0) return

      if (!this.fund.canRebalance) return

      let balanceErrors = 0
      let noOfTokens = reset ? new BigNumber(1) : this.noOfTokens

      const dextfTradeApi = this.connector.dextfTradeApi
      dextfTradeApi
        .computeInboundOutboundComponents(this.fund.address, noOfTokens)
        .then((result) => {
          /*
          console.log(
            result.data.inboundComponents.reduce(
              (a, v) => a + ', ' + v.componentAddress + ` (${v.position})`,
              'inboundComponents'
            )
          )*/

          result.data.inboundComponents.forEach((c) => {
            const token = this.tokens.find((t) => t.address == c.componentAddress)
            if (token) {
              token.sendQuantity = c.position
              token.balanceError = token.sendQuantity.gt(token.balance)
              if (token.balanceError) balanceErrors++
            } else {
              console.warn(
                'Cannot find inboud conmponent',
                this.fund.symbol,
                this.tokens.length,
                c.componentAddress,
                c.position
              )
            }
          })

          /*
          console.log(
            result.data.outboundComponents.reduce(
              (a, v) => a + ', ' + v.componentAddress + ` (${v.position})`,
              'outboundComponents'
            )
          )
          */
          result.data.outboundComponents.forEach((c) => {
            const token = this.tokens.find((t) => t.address == c.componentAddress)
            if (token) {
              token.receiveQuantity = c.position
              token.balanceError = false
              if (token.balanceError) balanceErrors++
            } else {
              console.warn(
                'Cannot find outboud conmponent',
                this.fund.symbol,
                this.tokens.length,
                c.componentAddress,
                c.position
              )
            }
          })
        })
        .finally(() => {
          this.balanceErrors = balanceErrors
          this.computeStatus = 2
        })
    },
    performOperation() {
      this.authorizeAndRebalance()
    },
    async authorizeAndRebalance() {
      this.log(this.$options.name, 'authorizeAndRebalance')

      const tokensRequiringApproval = this.tokens.filter((token) => {
        /*
        console.log(
          token.symbol,
          token.authorized.toString(),
          token.sendQuantity.toString(),
          token.authorized.lt(token.sendQuantity)
        )
        */
        return token.in && token.authorized.lt(token.sendQuantity)
      })

      let success = true

      if (tokensRequiringApproval.length > 0) {
        success = await this.authorize(tokensRequiringApproval)
      }

      if (success) {
        this.rebalance(tokensRequiringApproval.length > 0)
      }
    },
    /**
     * Approve the transfer of a certain amount of crypto tokens from the wallet to the proxy.
     */
    async authorize(tokensRequiringApproval) {
      this.log(this.$options.name, 'authorize')

      if (this.workInProgress) {
        this.log('Work in progress')
        return false
      }

      if (!this.isConnected) {
        this.log('not connected')
        return false
      }

      if (tokensRequiringApproval.length == 0) {
        return true
      }

      const header = 'STEP 1/2 - Asset transfer authorization'
      let errorMessages = []
      let subHeaders = []

      subHeaders.push(
        `Please accept ${tokensRequiringApproval.length} authorization transaction${
          tokensRequiringApproval.length > 1 ? 's' : ''
        } in MetaMask...`
      )
      subHeaders.push('')
      tokensRequiringApproval.forEach((token) =>
        subHeaders.push(
          `- ${token.symbol} spending authorization`
          // `- ${token.sendQuantity} ${token.symbol} spending authorization`
        )
      )

      let msg = {
        type: '',
        header,
        subHeaders: subHeaders
      }

      this.setDimmer(true, false, msg)

      this.$store.dispatch('setWorkInProgress', true)

      let transactions = []
      for (let i = 0; i < tokensRequiringApproval.length; i++) {
        const token = tokensRequiringApproval[i]
        const assetApi = this.$store.getters.getAssetApiByContract(token.address)
        const response = await assetApi.approveForModule(
          token.sendQuantity,
          true, // unlimited
          Module.DextfTradeModule
        )

        if (response.errors.length > 0) {
          response.errors.forEach((e) =>
            errorMessages.push(`${token.symbol} spending authorization: ${e.message.message}`)
          )
          transactions = []
          break
        } else {
          transactions.push(response.data.contractTransaction.hash)
        }
      }

      if (errorMessages.length == 0) {
        // Check transactions' statuses

        const totalTimeoutInMillis = 30 * 60 * 1000 // 30 mins
        const promises = []
        subHeaders = []

        subHeaders.push(
          `Processing ${tokensRequiringApproval.length} authorization transaction${
            tokensRequiringApproval.length > 1 ? 's' : ''
          }`
        )
        subHeaders.push('')

        let i = 0
        transactions.forEach((tx) => {
          const token = tokensRequiringApproval[i++]
          promises.push(this.connector.waitForTransaction(tx, 1, totalTimeoutInMillis))
          subHeaders.push(`${token.symbol} authorization: ${tx}`)
        })

        // subHeaders.push('Processing the authorization transactions')
        subHeaders.push('')
        subHeaders.push('Do not change any transaction in MetaMask')
        subHeaders.push('Do not close the window')
        subHeaders.push('')
        subHeaders.push('Please wait...')

        msg = {
          type: '',
          header,
          // header: 'Processing the authorization transactions',
          subHeaders: subHeaders
        }
        this.setDimmer(true, false, msg)

        errorMessages = []

        await Promise.allSettled(promises).then((values) => {
          this.log('Transfer Authorization transactions - completed', values)

          values.forEach((v) => {
            if (v.status == 'fulfilled') {
              this.log(v.status, v.value)
              const statusResult = v.value

              if (statusResult.errors.length == 0) {
                // 0 means reverted
                if (statusResult.data.transactionReceipt.status == 0) {
                  this.log(`Transfer Authorization ${transactionAddress} reverted`)

                  errorMessages.push(`Transfer Authorization ${transactionAddress} reverted`)
                }
              } else {
                statusResult.errors.forEach((logMessage) =>
                  errorMessages.push(logMessage.message.message)
                )
                this.log('Transfer authorization errors:', errorMessages)
              }
            } else {
              this.log(v.status, v.reason)

              errorMessages.push(v.reason)
            }
          })
        })
      }

      if (errorMessages.length == 0) {
        // Need to re-compute the component amounts to have the new authorized amounts
        this.refreshInOutQuantities()
        this.setDimmer(false)
        // this.triggerGAEvent('invest_wallet_authorize_success')
      } else {
        msg = {
          type: 'error',
          header,
          subHeaders: ['Oops, something went wrong during the transfer authorization'],
          lines: errorMessages
        }

        this.setDimmer(true, true, msg)
        // this.triggerGAEvent('invest_wallet_authorize_error')
      }

      this.$store.dispatch('setWorkInProgress', false)

      return errorMessages.length == 0
    },
    /**
     * Rebalance fund tokens.
     */
    async rebalance(cascade) {
      this.log(this.$options.name, 'rebalance')

      if (this.workInProgress) {
        this.log('Work in progress')
        return
      }

      if (!this.isConnected) {
        this.log('not connected')
        return
      }

      const header = `${cascade ? 'STEP 2/2 - ' : ''}Rebalance ${this.noOfTokens} token${
        this.noOfTokens.gt(1) ? 's' : ''
      } of ${this.fund.symbol}`
      let msg = {
        type: '',
        header,
        subHeaders: ['Please accept the transaction in MetaMask...']
      }

      this.setDimmer(true, false, msg)

      this.$store.dispatch('setWorkInProgress', true)

      var result

      try {
        const dextfTradeApi = this.connector.dextfTradeApi
        result = await dextfTradeApi.performTrade(this.fund.address, this.noOfTokens)
      } catch (rebalanceFundError) {
        console.error('rebalanceFundError', rebalanceFundError)

        msg = {
          type: 'error',
          header,
          subHeaders: ['Oops, something went wrong (1/6)'],
          lines: [rebalanceFundError]
        }
        this.setDimmer(true, true, msg)

        this.$store.dispatch('setWorkInProgress', false)

        // this.triggerGAEvent('invest_wallet_error')
        return
      }

      // this.log(result)

      if (result.errors.length == 0) {
        const transactionAddress = result.data.contractTransaction.hash

        // console.log('transactionAddress', transactionAddress)

        msg = {
          type: '',
          header,
          subHeaders: [
            `Processing transaction: ${transactionAddress}`,
            '',
            'Do not change the transaction in MetaMask',
            'Do not close the window',
            '',
            'Please wait...'
          ]
        }
        this.setDimmer(true, false, msg)

        // Check transaction status
        const totalTimeoutInMillis = 30 * 60 * 1000 // 30 mins

        const txStatusResponse = await this.connector.waitForTransaction(
          transactionAddress,
          1,
          totalTimeoutInMillis
        )

        if (txStatusResponse.errors.length == 0) {
          // 0 means reverted
          if (txStatusResponse.data.transactionReceipt.status == 0) {
            this.log(`Rebalance transaction ${transactionAddress} reverted`)
            msg = {
              type: 'error',
              header,
              subHeaders: ['Oops, something went wrong (2/6)'],
              lines: [`Transaction ${transactionAddress} reverted`]
            }
            this.setDimmer(true, true, msg)

            this.$store.dispatch('setWorkInProgress', false)

            // this.triggerGAEvent('invest_wallet_error')
          } else {
            // This causes the refresh of Funds' and Assets' balances
            this.$store
              .dispatch('setCurrentAccount', this.$store.state.currentAccount.address)
              .then(() =>
                this.$store
                  .dispatch('updateRebalanceInfo', this.fund.symbol)
                  .then(() => this.refreshInOutQuantities())
              )

            msg = {
              type: 'ok',
              header,
              subHeaders: ['Rebalance completed', '', `Transaction ${transactionAddress}`]
            }
            this.setDimmer(true, true, msg)

            // This causes the refresh of Funds' and Assets' balances
            this.$store.dispatch('setCurrentAccount', this.$store.state.currentAccount.address)

            this.$store.dispatch('setWorkInProgress', false)

            // this.triggerGAEvent('invest_wallet_success')

            this.prevNoOfTokens = undefined
            this.bigNumberInputValue = new BigNumber(0)
            this.wrongInput = undefined
            this.noOfTokensChanged(undefined, 'issueFund')
          }
        } else {
          const errorMessages = txStatusResponse.errors.map(
            (logMessage) => logMessage.message.message
          )
          this.log('Failure to check transaction', transactionAddress, errorMessages)

          msg = {
            type: 'error',
            header,
            subHeaders: ['Oops, something went wrong (4/6)'],
            lines: errorMessages
          }
          this.setDimmer(true, true, msg)

          this.$store.dispatch('setWorkInProgress', false)

          // this.triggerGAEvent('invest_wallet_error')
        }
      } else {
        const errorMessages = result.errors.map((logMessage) => logMessage.message.message)
        console.error('Errors are present:', result, errorMessages)

        msg = {
          type: 'error',
          header,
          subHeaders: ['Oops, something went wrong (6/6)'],
          lines: errorMessages
        }
        this.setDimmer(true, true, msg)

        this.$store.dispatch('setWorkInProgress', false)

        // this.triggerGAEvent('invest_wallet_error')
      }
    }
  }
}
</script>
    
<style scoped>
</style>