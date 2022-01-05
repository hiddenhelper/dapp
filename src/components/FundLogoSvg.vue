<template>
  <svg :height="height" :width="width" viewBox="0 0 250 250">
    <circle r="125" cx="125" cy="125" :fill="strokeColor" />
    <circle r="115" cx="125" cy="125" :fill="bgColor" />
    <circle
      r="100"
      cx="125"
      cy="125"
      fill="transparent"
      :stroke="strokeColor"
      stroke-width="10"
      stroke-dasharray="calc(2 * 3.14159 * 50 / 2) calc(2 *3.14159 * 50 / 2)"
      transform="rotate(45, 125, 125)"
    />
    <text
      x="50%"
      y="40%"
      text-anchor="middle"
      :fill="codeClass.fill"
      :font-size="codeClass['font-size']"
      :font-weight="codeClass['font-weight']"
    >
      {{ code }}
    </text>
    <text
      x="50%"
      y="73%"
      text-anchor="middle"
      :fill="symbolClass.fill"
      :font-size="symbolClass['font-size']"
      :font-weight="symbolClass['font-weight']"
    >
      {{ symbol }}
    </text>
  </svg>
</template>

<script>
export default {
  name: 'FundLogoSvg',
  components: {},
  mixins: [],
  props: {
    fundSymbol: {
      type: String,
      default: 'XTF2000XXX'
    },
    height: { type: String, default: '2.5rem' },
    width: { type: String, default: '2.5rem' },
    companyColor: { type: String, default: '#ffffff' }
  },
  data() {
    return {
      strokeColor: '#333333',
      bgColor: '#000000'
    }
  },
  computed: {
    fundSymbolNoPrefix() {
      return this.fundSymbol.substring(4)
    },
    code() {
      return this.fundSymbolNoPrefix.substring(0, 3)
    },
    symbol() {
      return this.fundSymbolNoPrefix.substring(3, 7)
    },
    codeClass() {
      return {
        'font-size': '50px',
        'font-weight': 'bold',
        fill: '#ffffff'
      }
    },
    symbolClass() {
      return {
        'font-size': '90px',
        'font-weight': 'bold',
        fill: this.companyColor
      }
    }
  },
  watch: {},
  beforeCreate() {},
  created() {
    // this.strokeColor = this.companyColor
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {}
}
</script>

<style scoped>
</style>
