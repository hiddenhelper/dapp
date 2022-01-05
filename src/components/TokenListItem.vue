<template>
  <tr
    :style="{ 'font-size': fontSize }"
    :class="{
      paddedTr: showPadding,
      hoverEffect: enableHoverEffect,
      _selected: selected,
      _muted: true
    }"
    :id="parentId + '_' + token.symbol"
    @mouseover="$emit('mouseover')"
    @mouseout="$emit('mouseout')"
  >
    <td :style="styles.asset.style">
      <Token
        :image="token.image"
        :label="showFullName ? token.description : token.symbol"
        :tooltip="showFullName ? undefined : token.description"
      />
    </td>
    <td
      v-if="styles.allocation"
      class="right aligned"
      :style="styles.allocation.style"
    >
      {{ token.percentage }}%
    </td>
    <td
      v-if="styles.quantity"
      class="right aligned"
      :style="styles.quantity.style"
    >
      {{ formatQuantity(quantity) }}
    </td>
    <td
      v-if="styles.quantity2"
      class="right aligned"
      :style="styles.quantity2.style"
    >
      {{ formatQuantity(quantity2) }}
    </td>
    <td v-if="styles.wallet" class="right aligned" :style="styles.wallet.style">
      <span
        class="ui text"
        :class="{ error: token.balanceError }"
        :style="{
          filter:
            !token.balanceError && token.balance <= 0.000000000000000001
              ? 'brightness(40%)'
              : 'none'
        }"
      >
        {{ formatWallet(token.balance) }}
      </span>
    </td>
  </tr>
</template>

<script>
import Token from './Token.vue'

export default {
  name: 'TokneListItem',
  components: { Token },
  mixins: [],
  props: {
    parentId: {
      type: String,
      required: true
    },
    token: {
      type: Object,
      required: true,
      default: () => {
        return {}
      }
    },
    styles: {
      type: Object,
      required: true
    },
    fontSize: {
      type: String,
      default: 'inherit'
    },
    showFullName: {
      type: Boolean,
      default: true
    },
    formatQuantity: {
      type: Function,
      default: (n) => {
        return n
      }
    },
    formatWallet: {
      type: Function,
      default: (n) => {
        return n
      }
    },
    selected: {
      type: Boolean,
      required: true
    },
    showPadding: {
      type: Boolean,
      required: true
    },
    enableHoverEffect: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      noOfDecimals: 4
      // assetDef: undefined
    }
  },
  computed: {
    // image() {
    //   return this.assetDef ? this.assetDef.image : ''
    // },
    // description() {
    //   return this.assetDef ? this.assetDef.description : '-'
    // },
    quantity() {
      const qty = this.token[this.styles.quantity.key || 'required']
      if (qty) {
        return qty.eq(0) ? '-' : qty.toNumber()
      }
      return '-'
    },
    quantity2() {
      const qty = this.token[this.styles.quantity2.key]
      if (qty) {
        return qty.eq(0) ? '-' : qty.toNumber()
      }
      return '-'
    }
    // ,balance() {
    //   return this.assetDef ? this.assetDef.balance.wallet.toNumber() : 0
    // },
    // balanceError() {
    //   return this.assetDef ? this.assetDef.balanceError : false
    // }
  },
  watch: {},
  beforeCreate() {},
  created() {
    // this.assetDef = this.$store.getters.getAssetBySymbol(this.asset.symbol)
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {}
}
</script>

<style scoped>
tr {
  background-color: transparent !important;
}

tr td {
  padding: 0.3rem 0 !important;
}

tr td:first-child {
  padding-left: 0.3rem !important;
}

tr td:last-child {
  padding-right: 0.3rem !important;
}

tr.paddedTr td:first-child {
  padding-left: 1rem !important;
}

tr.paddedTr td:last-child {
  padding-right: 1rem !important;
}

tr.hoverEffect:hover,
._selected {
  background-color: rgba(117, 250, 76, 0.05) !important;
}
</style>
