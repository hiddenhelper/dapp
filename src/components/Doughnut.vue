<script>
import { Doughnut } from 'vue-chartjs'

export default {
  name: 'Doughnut',
  extends: Doughnut,
  props: {
    data: {
      type: Object,
      default: null
    },
    options: {
      type: Object,
      default: null
    },
    additionalPlugins: {
      type: Array,
      default: () => {
        return []
      }
    }
    /*
    There are some basic props defined in the components provided by vue-chartjs:
     - width
     - height
     - chart-id
     - css-classes
     - styles
     - plugins
    */
  },
  mounted() {
    // TEST: experiment to apply a gradient bolrder
    /*
    var ctx = this.$refs.canvas.getContext('2d')

    var gradientStroke = ctx.createLinearGradient(500, 0, 100, 0)
    gradientStroke.addColorStop(0, '#80b6f4')
    gradientStroke.addColorStop(1, '#f49080')

    const borders = this.data.datasets[0].borderColor
    for (var i = 0; i < borders.length; i++) {
      borders[i] = gradientStroke
    }
    */

    this.additionalPlugins.forEach((p) => this.plugins.push(p))

    // console.log('Doughnut.mounted')

    this.renderChart(this.data, this.options)
  },
  beforeDestroy() {
    // console.log('Doughnut.beforeDestroy')
    if (this.$data && this.$data._chart) {
      this.$data._chart.destroy()
    }
  }
}
</script>
