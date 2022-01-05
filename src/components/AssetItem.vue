<template>
  <table
    :style="mainStyle"
    :id="this.id"
    @mouseover="$emit('mouseover')"
    @mouseout="$emit('mouseout')"
  >
    <tr>
      <td
        v-if="showAssetColorMark"
        style="width: 1rem; min-width: 1rem"
        :style="{ 'border-left': `5px solid ${asset.color}` }"
      ></td>
      <td
        :style="{
          width: padded ? '55px' : '35px',
          'min-width': padded ? '35px' : '35px'
        }"
      >
        <img
          class="ui image"
          :style="{
            cursor: hasValidWebsite ? 'pointer' : 'default',
            width: padded ? '30px' : '30px',
            height: padded ? '30px' : '30px'
          }"
          @click="goToAssetWebsite()"
          :src="asset.image"
        />
      </td>

      <td style="width: 98%; padding-left: 5px">
        <div class="ui mini header">
          {{ asset.symbol }}
          <div
            v-if="showDescription"
            class="sub header"
            style="font-weight: normal; color: inherit"
          >
            {{ asset.description }}
          </div>
        </div>
      </td>

      <td
        v-if="showPrice"
        style="width: 1%; text-align: right; font-weight: normal"
      >
        <span class="ui text" :class="{ red: asset.price.eq(0) }">
          {{ formattedPrice }}
        </span>
      </td>
      <td style="width: 1%; vertical-align: middle; padding-right: 1rem">
        <span
          v-if="showCopyButton != 'none'"
          :style="{ float: showCopyButton }"
          @click="copyTextToClipboard(asset.contract)"
          @mouseleave="initCopyAddressMessage()"
          :data-tooltip="copyAddressMessage"
          data-position="bottom right"
        >
          <i
            class="small copy outline icon grey"
            style="margin-bottom: 3px; cursor: copy; text-align: right"
          ></i>
        </span>
      </td>
      <td
        v-if="leftLabel"
        style="
          text-align: right;
          font-weight: normal;
          padding-right: 0.5rem;
          border-left: 1px solid #c3c3c3;
          border-right: 1px solid #c3c3c3;
        "
        :style="{ width: leftLabel.width, 'min-width': leftLabel.width }"
      >
        <!-- <div
          style="display: inline-block; vertical-align: middle; margin-right: 0.5rem"
          :style="{ width: leftLabel.width }"
        > -->
        {{ leftLabel.text }}
        <!-- </div> -->
      </td>
    </tr>
  </table>
</template>

<script>
import copy from 'copy-to-clipboard'
import numeral from 'numeral'

export default {
  name: 'AssetItem',
  props: {
    asset: {
      type: Object,
      required: true
    },
    leftLabel: {
      type: Object,
      required: false,
      default: () => {
        return undefined
      }
    },
    backgroundColor: {
      type: String,
      required: false,
      default: 'white'
    },
    showDescription: {
      type: Boolean,
      required: false,
      default: true
    },
    showCopyButton: {
      type: String,
      required: false,
      default: 'none'
    },
    showAssetColorMark: {
      type: Boolean,
      required: false,
      default: false
    },
    showPrice: {
      type: Boolean,
      required: false,
      default: false
    },
    padded: {
      type: Boolean,
      required: false,
      default: false
    },
    id: {
      type: String,
      required: false,
      default: undefined
    }
  },
  data() {
    return {
      copyAddressMessage: ''
    }
  },
  computed: {
    hasValidWebsite() {
      return !!this.asset.website
    },
    assetContract() {
      const w = this.asset.contract
      if (w && typeof w === 'string') {
        return w.substring(0, 6) + '...' + w.substring(w.length - 4)
      }

      return ''
    },
    mainStyle() {
      const defaultBorder = this.padded
        ? '1px solid ' + this.backgroundColor
        : ''
      /*
      const leftBorder = this.padded
        ? this.showAssetColorMark
          ? '0.5rem solid ' + this.asset.color
          : '1px solid ' + this.backgroundColor
        : ''
      */

      return {
        // padding: this.padded ? '2px 5px' : '',
        // padding: this.padded ? '' : '', // leftBorder, // 'border-radius': this.padded ? '5px' : '',
        // border: this.padded ? '1px solid ' + this.backgroundColor : '',
        /* 'border-top': defaultBorder,
        'border-bottom': defaultBorder,
        'border-right': defaultBorder,
        'border-left': defaultBorder, 'font-size': this
          .padded
          ? '0.9rem'
          : '1rem',
        color: '#525252',*/
        border: `0px none ${this.backgroundColor}`,
        'border-collapse': 'collapse',
        'background-color': this.backgroundColor
      }
    },
    formattedPrice() {
      return numeral(this.asset.price.toNumber()).format('0,0.0[0000]')
      // return this.asset.price.toFormat()
    }
  },
  created() {
    this.initCopyAddressMessage()
  },
  methods: {
    initCopyAddressMessage() {
      // this.copyAddressMessage = 'Copy to clipboard'
      this.copyAddressMessage = this.assetContract
    },
    goToAssetWebsite() {
      if (this.hasValidWebsite) {
        window.open(this.asset.website, '_blank')
        return true
      }
      return false
    },
    copyTextToClipboard(txt2BCopied) {
      if (copy(txt2BCopied)) {
        this.copyAddressMessage = 'Copied!'
      }
      return false
    }
  }
}
</script>

<style scoped>
td {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

/*--------------
  Semantic UI overrides
  ---------------*/

table,
.header {
  color: #525252 !important;
}
</style>
