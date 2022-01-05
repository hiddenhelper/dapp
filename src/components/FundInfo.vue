<template>
  <div class="ui fluid card" style="padding: 24px 32px; xbackground-color: green">
    <div class="content" style="padding: 0; xbackground-color: blue">
      <div
        v-if="showRebalanceButton && fund.canRebalance"
        class="right floated"
        :class="{ _notAllowedPointer: rebalanceNotAllowed }"
        :data-tooltip="rebalanceNotAllowed || 'Repeat the latest rebalance proposal'"
        data-position="bottom right"
        data-inverted=""
      >
        <div
          v-if="'enabled' == 'not for now'"
          class="ui tertiary icon button _muted"
          :class="{
            disabled:
              workInProgress || !connector || !isConnected || !isNetworkValid || rebalanceNotAllowed
          }"
          style="
            margin-left: 0.7rem !important;
            margin-right: 0 !important;
            padding: 0 0 0.5em 0 !important;
            xbackground-color: pink;
          "
          @click="$emit('reset')"
        >
          <i class="undo alternate icon"></i>
          Reset
        </div>
      </div>

      <div
        v-if="showRebalanceButton && fund.canRebalance"
        class="right floated"
        :class="{ _notAllowedPointer: rebalanceNotAllowed }"
        :data-tooltip="rebalanceNotAllowed || 'Create a new rebalance proposal'"
        data-position="bottom right"
        data-inverted=""
      >
        <div
          class="ui tertiary icon button _muted"
          :class="{
            disabled: workInProgress || rebalanceNotAllowed
          }"
          style="
            margin-left: 0.7rem !important;
            margin-right: 0 !important;
            padding: 0 0 0.5em 0 !important;
            xbackground-color: pink;
          "
          @click="$emit('rebalance')"
        >
          <i class="sliders horizontal icon"></i>
          Rebalance
        </div>
      </div>

      <div
        v-if="showEditButton"
        class="right floated"
        :class="{ _notAllowedPointer: editNotAllowed }"
        :data-tooltip="editNotAllowed"
        data-position="bottom center"
        data-inverted=""
      >
        <div
          class="ui tertiary icon button right floated _muted"
          :class="{
            disabled: fund.launching || workInProgress || editNotAllowed
          }"
          style="
            margin-left: 0.7rem !important;
            margin-right: 0 !important;
            padding: 0 0 0.5em 0 !important;
            xbackground-color: pink;
          "
          @click="$emit('edit')"
        >
          <i class="pencil alternate icon"></i>
          Edit
        </div>
      </div>

      <div
        v-if="showLaunchButton && !fund.launched"
        class="right floated"
        :class="{ _notAllowedPointer: launchNotAllowed }"
        :data-tooltip="launchNotAllowed"
        data-position="bottom center"
        data-inverted=""
      >
        <div
          class="ui tertiary icon primary button right floated"
          :class="{
            disabled: fund.launching || workInProgress || launchNotAllowed
          }"
          style="
            margin-left: 0 !important;
            margin-right: 0 !important;
            padding: 0 0 0.5em 0 !important;
            xbackground-color: orange;
          "
          @click="$emit('launch')"
        >
          <i class="rocket icon primary"></i>
          Launch
        </div>
      </div>

      <div
        v-if="showViewButton && fund.created"
        class="ui tertiary icon button right floated _muted"
        style="
          margin-left: 0 !important;
          margin-right: 0 !important;
          padding: 0 0 0.5em 0 !important;
          xbackground-color: yellow;
        "
        xdata-tooltip="View on Explorer"
        xdata-position="bottom right"
        xdata-inverted=""
        @click="goTo(explorerLink, `explorer${fund.address}`)"
      >
        <i class="external alternate icon"></i>
        View
      </div>

      <img style="width: 2.3rem; margin: 0 0.5rem 0 0" :src="fund.image" />
    </div>

    <div class="content" style="height: 110px; padding: 0; xbackground-color: grey">
      <h1
        class="ui header"
        style="xline-height: 32px; padding-top: 0.7rem; height: 100%; xbackground-color: yellow"
      >
        {{ fund.name }}
      </h1>
    </div>

    <div class="content" style="padding: 0; xbackground-color: orange">
      <h1 class="ui header">
        <div class="sub header">
          {{ fund.symbol }}
          <RiskSelector
            class="right floated"
            :risk="fund.risk"
            :single-value="true"
            :show-description="true"
          />
          <CopyField
            v-if="fund.address"
            :text="fund.address"
            :value="fund.address"
            :tooltip-position="'bottom left'"
            :font-size="'smaller'"
            style="padding-top: 0.3rem; width: 10%"
          />
          <div v-else style="padding-top: 0.3rem; font-size: smaller">&nbsp;</div>
        </div>
      </h1>
    </div>

    <div class="content _muted" style="padding: 0; xbackground-color: green">
      BALANCE:
      <span
        :style="{
          color: fund.balance.gt(0) ? 'white' : undefined,
          'font-weight': fund.balance.gt(0) ? '500' : undefined
        }"
      >
        {{ format(fund.balance.toNumber()) }}
      </span>
      <div
        v-if="fund.launched"
        class="right floated _pointer"
        data-tooltip="Add token to wallet"
        data-position="top right"
        data-inverted=""
        @click="addAsset2Wallet"
      >
        <img class="ui image" style="width: 15px" src="/images/metamask.svg" />
        <i class="plus tiny icon orange"></i>
      </div>
    </div>
  </div>
</template>
    
<script>
import numeral from 'numeral'
import BigNumber from 'bignumber.js'
import RiskSelector from './RiskSelector.vue'
import CopyField from './CopyField.vue'

export default {
  name: 'FundInfo',
  components: { RiskSelector, CopyField },
  mixins: [],
  props: {
    fund: {
      type: Object,
      required: false,
      default: () => {
        return {
          symbol: '',
          name: '',
          address: '',
          risk: 1,
          image: '',
          launched: false,
          launching: false,
          balance: new BigNumber(0)
        }
      }
    },
    showLaunchButton: {
      type: Boolean,
      default: false
    },
    showRebalanceButton: {
      type: Boolean,
      default: false
    },
    showEditButton: {
      type: Boolean,
      default: false
    },
    showViewButton: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {}
  },
  computed: {
    explorerLink() {
      if (this.fund) {
        return `${this.currentNetwork.explorer}/token/${this.fund.address}`
      }
      return ''
    },
    editNotAllowed() {
      if (!this.connector || !this.isConnected) {
        return 'Wallet not connected'
      } else if (!this.isNetworkValid) {
        return 'Wrong network'
      }
      return undefined
    },
    launchNotAllowed() {
      if (!this.connector || !this.isConnected) {
        return 'Wallet not connected'
      } else if (!this.isNetworkValid) {
        return 'Wrong network'
      }
      return undefined
    },
    rebalanceNotAllowed() {
      if (!this.connector || !this.isConnected) {
        return 'Wallet not connected'
      } else if (!this.isNetworkValid) {
        return 'Wrong network'
      } else if (this.fund.rebalance.state == 'Proposal') {
        return 'Rebalance in Proposal state'
      } else if (this.fund.rebalance.state == 'Trading') {
        return 'Trading session in progress'
      } else if (this.fund.totalNoOfTokens.eq(0)) {
        return 'No token supply'
      }
      return undefined
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
    format(n) {
      if (isNaN(n)) return '-'

      if (n === 0) return '0'

      let s

      // numeral returns NaN for numbers with precision less than 10^-6
      if (Math.abs(n) < 0.000001) {
        return new BigNumber(n).toFormat(18)
      }

      if (n < 1000000) {
        s = numeral(n).format('0,0.[000000000000000000]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.[0000]a')
      }
      return s == 'NaN' ? '0' : s
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
.right.floated.meta {
  margin-left: 1rem;
}
</style>