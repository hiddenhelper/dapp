<template>
  <div class="ui very padded segment" style="margin: 0">
    <div style="font-weight: 600; font-size: 36px; margin-bottom: 6rem">
      Connect to
      <img
        class="ui spaced image"
        src="/images/logo_long_dark.png"
        alt="DOMANI"
        style="width: 230px; margin-left: 0.5rem"
      />
    </div>

    <!-- <div
      style="
        font-weight: 600;
        font-size: 36px;
        color: rgba(255, 255, 255, 0.87);
        line-height: 53px;
      "
    >
      Connect to
      <img
        src="/images/logo_long_light.png"
        alt="DOMANI"
        style="width: 200px; margin-left: 0.5rem"
      />
    </div> -->

    <div class="ui horizontal divider">Network</div>
    <div class="ui top attached segment" style="min-height: 60px; margin-bottom: 3rem">
      <!-- <div style="xtext-align: center; font-size: 1.2rem; margin-bottom: 1rem">Select network:</div> -->
      <div
        class="ui secondary menu"
        :class="networks.noOfMenuItems"
        style="margin-top: 0; xbackground-color: green"
      >
        <div
          v-for="(item, index) in networks.items"
          :key="index"
          class="item"
          :class="{ disabled: item.disabled }"
          style="padding: 0 1rem 0 0 !important"
        >
          <div
            class="_connectionButton"
            :class="{ _disabled: item.disabled }"
            style="
              background-position: center 1rem;
              background-repeat: no-repeat;
              background-size: auto 2.5rem;
              padding-left: 1rem;
              padding-right: 1rem;
              padding-top: 1rem;
              height: 6rem;
              font-weight: normal;
              font-size: 1.2rem;
              border-radius: 1rem;
              width: 100%;
            "
            :style="{
              'background-image': `url('${item.image}')`
            }"
            @click="selectNetwork(item)"
          >
            <i
              v-show="item.network === selectedNetwork"
              class="icons"
              style="margin-left: 3rem; margin-top: 1rem; height: 1.25rem"
            >
              <i
                class="circle primary icon"
                :style="{
                  'text-shadow':
                    '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000 !important'
                }"
              ></i>
              <i class="check icon mini black"></i>
            </i>
            <div
              v-show="item.network !== selectedNetwork"
              style="margin-left: 3rem; margin-top: 1rem; height: 1.25rem"
            ></div>
            <div style="margin-top: 1rem; text-transform: capitalize">{{ item.network }}</div>
            <div v-if="item.disabled" style="margin-top: 0.5rem; font-size: 0.8rem">
              coming soon
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="ui horizontal divider">Wallet</div>
    <div
      class="ui bottom attached segment"
      style="margin-top: 1rem; padding-left: 0; padding-right: 0; xbackground-color: red"
    >
      <div class="ui vertical segment" xstyle="background-color: orange">
        <!-- <div xclass="_muted" style="xtext-align: center; font-size: 1.2rem; margin-bottom: 1rem">
          Select wallet:
        </div> -->
        <div
          class="ui secondary menu"
          :class="wallets.noOfMenuItems"
          style="margin-top: 0; xbackground-color: yellow"
        >
          <div
            v-for="(item, index) in wallets.items"
            :key="index"
            class="item"
            :class="{ disabled: item.disabled }"
            style="padding: 0 1rem 0 0 !important"
          >
            <div
              class="_connectionButton"
              :class="{ _disabled: item.disabled }"
              style="
                background-position: center 1rem;
                background-repeat: no-repeat;
                background-size: auto 2.5rem;
                padding-left: 1rem;
                padding-right: 1rem;
                padding-top: 1rem;
                height: 6rem;
                font-weight: normal;
                font-size: 1.2rem;
                border-radius: 1rem;
                width: 100%;
              "
              :style="{
                'background-image': `url('${item.image}')`
              }"
              @click="selectWallet(item.name)"
            >
              <i
                v-show="item.name === selectedWallet"
                class="icons"
                style="margin-left: 3rem; margin-top: 1rem; height: 1.25rem"
              >
                <i
                  class="circle primary icon"
                  :style="{
                    'text-shadow':
                      '-1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000 !important'
                  }"
                ></i>
                <i class="check icon mini black"></i>
              </i>
              <div
                v-show="item.name !== selectedWallet"
                style="margin-left: 3rem; margin-top: 1rem; height: 1.25rem"
              ></div>
              <div style="margin-top: 1rem; text-transform: capitalize">{{ item.name }}</div>
              <div v-if="item.disabled" style="margin-top: 0.5rem; font-size: 0.8rem">
                not installed
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="ui vertical segment" style="margin-top: 5rem; xbackground-color: grey">
        <div
          class="ui button primary"
          :class="{
            disabled: busy,
            loading: busy
          }"
          style="width: 8rem"
          @click="connectWallet()"
        >
          Connect
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConnectorPanel',
  components: {},
  props: {
    busy: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      networks: { items: [], noOfMenuItems: '' },
      selectedNetwork: '',
      wallets: { items: [], noOfMenuItems: '' },
      selectedWallet: ''
    }
  },
  computed: {},
  watch: {},
  created() {
    this.$store.state.networks.forEach((n) => {
      this.networks.items.push({
        network: n.network,
        id: n.chainId,
        image: `/images/buttons/${n.network}.png`,
        deploymentName: n.deploymentName,
        disabled: false
      })
    })
    this.networks.items.push({
      network: 'others',
      id: '',
      image: '/images/buttons/others.png',
      deploymentName: `others-development`,
      disabled: true
    })
    this.networks.noOfMenuItems = 'three item'

    this.wallets.items.push({
      name: 'MetaMask',
      image: '/images/buttons/MetaMask.png',
      disabled: !this.metamaskInstalled
    })
    this.wallets.items.push({
      name: 'WalletConnect',
      image: '/images/buttons/WalletConnect.png',
      disabled: false
    })
    this.wallets.items.push({
      name: 'WalletLink',
      image: '/images/buttons/WalletLink.png',
      disabled: false
    })
    this.wallets.noOfMenuItems = 'three item'

    //
    // Select based on store (cookie) values
    //

    this.selectedNetwork = (
      this.networks.items.find(
        (w) => w.deploymentName === this.$store.state.options.network.deploymentName
      ) || this.networks.items[0]
    ).network

    this.selectedWallet = (
      this.wallets.items.find((w) => w.name === this.$store.state.options.wallet) ||
      this.wallets.items[0]
    ).name

    this.wallets.items[0].disabled = !this.metamaskInstalled
    if (!this.metamaskInstalled && this.selectedWallet === this.wallets.items[0].name) {
      this.selectedWallet = this.wallets.items[1].name
    }
  },
  mounted() {},
  beforeDestroy() {},
  watch: {
    metamaskInstalled(v) {
      this.wallets.items[0].disabled = !v
      if (!v && this.selectedWallet === this.wallets.items[0].name) {
        this.selectedWallet = this.wallets.items[1].name
      } else if (v) {
        this.selectedWallet = (
          this.wallets.items.find((w) => w.name === this.$store.state.options.wallet) ||
          this.wallets.items[0]
        ).name
      }
    }
  },
  methods: {
    selectNetwork(network) {
      this.selectedNetwork = network.network
    },
    selectWallet(name) {
      this.selectedWallet = name
    },
    connectWallet() {
      const network = this.networks.items.find((i) => i.network == this.selectedNetwork)
      this.$emit('connectWallet', {
        wallet: this.selectedWallet,
        network: network.network,
        deploymentName: network.deploymentName
      })
    }
  }
}
</script>

<style scoped>
._connectionButton:hover {
  background-color: #121212 !important;
}

._disabled {
  filter: grayscale(100%);
}
</style>
