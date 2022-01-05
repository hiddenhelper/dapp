<template>
  <div
    style="border-radius: 8px"
    :style="{
      'background-color': bgColor,
      width: totalWidthInPx
    }"
  >
    <table style="width: 100%; height: 50px; border-spacing: 0">
      <tr
        :style="{
          height: input.extraDerivedValue ? '33.33%' : '50%',
          'background-color': bgColor
        }"
      >
        <td
          style="border-top-left-radius: 8px !important; padding: 0"
          :style="{
            'background-color': bgInput,
            'border-top-right-radius': rightLabel ? undefined : '8px !important'
          }"
        >
          <div
            class="ui input _superCompactInput"
            :class="{ disabled: readOnly }"
          >
            <BigNumberInput
              :input-value="value"
              @changed="changed($event)"
              :style="{
                'max-width': inputMaxWidthInPx,
                'padding-right': rightLabel
                  ? '0rem !important'
                  : '0.4rem !important',
                color: colorInput
              }"
            />
          </div>
        </td>
        <td
          v-if="rightLabel"
          style="border-top-right-radius: 8px !important"
          :style="{
            width: labelColumnWidthInPx,
            'background-color': bgInput,
            color: colorInput,
            'xborder-top-right-radius': rightLabel
              ? undefined
              : '8px !important',
            'padding-right': rightLabel ? '0.5rem !important' : '0 !important'
          }"
        >
          {{ rightLabel }}
        </td>
      </tr>
      <tr :style="{ height: input.extraDerivedValue ? '33.33%' : '50%' }">
        <td
          :colspan="rightLabel ? 2 : undefined"
          class="right aligned _muted"
          style="padding-right: 0.5rem"
          :style="{
            'border-bottom-left-radius': input.extraDerivedValue
              ? undefined
              : '8px !important',
            'border-bottom-right-radius': input.extraDerivedValue
              ? undefined
              : '8px !important',
            'background-color': bgDerived,
            color: colorDerived
          }"
        >
          {{ input.derivedValue }}
        </td>
      </tr>
      <tr
        v-if="input.extraDerivedValue"
        :style="{ height: input.extraDerivedValue ? '33.33%' : '50%' }"
      >
        <td
          :colspan="rightLabel ? 2 : undefined"
          class="right aligned _muted"
          style="
            border-bottom-left-radius: 8px !important;
            border-bottom-right-radius: 8px !important;
            padding-right: 0.5rem;
          "
          :style="{ 'background-color': bgDerived, color: colorDerived }"
        >
          {{ input.extraDerivedValue }}
        </td>
      </tr>
    </table>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'

import BigNumberInput from './BigNumberInput.vue'

export default {
  name: 'DerivedBigNumberInput',
  components: { BigNumberInput },
  mixins: [],
  props: {
    input: {
      type: Object,
      default: () => {
        return {
          id: '<id>',
          value: new BigNumber(0),
          derivedValue: '',
          error: false
        }
      }
    },
    rightLabel: {
      type: String,
      default: ''
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    totalWidth: {
      type: Number,
      default: 200
    }
  },
  data() {
    return {
      value: undefined
    }
  },
  computed: {
    totalWidthInPx() {
      const w = this.totalWidth + 'px'
      // console.log('totalWidthInPx', w)
      return w
    },
    inputMaxWidth() {
      return this.totalWidth - this.labelColumnWidth
    },
    inputMaxWidthInPx() {
      const w = this.inputMaxWidth + 'px'
      // console.log('inputMaxWidthInPx', w)
      return w
    },
    labelColumnWidth() {
      return 21 // 15
    },
    labelColumnWidthInPx() {
      const w = this.labelColumnWidth + 'px'
      // console.log('labelColumnWidthInPx', w)
      return w
    },
    bgColor() {
      return this.readOnly ? 'transparent' : '#323232'
    },
    bgInput() {
      return this.readOnly ? 'transparent' : '#0c0c0c'
    },
    colorInput() {
      return this.input.error ? '#CF6679 !important' : this.colorDerived
      // return this.readOnly
      //   ? this.colorDerived
      //   : this.input.error
      //   ? '#CF6679 !important'
      //   : undefined
    },
    bgDerived() {
      return this.readOnly ? 'transparent' : '#2a2a2a'
    },
    colorDerived() {
      return !this.value || this.value.eq(0) ? '#393939 !important' : undefined
    }
  },
  watch: {
    input: {
      deep: true,
      handler() {
        if (this.input.value) {
          // Assign a clone of the original BigNumber
          this.value = new BigNumber(this.input.value)
        } else {
          this.value = undefined
        }
      }
    }
  },
  beforeCreate() {},
  created() {
    if (this.input.value) {
      // Assign a clone of the original BigNumber
      this.value = new BigNumber(this.input.value)
    } else {
      this.value = undefined
    }
  },
  beforeMount() {},
  mounted() {
    // this.input(10)
  },
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    changed(e) {
      // this.log('DerivedBigNumberInput.input', typeof e, e.toString())
      this.$emit('changed', e)
    }
  }
}
</script>

<style scoped>
._superCompactInput {
  xbackground-color: #ff0000 !important;
  height: 100% !important;
}

._superCompactInput > input {
  xbackground-color: #00ff00 !important;
  background-color: transparent !important;
  padding-left: 0.2rem !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  color: white !important;
}
</style>
