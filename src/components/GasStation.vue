<template>
  <div class="ui fitted basic segment" :class="{ disabled: loading }">
    <div :id="tabGasMenuId" class="ui top attached two item tabular menu">
      <div
        class="fitted item active"
        :class="{ disabled: loading }"
        :data-tab="'gasPrice' + _uid"
      >
        Price
        <i
          class="sync alternate icon"
          :class="{ loading: loading, disabled: loading }"
          style="cursor: pointer; margin-left: 1rem"
          @click="load()"
        ></i>
      </div>
      <div
        class="fitted item"
        :class="{ disabled: loading }"
        :data-tab="'gasLimit' + _uid"
      >
        Limit
      </div>
    </div>
    <div
      class="ui bottom attached tab segment active"
      :style="{ height: sliderHeight + 7 + 'rem' }"
      :data-tab="'gasPrice' + _uid"
    >
      <table style="width: 100%; padding: 0px">
        <!-- CUSTOM -->
        <tr :style="{ height: rowHeight + 'rem' }">
          <td
            class="center aligned"
            style="cursor: pointer"
            width="45%"
            @click="rowClicked(0)"
          >
            <div class="ui header" style="font-size: 1rem">
              {{ customEstimation.desc }}
              <div style="font-size: 1rem" class="ui header">
                {{ customEstimation.timeGroup }}
              </div>
            </div>
          </td>
          <td class="center aligned" rowspan="5" width="10%">
            <div
              :id="sliderUniqueId"
              class="ui vertical labeled ticked slider left aligned"
              :class="{ disabled: loading }"
              style="padding-left: 0px"
              :style="{ height: sliderHeight + 'rem' }"
            ></div>
          </td>
          <td
            class="center aligned"
            style="cursor: pointer"
            width="45%"
            @click="rowClicked(0)"
          >
            <div
              class="ui input"
              :class="{ disabled: selection.idx != 0 || loading }"
              style="width: 70%; max-width: 5rem; font-size: 2rem; margin: 0px"
            >
              <input
                :id="inputUniqueId"
                class="center aligned"
                style="padding: 0px"
                type="number"
                step="1"
                min="1"
                v-model.number="customEstimation.priceInGwei"
                @change="priceChanged(0)"
              />
            </div>
            <div
              v-if="showAverageTimes"
              style="font-size: 1rem; font-weight: bold"
            >
              {{ customEstimation.avgTime }}
            </div>
          </td>
        </tr>
        <!-- ESTIMATIONS -->
        <tr
          v-for="(estimation, index) in estimations.slice(1)"
          :key="index"
          :style="{ height: rowHeight + 'rem' }"
        >
          <td
            class="center aligned"
            style="cursor: pointer"
            width="45%"
            @click="rowClicked(index + 1)"
          >
            <div class="ui header" style="font-size: 1rem">
              {{ estimation.desc }}
              <div style="font-size: 1rem" class="ui header">
                {{ estimation.timeGroup }}
              </div>
            </div>
          </td>
          <td
            class="center aligned"
            style="cursor: pointer"
            width="45%"
            @click="rowClicked(index + 1)"
          >
            <div
              class="ui header"
              :class="{ disabled: selection.idx != index + 1 }"
              style="font-size: 2rem"
              :style="{ color: estimation.color }"
            >
              {{ estimation.priceInGwei }}
              <div
                v-if="showAverageTimes"
                class="ui header"
                style="font-size: 1rem"
              >
                {{ estimation.avgTime }}
              </div>
            </div>
          </td>
        </tr>
      </table>
    </div>

    <div
      class="ui bottom attached tab segment"
      :style="{ height: sliderHeight + 7 + 'rem' }"
      :data-tab="'gasLimit' + _uid"
    >
      <table style="width: 100%; padding: 0px">
        <!-- LIMIT -->
        <tr :style="{ height: rowHeight + 'rem' }">
          <td class="center aligned" xstyle="background-color: red" width="30%">
            <div class="ui header" style="font-size: 1rem">UNITS</div>
          </td>
          <td
            class="center aligned"
            xstyle="background-color: green"
            width="70%"
          >
            <div
              class="ui input"
              :class="{ disabled: loading }"
              style="
                xwidth: 90%;
                xmax-width: 5rem;
                font-size: 2rem;
                xmargin: 0 0 0 1rem;
              "
            >
              <input
                :id="inputLimitUniqueId"
                class="right aligned"
                style="padding: 0px 1rem; width: 100%"
                type="number"
                step="1"
                min="1"
                v-model.number="limit"
                @change="limitChanged()"
              />
            </div>
            <!-- <div
              v-if="showAverageTimes"
              style="font-size: 1rem; font-weight: bold"
            >
              {{ customEstimation.avgTime }}
            </div> -->
          </td>
        </tr>
      </table>
    </div>
  </div>
</template>

<script>
import { sizeHandlerMixin } from '../mixins/windowMixins.js'
import { gasEstimationMixin } from '../mixins/gasEstimationMixin.js'

export default {
  name: 'GasStation',
  mixins: [sizeHandlerMixin, gasEstimationMixin],
  props: {
    initialPrice: {
      type: Number,
      required: true
    },
    initialLimit: {
      type: Number,
      required: true
    },
    showFastest: {
      type: Boolean,
      required: false,
      default: false
    },
    showAverageTimes: {
      type: Boolean,
      required: false,
      default: true
    }
  },
  data() {
    return {
      loading: false,
      selection: {
        idx: 0,
        priceInGwei: 0
      },
      limit: 0,
      estimations: [
        {
          desc: 'CUSTOM',
          color: '#',
          semanticColor: '',
          timeGroup: '',
          avgTime: '',
          priceInGwei: 0
        },
        {
          desc: 'SAFE LOW',
          color: '#5BB7FF',
          semanticColor: 'olive',
          timeGroup: '',
          avgTime: '',
          priceInGwei: 0
        },
        {
          desc: 'STANDARD',
          color: '#538A6E',
          semanticColor: 'olive',
          timeGroup: '',
          avgTime: '',
          priceInGwei: 0
        },
        {
          desc: 'FAST',
          color: '#B66A8C',
          semanticColor: 'purple',
          timeGroup: '',
          avgTime: '',
          priceInGwei: 0
        },
        {
          desc: 'FASTEST',
          color: '#AB181A',
          semanticColor: 'red',
          timeGroup: '',
          avgTime: '',
          priceInGwei: 0
        }
      ]
    }
  },
  computed: {
    rowHeight() {
      const h1Height = 2
      const h2Height = 1
      const verticalPadding = 1 // As in scoped style
      return h1Height + h2Height + 2 * verticalPadding
    },
    sliderHeight() {
      // Note an additional 10% for adjustment
      return this.rowHeight * (this.estimations.length - 1) * 1.1
    },
    tabGasMenuId() {
      return 'tabGasMenu' + this._uid
    },
    inputUniqueId() {
      return 'input' + this._uid
    },
    inputLimitUniqueId() {
      return 'inputLimit' + this._uid
    },
    sliderUniqueId() {
      return 'slider' + this._uid
    },
    customEstimation() {
      return this.estimations[0]
    }
  },
  created() {
    if (!this.showFastest) {
      this.estimations.pop()
    }
  },
  async mounted() {
    $(`#${this.tabGasMenuId} .item`).tab()

    // Prepare the slider's labels
    var labels = []
    /*
    for (var i = 0; i < this.estimations.length; i++) {
      const e = this.estimations[i]
      labels.push(`<b>${e.desc.replace(/ /g, '&nbsp;')}&nbsp;&nbsp;`)
    }
    */

    $('#' + this.sliderUniqueId).slider({
      min: 0,
      max: this.estimations.length - 1,
      start: this.selection.idx,
      step: 1,
      smooth: true,
      labelType: 'letter',
      interpretLabel: function (value) {
        return labels[value] || ' '
      },
      onChange: this.priceChanged
    })

    this.customEstimation.priceInGwei = this.initialPrice
    this.limit = this.initialLimit

    this.selection.idx = 0
    this.selection.priceInGwei = this.customEstimation.priceInGwei

    this.load()
  },
  methods: {
    async load() {
      this.loading = true

      const estimations = await this.fetchEstimations()

      this.estimations[1].priceInGwei = estimations.safeLow.priceInGwei
      this.estimations[1].timeGroup = estimations.safeLow.timeGroup
      this.estimations[1].avgTime = estimations.safeLow.avgTime

      this.estimations[2].priceInGwei = estimations.average.priceInGwei
      this.estimations[2].timeGroup = estimations.average.timeGroup
      this.estimations[2].avgTime = estimations.average.avgTime

      this.estimations[3].priceInGwei = estimations.fast.priceInGwei
      this.estimations[3].timeGroup = estimations.fast.timeGroup
      this.estimations[3].avgTime = estimations.fast.avgTime

      if (this.showFastest) {
        this.estimations[4].priceInGwei = estimations.fastest.priceInGwei
        this.estimations[4].timeGroup = estimations.fastest.timeGroup
        this.estimations[4].avgTime = estimations.fastest.avgTime
      }

      this.customEstimation.avgTime = this.estimateTime(
        this.customEstimation.priceInGwei
      )

      // Check the correct checkbox based on the initial price
      let idx = 0
      for (var i = 1; i < this.estimations.length; i++) {
        const e = this.estimations[i]
        if (this.selection.priceInGwei == e.priceInGwei) {
          idx = i
          break
        }
      }

      // This will also trigger priceChanged
      $('#' + this.sliderUniqueId).slider('set value', idx)

      this.loading = false
    },
    priceChanged(value) {
      this.selection.idx = value
      this.selection.priceInGwei = this.estimations[value].priceInGwei

      if (value == 0) {
        this.setFocus(this.inputUniqueId)
        this.customEstimation.avgTime = this.estimateTime(
          this.customEstimation.priceInGwei
        )
      }

      this.$emit('priceChanged', this.selection.priceInGwei)
    },
    limitChanged() {
      console.log('limitChanged')
      this.$emit('limitChanged', this.limit)
    },
    rowClicked(r) {
      $('#' + this.sliderUniqueId).slider('set value', r)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
table > tr > td {
  padding: 0rem 0px;
}
</style>
