<template>
  <div>
    <div
      class="ui attached segment"
      style="padding-left: 32px; padding-right: 32px"
      :style="{ height: heightInPx }"
    >
      <h1 class="ui header" style="padding: 1rem 0">
        <div class="sub header">
          Buy/Sell {{ fund.symbol }} on
          <img
            class="ui image"
            src="images/companies/uniswap_full_white.png"
            style="
              height: 1.5rem !important;
              margin-left: 0.2rem;
              margin-bottom: 5px;
            "
          />
          <!--
        on Uniswap
        <img class="ui avatar small image" src="images/companies/uniswap.png" />
        --></div>
      </h1>

      <div style="margin-top: 1rem; margin-bottom: 1rem; min-height: 340px">
        <div class="ui grid">
          <div class="eight wide column">
            <div class="_muted" style="margin-bottom: 0.4rem">Price</div>
            <div style="font-size: 1.5rem; font-weight: 600">
              ${{ format(price, '0,0.00') }}
            </div>
          </div>
          <div class="right aligned eight wide column">
            <div class="_muted" style="margin-bottom: 0.4rem">
              Total liquidity
              <!--
            <span
              :data-tooltip="'In Uniswap, derived total liquidity USD value may be inaccurate without liquid stablecoin or ETH pairing.'"
              xdata-position="bottom right"
              data-inverted=""
              style="white-space: pre"
            >
              <i class="info circle icon" style="margin: 0"></i>
            </span>
            --></div>
            <div style="font-size: 1.5rem; font-weight: 600">
              ${{ format(liquidity) }}
            </div>
          </div>

          <div v-show="hasUniswap" class="sixteen wide column">
            <div class="_muted" style="margin-bottom: 0.4rem">Pair</div>
            <div
              style="
                width: 10%;
                white-space: nowrap;
                font-size: 1.5rem;
                font-weight: 600;
              "
              Xclass="{ _pointer: hasUniswap }"
              @click="performOperation('go')"
              data-tooltip="View on Uniswap"
              data-position="bottom left"
              data-inverted=""
            >
              {{ pairName }}
              <i
                class="external alternate small icon"
                style="margin: 0 0 0.2rem 0"
              ></i>
            </div>
          </div>
          <div v-show="hasUniswap" class="sixteen wide column">
            <div class="_muted" style="margin-bottom: 0.4rem">Pair address</div>
            <div style="font-size: 1.5rem; font-weight: 600">
              <CopyField
                style="width: 10%"
                :text="addressShort"
                :value="pairAddress"
                :tooltip-position="'bottom left'"
              />
              <span v-show="!hasUniswap">-</span>
            </div>
          </div>
          <div v-show="!hasUniswap" class="sixteen wide column">
            <div
              class="ui white basic inverted button"
              style="
                background-position: 10px center;
                background-repeat: no-repeat;
                background-size: 25px 25px;
                background-image: url('images/companies/uniswap_white.svg');
                padding-left: 3.3rem;
              "
              @click="performOperation('create')"
            >
              Create pair
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div
      :class="{ _notAllowedPointer: buttonErrorMessage }"
      :data-tooltip="buttonErrorMessage"
      data-position="top center"
      data-inverted=""
    >
      <div class="ui two bottom attached primary buttons">
        <div
          class="ui button"
          :class="{
            disabled: !hasUniswap
          }"
          style="
            background-position: 10px center;
            background-repeat: no-repeat;
            background-size: 40px 40px;
            background-image: url('images/companies/uniswap_black.svg');
            padding-left: 50px !important;
            border-bottom-left-radius: 12px;
          "
          @click="performOperation('trade')"
        >
          Buy / Sell
        </div>
        <div
          class="ui button"
          :class="{
            disabled: !hasUniswap
          }"
          style="
            background-position: 10px center;
            background-repeat: no-repeat;
            background-size: 40px 40px;
            background-image: url('images/companies/uniswap_black.svg');
            padding-left: 50px !important;
            border-bottom-right-radius: 12px;
          "
          @click="performOperation('add')"
        >
          Add liquidity
        </div>
      </div>
    </div>
  </div>
</template>
    
<script>
import numeral from 'numeral'
import { getPairInfo } from '../modules/uniswap.js'
import CopyField from './CopyField.vue'

export default {
  name: 'FundDex',
  components: { CopyField },
  mixins: [],
  props: {
    fund: {
      type: Object,
      required: false,
      default: () => {
        return {
          uniswap: ''
        }
      }
    },
    height: {
      type: Number,
      default: 500
    }
  },
  data() {
    return {
      apiResult: {}
    }
  },
  computed: {
    heightInPx() {
      return this.height + 'px'
    },
    buttonErrorMessage() {
      return this.hasUniswap ? undefined : 'No Uniswap pair'
    },
    hasUniswap() {
      return this.fund.uniswapInfo && this.fund.uniswapInfo.address
    },
    pairName() {
      if (this.hasUniswap) {
        return this.fund.uniswapInfo.name || '-'
      }
      return '-'
    },
    pairAddress() {
      if (this.hasUniswap) {
        return this.fund.uniswapInfo.address || ''
      }
      return '-'
    },
    addressShort() {
      if (this.hasUniswap) {
        return (
          this.pairAddress.substring(0, 6) +
          '...' +
          this.pairAddress.substring(this.pairAddress.length - 4)
        )
      }
      return ''
    },
    liquidity() {
      if (this.apiResult.token0) {
        // reserveUsd isn't reliable (sometimes it's half of what it should be), so we calculate it:
        const isToken0 = this.fund.symbol === this.apiResult.token0.symbol

        const derivedETH = isToken0
          ? this.apiResult.token0.derivedETH
          : this.apiResult.token1.derivedETH
        const reserve = isToken0
          ? this.apiResult.reserve0
          : this.apiResult.reserve1

        const otherTokenDerivedETH = isToken0
          ? this.apiResult.token1.derivedETH
          : this.apiResult.token0.derivedETH
        const otherTokenReserve = isToken0
          ? this.apiResult.reserve1
          : this.apiResult.reserve0

        const ethPrice = this.$store.state.currentAccount.cryptos.WETH.priceUSD

        /*
        this.log('=== Uniswap Liquidity ===')
        this.log(
          `${this.fund.symbol} (${
            isToken0 ? 'token0' : 'token1'
          }): ${derivedETH} (derivedETH) * ${reserve} (reserve) * ${ethPrice} = ${
            derivedETH * reserve * ethPrice
          }`
        )
        this.log(
          `${this.fund.symbol} ${
            isToken0
              ? this.apiResult.token1.symbol + ' (token1)'
              : this.apiResult.token0.symbol + ' (token0)'
          }): ${otherTokenDerivedETH} (otherTokenDerivedETH) * ${otherTokenReserve} (otherTokenReserve) * ${ethPrice} = ${
            otherTokenDerivedETH * otherTokenReserve * ethPrice
          }`
        )
        this.log('=========================')
        */

        if (derivedETH == 0) {
          // Simply double the other token's reserve
          return 2 * otherTokenDerivedETH * otherTokenReserve * ethPrice
        } else {
          // Sum of the two reserves
          return (
            (derivedETH * reserve + otherTokenDerivedETH * otherTokenReserve) *
            ethPrice
          )
        }
      }
      return 0
    },
    price() {
      if (this.apiResult.token0) {
        const isToken0 = this.fund.symbol === this.apiResult.token0.symbol
        const derivedETH = isToken0
          ? this.apiResult.token0.derivedETH
          : this.apiResult.token1.derivedETH
        if (derivedETH > 0) {
          /*
          this.log(
            `Uniswap Price - ${this.fund.symbol} (${
              isToken0 ? 'token0' : 'token1'
            }) = ${derivedETH} (derivedETH)`
          )
          */

          // We have the ETH quote, we just need to convert to USD
          return (
            derivedETH * this.$store.state.currentAccount.cryptos.WETH.priceUSD
          )
        } else {
          // Uniswap unable to calculate the ETH quote, we'll do it:
          const otherTokenPrice = isToken0
            ? this.apiResult.token1Price
            : this.apiResult.token0Price
          const otherTokenDerivedETH = isToken0
            ? this.apiResult.token1.derivedETH
            : this.apiResult.token0.derivedETH

          /*
          this.log(
            `Uniswap Price - ${this.fund.symbol} (${
              isToken0 ? 'token0' : 'token1'
            }) = ${otherTokenPrice} ${
              isToken0
                ? this.apiResult.token1.symbol
                : this.apiResult.token0.symbol
            } (${isToken0 ? 'token1' : 'token0'})`
          )
          */

          return (
            otherTokenPrice *
            otherTokenDerivedETH *
            this.$store.state.currentAccount.cryptos.WETH.priceUSD
          )
        }
        return derivedETH
      }
      return 0
    }
  },
  watch: {
    fund(v) {
      if (v.uniswapInfo && v.uniswapInfo.address) {
        getPairInfo(v.uniswapInfo.address.toLowerCase())
          .then((result) => {
            this.apiResult = result
          })
          .catch((e) => {
            console.error(e)
            this.apiResult = {}
          })
      } else {
        this.apiResult = {}
      }
    }
  },
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
    format(n, fmt = '0,0') {
      // numeral returns NaN for numbers with precision less than 10^-6
      return Math.abs(n) < 0.000001
        ? numeral(0).format(fmt)
        : numeral(n).format(fmt)
    },
    performOperation(ops) {
      if (ops == 'trade') {
        this.goTo(
          `https://app.uniswap.org/#/swap?inputCurrency=${this.apiResult.token0.id}&outputCurrency=${this.apiResult.token1.id}&use=V2`,
          `${this.fund.uniswapInfo.address}-swap-uniswap`
        )
      } else if (ops == 'add') {
        this.goTo(
          `https://app.uniswap.org/#/add/v2/${this.apiResult.token0.id}/${this.apiResult.token1.id}`,
          `${this.fund.uniswapInfo.address}-add-uniswap`
        )
      } else if (ops == 'go') {
        this.goTo(
          `https://v2.info.uniswap.org/pair/${this.fund.uniswapInfo.address}`,
          `${this.fund.uniswapInfo.address}-uniswap`
        )
      } else if (ops == 'create') {
        const dextf = '0x5F64Ab1544D28732F0A24F4713c2C8ec0dA089f0'
        this.goTo(
          `https://app.uniswap.org/#/add/v2/${dextf}/${this.fund.address}`,
          `${this.fund.uniswapInfo.address}-create-uniswap`
        )
      }
    },
    goTo(address, target) {
      if (address) {
        window.open(address, target)
        return true
      }
      return false
    }
  }
}
</script>
    
<style scoped>
</style>