<template>
  <tr :key="fund.symbol + 'row' + _uid" class="row">
    <td :style="columnConfigs[0].style">
      <table class="_fundTagTable" style="width: 100% !important">
        <tr>
          <td width="15%">
            <h1 v-if="rank <= 3" class="rank big">{{ rank }}</h1>
            <span v-else class="rank">{{ rank }}</span>
          </td>
          <td width="1%">
            <img
              v-if="fund.image"
              style="width: 2.5rem; margin: 0 0.5rem 0 1rem"
              :src="fund.image"
            />
            <FundLogoSvg
              v-else
              :fund-symbol="
                isEthereum
                  ? fund.symbol
                  : `xxxx${fund.address ? fund.address.substring(2, 8).toUpperCase() : '---NEW'}`
              "
              :company-color="fund.color"
              style="margin: 0 0.5rem 0 1rem"
            >
            </FundLogoSvg>
          </td>
          <td style="line-height: normal; position: relative">
            <b> {{ fund.symbol }} </b>
            <div
              class="_muted"
              style="white-space: nowrap; width: 300px; overflow: hidden; text-overflow: ellipsis"
            >
              {{ fund.name }}
            </div>
            <i
              class="external alternate icon _muted"
              style="position: absolute; left: 50%; transform: translateY(-50%); top: 50%"
              @click="goTo(explorerLink, `explorer${fund.address}`)"
            >
            </i>
          </td>
        </tr>
      </table>
    </td>
    <td :style="columnConfigs[1].style">
      {{ formatWallet(fund.aum) }}
    </td>
    <td :style="columnConfigs[2].style">{{ fund.holders }}</td>
    <td :style="columnConfigs[3].style">
      <span
        class="ui text"
        :class="{
          green: fund.performance > 0,
          _muted: fund.performance == 0,
          red: fund.performance < 0
        }"
        :style="{
          filter: fund.performance == 0 ? 'brightness(40%)' : 'none'
        }"
      >
        {{ format(fund.performance) }}%
        <i
          class="ui icon"
          :class="{
            caret: fund.performance !== 0,
            up: fund.performance >= 0,
            down: fund.performance < 0,
            red: fund.performance < 0,
            equals: fund.performance == 0
          }"
          style="margin: 0"
        ></i>
      </span>
    </td>
  </tr>
</template>

<script>
import { formatWallet, format } from '../../modules/format.js'

import FundLogoSvg from '../FundLogoSvg.vue'

export default {
  name: 'LeaderFundRow',
  components: { FundLogoSvg },
  mixins: [],
  props: {
    fund: {
      type: Object,
      default: () => {
        return {}
      }
    },
    columnConfigs: {
      type: Array,
      required: true
    },
    rank: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      data1: 1
    }
  },
  computed: {
    explorerLink() {
      if (this.fund) {
        return `${this.currentNetwork.explorer}/token/${this.fund.address}`
      }
      return ''
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
    formatWallet,
    format,
    goTo(address, target) {
      if (address) {
        window.open(address, target)
        return true
      }
      return false
    }
  }
}
</script>

<style scoped>
.rank {
  font-size: 2rem;
}
.rank.big {
  font-size: 2.5rem;
  font-weight: bolder;
}
td {
  vertical-align: middle !important;
}
.none-padding {
  padding: 0 !important;
}
tr.row {
  height: 75px;
  max-height: 95px;
}
tr.row > td:first-child {
  padding-left: 1.71428571em !important;
}
tr.row > td:last-child {
  padding-right: 1.71428571em;
}
</style>
