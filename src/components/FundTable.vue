<template>
  <div :style="{ 'background-color': bg, height: heightInPx }">
    <!-- HEADER -->
    <h1 v-if="header" class="ui horizontal left aligned divider header">
      {{ header }}
    </h1>

    <!-- HEADER COLUMNS -->
    <table class="ui clear table bottom aligned" style="border-spacing: 0">
      <thead class="full-width">
        <!-- Header, also used to impose the columns' widths -->
        <tr>
          <th style="min-width: 16px; padding: 0">
            <div
              class="ui checkbox _dynamicFundCheckbox"
              :class="{ disabled: dynamicCheckboxDisabled }"
              :style="cssVariableDynamicColor"
              data-tooltip="Show dynamic funds"
              data-position="right center"
              data-inverted=""
            >
              <input
                type="checkbox"
                v-model="dynamicFunds"
                @change="emitFilter()"
                :disabled="dynamicCheckboxDisabled"
              />
              <label style="padding: 0"></label>
            </div>
            <div
              class="ui checkbox _staticFundCheckbox"
              :class="{ disabled: staticCheckboxDisabled }"
              data-tooltip="Show static funds"
              data-position="right center"
              data-inverted=""
            >
              <input
                type="checkbox"
                v-model="staticFunds"
                @change="emitFilter()"
                :disabled="staticCheckboxDisabled"
              />
              <label style="padding: 0"></label>
            </div>
          </th>
          <th class="left aligned" style="padding-left: 2.5rem !important" :style="styles[0]">
            <div class="_sortable" @click="emitSortBy('Name')">
              <i
                v-if="sortOptions.by === 'Name'"
                :class="{
                  sort: true,
                  amount: true,
                  up: sortOptions.order === 'asc',
                  down: sortOptions.order === 'desc',
                  icon: true
                }"
              ></i>
              <i v-else class="icon"></i>
              Name
            </div>
            <div class="_sortable _muted _normal" @click="emitSortBy('Symbol')">
              <i
                v-if="sortOptions.by === 'Symbol'"
                :class="{
                  sort: true,
                  amount: true,
                  up: sortOptions.order === 'asc',
                  down: sortOptions.order === 'desc',
                  icon: true
                }"
              ></i>
              <i v-else class="icon"></i>
              Symbol
            </div>
          </th>
          <th
            v-if="false"
            class="left aligned"
            Xstyle="padding-left: 0.5rem !important"
            :style="styles[1]"
          >
            Composition at launch
          </th>
          <th class="left aligned" :style="styles[2]">
            <div class="_sortable" @click="emitSortBy('Risk')">
              <i
                v-if="sortOptions.by === 'Risk'"
                :class="{
                  sort: true,
                  amount: true,
                  up: sortOptions.order === 'asc',
                  down: sortOptions.order === 'desc',
                  icon: true
                }"
              ></i>
              <i v-else class="icon"></i>
              Risk
            </div>
            <div class="_muted _normal">Address</div>
          </th>
          <!--
          <th
            class="center aligned"
            style="min-width: 145px; color: #525252"
          >
            Address
          </th>
          -->
          <th class="right aligned" :style="styles[3]">
            <div>Wallet</div>
            <div class="_muted _normal">Value</div>
          </th>
          <th class="right aligned" :style="styles[4]">
            <div class="_sortable" @click="emitSortBy('Price')">
              <i
                v-if="sortOptions.by === 'Price'"
                :class="{
                  sort: true,
                  amount: true,
                  up: sortOptions.order === 'asc',
                  down: sortOptions.order === 'desc',
                  icon: true
                }"
              ></i>
              <i v-else class="icon"></i>
              Price
            </div>
            <div class="_sortable _muted _normal" @click="emitSortBy('AUM')">
              <i
                v-if="sortOptions.by === 'AUM'"
                :class="{
                  sort: true,
                  amount: true,
                  up: sortOptions.order === 'asc',
                  down: sortOptions.order === 'desc',
                  icon: true
                }"
              ></i>
              <i v-else class="icon"></i>
              AUM
            </div>
          </th>
          <th class="right aligned" :style="styles[5]">
            <div>
              <span
                data-tooltip="Performance since inception"
                data-position="bottom center"
                data-inverted=""
              >
                <i class="info circle icon" style="margin: 0"></i>
              </span>
              Performance
            </div>
            <div class="_muted _normal">
              <!--{{ annualisedPerformance ? 'Annualised' : 'Since inception' }}-->
              Launch date
            </div>
          </th>
          <!--
          <th class="right aligned" :style="styles[4]">
            <div>Wallet</div>
          </th>
          <th
            class="center aligned _sortable"
            :style="styles[5]"
            @click="emitSortBy('Launch Date')"
          >
            <i
              v-if="sortOptions.by === 'Launch Date'"
              :class="{
                sort: true,
                amount: true,
                up: sortOptions.order === 'asc',
                down: sortOptions.order === 'desc',
                icon: true
              }"
            ></i>
            Launch Date
          </th>
          <th v-if="false" class="center aligned" :style="styles[6]"></th>
          -->
          <th style="min-width: 16px; padding: 0"></th>
        </tr>
      </thead>
    </table>

    <!-- ROWS -->
    <div v-if="funds.length > 0" style="overflow-y: auto" :style="{ height: rowTableHeightInPx }">
      <table class="ui clear selectable table">
        <tbody>
          <FundRow
            v-for="fund in funds"
            :key="fund.symbol + ' table' + _uid"
            style="max-height: 70px !important"
            :fund="fund"
            :mode="mode"
            :show-buttons="false"
            :show-composition="false"
            :show-rebalance-bar="showRebalanceBar"
            :annualised-performance="annualisedPerformance"
            :filters.sync="filters"
            :search-text="searchText"
            :show-investor-visibility="showInvestorVisibility"
            :styles="styles"
            :selected="selected"
            @modify="$emit('modify', $event)"
            @launch="$emit('launch', $event)"
            @selected="$emit('selected', $event)"
            @cancelProposal="$emit('cancelProposal', $event)"
            @startTrading="$emit('startTrading', $event)"
            @closeTrading="$emit('closeTrading', $event)"
            @upgradeModule="$emit('upgradeModule', $event)"
          />
        </tbody>
      </table>
    </div>
    <h2 v-else class="ui center aligned icon header grey" style="margin-top: 100px">
      <i class="circular info icon"></i>
      No fund
    </h2>
  </div>
</template>

<script>
import FundRow from './FundRow.vue'

export default {
  name: 'FundTable',
  components: { FundRow },
  mixins: [],
  props: {
    funds: {
      type: Array,
      required: true
    },
    mode: {
      type: String,
      default: 'Investment',
      validator: function (value) {
        return ['Investment', 'Managed', 'Trade', 'Invested'].includes(value)
      }
    },
    showRebalanceBar: {
      type: Boolean,
      default: true
    },
    header: {
      type: String,
      default: ''
    },
    filters: {
      type: Object,
      required: true
      /*
      default: () => {
        return {
          cnt: 0,
          invested: false,
          favourite: false,
          uniswap: false,
          kyber: false,
          inactive: false,
          risks: [true, true, true, true, true],
          assets: '',
          myTokens: false,
          staticFunds: true,
          dynamicFunds: true
        }
      }
      */
    },
    initialSortOptions: {
      type: Object,
      required: true
    },
    searchText: {
      type: String,
      required: true,
      default: ''
    },
    selected: {
      type: String,
      required: true
    },
    styles: {
      type: Array,
      required: true
    },
    height: {
      type: Number,
      default: 600
    },
    bg: {
      type: String,
      default: 'inherit'
    },
    showInvestorVisibility: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      sortOptions: {
        by: '',
        order: ''
      },
      dynamicFunds: true,
      staticFunds: true,
      annualisedPerformance: false
    }
  },
  computed: {
    heightInPx() {
      return this.height + 'px'
    },
    rowTableHeight() {
      // Account for the Header and Header Columns
      return this.height - (this.header ? 50 : 0) - 45
    },
    rowTableHeightInPx() {
      return this.rowTableHeight + 'px'
    },
    dynamicCheckboxDisabled() {
      return this.dynamicFunds && !this.staticFunds
    },
    staticCheckboxDisabled() {
      return this.staticFunds && !this.dynamicFunds
    },
    cssVariableDynamicColor() {
      return {
        '--dynamicFundCheckboxColor': `rgba(${this.$store.state.primaryColor.rgb}, 0.5)`
      }
    }
  },
  watch: {
    'filters.dynamicFunds': {
      handler(newVal, oldVal) {
        this.dynamicFunds = newVal
      }
    },
    'filters.staticFunds': {
      handler(newVal, oldVal) {
        this.staticFunds = newVal
      }
    }
  },
  beforeCreate() {},
  created() {
    this.sortOptions.by = this.initialSortOptions.by
    this.sortOptions.order = this.initialSortOptions.order
    this.dynamicFunds = this.filters.dynamicFunds || true
    this.staticFunds = this.filters.staticFunds || true
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    emitSortBy(by) {
      if (by === this.sortOptions.by) {
        this.sortOptions.order = this.sortOptions.order === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortOptions.by = by
        this.sortOptions.order = 'asc'
      }
      this.$emit('sort', this.sortOptions)
    },
    emitFilter() {
      this.$emit('filter', {
        dynamicFunds: this.dynamicFunds,
        staticFunds: this.staticFunds
      })
    }
  }
}
</script>

<style scoped>
._sortable {
  cursor: pointer !important;
}

._dynamicFundCheckbox label:before,
._dynamicFundCheckbox input:focus ~ label:before,
._dynamicFundCheckbox input:checked ~ label:before,
._dynamicFundCheckbox input:checked:focus ~ label:before {
  background: var(--dynamicFundCheckboxColor) !important;
}

._staticFundCheckbox label:before,
._staticFundCheckbox input:focus ~ label:before,
._staticFundCheckbox input:checked ~ label:before,
._staticFundCheckbox input:checked:focus ~ label:before {
  background: rgba(42, 42, 42, 1) !important;
}
</style>
