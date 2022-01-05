<template>
  <input
    :style="{ 'text-align': textAlign }"
    placeholder="0.00"
    type="text"
    minlength="1"
    maxlength="79"
    v-model="value"
    :id="inputId"
    :disabled="disabled"
    @keydown.stop="keyDown($event)"
    @input="input()"
  />
</template>

<script>
import BigNumber from 'bignumber.js'

const REGEX = new RegExp('^[0-9]*[.,]?[0-9]*$')

export default {
  name: 'BigNumberInput',
  components: {},
  mixins: [],
  props: {
    inputValue: {
      type: Object,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    textAlign: {
      type: String,
      default: 'right'
    },
    id: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      value: '',
      previousValue: ''
    }
  },
  computed: {
    inputId() {
      return this.id || this._uid
    }
  },
  watch: {
    inputValue(v) {
      if (v && v.gt(0)) {
        this.value = v.toString()
        this.previousValue = v.toString()
      } else {
        this.value = ''
        this.previousValue = 'NaN'
      }
    }
  },
  beforeCreate() {},
  created() {
    this.value = this.inputValue ? this.inputValue.toString() : ''
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    keyDown(event) {
      // this.log('BigNumberInput.keyDown', event)

      let validKey = false

      switch (event.key) {
        case '.':
          validKey = this.value && !this.value.includes('.')
          break

        case 'Left': // IE/Edge specific value
        case 'ArrowLeft':
        case 'Right': // IE/Edge specific value
        case 'ArrowRight':
        case 'Esc': // IE/Edge specific value
        case 'Escape':
        case 'Tab':
        case 'Down': // IE/Edge specific value
        case 'ArrowDown':
        case 'Up': // IE/Edge specific value
        case 'ArrowUp':
        case 'Backspace':
        case 'Delete':
        case 'Del':
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
          validKey = true
          break

        case 'v':
        case 'V':
        case 'c':
        case 'C':
        case 'x':
        case 'X':
          validKey = event.ctrlKey || event.metaKey
          break

        default:
          // Invalid key
          break
      }

      /* Allow paste */

      if (!validKey || this.disabled) {
        event.preventDefault()
      }
    },
    input() {
      const newValue = new BigNumber(this.value || 0)
      const previousValue = new BigNumber(this.previousValue || 0)

      if (newValue.eq(previousValue)) {
        return
      }

      this.previousValue = this.value

      // if (!previousValue.isNaN()) {
      this.$emit('changed', newValue)
      // }
    }
  }
}
</script>

<style scoped>
</style>
