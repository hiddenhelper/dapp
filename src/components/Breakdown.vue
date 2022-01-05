<template>
  <div v-if="false" class="ui grid">
    <div class="top aligned row">
      <div class="four wide column">
        <D3Doughnut
          :parent-id="id"
          :data="chartData"
          :height="chartHeight"
          :selected-data="selected"
          @arcHover="(e) => (arcSelect = e)"
          @arcLeave="() => (arcSelect = '')"
          style="margin-left: -1rem; margin-right: 1rem"
        ></D3Doughnut>
      </div>
      <div class="twelve wide column">
        <TokenList
          :parent-id="id"
          :tokens="tokens"
          :show-header="showHeader"
          :show-full-name="showFullName"
          :styles="styles"
          :max-height="listHeight"
          :quantity-property-name="quantityPropertyName"
          :format-quantity="formatQuantity"
          :format-wallet="formatWallet"
          :selected="arcSelect"
          :show-padding="showPadding"
          :enable-hover-effect="true"
          :font-size="fontSize"
          @selectedAsset="(asset) => (selected = asset)"
        />
      </div>
    </div>
  </div>

  <table
    v-else
    style="margin: 0; padding: 0; width: 100%; xbackground-color: orange"
    :style="{ height: heightInPx }"
  >
    <tr>
      <td colspan="2">
        <h3
          v-if="title.text"
          class="ui header"
          :class="{ _muted: title.muted }"
          style="margin-bottom: 1.5rem"
        >
          {{ title.text }}
        </h3>
      </td>
    </tr>

    <tr>
      <td
        style="padding: 0; flex: column; vertical-align: top"
        :style="{
          'max-width': chartColumnWidthInPx,
          width: chartColumnWidthInPx
        }"
      >
        <D3Doughnut
          :parent-id="id"
          :data="chartData"
          :height="chartHeight"
          :selected-data="selected"
          @arcHover="(e) => (arcSelect = e)"
          @arcLeave="() => (arcSelect = '')"
          style="margin-left: -1rem; margin-right: 1rem"
        ></D3Doughnut>
      </td>
      <td style="padding-left: 0; flex: column; vertical-align: top; xbackground-color: green">
        <div class="field">
          <div
            v-if="listLabel"
            style="font-weight: bold; padding-left: 1.5rem; margin-bottom: 0.5rem"
            v-html="listLabel"
          ></div>
          <TokenList
            :parent-id="id"
            :tokens="tokens"
            :show-header="showHeader"
            :show-full-name="showFullName"
            :styles="styles"
            :max-height="listHeight"
            :quantity-property-name="quantityPropertyName"
            :format-quantity="formatQuantity"
            :format-wallet="formatWallet"
            :selected="arcSelect"
            :show-padding="showPadding"
            :enable-hover-effect="true"
            :font-size="fontSize"
            @selectedAsset="(asset) => (selected = asset)"
          />
        </div>
      </td>
    </tr>
  </table>
</template>
    
<script>
import D3Doughnut from './D3Doughnut.vue'
import TokenList from './TokenList.vue'

export default {
  name: 'Breakdown',
  components: { D3Doughnut, TokenList },
  mixins: [],
  props: {
    title: {
      type: Object,
      default: () => {
        return { text: '', muted: false }
      }
    },
    listLabel: {
      type: String,
      default: ''
    },
    styles: {
      type: Object,
      default: () => {
        return {
          asset: {
            header: 'Asset',
            style: 'width: 100%; xbackground-color: yellow'
          },
          allocation: {
            header: 'Allocation',
            style: 'min-width: 70px; xbackground-color: blue'
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
      }
    },
    quantityPropertyName: {
      type: String,
      default: 'required'
    },
    formatQuantity: {
      type: Function,
      required: true
    },
    formatWallet: {
      type: Function,
      required: true
    },
    tokens: {
      type: Array,
      required: true
    },
    showHeader: {
      type: Boolean,
      default: false
    },
    showPadding: {
      type: Boolean,
      default: false
    },
    showFullName: {
      type: Boolean,
      default: true
    },
    height: {
      type: Number,
      default: 300
    },
    chartHeight: {
      type: Number,
      default: 200
    },
    fontSize: {
      type: String,
      default: 'smaller'
    }
  },
  data() {
    return {
      arcSelect: '',
      selected: '',
      chartData: []
    }
  },
  computed: {
    id() {
      return 'breakdown' + this._uid
    },
    heightInPx() {
      return this.height + 'px'
    },
    chartHeightInPx() {
      return this.chartHeight + 'px'
    },
    listHeight() {
      return Math.max(this.chartHeight, this.height - 50) - (this.listLabel ? 25 : 0)
    },
    listHeightInPx() {
      return this.listHeight + 'px'
    },
    chartColumnWidth() {
      return this.chartHeight
    },
    chartColumnWidthInPx() {
      return this.chartColumnWidth + 'px'
    }
  },
  watch: {
    tokens(v) {
      this.refreshChartData()
    }
  },
  beforeCreate() {},
  created() {
    this.refreshChartData()
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    refreshChartData() {
      const chartData = []
      this.tokens.forEach(async (token) => {
        // const assetDef = this.$store.getters.getAssetBySymbol(asset.symbol)
        chartData.push({
          symbol: token.symbol,
          amount: token.percentage,
          color: token.color
        })
      })
      this.chartData = chartData
    }
  }
}
</script>
    
<style scoped>
</style>