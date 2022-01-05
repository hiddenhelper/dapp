<template>
  <div :style="{ 'background-color': bg, height: heightInPx }">
    <!-- HEADER -->
    <h1 v-if="header" class="ui horizontal left aligned divider header">
      {{ header }}
    </h1>

    <slot name="header"></slot>

    <div style="overflow-y: auto" :style="{ height: rowTableHeightInPx }">
      <slot name="body"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FundTable',
  components: {},
  mixins: [],
  props: {
    header: {
      type: String,
      default: ''
    },
    height: {
      type: Number,
      default: 600
    },
    bg: {
      type: String,
      default: 'inherit'
    }
  },
  data() {
    return {
      data1: 1
    }
  },
  computed: {
    heightInPx() {
      return this.height + 'px'
    },
    rowTableHeight() {
      // Account for the Header and Header Columns
      return this.height - (this.header ? 50 : 0) - 45
    },
    rowTableHeightInPx() {
      return this.rowTableHeight + 'px'
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
._sortable {
  cursor: pointer !important;
}

._dynamicFundCheckbox label:before,
._dynamicFundCheckbox input:focus ~ label:before,
._dynamicFundCheckbox input:checked ~ label:before,
._dynamicFundCheckbox input:checked:focus ~ label:before {
  background: rgba(149, 252, 112, 0.5) !important;
}

._staticFundCheckbox label:before,
._staticFundCheckbox input:focus ~ label:before,
._staticFundCheckbox input:checked ~ label:before,
._staticFundCheckbox input:checked:focus ~ label:before {
  background: rgba(42, 42, 42, 1) !important;
}
</style>