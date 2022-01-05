<template>
  <div style="height: 100%; margin-left: auto; margin-right: auto; width: 955px">
    <Table>
      <template v-slot:header>
        <TableHeader
          :column-configs="columnConfigs"
          :font-size="fontSize"
          :initial-sort-options="sortOptions"
          @sort="sortHeaderClicked($event)"
        />
      </template>
      <template v-slot:body>
        <div v-if="funds.length > 0" style="overflow-y: auto">
          <table class="ui clear selectable table">
            <tbody>
              <LeaderFundRow
                :column-configs="columnConfigs"
                v-for="(fund, index) in sortedFunds"
                :rank="index + 1"
                :key="fund.symbol + ' table' + _uid"
                :fund="fund"
              />
            </tbody>
          </table>
        </div>
        <h2 v-else class="ui center aligned icon header grey" style="margin-top: 100px">
          <i class="circular info icon"></i>
          No fund
        </h2>
      </template>
    </Table>
    <DimmerMessage
      :id="dimmerMessageId"
      :dimmer-message="dimmerMessage"
      :inverted-dimmer="invertedDimmer"
      :page-dimmer="true"
    />
  </div>
</template>

<script>
import axios from 'axios'

import Table from '../molecules/Table.vue'
import TableHeader from '../atoms/TableHeader.vue'
import LeaderFundRow from '../atoms/LeaderFundRow.vue'
import DimmerMessage from '../DimmerMessage.vue'

export default {
  name: 'Leaderboard',
  components: { Table, TableHeader, LeaderFundRow, DimmerMessage },
  mixins: [],
  props: {},
  data() {
    return {
      dimmerMessage: {},
      invertedDimmer: false,
      sortOptions: {
        by: 'AUM',
        order: 'desc',
        fixed: true
      },
      columnConfigs: [
        {
          header: 'Symbol',
          subHeader: 'Name',
          style: 'width: 440px; padding-left: 8.8rem;',
          key: 'symbol'
        },
        {
          header: 'AUM',
          style: 'vertical-align: top; text-align: right;',
          key: 'aum'
        },
        {
          header: 'Holders',
          style: 'width: 160px; vertical-align: top; text-align: right;',
          key: 'holders'
        },
        {
          header: 'Performance',
          style: 'width: 160px; vertical-align: top; text-align: right;',
          key: 'performance'
        }
      ],
      fontSize: '14px',
      funds: []
    }
  },
  computed: {
    sortedFunds() {
      let temp = [...this.funds]
      return temp.sort(this.sortFunction(this.sortOptions))
    },
    dimmerMessageId() {
      return `dimmerMessageId${this._uid}`
    }
  },
  watch: {},
  beforeCreate() {},
  created() {},
  beforeMount() {},
  mounted() {
    this.load()
  },
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    async load() {
      const msg = {
        type: '',
        header: 'Loading Funds',
        subHeaders: [`Please wait, it won't take long...`]
      }
      let errorMessage
      this.setDimmer(true, false, msg, 'medium')

      let funds = []
      await axios
        .get(this.$store.state.APIs.leaderboardFunds)
        .then(({ data }) => {
          funds = data.funds || []
        })
        .catch((err) => {
          console.error(err)
          errorMessage = {
            type: 'error',
            supportEmailSubject: `Loading error`,
            supportEmailBody: '',
            header: 'ERROR',
            subHeaders: ['Oops, something went wrong during loading']
          }
          funds = []
        })

      this.funds = funds

      if (errorMessage) {
        this.setDimmer(true, true, errorMessage)
        return
      }

      this.setDimmer(false)
    },
    sortHeaderClicked(sortOptions) {
      this.sortOptions = sortOptions
    },
    setDimmer(show, closable = false, msg = {}, variation = false) {
      this.dimmerMessage = msg || {}
      this.dimmerMessage.closable = closable || false
      if (show) {
        $(`#${this.dimmerMessageId}`)
          .dimmer({ closable: closable || false, variation: variation })
          .dimmer('show')
      } else {
        $(`#${this.dimmerMessageId}`).dimmer('hide')
      }
    },
    sortFunction(sortOptions) {
      let val0 = sortOptions.order === 'asc' ? 1 : -1
      let val1 = sortOptions.order === 'desc' ? 1 : -1
      if (sortOptions.by === 'Symbol') {
        return function (a, b) {
          if (a.symbol > b.symbol) return val0
          else if (a.symbol < b.symbol) return val1
          return 0
        }
      } else if (sortOptions.by === 'AUM') {
        return function (a, b) {
          if (a.aum > b.aum) return val0
          else if (a.aum < b.aum) return val1
          return 0
        }
      } else if (sortOptions.by === 'Holders') {
        return function (a, b) {
          if (a.holders > b.holders) return val0
          else if (a.holders < b.holders) return val1
          return 0
        }
      } else if (sortOptions.by === 'Performance') {
        return function (a, b) {
          if (a.performance > b.performance) return val0
          else if (a.performance < b.performance) return val1
          return 0
        }
      }
    }
  }
}
</script>

<style scoped>
</style>