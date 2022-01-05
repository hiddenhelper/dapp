<template>
  <div>
    <div class="ui top attached tabular menu" style="min-height: 60px" id="adminFuncs-tab">
      <div class="active item" data-tab="management-fee">Management Fee</div>
    </div>
    <div
      class="ui bottom attached tab segment"
      style="background-color: transparent"
      data-tab="management-fee"
    >
      <ManagementFeeAdmin :height="height - 40" @accrue="$emit('accrue', $event)" />
    </div>
  </div>
</template>

<script>
import ManagementFeeAdmin from './ManagementFeeAdmin.vue'

export default {
  name: 'AdminTab',
  components: { ManagementFeeAdmin },
  mixins: [],
  props: {
    height: {
      type: Number,
      default: 600
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
  mounted() {
    $('#adminFuncs-tab .item').tab()
  },
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {}
}
</script>

<style scoped>
</style>
