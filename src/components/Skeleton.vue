<template>
  <div>something</div>
</template>

<script>
export default {
  name: 'Skeleton',
  components: {},
  mixins: [],
  props: {
    prop1: {
      type: Object,
      required: true,
      default: () => {
        return {}
      }
    }
  },
  data() {
    return {
      data1: 1
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
  methods: {}
}
</script>

<style scoped>
</style>
