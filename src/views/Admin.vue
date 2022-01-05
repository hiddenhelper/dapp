<template>
  <div class="ui basic segment" style="padding: 0px">
    <div class="ui two column middle aligned center aligned grid" style="height: 100%">
      <div class="column">
        <table style="white-space: nowrap; margin-left: auto; margin-right: auto">
          <tr>
            <td style="padding: 1rem">
              <img style="height: 7rem" src="/images/logo.svg" />
            </td>
            <td
              style="
                padding: 1rem;
                color: #9a9a9a;
                text-align: left;
                font-size: 4rem;
                font-weight: bold;
                line-height: 1;
              "
            >
              WELCOME TO THE
              <BR />
              <span style="color: #525252">
                DOMANI ÐAPP.
                <div
                  class="ui tiny text"
                  style="
                    display: inline;
                    color: #db2828;
                    font-size: 2rem;
                    vertical-align: top;
                    margin-left: -1rem;
                  "
                >
                  {{ dappVersion }}
                </div>
              </span>
            </td>
          </tr>

          <tr>
            <td colspan="2">
              <br />
              <div class="ui two column center aligned internally celled grid">
                <div class="row">
                  <div
                    class="column"
                    style="padding: 2rem 0"
                    @mouseenter="mouse(true, 1)"
                    @mouseleave="mouse(false, 1)"
                  >
                    <h1 class="ui header _darkGrey" style="padding-bottom: 2rem">Fund Manager</h1>
                    <router-link class="ui grey header" to="/login">
                      <img
                        class="ui space loading image"
                        src="/images/buttons/logIn.svg"
                        style="
                          width: 250px;
                          margin-left: auto;
                          margin-right: auto;
                          xbackground-color: red;
                        "
                      />
                    </router-link>

                    <div
                      style="padding: 0px; margin: 0px; xbackground-color: red"
                      :style="{ height: '5rem' }"
                      _note="Push down"
                    ></div>

                    <span class="ui grey text">
                      don't have an account yet?
                      <router-link
                        class="_signUpLink"
                        xdisabled="inProgress"
                        xevent="inProgress ? '' : 'click'"
                        style="font-size: 1.3rem"
                        xstyle="{ cursor: inProgress ? 'default' : '' }"
                        to="/register"
                      >
                        <span class="ui text" xclass="{ disabled: inProgress }"> SIGN UP </span>
                      </router-link>
                    </span>
                  </div>
                  <div
                    class="column"
                    style="padding: 2rem 0"
                    @mouseenter="mouse(true, 2)"
                    @mouseleave="mouse(false, 2)"
                  >
                    <h1 class="ui header _darkGrey" style="padding-bottom: 2rem">Investor</h1>
                    <a
                      class="ui grey header _actionButton"
                      :class="{
                        disabled: !metamaskInstalled,
                        grey: action != 2,
                        _darkGrey: action == 2
                      }"
                      @click="metamaskInstalled && connect('MetaMask')"
                    >
                      <img
                        src="/images/buttons/metamaskConnect.svg"
                        style="
                          width: 250px;
                          margin-left: auto;
                          margin-right: auto;
                          xbackground-color: red;
                        "
                      />
                      <div
                        v-if="!metamaskInstalled"
                        style="
                          width: 250px;
                          margin-left: auto;
                          margin-right: auto;
                          xbackground-color: yellow;
                          padding-left: 30px;
                          text-align: left;
                        "
                      >
                        <span class="ui red small disabled text"> not installed </span>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
            </td>
          </tr>

          <tr>
            <td colspan="2">
              <br />
              <span class="ui grey small text">
                By using the DOMANI ÐAPP you acknowledge having read the
                <a
                  class="_darkGrey"
                  href="docs/DEXTF_Dapp_Beta_Disclaimer_v0.1.pdf"
                  target="disclaimer"
                  v-text="'Disclaimer'"
                />
                and agree with the
                <a
                  class="_darkGrey"
                  href="docs/DEXTF_TC_v0.1.pdf"
                  target="tc"
                  v-text="'Terms and Conditions'"
                />
              </span>
            </td>
          </tr>
        </table>
      </div>
    </div>

    <div id="expired" class="ui tiny modal">
      <div class="header">Session Expiration</div>
      <div class="content">
        <div
          class="ui icon message"
          style="background-color: transparent !important; box-shadow: none"
        >
          <i class="triangle exclamation icon"></i>
          <div class="content">
            <div class="header">Your session has expired</div>
            <br />
            <p>Please re-connect again</p>
          </div>
        </div>
      </div>
      <div class="actions">
        <div class="ui positive button">OK</div>
      </div>
    </div>

    <div id="login" class="ui tiny modal">
      <div class="header">
        {{ actionName }}
      </div>
      <div class="content">
        <div
          class="ui icon message"
          style="background-color: transparent !important; box-shadow: none"
        >
          <i class="notched circle loading icon"></i>
          <div class="content">
            <div class="header">Log In in progress...</div>
            <br />
            <p xstyle="{'font-weight': 'bold'}">1. Open MetaMask and accept the connection</p>
            <p>2. Sign login message</p>
          </div>
        </div>
      </div>
    </div>

    <div id="connect" class="ui tiny modal">
      <div class="header">
        {{ actionName }}
      </div>
      <div class="content">
        <div
          class="ui icon message"
          style="background-color: transparent !important; box-shadow: none"
        >
          <i class="notched circle loading icon"></i>
          <div class="content">
            <div class="header">Connection in progress...</div>
            <br />
            <p>
              {{ step }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <div id="error" class="ui tiny modal">
      <div class="header">Error</div>
      <div class="content">
        <div
          class="ui icon message"
          style="background-color: transparent !important; box-shadow: none"
        >
          <i class="circle exclamation icon"></i>
          <div class="content">
            <div class="header">An error has occured</div>
            <br />
            <p>Bla bla...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import detectEthereumProvider from '@metamask/detect-provider'
import { getSetConfig } from '../modules/parseOutputs.js'
import { SethConnector } from '@seth/sethConnector'

export default {
  name: 'Home',
  data() {
    return {
      action: 0, // 0-nothing, 1-login, 2-connect
      actionName: '?',
      metamaskInstalled: false,
      step: ''
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
    }
  },
  async created() {
    /*
    As recommended by MetaMask https://docs.metamask.io/guide/ethereum-provider.html,
    we use @metamask/detect-provider that detects most providers injected at window.ethereum
    */
    const provider = await detectEthereumProvider()

    if (provider && provider.isMetaMask === true) {
      // From now on, this should always be true:
      // provider === window.ethereum
      this.metamaskInstalled = true
    } else {
      console.error('Please install MetaMask!')
      this.metamaskInstalled = false
    }
  },
  mounted() {
    if (this.sessionHasExpired) {
      $('#expired')
        .modal({
          onHidden: this.resetSessionExpiredFlag
        })
        .modal('show')
    }
  },
  methods: {
    resetSessionExpiredFlag() {
      this.$route.params.expired = false
    },
    mouse(enter, action) {
      if (this.metamaskInstalled) {
        this.action = this.enter ? action : 0
      } else {
        this.action = 0
      }
    },
    /**
     * Login to the system
     */
    login(type) {
      console.log(`${this.$options.name}.login(${type})`)

      if (type != 'MetaMask') {
        return
      }

      if (!this.metamaskInstalled) {
        return
      }

      this.actionName = 'Log In with ' + type

      $('#login')
        .modal('setting', 'closable', false)
        .modal('setting', 'transition', 'vertical flip')
        .modal('show')
    },
    /**
     * Connect to the system
     */
    async connect(type) {
      console.log(`${this.$options.name}.connect(${type})`)

      if (type != 'MetaMask') {
        return
      }

      if (!this.metamaskInstalled) {
        return
      }

      this.actionName = 'Connect with ' + type
      this.step = 'Open MetaMask and accept the connection'

      $('#connect')
        .modal('setting', 'closable', false)
        .modal('setting', 'transition', 'vertical flip')
        .modal('show')

      try {
        /*
         * Connect to MetaMask.
         *
         * If necessary, the request causes a MetaMask popup to appear.
         * This will trigger the accountsChanged event.
         */
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })
        const account = accounts[0]
        this.step = 'Establishing connection to the DOMANI system'
        this.$store.dispatch('setCurrentAccount', accounts[0])

        /*
         * Set SethConnector.
         */
        const web3Provider = window.ethereum
        const defaultSetConnectorConfig = getSetConfig(defaultDeployment)
        const sc = new SethConnector(web3Provider, defaultSetConnectorConfig)
        await this.$store.dispatch('setConnector', sc)

        // TO TEST:
        // setTimeout(() => {
        //   $('#connect')
        //     .modal('setting', 'transition', 'fly right')
        //     .modal('hide')
        //   this.$router.push({ name: 'command-centre' })
        // }, 2000)

        // $('#connect').modal('setting', 'transition', 'fly right').modal('hide')

        // to make it work I need to change the routing rules and allow the transition from / to command-centre
        // this.$router.push({ name: 'command-centre' })

        const credentials = {
          userId: account,
          type: 'address'
        }

        this.$store.dispatch('login', credentials).then(() => {
          $('#connect')
            // .modal('setting', 'transition', 'fly right')
            .modal('hide')
          this.$router.push({
            name: 'command-centre',
            params: { userId: credentials.userId, type: credentials.type }
          })
        })
      } catch (error) {
        console.log(error)
        if (error.code == 4001) {
          this.step = error.message
        } else {
          this.step = 'Error during MetaMask connection'
        }
        this.$store.dispatch('setConnector', null)
        this.$store.dispatch('setGalliumConnector', null)
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
._logInLink,
._logInLink:hover {
  color: #9a9a9a;
}

.grey {
  color: #9a9a9a !important;
}

._actionButton {
  cursor: pointer;
}
</style>
