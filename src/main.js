import BigNumber from 'bignumber.js'
import detectEthereumProvider from '@metamask/detect-provider'

import Vue from 'vue'
import App from './App.vue'
import router from './router.js'
import store from './vuex/store'
import axios from 'axios'
import VueGtag from 'vue-gtag'
import { GA_EVENTS } from './events.js'
import { utilsMixin } from './mixins/utilsMixin.js'

if (process.env.NODE_ENV === 'production') {
  const silentFunction = function() {
    // Disabled in production
  }
  // eslint-disable-next-line
  console.log = silentFunction
  console.time = silentFunction
  // eslint-disable-next-line
  console.timeLog = silentFunction
  console.timeEnd = silentFunction
} else {
  /* Some info about the Ðapp */
  // eslint-disable-next-line
  console.log('Environment:', process.env.NODE_ENV)
  // eslint-disable-next-line
  console.log('Dapp version:', process.env.VUE_APP_VERSION)
  // eslint-disable-next-line
  console.log('Helium version:', process.env.VUE_APP_HELIUM_VERSION)
  // eslint-disable-next-line
  console.log('JQuery version:', $.fn.jquery)
  // eslint-disable-next-line
  console.log('Fomantic UI version 2.8.6')
  // eslint-disable-next-line
  console.log('Google Analytics:', Boolean(process.env.VUE_APP_GA_ID) ? 'enabled' : 'disabled')
}

// Set the global formatting options
const fmt = {
  prefix: '',
  decimalSeparator: '.',
  groupSeparator: ',',
  groupSize: 3,
  secondaryGroupSize: 0,
  fractionGroupSeparator: ' ',
  fractionGroupSize: 0,
  suffix: ''
}
BigNumber.config({ FORMAT: fmt })

Vue.config.productionTip = false

// Make certain properties/methods available to all Vue components
Vue.mixin({
  computed: {
    metamaskInstalled() {
      return this.$store.state.metamaskInstalled
    },
    workInProgress() {
      return this.$store.state.workInProgress
    },
    loggedIn() {
      return this.$store.getters.loggedIn
    },
    connector() {
      return this.$store.getters.connector
    },
    currentNetwork() {
      return this.$store.state.currentNetwork
    },
    currentAddress() {
      return this.$store.state.currentAccount.address
    },
    wallet() {
      return this.$store.state.options.wallet || ''
    },
    isConnected() {
      return !!this.currentAddress
    },
    isNetworkValid() {
      return this.$store.state.networkValid
    },
    // isConnectorValid() {
    //   return this.$store.state.connectorValid
    // },
    isProduction() {
      return this.$store.state.environment === 'prod'
    },
    isProductionEnvironment() {
      return process.env.NODE_ENV === 'production'
    },
    isFundManager() {
      // Use a computed property to avoid errors during a logout when this.$store.state.user becomes undefined
      return this.$store.state.user && this.$store.state.user.isFundManager
    },
    isInvestor() {
      // Use a computed property to avoid errors during a logout when this.$store.state.user becomes undefined
      return this.$store.state.user && this.$store.state.user.isInvestor
    },
    isAdmin() {
      // Use a computed property to avoid errors during a logout when this.$store.state.user becomes undefined
      return this.$store.state.user && this.$store.state.user.isAdmin
    },
    isEthereum() {
      return this.currentNetwork && this.currentNetwork.network === 'ethereum'
    },
    isAvalanche() {
      return this.currentNetwork && this.currentNetwork.network === 'avalanche'
    }
  },
  methods: {
    log() {
      utilsMixin.log(...arguments)
    },
    dispatch() {
      // TODO
      // this.$store.dispatch('updateAssetBalance', value.symbol)
    },
    triggerGAEvent(event) {
      const gaEnabled = Boolean(process.env.VUE_APP_GA_ID)

      if (!GA_EVENTS.hasOwnProperty(event)) {
        console.warn(`GA (${gaEnabled}): unknown event ${event}`)
        return
      }

      const data = GA_EVENTS[event]
      if (!data) {
        console.warn(`GA (${gaEnabled}): event ${event} not setup`)
        return
      }

      this.log(`GA (${gaEnabled}) Event - ${data.category}.${event}: ${data.label}`)

      if (!this.gaEnabled) {
        return
      }

      this.$gtag.event(event, {
        event_category: data.category,
        event_label: data.label
      })
    }
  }
})

// Register a global custom directive called `v-focus`
Vue.directive('focus', {
  // When the bound element is inserted into the DOM...
  inserted: function(el) {
    // Focus the element
    el.focus()
  }
})

if (Boolean(process.env.VUE_APP_GA_ID)) {
  Vue.use(VueGtag, {
    config: { id: process.env.VUE_APP_GA_ID }
  })
}

new Vue({
  router,
  store,
  beforeCreate() {
    /*
    As recommended by MetaMask https://docs.metamask.io/guide/ethereum-provider.html#using-the-provider,
    we use @metamask/detect-provider that detects most providers injected at window.ethereum
    */
    detectEthereumProvider().then((provider) => {
      if (provider && provider.isMetaMask === true) {
        // From now on, this should always be true:
        // provider === window.ethereum
        this.$store.commit('METAMASK_INSTALLED', true)
      } else {
        console.error('Please install MetaMask!')
        this.$store.commit('METAMASK_INSTALLED', false)
      }
    })
  },
  created() {
    let logout = false

    // Grab user data from local storage.
    // Check to see if there is indeed a user, and then:
    //  1. parse user data into JSON
    //  2. restore user data with Vuex
    const userString = localStorage.getItem('user')
    if (userString) {
      const userData = JSON.parse(userString)
      this.$store.commit('SET_USER_DATA', userData)
    }

    const validNetworks = JSON.parse(process.env.VUE_APP_VALID_BLOCKCHAINS)
    this.$store.dispatch('setNetworks', validNetworks)

    if (!validNetworks || validNetworks.length == 0) {
      logout = true
    } else {
      // Grab user options from local storage.
      // Check to see if there are indeed the options, and then:
      //  1. parse options into JSON
      //  2. restore options with Vuex
      const optionsString = localStorage.getItem('options')
      if (optionsString) {
        const options = JSON.parse(optionsString)

        if (!options.network || !validNetworks.some((n) => n.chainId === options.network.chainId)) {
          options.network = validNetworks[0]
        }

        this.$store.commit('UPDATE_OPTIONS_VALUES', options)
        this.$store.commit('UPDATE_OPTIONS_COOKIE')
      }
    }

    // Intercept the axio's request and return it as-is if correct...
    // But if we get a 401 (ie the user is unauthorized), and if so
    // we use redirect to the homepage and use Vuex to force a logout
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          if (error.response.status === 401 && !this.$store.state.connectingFm) {
            // if we catch a 401 error (other than during FM login) and there is users' data, force a log out
            const loggedIn = localStorage.getItem('user')
            if (loggedIn) {
              this.$store.dispatch('logout').finally(() => {
                if (this.$router.currentRoute.name != 'home') {
                  this.$router.push({ name: 'home' })
                }
              })
            }
          }
        }
        return Promise.reject(error)
      }
    )

    if (logout) {
      this.$store.dispatch('logout').finally(() => {
        if (this.$router.currentRoute.name != 'home') {
          this.$router.push({ name: 'home' })
        }
      })
    }
  },
  render: (h) => h(App)
}).$mount('#app')
