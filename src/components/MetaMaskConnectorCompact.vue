<template>
  <div class="ui middle aligned two column compact grid" style="min-width: 30rem">
    <div class="column">
      <div
        class="ui basic label"
        :class="{ faded: !connector || !isConnected || !isNetworkValid }"
        style="
          background-color: transparent;
          background-position: 1rem center;
          background-repeat: no-repeat;
          background-size: auto 2rem;
          text-align: center;
          line-height: 1.2rem;
          width: 100%;
          height: 55px;
          padding: 0.7rem 0.5rem 0.7rem 2.2rem;
          font-size: 1rem;
          font-weight: 600;
          text-transform: uppercase;
        "
        :style="{
          color: network.color,
          'background-image': `url(/images/buttons/${network.network}.png)`
        }"
      >
        {{ network.network }}
        <div
          style="
            font-size: smaller;
            font-weight: 400;
            color: rgba(255, 255, 255, 0.87);
            text-transform: uppercase;
          "
        >
          {{ network.name }}
        </div>
      </div>
    </div>
    <div class="column" @click="$emit('clicked')">
      <div
        class="ui basic label"
        style="
          background-color: transparent;
          background-position: 1rem center;
          background-repeat: no-repeat;
          background-size: auto 1.8rem;
          text-align: center;
          line-height: 1.2rem;
          color: #ffffff;
          width: 100%;
          height: 55px;
          padding: 1.2rem 0.5rem 1.2rem 3rem;
          font-size: 1rem;
          font-weight: 400;
          text-transform: uppercase;
        "
        :style="{ 'background-image': `url('/images/buttons/${wallet}.png')` }"
      >
        <span v-if="!connector || !isConnected" class="ui red text"> Not connected </span>
        <span v-else-if="!isNetworkValid" class="ui red text">wrong network</span>
        <CopyField
          v-else
          :text="$store.getters.walletAddressMasked"
          :value="$store.state.currentAccount.address"
          :tooltip-position="'bottom left'"
        />
      </div>
    </div>
  </div>
</template>

<script>
import CopyField from './CopyField.vue'

export default {
  name: 'MetaMaskConnectorCompact',
  components: { CopyField },
  mixins: [],
  data() {
    return {
      META_MASK_STATUSES: {
        notInstalled: 0,
        locked: 1,
        notConnected: 2,
        connectedWrong: 3,
        notPermissioned: 4,
        connectedOk: 10
      },
      networkId: -1,

      metaMaskUnlocked: false,
      intervalId: undefined,
      listenersAdded: false,
      show: false,
      copyAddressMessage: 'Copy to clipboard'
    }
  },
  computed: {
    network() {
      if (this.currentNetwork) {
        return this.currentNetwork
      }

      let desiredNetwork
      if (this.$route.params && this.$route.params.deploymentName) {
        desiredNetwork = this.$store.state.networks.find(
          (n) => n.deploymentName == this.$route.params.deploymentName
        )
      }

      if (desiredNetwork) {
        return desiredNetwork
      }

      return { network: '', name: '', image: '' }
    }
  },
  created() {},
  mounted() {},
  beforeDestroy() {},
  methods: {}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.faded {
  opacity: 0.35;
}
</style>