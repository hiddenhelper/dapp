<template>
  <!-- HEADER COLUMNS -->
  <table
    v-if="showHeader"
    class="ui clear table bottom aligned"
    style="margin: 0; border-spacing: 0"
    :style="{ 'font-size': fontSize }"
  >
    <thead class="full-width">
      <!-- Header, also used to impose the columns' widths -->
      <tr>
        <th
          v-for="config in columnConfigs"
          :key="config.key"
          :style="config.style"
          @click="emitSortBy(config.header)"
        >
          <i
            v-if="sortOptions.by === config.header"
            :class="{
              sort: true,
              amount: true,
              up: sortOptions.order === 'asc',
              down: sortOptions.order === 'desc',
              icon: true
            }"
          ></i>
          {{ config.header }}
          <div v-if="config.subHeader" class="_muted _normal">
            {{ config.subHeader }}
          </div>
        </th>
      </tr>
    </thead>
  </table>
</template>

<script>
export default {
  name: 'FundTableHeader',
  components: {},
  mixins: [],
  props: {
    columnConfigs: {
      type: Array,
      required: true
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    fontSize: {
      type: String,
      default: 'inherit'
    },
    initialSortOptions: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      sortOptions: {
        by: '',
        order: ''
      }
    }
  },
  computed: {},
  watch: {},
  beforeCreate() {},
  created() {
    this.sortOptions.by = this.initialSortOptions.by
    this.sortOptions.order = this.initialSortOptions.order
    // disallow user to switch the order if the fixed property is true
    this.sortOptions.fixed = this.initialSortOptions.fixed
  },
  beforeMount() {},
  mounted() {},
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {},
  destroyed() {},
  methods: {
    emitSortBy(by) {
      if (this.sortOptions.fixed) {
        this.sortOptions.by = by
      } else if (by === this.sortOptions.by) {
        this.sortOptions.order =
          this.sortOptions.order === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortOptions.by = by
        this.sortOptions.order = 'asc'
      }

      this.$emit('sort', this.sortOptions)
    }
  }
}
</script>

<style scoped>
tr th {
  padding: 0.3rem 0;
  text-transform: capitalize !important;
}
</style>
