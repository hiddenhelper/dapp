<template>
  <div id="app">
    <div v-show="windowSize.width >= 770">
      <router-view id="mainRouterView" />
      <span class="ui small text" style="color: #222222">{{ dappVersion }}</span>
    </div>
    <div class="ui centered grid" v-show="windowSize.width < 770" style="height: 100%">
      <div class="ten wide column bottom aligned">
        <img class="ui small image centered" src="/images/misc/expand.png" />
      </div>
      <div class="ten wide column center aligned">
        <h1 ckass="ui header">YOUR SCREEN IS TOO SMALL TO RUN THE DOMANI APP.</h1>
      </div>
    </div>
    <span
      id="primaryColorHolder"
      class="ui text primary"
      _note="to extract the primary color"
    ></span>
  </div>
</template>

<script>
import { sizeHandlerMixin } from './mixins/windowMixins.js'
import { fillContractAddresses } from './modules/parseOutputs.js'

export default {
  name: 'App',
  mixins: [sizeHandlerMixin],
  computed: {
    dappVersion() {
      return process.env.VUE_APP_VERSION
    }
  },
  created() {
    fillContractAddresses()
  },
  mounted() {
    // Extract the color of the 'primary' css property
    const primaryColorHolder = document.getElementById('primaryColorHolder')
    if (primaryColorHolder) {
      const color = window.getComputedStyle(primaryColorHolder).color
      if (color) {
        this.$store.dispatch('updatePrimaryColor', color)
      }
    }
  }
}
</script>

<style scoped>
#app {
  width: 100%;
  height: 100%;
  overflow-x: auto;
  padding: 0 1rem;
}

#mainRouterView {
  width: 100%;
  height: 100%;
}
</style>
