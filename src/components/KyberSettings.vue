<template>
  <div
    class="ui left pointing vertical pointing menu"
    :style="{
      'background-color': backgroundColor,
      '--color': backgroundColor
    }"
  >
    <div
      class="item"
      :class="{ disabled: disabled }"
      style="padding: 0.3rem 0 0.3rem 0.5rem"
    >
      <div
        v-if="elementType == 1"
        id="allCryptos"
        class="ui floating labeled icon dropdown button"
        style="width: calc(100% - 1rem); padding: 0.3rem"
        :style="{ 'background-color': '#aeceea' }"
      >
        <i class="exchange alternate icon"></i>
        <!-- I create my own span element to show the selected item, in order to link it to reactive properties -->
        <span
          style="color: rgb(70, 81, 93); font-weight: bold"
          v-if="selectedCryptoObject.value"
        >
          <img
            class="ui avatar image"
            style="
              background-color: white;
              width: 2rem;
              border: 1px solid #cccccc;
            "
            :style="{
              padding: selectedCryptoObject.key == 'DAI' ? '4px' : '2px'
            }"
            :src="selectedCryptoObject.value.image"
          />
          &nbsp;
          {{ selectedCryptoObject.key }}
          &nbsp;
          <span style="font-weight: normal">
            {{ selectedCryptoObject.value.balance.toFormat(4) }}
          </span>
        </span>
        <div v-else style="color: rgb(70, 81, 93); padding: 0.4rem">
          Select crypto
        </div>

        <div class="menu">
          <div class="header">Select crypto</div>
          <div class="divider"></div>
          <div
            v-for="([key, value], index) in Object.entries(exchangeAssets)"
            :key="key"
            class="item"
            :class="{
              active: index == 0,
              disabled: !exchangeAssetAllowed(key)
            }"
            :data-value="key"
          >
            <img
              class="ui avatar image"
              style="
                background-color: white;
                width: 2rem;
                border: 1px solid #cccccc;
              "
              :style="{
                padding: key == 'DAI' ? '4px' : '2px'
              }"
              :src="value.image"
            />
            <span class="text">
              {{ key }}
            </span>
            <span class="description">
              {{ value.balance.toFormat(4) }}
            </span>
          </div>
        </div>
      </div>

      <span v-if="elementType == 2">
        {{ swapLabel }}
      </span>
      <div v-if="elementType == 2" id="allCryptos" class="ui inline dropdown">
        <span
          v-if="useCustomReactiveElement"
          style="xxmin-width: 130px; display: inline-block"
        >
          <img
            class="ui avatar image"
            style="
              background-color: white;
              width: 2rem;
              border: 1px solid #cccccc;
            "
            :style="{
              padding: selectedCryptoObject.key == 'DAI' ? '4px' : '2px'
            }"
            :src="selectedCryptoObject.value.image"
          />
          <span style="color: rgb(22, 121, 198); font-weight: bold">
            {{ selectedCryptoObject.key }}
            &nbsp;
          </span>
          <span style="color: rgba(0, 0, 0, 0.4)">
            {{ selectedCryptoObject.value.balance.toFormat(4) }}
          </span>
        </span>
        <span v-else class="text" style="color: rgb(22, 121, 198)"></span>

        <i class="dropdown icon" style="margin: 0.2rem 0.5rem"></i>

        <div class="menu">
          <div class="header">Select crypto</div>
          <div class="divider"></div>
          <div
            v-for="([key, value], index) in Object.entries(exchangeAssets)"
            :key="key"
            class="item"
            :class="{
              active: index == 0,
              disabled: !exchangeAssetAllowed(key)
            }"
            :data-value="key"
            :data-text="useCustomReactiveElement ? key : undefined"
          >
            <img
              class="ui avatar image"
              style="
                background-color: white;
                width: 2rem;
                border: 1px solid #cccccc;
              "
              :style="{
                padding: key == 'DAI' ? '4px' : '2px'
              }"
              :src="value.image"
            />
            <span class="description">
              {{ value.balance.toFormat(4) }}
            </span>
            <span class="text">
              {{ key }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div
      class="active item"
      style="background-color: transparent !important; padding: 0.5rem"
    >
      <div
        class="fields"
        :class="{ disabled: disabled }"
        style="margin: 0 0 0.5rem 0"
      >
        <div class="field" style="margin: 0px; padding: 0px">
          <div class="ui radio checkbox">
            <input type="radio" id="1" value="1" v-model="tradeStyle" />
            <label>Set max slippage to</label>
          </div>
        </div>
        <div class="inline field" :class="{ disabled: tradeStyle != 1 }">
          <div class="ui icon input">
            <input
              class="right aligned"
              style="height: 2rem"
              type="number"
              min="1"
              max="100"
              v-model="maxSlippage"
              @change="validateMaxSlippage()"
            />
            <i class="percentage icon"></i>
          </div>
        </div>
      </div>
      <div
        class="field"
        :class="{ disabled: disabled }"
        style="margin: 0px; padding: 0px"
      >
        <div class="ui radio checkbox">
          <input
            type="radio"
            id="0"
            value="0"
            v-model="tradeStyle"
            checked="checked"
          />
          <label> Accept market slippage </label>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import BigNumber from 'bignumber.js'

export default {
  name: 'KyberSettings',
  props: {
    swapLabel: {
      type: String,
      required: true
    },
    exchangeAssets: {
      type: Object,
      required: true
    },
    kyberSettings: {
      type: Object,
      required: true,
      default: () => {
        return {
          selectedCrypto: '',
          tradeStyle: 0,
          maxSlippage: 0
        }
      }
    },
    disabled: {
      type: Boolean,
      required: true
    },
    backgroundColor: {
      type: String,
      required: false,
      default: 'white'
    },
    fncExchangeAssetAllowed: {
      type: Function,
      required: true
    }
  },
  data() {
    return {
      selectedCrypto: '',
      tradeStyle: 0,
      maxSlippage: 0,
      elementType: 2, // or 2
      /*
      To show the selected crypto we can:
      a) use a custom element (that is reactive, so the balance changes as the user switches address) OR
      b) use the default Semantic UI element (that is not reactive)
      */
      useCustomReactiveElement: true
    }
  },
  computed: {
    selectedCryptoObject() {
      if (this.selectedCrypto) {
        const keyValue = Object.entries(this.exchangeAssets).find(
          ([key, value]) => {
            return key == this.selectedCrypto
          }
        )
        if (keyValue) {
          return { key: keyValue[0], value: keyValue[1] }
        }
      }
      return { key: '-', value: undefined }
    }
  },
  created() {
    this.selectedCrypto = this.kyberSettings.selectedCrypto
    this.tradeStyle = this.kyberSettings.tradeStyle
    this.maxSlippage = this.kyberSettings.maxSlippage
  },
  mounted() {
    const methodToCallOnChange1 = this.cryptoChanged
    const methodToCallOnChange2 = this.tradeStyleChanged

    // Initilize Semantic UI jquery
    $('.checkbox').checkbox({
      onChange: function () {
        methodToCallOnChange2(this.value)
      }
    })

    $('#allCryptos').dropdown({
      onChange: function (value, text, selectedItem) {
        methodToCallOnChange1(value)
      }
    })

    // Select initial value
    if (this.selectedCrypto) {
      $('#allCryptos').dropdown('set selected', this.selectedCrypto)
    }
    this.log(this.$options.name, 'mounted')
  },
  methods: {
    cryptoChanged(value) {
      if (this.selectedCrypto != value) {
        this.selectedCrypto = value
        this.settingsChanged()
      }
    },
    tradeStyleChanged(value) {
      this.settingsChanged()
    },
    validateMaxSlippage() {
      // Min 0, Max 100
      this.maxSlippage = Math.min(Math.max(this.maxSlippage, 0), 100)
      this.settingsChanged()
    },
    settingsChanged() {
      this.$emit('settingsChanged', {
        selectedCrypto: this.selectedCrypto,
        tradeStyle: this.tradeStyle * 1,
        maxSlippage: this.tradeStyle == 0 ? 0 : this.maxSlippage
      })
    },
    exchangeAssetAllowed(a) {
      // return false
      return this.fncExchangeAssetAllowed(a)
    }
  }
}
</script>

<style scoped>
/*--------------
  Semantic UI overrides
  ---------------*/

/* Left pointing does not exist, so I mimic it */
.ui.vertical.left.pointing.menu .item:after {
  background-color: var(--color, white);
  right: auto;
  left: 0;
  -webkit-transform: translateX(-50%) translateY(-350%) rotate(45deg);
  transform: translateX(-50%) translateY(-350%) rotate(45deg);
  margin: 0 0 0 -0.5px;
  border: none;
  border-bottom: 1px solid #d4d4d5;
  border-left: 1px solid #d4d4d5;
}
</style>
