<template>
  <tr
    v-show="visible"
    :key="fund.symbol + 'row' + _uid"
    :class="{ selected: isSelected }"
    style="height: 75px; max-heigth: 95px"
    XXstyle="{
      height: fund.canRebalance ? '95px' : '75px',
      'max-heigth': fund.canRebalance ? '95px' : '75px'
    }"
    @click="selectFund()"
  >
    <td
      style="min-width: 16px; padding: 0; cursor: default"
      :style="fundMarkColorStyle"
      :data-tooltip="fundMarkColorStyle.tooltip"
      data-position="right center"
      data-inverted=""
    ></td>
    <td style="width: 100%; padding-left: 0; padding-right: 0">
      <table style="width: 100%; border-spacing: 0; xbackground-color: blue">
        <tr>
          <td :style="styles[0]">
            <table class="_fundTagTable" style="width: 100% !important">
              <tr>
                <td width="1%">
                  <img
                    v-if="fund.image"
                    style="width: 2.5rem; margin: 0 0.5rem 0 1rem"
                    :src="fund.image"
                  />
                  <FundLogoSvg
                    v-else
                    :fund-symbol="
                      isEthereum
                        ? fund.symbol
                        : `xxxx${
                            fund.address ? fund.address.substring(2, 8).toUpperCase() : '---NEW'
                          }`
                    "
                    :company-color="fund.color"
                    style="margin: 0 0.5rem 0 1rem"
                  >
                  </FundLogoSvg>
                </td>
                <td width="99%" style="line-height: normal; position: relative">
                  <b> {{ fund.name }} </b>
                  <span class="ui text primary" v-if="fund.clonedFromV1"> (V1 clone) </span>
                  <Rating
                    :id="`${fund.symbol}-favourite`"
                    :rating="rating"
                    :tooltip="'Toggle favourite'"
                    style="position: absolute; right: 2rem"
                    @updateRating="updateRating($event)"
                  />

                  <div
                    class="_muted"
                    style="
                      white-space: nowrap;
                      width: 300px;
                      overflow: hidden;
                      text-overflow: ellipsis;
                    "
                  >
                    {{ fund.symbol }}

                    <Rating
                      v-if="showInvestorVisibility && fund.visibleToInvestors == false"
                      :id="`${fund.symbol}-visible`"
                      :rating="1"
                      :tooltip="'Hidden to Investors'"
                      :icon="'eye slash outline'"
                      :color="'red'"
                      :enabled="false"
                      style="position: absolute; right: 2rem"
                      @updateRating="updateRating($event)"
                    />
                  </div>
                </td>
              </tr>
              <tr v-if="companyUserLabel">
                <td
                  colspan="2"
                  width="99%"
                  style="padding-left: 1rem !important; font-size: 0.9rem"
                >
                  {{ companyUserLabel }}
                </td>
              </tr>
            </table>
          </td>

          <td v-if="showComposition" :style="styles[1]">
            <CellComposition :tokens="tokens" style="height: 100%" />
          </td>

          <td :style="styles[2]">
            <RiskSelector
              class="left floated"
              :risk="fund.risk"
              :single-value="true"
              :show-description="true"
            />

            <CopyField
              v-if="fund.address"
              :text="fundAddressShort"
              :value="fund.address"
              class="_muted"
              style="max-width: 115px"
            />
          </td>

          <td class="single line right aligned" :style="styles[3]">
            <div v-if="fund.refreshing"></div>
            <div
              v-else-if="fund.isSn === true || !fund.launched || fund.balance.eq(0)"
              class="_muted"
            >
              <!-- n/a -->
            </div>
            <span v-else>
              {{ `${formatQuantity(fund.balance.toNumber())}` }}
              <div
                class="ui text _muted"
                :style="{
                  filter: balanceUsd.eq(0) ? 'brightness(60%)' : 'none'
                }"
              >
                {{ formatWallet(balanceUsd.toNumber()) }}
              </div>
            </span>
          </td>

          <td v-if="launchingFund" class="single line right aligned" colspan="2">Launching...</td>
          <td
            v-else-if="fundToLaunch"
            class="single line right aligned"
            colspan="2"
            style="width: 100%"
          >
            <div
              _note="used to show a tooltip and set the cursor in case it is not connected"
              style="float: right; margin-right: 0"
              :style="{ cursor: !isConnected ? 'default' : 'pointer' }"
              :data-tooltip="isConnected ? undefined : 'Wallet not connected'"
              data-position="top center"
              data-inverted=""
            >
              <div
                class="ui tertiary icon button primary"
                :class="{
                  disabled: fund.launching || !connector || !isConnected || !isNetworkValid
                }"
                style="margin-right: 0 !important; padding: 0 !important"
                @click.stop="launchFund()"
              >
                {{
                  fund.status == 'new'
                    ? fund.clonedFromV1
                      ? 'Launch in V2'
                      : 'Launch'
                    : 'Complete launch'
                }}
                <i class="rocket icon primary" style="margin: 0 !important"></i>
              </div>
            </div>
          </td>
          <td
            v-else
            xv-if="!fundToLaunch && !launchingFund"
            class="single line right aligned"
            :style="styles[4]"
          >
            <div
              class="ui active slow centered inline primary double loader"
              v-if="fund.refreshing"
            ></div>
            <div v-else-if="fund.isSn === true || !fund.launched" class="_muted">n/a</div>
            <span v-else>
              {{ `${formatWallet(currentPrice.toNumber())}` }}
              <div
                class="ui text _muted"
                :style="{
                  filter: totalNoOfTokensUsd.eq(0) ? 'brightness(60%)' : 'none'
                }"
              >
                {{ formatWallet(totalNoOfTokensUsd.toNumber()) }}
              </div>
            </span>
          </td>

          <td
            v-if="!fundToLaunch && !launchingFund"
            class="single line right aligned"
            :style="styles[5]"
          >
            <div v-if="fund.refreshing"></div>
            <div v-else-if="fund.isSn === true || !fund.launched" class="_muted">n/a</div>
            <span
              v-else
              class="ui text"
              :class="{
                green: performance > 0,
                _muted: performance == 0,
                red: performance < 0
              }"
              :style="{
                filter: performance == 0 ? 'brightness(40%)' : 'none'
              }"
            >
              {{ format(performance) }}%
              <i
                class="ui icon"
                :class="{
                  caret: performance !== 0,
                  up: performance >= 0,
                  down: performance < 0,
                  red: performance < 0,
                  equals: performance == 0
                }"
                style="margin: 0"
              ></i>
              <div class="_muted" xstyle="text-align: center">
                {{ fundLaunchDate }}
              </div>
            </span>
          </td>

          <!--
    <td class="single line right aligned" :style="styles[4]">
      <div v-if="invested">
        <i class="coins small icon" style="margin: 0 0 4px 0" />
        {{ fund.balance.toFormat(2) }}

        <div
          class="_muted"
          :style="{ filter: balanceUsd.eq(0) ? 'brightness(40%)' : 'none' }"
        >
          {{ fund.isSn === true ? 'n/a' : '$' + balanceUsd.toFormat(2) }}
        </div>
      </div>
    </td>

    <td
      class="single line center aligned"
      :style="styles[5]"
      xstyle="padding-left: 1rem !important; xbackground-color: green"
    >
      <div class="ui very compact grid" style="margin: 0">
        <div class="sixteen wide column">
          <span v-if="fund.launchDate || fund.transaction" class="ui text">
            {{ fundLaunchDate ? fundLaunchDate : '&nbsp;' }}
          </span>
          <! --
          <button
            v-else-if="isFundManager && managed"
            class="ui basic button"
            :class="{ disabled: !connectedToChain }"
            style="width: 100%"
            @click="$emit('launch')"
          >
            Launch
          </button>
          -- >
        </div>
      </div>
    </td>


    <td
      v-if="showButtons"
      class="single line"
      :style="styles[6]"
      xstyle="background-color: blue"
    >
      <! -- Fund Manager actions -- >
      <div
        v-if="isFundManager && managed"
        class="ui very compact grid"
        style="margin: 0 1rem 0 0.5rem"
      >
        <div class="five wide column">
          <button
            class="ui button"
            :class="{ disabled: !fund.canModify || fund.launching }"
            style="width: 100%"
            @click="$emit('modify')"
          >
            MODIFY
          </button>
        </div>
        <div class="ten wide column middle aligned center aligned">
          <div v-if="fund.visibleToInvestors == false">
            <i class="ui eye slash outline red icon" xstyle="width: 2rem"></i>
            <span class="ui red text"> Hidden to Investors </span>
          </div>
        </div>
      </div>

      <! -- Investment actions -- >
      <div
        v-else-if="
          isInvestor && investment && fund.launchDate
        "
        class="ui very compact grid"
        style="margin: 0 1rem 0 0.5rem"
      >
        <div class="five wide column">
          <button
            class="ui button"
            :class="{
              disabled:
                !connectedToChain || !(fund.canInvest && !currentPrice.eq(0))
            }"
            style="width: 100%"
            @click="$emit('invest')"
          >
            MINT
          </button>
        </div>
        <div class="five wide column">
          <button
            class="ui button"
            :class="{
              disabled: !connectedToChain || !(fund.canRedeem && invested)
            }"
            style="width: 100%"
            @click="$emit('redeem')"
          >
            REDEEM
          </button>
        </div>
        <div class="five wide column">
          <button
            v-if="fund.uniswap"
            class="ui animated fade button"
            :class="{
              disabled: !connectedToChain
            }"
            style="
              width: 100%;
              background-position: 10% center;
              background-repeat: no-repeat;
              background-size: 20px 20px;
              background-image: url('images/companies/uniswap.png');
            "
            @click="goToUniswap(fund.uniswap)"
          >
            <span
              class="visible content"
              style="margin: 0; color: inherit !important"
            >
              <span
                v-text="
                  fund.currentUniswapPrice.gt(0)
                    ? '$' + fund.currentUniswapPrice.toFormat(2)
                    : 'TRADE'
                "
              >
              </span>
            </span>
            <span
              class="hidden content"
              style="margin-left: 0.4rem; color: inherit !important"
            >
              Uniswap
            </span>
          </button>
        </div>
      </div>

      <! -- Marketplace actions -- >
      <div
        v-if="isInvestor && trade && fund.launchDate"
        class="ui very compact grid"
        style="margin: 0 1rem 0 0.5rem"
      >
        <div class="eight wide column">
          <button
            class="ui button"
            :class="{
              disabled: !connectedToChain || !fund.takerBuyPosition
            }"
            style="width: 100%"
            @click="$emit('buy')"
            v-text="
              'BUY' +
              (fund.takerBuyPosition
                ? ' @ ' +
                  fund.takerBuyPosition.fundPriceInCashTokens +
                  ' ' +
                  fund.takerBuyPosition.cashToken.symbol
                : '')
            "
          ></button>
        </div>
        <div class="eight wide column">
          <button
            class="ui button"
            :class="{
              disabled: !connectedToChain || !fund.takerSellPosition
            }"
            style="width: 100%"
            @click="$emit('sell')"
            v-text="
              'SELL' +
              (fund.takerSellPosition
                ? ' @ ' +
                  fund.takerSellPosition.fundPriceInCashTokens +
                  ' ' +
                  fund.takerSellPosition.cashToken.symbol
                : '')
            "
          ></button>
        </div>
      </div>
    </td>
    -->
        </tr>
      </table>
      <div v-if="showRebalanceModuleUpgradeable || showRebalanceInfo" style="padding-left: 1rem">
        <div class="ui clearing divider" style="border-top: none"></div>
        <RebalanceInfoBar
          :fund="fund"
          :title-prefix="showRebalanceModuleUpgradeable ? 'REBALANCE MODULE' : 'REBALANCE'"
          :user="managed ? 'Manager' : 'Investor'"
          @cancelProposal="$emit('cancelProposal', $event)"
          @startTrading="$emit('startTrading', $event)"
          @closeTrading="$emit('closeTrading', $event)"
          @upgradeModule="$emit('upgradeModule', $event)"
        ></RebalanceInfoBar>
      </div>
    </td>
    <td style="min-width: 16px; padding: 0"></td>
  </tr>
</template>

<script>
import { mapGetters } from 'vuex'
import numeral from 'numeral'
import RiskSelector from './RiskSelector.vue'
import CellComposition from './CellComposition.vue'
import Rating from './Rating.vue'
import CopyField from './CopyField.vue'
import RebalanceInfoBar from './RebalanceInfoBar.vue'
import FundLogoSvg from './FundLogoSvg.vue'

export default {
  name: 'FundRow',
  components: {
    RiskSelector,
    CellComposition,
    Rating,
    CopyField,
    RebalanceInfoBar,
    FundLogoSvg
  },
  props: {
    fund: {
      type: Object,
      default: () => {
        return {}
      }
    },
    mode: {
      type: String,
      default: 'Investment',
      validator: function (value) {
        return ['Investment', 'Managed', 'Trade', 'Invested'].includes(value)
      }
    },
    showComposition: {
      type: Boolean,
      default: false
    },
    showInvestorVisibility: {
      type: Boolean,
      default: false
    },
    showRebalanceBar: {
      type: Boolean,
      default: true
    },
    showButtons: {
      type: Boolean,
      default: false
    },
    annualisedPerformance: {
      type: Boolean,
      default: true
    },
    filters: {
      type: Object,
      default: () => {
        return {
          invested: false,
          favourite: false,
          uniswap: false,
          risks: [true, true, true, true, true],
          assets: ''
        }
      }
    },
    searchText: {
      type: String,
      required: true,
      default: ''
    },
    styles: {
      type: Array,
      required: true
    },
    selected: {
      type: String,
      required: true
    }
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['walletTokenList']),
    riskColor() {
      const colors = ['blue', 'olive', 'yellow', 'pink', 'red']
      return colors[this.fund.risk - 1]
    },
    fundLaunchDate() {
      if (this.fund.launched) {
        return new Date(this.fund.launchDate).toLocaleDateString()
      } else if (this.fund.launching) {
        return 'Launching...'
      }
      return this.fund.launchDate
    },
    invested() {
      return this.fund.balance.gt(0)
    },
    managed() {
      return this.mode == 'Managed'
    },
    investment() {
      return this.mode == 'Investment'
    },
    trade() {
      return this.mode == 'Trade'
    },
    investments() {
      return this.mode == 'Invested'
    },
    companyUserLabel() {
      return this.fund.company ? `${this.fund.company}, ${this.fund.fundManager}` : ''

      let label
      if (this.fund.company) {
        label = this.fund.company
      }
      if (this.fund.fundManager) {
        if (label) {
          label = label + ', '
        } else {
          label = ''
        }
        label = label + this.fund.fundManager
      }
      return label || ''
    },
    fundId() {
      var x = (this.managed ? 'm' : '') + this.fund.symbol
      // Remove characters that might interfere with the jquery selector
      return x.replace(/[.#$]/g, '')
    },
    allocation() {
      if (this.fund.allocation) {
        return this.fund.created ? this.fund.allocation.current : this.fund.allocation.inception
      }
      return undefined
    },
    tokens() {
      if (this.allocation) {
        return this.allocation.assets.map((a) => {
          const assetDef = this.$store.getters.getAssetBySymbol(a.symbol)
          return {
            symbol: a.symbol,
            percentage: a.percentage,
            image: assetDef.image,
            color: assetDef.color,
            price: a.price.toString(),
            unitQuantity: a.unitQuantity.toString()
          }
        })
      }
      return []
    },
    fundAddressShort() {
      const f = this.fund.address
      if (f) {
        return f.substring(0, 6) + '...' + f.substring(f.length - 4)
      }
      return ''
    },
    connectedToChain() {
      return this.connector !== undefined
    },
    currentPrice() {
      // Note: The fund's current price is a function
      return this.fund.currentPrice()
    },
    performance() {
      let performance = 0
      if (this.currentPrice.gt(0)) {
        // return this.fund.performance
        if (this.annualisedPerformance) {
          // Calculate annualised performance
          if (this.fund.launched || this.currentPrice.eq(0)) {
            const today = new Date()
            const diffDays = this.dateDiffInDays(new Date(this.fund.launchDate), today)
            if (diffDays != 0) {
              performance = 100 * ((this.currentPrice.toNumber() / 100) ** (365.25 / diffDays) - 1)
            }
          }
        } else {
          // Calculate performance since inception
          performance = (this.currentPrice.toNumber() / this.fund.targetPrice - 1) * 100
        }
      }
      return performance
    },
    balanceUsd() {
      return this.fund.balance.times(this.currentPrice)
    },
    totalNoOfTokensUsd() {
      return this.fund.aum()
    },
    fundNameLowerCase() {
      return this.fund.name.toLowerCase()
    },
    fundSymbolLowerCase() {
      return this.fund.symbol.toLowerCase()
    },
    fundAddressLowerCase() {
      return this.fund.address.toLowerCase()
    },
    searchTextLowerCase() {
      return this.searchText.toLowerCase()
    },
    visible() {
      if (this.filters.cnt < 0) {
        // Will never happen, just to make it reactive
        return false
      }

      let visible = true
      if (visible && this.filters.invested == true) {
        if (this.managed) {
          // visible = this.fund.totalNoOfTokens.gt(0)
          visible = this.invested
        } else {
          visible = this.invested
        }
      }

      if (visible && this.filters.favourite == true) {
        visible = !!this.rating
      }

      if (visible && this.filters.uniswap == true) {
        visible = !!this.fund.uniswap
      }

      if (visible && this.filters.kyber == true) {
        visible = !!this.fund.isKyberCompatible
      }

      if (visible && this.filters.inactive) {
        visible = !this.fund.visibleToInvestors
      }

      if (visible && !this.fund.hasDextfTradeModule) {
        visible = this.filters.staticFunds
      }

      if (visible && this.fund.hasDextfTradeModule) {
        visible = this.filters.dynamicFunds
      }

      if (visible && this.filters.myTokens) {
        visible = false
        for (let i = 0; i < this.tokens.length; i++) {
          if (this.walletTokenList.includes(this, tokens[i].symbol.toLowerCase())) {
            visible = true
            break
          }
        }
      } else if (visible && this.filters.assets.length > 0) {
        visible = false
        const assets = this.filters.assets.toLowerCase().split(',')
        for (var i = 0; i < this.tokens.length; i++) {
          if (assets.includes(this.tokens[i].symbol.toLowerCase())) {
            visible = true
            break
          }
        }
      }
      if (visible) {
        visible = this.filters.risks[this.fund.risk - 1] == true
      }

      // Search Filter
      if (visible && this.searchTextLowerCase.length > 0) {
        visible =
          this.fundNameLowerCase.includes(this.searchTextLowerCase) ||
          this.fundSymbolLowerCase.includes(this.searchTextLowerCase) ||
          this.fundAddressLowerCase.includes(this.searchTextLowerCase)
      }

      return visible
    },
    fundToLaunch() {
      // if (this.fund.symbol == 'XTF2000EXC')
      //   console.log(
      //     '**** fundToLaunch',
      //     this.fund.launching,
      //     this.fund.launched,
      //     this.fund.status
      //   )
      return this.managed && !this.fund.launched // this.fund.status == 'new' || this.fund.status == 'created'
    },
    launchingFund() {
      // if (this.fund.symbol == 'XTF2000EXC')
      //   console.log(
      //     '**** launchingFund',
      //     this.fund.launching,
      //     this.fund.launched,
      //     this.fund.status
      //   )
      return this.managed && this.fund.launching
      /* return (
        this.fund.status == 'creating' || this.fund.status == 'initializing'
      ) */
    },
    rating() {
      return this.$store.state.ratings[this.fund.symbol] || 0
    },
    isSelected() {
      return this.selected == this.fund.symbol
    },
    showRebalanceInfo() {
      return (
        this.showRebalanceBar &&
        this.fund.canRebalance &&
        this.fund.rebalance.state !== 'Error' &&
        this.fund.rebalance.state !== 'Regular' &&
        (this.mode == 'Managed' ||
          this.fund.rebalance.tradedFundTokens.lt(this.fund.rebalance.maxTradedFundTokens))
      )
    },
    showRebalanceModuleUpgradeable() {
      return this.fund.rebalance.state === 'Upgradeable'
    },
    fundMarkColorStyle() {
      let alpha = 1
      let rgbValues = '42, 42, 42'
      if (this.fund.hasDextfTradeModule) {
        alpha = this.showRebalanceInfo ? 0.9 : 0.3
        rgbValues = this.$store.state.primaryColor.rgb
      }
      return {
        'background-color': `rgba(${rgbValues}, ${alpha}) !important`,
        tooltip: this.fund.hasDextfTradeModul ? 'Dynamic' : 'Static'
      }
    }
  },
  watch: {},
  created() {
    numeral.zeroFormat('0.00')
    numeral.nullFormat('0.00')
    // this.rating = this.$store.state.ratings[this.fund.symbol] || 0
  },
  mounted() {},
  methods: {
    format(n, fmt = '0,0.00') {
      // numeral returns NaN for numbers with precision less than 10^-6
      return Math.abs(n) < 0.000001 ? numeral(0).format(fmt) : numeral(n).format(fmt)
    },
    formatQuantity(n, limit = 1000000) {
      if (isNaN(n)) return '-'

      // numeral returns NaN for numbers with precision less than 10^-6
      if (Math.abs(n) < 0.000001) {
        return '$0'
      }

      let s
      if (n < limit) {
        s = numeral(n).format('0,0.[000]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0.[00]a')
      }
      return s == 'NaN' ? '0' : s
    },
    formatWallet(n, limit = 1000000) {
      if (isNaN(n)) return '-'

      // numeral returns NaN for numbers with precision less than 10^-6
      if (Math.abs(n) < 0.000001) {
        return '$0'
      }

      let s
      if (n < limit) {
        s = numeral(n).format('0,0.[00]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0.[00]a')
      }
      return s == 'NaN' ? '-' : '$' + s
    },
    formatPct(n, maxDecimals = 4) {
      if (isNaN(n)) return '-'

      return n == 0 ? '0%' : numeral(n).format(`0.[${'0'.repeat(maxDecimals)}]`) + '%'
    },
    updateRating(value) {
      // console.log('FundRow.updateRating', `${this.fund.symbol}-row`, value)
      this.$store.dispatch('updateRating', {
        symbol: this.fund.symbol,
        value: value
      })
    },
    goToUniswap(address) {
      this.triggerGAEvent('trade_uniswap')
      if (address) {
        if (!address.endsWith('&use=V2')) {
          address = address + '&use=V2'
        }
        window.open(address, '_blank')
        return true
      }
      return false
    },
    selectFund() {
      if (this.fund.refreshing) return

      if (this.isSelected) {
        this.$emit('selected', undefined)
      } else {
        this.$emit('selected', this.fund)
      }
    },
    launchFund() {
      this.$emit('launch', this.fund)
    },
    dateDiffInDays(a, b) {
      // Discard the time and time-zone information.
      const utc1 = new Date(a.getUTCFullYear(), a.getUTCMonth(), a.getUTCDate())
      const utc2 = new Date(b.getUTCFullYear(), b.getUTCMonth(), b.getUTCDate())

      const MS_PER_DAY = 1000 * 60 * 60 * 24
      return Math.floor((utc2 - utc1) / MS_PER_DAY)
    }
  }
}
</script>

<style scoped>
a {
  font-weight: normal;
}

/*
tr > td,
tr > td > a,
tr > td > span {
  font-size: 1rem;
  color: #525252;
}

tr > td {
  padding-left: 0px !important;
  padding-right: 0px !important;
}
*/

._fundTagTable {
  border-collapse: collapse;
}

._fundTagTable > tr > td {
  padding: 0px !important;
}
</style>