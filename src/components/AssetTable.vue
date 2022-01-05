<template>
  <div :style="{ height: heightInPx }">
    <!-- HEADER COLUMNS -->
    <table
      v-if="showHeader"
      class="ui clear table bottom aligned"
      style="margin: 0; border-spacing: 0; xbackground-color: blue"
      :style="{ 'font-size': fontSize }"
    >
      <thead class="full-width" style="line-height: 1.2">
        <!-- Header, also used to impose the columns' widths -->
        <tr :class="{ '_suppress-box-shadow': styles.percentageInput }">
          <th :style="styles.asset.style" v-html="styles.asset.header"></th>
          <th
            v-if="styles.address"
            class="center aligned"
            :style="styles.address.style"
          >
            {{ styles.address.header }}
          </th>

          <th
            v-if="styles.price24h"
            class="right aligned"
            :style="styles.price24h.style"
            style="padding-right: 1.9rem"
            v-html="styles.price24h.header"
          ></th>

          <th
            v-if="styles.previousQtyInput"
            class="right aligned"
            style="padding-right: 0.5rem"
            :style="styles.previousQtyInput.style"
            v-html="styles.previousQtyInput.header"
          ></th>

          <th
            v-if="styles.currentQtyInput"
            class="right aligned"
            style="padding-right: 0.5rem"
            :style="styles.currentQtyInput.style"
            v-html="styles.currentQtyInput.header"
          ></th>

          <th
            v-if="styles.percentageInput"
            _note="separator"
            style="padding: 0"
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
          ></th>
          <th
            v-if="styles.percentageInput"
            class="right aligned"
            style="padding-right: 0.5rem"
            :style="styles.percentageInput.style"
            xv-html="styles.percentageInput.header"
            v-html="styles.percentageInput.header"
          ></th>
          <th
            v-if="styles.percentageInput && styles.percentageInput.resettable"
            _note="resettable button"
            style="min-width: 16px; width: 16px; padding: 0"
          ></th>

          <td
            v-if="
              styles.newQtyIn &&
              !(styles.percentageInput && styles.percentageInput.resettable)
            "
            _note="separator"
            style="min-width: 8px; width: 8px; padding: 0"
          ></td>
          <th
            v-if="styles.newQtyIn"
            class="right aligned"
            style="padding-right: 0.5rem"
            :style="styles.newQtyIn.style"
            v-html="styles.newQtyIn.header"
          ></th>

          <th
            v-if="styles.newQtyOut"
            _note="separator"
            style="min-width: 8px; width: 8px; padding: 0"
          ></th>
          <th
            v-if="styles.newQtyOut"
            class="right aligned"
            style="padding-right: 0.5rem"
            :style="styles.newQtyOut.style"
            v-html="styles.newQtyOut.header"
          ></th>
        </tr>
      </thead>
    </table>

    <!-- ROWS -->
    <div style="overflow-y: auto" :style="{ height: rowTableHeightInPx }">
      <table
        id="xxx"
        class="ui clear table"
        :class="{ selectable: hoverable }"
        :style="{ 'font-size': fontSize }"
      >
        <tbody>
          <AssetRow
            v-for="asset in assets"
            :key="asset.symbol"
            :asset="asset"
            :styles="styles"
            :show-full-name="showFullName"
            :visible="isAssetVisible(asset.symbol)"
            :hover-image="hoverImage"
            :read-only="readOnly"
            :hoverable="hoverable"
            :show-column="{
              percentageInput: styles.percentageInput,
              address: styles.address
            }"
            :show-add-to-meta-mask="showAddToMetaMask"
            :search-text="searchText"
            @selected="$emit('selected', $event)"
            @changedPercentage="$emit('changedPercentage', $event)"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>
    
<script>
import AssetRow from './AssetRow.vue'

export default {
  name: 'AssetTable',
  components: { AssetRow },
  mixins: [],
  props: {
    assets: {
      type: Array,
      required: true
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    showFullName: {
      type: Boolean,
      default: true
    },
    height: {
      type: Number,
      default: 600
    },
    fontSize: {
      type: String,
      default: 'initial'
    },
    readOnly: {
      type: Boolean,
      default: false
    },
    hoverable: {
      type: Boolean,
      default: true
    },
    showAddToMetaMask: {
      type: Boolean,
      default: true
    },
    isAssetVisible: {
      type: Function,
      default: (symbol) => {
        return true
      }
    },
    searchText: {
      type: String,
      required: false,
      default: ''
    },
    hoverImage: {
      type: String,
      default: ''
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
    heightInPx() {
      return this.height + 'px'
    },
    rowTableHeight() {
      // Account for the Header Columns
      return this.height - (this.showHeader ? 70 : 0)
    },
    rowTableHeightInPx() {
      return this.rowTableHeight + 'px'
    },
    newQtyInputHeader() {
      let menu = '<div style="width: 100%">'

      menu += this.styles.percentageInput.header

      let items = ''
      this.$store.state.assets.forEach((a) => {
        items += `<div class="column item _muted _pointer _selectable" data-value="${a.symbol}"><img class="ui right spaced image" src="${a.image}" style="height: 1.5rem; width: 1.5rem"/>${a.symbol}</div>`
      })

      menu += `<div id="newQtyInputHeaderDropdown" class="ui icon top right pointing dropdown left floated"">
                <i class="ellipsis vertical icon green" style="text-align: left"></i>
                <div class="menu">
                  <div class="item">
                    <i class="dropdown icon"></i>
                    <span class="text">
                    <i class="undo alternate icon"></i>
                    Reset
                    </span>
                    <div class="menu">
                      <div class="item">
                        Previous
                      </div>
                      <div class="item">
                        Inception
                      </div>
                    </div>
                  </div>
                  <div class="item">
                    <i class="dropdown icon"></i>
                    <span class="text">
                    <i class="plus circle icon"></i>
                    Add
                    </span>
                    <div class="menu">
                      <div class="ui five column relaxed divided grid" style="max-width: 600px; max-height: 500px; overflow-y: auto; margin: 0">
  ${items}
                      </div>
                    </div>
                  </div>
                </div>
              </div>`

      menu += '</div>'

      return menu
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
    dropdownClicked(text, value) {
      // console.log('dropdownClicked', value)
      switch (value) {
        case 'previous':
          // console.log('reset to previous')
          this.$emit('resetTo', false)
          break

        case 'inception':
          // console.log('reset to inception')
          this.$emit('resetTo', true)
          break

        default:
          // console.log('add asset', value)
          this.$emit('addAsset', value)
      }
      return true
    }
  }
}
</script>
    
<style scoped>
.ui.table.clear {
  border-spacing: 0 0.4rem;
}

.ui.table.clear > tbody > tr {
  background-color: #2a2a2a;
  cursor: default;
}

.ui.table.clear > thead > tr > th {
  padding-top: 5px !important;
  padding-bottom: 5px !important;
}

._suppress-box-shadow {
  box-shadow: none !important;
}
</style>