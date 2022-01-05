<template>
  <div class="ui card">
    <div class="content">
      <div class="_muted" style="font-size: 0.9rem; line-height: 1.75rem">
        Claim all your earnings and
        <br />
        receive them in your wallet
        <br />
        &nbsp;
      </div>
    </div>
    <div class="extra content" style="padding-top: 0">
      <div
        class="ui fluid button"
        @click="$emit('claim')"
        :class="{
          disabled: disabled,
          primary: !unavailable
        }"
      >
        Claim
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Claim',
  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    unavailable: {
      type: Boolean,
      default: false
    }
  }
}
</script>