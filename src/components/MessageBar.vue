<template>
  <div
    class="ui message"
    :class="currentMessageClass"
    style="padding-left: 0.8rem; padding-right: 0.8rem"
    :style="currentMessageStyle"
    v-html="currentMessage.text"
  ></div>
</template>
    
<script>
export default {
  name: 'MessageBar',
  components: {},
  mixins: [],
  props: {
    messages: {
      type: Array,
      default: new Array()
    }
  },
  data() {
    return {}
  },
  computed: {
    currentMessage() {
      if (this.messages.length > 0) return this.messages[0]
      return { text: '', type: 'info' }
    },
    currentMessageClass() {
      const classObj = {}
      classObj[this.currentMessage.type] = true
      if (this.currentMessage.size) {
        classObj[this.currentMessage.size] = true
      }
      return classObj
    },
    currentMessageStyle() {
      const styleObj = {}
      styleObj['padding-top'] = this.currentMessage['padding-top']
      styleObj['padding-bottom'] = this.currentMessage['padding-bottom']
      return styleObj
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