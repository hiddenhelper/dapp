<template>
  <div class="base-timer">
    <svg
      class="base-timer__svg"
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g class="base-timer__circle">
        <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45" />
        <path
          :stroke-dasharray="circleDasharray"
          class="base-timer__path-remaining"
          :class="remainingPathColor"
          d="
            M 50, 50
            m -45, 0
            a 45,45 0 1,0 90,0
            a 45,45 0 1,0 -90,0
          "
        ></path>
      </g>
    </svg>
    <div class="base-timer__label">
      <div
        class="ui three column compact center aligned grid"
        xstyle="background-color: yellow"
      >
        <div class="row">
          <div class="column">
            <div class="ui small statistic">
              <div
                class="value"
                :style="{
                  color: timeLeftComponents.d == 0 ? '#9a9a9a !important' : ''
                }"
              >
                {{ timeLeftComponents.d }}
              </div>
              <div class="label">Days</div>
            </div>
          </div>
          <div class="column">
            <div class="ui small statistic">
              <div
                class="value"
                :style="{
                  color:
                    timeLeftComponents.d == 0 && timeLeftComponents.h == 0
                      ? '#9a9a9a !important'
                      : ''
                }"
              >
                {{ timeLeftComponents.h }}
              </div>
              <div class="label">Hrs</div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="column">
            <div class="ui small statistic">
              <div
                class="value"
                :style="{
                  color:
                    timeLeftComponents.d == 0 &&
                    timeLeftComponents.h == 0 &&
                    timeLeftComponents.m == 0
                      ? '#9a9a9a !important'
                      : ''
                }"
              >
                {{ timeLeftComponents.m }}
              </div>
              <div class="label">Mins</div>
            </div>
          </div>
          <div class="column">
            <div class="ui small statistic">
              <div
                class="value"
                :style="{
                  color:
                    timeLeftComponents.d == 0 &&
                    timeLeftComponents.h == 0 &&
                    timeLeftComponents.m == 0 &&
                    timeLeftComponents.s == 0
                      ? '#9a9a9a !important'
                      : ''
                }"
              >
                {{ timeLeftComponents.s }}
              </div>
              <div class="label">Secs</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
const FULL_DASH_ARRAY = 283

export default {
  name: 'BaseTimer',
  props: {
    timeLeft: {
      type: Number,
      required: true
    },
    timeLimit: {
      type: Number,
      required: true
    },
    alertThreshold: {
      type: Number,
      default: 5 * 60 // 5 mins
    },
    warningThreshold: {
      type: Number,
      default: 15 * 60 // 15 mins
    }
  },
  computed: {
    timeLeftComponents() {
      var s = {
        // year: 31536000,
        // month: 2592000,
        // week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60,
        second: 1
      }
      var r = {}

      // console.log('BaseTimer', this.timeLimit)

      if (this.timeLimit > 0) {
        var d = this.timeLeft
        Object.keys(s).forEach(function (key) {
          r[key] = Math.floor(d / s[key])
          d -= r[key] * s[key]
        })

        // for example: {year:0,month:0,week:1,day:2,hour:34,minute:56,second:7}
        // console.log('111', r)
      } else {
        Object.keys(s).forEach(function (key) {
          r[key] = 0
        })
      }
      // console.log('222', r)
      return {
        d: r.day,
        h: r.hour,
        m: r.minute,
        s: r.second
      }
    },
    // Update the dasharray value as time passes, starting with 283
    circleDasharray() {
      return `${(this.timeFraction * FULL_DASH_ARRAY).toFixed(0)} 283`
    },
    timeFraction() {
      const rawTimeFraction = this.timeLeft / this.timeLimit
      return rawTimeFraction - (1 / this.timeLimit) * (1 - rawTimeFraction)
    },
    colorCodes() {
      return {
        info: {
          color: 'green'
        },
        warning: {
          color: 'orange',
          threshold: this.warningThreshold
        },
        alert: {
          color: 'red',
          threshold: this.alertThreshold
        }
      }
    },
    remainingPathColor() {
      const { alert, warning, info } = this.colorCodes
      if (this.timeLeft <= alert.threshold) {
        return alert.color
      } else if (this.timeLeft <= warning.threshold) {
        return warning.color
      } else {
        return info.color
      }
    }
  },
  methods: {}
}
</script>

<style scoped lang="scss">
/* Sets the containers height and width */
.base-timer {
  position: relative;
  width: 300px;
  height: 300px;

  &__svg {
    /* Flips the svg and makes the animation to move left-to-right */
    transform: scaleX(-1);
  }

  /* Removes SVG styling that would hide the time label */
  &__circle {
    fill: none;
    stroke: none;
  }

  /* The SVG path that displays the timer's progress */
  &__path-elapsed {
    stroke-width: 7px;
    stroke: grey;
  }

  &__path-remaining {
    /* Just as thick as the original ring */
    stroke-width: 7px;
    /* Rounds the line endings to create a seamless circle */
    stroke-linecap: round;
    /* Makes sure the animation starts at the top of the circle */
    transform: rotate(90deg);
    transform-origin: center;
    /* One second aligns with the speed of the countdown timer */
    transition: 1s linear all;
    fill-rule: nonzero;
    /* Allows the ring to change color when the color value updates */
    stroke: currentColor;

    &.green {
      color: rgb(65, 184, 131);
    }
    &.orange {
      color: orange;
    }
    &.red {
      color: red;
    }
  }

  &__label {
    position: absolute;
    /* Size should match the parent container */
    width: 300px;
    height: 300px;
    /* Keep the label aligned to the top */
    top: 0;
    /* Create a flexible box that centers content vertically and horizontally */
    display: flex;
    align-items: center;
    justify-content: center;
    /* Sort of an arbitrary number; adjust to your liking */
    font-size: 1.5rem !important;
  }
}
</style>
