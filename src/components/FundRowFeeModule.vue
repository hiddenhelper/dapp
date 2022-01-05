<template>
  <tr :key="fund.symbol + 'row' + _uid" style="height: 75px; max-height: 95px">
    <td style="min-width: 16px; padding: 0; cursor: default"></td>
    <td style="width: 100%; padding-left: 0; padding-right: 0">
      <table style="width: 100%; border-spacing: 0">
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
                  />
                </td>
                <td width="99%" style="line-height: normal; position: relative">
                  <b> {{ fund.symbol }} </b>
                  <div
                    class="_muted"
                    style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis"
                  >
                    {{ fund.name }}
                  </div>
                </td>
              </tr>
            </table>
          </td>

          <td :style="styles[1]">
            <CopyField
              v-if="receiverAddress"
              :text="receiverAddressShort"
              :value="receiverAddress"
              style="max-width: 115px"
            />
            <div class="_muted">
              {{ token }}
            </div>
          </td>
          <td :style="styles[2]" style="text-align: right; font-size: 1.5rem">
            {{ feePercentage }} %
          </td>
          <td style="text-align: right; padding-right: 2rem" :style="styles[3]">
            {{ earnedFees }}
            <div class="_muted">{{ formatPrice(earnedFeesUsd.toNumber()) }}</div>
          </td>
          <td :style="styles[4]" style="text-align: right; padding-right: 1rem">
            <div
              class="ui basic button"
              :class="{ disabled: earnedFeesUsd.lt(0.01) }"
              @click="$emit('accrue', fund)"
            >
              Accrue
            </div>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</template>

<script>
import numeral from 'numeral'
import FundLogoSvg from './FundLogoSvg.vue'
import CopyField from './CopyField.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'FundRowFeeModule',
  components: { FundLogoSvg, CopyField },
  mixins: [],
  props: {
    fund: {
      type: Object,
      required: true
    },
    styles: {
      type: Array,
      required: true
    }
  },
  data() {
    return {}
  },
  computed: {
    ...mapGetters(['getFundModule']),
    feeModule() {
      return this.getFundModule(this.fund.symbol, 'StreamingFeeModule')
    },
    receiverAddress() {
      return this.feeModule.settings.streamingFeeSettings.receiver
    },
    receiverAddressShort() {
      const f = this.receiverAddress
      if (f) {
        return f.substring(0, 6) + '...' + f.substring(f.length - 4)
      }
      return ''
    },
    token() {
      return this.feeModule.settings.streamingFeeSettings.payFeeWithDextf ? 'DEXTF' : 'fund foken'
      // : this.fund.symbol
    },
    feePercentage() {
      return this.feeModule.settings.streamingFeeSettings.streamingFeePercentage.toFormat(2)
    },
    earnedFees() {
      return this.format(this.feeModule.settings.streamingFeeSettings.earnedFees.toNumber())
    },
    earnedFeesUsd() {
      const usdValue = this.feeModule.settings.streamingFeeSettings.earnedFees.times(
        this.fund.currentPrice()
      )
      return usdValue
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
      let s
      if (n < 1000000) {
        s = numeral(n).format('0,0.[000000000000000000]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.[0000]a')
      }
      return s == 'NaN' ? '0' : s
    },
    formatPrice(n, limit = 1000000) {
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
    }
  }
}
</script>

<style scoped>
</style>
