<template>
  <div
    class="ui compact stackable grid"
    style="min-width: 1150px"
    :style="{ 'max-width': isSmallDevice ? '750px' : undefined }"
  >
    <div class="row">
      <div class="sixteen wide column center aligned">
        <div
          class="ui header _normal"
          :class="{ inverted: inverted }"
          style="font-size: 3.7rem; margin-bottom: 0rem"
        >
          Portfolios, Tokenized
        </div>
        <div v-if="showReadMore" style="margin-top: 0rem !important">
          <span
            class="ui primary text _pointer"
            style="font-size: 2rem; font-weight: normal"
            @click="goTo('https://docs.dextf.com', 'docs')"
          >
            read more
          </span>
        </div>
      </div>
    </div>

    <div
      :class="{
        one: isSmallDevice,
        two: !isSmallDevice,
        column: true,
        stretched: true,
        row: true
      }"
      style="margin-top: 1rem"
    >
      <div class="column" xstyle="background-color: orange">
        <div
          class="ui padded segment _gradient1"
          :class="{ inverted: inverted }"
          xstyle="margin: 1rem 0"
        >
          <div class="ui grid center aligned">
            <div class="row _row1">
              <div class="column">
                <h1 class="ui icon header _normal" :class="{ inverted: inverted }">
                  <img
                    class="ui image centered"
                    src="/images/assets/dextf.png"
                    style="width: 80px; height: 80px"
                  />
                  <div class="content" style="padding-top: 1rem">
                    Participate in the DOMANI project
                  </div>
                </h1>
              </div>
            </div>

            <div class="row _row2_1">
              <div class="column">
                <div class="ui secondary statistic" :class="{ inverted: inverted }">
                  <div class="value">{{ format(uniswap.pool2.apy, '0,0') }}%</div>
                  <div class="label _grey" style="line-height: 2rem">
                    Annual Percentage Rate
                    <div style="font-size: smaller">(on Uniswap)</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="middle aligned two column row _row3_1">
              <div class="column">
                <h2 class="ui header" :class="{ inverted: inverted }">
                  Get
                  <br />
                  Token
                  <div class="sub header">
                    Our DEXTF token on
                    <br />
                    third party DEXs
                  </div>
                </h2>
              </div>
              <div class="column">
                <h2 class="ui header" :class="{ inverted: inverted }">
                  Add
                  <br />
                  Liquidity
                  <div class="sub header">
                    Earn a percentage of all trades
                    <br />
                    proportional to your pool share
                  </div>
                </h2>
              </div>
            </div>

            <div class="bottom aligned row _row4_1">
              <div class="four wide column" style="padding-left: 0.2rem; padding-right: 0.2rem">
                <div
                  class="ui button"
                  style="
                    width: 9rem;
                    background-position: 0.7rem center;
                    background-repeat: no-repeat;
                    background-size: 20px 20px;
                    background-image: url('images/companies/uniswap.png');
                    padding-left: 1.8rem !important;
                    padding-right: 0 !important;
                    padding-top: 0.7rem !important;
                    padding-bottom: 0.7rem !important;
                  "
                  data-tooltip="on Uniswap (Ethereum)"
                  data-position="top center"
                  data-inverted=""
                  @click="
                    goTo(
                      'https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x5f64ab1544d28732f0a24f4713c2c8ec0da089f0&use=V2',
                      'uni-dextf-eth',
                      'home_page_buy_uniswap'
                    )
                  "
                >
                  Uniswap
                  <span class="ui small text">v2</span>
                  <div style="font-size: 0.7rem">(Ethereum)</div>
                </div>
              </div>
              <div class="four wide column" style="padding-left: 0.2rem; padding-right: 0.2rem">
                <div
                  class="ui button left floated"
                  style="
                    width: 9rem;
                    background-position: 0.7rem center;
                    background-repeat: no-repeat;
                    background-size: 20px 20px;
                    background-image: url('images/companies/traderJoe.png');
                    padding-left: 1.5rem !important;
                    padding-right: 0 !important;
                    padding-top: 0.7rem !important;
                    padding-bottom: 0.7rem !important;
                  "
                  data-tooltip="on Trader Joe (Avalanche)"
                  data-position="top center"
                  data-inverted=""
                  @click="
                    goTo(
                      'https://traderjoexyz.com/#/trade?outputCurrency=0x03e8d118a1864c7dc53bf91e007ab7d91f5a06fa',
                      'trader-joe-dextf-eth'
                    )
                  "
                >
                  Trader Joe
                  <div style="font-size: 0.7rem">(Avalanche)</div>
                </div>
              </div>
              <div class="four wide column" style="padding-left: 0.2rem; padding-right: 0.2rem">
                <div
                  class="ui button right floated"
                  style="
                    width: 9rem;
                    background-position: 0.7rem center;
                    background-repeat: no-repeat;
                    background-size: 20px 20px;
                    background-image: url('images/companies/uniswap.png');
                    padding-left: 1.8rem !important;
                    padding-right: 0 !important;
                    padding-top: 0.7rem !important;
                    padding-bottom: 0.7rem !important;
                  "
                  data-tooltip="on Uniswap (Ethereum)"
                  data-position="top center"
                  data-inverted=""
                  @click="
                    goTo(
                      'https://app.uniswap.org/#/add/v2/0x5f64ab1544d28732f0a24f4713c2c8ec0da089f0/ETH',
                      'uni-dextf-eth-liq',
                      'home_page_add_uniswap'
                    )
                  "
                >
                  Uniswap
                  <span class="ui small text">v2</span>
                  <div style="font-size: 0.7rem">(Ethereum)</div>
                </div>
              </div>
              <div class="four wide column" style="padding-left: 0.2rem; padding-right: 0.2rem">
                <div
                  class="ui button left floated"
                  style="
                    width: 9rem;
                    background-position: 0.7rem center;
                    background-repeat: no-repeat;
                    background-size: 20px 20px;
                    background-image: url('images/companies/traderJoe.png');
                    padding-left: 1.5rem !important;
                    padding-right: 0 !important;
                    padding-top: 0.7rem !important;
                    padding-bottom: 0.7rem !important;
                  "
                  data-tooltip="on Trader Joe (Avalanche)"
                  data-position="top center"
                  data-inverted=""
                  @click="
                    goTo(
                      'https://traderjoexyz.com/#/pool/0x03e8d118a1864c7dc53bf91e007ab7d91f5a06fa/AVAX',
                      'trader-joe-dextf-eth-liq'
                    )
                  "
                >
                  Trader Joe
                  <div style="font-size: 0.7rem">(Avalanche)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column" xstyle="background-color: pink">
        <div
          class="ui padded segment _gradient2"
          :class="{ inverted: inverted }"
          xstyle="margin: 1rem 0"
        >
          <div class="ui grid center aligned">
            <div class="row _row1">
              <div class="column">
                <h1 class="ui icon header _normal" :class="{ inverted: inverted }">
                  <img
                    class="ui image centered"
                    src="/images/dextf_logo.png"
                    style="width: 85px; height: 80px"
                  />
                  <div class="content" style="padding-top: 1rem">Contribute to XTF funds</div>
                </h1>
              </div>
            </div>

            <div class="row _row2_2">
              <div class="column">
                <div class="ui secondary statistic" :class="{ inverted: inverted }">
                  <div class="value">{{ format(uniswap.xtfAll.apy, '0,0') }}%</div>
                  <div class="label _grey" style="line-height: 2rem">
                    LP Annual Percentage Rate
                    <div style="font-size: smaller">(on Uniswap)</div>
                  </div>
                </div>
              </div>
            </div>

            <div class="row _row3_2">
              <div class="column">
                <table class="ui clear table" xstyle="background-color: red; margin: 0px">
                  <tbody>
                    <tr v-for="(fund, index) in dapp.funds" :key="index">
                      <td width="98%">
                        <h3 class="ui header" :class="{ inverted: inverted }">
                          {{ fund.id }}
                          <div class="sub header">{{ fund.name }}</div>
                        </h3>
                      </td>
                      <td
                        width="1%"
                        class="right aligned"
                        style="white-space: nowrap"
                        :data-tooltip="`${
                          annualisedPerformance
                            ? 'Annualised performance'
                            : 'Performance since inception'
                        } ${format(fund.performance, '+0,0')}%`"
                        data-position="left center"
                        Xdata-inverted=""
                      >
                        <h4 class="ui positive header _normal" :class="{ inverted: inverted }">
                          {{ format(fund.performance, '0,0', 2000) }}%
                          <i
                            class="ui caret icon large"
                            :class="{
                              up: fund.performance > 0,
                              down: fund.performance < 0,
                              red: fund.performance < 0
                            }"
                            style="margin: 0"
                          ></i>
                        </h4>
                      </td>
                      <td width="1%" class="right aligned">
                        <div
                          class="ui basic button"
                          style="
                            width: 6rem;
                            background-position: 0.7rem center;
                            background-repeat: no-repeat;
                            background-size: 20px 20px;
                            background-image: url('images/companies/uniswap.png');
                            padding-left: 3rem !important;
                          "
                          @click="goTo(fund.uniswap, 'trade_uniswap', 'uni-' + fund.symbol)"
                        >
                          Get
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="bottom aligned row _row4_2">
              <div class="column">
                <div class="ui button" @click="$emit('browse')">Browse XTF funds</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import numeral from 'numeral'
import { sizeHandlerMixin } from '../mixins/windowMixins.js'
import { getData } from '../modules/uniswap.js'

export default {
  name: 'HomePanel',
  components: {},
  mixins: [sizeHandlerMixin],
  props: {
    inverted: {
      type: Boolean,
      required: false,
      default: true
    },
    showReadMore: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      dapp: {
        funds: [],
        tvl: 0,
        investorApy: 0
      },
      token: {
        airdrop: {
          daily: 0
        },
        priceUsd: 0
      },
      investor: {
        airdrop: {
          daily: 0
        }
      },
      uniswap: {
        pool2: {
          apy: 0
        },
        xtfAll: {
          apy: 0
        }
      },
      annualisedPerformance: false
    }
  },
  computed: {
    ethPriceUSD() {
      return this.$store.state.uniswap.ethPriceUSD.toNumber()
    }
  },
  created() {
    this.loadPoolsData()
    this.loadFundsData()
  },
  methods: {
    goTo(address, target, event) {
      if (address) {
        if (event) this.triggerGAEvent(event)
        window.open(address, target)
        return true
      }
      return false
    },
    format(n, fmt = '0,0', max = undefined) {
      if (max && n > max) {
        return '> ' + numeral(max).format(fmt)
      } else {
        return numeral(n).format(fmt)
      }
    },
    loadPoolsData() {
      Promise.all([
        axios.get(this.$store.state.APIs.pool2Apy),
        axios.get(this.$store.state.APIs.xtfAllApy)
      ])
        .then((responses) => {
          // this.log(responses)
          this.uniswap.pool2.apy = responses[0].data
          this.uniswap.xtfAll.apy = responses[1].data
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(() => {})
    },
    loadFundsData() {
      Promise.all([
        // axios.get(this.$store.state.APIs.tokenDailyAirdrop),
        axios.get(this.$store.state.APIs.investorDailyAirdrop),
        axios.get(this.$store.state.APIs.dappTvl),
        axios.get(this.$store.state.APIs.getTopFunds),
        getData(0)
      ])
        .then((responses) => {
          // this.token.airdrop.daily = responses[0].data
          this.investor.airdrop.daily = responses[0].data
          this.dapp.tvl = responses[1].data
          let topFunds = responses[2].data.funds || []
          this.token.priceUsd = responses[3].dextfPriceUsd

          topFunds = topFunds.slice(0, 3)

          topFunds.forEach((fund) => {
            if (this.annualisedPerformance) {
              // Calculate annualised performance
              fund.performance = fund.performance0 * 100
            } else {
              // Calculate performance since inception
              fund.performance = (fund.price / 100 - 1) * 100
            }
          })
          topFunds.sort((a, b) => b.performance - a.performance)

          this.dapp.funds = topFunds

          this.dapp.investorApy =
            ((this.investor.airdrop.daily * this.token.priceUsd) / this.dapp.tvl) * 365.25 * 100

          // this.log('Daily Airdrop', this.token.airdrop.daily)
          /*
          this.log('Investor Daily Airdrop', this.investor.airdrop.daily)
          this.log('Dapp TVL', this.dapp.tvl)
          this.log('DEXTF Price USD', this.token.priceUsd)
          this.log('Investor APR', this.dapp.investorApy)
          */
        })
        .catch((err) => {
          console.error(err)
        })
        .finally(() => {})
    }
  }
}
</script>

<style scoped>
._gradient1 {
  background: linear-gradient(135deg, #191919, #131313) !important;
}

._gradient2 {
  background: linear-gradient(225deg, #191919, #131313) !important;
}

._grey {
  color: #8c8c8c !important;
}

/*
)tr {
  background-color: #242424;
  border-bottom: 5px solid red;
}

td:first-child {
  border-radius: 0.97em 0 0 0.97em !important;
  padding: 1rem !important;
}

td:last-child {
  border-radius: 0 0.97em 0.97em 0 !important;
  padding: 1rem !important;
}
*/

._darkGreyWhite {
  background-color: rgba(255, 255, 255, 0.1);
  xbackground-color: #2a2a2a;
  color: white;
}
._darkGreyWhite:hover {
  background-color: rgba(255, 255, 255, 0.16);
  xbackground-color: #383838;
  color: white;
}

._light {
  font-weight: normal;
}

._row1 {
  xheight: 175px;
  xmargin-top: 1rem;
  xbackground-color: red;
}
._row2_1 {
  xheight: 100px;
  xmargin-top: 1rem;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  xbackground-color: blue;
}
._row2_2 {
  xheight: 100px;
  xmargin-top: 1rem;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  xbackground-color: blue;
}
._row3_1 {
  height: 290px !important;
  padding: 0 !important;
  margin-top: 1rem;
  xbackground-color: yellow;
}
._row3_2 {
  height: 290px !important;
  padding: 0 !important;
  margin-top: 1rem;
  xbackground-color: yellow;
}
._row4_1 {
  xheight: 70px;
  xmargin-bottom: 1rem;
  xbackground-color: pink;
}
._row4_2 {
  xheight: 70px;
  xmargin-bottom: 1rem;
  xbackground-color: pink;
}

/*--------------
  Semantic UI overrides/Fixes
  ---------------*/

.ui.green.inverted.statistic > .value {
  color: #a2ff90 !important;
}
</style>
