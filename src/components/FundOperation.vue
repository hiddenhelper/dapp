<template>
  <div class="ui fluid card" :style="{ height: heightInPx }">
    <div class="content" style="padding: 0">
      <div
        id="tab-menu"
        class="ui fluid three item secondary pointing menu"
        style="padding: 0 32px !important; margin-bottom: 0; xbackground-color: red !important"
      >
        <div
          v-if="isEthereum"
          class="item"
          :class="{
            active: initTab == 'buy-sell',
            disabled: !enableTab.buySell
          }"
          xstyle="background-color: red"
          :style="{ color: !showTab.buySell ? 'transparent' : undefined }"
          @click="selectedTab = 'buy-sell'"
          data-tab="buy-sell"
        >
          Buy / Sell on DEX
        </div>

        <div
          class="item"
          :class="{
            active: initTab == 'mint-redeem',
            disabled: !enableTab.mintRedeem
          }"
          xstyle="background-color: green"
          :style="{ color: !showTab.mintRedeem ? 'transparent' : undefined }"
          @click="selectedTab = 'mint-redeem'"
          data-tab="mint-redeem"
        >
          <span class="ui text" Xclass="{ green: isMint }">Mint</span>
          &nbsp;/&nbsp;
          <span class="ui text" Xclass="{ green: !isMint }">Redeem</span>
        </div>

        <div
          class="item"
          :class="{
            active: initTab == 'rebalance',
            disabled: !enableTab.trade
          }"
          xstyle="background-color: blue"
          :style="{ color: !showTab.trade ? 'transparent' : undefined }"
          @click="selectedTab = 'rebalance'"
          data-tab="rebalance"
        >
          Rebalance
        </div>
      </div>

      <div class="ui tab" data-tab="buy-sell" xstyle="border: 1px solid red">
        <FundDex :fund="fund" :height="tabHeight" :activated="selectedTab == 'buy-sell'" />
      </div>

      <div class="ui tab" data-tab="mint-redeem" xstyle="border: 1px solid red">
        <FundMintRedeem
          :fund="fund"
          :height="tabHeight"
          :activated="selectedTab == 'mint-redeem'"
          @toggledToMint="isMint = $event"
          @setDimmer="$emit('setDimmer', $event)"
        />
      </div>

      <div class="ui tab" data-tab="rebalance" xstyle="border: 1px solid red">
        <FundTrade
          :fund="fund"
          :height="tabHeight"
          :activated="selectedTab == 'rebalance'"
          @setDimmer="$emit('setDimmer', $event)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import { fundMixin } from '../mixins/fundMixins.js'
import { sizeHandlerMixin } from '../mixins/windowMixins.js'

import FundDex from './FundDex.vue'
import FundMintRedeem from './FundMintRedeem.vue'
import FundTrade from './FundTrade.vue'

export default {
  name: 'FundOperation',
  components: { FundDex, FundMintRedeem, FundTrade },
  mixins: [],
  props: {
    fund: {
      type: Object,
      default: function () {
        return fundMixin.methods.createNewFund(this.$store.state, true)
      }
    },
    initTab: {
      type: String,
      default: 'mint-redeem',
      validator: function (value) {
        return ['buy-sell', 'mint-redeem', 'rebalance'].includes(value)
      }
    },
    showTab: {
      type: Object,
      default: () => {
        return {
          buySell: true,
          mintRedeem: true,
          rebalance: true
        }
      }
    },
    enableTab: {
      type: Object,
      default: () => {
        return {
          buySell: true,
          mintRedeem: true,
          rebalance: true
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
      isMint: true,
      selectedTab: ''
    }
  },
  computed: {
    heightInPx() {
      return this.height + 'px'
    },
    tabHeight() {
      return this.height - 120
    },
    tabHeightInPx() {
      return this.tabHeight + 'px'
    },
    noOfItems() {
      const n = Object.values(this.showTab).filter((a) => a === true).length
      switch (n) {
        case 1:
          return ''
        case 2:
          return 'two item'
        case 3:
          return 'three item'
        case 4:
          return 'four item'
        case 5:
          return 'five item'
        default:
          return ''
      }
      return 'three item'
    }
  },
  watch: {
    initTab(v) {
      // this.log('tab changed', v)
      $('#tab-menu .item').tab('change tab', v)
      this.selectedTab = v
    },
    fund(v) {
      if (v && v.launched) {
        // Need to set a delay of 500ms, long enough to allow the sidebar's "slide-in" effect to complete
        sizeHandlerMixin.methods.setFocus(`${this.selectedTab}-input`, 500)
      }
    }
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    $('#tab-menu .item').tab()
    $('#tab-menu .item').tab('change tab', this.initTab)
    this.selectedTab = this.initTab
  },
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {}
}
</script>

<style scoped>
</style>
