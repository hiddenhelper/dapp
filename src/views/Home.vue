<template>
  <div>
    <HomeNav id="homeNav" :width-in-px="'1395px'" @connect="openConnectorPanelModal($event)" />

    <div
      style="padding: 0px; margin: 0px"
      :style="{ height: pusherHeight }"
      _note="Push down - same as nav's height"
    ></div>

    <div class="ui container" xstyle="background-color: red !important">
      <HomePanel
        :style="{
          margin: windowSize.height > 1000 ? '5rem 0 0 0' : '2rem 0 0 0'
        }"
        :show-read-more="true"
        :inverted="false"
        @browse="openConnectorPanelModal($event)"
      />
    </div>

    <div
      :id="sessionExpiredModalId"
      class="ui tiny modal"
      style="background-color: #1e1e1e !important"
    >
      <div class="header" style="color: white; background-color: transparent !important">
        Session Expiration
      </div>
      <div class="content" style="background-color: transparent !important">
        <div class="ui icon message" style="box-shadow: none">
          <i class="triangle exclamation icon"></i>
          <div class="content">
            <div class="header">Your session has expired</div>
            <br />
            <p>Please re-connect again</p>
          </div>
        </div>
      </div>
      <div class="actions" style="background-color: transparent !important">
        <div class="ui cancel button primary">OK</div>
      </div>
    </div>

    <div
      :id="homeConnectModalId"
      class="ui tiny modal"
      style="background-color: transparent !important; width: 614px; height: 850px"
    >
      <div _note="semantic modal's less shrinks the border of the first element"></div>

      <div class="ui top attached segment">
        <SignUpPanel
          v-if="showSignUp"
          style="height: 630px"
          :busy="busy"
          @signUp="signUp($event)"
          @switchToLogIn="switchTo('LogIn')"
        />
        <ConnectorPanel
          v-show="!showSignUp"
          style="height: 630px"
          :busy="busy"
          xmetamask-installed="metamaskInstalled"
          @connectWallet="connectWallet($event)"
          @switchToSignUp="switchTo('SignUp')"
        />
      </div>

      <div class="ui bottom attached segment" style="xbackground-color: green; padding-top: 10px">
        <div class="ui divider"></div>
        <h2 class="ui header" style="margin-top: 0.5rem">
          <div class="sub header" style="text-align: center; line-height: 1.5">
            By {{ showSignUp ? 'signing up for' : 'using' }} the DOMANI ÐAPP you acknowledge having
            read the
            <a
              class="item"
              :class="{ disabled: true }"
              href="docs/DEXTF_Dapp_Beta_Disclaimer_v0.1.pdf"
              target="disclaimer"
              v-text="'Disclaimer'"
            />
            <br />
            and agree with the
            <a href="docs/DEXTF_TC_v0.1.pdf" target="tc" v-text="'Terms and Conditions'" />
          </div>
        </h2>
      </div>

      <div _note="semantic modal's less shrinks the border of the last element"></div>
    </div>
  </div>
</template>

<script>
import Web3Modal from 'web3modal'
import WalletConnectProvider from '@walletconnect/web3-provider'
import { WalletLink } from 'walletlink'
import { ethers, providers } from 'ethers'
import { capitalize } from '../modules/format.js'
import { sizeHandlerMixin } from '../mixins/windowMixins.js'
import HomeNav from '../components/HomeNav.vue'
import HomePanel from '../components/HomePanel.vue'
import ConnectorPanel from '../components/ConnectorPanel.vue'
import SignUpPanel from '../components/SignUpPanel.vue'

export default {
  name: 'Home',
  components: {
    HomeNav,
    HomePanel,
    ConnectorPanel,
    SignUpPanel
  },
  mixins: [sizeHandlerMixin],
  data() {
    return {
      type: '',
      // metamaskInstalled: false,
      address: '-',
      pusherHeight: '60px',
      connecting: false,
      showSignUp: false
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
      return ''
    },
    sessionHasExpired() {
      const expired = this.$route.params.expired || false
      return expired
    },
    busy() {
      // We do not use the global workingInProgress because setting it interferes with the Command Centre load() method
      return this.connecting // || this.workingInProgress
    },
    sessionExpiredModalId() {
      return 'sessionExpiredModalId' + this._uid
    },
    homeConnectModalId() {
      return 'homeConnectModalId' + this._uid
    }
  },
  async created() {
    /*
    As recommended by MetaMask https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider,
    we use @metamask/detect-provider that detects most providers injected at window.ethereum
    */
    // const provider = await detectEthereumProvider()
    // if (provider && provider.isMetaMask === true) {
    //   // From now on, this should always be true:
    //   // provider === window.ethereum
    //   this.metamaskInstalled = true
    // } else {
    //   console.error('Please install MetaMask!')
    //   this.metamaskInstalled = false
    // }
    // console.log('it is', this.metamaskInstalled)
  },
  mounted() {
    if (!this.$store.getters.cookieConsent) {
      let toastAlreadyVisible = $('body').has('.toast').length == 1

      if (!toastAlreadyVisible) {
        const store = this.$store
        $('body').toast({
          title: 'We use cookies',
          message:
            "We use cookies to improve user experience. That's it. We do not share any user data with anybody.",
          showIcon: 'info circle',
          displayTime: 0,
          id: 'gino',
          class: 'black',
          classActions: 'bottom attached',
          position: 'bottom left',
          actions: [
            {
              text: 'OK',
              class: 'primary',
              click: function () {
                store.dispatch('setCookieConsent')
              }
            }
          ]
        })
      }
    }

    if (this.sessionHasExpired) {
      $('#' + this.sessionExpiredModalId)
        .modal({
          onHidden: this.resetSessionExpiredFlag
        })
        .modal('show')
      return
    }

    if (this.$route.params.action == 'loginV1') {
      this.openConnectorPanelModal('V1')
    } else if (this.$route.params.action == 'loginV2' || this.$route.params.action == 'login') {
      this.openConnectorPanelModal('V2')
    }
  },
  beforeDestroy() {
    // Hide te modal here and not in the connect methods, so that the modal is visible until the last moment
    $('#' + this.homeConnectModalId)
      // .modal('setting', 'transition', 'fly right')
      .modal('hide')
  },
  methods: {
    resetSessionExpiredFlag() {
      this.$route.params.expired = false
    },
    /**
     * Open the modal with the connector panel
     */
    openConnectorPanelModal(version) {
      if (version == 'V1') {
        // Legacy V1
        this.goTo('https://v1.dapp.dextf.com?action=loginV1', '_self')
        return true
      }

      $('#' + this.homeConnectModalId)
        // .modal('setting', 'closable', false)
        .modal('setting', 'transition', 'zoom')
        .modal('show')
    },
    goTo(address, target) {
      if (address) {
        window.open(address, target)
        return true
      }
      return false
    },
    /**
     * Connect to the system with Wallet
     */
    async connectWallet(params) {
      this.log(`${this.$options.name}.connectWallet`, params)

      if (this.busy) {
        return
      }

      // wallet: MetaMask, network: ethereum
      // wallet: WalletConnect network: ethereum
      // wallet: WalletLink network: ethereum
      const network = this.$store.state.networks.find(
        (net) => net.deploymentName === params.deploymentName
      )
      if (!network) {
        console.error(`No known network for ${params.deploymentName}`)
        return
      }
      const networkId = network ? network.chainId : -1
      const networkName = network ? network.name : 'unknown'

      window.web3Modal = new Web3Modal({
        providerOptions: {
          walletconnect: {
            package: WalletConnectProvider, // required
            options: {
              infuraId: '9dc997986f8840daa0e6ccb1d8d0d757'
            }
          },
          'custom-walletlink': {
            display: {
              name: 'WalletLink',
              description: 'Scan with WalletLink to connect'
            },
            options: {
              appName: 'DEXTF V2',
              networkUrl: `https://${networkName}.infura.io/v3/9dc997986f8840daa0e6ccb1d8d0d757`,
              chainId: networkId
            },
            package: WalletLink,
            connector: async (_, options) => {
              const { appName, networkUrl, chainId } = options
              const walletLink = new WalletLink({
                appName
              })
              const provider = walletLink.makeWeb3Provider(networkUrl, chainId)
              await provider.enable()
              return provider
            }
          }
        },
        cacheProvider: false,
        network: networkName,
        chainId: networkId
      })

      this.connecting = true
      params.login = true

      try {
        const providerName =
          params.wallet === 'MetaMask'
            ? 'injected'
            : params.wallet === 'WalletConnect'
            ? 'walletconnect'
            : 'custom-walletlink'
        await window.web3Modal.clearCachedProvider()
        window.ethereum = await window.web3Modal.connectTo(providerName)

        window.ethereum.on('accountsChanged', async (accounts) => {
          await this.$store.dispatch('connect', { ...params, login: false })
        })
        window.ethereum.on('chainChanged', async () => {
          await this.$store.dispatch('connect', { ...params, login: false })
        })
        const credential = await this.$store.dispatch('connect', { ...params, login: true })
        this.$router
          .push({
            name: 'command-centre',
            params
          })
          .then(() => {
            this.connecting = false
            this.triggerGAEvent('home_page_login_wallet_success')
          })
        this.connecting = false
      } catch (error) {
        console.log('Error', error)
        let err = `Error during ${params.wallet} connection!`
        this.serverErrors = [err]
        // Dismissable block fades-in when there are errors
        $('#' + this.connectorPanelErrorsMessageId).transition('fade')
        this.connecting = false
        // Modal back to closable
        $('#' + this.homeConnectModalId).modal('setting', 'closable', true)
      }
    },
    switchTo(to) {
      if (to == 'SignUp') {
        this.showSignUp = true
      } else if (to == 'LogIn') {
        this.showSignUp = false
      }
    },
    signUp(fields) {
      this.log(`${this.$options.name}.signUp`)

      if (
        !fields ||
        !fields.firstName ||
        !fields.familyName ||
        !fields.email ||
        !fields.country ||
        this.busy
      ) {
        return
      }

      // Modal becomes non-closable
      $('#' + this.homeConnectModalId).modal('setting', 'closable', false)

      this.connecting = true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
/*--------------
  Semantic UI overrides
  ---------------*/
.message {
  border-style: none !important;
  border-radius: 0px !important;
  box-shadow: none !important;
}
</style>
