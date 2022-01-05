<template>
  <div>
    <table class="ui clear table bottom aligned" style="border-spacing: 0; padding: 2px">
      <thead class="full-width">
        <!-- Header, also used to impose the columns' widths -->
        <tr>
          <th style="min-width: 16px; width: 16px; padding: 0; cursor: default"></th>
          <th class="left aligned" style="padding-left: 4rem !important" :style="styles[0]">
            <div class="_sortable" @click="updateSortBy('Symbol')">
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
              Symbol
            </div>
            <div class="_muted _normal">Name</div>
          </th>
          <th class="left aligned" :style="styles[1]">
            <div class="_sortable" @click="updateSortBy('Receiver')">
              <i
                v-if="sortOptions.by === 'Receiver'"
                :class="{
                  sort: true,
                  amount: true,
                  up: sortOptions.order === 'asc',
                  down: sortOptions.order === 'desc',
                  icon: true
                }"
              ></i>
              Receiver
            </div>
            <div class="_sortable _muted _normal" @click="updateSortBy('Token')">
              <i
                v-if="sortOptions.by === 'Token'"
                :class="{
                  sort: true,
                  amount: true,
                  up: sortOptions.order === 'asc',
                  down: sortOptions.order === 'desc',
                  icon: true
                }"
              ></i>
              Token
            </div>
          </th>
          <th class="right aligned" :style="styles[2]">
            <div class="_sortable" @click="updateSortBy('Fee')">
              <i
                v-if="sortOptions.by === 'Fee'"
                :class="{
                  sort: true,
                  amount: true,
                  up: sortOptions.order === 'asc',
                  down: sortOptions.order === 'desc',
                  icon: true
                }"
              ></i>
              Fee %
            </div>
            <div class="_muted _normal">&nbsp;</div>
          </th>
          <th class="right aligned" :style="styles[3]" style="padding-right: 25px">
            Earned
            <div class="_muted _normal">&nbsp;</div>
          </th>
          <th :style="styles[4]"></th>
        </tr>
      </thead>
    </table>
    <div
      v-if="sortedFunds.length > 0"
      style="overflow-y: auto"
      :style="{ height: rowTableHeightInPx }"
    >
      <table class="ui clear selectable table">
        <tbody>
          <FundRowFeeModule
            v-for="fund in sortedFunds"
            :fund="fund"
            :key="fund.symbol + ' table' + _uid"
            :styles="styles"
            @accrue="$emit('accrue', $event)"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import FundRowFeeModule from './FundRowFeeModule.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'ManagementFeeAdmin',
  components: { FundRowFeeModule },
  mixins: [],
  props: {
    height: {
      type: Number,
      default: 600
    }
  },
  data() {
    return {
      sortOptions: {
        by: 'Symbol',
        order: 'asc'
      },
      styles: [
        'min-width: 100px; width: 30%; xbackground-color: red;',
        'min-width: 100px; width: 15%; xbackground-color: blue;',
        'min-width: 85px; width: 15%; xbackground-color: green;',
        'min-width: 85px; width: 25%; xbackground-color: white;',
        'min-width: 85px; width: 15%; xbackground-color: yellow;'
      ]
    }
  },
  computed: {
    ...mapGetters(['getFundModule']),
    heightInPx() {
      return this.height + 'px'
    },
    rowTableHeight() {
      return this.height - 145
    },
    rowTableHeightInPx() {
      return this.rowTableHeight + 'px'
    },
    sortFunction() {
      let val0 = this.sortOptions.order === 'asc' ? 1 : -1
      let val1 = this.sortOptions.order === 'desc' ? 1 : -1
      if (this.sortOptions.by === 'Symbol') {
        return (a, b) => {
          if (a.symbol > b.symbol) return val0
          else if (a.symbol < b.symbol) return val1
          return 0
        }
      } else if (this.sortOptions.by === 'Receiver') {
        return (a, b) => {
          const aReceiver = this.getReceiverAddress(a)
          const bReceiver = this.getReceiverAddress(b)
          if (aReceiver > bReceiver) return val0
          else if (aReceiver < bReceiver) return val1
          return 0
        }
      } else if (this.sortOptions.by === 'Token') {
        return (a, b) => {
          const aToken = this.getToken(a)
          const bToken = this.getToken(b)
          if (aToken > bToken) return val0
          else if (aToken < bToken) return val1
          return 0
        }
      }
      // Fee
      return (a, b) => {
        const aPercentage = this.getFeePercentage(a)
        const bPercentage = this.getFeePercentage(b)
        if (aPercentage.gt(bPercentage)) return val0
        else if (bPercentage.gt(aPercentage)) return val1
        return 0
      }
    },
    sortedFunds() {
      let temp = [...this.activeFeeFunds]
      return temp.sort(this.sortFunction)
    },
    activeFeeFunds() {
      if (this.isAdmin && this.$store.state.funds) {
        return this.$store.state.funds.filter((fund) => {
          if (!fund.launched || !fund.hasStreamingFeeModule) return false

          const module = fund.modules.filter((m) => m.name == 'StreamingFeeModule')
          if (module.length === 0) return false
          if (!module[0].settings.streamingFeeSettings.streamingFeePercentage.gt(0)) return false
          return true
        })
      }
      return []
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
    updateSortBy(field) {
      if (this.sortOptions.by === field) {
        this.sortOptions.order = this.sortOptions.order === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortOptions.by = field
        this.sortOptions.order = 'asc'
      }
    },
    getReceiverAddress(fund) {
      return this.feeModule(fund).settings.streamingFeeSettings.receiver
    },
    feeModule(fund) {
      return this.getFundModule(fund.symbol, 'StreamingFeeModule')
    },
    getToken(fund) {
      return this.feeModule(fund).settings.streamingFeeSettings.payFeeWithDextf
        ? 'DEXTF'
        : fund.symbol
    },
    getFeePercentage(fund) {
      return this.feeModule(fund).settings.streamingFeeSettings.streamingFeePercentage
    }
  }
}
</script>

<style scoped>
._sortable {
  cursor: pointer !important;
}
</style>