<template>
  <div :id="id" class="ui dimmer" :class="{ inverted: invertedDimmer, page: pageDimmer }">
    <h2 class="ui icon header" :class="dimmerHeaderClass">
      <i :class="dimmerIconClass" style="color: inherit; margin-bottom: 2rem"></i>
      {{ dimmerMessage.header }}
      <span
        v-if="dimmerMessage.addAsset2Wallet"
        class="_pointer"
        data-tooltip="Add token to wallet"
        data-position="top center"
        style="margin-left: 1rem; vertical-align: middle"
        @click="dimmerMessage.addAsset2Wallet"
      >
        <img src="/images/metamask.svg" style="width: 25px" />
        <i class="plus tiny icon orange" style="margin-bottom: 0.5rem"></i>
      </span>
    </h2>

    <div
      v-show="dimmerMessage.subHeaders && dimmerMessage.subHeaders.length > 0"
      xclass="ui header"
      xxclass="{ inverted: !invertedDimmer }"
      style="
        margin-bottom: 1rem;
        font-weight: 500;
        font-size: 21px;
        color: rgba(255, 255, 255, 0.87);
      "
    >
      <div
        v-for="(subHeader, index) in subHeadersWithLink"
        :key="index"
        style="margin-bottom: 0.5rem"
      >
        <span v-if="subHeader.tx !== ''">
          {{ subHeader.textBefore }}
          <a :href="subHeader.explorerLink" :target="subHeader.tx">{{ subHeader.tx }}</a>
          {{ subHeader.textAfter }}
        </span>
        <span v-else>&nbsp;{{ subHeader.subHeader }}&nbsp;</span>
      </div>
    </div>

    <div class="content" style="font-size: 17px; color: rgba(255, 255, 255, 0.6)">
      <p v-for="(line, index) in dimmerMessage.lines" :key="index">&bull; {{ line }}</p>
      <p v-show="dimmerMessage.type == 'error'">
        We are here to help you, just drop us an email at
        <a href="mailto:support@dextf.com" style="color: white"> support@dextf.com </a>
        .
      </p>
      <p v-show="dimmerMessage.closable == true">~ click anywhere to dismiss this message ~</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DimmerMessage',
  props: {
    id: {
      type: String,
      required: true
    },
    dimmerMessage: {
      type: Object,
      required: true,
      default: () => {
        return {}
      }
    },
    invertedDimmer: {
      type: Boolean,
      required: true
    },
    pageDimmer: {
      type: Boolean,
      required: false,
      default: () => {
        return false
      }
    }
  },
  computed: {
    explorerLink() {
      if (this.fund) {
        return `${this.currentNetwork.explorer}/token/${this.fund.address}`
      }
      return ''
    },
    subHeadersWithLink() {
      // Computed property to create a object with explorerLink and necessary properties
      // from dimmerMessage.subHeaders
      return this.dimmerMessage.subHeaders
        ? this.dimmerMessage.subHeaders.map((subHeader) => {
            let explorerLink = undefined

            // Check if it's a tx address
            let regex = /0x[a-f0-9]{64}/gim
            let m = regex.exec(subHeader)
            if (m !== null) {
              explorerLink = `${this.explorerLink}/tx/${m[0]}`
            } else {
              // Check if it's a token address
              regex = /0x[a-f0-9]{40}/gim
              m = regex.exec(subHeader)
              if (m !== null) {
                explorerLink = `${this.explorerLink}/address/${m[0]}`
              }
            }

            if (explorerLink) {
              const splits = subHeader.split(m[0])
              return {
                tx: m[0],
                explorerLink: explorerLink,
                textBefore: splits[0] ? splits[0] : '',
                textAfter: splits[1] ? splits[1] : ''
              }
            } else {
              return {
                tx: '',
                subHeader: subHeader
              }
            }
          })
        : []
    },
    dimmerHeaderClass() {
      const headerClass = {}
      headerClass.inverted = !this.invertedDimmer
      if (this.dimmerMessage) {
        if (this.dimmerMessage.type == 'ok') {
          headerClass.green = true
        } else if (this.dimmerMessage.type == 'info') {
          headerClass.blue = true
        } else if (this.dimmerMessage.type == 'warning') {
          headerClass.orange = true
        } else if (this.dimmerMessage.type == 'error') {
          headerClass.red = true
        } else {
        }
      }
      return headerClass
    },
    dimmerIconClass() {
      const iconClass = {}
      if (this.dimmerMessage && this.dimmerMessage.header) {
        if (this.dimmerMessage.type == 'ok') {
          iconClass.green = true
          iconClass.check = true
          iconClass.circle = true
        } else if (this.dimmerMessage.type == 'info') {
          iconClass.blue = true
          iconClass.info = true
          iconClass.circle = true
        } else if (this.dimmerMessage.type == 'warning') {
          iconClass.orange = true
          iconClass.exclamation = true
          iconClass.triangle = true
        } else if (this.dimmerMessage.type == 'error') {
          iconClass.red = true
          iconClass.exclamation = true
          iconClass.circle = true
        } else {
          iconClass.notched = true
          iconClass.circle = true
          iconClass.loading = true
        }
        iconClass.icon = true
      }
      return iconClass
    }
  }
}
</script>