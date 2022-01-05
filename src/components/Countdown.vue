<template>
  <div class="_muted" style="font-size: 0.9rem; line-height: 1.75rem; text-align: center">
    <span v-show="showDays">
      <span class="_green">{{ leftDays }}</span> days,
    </span>
    <span v-show="showHours">
      <span class="_green">{{ leftHours }}</span> hours,
    </span>
    <span v-show="showMinutes">
      <span class="_green">{{ leftMinutes }}</span> mins<span v-show="showSeconds">, </span>
    </span>
    <span v-show="showSeconds">
      <span class="_green">{{ leftSeconds }}</span> secs
    </span>
  </div>
</template>

<script>
export default {
  name: 'Countdown',
  props: {
    endDateUtc: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      leftDays: 0,
      leftHours: 0,
      leftMinutes: 0,
      leftSeconds: 0,
      intervalId: undefined
    }
  },
  computed: {
    secondToMilliseconds() {
      return 1000
    },
    minuteToMilliseconds() {
      return this.secondToMilliseconds * 60
    },
    hourToMilliseconds() {
      return this.minuteToMilliseconds * 60
    },
    dayToMilliseconds() {
      return this.hourToMilliseconds * 24
    },
    showSeconds() {
      return this.leftDays === 0
    },
    showMinutes() {
      return this.showDays || this.showHours || this.leftMinutes !== 0
    },
    showHours() {
      return this.showDays || this.leftHours !== 0
    },
    showDays() {
      return this.leftDays !== 0
    }
  },
  created() {
    this.createInterval()
  },
  methods: {
    createInterval() {
      if (this.intervalId) clearInterval(this.intervalId)
      const endDateTime = new Date(this.endDateUtc).getTime()

      let now = new Date().getTime()

      if (endDateTime > now) {
        this.intervalId = setInterval(() => {
          now = new Date().getTime()
          const leftMilliseconds = endDateTime - now

          this.leftDays = Math.floor(leftMilliseconds / this.dayToMilliseconds)
          this.leftHours = Math.floor(
            (leftMilliseconds % this.dayToMilliseconds) / this.hourToMilliseconds
          )
          this.leftMinutes = Math.floor(
            (leftMilliseconds % this.hourToMilliseconds) / this.minuteToMilliseconds
          )
          this.leftSeconds = Math.floor(
            (leftMilliseconds % this.minuteToMilliseconds) / this.secondToMilliseconds
          )

          if (
            this.leftDays <= 0 &&
            this.leftHours <= 0 &&
            this.leftMinutes <= 0 &&
            this.leftSeconds <= 0
          ) {
            clearInterval(this.intervalId)
            this.intervalId = undefined
          }
        }, 1000)
      }
    }
  },
  watch: {
    endDateUtc() {
      this.createInterval()
    }
  }
}
</script>