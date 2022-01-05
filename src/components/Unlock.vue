<template>
  <div class="ui card">
    <div class="content">
      <div
        class="_muted"
        style="font-size: 0.9rem; line-height: 1.75rem"
        v-if="idle"
      >
        Start the {{ unlockPeriodString }} unlocking
        <br />
        period, after which you
        <br />
        can unstake/claim your DEXTF
      </div>
      <div
        class="_muted"
        style="font-size: 0.9rem; line-height: 1.75rem"
        v-else-if="unlocking"
      >
        Staked/earned DEXTF will
        <br />
        be redeemable in:
      </div>
      <div
        class="_muted"
        style="font-size: 0.9rem; line-height: 1.75rem"
        v-else-if="claimable"
      >
        Staked/earned DEXTF are
        <br />
        now redeemable for:
      </div>
    </div>
    <div v-if="idle" class="extra content" style="padding-top: 0">
      <div
        class="ui fluid button"
        @click="$emit('unlock')"
        :class="{
          disabled: !idle || disabled,
          primary: !unavailable
        }"
      >
        Unlock
      </div>
    </div>
    <Countdown v-if="!idle" :end-date-utc="endDateUtc" style="height: 50px" />
  </div>
</template>

<script>
import Countdown from './Countdown.vue'

export default {
  name: 'Stake',
  components: { Countdown },
  props: {
    status: {
      type: String,
      default: 'idle',
      validator: function (value) {
        return ['idle', 'unlocking', 'claimable'].indexOf(value) !== -1
      }
    },
    unlockTime: {
      type: Number,
      default: 0
    },
    relockTime: {
      type: Number,
      default: 0
    },
    unlockPeriod: {
      type: Number,
      default: 0
    },
    disabled: {
      type: Boolean,
      default: false
    },
    unavailable: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    endDateUtc() {
      return new Date(
        (this.status === 'unlocking' ? this.unlockTime : this.relockTime) * 1000
      ).toUTCString()
    },
    idle() {
      return this.status === 'idle'
    },
    unlocking() {
      return this.status === 'unlocking'
    },
    claimable() {
      return this.status === 'claimable'
    },
    unlockPeriodString() {
      // We assume the period is a full number of days or hours or minutes (no fractions)
      let minutes = this.unlockPeriod
      let unit = 'minute'
      if (minutes >= 1440) {
        minutes /= 1440
        unit = 'day'
      } else if (minutes >= 60) {
        minutes /= 60
        unit = 'hour'
      }
      return `${minutes}-${unit}`
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