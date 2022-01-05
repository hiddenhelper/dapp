<template>
  <div class="_topFixed">
    <div
      class="ui secondary menu"
      style="margin-left: auto; margin-right: auto"
      :style="{ 'max-width': widthInPx, height: menuHeightInPx + 'px' }"
    >
      <div class="header item" style="padding: 0">
        <img
          src="/images/logo_long_dark.png"
          alt="DOMANI"
          style="width: 200px; margin-left: 1rem; margin-right: 1rem"
        />
      </div>

      <div class="right item" :class="{ disabled: workInProgress }">
        <div class="ui buttons">
          <div class="ui button primary" style="width: 145px" @click="emitConnect">Connect</div>
          <div id="connectDropdown" class="ui dropdown icon button primary">
            <i class="dropdown icon black"></i>
            <div class="ui vertical menu" style="width: 130px"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HomeNav',
  components: {},
  props: {
    widthInPx: {
      type: String,
      required: true
    }
  },
  data() {
    return {}
  },
  computed: {
    dappVersion() {
      if (this.$store.state.environment == 'prod') {
        return undefined
      } else if (this.$store.state.environment == 'ropsten') {
        return 'ropsten'
      } else {
        return this.$store.state.environment + ' ' + process.env.VUE_APP_VERSION
      }
    },
    versionTooltip() {
      if (this.$store.state.environment != 'dev') {
        return undefined
      }
      return (
        'Ðapp v. ' +
        process.env.VUE_APP_VERSION +
        ' | Helium v. ' +
        process.env.VUE_APP_HELIUM_VERSION
      )
    },
    menuHeightInPx() {
      return 60
    }
  },
  created() {},
  mounted() {
    $('#connectDropdown').dropdown({
      values: [
        {
          name: 'Connect',
          value: 'V2',
          selected: true
        },
        {
          name: 'Connect to V1',
          value: 'V1'
        }
      ],
      action: 'combo'
    })
  },
  methods: {
    emitConnect() {
      const version = $('#connectDropdown').dropdown('get value')
      this.$emit('connect', version)
    }
  }
}
</script>

<style scoped>
/*
.ui.menu .item {
  color: #525252 !important;
}
*/

._topFixed {
  position: fixed;
  z-index: 999;
  width: 100%;
  top: 0;
  left: 0;
  right: auto;
  bottom: auto;
  border-top: none;
  border-left: none;
  border-right: none;
  background-color: #1e1e1e;
}

.ui.menu {
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05)), #121212 !important;
}
</style>
