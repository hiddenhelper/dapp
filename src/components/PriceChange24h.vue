<template>
  <table id="change24Table">
    <tr>
      <td style="width: 100%">
        <span
          class="ui text"
          :class="{
            green: change24HourPct > 0,
            _muted: change24HourPct == 0,
            negative: change24HourPct < 0
          }"
          :style="{
            filter: change24HourPct == 0 ? 'brightness(40%)' : 'none'
          }"
        >
          {{ formatChange24HourPct(change24HourPct) }}%
        </span>
        <div class="_muted">{{ formatPrice(price) }}</div>
      </td>
      <td
        class="left aligned"
        style="
          min-width: 30px;
          max-width: 30px;
          padding-left: 5px !important;
          padding-right: 0 !important;
        "
      >
        <div
          :class="{ _pointer: priceLink }"
          :data-tooltip="priceLink ? 'View on CoinGecko' : undefined"
          data-position="left center"
          data-inverted=""
          @click="goTo(priceLink, `${_uid}-coinGecko`)"
        >
          <i
            class="external alternate small icon"
            style="margin-right: 0"
            :style="{
              filter: !priceLink ? 'brightness(40%)' : 'none'
            }"
          ></i>
        </div>
        <div
          v-if="showAddToMetaMask"
          class="_pointer"
          data-tooltip="Add asset to wallet"
          data-position="left center"
          data-inverted=""
          @click="addAsset2Wallet"
          style="margin-left: 0"
        >
          <img
            class="ui image"
            style="width: 13px; margin-bottom: 3px"
            src="/images/metamask.svg"
          />
          <i class="plus tiny icon orange"></i>
        </div>
      </td>
    </tr>
  </table>
</template>

<script>
import numeral from 'numeral'

export default {
  name: 'PriceChange24h',
  components: {},
  mixins: [],
  props: {
    change24HourPct: {
      type: Number,
      default: 0
    },
    price: {
      type: Number,
      default: 0
    },
    priceLink: {
      type: String,
      default: ''
    },
    symbol: {
      type: String,
      required: true
    },
    image: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    showAddToMetaMask: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      data1: 1
    }
  },
  computed: {},
  watch: {},
  beforeCreate() {},
  created() {
    numeral.zeroFormat('0.00')
    numeral.nullFormat('0.00')
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    formatChange24HourPct(n) {
      if (isNaN(n)) return '-'

      return numeral(n).format('0.00')
    },
    formatPrice(n) {
      if (isNaN(n)) return '-'

      let s
      if (n < 1000000) {
        s = numeral(n).format('0,0.[000]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.00a')
      }

      return `$${s == 'NaN' ? '0' : s}`
    },
    goTo(address, target) {
      if (address) {
        window.open(address, target)
        return true
      }
      return false
    },
    addAsset2Wallet() {
      ethereum
        .request({
          method: 'wallet_watchAsset',
          params: {
            type: 'ERC20',
            options: {
              address: this.address,
              symbol: this.symbol,
              decimals: 18,
              image: `https://cdn.dextf.com/${this.image}`
            }
          }
        })
        .then((success) => {
          if (success) {
            // console.log(`Asset ${this.symbol} sucessfully aded to wallet`)
          } else {
            throw new Error(`Add asset ${this.symbol} to wallet: something went wrong`)
          }
        })
        .catch(console.error)
    }
  }
}
</script>

<style scoped>
#change24Table {
  width: 100%;
  border-spacing: 0;
}

#change24Table > tr > td {
  padding: 0 !important;
}

#change24Table > tr > td:last-child {
  padding: 0 0.5rem !important;
}
</style>
