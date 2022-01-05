<template>
  <div v-if="singleValue">
    <span
      v-for="r in riskValues"
      :key="r.value"
      :data-tooltip="showTooltip ? r.tooltip : undefined"
      :data-position="
        tooltipPosition || (r.value > 2 ? 'bottom center' : 'bottom left')
      "
    >
      <i
        class="icon"
        :class="[size, r.icon, r.semanticColor]"
        :style="{ color: r.color }"
      ></i>
      <span v-if="showDescription">
        {{ r.desc }}
      </span>
    </span>
  </div>

  <div
    v-else
    :id="id"
    class="ui selection icon dropdown"
    :class="{ disabled: readOnly }"
  >
    <input type="hidden" name="risk" />
    <i class="dropdown icon"></i>
    <div class="default text">Select risk profile...</div>
    <div class="scrollhint menu">
      <div
        v-for="r in riskValues"
        :key="r.value"
        class="vertical item"
        :data-value="r.value"
      >
        <span class="text">
          <i
            class="icon"
            :class="[size, r.icon, r.semanticColor]"
            :style="{ color: r.color }"
          ></i>
          {{ r.desc }}
        </span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'RiskSelector',
  props: {
    risk: {
      type: Number,
      required: true
    },
    readOnly: {
      type: Boolean,
      default: true
    },
    showTooltip: {
      type: Boolean,
      default: false
    },
    tooltipPosition: {
      type: String,
      default: ''
    },
    size: {
      type: String,
      default: ''
    },
    showDescription: {
      type: Boolean,
      default: true
    },
    singleValue: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      values: [
        {
          value: 1,
          desc: 'CONSERVATIVE',
          icon: 'circle',
          color: '#5BB7FF',
          xsemanticColor: 'green',
          tooltip:
            'You consider investment losses in any given year to be unacceptable. You like the security your investments offer.'
        },
        {
          value: 2,
          desc: 'MODERATE',
          icon: 'circle',
          color: '#538A6E',
          xsemanticColor: 'olive',
          tooltip:
            'You don’t mind a little bit of fluctuation in your investment returns, but you would be uncomfortable with significant ups and downs'
        },
        {
          value: 3,
          desc: 'BALANCED',
          icon: 'circle',
          color: '#EAC251',
          xsemanticColor: 'yellow',
          tooltip:
            'You prefer a consistent growth pattern with few fluctuations.'
        },
        {
          value: 4,
          desc: 'GROWTH',
          icon: 'circle',
          color: '#B66A8C',
          xsemanticColor: 'orange',
          tooltip:
            'You are willing to take a higher risk with your money in order to achieve potentially higher returns'
        },
        {
          value: 5,
          desc: 'AGGRESSIVE',
          icon: 'circle',
          color: '#AB181A',
          xsemanticColor: 'red',
          tooltip:
            'You want long-term growth and you understand that a loss in one year may be the price you have to pay to achieve longer term growth.'
        }
      ]
    }
  },
  computed: {
    id() {
      return 'riskSelector' + this._uid
    },
    riskValues() {
      if (this.singleValue && this.risk > 0) {
        return this.values.slice(this.risk - 1, this.risk)
      } else {
        return this.values
      }
    }
  },
  mounted() {
    if (!this.singleValue) {
      $(`#${this.id}`).dropdown('set selected', this.risk)

      const methodToCallOnChange = this.setNewRisk
      $(`#${this.id}`).dropdown({
        onChange: function (value, text, selectedItem) {
          methodToCallOnChange(value)
        }
      })
    }
  },
  methods: {
    setNewRisk(value) {
      this.$emit('update:risk', Number(value))
    }
  }
}
</script>
