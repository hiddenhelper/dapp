<template>
  <tr
    ref="row"
    v-show="isVisible"
    :class="{ '_suppress-box-shadow': styles.percentageInput }"
    :style="{ 'font-size': fontSize }"
    xstyle="background-color: yellow"
  >
    <td
      style="border-radius: 8px !important; xbackground-color: red !important"
      :style="styles.asset.style"
    >
      <table style="width: 100%; border-spacing: 0; xbackground-color: green">
        <tr>
          <td style="padding-left: 0.5rem !important; xbackground-color: red">
            <Token
              :image="image"
              :label="asset.symbol"
              :sub-label="showFullName ? description : undefined"
              :tooltip="showFullName ? undefined : description"
              @click="selectAsset()"
              :style="{ cursor: readOnly ? 'default' : 'pointer' }"
            />
          </td>

          <td
            v-if="styles.address"
            class="center aligned"
            :style="styles.address.style"
          >
            <CopyField
              v-if="asset.contract"
              :text="contractShort"
              :value="this.asset.contract"
              class="_muted"
            />
          </td>

          <td
            v-if="styles.price24h"
            class="right aligned"
            :style="styles.price24h.style"
          >
            <PriceChange24h
              :change24-hour-pct="change24HourPct"
              :price="price"
              :price-link="asset.coinGecko"
              :symbol="asset.symbol"
              :image="asset.image"
              :address="asset.contract"
              :show-add-to-meta-mask="showAddToMetaMask"
            />
          </td>

          <td
            v-if="styles.previousQtyInput"
            class="right aligned _muted"
            style="
              padding-right: 0.5rem !important;
              border: none !important;
              line-height: 1.5;
            "
            :style="styles.previousQtyInput.style"
          >
            <div
              style="color: white"
              :style="{
                filter:
                  inputPreviousAllocation.value == 0
                    ? 'brightness(40%)'
                    : 'none'
              }"
            >
              {{ formatPct(inputPreviousAllocation.value) }}
            </div>
            <div
              :style="{
                filter:
                  inputPreviousAllocation.value == 0
                    ? 'brightness(40%)'
                    : 'none'
              }"
            >
              {{
                formatQuantity(inputPreviousAllocation.derivedValue.toNumber())
              }}
            </div>
            <div
              v-if="inputPreviousAllocation.extraDerivedValue"
              :style="{
                filter:
                  inputPreviousAllocation.value == 0
                    ? 'brightness(40%)'
                    : 'none'
              }"
            >
              {{
                formatPrice(
                  inputPreviousAllocation.extraDerivedValue.toNumber()
                )
              }}
            </div>
          </td>

          <td
            v-if="styles.currentQtyInput"
            class="right aligned _muted"
            style="
              padding-right: 0.5rem !important;
              border: none !important;
              line-height: 1.5;
            "
            :style="styles.currentQtyInput.style"
          >
            <div
              style="color: white"
              :style="{
                filter:
                  inputCurrentAllocation.value == 0 ? 'brightness(40%)' : 'none'
              }"
            >
              {{ formatPct(inputCurrentAllocation.value) }}
            </div>
            <div
              :style="{
                filter:
                  inputPreviousAllocation.value == 0
                    ? 'brightness(40%)'
                    : 'none'
              }"
            >
              {{
                formatQuantity(inputCurrentAllocation.derivedValue.toNumber())
              }}
            </div>
            <div
              v-if="inputCurrentAllocation.extraDerivedValue"
              :style="{
                filter:
                  inputPreviousAllocation.value == 0
                    ? 'brightness(40%)'
                    : 'none'
              }"
            >
              {{
                formatPrice(inputCurrentAllocation.extraDerivedValue.toNumber())
              }}
            </div>
          </td>
        </tr>
      </table>
    </td>

    <td
      v-if="styles.percentageInput"
      _note="separator"
      style="padding: 0; background-color: #1e1e1e"
      :style="{
        'min-width':
          styles.percentageInput && styles.percentageInput.resettable
            ? '16px'
            : '8px',
        width:
          styles.percentageInput && styles.percentageInput.resettable
            ? '16px'
            : '8px'
      }"
    >
      <div
        v-if="true && !readOnly"
        style="z-index: 10; position: relative; right: -1.6rem"
        :style="{ top: showExtra ? '-1.5rem' : '-0.9rem' }"
        data-tooltip="remove asset"
        data-position="bottom center"
        data-inverted=""
      >
        <i
          class="ui trash alternate outline small icon _pointer"
          style="margin: 0"
          @click="changedPercentage()"
        ></i>
      </div>
    </td>
    <td
      v-if="styles.percentageInput"
      :class="{ _twoColorBg: !readOnly }"
      style="
        padding: 0 !important;
        border: none !important;
        border-radius: 8px !important;
      "
      :style="styles.percentageInput.style"
    >
      <DerivedBigNumberInput
        :input="inputPercentage"
        :right-label="'%'"
        :read-only="readOnly"
        :total-width="120"
        @changed="changedPercentage($event)"
      />
    </td>

    <td
      v-if="styles.newQtyIn"
      _note="separator"
      style="
        min-width: 16px;
        width: 16px;
        padding: 0;
        background-color: #1e1e1e;
      "
    ></td>
    <td
      v-if="styles.newQtyIn"
      class="right aligned"
      :class="{ noBg: inputInAllocation.value.eq(0) }"
      style="
        padding-right: 0.5rem !important;
        border: none !important;
        border-radius: 8px !important;
        line-height: 1.5;
      "
      :style="styles.newQtyIn.style"
    >
      <div v-show="!inputInAllocation.value.eq(0)">
        Buy
        <div class="_muted">
          {{ formatQuantity(inputInAllocation.value.toNumber()) }}
        </div>
        <div v-if="inputInAllocation.derivedValue" class="_muted">
          {{ formatPrice(inputInAllocation.derivedValue.toNumber()) }}
        </div>
      </div>
    </td>

    <td
      v-if="styles.newQtyOut"
      _note="separator"
      style="min-width: 8px; width: 8px; padding: 0; background-color: #1e1e1e"
    ></td>
    <td
      v-if="styles.newQtyOut"
      class="right aligned"
      :class="{ noBg: inputOutAllocation.value.eq(0) }"
      style="
        padding-right: 0.5rem !important;
        border: none !important;
        border-radius: 8px !important;
        line-height: 1.5;
      "
      :style="styles.newQtyOut.style"
    >
      <div v-show="!inputOutAllocation.value.eq(0)">
        Sell
        <div class="_muted">
          {{ formatQuantity(inputOutAllocation.value.toNumber()) }}
        </div>
        <div v-if="inputOutAllocation.derivedValue" class="_muted">
          {{ formatPrice(inputOutAllocation.derivedValue.toNumber()) }}
        </div>
      </div>
    </td>
  </tr>
</template>

<script>
import numeral from 'numeral'
import BigNumber from 'bignumber.js'

import Token from './Token.vue'
import CopyField from './CopyField.vue'
import PriceChange24h from './PriceChange24h.vue'
import DerivedBigNumberInput from './DerivedBigNumberInput.vue'

export default {
  name: 'AssetRow',
  components: { Token, CopyField, PriceChange24h, DerivedBigNumberInput },
  mixins: [],
  props: {
    asset: {
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
    selected: {
      type: Boolean,
      default: false
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    visible: {
      type: Boolean,
      default: true
    },
    hoverable: {
      type: Boolean,
      default: true
    },
    hoverImage: {
      type: String,
      default: ''
    },
    searchText: {
      type: String,
      required: false,
      default: ''
    },
    showAddToMetaMask: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isSelected: false,
      hovered: false,
      percentage: 0.0,
      showExtra: false
    }
  },
  computed: {
    inputPreviousAllocation() {
      return {
        id: this.asset.symbol,
        value: this.asset.allocation.previous.percentage,
        derivedValue: this.asset.allocation.previous.unitQuantity,
        extraDerivedValue:
          this.showExtra && this.asset.allocation.previous.price
            ? this.asset.allocation.previous.unitQuantity.times(
                this.asset.allocation.previous.price
              )
            : undefined
      }
    },
    inputCurrentAllocation() {
      return {
        id: this.asset.symbol,
        value: this.asset.allocation.current.percentage,
        derivedValue: this.asset.allocation.current.unitQuantity,
        extraDerivedValue:
          this.showExtra && this.asset.allocation.current.price
            ? this.asset.allocation.current.unitQuantity.times(
                this.asset.allocation.current.price
              )
            : undefined
      }
    },
    inputPercentage() {
      return {
        id: this.asset.symbol,
        value: this.asset.allocation.new.percentage,
        derivedValue: this.formatQuantity(
          this.asset.allocation.new.unitQuantity.toNumber()
        ),
        extraDerivedValue:
          this.showExtra && this.asset.allocation.new.price
            ? this.formatPrice(
                this.asset.allocation.new.unitQuantity
                  .times(this.asset.allocation.new.price)
                  .toNumber()
              )
            : undefined,
        error: this.asset.allocation.new.error
      }
    },
    inputInAllocation() {
      return {
        id: this.asset.symbol,
        value: this.asset.allocation.in.unitQuantity,
        derivedValue:
          this.showExtra && this.asset.allocation.in.price
            ? this.asset.allocation.in.unitQuantity.times(
                this.asset.allocation.in.price
              )
            : undefined
      }
    },
    inputOutAllocation() {
      return {
        id: this.asset.symbol,
        value: this.asset.allocation.out.unitQuantity,
        derivedValue:
          this.showExtra && this.asset.allocation.out.price
            ? this.asset.allocation.out.unitQuantity.times(
                this.asset.allocation.out.price
              )
            : undefined
      }
    },
    image() {
      if (!this.readOnly && this.hoverable && this.hovered && this.hoverImage) {
        return this.hoverImage
      } else {
        return this.asset.definition
          ? this.asset.definition.image
          : this.asset.image
      }
    },
    description() {
      return this.asset.definition
        ? this.asset.definition.description
        : this.asset.description
    },
    change24HourPct() {
      return this.asset.change24HourPct
        ? this.asset.change24HourPct.toNumber()
        : 0
    },
    price() {
      return this.asset.price ? this.asset.price.toNumber() : 0
    },
    balance() {
      return this.asset.definition
        ? this.asset.definition.balance.wallet.toNumber()
        : 0
    },
    formattedUnitQuantity() {
      let u

      if (this.asset.definition) {
        this.log(this.asset.symbol, 'has definition', this.asset)
        u = this.asset.definition.unitQuantity
      } else {
        // this.log(this.asset.symbol, 'has NO/IS definition', this.asset)
        u = this.asset.unitQuantity
      }
      if (u && !u.eq(0)) {
        return this.formatQuantity(u.toNumber())
      }
      return '-'
    },
    nameLowerCase() {
      return this.description.toLowerCase()
    },
    symbolLowerCase() {
      return this.asset.symbol.toLowerCase()
    },
    addressLowerCase() {
      return this.asset.contract.toLowerCase()
    },
    searchTextLowerCase() {
      return this.searchText.toLowerCase()
    },
    isVisible() {
      // Search Filter
      if (!this.visible) return false

      if (this.searchTextLowerCase.length > 0) {
        return (
          this.nameLowerCase.includes(this.searchTextLowerCase) ||
          this.symbolLowerCase.includes(this.searchTextLowerCase) ||
          this.addressLowerCase.includes(this.searchTextLowerCase)
        )
      }

      return true
    },
    contractShort() {
      const f = this.asset.contract
      if (f) {
        return f.substring(0, 6) + '...' + f.substring(f.length - 4)
      }
      return ''
    }
  },
  watch: {},
  beforeCreate() {},
  created() {
    numeral.zeroFormat('0.00')
    numeral.nullFormat('0.00')

    this.percentage =
      this.asset.percentage == 0 ? undefined : this.asset.percentage
  },
  beforeMount() {},
  mounted() {
    if (this.hoverable) {
      this.$refs.row.addEventListener('mouseenter', this.mouseEnter)
      this.$refs.row.addEventListener('mouseleave', this.mouseLeave)
    }
  },
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {
    if (this.hoverable) {
      this.$refs.row.removeEventListener('mouseenter', this.mouseEnter)
      this.$refs.row.removeEventListener('mouseleave', this.mouseLeave)
    }
  },
  destroyed() {},
  methods: {
    formatQuantity(n) {
      if (isNaN(n)) return '-'

      const precision = '0'.repeat(9)
      let s = numeral(n.toPrecision(precision.length)).format(
        `0,0.[${precision}]`
      )

      return s == 'NaN' ? '0' : s
    },
    formatPrice(n) {
      if (isNaN(n)) return '-'
      let s
      if (n < 1000000) {
        s = numeral(n).format('0,0.[000]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.00a')
      }

      return `$${s == 'NaN' ? '0' : s}`
    },
    formatPct(n) {
      if (isNaN(n)) return '-'

      return n == 0 ? '0%' : numeral(n).format('0.[0000]') + '%'
    },
    mouseEnter() {
      this.hovered = true
    },
    mouseLeave() {
      this.hovered = false
    },
    selectAsset() {
      if (this.readOnly) return
      this.$emit('selected', this.asset.symbol)
    },
    changedPercentage(value = new BigNumber(0)) {
      // this.log(this.$options.name + '.changedPercentage', value.toString())
      const data = {
        symbol: this.asset.symbol,
        percentage: value
      }
      this.$emit('changedPercentage', data)
    }
  }
}
</script>

<style scoped>
.noBg {
  background-color: rgba(30, 30, 30, 0.7) !important;
}

._twoColorBg {
  background: linear-gradient(to bottom, #0c0c0c 50%, #1e1e1e 50%) !important;
}

._suppress-box-shadow {
  box-shadow: none !important;
}

tr {
  min-height: 47px !important;
  height: 47px !important;
}

td {
  xpadding: 1px 0 !important;
  padding: 0 !important;
}

.ui.right.labeled.input {
  xmax-width: 65px;
  xbackground-color: transparent;
  xpadding: 0 !important;
  height: 100%;
  xbackground-color: red;
  xborder-radius: 8px 0 0 8px;
}

.ui.right.labeled.input > input {
  padding-left: 0.2rem;
  padding-right: 0.2rem;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  xbackground-color: blue;
  xmargin: 0.2rem 0 !important;
  color: white !important;
  background-color: transparent;
  xbackground-color: green;
}

.ui.right.labeled.input > .label {
  xmargin: 0.2rem 0 !important;
  background-color: transparent;
  xbackground-color: green;
  padding-left: 0;
  padding-right: 0.5rem;
  padding-top: 5px !important;
  padding-bottom: 0 !important;
  border-radius: 0;
  xbackground-color: yellow;
}

._superCompactGrid,
._superCompactGrid > .column {
  padding: 0 !important;
  margin: 0 !important;
}
</style>
