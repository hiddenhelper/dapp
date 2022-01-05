<template>
  <div
    style="cursor: copy; white-space: nowrap"
    :style="{ 'font-size': fontSize }"
    :data-tooltip="copyAddressMessage"
    :data-position="tooltipPosition"
    data-inverted=""
    @click.stop="copyTextToClipboard(value)"
    @mouseleave="copyAddressMessage = 'Copy to clipboard'"
  >
    {{ text }}
    <i class="copy outline small icon" style="margin: 0 0 0.2rem 0"></i>
  </div>
</template>

<script>
import copy from 'copy-to-clipboard'

export default {
  name: 'CopyField',
  components: {},
  mixins: [],
  props: {
    text: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    fontSize: {
      type: String,
      default: 'inherit'
    },
    tooltipPosition: {
      type: String,
      default: 'bottom center'
    }
  },
  data() {
    return {
      copyAddressMessage: 'Copy to clipboard'
    }
  },
  computed: {},
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
    copyTextToClipboard(txt2BCopied) {
      if (copy(txt2BCopied)) {
        this.copyAddressMessage = 'Copied!'
      }
      return false
    }
  }
}
</script>
    
<style scoped>
</style>