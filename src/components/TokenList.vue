<template>
  <div
    xstyle="background-color: red"
    :style="{ height: maxHeightInPx, 'max-height': maxHeightInPx }"
  >
    <table
      v-if="showHeader"
      class="ui clear table bottom aligned"
      style="margin: 0; border-spacing: 0"
      :style="{ 'font-size': fontSize }"
    >
      <thead class="full-width">
        <!-- Header, also used to impose the columns' widths -->
        <tr
          :class="{
            paddedTr: showPadding
          }"
        >
          <th :style="styles.asset.style">
            {{ styles.asset.header }}
          </th>
          <th
            v-if="styles.allocation"
            class="right aligned"
            :style="styles.allocation.style"
          >
            {{ styles.allocation.header }}
          </th>
          <th
            v-if="styles.quantity"
            class="right aligned"
            :style="styles.quantity.style"
          >
            {{ styles.quantity.header }}
          </th>
          <th
            v-if="styles.quantity2"
            class="right aligned"
            :style="styles.quantity2.style"
          >
            {{ styles.quantity2.header }}
          </th>
          <th
            v-if="styles.wallet"
            class="right aligned"
            :style="styles.wallet.style"
          >
            {{ styles.wallet.header }}
          </th>
        </tr>
      </thead>
    </table>

    <div
      :id="containerId"
      style="overflow: auto; xbackground-color: blue"
      :style="{ 'max-height': tableMaxHeightInPx }"
    >
      <table
        class="ui clear table"
        style="border-spacing: 0"
        :style="{ 'font-size': fontSize }"
      >
        <tbody>
          <TokenListItem
            v-for="token in tokens"
            :key="token.symbol"
            :parent-id="parentId"
            :token="token"
            :styles="styles"
            :format-quantity="formatQuantity"
            :format-wallet="formatWallet"
            :show-full-name="showFullName"
            :quantity-property-name="quantityPropertyName"
            :selected="selected == token.symbol"
            :show-padding="showPadding"
            :enable-hover-effect="enableHoverEffect"
            @mouseover="$emit('selectedAsset', token.symbol)"
            @mouseout="$emit('selectedAsset', '')"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
    
<script>
import TokenListItem from './TokenListItem.vue'

export default {
  name: 'TokenList',
  components: { TokenListItem },
  mixins: [],
  props: {
    parentId: {
      type: String,
      required: true
    },
    tokens: {
      type: Array,
      required: true
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    formatQuantity: {
      type: Function,
      required: true
      // default: (n) => {
      //   return n
      // }
    },
    formatWallet: {
      type: Function,
      required: true
      // default: (n) => {
      //   return n
      // }
    },
    quantityPropertyName: {
      type: String,
      default: 'required'
    },
    maxHeight: {
      type: [Number, String],
      default: '100%'
    },
    showFullName: {
      type: Boolean,
      default: true
    },
    selected: {
      type: String,
      default: ''
    },
    showPadding: {
      type: Boolean,
      default: false
    },
    enableHoverEffect: {
      type: Boolean,
      default: false
    },
    fontSize: {
      type: String,
      default: 'initial'
    },
    styles: {
      type: Object,
      required: true
    }
  },
  data() {
    return {}
  },
  computed: {
    containerId() {
      return (this.parentId + 'tbody').replaceAll('.', '_')
    },
    maxHeightInPx() {
      return typeof this.maxHeight === 'number'
        ? `${this.maxHeight}px`
        : this.maxHeight
    },
    tableMaxHeight() {
      return (typeof this.maxHeight === 'number' ? this.maxHeight : 300) - 30
    },
    tableMaxHeightInPx() {
      return this.tableMaxHeight + 'px'
    }
  },
  watch: {
    selected(v) {
      if (v === '') return
      const id = (this.parentId + '.' + v).replaceAll('.', '_')
      const topPos = document.getElementById(id).offsetTop
      this.scrollTo(document.getElementById(this.containerId), topPos, 300)
    }
  },
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    scrollTo(element, to, duration) {
      let start = element.scrollTop,
        change = to - start,
        currentTime = 0,
        increment = 20

      let animateScroll = () => {
        currentTime += increment
        let val = this.easeInOutQuad(currentTime, start, change, duration)
        element.scrollTop = val
        if (currentTime < duration) {
          setTimeout(animateScroll, increment)
        }
      }
      animateScroll()
    },
    /**
     * @param {Number} time - current time
     * @param {Number} startValue - start value
     * @param {Number} changes - change in value
     * @param {Number} duration - animation duration
     */
    easeInOutQuad(time, startValue, changes, duration) {
      time /= duration / 2
      if (time < 1) return (changes / 2) * time * time + startValue
      time--
      return (-changes / 2) * (time * (time - 2) - 1) + startValue
    }
  }
}
</script>
    
<style scoped>
tr th {
  padding: 0.3rem 0 !important;
  text-transform: capitalize !important;
}

tr th:first-child {
  padding-left: 2.3rem !important;
}

tr th:last-child {
  padding-right: 0.3rem !important;
}

tr.paddedTr th:first-child {
  padding-left: 3.3rem !important;
}

tr.paddedTr th:last-child {
  padding-right: 1rem !important;
}
</style>