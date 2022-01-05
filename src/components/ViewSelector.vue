<template>
  <div class="ui icon basic buttons" style="height: 2.7rem">
    <button
      class="ui button"
      :class="{
        active: mode === 'card-view'
      }"
      @click="$emit('update:mode', 'card-view')"
    >
      <i
        class="th icon"
        :class="{
          blue: mode === 'card-view'
        }"
      ></i>
    </button>
    <button
      class="ui button"
      :class="{
        active: mode === 'tabular-view'
      }"
      @click="$emit('update:mode', 'tabular-view')"
    >
      <i
        class="th list icon"
        :class="{
          blue: mode === 'tabular-view'
        }"
      ></i>
    </button>
  </div>
</template>

<script>
export default {
  name: 'ViewSelector',
  props: {
    mode: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
i.icon {
  margin-right: 0px !important;
}

.ui.active.button {
  background-color: #2185d0;
}
</style>