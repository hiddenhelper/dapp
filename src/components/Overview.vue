<template>
  <div class="ui fluid card" style="background-color: black !important">
    <div v-if="title" class="content">
      <h3 class="ui header _muted" style="margin: 0">
        {{ title }}
      </h3>
    </div>

    <div class="content">
      <div class="ui four column divided grid center aligned">
        <div class="row">
          <div
            v-for="(d, index) in data"
            :key="index"
            class="column"
            v-html="d.text"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Skeleton',
  components: {},
  mixins: [],
  props: {
    title: {
      type: String,
      default: ''
    },
    data: {
      type: Array,
      default: () => {
        return [
          { header: 'Header 1', text: 'Simple text' },
          { header: 'Header 2', text: '<b>HTML text</b>' }
        ]
      }
    }
  },
  data() {
    return {}
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
  methods: {}
}
</script>

<style scoped>
</style>
