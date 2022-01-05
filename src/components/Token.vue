<template>
  <table
    style="line-height: 1.2; border-spacing: 0; xbackground-color: red"
    :style="{ 'font-size': fontSize, 'font-weight': fontWeight }"
    @click="$emit('click')"
  >
    <tr>
      <td style="padding: 0" :style="{ width: subLabel ? '2rem' : '1.5rem' }">
        <span :data-tooltip="tooltip" data-position="right center" data-inverted="">
          <img
            v-if="image"
            :src="image"
            :style="{
              'max-height': subLabel ? '2rem' : '1.5rem',
              'max-width': subLabel ? '2rem' : '1.5rem'
            }"
          />
          <FundLogoSvg
            v-else
            :fund-symbol="logoLabel"
            :company-color="logoColor"
            :style="{
              'max-height': subLabel ? '2rem' : '1.5rem',
              'max-width': subLabel ? '2rem' : '1.5rem'
            }"
          >
          </FundLogoSvg>
        </span>
      </td>
      <td style="padding-left: 0.6rem; padding-right: 0">
        <div
          style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 500"
          :style="{
            'max-width': maxWidth,
            color: subLabel ? 'white' : undefined
          }"
          v-html="label"
        ></div>
        <div v-if="subLabel" class="_muted" v-html="subLabel"></div>
      </td>
    </tr>
  </table>
</template>
    
<script>
import FundLogoSvg from './FundLogoSvg.vue'

export default {
  name: 'Token',
  components: { FundLogoSvg },
  mixins: [],
  props: {
    image: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    subLabel: {
      type: String,
      default: ''
    },
    logoColor: {
      type: String,
      default: '#00ff00'
    },
    tooltip: {
      type: String,
      default: undefined
    },
    fontSize: {
      type: String,
      default: 'inherit'
    },
    fontWeight: {
      type: String,
      default: 'normal'
    },
    maxWidth: {
      type: String,
      default: '200px'
    }
  },
  data() {
    return {}
  },
  computed: {
    logoLabel() {
      let s = this.label
      let i = s.indexOf(this.currentNetwork.fundPrefix)
      if (i > -1) {
        s = this.label.substring(i)
        // Check for the beginning of an html tag
        i = s.indexOf('<')
        if (i > -1) {
          // String out the html tag and the rest
          s = s.substring(0, i)
        }
        return s
      }
      return 'xxxx---?'
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
  methods: {}
}
</script>
    
<style scoped>
</style>