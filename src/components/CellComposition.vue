<template>
  <table>
    <tr>
      <td v-if="showPie" width="5%;">
        <Doughnut
          :data="chartData"
          :options="chartOptions"
          :style="{
            width: '50px',
            height: '50px',
            overflow: 'auto'
          }"
        />
      </td>
      <td width="95%">
        <div class="ui grid" style="margin: 0px 0px 0px 1rem">
          <div
            class="column"
            style="padding: 0px"
            :style="{ 'min-width': longSymbol ? '100px' : '80px' }"
            v-for="token in tokens"
            :key="token.symbol"
          >
            <table style="width: 100% !important">
              <tr>
                <td width="1%">
                  <img
                    style="width: 20px; height: 20px; vertical-align: middle"
                    :src="token.image"
                  />
                </td>
                <td width="99%" style="font-size: 0.7rem; line-height: normal">
                  <div xstyle="color: #5d5d5d; font-weight: bold">
                    {{ token.symbol }}
                  </div>

                  <div class="_muted" xstyle="color: #5d5d5d">
                    {{ token.percentage }}%
                  </div>
                  <!--
                    <span
                    class="ui text"
                    style="color: #5d5d5d; font-weight: bold"
                  >
                    {{ token.symbol }}
                  </span>
                  <br />
                  <span class="ui text" style="color: #5d5d5d">
                    {{ token.percentage }}%
                  </span>
                  -->
                </td>
              </tr>
            </table>
          </div>
        </div>
      </td>
    </tr>
  </table>
</template>

<script>
import copy from 'copy-to-clipboard'
import Doughnut from './Doughnut.vue'

export default {
  name: 'CellComposition',
  components: {
    Doughnut
  },
  data() {
    return {
      copyAddressMessage: 'Copied!',
      longSymbol: false,
      chartData: {
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: [],
        datasets: [
          {
            backgroundColor: [],
            data: []
          }
        ]
      },
      chartOptions: {
        tooltips: {
          enabled: true,
          titleFontFamily:
            "'Helvetica Neue', 'Helvetica', 'Avenir', 'Arial', 'sans-serif'"
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
          }
        },
        cutoutPercentage: 0,
        responsive: true,
        legend: {
          display: false,
          position: 'left',
          labels: {
            boxWidth: 40,
            fontColor: '#000',
            fontSize: 10,
            usePointStyle: false,
            fontFamily:
              "'Helvetica Neue', 'Helvetica', 'Avenir', 'Arial', 'sans-serif'"
          }
        },
        title: {
          display: false,
          text: 'Composition'
        },
        maintainAspectRatio: false,
        animation: {
          animateScale: true,
          animateRotate: true
        }
      }
    }
  },
  props: {
    tokens: {
      type: Array,
      required: true
    },
    showPie: {
      type: Boolean,
      default: true
    }
  },
  created() {
    this.chartData.labels = []
    this.chartData.datasets[0].backgroundColor = []
    this.chartData.datasets[0].borderColor = []
    this.chartData.datasets[0].data = []

    let longestNoOfChars = 0
    this.tokens.forEach(async function (token) {
      longestNoOfChars = Math.max(longestNoOfChars, token.symbol.length)
      this.chartData.datasets[0].backgroundColor.push(token.color)
      this.chartData.datasets[0].borderColor.push('#121212')
      this.chartData.labels.push(token.percentage + '% ' + token.symbol)
      this.chartData.datasets[0].data.push(token.percentage)
    }, this)

    this.longSymbol = longestNoOfChars > 5
    // this.log(this.$options.name, 'created')
  },
  methods: {
    CopyToClipBoard(text) {
      if (copy(text)) {
        this.copyAddressMessage = 'Copied!'
      }
      return false
    }
  }
}
</script>