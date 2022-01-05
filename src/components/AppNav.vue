<template>
  <div class="_topFixed">
    <!-- Menu  -->
    <div
      v-if="loggedIn && currentRouteRequiresAuth"
      class="ui secondary pointing menu"
      style="margin-left: auto; margin-right: auto"
      :style="{ 'max-width': widthInPx }"
    >
      <div class="header item" style="padding: 0">
        <img
          src="/images/logo_long_dark.png"
          alt="DOMANI"
          style="width: 200px; margin-left: 1rem; margin-right: 1rem"
        />
      </div>
      <div
        v-if="isInvestor"
        class="item"
        :class="{ active: id == 2, disabled: workInProgress }"
        @click="clicked(2)"
      >
        Browse
        <!--({{ noOfFunds }})-->
      </div>

      <div
        v-if="isInvestor"
        class="item"
        :class="{ active: id == 4, disabled: workInProgress }"
        @click="clicked(4)"
      >
        Investments
      </div>

      <div
        class="item"
        style="padding-left: 0; padding-right: 0; border-left: 1px solid #2a2a2a"
      ></div>

      <div
        v-if="isInvestor"
        XXv-if="isFundManager"
        class="item"
        :class="{ active: id == 1, disabled: workInProgress }"
        @click="clicked(1)"
      >
        Manage<!-- ({{ noOfManagedFunds }}) -->
      </div>

      <!--
      <div
        v-if="isInvestor"
        class="item"
        :class="{ active: id == 3, disabled: workInProgress }"
        @click="clicked(3)"
      >
        Marketplace
        <! --({{ noOfTradeableFunds }})-- >
      </div>
      -->

      <div id="rightMenu" class="right menu">
        <div
          v-if="isAdmin"
          class="item"
          :class="{ active: id == 5, disabled: workInProgress }"
          @click="clicked(5)"
        >
          Admin
        </div>
        <div class="item" style="padding: 0">
          <ChainConnector style="width: 100%" @clicked="clicked(10)" />
        </div>

        <div class="item _pointer" :class="{ disabled: workInProgress }" @click="logout()">
          <span data-tooltip="Log out" data-position="bottom center" data-inverted="">
            <i class="sign out alternate icon" style="margin: 0" />
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChainConnector from './MetaMaskConnectorCompact.vue'

export default {
  name: 'AppNav',
  components: {
    ChainConnector
  },
  props: {
    initialTab: {
      type: Number,
      required: false,
      default: 2
    },
    noOfManagedFunds: {
      type: Number,
      required: true
    },
    noOfFunds: {
      type: Number,
      required: true
    },
    noOfTradeableFunds: {
      type: Number,
      required: true
    },
    widthInPx: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      id: 1
    }
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
    currentRouteName() {
      return this.$route.name
    },
    currentRouteRequiresAuth() {
      return this.$route.meta.requiresAuth
    },
    topWarningHeightInPx() {
      return 55
    },
    menuHeightInPx() {
      return 70
    },
    totalHeight() {
      let h = 5
      h += this.menuHeightInPx
      return h
    }
  },
  created() {
    this.id = this.initialTab

    this.$emit('heightSet', this.totalHeight + 'px')
  },
  mounted() {},
  methods: {
    clicked(id) {
      if (this.workInProgress) {
        return
      }
      if (id < 10) {
        this.id = id
      }
      this.$emit('clicked', id)
    },
    logout() {
      // console.log(this.$options.name + '.logout')
      this.$store.state.workInProgressMessage = 'Logging out...'
      this.$store
        .dispatch('setWorkInProgress', true)
        .then(this.$store.dispatch('logout'))
        .finally(() => {
          this.$router.push({ name: 'home' })
          this.$store.state.workInProgressMessage = ''
          this.$store.dispatch('setWorkInProgress', false)
        })
    },
    help() {
      alert('Help - TO DO')
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

/*
.ui.menu .disabled.item {
  color: #9a9a9a !important;
}
*/

#rightMenu .item {
  height: 100%;
}

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
