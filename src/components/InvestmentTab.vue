<template>
  <div>
    <div
      v-if="galliumConnector"
      class="ui vertical segment"
      xstyle="background-color: red"
      :style="{ height: stakingPanelHeightInPx }"
    >
      <StakingPanel
        @setDimmer="$emit('setDimmer', $event)"
        xstyle="{ height: stakingPanelHeightInPx }"
      />
    </div>

    <div
      v-if="investments.funds.length > 0"
      class="ui vertical segment"
      style="padding: 0 1rem 1rem 1rem; background-color: black; border-radius: 16px"
    >
      <div
        class="ui vertical segment"
        xstyle="background-color: yellow"
        :style="{ height: overviewHeightInPx }"
      >
        <Overview v-if="false" :title="'Account overview'" :data="investments.overviewData" />
        <div
          v-else
          class="ui fluid card"
          style="margin: 0 !important; background-color: transparent !important"
        >
          <div class="content" style="padding-left: 0; padding-right: 0">
            <h3 class="ui header _muted" style="margin: 0">XTF Investments</h3>
          </div>

          <div class="content" style="padding-left: 0; padding-right: 0">
            <div class="ui grid center aligned">
              <div class="row">
                <div
                  class="three wide column _muted"
                  style="
                    font-size: 36px;
                    font-weight: 450;
                    -webkit-box-shadow: 1px 0 0 0 #2a2a2a;
                    box-shadow: 1px 0 0 0 #2a2a2a;
                  "
                >
                  <span class="ui text primary" style="line-height: inherit">
                    {{ investments.funds.length }}&nbsp;
                  </span>
                  <span style="font-size: 16px">
                    {{ investments.funds.length > 1 ? 'funds' : 'fund' }}
                  </span>
                </div>
                <div class="five wide column _muted" style="font-size: 36px; font-weight: 450">
                  <span class="ui text primary" style="line-height: inherit">
                    {{ formatWallet(investments.total.usd.toNumber(), 10000) }}&nbsp;
                  </span>
                  <span style="font-size: 16px"> USD </span>
                </div>
                <div
                  class="four wide column _muted"
                  style="font-size: 36px; font-weight: 450; padding-left: 0"
                >
                  <i class="ui equals mini icon left floated" style="margin: 0.5rem 0"></i>
                  <span class="ui text primary" style="line-height: inherit">
                    {{ formatQuantity(investments.total.eth.toNumber(), 1000) }}&nbsp;
                  </span>
                  <span style="font-size: 16px"> ETH </span>
                </div>
                <div
                  class="four wide column _muted"
                  style="font-size: 36px; font-weight: 450; padding-left: 0"
                >
                  <i class="ui equals mini icon left floated" style="margin: 0.5rem 0"></i>
                  <span class="ui text primary" style="line-height: inherit">
                    {{ formatQuantity(investments.total.btc.toNumber(), 1000) }}&nbsp;
                  </span>
                  <span style="font-size: 16px"> BTC </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        class="ui vertical segment"
        style="overflow-y: scroll; padding-bottom: 0; xbackground-color: green"
        :style="{ height: `${breakdownAreaHeight}px` }"
      >
        <div class="ui fluid card _gradient1" xstyle="height: 100%">
          <div class="content">
            <Breakdown
              :title="{ text: 'Funds breakdown', muted: true }"
              :show-header="true"
              :show-padding="true"
              :styles="breakdownStyles1"
              :quantity-property-name="'value'"
              :format-quantity="formatQuantity"
              :format-wallet="formatWallet"
              :tokens="investments.funds"
              :show-full-name="false"
              :height="fundBreakdownHeight"
              :chart-height="200"
              :font-size="'initial'"
            />
          </div>
        </div>

        <div class="ui fluid card _gradient2">
          <div class="content">
            <Breakdown
              :title="{ text: 'Assets breakdown', muted: true }"
              :show-header="true"
              :show-padding="true"
              :styles="breakdownStyles2"
              :quantity-property-name="'value'"
              :format-quantity="formatQuantity"
              :format-wallet="formatWallet"
              :tokens="investments.assets"
              :show-full-name="true"
              :height="assetBreakdownHeight"
              :chart-height="200"
              :font-size="'initial'"
              style="margin: 0"
            />
          </div>
        </div>
      </div>
    </div>

    <div v-else class="ui vertical segment" xstyle="background-color: blue">
      <div class="ui fluid card _gradient1" xstyle="height: 220px">
        <div class="content">
          <div class="ui two column divided grid" style="height: 100%; margin: 0">
            <div class="stretched row">
              <div class="column">
                <div
                  style="
                    font-weight: 600;
                    font-size: 36px;
                    color: rgba(255, 255, 255, 0.87);
                    line-height: 53px;
                  "
                >
                  Get started with
                  <br />
                  <img
                    src="/images/logo_long_dark.png"
                    alt="DOMANI"
                    style="width: 270px; xmargin-left: 1rem"
                  />
                  <!-- <span
                    style="
                      font-style: italic;
                      font-weight: 400;
                      color: white;
                      padding: 0 0.5rem 0 0;
                      border-top: 1px solid #6ce546;
                      border-right: 1px solid #6ce546;
                      border-bottom: 1px solid #6ce546;
                    "
                  >
                    V2
                  </span> -->
                </div>
              </div>
              <div class="column" style="font-weight: 450; font-size: 16px">
                <div class="ui basic segment" style="margin: 0; xbackground-color: red">
                  <span
                    class="ui black circular label"
                    style="
                      font-weight: 600;
                      font-size: 13px;
                      color: #6ce546;
                      border: 1px solid white;
                    "
                  >
                    1
                  </span>
                  &nbsp;Browse and compare XTF funds
                </div>
                <div class="ui basic segment" style="margin: 0; xbackground-color: green">
                  <span
                    class="ui black circular label"
                    style="
                      font-weight: 600;
                      font-size: 13px;
                      color: #6ce546;
                      border: 1px solid white;
                    "
                  >
                    2
                  </span>
                  &nbsp;Mint your chosen fund or trade directly on DEX
                </div>
                <div class="ui basic segment" style="margin: 0; xbackground-color: blue">
                  <span
                    class="ui black circular label"
                    style="
                      font-weight: 600;
                      font-size: 13px;
                      color: #6ce546;
                      border: 1px solid white;
                    "
                  >
                    3
                  </span>
                  &nbsp;Analyse and track your investments
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <h2
        class="ui center aligned icon header grey"
        style="margin-top: 125px; xmargin-bottom: auto"
      >
        <i class="circular info icon"></i>
        No investment
      </h2>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral'
import BigNumber from 'bignumber.js'
import { mapGetters } from 'vuex'

import Breakdown from '../components/Breakdown.vue'
import StakingPanel from '../components/StakingPanel.vue'

export default {
  name: 'InvestmentTab',
  components: { Breakdown, StakingPanel },
  mixins: [],
  props: {
    investments: {
      type: Object,
      default: function () {
        return {
          overviewData: [],
          total: {
            usd: new BigNumber(0),
            eth: new BigNumber(0),
            btc: new BigNumber(0)
          },
          funds: [],
          assets: []
        }
      }
    },
    height: {
      type: Number,
      default: 700
    }
  },
  data() {
    return {
      breakdownStyles1: {
        asset: {
          header: 'Fund',
          style: 'width: 100%; xbackground-color: yellow'
        },
        allocation: {
          header: 'Allocation',
          style: 'min-width: 120px; xbackground-color: blue'
        },
        quantity: {
          header: 'Balance',
          key: 'value',
          style: 'min-width: 120px; xbackground-color: pink'
        },
        wallet: {
          header: 'Value',
          style: 'min-width: 180px; xbackground-color: pink'
        }
      },
      breakdownStyles2: {
        asset: {
          header: 'Asset',
          style: 'width: 100%; xbackground-color: yellow'
        },
        allocation: {
          header: 'Allocation',
          style: 'min-width: 120px; xbackground-color: blue'
        },
        quantity: {
          header: 'Balance',
          key: 'value',
          style: 'min-width: 120px; xbackground-color: pink'
        },
        wallet: {
          header: 'Value',
          style: 'min-width: 180px; xbackground-color: pink'
        }
      }
    }
  },
  computed: {
    ...mapGetters(['galliumConnector']),
    heightInPx() {
      return `${this.height - 10}px`
    },
    stakingPanelHeight() {
      return this.galliumConnector ? 320 : 0
    },
    stakingPanelHeightInPx() {
      return this.stakingPanelHeight + 'px'
    },
    overviewHeight() {
      return 130
    },
    overviewHeightInPx() {
      return this.overviewHeight + 'px !important'
    },
    breakdownAreaHeight() {
      return this.height - this.stakingPanelHeight - this.overviewHeight - 30
    },
    fundBreakdownHeight() {
      return this.breakdownAreaHeight / 2 - 45
    },
    fundBreakdownHeightInPx() {
      return this.fundBreakdownHeight + 'px'
    },
    assetBreakdownHeight() {
      return this.breakdownAreaHeight / 2 - 45
    },
    assetBreakdownHeightInPx() {
      return this.assetBreakdownHeight + 'px'
    }
  },
  watch: {},
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    formatQuantity(n, limit = 1000000) {
      if (isNaN(n)) return '-'

      // numeral returns NaN for numbers with precision less than 10^-6
      if (Math.abs(n) < 0.000001) {
        return '0'
      }

      let s
      if (n < limit) {
        s = numeral(n).format('0,0.000')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.00a')
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
        s = numeral(n).format('0,0.00')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.00a')
      }
      return s == 'NaN' ? '0' : '$' + s
    }
  }
}
</script>

<style scoped>
._gradient1 {
  background: linear-gradient(112.77deg, #191919, #131313) !important;
}

._gradient2 {
  background: linear-gradient(112.77deg, #191919, #131313) !important;
}
</style>
