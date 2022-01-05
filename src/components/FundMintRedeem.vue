<template>
  <div>
    <div
      class="ui attached segment"
      style="padding-left: 32px; padding-right: 32px"
      :style="{ height: heightInPx }"
    >
      <form class="ui form">
        <fieldset
          :disabled="workInProgress || !connector || !isConnected || !isNetworkValid"
          style="margin: 0; padding: 0; border-style: none"
        >
          <div
            class="ui segment"
            style="border-radius: 8px; padding: 7px 0 7px 0; background-color: #2a2a2a"
          >
            <a
              class="ui right corner label"
              style="border-color: transparent !important"
              href="https://dextf.notion.site/Mint-and-Redeem-XTF2-4b0e75235cdd4aef83403bc3212a7124"
              target="wiki"
            >
              <i class="circular colored question small icon primary"></i>
            </a>
            <table style="width: 100%">
              <tr>
                <td style="width: 100%; xbackground-color: green">
                  <div class="field">
                    <label class="_muted" style="font-weight: normal; margin: 0 0 0 18px">
                      {{ action }}
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
                        id="mint-redeem-input"
                        @changed="noOfTokensChanged($event, 'BigNumberInput')"
                        style="
                          padding: 0 9px 0 18px;
                          font-size: 27px;
                          font-weight: 600;
                          background-color: transparent;
                          border-radius: 0;
                          width: 100%;
                          xbackground-color: red;
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
                    <label class="_muted" style="font-weight: normal; margin: 0 0 0 18px">
                      ${{ format(noOfTokensPrice, '0,0.[00]') }}
                    </label>
                  </div>
                </td>
                <td
                  class="right floated right aligned"
                  style="
                    white-space: nowrap;
                    padding-top: 1.8rem;
                    padding-right: 14px;
                    xbackground-color: yellow;
                  "
                >
                  <Token class="_muted" :image="fund.image" :label="fund.symbol" />
                  <div v-if="!isMint && fund.balance.gt(0)" style="padding-right: 0.1rem">
                    <span
                      style="text-decoration: underline; cursor: pointer"
                      @click="setMax()"
                      :data-tooltip="`Redeem all your ${fund.symbol}`"
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

          <div class="ui horizontal divider dark middle">
            <img
              :src="imageSource"
              :class="{ _pointer: !workInProgress }"
              style="width: 3.7rem; margin-top: 0.8rem"
              :style="{
                filter: workInProgress ? 'brightness(80%)' : 'none'
              }"
              @click="!workInProgress && toggle()"
            />
          </div>

          <TokenList
            :parent-id="id"
            :tokens="tokens"
            :styles="tokenListStyles"
            :format-quantity="formatQuantity"
            :format-wallet="formatWallet"
            :show-full-name="false"
            :font-size="'smaller'"
            :max-height="tokenListHeight"
          />
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
        :class="{ disabled: !operationAllowed }"
        style="margin: 0 1px; border-bottom-left-radius: 12px; border-bottom-right-radius: 12px"
        @click="performOperation()"
      >
        {{ operation }}
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
import axios from 'axios'
import numeral from 'numeral'
import BigNumber from 'bignumber.js'
import { Module } from '@helium'

import { blockchainMixin } from '../mixins/blockchainMixin.js'

import Token from './Token.vue'
import TokenList from './TokenList.vue'
import BigNumberInput from './BigNumberInput.vue'

export default {
  name: 'FundMintRedeem',
  components: { Token, TokenList, BigNumberInput },
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
    heightInPx() {
      return this.height + 'px'
    },
    inputHeight() {
      return 105
    },
    dividerToggleButtonHeight() {
      const h = 90
      return h
    },
    tokenListHeight() {
      let h = this.height - 5
      h -= this.inputHeight
      h -= this.dividerToggleButtonHeight
      return h
    },
    tokenListStyles() {
      return {
        asset: {
          header: 'Asset',
          style: 'width: 100%; xbackground-color: yellow'
        },
        allocation: {
          header: 'Allocation',
          style: 'min-width: 60px; xbackground-color: blue'
        },
        quantity: {
          header: 'Qty',
          style: 'min-width: 90px; xbackground-color: pink'
        },
        wallet: {
          header: 'Wallet',
          style: 'min-width: 90px; xbackground-color: orange'
        }
      }
    },
    noOfTokensMin() {
      return new BigNumber(0.0000000001) // This should be the min. investible qty
    },
    noOfTokensMax() {
      return this.fund.balance
    },
    noOfTokensPrice() {
      return this.fund.currentPrice().times(this.noOfTokens)
    },
    action() {
      return this.isMint ? 'Receive' : 'Send'
    },
    operation() {
      return this.isMint ? 'Mint' : 'Redeem'
    },
    operationAllowed() {
      if (this.workInProgress || this.computeStatus < 2) {
        return false
      }

      if (this.isMint) {
        return this.noOfTokens.gt(0) && this.balanceErrors == 0
      } else {
        /*
        console.log(
          this.noOfTokens.toString(),
          this.fund.balance.toString(),
          this.fund.balance.gt(this.noOfTokens)
        )
        */
        return this.noOfTokens.gt(0) && this.fund.balance.gte(this.noOfTokens)
      }
    },
    buttonErrorMessage() {
      if (!this.connector || !this.isConnected) {
        return 'Wallet not connected'
      } else if (!this.isNetworkValid) {
        return 'Wrong network'
      }
      return undefined
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
    this.toggle()
    // console.timeEnd(this.$options.name + '.created')
  },
  beforeMount() {},
  mounted() {
    this.cacheCompute(this.fund)
  },
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    formatQuantity(n) {
      if (isNaN(n)) return '-'
      let s
      if (n < 100000) {
        s = numeral(n).format('0,0.[00000]')
      } else if (n < 1000000) {
        s = numeral(n).format('0,0.[0000]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.[0000]a')
      }
      return s == 'NaN' ? '0' : s
    },
    formatWallet(n) {
      if (isNaN(n)) return '-'
      let s
      if (n < 100000) {
        s = numeral(n).format('0,0.[00000]')
      } else if (n < 1000000) {
        s = numeral(n).format('0,0.[0000]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.[0000]a')
      }
      return s == 'NaN' ? '0' : s
    },
    format(n, fmt = '0,0', limit = 1000000) {
      if (isNaN(n)) return '-'

      // numeral returns NaN for numbers with precision less than 10^-6
      if (Math.abs(n) < 0.000001) {
        return numeral(0).format(fmt)
      }

      let s
      if (n < limit) {
        s = numeral(n).format(fmt)
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.[00]a')
      }
      return s == 'NaN' ? '0' : s
    },
    reset() {
      this.initializeTokens()
      this.prevNoOfTokens = undefined
      this.bigNumberInputValue = new BigNumber(0)
      this.wrongInput = undefined
      this.noOfTokensChanged(new BigNumber(0), 'watch-fund')
      // this.cacheCompute(f)
    },
    initializeTokens() {
      this.tokens = this.fund.allocation.current.assets.map((a) => {
        const assetDef = this.$store.getters.getAssetBySymbol(a.symbol)
        return {
          symbol: a.symbol,
          address: assetDef.contract,
          percentage: a.percentage,
          price: a.price.toString(),
          image: assetDef.image,
          quantity: new BigNumber(0),
          balance: assetDef.balance.wallet,
          required: new BigNumber(0),
          authorized: new BigNumber(0),
          balanceError: false
        }
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
      this.computeComponentAmounts()
    },
    setMax() {
      if (this.workInProgress || !this.connector || !this.isConnected || !this.isNetworkValid) {
        return
      }

      this.computeStatus = 0
      this.bigNumberInputValue = new BigNumber(this.noOfTokensMax)
      this.noOfTokensChanged(this.noOfTokensMax)
    },
    computeComponentAmounts() {
      // this.log('computeComponentAmounts', this.noOfTokens.toString())
      this.wrongInput = this.validateNoOfTokens()

      if (this.noOfTokens.eq(this.prevNoOfTokens)) {
        // this.log('no change', this.noOfTokens.toString(), this.prevNoOfTokens.toString())
        return
      }

      this.prevNoOfTokens = new BigNumber(this.noOfTokens)

      if (this.noOfTokens.eq(0)) {
        this.resetAllRequiredAmounts()
        return
      }

      if (this.computeStatus !== 0) {
        this.log('already computing/computed')
        return
      }

      if (this.workInProgress) {
        this.log('Work in progress')
        return
      }

      if (!this.connector || !this.isConnected || !this.isNetworkValid) {
        this.log('not connected')
        return
      }

      this.computeStatus = 1

      // Keep the following commented or the field will loose the focus, and the user cannot continue typing
      // this.$store.dispatch('setWorkInProgress', true)

      try {
        const fundApi = this.$store.getters.getFundApiByContract(this.fund.address)
        fundApi
          .getRequiredAllowanceForIssue(this.noOfTokens)
          .then((result) => {
            // console.log(result)

            if (result.errors.length == 0) {
              this.balanceErrors = 0

              const promises = []
              for (let i = 0; i < result.data.components.length; i++) {
                const address = result.data.components[i]

                const assetApi = this.$store.getters.getAssetApiByContract(address)
                promises.push(
                  assetApi.getAllowanceForModule(
                    this.$store.state.currentAccount.address,
                    Module.IssuanceModule
                  )
                )
              }

              Promise.all(promises)
                .then((allowances) => {
                  // console.log(allowances)

                  for (let i = 0; i < result.data.components.length; i++) {
                    const address = result.data.components[i]

                    const assetDef = this.$store.getters.getAssetByContract(address)
                    const token = this.tokens.find((t) => {
                      if (t.address == address) {
                        return true
                      } else if (t.address.toLowerCase() == address.toLowerCase()) {
                        console.warn(t.symbol, t.address, '<>', address)
                        return true
                      }
                      return false
                    })

                    if (assetDef && token) {
                      // Update required and authorized fields
                      // (they are reactive, so they will trigger the change event)
                      const quantity = result.data.tokens[i]
                      token.required = new BigNumber(quantity)

                      const currentAllowance = allowances[i]
                      // console.log(
                      //   token.symbol,
                      //   'allowance',
                      //   currentAllowance.data.allowance.toNumber(),
                      //   'allowanceUnlimited',
                      //   currentAllowance.data.allowanceUnlimited
                      // )

                      token.authorized = currentAllowance.data.allowanceUnlimited
                        ? new BigNumber(Infinity)
                        : currentAllowance.data.allowance

                      token.balanceError = this.isMint && token.required.gt(assetDef.balance.wallet)
                      if (token.balanceError) this.balanceErrors++
                    } else {
                      console.warn('Unexpected asset with address', address)
                    }
                  }
                })
                .catch((error) => {
                  console.error('error', error)
                })
                .finally(() => {
                  this.computeStatus = 2
                })
            } else {
              const errorMessages = result.errors.map((logMessage) => logMessage.message.message)
              console.error('Errors are present:', errorMessages)
              this.computeStatus = 2
            }
          })
          .catch((error) => {
            console.error('error', error)
            this.computeStatus = 2
          })
      } catch (error) {
        console.error('error', error)
        this.computeStatus = 2
      }
    },
    validateNoOfTokens() {
      // console.log('validateNoOfTokens', this.noOfTokens)

      if (this.noOfTokens.gt(0)) {
        if (this.noOfTokens.lt(this.noOfTokensMin)) {
          return `Min ${this.noOfTokensMin}`
        }

        if (!this.isMint && this.noOfTokens.gt(this.noOfTokensMax)) {
          return this.noOfTokensMax.gt(0) ? `Max ${this.noOfTokensMax.toString()}` : 'No allowance'
        }
      }

      return undefined
    },
    resetAllRequiredAmounts() {
      this.balanceErrors = 0
      this.tokens.forEach((token) => {
        token.required = new BigNumber(0.0)
        token.balanceError = false
      })
    },
    evalFundRequiredAmounts() {
      this.balanceErrors = 0
      this.tokens.forEach((token) => {
        const assetDef = this.$store.getters.getAssetBySymbol(token.symbol)
        token.balanceError = this.isMint ? token.required.gt(assetDef.balance.wallet) : false
        if (token.balanceError) this.balanceErrors++
      })
    },
    cacheCompute(fund) {
      // This is to trigger the internal tokenStore caching (token details)
      if (fund.symbol && fund.launched) {
        const fundApi = this.$store.getters.getFundApiByContract(fund.address)
        fundApi.getRequiredAllowanceForIssue(new BigNumber(1)).then((result) => {
          // console.log('CACHED')
        })
      }
    },
    toggle() {
      this.isMint = !this.isMint
      this.imageSource = `/images/buttons/arrow${this.isMint ? 'Up' : 'Down'}.svg`
      this.$emit('toggledToMint', this.isMint)

      this.wrongInput = this.validateNoOfTokens()
      this.evalFundRequiredAmounts()
    },
    performOperation() {
      if (this.isMint) {
        this.authorizeAndMint()
      } else {
        this.redeem()
      }
    },
    async authorizeAndMint() {
      this.log(this.$options.name, 'mint')

      const tokensRequiringApproval = this.tokens.filter((token) => {
        /*
        console.log(
          'authorizeAndMint',
          token.symbol,
          token.authorized.toString(),
          token.required.toString(),
          token.authorized.lt(token.required)
        )
        */
        return token.authorized.lt(token.required)
      })

      let success = true

      if (tokensRequiringApproval.length > 0) {
        success = await this.authorize(tokensRequiringApproval)
      }

      if (success) {
        this.mint(tokensRequiringApproval.length > 0)
      }
    },
    /**
     * Redeem fund tokens.
     */
    async redeem() {
      this.log(this.$options.name, 'redeem')

      if (this.workInProgress) {
        this.log('Work in progress')
        return
      }

      if (!this.isConnected) {
        this.log('not connected')
        return
      }

      const header = `Redeem ${this.noOfTokens} token${this.noOfTokens.gt(1) ? 's' : ''} of ${
        this.fund.symbol
      }`
      let msg = {
        type: '',
        header,
        subHeaders: ['Please accept the transaction in MetaMask...']
      }
      this.setDimmer(true, false, msg)

      this.$store.dispatch('setWorkInProgress', true)

      var result

      try {
        const fundApi = this.$store.getters.getFundApiByContract(this.fund.address)
        result = await fundApi.redeemFund(this.noOfTokens, this.$store.state.currentAccount.address)
      } catch (redeemSetError) {
        console.error('redeemSetError', redeemSetError)

        msg = {
          type: 'error',
          header,
          subHeaders: ['Oops, something went wrong (1/6)'],
          lines: [redeemSetError]
        }
        this.setDimmer(true, true, msg)

        this.$store.dispatch('setWorkInProgress', false)

        this.triggerGAEvent('redeem_wallet_error')
        return
      }

      // this.log(result)

      if (result.errors.length == 0) {
        const transactionAddress = result.data.contractTransaction.hash

        // console.log('transactionAddress', transactionAddress)

        // Lightest payload, strip out everything unnecessary
        const fundPayload = {
          symbol: this.fund.symbol,
          address: this.fund.address,
          wallet: this.$store.state.currentAccount.address,
          trade: {
            transaction: transactionAddress,
            noOfTokens: this.noOfTokens.toString(),
            mode: { source: 'wallet-transfer' }
          }
        }

        // Let's start the 2-phase commit

        // 1) Send immediately the transaction to the server
        axios
          .post(this.$store.state.APIs.redeemFund, {
            userId: this.$store.state.user.userId,
            fund: fundPayload
          })
          .then(async (redeem1Response) => {
            this.log('Transaction stored in DB:', redeem1Response.data)

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
                this.log(`Redeem transaction ${transactionAddress} reverted`)
                msg = {
                  type: 'error',
                  header,
                  subHeaders: ['Oops, something went wrong (2/6)'],
                  lines: [`Transaction ${transactionAddress} reverted`]
                }
                this.setDimmer(true, true, msg)

                this.$store.dispatch('setWorkInProgress', false)

                this.triggerGAEvent('redeem_wallet_error')
              } else {
                this.$store.dispatch('updateFundBalance', this.fund.symbol)

                fundPayload.trade.confirmationTimestamp = new Date().toISOString()

                // 2) Send the transaction's completion time to the server
                axios
                  .post(this.$store.state.APIs.redeemFund, {
                    userId: this.$store.state.user.userId,
                    fund: fundPayload
                  })
                  .then((redeem2Response) => {
                    this.log('redeemed and recorded')
                    msg = {
                      type: 'ok',
                      header,
                      subHeaders: ['Redemption completed', '', `Transaction ${transactionAddress}`]
                    }
                    this.setDimmer(true, true, msg)

                    // This causes the refresh of Funds' and Assets' balances
                    this.$store.dispatch(
                      'setCurrentAccount',
                      this.$store.state.currentAccount.address
                    )

                    this.$store.dispatch('setWorkInProgress', false)

                    this.triggerGAEvent('redeem_wallet_success')

                    this.prevNoOfTokens = undefined
                    this.bigNumberInputValue = new BigNumber(0)
                    this.wrongInput = undefined
                    this.noOfTokensChanged(undefined, 'redeemFund')
                  })
                  .catch((redeem2Error) => {
                    this.log('redeem2Error', redeem2Error)

                    msg = {
                      type: 'error',
                      header,
                      subHeaders: ['Oops, something went wrong (3/6)'],
                      lines: [redeem2Error]
                    }
                    this.setDimmer(true, true, msg)

                    this.$store.dispatch('setWorkInProgress', false)

                    this.triggerGAEvent('redeem_wallet_error')
                  })
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

              this.triggerGAEvent('redeem_wallet_error')
            }
          })
          .catch((redeem1Error) => {
            this.log('redeem1Error', redeem1Error)

            msg = {
              type: 'error',
              header,
              subHeaders: ['Oops, something went wrong (5/6)'],
              lines: [redeem1Error]
            }
            this.setDimmer(true, true, msg)

            this.$store.dispatch('setWorkInProgress', false)

            this.triggerGAEvent('redeem_wallet_error')
          })
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

        this.triggerGAEvent('redeem_wallet_error')
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
        subHeaders.push(`- ${token.required} ${token.symbol} spending authorization`)
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
          token.required,
          this.isAdmin || this.isAvalanche, // unlimited for admins
          Module.IssuanceModule
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
        this.computeComponentAmounts()
        this.setDimmer(false)
        this.triggerGAEvent('invest_wallet_authorize_success')
      } else {
        msg = {
          type: 'error',
          header,
          subHeaders: ['Oops, something went wrong during the transfer authorization'],
          lines: errorMessages
        }

        this.setDimmer(true, true, msg)
        this.triggerGAEvent('invest_wallet_authorize_error')
      }

      this.$store.dispatch('setWorkInProgress', false)

      return errorMessages.length == 0
    },
    /**
     * Mint fund tokens.
     */
    async mint(cascade) {
      this.log(this.$options.name, 'mint')

      if (this.workInProgress) {
        this.log('Work in progress')
        return
      }

      if (!this.isConnected) {
        this.log('not connected')
        return
      }

      const header = `${cascade ? 'STEP 2/2 - ' : ''}Mint ${this.noOfTokens} token${
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
        const fundApi = this.$store.getters.getFundApiByContract(this.fund.address)
        result = await fundApi.issueFund(this.noOfTokens, this.$store.state.currentAccount.address)
      } catch (issueFundError) {
        console.error('issueFundError', issueFundError)

        msg = {
          type: 'error',
          header,
          subHeaders: ['Oops, something went wrong (1/6)'],
          lines: [issueFundError]
        }
        this.setDimmer(true, true, msg)

        this.$store.dispatch('setWorkInProgress', false)

        this.triggerGAEvent('invest_wallet_error')
        return
      }

      // this.log(result)

      if (result.errors.length == 0) {
        const transactionAddress = result.data.contractTransaction.hash

        // console.log('transactionAddress', transactionAddress)

        // Lightest payload, strip out everything unnecessary
        let fundPayload = {
          symbol: this.fund.symbol,
          wallet: this.$store.state.currentAccount.address,
          trade: {
            transaction: transactionAddress,
            noOfTokens: this.noOfTokens.toString(),
            mode: { source: 'wallet/safe-transfer' }
          }
        }

        // Let's start the 2-phase commit

        // 1) Send immediately the transaction to the server
        axios
          .post(this.$store.state.APIs.issueFund, {
            userId: this.$store.state.user.userId,
            fund: fundPayload
          })
          .then(async (invest1Response) => {
            this.log('Transaction stored in DB:', invest1Response.data)

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
                this.log(`Mint transaction ${transactionAddress} reverted`)
                msg = {
                  type: 'error',
                  header,
                  subHeaders: ['Oops, something went wrong (2/6)'],
                  lines: [`Transaction ${transactionAddress} reverted`]
                }
                this.setDimmer(true, true, msg)

                this.$store.dispatch('setWorkInProgress', false)

                this.triggerGAEvent('invest_wallet_error')
              } else {
                this.$store.dispatch('updateFundBalance', this.fund.symbol)

                fundPayload = {
                  symbol: this.fund.symbol,
                  trade: {
                    transaction: transactionAddress,
                    confirmationTimestamp: new Date().toISOString()
                  }
                }

                // 2) Send the transaction's completion time to the server
                axios
                  .post(this.$store.state.APIs.issueFund, {
                    userId: this.$store.state.user.userId,
                    fund: fundPayload
                  })
                  .then((invest2Response) => {
                    this.log('invested and recorded')
                    msg = {
                      type: 'ok',
                      header,
                      subHeaders: ['Mint completed', '', `Transaction ${transactionAddress}`],
                      addAsset2Wallet: this.addAsset2Wallet
                    }
                    this.setDimmer(true, true, msg)

                    // This causes the refresh of Funds' and Assets' balances
                    this.$store.dispatch(
                      'setCurrentAccount',
                      this.$store.state.currentAccount.address
                    )

                    this.$store.dispatch('setWorkInProgress', false)

                    this.triggerGAEvent('invest_wallet_success')

                    this.prevNoOfTokens = undefined
                    this.bigNumberInputValue = new BigNumber(0)
                    this.wrongInput = undefined
                    this.noOfTokensChanged(undefined, 'issueFund')
                  })
                  .catch((invest2Error) => {
                    this.log('invest2Error', invest2Error)

                    msg = {
                      type: 'error',
                      header,
                      subHeaders: ['Oops, something went wrong (3/6)'],
                      lines: [invest2Error]
                    }
                    this.setDimmer(true, true, msg)

                    this.$store.dispatch('setWorkInProgress', false)

                    this.triggerGAEvent('invest_wallet_error')
                  })
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

              this.triggerGAEvent('invest_wallet_error')
            }
          })
          .catch((invest1Error) => {
            this.log('invest1Error', invest1Error)

            msg = {
              type: 'error',
              header,
              subHeaders: ['Oops, something went wrong (5/6)'],
              lines: [invest1Error]
            }
            this.setDimmer(true, true, msg)

            this.$store.dispatch('setWorkInProgress', false)

            this.triggerGAEvent('invest_wallet_error')
          })
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

        this.triggerGAEvent('invest_wallet_error')
      }
    },
    addAsset2Wallet() {
      ethereum
        .request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: this.fund.address,
              symbol: this.fund.symbol,
              decimals: 18,
              image: `https://cdn.dextf.com/${this.fund.image}`
            }
          }
        })
        .then((success) => {
          if (success) {
            this.log(`Asset ${this.fund.symbol} sucessfully aded to wallet`)
          } else {
            throw new Error(`Add asset ${this.fund.symbol} to wallet: something went wrong`)
          }
        })
        .catch(console.error)
    }
  }
}
</script>
    
<style scoped>
</style>