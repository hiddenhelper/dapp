<template>
  <div :id="id" style="display: flex; justify-content: center"></div>
</template>

<script>
import * as d3 from 'd3'

export default {
  name: 'D3Doughnut',
  props: {
    parentId: {
      type: String,
      required: true
    },
    data: {
      type: Array,
      default: undefined
    },
    height: {
      type: Number,
      default: 0
    },
    selectedData: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      normalArc: null,
      biggerArc: null,
      svg: null,
      textPercentage: null,
      textAssetName: null,
      color: null,
      margin: 20,
      paths: null
    }
  },
  computed: {
    id() {
      return this.parentId + '_doughnut'
    }
  },
  watch: {
    selectedData(cur, prev) {
      if (prev !== '') {
        let prevArc = this.paths._groups[0].find((i) => {
          return i.__data__.data[0] === prev
        })
        d3.select(prevArc)
          .transition()
          .duration(500)
          .ease(d3.easeBounce)
          .attr('d', this.normalArc)
          .style('filter', 'url(#glow)')

        d3.select(this.paths._parents[0])
          .transition()
          .attr(
            'transform',
            'translate(' + this.height / 2 + ',' + this.height / 2 + ')'
          )
          .duration(500)

        this.textAssetName.text(``)
        this.textAssetName.transition().attr('transform', '').duration(500)
        this.textPercentage.text(``)
        this.textPercentage.transition().attr('transform', '').duration(500)
      }
      if (cur !== '') {
        // get Selected AssetItem Element by Id
        let assetBoundingRect = document.getElementById(
          (this.parentId + '.' + this.selectedData).replaceAll('.', '_')
        )
        if (assetBoundingRect) {
          //
          // Initiate arc rotation
          //

          assetBoundingRect = assetBoundingRect.getBoundingClientRect()
          // get Doughnut Chart Bounding Rect
          const boundingRect = this.$el.getBoundingClientRect()
          const centerX = boundingRect.x + boundingRect.width / 2
          const centerY = boundingRect.y + boundingRect.height / 2

          let boundingRectX = 0
          const boundingRectY =
            assetBoundingRect.y + assetBoundingRect.height / 2
          if (assetBoundingRect.x < centerX) {
            boundingRectX = assetBoundingRect.x + assetBoundingRect.width
          } else {
            boundingRectX = assetBoundingRect.x
          }
          const x = boundingRectX - centerX
          const y = boundingRectY - centerY
          const angle = Math.atan2(x, -y) * (180 / Math.PI)

          const selectedArc = this.paths._groups[0].find((i) => {
            return i.__data__.data[0] === cur
          })
          const rotate =
            angle -
            ((selectedArc.__data__.startAngle + selectedArc.__data__.endAngle) /
              2 /
              Math.PI) *
              180
          d3.select(selectedArc)
            .transition()
            .duration(500)
            .ease(d3.easeBounce)
            .attr('d', this.biggerArc)
            .style('filter', 'url(#glowBig)')

          d3.select(this.paths._parents[0])
            .transition()
            .attr(
              'transform',
              'translate(' +
                this.height / 2 +
                ',' +
                this.height / 2 +
                ') rotate(' +
                rotate +
                ')'
            )
            .duration(500)

          this.textAssetName.text(`${selectedArc.__data__.data[0]}`)
          this.textAssetName
            .transition()
            .attr('transform', 'rotate(' + -rotate + ')')
            .duration(500)
          this.textPercentage.text(`${selectedArc.__data__.data[1]}%`)
          this.textPercentage
            .transition()
            .attr('transform', 'rotate(' + -rotate + ')')
            .duration(500)
        }
      }
    },
    data(v) {
      this.renderDoughnut()
    }
  },
  created() {},
  mounted() {
    this.renderDoughnut()
  },
  beforeDestroy() {
    d3.select(`#${this.id}`).selectAll('svg').remove()
  },
  methods: {
    pathAnim(path, dir, data) {
      switch (dir) {
        case 0:
          path
            .transition()
            .duration(500)
            .ease(d3.easeBounce)
            .attr('d', this.normalArc)
            .style('filter', 'url(#glow)')
          this.textAssetName.text(``)
          this.textPercentage.text(``)
          this.$emit('arcLeave')
          break

        case 1:
          path
            .transition()
            .duration(500)
            .ease(d3.easeBounce)
            .attr('d', this.biggerArc)
            .style('filter', 'url(#glowBig)')

          this.textAssetName.text(`${data.data[0]}`)
          this.textPercentage.text(`${data.data[1]}%`)
          this.$emit('arcHover', data.data[0])
          break
      }
    },
    appendEffect(svg, stdDeviation, id) {
      let defs = svg.append('defs')

      let filter = defs
        .append('filter')
        .attr('id', id)
        .attr('x', '-200%')
        .attr('y', '-200%')
        .attr('width', '500%')
        .attr('height', '500%')

      filter
        .append('feGaussianBlur')
        .attr('stdDeviation', stdDeviation)
        .attr('result', 'coloredBlur')
      filter
        .append('feOffset')
        .attr('in', 'blur')
        .attr('dx', 0)
        .attr('dy', 0)
        .attr('result', 'offsetBlur')

      let feMerge = filter.append('feMerge')

      feMerge.append('feMergeNode').attr('in', 'coloredBlur')
      feMerge.append('feMergeNode').attr('in', 'offsetBlur')
      feMerge.append('feMergeNode').attr('in', 'SourceGraphic')
    },
    renderDoughnut() {
      // Remove Previous SVG
      d3.select(`#${this.id} svg`).remove()

      let radius = this.height / 2 - this.margin

      // create an svg for d3
      this.svg = d3
        .select(`#${this.id}`)
        .append('svg')
        .attr('width', this.height)
        .attr('height', this.height)
        .append('g')
        .attr(
          'transform',
          'translate(' + this.height / 2 + ',' + this.height / 2 + ')'
        )

      // svg element for the asset name
      this.textAssetName = this.svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('fill', '#ffffff')
      // svg element for the asset percentage
      this.textPercentage = this.svg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', '20px')
        .attr('fill', '#ffffff')
        .attr('y', 20)

      /* For the glow effect filter... */
      this.appendEffect(this.svg, 2, 'glow')
      this.appendEffect(this.svg, 5, 'glowBig')

      // create a color for the pie chart
      let color = d3
        .scaleOrdinal()
        .domain(this.data.map((asset) => asset.symbol))
        .range(this.data.map((asset) => asset.color))
      this.color = color

      // arcs for the animation
      this.normalArc = d3
        .arc()
        .outerRadius(radius)
        .innerRadius(radius - 8)
        .cornerRadius(0)
      this.biggerArc = d3
        .arc()
        .outerRadius(radius)
        .innerRadius(radius - 16)
        .cornerRadius(0)

      // create pie chart
      let pie = d3
        .pie()
        .startAngle(0)
        .padAngle(0.05)
        .value(function (d) {
          return d[1]
        })
        .sort(null)

      let dataChart = {}
      this.data.forEach((asset) => (dataChart[asset.symbol] = asset.amount))
      let data_ready = pie(Object.entries(dataChart))

      this.paths = this.svg
        .selectAll('whatever')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('d', this.normalArc)
        .attr('class', 'my_arcs')
        .attr('fill', function (d) {
          return color(d.data[0])
        })
        .style('filter', 'url(#glow)')
        .style('stroke', function (d) {
          return color(d.data[0])
        })

      this.paths.on('mouseover', (e, index) => {
        this.pathAnim(d3.select(e.currentTarget), 1, index)
      })
      this.paths.on('mouseout', (e, index) => {
        let thisPath = d3.select(e.currentTarget)
        if (!thisPath.classed('clicked')) {
          this.pathAnim(thisPath, 0, index)
        }
      })
    }
  }
}
</script>