<template>
  <div class="ui fluid card" style="padding: 24px 32px">
    <div class="content" style="padding: 0">
      <Breakdown
        :title="{ text: 'Fund details' }"
        :styles="breakdownStyles"
        :list-label="`Allocation (${tokens.length} assets)`"
        :show-padding="true"
        :format-quantity="format"
        :format-wallet="format"
        :tokens="tokens"
        :show-full-name="false"
      />

      <div
        class="ui top attached tabular menu"
        style="min-height: 2rem; margin-top: 0; font-size: 0.7rem !important"
        id="tabs"
      >
        <div class="active item" data-tab="tab-factsheet">FACTSHEET</div>
        <div class="item" data-tab="tab-fees">FEES</div>
      </div>
      <div
        class="ui bottom attached tab segment"
        style="padding-bottom: 0; margin-bottom: 0"
        data-tab="tab-factsheet"
      >
        <div class="ui input fluid" style="xbackground-color: red; height: 185px">
          <textarea
            rows="7"
            v-model.trim="fund.description"
            style="
              padding: 0;
              text-justify: inter-word;
              width: 100%;
              background: transparent;
              resize: none;
              color: rgba(255, 255, 255, 0.6);
            "
            readonly
          >
          </textarea>
        </div>
      </div>
      <div
        class="ui bottom attached tab segment"
        style="padding-bottom: 0; margin-bottom: 0; xbackground-color: grey"
        data-tab="tab-fees"
      >
        <div v-if="feeModule">
          <table style="border-spacing: 0 1rem">
            <tr>
              <td class="_muted" style="padding-right: 1rem">Management Fee:</td>
              <td style="color: white; font-weight: 500">
                {{ managementFee }}
                p.a. of <b>total supply</b>
              </td>
            </tr>

            <tr v-if="managed">
              <td class="_muted" style="padding-right: 1rem">Receiver:</td>
              <td style="color: white; font-weight: 500">
                <CopyField
                  :text="feeReceiverShort"
                  :value="feeReceiver"
                  style="color: white; font-weight: 500"
                />
              </td>
            </tr>

            <tr v-if="managed">
              <td class="_muted" style="padding-right: 1rem">Earned {{ fund.symbol }}:</td>
              <td style="color: white; font-weight: 500">
                {{ earnedFees }}
              </td>
            </tr>

            <tr v-if="managed">
              <td class="_muted" style="padding-right: 1rem">Latest accrual:</td>
              <td style="color: white; font-weight: 500">
                {{ latestAccrual }}
              </td>
            </tr>
          </table>
        </div>
        <div v-else-if="managed" class="_muted" style="margin-top: 1rem">
          Management fee module is missing
        </div>
        <div v-else class="_muted" style="margin-top: 1rem">n/a</div>
      </div>
    </div>
  </div>
</template>
    
<script>
import numeral from 'numeral'
import BigNumber from 'bignumber.js'
import { Module } from '@helium'

import Breakdown from '../components/Breakdown.vue'
import CopyField from '../components/CopyField.vue'

export default {
  name: 'FundDetails',
  components: { Breakdown, CopyField },
  mixins: [],
  props: {
    fund: {
      type: Object,
      required: false,
      default: () => {
        return {
          symbol: '',
          description: '',
          assets: []
        }
      }
    }
  },
  data() {
    return {
      breakdownStyles: {
        asset: {
          header: 'Asset',
          style: 'width: 100%; xbackground-color: yellow'
        },
        allocation: {
          header: 'Allocation',
          style: 'min-width: 70px; xbackground-color: blue'
        }
      },
      activeTab: 'tab-factsheet'
    }
  },
  computed: {
    allocation() {
      if (this.fund.allocation) {
        return this.fund.created ? this.fund.allocation.current : this.fund.allocation.inception
      }
      return undefined
    },
    tokens() {
      if (this.allocation) {
        /*
        this.log(
          `${this.allocation.assets.length} assets: `,
          this.allocation.assets.reduce(
            (a, v) =>
              a + ', ' + v.unitQuantity.toString() + ` (${v.percentage}%)`,
            'current unitQuantities and %'
          )
        )
        */

        return this.allocation.assets.map((a) => {
          const assetDef = this.$store.getters.getAssetBySymbol(a.symbol)
          const unitQuantity = a.unitQuantity ? a.unitQuantity.toString() : '0'
          return {
            symbol: a.symbol,
            percentage: a.percentage,
            image: assetDef.image,
            color: assetDef.color,
            price: assetDef.price.toString(),
            unitQuantity: unitQuantity
          }
        })
      }
      return []
    },
    feeModule() {
      if (this.fund.hasStreamingFeeModule) {
        return this.$store.getters.getFundModule(this.fund.symbol, Module.StreamingFeeModule)
      }
      return undefined
    },
    managementFee() {
      let pct = 0
      if (this.feeModule) {
        pct = this.feeModule.settings.streamingFeeSettings.streamingFeePercentage.toNumber()
      }
      return this.formatPct(pct)
    },
    earnedFees() {
      if (this.feeModule) {
        return this.format(this.feeModule.settings.streamingFeeSettings.earnedFees.toNumber())
      }
      return '-'
    },
    feeReceiver() {
      if (this.feeModule) {
        return this.feeModule.settings.streamingFeeSettings.receiver
      }
      return '-'
    },
    feeReceiverShort() {
      if (this.feeModule) {
        return (
          this.feeReceiver.substring(0, 6) +
          '...' +
          this.feeReceiver.substring(this.feeReceiver.length - 4)
        )
      }
      return '-'
    },
    latestAccrual() {
      if (this.feeModule) {
        const timestamp = this.feeModule.settings.streamingFeeSettings.lastStreamingFeeTimestamp
        if (timestamp.gt(999999)) {
          return new Date(timestamp.toNumber()).toLocaleString()
        }
      }
      return '-'
    },
    managed() {
      return this.isFundManager && this.fund.fundManagerEmail == this.$store.state.user.userId
    }
  },
  watch: {},
  beforeCreate() {},
  created() {
    numeral.zeroFormat('0.00')
    numeral.nullFormat('0.00')
  },
  beforeMount() {},
  mounted() {
    // $('.ui.button.factsheet').on('click', () => {
    //   this.changeTab('tab-factsheet')
    // })
    // $('.ui.button.allocation').on('click', () => {
    //   this.changeTab('tab-allocation')
    // })
    $('#tabs .item').tab()
  },
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {
    // $('.ui.button.factsheet').off('click')
    // $('.ui.button.allocation').off('click')
  },
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
    formatPct(n, maxDecimals = 2) {
      if (isNaN(n)) return '-'

      return n == 0 ? '0%' : numeral(n).format(`0.[${'0'.repeat(maxDecimals)}]`) + '%'
    },
    changeTab(tab) {
      this.activeTab = tab
      $('#tabs').tab('change tab', tab)
    }
  }
}
</script>
    
<style scoped>
._activeButton {
  -webkit-box-shadow: 0 0 0 1px #ffe2fe inset !important;
  box-shadow: 0 0 0 1px #ffe2fe inset !important;
  color: #ffe2fe !important;
  background-color: rgba(255, 226, 254, 0.08) !important;
  border: 1px solid #ffe2fe !important;
}
._inactiveButton {
  -webkit-box-shadow: 0 0 0 1px transparent inset !important;
  box-shadow: 0 0 0 1px transparent inset !important;
  color: #8e8e8e !important;
  border: 1px solid transparent !important;
}
</style>