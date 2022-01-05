<template>
  <div
    v-if="false"
    class="ui fluid card"
    style="background-color: black !important"
  >
    <div class="content">
      <h3 class="ui header _muted" style="margin: 0">Liquidity mining</h3>
    </div>

    <div class="content" style="padding-top: 0">
      <div
        class="ui grid center aligned"
        xclass="ui three column grid center aligned"
      >
        <div class="row">
          <div class="six wide column">
            <div
              class="ui animated fade button huge"
              style="
                border-radius: 12px;
                background-position: 2.4rem center;
                background-repeat: no-repeat;
                background-size: 40px 40px;
                background-color: #1e1e1e;
                background-image: url('images/companies/sushi.png');
              "
              @click="
                goTo(
                  'https://app.sushi.com/add/ETH/0x5F64Ab1544D28732F0A24F4713c2C8ec0dA089f0',
                  'sushi-dextf-eth'
                )
              "
            >
              <span
                class="visible content"
                style="margin: 0; color: inherit !important"
              >
                <span> DEXTF-ETH pool2 </span>
              </span>
              <span
                class="hidden content"
                style="margin-left: 0.4rem; color: inherit !important"
              >
                Add Liquidity
              </span>
            </div>
          </div>
          <div class="one wide column"></div>
          <div class="six wide column">
            <div
              class="ui animated fade button huge _gradient"
              style="
                border-radius: 12px;
                background-position: 0.8rem center;
                background-repeat: no-repeat;
                background-size: 40px 40px;
                background-color: #1e1e1e;
                background-image: url('images/companies/uniswap.png');
              "
              @click="
                goTo(
                  'https://app.uniswap.org/#/add/v2/0x5f64ab1544d28732f0a24f4713c2c8ec0da089f0/ETH',
                  'uni-dextf-eth'
                )
              "
            >
              <span
                class="visible content"
                style="margin: 0; color: inherit !important"
              >
                <span
                  v-text="`${format(dextfEthPoolApy)}% DEXTF-ETH` /* pool2*/"
                >
                </span>
              </span>
              <span
                class="hidden content"
                style="margin-left: 0.4rem; color: inherit !important"
              >
                Add Liquidity
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="ui middle aligned equal width centered grid">
    <div v-if="false" class="column center aligned">
      <div class="ui large label">?% Investor APY</div>
    </div>
    <div v-if="false" class="column center aligned">
      <div class="ui large label">?% XTF-DEXTF</div>
    </div>
    <div v-if="false" class="column center aligned">
      <div class="ui large label">?% XTF-Others</div>
    </div>

    <div class="column">
      <div
        class="ui animated fade button huge"
        style="
          border-radius: 12px;
          background-position: 2.4rem center;
          background-repeat: no-repeat;
          background-size: 40px 40px;
          background-color: #1e1e1e;
          background-image: url('images/companies/sushi.png');
        "
        @click="
          goTo(
            'https://app.sushi.com/add/ETH/0x5F64Ab1544D28732F0A24F4713c2C8ec0dA089f0',
            'sushi-dextf-eth'
          )
        "
      >
        <span
          class="visible content"
          style="margin: 0; color: inherit !important"
        >
          <span> DEXTF-ETH pool2 </span>
        </span>
        <span
          class="hidden content"
          style="margin-left: 0.4rem; color: inherit !important"
        >
          Add Liquidity
        </span>
      </div>
    </div>

    <div class="column">
      <div
        class="ui animated fade button huge _gradient"
        style="
          border-radius: 12px;
          background-position: 2.4rem center;
          background-repeat: no-repeat;
          background-size: 40px 40px;
          background-color: #1e1e1e;
          background-image: url('images/companies/uniswap.png');
        "
        @click="
          goTo(
            'https://app.uniswap.org/#/add/v2/0x5f64ab1544d28732f0a24f4713c2c8ec0da089f0/ETH',
            'uni-dextf-eth'
          )
        "
      >
        <span
          class="visible content"
          style="margin: 0; color: inherit !important"
        >
          <span v-text="`${format(dextfEthPoolApy)}% DEXTF-ETH` /* pool2*/">
          </span>
        </span>
        <span
          class="hidden content"
          style="margin-left: 0.4rem; color: inherit !important"
        >
          Add Liquidity
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import numeral from 'numeral'

export default {
  name: 'StatsPanel',
  components: {},
  props: {},
  data() {
    return {
      dextfEthPoolApy: 0
    }
  },
  computed: {},
  created() {
    this.loadPoolsData()
  },
  mounted() {},
  methods: {
    format(n, fmt = '0,0') {
      return numeral(n).format(fmt)
    },
    goTo(address, target = '_blank') {
      if (address) {
        window.open(address, target)
        return true
      }
      return false
    },
    loadPoolsData() {
      axios
        .get(this.$store.state.APIs.pool2Apy)
        .then(async ({ data }) => {
          this.dextfEthPoolApy = data
        })
        .catch(async (err) => {
          console.error(err)
        })
        .finally(() => {})
    }
  }
}
</script>

<style scoped>
.column > .label {
  width: 100%;
}

.column > .button {
  width: 100%;
}
</style>
