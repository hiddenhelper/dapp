<template>
  <div
    class="ui fluid card"
    style="padding-left: 32px; padding-right: 32px"
    :style="{ height: heightInPx }"
  >
    <div class="content" style="padding: 0">
      <div
        id="line-chart-tab-menu"
        class="ui fluid two item secondary pointing menu"
      >
        <div
          class="item"
          :class="{ active: selectedTab == 'price', disabled: !showTab.price }"
          @click="selectedTab = 'price'"
          data-tab="price"
        >
          Price
        </div>
        <div
          class="item"
          :class="{ active: selectedTab == 'aum', disabled: !showTab.aum }"
          @click="selectedTab = 'aum'"
          data-tab="aum"
        >
          AUM
        </div>
      </div>

      <div class="ui compact grid" xstyle="background-color: yellow">
        <div class="ten wide column" xstyle="background-color: red">
          <div
            :data-tooltip="`Current ${
              selectedTab == 'aum' ? 'AUM' : selectedTab
            }`"
            data-position="bottom left"
            data-inverted=""
            style="margin-bottom: 4px"
          >
            <span
              style="
                color: rgba(226, 226, 226);
                font-weight: 400;
                font-size: 24px;
              "
            >
              ${{ currentValue }}&nbsp;
              <span style="color: rgba(165, 165, 165); font-size: 12px">
                USD
              </span>
            </span>
          </div>
          <div
            :data-tooltip="`${range == 'MAX' ? 'Total' : range} change`"
            data-position="bottom left"
            data-inverted=""
          >
            <span
              class="ui text"
              :class="{
                green: performance > 0,
                red: performance < 0,
                _muted: performance == 0
              }"
              style="font-weight: 400; font-size: 24px"
            >
              {{ format(performance) }}%
            </span>
          </div>
        </div>
        <div
          class="right aligned six wide column"
          xstyle="background-color: blue"
        >
          <div class="ui mini horizontal list" style="margin: 0">
            <div
              v-for="item in selectorChoices"
              :key="item.id"
              class="item right aligned _pointer"
              :class="{ disabled: !item.enabled }"
              :style="{
                'font-weight': range == item.id ? 'bold' : 'normal',
                'text-decoration': range == item.id ? 'overline' : 'none',
                color: range == item.id ? 'white' : '#8e8e8e'
              }"
              @click="rangeChanged(item.id)"
            >
              {{ item.id }}
            </div>
          </div>
          <div
            class="ui mini segment"
            style="margin: 0; padding: 0; border-radius: 0"
          >
            <div style="color: rgba(165, 165, 165)">
              Low:
              <span
                :style="{
                  color: lowData !== '-' ? 'white' : undefined,
                  'font-weight': lowData !== '-' ? '500' : undefined
                }"
              >
                {{ lowData }}
              </span>
            </div>
            <div style="color: rgba(165, 165, 165)">
              High:
              <span
                :style="{
                  color: highData !== '-' ? 'white' : undefined,
                  'font-weight': highData !== '-' ? '500' : undefined
                }"
              >
                {{ highData }}
              </span>
            </div>
          </div>
        </div>

        <div class="sixteen wide column" xstyle="background-color: green">
          <D3LineChart
            id="chart"
            :data="chartData"
            :status="status"
            :format-x="formatX"
            :format-y="formatY"
            :points-x-count="3"
            :points-y-count="4"
            style="margin-top: 1rem"
            :style="{ height: chartHeightInPx }"
          />
        </div>
      </div>
    </div>
  </div>
</template>
    
<script>
import numeral from 'numeral'
import D3LineChart from './D3LineChart.vue'
import axios from 'axios'

export default {
  name: 'FundLineChart',
  components: { D3LineChart },
  mixins: [],
  props: {
    fund: {
      type: Object,
      required: true,
      default: () => {
        return {}
      }
    },
    suspended: {
      type: Boolean,
      default: () => {
        return false
      }
    },
    showTab: {
      type: Object,
      default: () => ({
        price: true,
        aum: true,
        performance: true
      })
    },
    height: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      selectedTab: 'price',
      chartData: [],
      range: '24H',
      first: 0,
      last: 0,
      status: '',
      selectorChoices: [
        { id: '24H', enabled: true },
        { id: '1W', enabled: false },
        { id: '1M', enabled: false },
        { id: '1Y', enabled: false }
        // { id: 'MAX', enabled: false }
      ],
      // TO TEST: ALLOW NIC TO TEST, REMOVE !!!
      testIds: new Map(),
      someFunds: [
        'XTF.000EXC',
        'XTF.000F00',
        'XTF.000FOF',
        'XTF.000T03',
        'XTF.000T06',
        'XTF.ALB1',
        'XTF.ALB2',
        'XTF.ALB3',
        'XTF.AMAR',
        'XTF.AUT2',
        'XTF.BCC1',
        'XTF.BCC401',
        'XTF.BCCBED',
        'XTF.BCCDER',
        'XTF.BCCWIN',
        'XTF.CHUCKX',
        'XTF.DEXTF',
        'XTF.FED2',
        'XTF.FED3',
        'XTF.GBTC',
        'XTF.INS1',
        'XTF.INSULA',
        'XTF.LGC1',
        'XTF.MPDAPP',
        'XTF.SPECTR',
        'XTF.SSSDAF',
        'XTF.SSSJP1',
        'XTF.SSSRET',
        'XTF.SSSWR1',
        'XTF.SSSWR3',
        'XTF.SWCEBL',
        'XTF.SWCLEA',
        'XTF.SWCSH1',
        'XTF.SWCSH2',
        'XTF.TTT1',
        'XTF.TTT3',
        'XTF.TTTABC',
        'XTF.TTTAN2',
        'XTF.TTTANL',
        'XTF.TTTDFI',
        'XTF.TTTSFU',
        'XTF.TTTSFX',
        'XTF.TTTSGR',
        'XTF.TTTSMA',
        'XTF.TTTYFI',
        'XTF.UUU1',
        'XTF.UUU111',
        'XTF.UUU2',
        'XTF.UUU666',
        'XTF.UUUA1',
        'XTF.UUUA2',
        'XTF.UUUA3',
        'XTF.UUUA4',
        'XTF.UUUA5',
        'XTF.UUUAAA',
        'XTF.UUUABK',
        'XTF.UUUB1',
        'XTF.UUUB2',
        'XTF.UUUB3',
        'XTF.UUUB4',
        'XTF.UUUBMF',
        'XTF.UUUDBC',
        'XTF.UUUDFI',
        'XTF.UUUETH',
        'XTF.UUULC',
        'XTF.UUULCP',
        'XTF.UUULTG',
        'XTF.UUUMMF',
        'XTF.UUUONE',
        'XTF.UUUUUU',
        'XTF.VAR1',
        'XTF.VAR2',
        'XTF.VAR3',
        'XTF.VAR4',
        'XTF.VAR5',
        'XTF.VVV111',
        'XTF.VVV123',
        'XTF.VVV222',
        'XTF.VVV333',
        'XTF.VVV69',
        'XTF.VVV77',
        'XTF.VVV83',
        'XTF.VVVBBB',
        'XTF.VVVBTC',
        'XTF.VVVCON',
        'XTF.VVVDBX',
        'XTF.VVVLOU',
        'XTF.VVVQNT',
        'XTF.VVVRED',
        'XTF.VVVSFB',
        'XTF.VVVSFC',
        'XTF.VVVSFO',
        'XTF.VVVUWU',
        'XTF.WEKSDF',
        'XTF.WWW1',
        'XTF.WWWAAC',
        'XTF.WWWBBB',
        'XTF.WWWBLU',
        'XTF.WWWGME',
        'XTF.WWWGRW',
        'XTF.WWWMOM',
        'XTF.WWWORC',
        'XTF.WWWSMC',
        'XTF.WWWSRC',
        'XTF.XXXBTC',
        'XTF.XXXCON',
        'XTF.XXXCRY',
        'XTF.XXXDEG',
        'XTF.XXXDET',
        'XTF.XXXFUN',
        'XTF.XXXGER',
        'XTF.XXXJAM',
        'XTF.XXXKSA',
        'XTF.XXXLUC',
        'XTF.XXXMON',
        'XTF.XXXNYC',
        'XTF.XXXOC1',
        'XTF.XXXSAD',
        'XTF.XXXSJC',
        'XTF.XXXSUS',
        'XTF.XXXTOP',
        'XTF.XXXXTF',
        'XTF.XXXXXX',
        'XTF.YYY1',
        'XTF.YYY666',
        'XTF.YYYAAV',
        'XTF.YYYABC',
        'XTF.YYYAK',
        'XTF.YYYBMC',
        'XTF.YYYBOX',
        'XTF.YYYCAR',
        'XTF.YYYCUE',
        'XTF.YYYDER',
        'XTF.YYYDEX',
        'XTF.YYYDOC',
        'XTF.YYYINV',
        'XTF.YYYJAR',
        'XTF.YYYKEN',
        'XTF.YYYLUX',
        'XTF.YYYNXM',
        'XTF.YYYOCT',
        'XTF.YYYS2',
        'XTF.YYYSEA',
        'XTF.YYYSNX',
        'XTF.YYYSYS',
        'XTF.YYYTRB',
        'XTF.YYYWR1',
        'XTF.YYYYFA',
        'XTF.YYYYFI',
        'XTF.YYYYFU'
      ]
    }
  },
  computed: {
    heightInPx() {
      return this.height + 'px'
    },
    chartHeight() {
      return this.height - 180
    },
    chartHeightInPx() {
      return this.chartHeight + 'px'
    },
    performance() {
      let p = 0
      if (this.fund.symbol && this.fund.launched && this.status != 'no data') {
        if (this.first > 0 && this.last > 0) {
          p = (this.last / this.first - 1) * 100
          /*
          p = this.fund
            .currentPrice()
            .div(100)
            .minus(1)
            .times(100)
            .toNumber()
         */
        }
      }
      return p
    },
    currentValue() {
      if (this.fund.symbol && this.fund.launched) {
        return this.selectedTab == 'price'
          ? this.fund.currentPrice().toFormat(2)
          : this.fund.aum().toFormat(2)
      }
      return ''
    },
    lowData() {
      const yValues = this.chartData.map((v) => v.y)
      return this.status !== '' ? '-' : '$' + this.format(Math.min(...yValues))
    },
    highData() {
      const yValues = this.chartData.map((v) => v.y)
      return this.status !== '' ? '-' : '$' + this.format(Math.max(...yValues))
    }
  },
  watch: {
    fund(v) {
      if (!this.suspended) {
        if (v.launched) {
          const today = new Date()
          const launchDate = new Date(v.launchDate)
          const dateDiff = this.dateDiffInDays(launchDate, today)

          let i

          // prices from 2021-02-25T00:00
          // aum from 2021-02-25T00:00
          // supply from 2021-02-25T00:00

          // Check 24H
          i = 0
          if (dateDiff < 1) {
            // Disable 24H and subsequent ranges
            for (var j = i; j < this.selectorChoices.length; j++) {
              this.selectorChoices[j].enabled = false
            }
            this.status = 'no data'
            this.status = 'no data'
            return
          } else {
            this.selectorChoices[i].enabled = true
          }

          // Check 1W
          i = 1
          if (dateDiff < 7) {
            // Disable 1W and subsequent ranges
            for (var j = i; j < this.selectorChoices.length; j++) {
              this.selectorChoices[j].enabled = false
            }
          } else {
            this.selectorChoices[i].enabled = true
          }

          // Check 1M
          i = 2
          if (dateDiff < 30) {
            // Disable 1M and subsequent ranges
            for (var j = i; j < this.selectorChoices.length; j++) {
              this.selectorChoices[j].enabled = false
            }
          } else {
            this.selectorChoices[i].enabled = true
          }

          // Check 1Y
          i = 3
          if (dateDiff < 365) {
            // Disable 1Y and subsequent ranges
            for (var j = i; j < this.selectorChoices.length; j++) {
              this.selectorChoices[j].enabled = false
            }
          } else {
            this.selectorChoices[i].enabled = true
          }

          this.range = '24H'

          if (this.selectorChoices[0].enabled) {
            this.getData(this.range)
          } else {
            this.status = 'no data'
            this.status = 'no data'
          }
        } else {
          this.status = 'no data'
          this.status = 'no data'
        }
      }
    },
    selectedTab(v) {
      this.getData(this.range)
    }
  },
  mounted() {
    $('#line-chart-tab-menu .item').tab()
    $('#line-chart-tab-menu .item').tab('change tab', this.selectedTab)
    if (this.fund.symbol !== undefined) {
      this.getData('24H')
    }
  },
  methods: {
    formatX(v) {
      const utcDate = v.replace('T', ' ') + ' UTC'
      return new Date(utcDate).toLocaleString(undefined, {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formatY(v) {
      return '$' + this.format(v)
    },
    format(n, fmt = '0,0.00') {
      // numeral returns NaN for numbers with precision less than 10^-6
      return Math.abs(n) < 0.000001
        ? numeral(0).format(fmt)
        : numeral(n).format(fmt)
    },
    getSymbol(id) {
      if (this.isProduction) {
        return id
      }

      // TO TEST: ALLOW TESTING
      let symbol = this.testIds.get(id)
      if (!symbol) {
        let i = Math.floor(Math.random() * (this.someFunds.length - 1))
        symbol = this.someFunds[i]
        this.testIds.set(id, symbol)
      }
      return symbol
    },
    getData(range) {
      this.status = 'loading'
      let url =
        this.selectedTab == 'price'
          ? this.$store.state.APIs.fundPrices
          : this.$store.state.APIs.fundAum
      let id = this.getSymbol(this.fund.symbol)

      axios
        .get(url, {
          params: { id, range }
        })
        .then((res) => {
          if (res.data.body) {
            let data
            if (res.data.body.stats) {
              data = res.data.body.stats
            } else {
              // Old/legacy
              console.warn('Old legacy response from fund stats')
              data = res.data.body.fundPrices
            }
            this.chartData = data
              .map((item) => ({
                x: item.date,
                y: item[this.selectedTab]
              }))
              .filter((v) => v.y !== 0)
            if (this.chartData.length > 1) {
              this.first = this.chartData[0].y
              this.last = this.chartData[this.chartData.length - 1].y
            } else {
              this.first = 0
              this.last = 0
            }
          } else {
            this.chartData = []
            this.first = 0
            this.last = 0
          }
          this.status = this.chartData.length > 0 ? '' : 'no data'
        })
        .catch((err) => {
          console.error('Error', err)
          this.status = 'error'
        })
    },
    analyseData(data) {},
    rangeChanged(v) {
      if (this.range != v) {
        this.range = v
        this.getData(v)
      }
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
._muted {
  filter: brightness(40%);
}
</style>