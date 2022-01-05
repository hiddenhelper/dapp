<template>
  <div>
    <div class="ui grid">
      <div
        class="sixteen wide column"
        style="padding-top: 0; padding-bottom: 0; xbackground-color: yellow"
      >
        <div :id="`d3_${id}`" v-show="status == ''">
          <div :id="`tooltip_${id}`" class="tooltip">
            <div>
              <span :id="`x-value`" style="color: #8e8e8e"></span>
            </div>
            <div><span :id="`y-value`" style="color: white"></span></div>
          </div>
        </div>
      </div>
    </div>

    <div
      class="ui dimmer"
      :class="{ active: status == 'loading' }"
      style="background-color: transparent"
    >
      <div class="content">
        <h4 class="ui icon header">
          <div class="ui active inline fast big loader"></div>
          <div style="margin-top: 1rem">Loading...</div>
        </h4>
      </div>
    </div>

    <div
      class="ui dimmer"
      :class="{ active: status == 'error' }"
      style="background-color: transparent"
    >
      <div class="content">
        <h4 class="ui icon red header">
          <i class="circular exclamation icon"></i>
          Error
        </h4>
      </div>
    </div>

    <div
      class="ui dimmer"
      :class="{ active: status == 'no data' }"
      style="background-color: transparent"
    >
      <div class="content">
        <h4 class="ui center aligned icon header grey">
          <i class="circular info icon"></i>
          No data
        </h4>
      </div>
    </div>
  </div>
</template>

<script>
import * as d3 from 'd3'
export default {
  name: 'D3LineChart',
  props: {
    data: {
      type: Array,
      required: true,
      default: () => {
        return []
      }
    },
    status: {
      type: String,
      required: true,
      default: () => {
        return ''
      }
    },
    formatX: {
      type: Function,
      required: false,
      default: (v) => {
        return v
      }
    },
    formatY: {
      type: Function,
      required: false,
      default: (v) => {
        return v
      }
    },
    id: {
      type: String,
      required: true
    },
    pointsXCount: {
      type: Number,
      required: true
    },
    pointsYCount: {
      type: Number,
      required: true
    }
  },
  data() {
    return {
      curves: [
        'curveLinear',
        'curveBasis',
        'curveBundle',
        'curveCardinal',
        'curveCatmullRom',
        'curveMonotoneX',
        'curveMonotoneY',
        'curveNatural',
        'curveStep',
        'curveStepAfter',
        'curveStepBefore',
        'curveBasisClosed'
      ],
      curveIdx: 5,
      paintAreaBelow: false,
      margin: {
        top: 0,
        right: 0,
        bottom: 25,
        left: 25
      },
      yAxisWidth: 27
    }
  },
  computed: {
    width() {
      return 380 - this.margin.right - this.margin.left
    },
    height() {
      return 275 - this.margin.top - this.margin.bottom - 45
    },
    xAxisData() {
      return this.data.map((i) => i.x)
    },
    graphData() {
      let points = []
      let delta = Math.max(1, Math.floor(this.data.length / 40))
      let i
      for (i = 0; i < this.data.length; i += delta) {
        points.push(this.data[i])
      }
      if (this.data.length - 1 !== i - delta) {
        points.push(this.data[this.data.length - 1])
      }
      return points
    },
    loading() {
      return this.status == 'loading'
    },
    notApplicable() {
      return this.status == 'no data'
    },
    error() {
      return this.status == 'rrror'
    }
  },
  watch: {
    data(v) {
      if (v.length > 0) this.renderD3Chart()
    }
  },
  created() {},
  mounted() {
    if (this.data.length > 0) this.renderD3Chart()
  },
  destroyed() {},
  methods: {
    renderD3Chart() {
      const curve = this.curves[this.curveIdx]

      d3.select(`#d3_svg_${this.id}`).remove()
      const self = this
      const div = d3.select(`#d3_${this.id}`)

      const yMax = d3.max(this.data, (d) => d.y) + 40
      const yMin = d3.min(this.data, (d) => d.y) - 40

      const svg = div
        .append('svg')
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom)
        .attr('id', `d3_svg_${this.id}`)
        .style('background-color', '#1e1e1e')
        .append('g')
        .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`)

      const xScale = d3
        .scalePoint()
        .domain(this.xAxisData)
        .range([0, this.width - this.margin.left])
      const yScale = d3.scaleLinear().domain([yMin, yMax]).range([this.height, 0])

      var countXAxis = this.xAxisData.length
      var dividValue = parseInt(countXAxis / this.pointsXCount)

      const yScaleForAxis = d3.scaleLinear().domain([yMin, yMax]).range([this.height, 0])

      const xAxis = d3
        .axisBottom()
        .scale(xScale)
        .tickValues(xScale.domain().filter((d, i) => i % dividValue === 0 || i === countXAxis - 1))
        .tickFormat(self.formatX)

      const yAxis = d3.axisLeft().scale(yScaleForAxis).ticks(this.pointsYCount)

      const line = d3
        .line()
        .x((d) => xScale(d.x))
        .y((d) => yScale(d.y))
        .curve(d3[curve])

      svg
        .append('path')
        .datum(this.graphData)
        .attr('class', 'data-line glowed')
        .style('stroke', this.$store.state.primaryColor.rgbString)
        .style('stroke-width', 3)
        .style('fill', 'none')
        .attr('d', line)

      svg
        .append('rect')
        .attr('class', 'to-hide-overflow')
        .attr('width', self.yAxisWidth)
        .attr('transform', `translate(-${self.yAxisWidth}, 0)`)
        .attr('fill', '#1e1e1e')
        .attr('height', this.height)

      svg.append('g').attr('class', 'y axis').attr('color', '#8e8e8e').call(yAxis)

      svg
        .append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0, ' + parseInt(this.height) + ')')
        .attr('color', '#8e8e8e')
        .call(xAxis)

      const areaAbove = d3
        .area()
        .x(line.x())
        .y0(0)
        .y1((d) => yScale(d.y))
        .curve(d3[curve])

      svg
        .append('path')
        .datum(this.graphData)
        .attr('fill', '#1e1e1e')
        .attr('fill-opacity', '0')
        .attr('d', areaAbove)

      const areaBelow = d3
        .area()
        .x(line.x())
        .y0((d) => yScale(d.y))
        .y1(this.height)
        .curve(d3[curve])

      if (this.paintAreaBelow) {
        svg
          .append('path')
          .datum(this.graphData)
          .attr('fill', 'rgba(66, 255, 144, 0.05)')
          .attr('d', areaBelow)
      }

      // toolTip
      const tooltipCircle = svg
        .append('circle')
        .attr('class', 'circle glowed')
        .attr('r', 6)
        .style('fill', 'white')
        .style('opacity', 0)
        .style('stroke', this.$store.state.primaryColor.rgbString)
        .style('stroke-width', 4)

      const tooltipDottedLineX = svg
        .append('line')
        .attr('class', 'dashed')
        .attr('stroke', '#8e8e8e')
        .style('opacity', 0)

      const tooltipDottedLineY = svg
        .append('line')
        .attr('class', 'dashed')
        .attr('stroke', '#8e8e8e')
        .style('opacity', 0)

      const tooltip = d3.select(`#tooltip_${this.id}`)
      let transform = { x: 0, y: this.margin.top, k: 1 }
      let xIndex = 0

      const onMouseMove = function (event) {
        const mousePosition = d3.pointer(event)
        const xRange = xScale.range()
        const rangePoints = d3.range(xRange[0], xRange[1], xScale.step())
        xIndex = d3.bisect(rangePoints, mousePosition[0]) - 1
        // Not sure but prevent error for the left-most and right-most points.
        xIndex = Math.min(Math.max(0, xIndex), self.data.length - 1)
        const x = xScale(self.data[xIndex].x) * transform.k + transform.x + self.margin.left
        const y = yScale(self.data[xIndex].y) + self.margin.top
        tooltip.select(`#x-value`).text(self.formatX(self.data[xIndex].x))
        tooltip.select(`#y-value`).text(self.formatY(self.data[xIndex].y))
        if (x <= 70) {
          tooltip.style(
            'transform',
            `translate(` + `${x + 15}px,` + `calc(-100% + ${y + 15}px)` + `)`
          )
          tooltip.attr('class', 'tooltip')
        } else if (x >= self.width - 50) {
          tooltip.style(
            'transform',
            `translate(` + `calc(-100% + ${x + 15}px),` + `calc(-100% + ${y + 15}px)` + `)`
          )
          tooltip.attr('class', 'tooltip')
        } else {
          tooltip.style(
            'transform',
            `translate(` + `calc( -50% + ${x + 15}px),` + `calc(-100% + ${y}px)` + `)`
          )
          tooltip.attr('class', 'tooltip need-arrow')
        }
        tooltip.style('opacity', 1)
        tooltipCircle
          .attr('cx', xScale(self.data[xIndex].x) * transform.k)
          .attr('cy', yScale(self.data[xIndex].y))
          .attr('transform', `scale(${1 / transform.k}, 1)`)
          .style('opacity', 1)

        tooltipDottedLineX
          .attr('x1', xScale(self.data[xIndex].x) * transform.k)
          .attr('y1', yScale(self.data[xIndex].y))
          .attr('x2', xScale(self.data[xIndex].x) * transform.k)
          .attr('y2', self.height)
          .style('opacity', 1)

        tooltipDottedLineY
          .attr('x1', xScale(self.data[xIndex].x) * transform.k)
          .attr('y1', yScale(self.data[xIndex].y))
          .attr('x2', -transform.x)
          .attr('y2', yScale(self.data[xIndex].y))
          .style('opacity', 1)
      }
      const onMouseLeave = function () {
        tooltip.style('opacity', 0)
        tooltipCircle.style('opacity', 0)
        tooltipDottedLineX.style('opacity', 0)
        tooltipDottedLineY.style('opacity', 0)
      }
      const onZoom = function (event) {
        const t = event.transform
        const width = self.width * t.k
        let x = t.x
        if (x + width < self.width) {
          x = self.width - width
        } else if (x > 0) {
          x = 0
        }
        transform = { x, y: t.y, k: t.k }
        svg.attr(
          'transform',
          `translate(${x + self.margin.left}, ${self.margin.top}) scale(${t.k}, 1)`
        )
        tooltipCircle
          .attr('cx', xScale(self.data[xIndex].x) * transform.k)
          .attr('cy', yScale(self.data[xIndex].y))
          .attr('transform', `scale(${1 / transform.k}, 1)`)
          .style('opacity', 1)

        tooltipDottedLineX
          .attr('x1', xScale(self.data[xIndex].x) * transform.k)
          .attr('y1', yScale(self.data[xIndex].y))
          .attr('x2', xScale(self.data[xIndex].x) * transform.k)
          .attr('y2', self.height)
          .attr('transform', `scale(${1 / transform.k}, 1)`)

        tooltipDottedLineY
          .attr('x1', xScale(self.data[xIndex].x) * transform.k)
          .attr('y1', yScale(self.data[xIndex].y))
          .attr('x2', -transform.x)
          .attr('y2', yScale(self.data[xIndex].y))
          .attr('transform', `scale(${1 / transform.k}, 1)`)

        d3.select('.y.axis').attr('transform', `translate(${-x / t.k}, ${self.margin.top})`)

        d3.select('.to-hide-overflow').attr(
          'transform',
          `translate(${-x / t.k - self.yAxisWidth}, ${self.margin.top})`
        )

        d3.selectAll('.axis text').attr('transform', `scale(${1 / transform.k}, 1)`)

        d3.selectAll('.axis line').attr('transform', `scale(${1 / transform.k}, 1)`)

        d3.selectAll('.y.axis path').attr('transform', `scale(${1 / transform.k}, 1)`)
      }

      const zoom = d3.zoom().on('zoom', onZoom).scaleExtent([1, 20])
      svg
        .append('rect')
        .attr('class', 'listening-rect')
        .attr('width', this.width)
        .attr('height', this.height)
        .attr('fill', 'transparent')
        .on('mousemove', onMouseMove)
        .on('mouseleave', onMouseLeave)
        .call(zoom)

      /*
       * Glow effects (Optional)
       */
      const defs = svg.append('defs')
      const glowDeviation = 10

      // Filter for the outside glow
      const filter = defs
        .append('filter')
        .attr('id', 'glowLine')
        .attr('x', '-200%')
        .attr('y', '-200%')
        .attr('width', '500%')
        .attr('height', '500%')
      filter
        .append('feGaussianBlur')
        .attr('stdDeviation', glowDeviation)
        .attr('result', 'coloredBlur')
      filter
        .append('feOffset')
        .attr('in', 'blur')
        .attr('dx', 0)
        .attr('dy', 0)
        .attr('result', 'offsetBlur')

      const feMerge = filter.append('feMerge')
      feMerge.append('feMergeNode').attr('in', 'coloredBlur')
      feMerge.append('feMergeNode').attr('in', 'offsetBlur')
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic')

      // Add the glow!!
      d3.selectAll('.glowed').style('filter', 'url(#glowLine)')
    }
  }
}
</script>

<style scoped>
.tooltip {
  opacity: 0;
  position: absolute;
  top: -14px;
  left: 0;
  padding: 0.6em 1em;
  background: #000000;
  color: white;
  text-align: left;
  line-height: 1.4em;
  font-size: 0.9em;
  z-index: 10;
  transition: all 0.1s ease-out;
  pointer-events: none;
  border-radius: 10px;
}

.tooltip.need-arrow:before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 12px;
  height: 12px;
  background: #000000;
  border-top-color: transparent;
  border-left-color: transparent;
  transform: translate(-50%, 50%) rotate(45deg);
  transform-origin: center center;
  z-index: 10;
}
</style>
<style>
.dashed {
  stroke-dasharray: 3, 3;
}
</style>
