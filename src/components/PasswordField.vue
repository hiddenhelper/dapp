<template>
  <div class="field" :class="{ required: required }">
    <label v-if="label">
      {{ label }}
    </label>
    <div
      class="ui left icon input"
      :class="{ action: showHideButton, big: big }"
    >
      <i class="lock icon"></i>
      <i
        v-if="required && !label"
        class="asterisk tiny red icon"
        style="opacity: 1; margin-top: -5px !important"
      ></i>
      <input
        :type="show ? 'text' : 'password'"
        :name="name"
        :id="name"
        :value="value"
        @input="$emit('input', $event.target.value)"
        :placeholder="placeholder"
        :tabindex="tabIndex"
        :autocomplete="autoComplete"
      />
      <div
        v-if="showHideButton"
        class="ui icon basic button"
        style="background: #0c0c0c; border: none; box-shadow: none"
        @click.prevent="show = !show"
        tabindex="-1"
      >
        <i class="icon" :class="{ eye: show, 'eye slash': !show }"></i>
      </div>
    </div>
    <div v-if="showCharacterCount" class="ui two column grid">
      <span class="column" style="font-size: 80%">
        {{ value.trim().length }} characters
      </span>
      <span
        v-if="showStrength"
        class="column"
        style="font-size: 80%; text-align: right"
      >
        <span class="ui text" :style="{ color: strengths[strength].color }">
          {{ strengths[strength].text }}&nbsp;
          <i
            class="stop icon"
            :style="{
              color: strength >= 0 ? strengths[strength].color : 'lightGrey'
            }"
          ></i>
          <i
            class="stop icon"
            :style="{
              color: strength >= 1 ? strengths[strength].color : 'lightGrey'
            }"
          ></i>
          <i
            class="stop icon"
            :style="{
              color: strength >= 2 ? strengths[strength].color : 'lightGrey'
            }"
          ></i>
          <i
            class="stop icon"
            :style="{
              color: strength >= 3 ? strengths[strength].color : 'lightGrey'
            }"
          ></i>
          <i
            class="stop icon"
            :style="{
              color: strength >= 4 ? strengths[strength].color : 'lightGrey'
            }"
          ></i>
        </span>
      </span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordField',
  props: {
    value: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    strength: {
      type: Number,
      required: false,
      default: -1
    },
    tabIndex: {
      type: Number,
      required: false,
      default: -1
    },
    label: {
      type: String,
      required: false,
      default: ''
    },
    placeholder: {
      type: String,
      required: false,
      default: ''
    },
    required: {
      type: Boolean,
      required: false,
      default: true
    },
    big: {
      type: Boolean,
      required: false,
      default: false
    },
    showHideButton: {
      type: Boolean,
      required: false,
      default: true
    },
    showCharacterCount: {
      type: Boolean,
      required: false,
      default: false
    },
    showStrength: {
      type: Boolean,
      required: false,
      default: false
    },
    autoComplete: {
      type: String,
      required: false,
      default: ''
    }
  },
  data() {
    return {
      show: false,
      strengths: {
        '-1': { text: '', color: '' },
        0: { text: 'very weak', color: 'red' },
        1: { text: 'weak', color: 'red' },
        2: { text: 'medium', color: 'orange' },
        3: { text: 'strong', color: 'green' },
        4: { text: 'very strong', color: 'green' }
      }
    }
  }
}
</script>

<style scoped>
.stop.icon {
  margin: 0px !important;
}
</style>
