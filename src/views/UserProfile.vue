<template>
  <div
    class="green ui raised card centered"
    style="width: 95%; height: 95%; max-height: 1600px; max-width: 1600px"
  >
    <div class="content">
      <i
        class="right floated big close link icon"
        :class="{ disabled: workInProgress }"
        @click="$emit('close')"
        style="text-align: right; margin: 0px"
      ></i>
      <h2 class="left floated ui header">User Profile</h2>
    </div>
    <div class="ui top attached pointing menu">
      <!-- DAPP-164
      <a
        class="item"
        :class="{ active: activeTabIs(1) }"
        @click="setActiveTab(1)"
      >
        Gas Station
      </a>
      -->
      <a
        class="item"
        :class="{ active: activeTabIs(2) }"
        @click="setActiveTab(2)"
      >
        Change Password
      </a>
      <a
        class="disabled item"
        :class="{ active: activeTabIs(3) }"
        @click="setActiveTab(3)"
      >
        Details
      </a>
      <a
        class="disabled item"
        :class="{ active: activeTabIs(4) }"
        @click="setActiveTab(4)"
      >
        Two-Factor Authentication (2FA)
      </a>
      <a
        class="disabled item"
        :class="{ active: activeTabIs(5) }"
        @click="setActiveTab(5)"
      >
        Notification
      </a>
    </div>
    <!--
    <div
      class="ui attached tab grey segment tabContent"
      :class="{ active: activeTabIs(1) }"
    >
      <p>
        Define your default Gas <b>Price</b> and <b>Limit</b> to set the total
        <b>Transaction Cost</b> (= Price * Limit).
        <br />
        A higher Price increases the chances of the transaction getting processed by the network faster.
      </p>

      <p>
        Your current default settings are:<br />
        <ul>
          <li>
            Gas Price
        <b>
          {{ format(defaultTxOptions.gasPriceInGwei) }} Gwei
        </b>
          </li>
          <li>
            Gas Limit
            <b>
              {{ format(defaultTxOptions.gas) }} Units
              </b>
            </li>
          <li>
            Total Transaction Cost
            <b>
              {{ maxDefaultTransactionCost }} USD
              </b>
          </li>
          </ul>
      </p>

      <div class="ui placeholder segment" style="max-width: 600px">
        <GasStation
          style="
            width: 350px;
            min-width: 350px;
            max-width: 350px;
            margin-left: auto;
            margin-right: auto;
            xbackground-color: red;
          "
          :initial-price="gasPriceInGwei"
          :initial-limit="gas"
          :show-fastest="true"
          @priceChanged="gasPriceInGwei = $event"
          @limitChanged="gas = $event"
        />

        <table style=" 
            width: 350px;
            min-width: 350px;
            max-width: 350px;
            margin-left: auto;
            margin-right: auto;
            xmargin-bottom: 1rem"
        >
          <tr>
            <td class="left aligned middle aligned">
              <h5
                class="ui header"
                data-tooltip="= Price * Limit"
                data-position="bottom center"
              >
                Max Transaction Cost
              </h5>
            </td>
            <td class="right aligned">
              <h5 class="ui header">
                {{ maxTransactionCost }}
                USD
              </h5>
            </td>
          </tr>
        </table>
      </div>

      <p>
        Gas price estimations (Gwei) and average waiting times from
        <a
          href="https://ethgasstation.info"
          target="ethGasStation"
          v-text="'ETH Gas Station'"
        />.
      </p>

      <div
        class="ui positive right labeled icon button"
        xclass="{
          disabled: workInProgress || !formIsValid,
          loading: workInProgress
        }"
        @keyup.enter.stop="saveGasSettingsAsDefault()"
        @keyup.space.stop="saveGasSettingsAsDefault()"
        @click="saveGasSettingsAsDefault()"
      >
        Save as Default
        <i class="checkmark icon"></i>
      </div>
    </div>
    -->
    <div
      class="ui attached tab grey segment tabContent"
      :class="{ active: activeTabIs(2) }"
    >
      <ChangePassword
        :id="'changePasswordPanel'"
        :user="$store.state.user"
        @changed="$emit('close')"
        style="max-width: 600px; margin-left: 0px"
      />
    </div>
    <div
      class="ui attached tab grey segment tabContent"
      :class="{ active: activeTabIs(3) }"
    >
      <UserProfileDetails v-if="false" :user="$store.state.user" />
    </div>
  </div>
</template>

<script>
import numeral from 'numeral'
import ChangePassword from '../components/ChangePassword.vue'
// import GasStation from '../components/GasStation.vue'
import UserProfileDetails from '../components/UserProfileDetails.vue'
// import ChangePassword from '../components/FileUploader.vue'

export default {
  name: 'UserProfile',
  components: {
    ChangePassword,
    // GasStation,
    UserProfileDetails
  },
  data() {
    return {
      activeTab: 2,
      gas: 0,
      gasPriceInGwei: 0
    }
  },
  computed: {
    defaultTxOptions() {
      return this.$store.state.user && this.$store.state.user.txOptions
        ? this.$store.state.user.txOptions
        : { gas: 0, gasPriceInGwei: 0 }
    },
    maxDefaultTransactionCost() {
      const n =
        this.defaultTxOptions.gas *
        this.defaultTxOptions.gasPriceInGwei *
        0.000000001 *
        this.$store.state.currentAccount.cryptos.WETH.priceUSD

      return numeral(n).format('0,0.00')
    },
    maxTransactionCost() {
      const n =
        this.gas *
        this.gasPriceInGwei *
        0.000000001 *
        this.$store.state.currentAccount.cryptos.WETH.priceUSD

      return numeral(n).format('0,0.00')
    }
  },
  created() {
    this.gas = this.defaultTxOptions.gas
    this.gasPriceInGwei = this.defaultTxOptions.gasPriceInGwei
  },
  mounted() {
    // $('.ui.dropdown').dropdown()
  },
  methods: {
    setActiveTab(id) {
      if (id > 5) return
      this.activeTab = id
    },
    activeTabIs(id) {
      return this.activeTab == id
    },
    saveGasSettingsAsDefault() {
      this.$store.dispatch('updateDefaultGasLimits', {
        gasPriceInGwei: this.gas,
        gasPriceInGwei: this.gasPriceInGwei
      })
      this.$emit('close')
    },
    format(n) {
      return numeral(n).format('0,0')
    }
  }
}
</script>

<style scoped>
.tabContent {
  min-height: calc(100% - 120px);
  margin-bottom: 1rem !important;
}
</style>
