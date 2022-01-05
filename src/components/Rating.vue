<template>
  <div
    class="ui mini rating"
    :class="color"
    ref="ratingComponent"
    :data-tooltip="tooltip"
    data-position="left center"
    data-inverted=""
  ></div>
</template>

<script>
export default {
  name: 'Rating',
  props: {
    id: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true
    },
    icon: {
      type: String,
      default: 'star'
    },
    color: {
      type: String,
      default: 'yellow'
    },
    maxRating: {
      type: Number,
      required: false,
      default: 1
    },
    tooltip: {
      type: String,
      default: undefined
    },
    enabled: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      emitUpdateRating: true
    }
  },
  watch: {
    rating: function ratingUpdated(v) {
      this.emitUpdateRating = false
      $(this.$refs['ratingComponent']).rating('set rating', this.rating)
    }
  },
  mounted() {
    $(this.$refs['ratingComponent']).rating({
      icon: this.icon,
      initialRating: this.rating,
      maxRating: this.maxRating,
      interactive: this.enabled,
      onRate: function (value) {
        if (this.emitUpdateRating) {
          this.$emit('updateRating', value)
        }
        this.emitUpdateRating = true
      }.bind(this),
      clearable: true
    })
  }
}
</script>