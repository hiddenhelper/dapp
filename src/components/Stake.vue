<template>
  <div class="ui card">
    <div class="content">
      <div
        style="text-decoration: underline"
        @click="!disabled && !max.eq(0) && setMax()"
        :data-tooltip="maxButtonTooltip"
        data-position="top left"
        data-inverted=""
        :style="{
          color: disabled ? 'grey' : undefined,
          cursor: disabled ? 'not-allowed' : 'pointer'
        }"
      >
        SET MAX
      </div>
      <div
        class="ui left icon input"
        :data-tooltip="wrongInput"
        data-position="bottom left"
        data-inverted=""
      >
        <BigNumberInput
          :input-value="noOfTokens"
          :disabled="disabled"
          @changed="stakeValueChanged($event)"
          style="
            padding: 0 9px 0 0;
            font-size: 27px;
            font-weight: 600;
            background-color: transparent;
            border-radius: 0;
            width: 100%;
            border-color: transparent;
          "
        />

        <i
          class="small icon"
          :class="iconClass"
          style="width: 15px; margin-left: -15px"
        ></i>
      </div>
      <label class="_muted" style="font-weight: normal">
        {{ expectedPriceUsd }}
      </label>
    </div>
    <div class="extra content" style="padding-top: 0">
      <div
        class="ui fluid button"
        :class="{
          disabled: disabled || amountExceed || invalidBalance,
          primary: !unavailable
        }"
        @click="$emit(action, noOfTokens)"
      >
        {{ action === 'stake' ? 'Stake' : 'Unstake' }}
      </div>
    </div>
  </div>
</template>

<script>
import BigNumberInput from './BigNumberInput.vue'
import BigNumber from 'bignumber.js'
import numeral from 'numeral'

export default {
  name: 'Stake',
  components: {
    BigNumberInput
  },
  props: {
    action: {
      type: String,
      default: 'stake'
    },
    price: {
      type: BigNumber,
      default: new BigNumber(0)
    },
    max: {
      type: BigNumber,
      default: new BigNumber(0)
    },
    maxButtonTooltip: {
      type: String,
      required: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    unavailable: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      noOfTokens: undefined,
      wrongInput: undefined
    }
  },
  computed: {
    expectedPriceUsd() {
      return this.formatPrice(
        this.price
          .multipliedBy(this.noOfTokens ? this.noOfTokens : new BigNumber(0))
          .toNumber()
      )
    },
    iconClass() {
      return {
        'exclamation _error': this.wrongInput !== undefined
      }
    },
    amountExceed() {
      return this.noOfTokens && this.max.lt(this.noOfTokens)
    },
    invalidBalance() {
      return (
        this.noOfTokens === undefined || this.noOfTokens.eq(0) || this.max.eq(0)
      )
    }
  },
  methods: {
    formatQuantity(n, limit = 1000000) {
      if (isNaN(n)) return '-'

      // numeral returns NaN for numbers with precision less than 10^-6
      if (Math.abs(n) < 0.000001) {
        return '0'
      }

      let s
      if (n < limit) {
        s = numeral(n).format('0,0.[000]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.[00]a')
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
        s = numeral(n).format('0,0.[00]a')
      }
      return s == 'NaN' ? '0' : '$' + s
    },
    stakeValueChanged(event) {
      if (!event.eq(this.noOfTokens)) {
        this.noOfTokens = event
      }
      this.wrongInput = this.validateNoOfTokens()
    },
    setMax() {
      this.noOfTokens = this.max
    },
    validateNoOfTokens() {
      if (this.noOfTokens === undefined) return undefined
      if (this.noOfTokens.gt(0)) {
        if (this.max.eq(0)) {
          return 'No Allowance'
        }

        if (this.noOfTokens.gt(this.max)) {
          return `Max ${this.max}`
        }
      }
    }
  }
}
</script>