<template>
  <div class="ui form">
    <div class="ui compact grid">
      <div class="three wide middle aligned column">
        <b>Annualized fee</b>
      </div>
      <div class="three wide column">
        <table
          style="
            border-spacing: 0;
            xbackground-color: red;
            background-color: #0c0c0c;
            border-radius: 8px;
          "
        >
          <tr>
            <td>
              <BigNumberInput
                :input-value="vFee"
                style="
                  padding-top: 0.9rem;
                  padding-bottom: 0.9rem;
                  padding-right: 0.2rem;
                "
                @changed="feeChanged($event)"
              />
            </td>
            <td style="padding-right: 0.5rem">%</td>
          </tr>
        </table>
      </div>
      <div class="ten wide column">
        <div
          id="fee-slider"
          class="ui bottom aligned labeled ticked small slider _muted"
          style="padding-top: 0"
        ></div>
      </div>

      <div class="three wide middle aligned column">
        <b>Receiver</b>
      </div>
      <div class="thirteen wide column">
        <div
          class="ui icon input"
          :data-tooltip="!addressIsValid ? 'Invalid address' : undefined"
          data-position="top center"
          data-inverted=""
        >
          <input
            type="text"
            placeholder="Enter wallet address..."
            maxlength="42"
            v-model="vReceiverAddress"
            style="width: 100%"
            @input="addressChanged()"
          />
          <i
            v-show="!addressIsValid"
            class="exclamation icon"
            :class="{ _error: !addressIsValid }"
          ></i>
        </div>
      </div>

      <div class="three wide middle aligned column">
        <b>Token</b>
      </div>
      <div class="three wide middle aligned column">
        <div class="ui radio checkbox">
          <input
            type="radio"
            name="token"
            id="token_dextf"
            @change="useDextfTokenForFee(true)"
            :checked="feeWithDextf"
          />
          <label for="token_dextf">DEXTF</label>
        </div>
      </div>
      <div class="ten wide middle aligned column">
        <div class="ui radio checkbox">
          <input
            type="radio"
            name="token"
            id="token_other"
            @change="useDextfTokenForFee(false)"
            :checked="!feeWithDextf"
          />
          <label for="token_other">{{ fundToken }}</label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'
import BigNumberInput from './BigNumberInput.vue'
import { utils as etherUtils } from 'ethers'

export default {
  name: 'StreamingFee',
  components: { BigNumberInput },
  mixins: [],
  props: {
    streamingFeePercentage: {
      type: BigNumber,
      required: true
    },
    maxFee: {
      type: BigNumber,
      default: () => new BigNumber(3)
    },
    receiver: {
      type: String,
      default: function () {
        return this.$store.state.currentAccount.address
      }
    },
    fundToken: {
      type: String,
      required: true
    },
    payFeeWithDextf: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      vFee: this.streamingFeePercentage,
      vReceiverAddress: this.receiver,
      addressIsValid: false,
      feeWithDextf: true,
      startModuleValues: {
        streamingFeePercentage: this.streamingFeePercentage
      }
    }
  },
  computed: {},
  watch: {},
  beforeCreate() {},
  created() {
    this.validateAddress()
    this.feeWithDextf = this.payFeeWithDextf
  },
  beforeMount() {},
  mounted() {
    // Timeout is necessary to give thre time to the fomantic UI js
    // to calculate the ticks and half-ticks
    const step = 0.25
    setTimeout(() => {
      $('#fee-slider').slider({
        min: 0,
        max: this.maxFee.toNumber(),
        start: this.vFee.toNumber(),
        step: step,
        smooth: false,
        interpretLabel: (v) => `${v * step}%`,
        onChange: this.sliderChanged
      })
    }, 100)

    // Emit changed event forcefully
    // this.addressChanged()
  },
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    validateAddress() {
      try {
        const validAddress = etherUtils.getAddress(
          this.vReceiverAddress.toLowerCase()
        )
        this.vReceiverAddress = validAddress
        this.addressIsValid = true
      } catch (error) {
        this.addressIsValid = false
      }
    },
    feeChanged(value) {
      if (!value.eq(this.vFee)) {
        // Next will trigger sliderChanged
        $('#fee-slider').slider('set value', value.toNumber())
      }
    },
    sliderChanged(value) {
      this.vFee = new BigNumber(value)
      this.changed()
    },
    addressChanged() {
      // try {
      //   const validAddress = etherUtils.getAddress(
      //     this.vReceiverAddress.toLowerCase()
      //   )
      //   this.vReceiverAddress = validAddress
      //   this.addressIsValid = true
      // } catch (error) {
      //   this.addressIsValid = false
      // }
      this.validateAddress()
      this.changed()
    },
    useDextfTokenForFee(b) {
      if (this.feeWithDextf !== b) {
        this.feeWithDextf = b
        this.changed()
      }
    },
    changed() {
      const updatedFields = []
      if (!this.startModuleValues.streamingFeePercentage.eq(this.vFee)) {
        updatedFields.push('streamingFeePercentage')
      }

      this.$emit('changed', {
        streamingFeePercentage: this.vFee,
        receiver: this.addressIsValid ? this.vReceiverAddress : '',
        payFeeWithDextf: this.feeWithDextf,
        updatedFields: updatedFields
      })
    }
  }
}
</script>

<style scoped>
</style>