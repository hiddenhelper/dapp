<template>
  <div>
    <div ref="fundFilters" class="ui fluid card">
      <div
        class="content"
        style="background-color: #2a2a2a"
        :style="{ height: topContentHeightInPx }"
      >
        <i
          class="close icon right floated _pointer"
          style="margin-top: 0.5rem"
          @click="emitClose()"
        ></i>
        <h3 class="ui header" xstyle="margin-bottom: 2rem">Fund Filters</h3>
      </div>

      <div class="content">
        <form class="ui form">
          <fieldset style="margin: 0; padding: 0; border-style: none">
            <div class="ui segment left aligned">
              <table style="width: 1000px">
                <tbody>
                  <tr style="height: 50px !important">
                    <th style="white-space: nowrap; padding-right: 1rem">
                      Attributes:
                    </th>
                    <td class="field" style="width: 20%">
                      <div class="ui checkbox">
                        <input
                          type="checkbox"
                          v-model="filters.invested"
                          name="invested"
                        />
                        <label>Your investments</label>
                      </div>
                    </td>
                    <td class="field" style="width: 20%">
                      <div class="ui checkbox">
                        <input type="checkbox" v-model="filters.favourite" />
                        <label>Your favourites</label>
                      </div>
                    </td>
                    <td class="field" style="width: 20%">
                      <div class="ui checkbox">
                        <input
                          type="checkbox"
                          v-model="filters.kyber"
                          name="kyber"
                        />
                        <label>Assets on Kyber</label>
                      </div>
                    </td>
                    <td class="field" style="width: 20%">
                      <div class="ui checkbox">
                        <input
                          type="checkbox"
                          v-model="filters.inactive"
                          name="inactive"
                        />
                        <label>Inactive</label>
                      </div>
                    </td>
                    <td class="field" style="width: 20%">
                      <div class="ui checkbox">
                        <input
                          type="checkbox"
                          v-model="filters.uniswap"
                          name="uniswap"
                        />
                        <label>Traded on Uniswap</label>
                      </div>
                    </td>
                    <td class="field" style="width: 20%"></td>
                  </tr>
                  <tr style="height: 50px !important">
                    <th style="white-space: nowrap; padding-right: 1rem">
                      Risk:
                    </th>
                    <td class="field" style="width: 20%">
                      <div class="ui checkbox">
                        <input type="checkbox" v-model="filters.risks[0]" />
                        <label>CONSERVATIVE</label>
                      </div>
                    </td>
                    <td class="field" style="width: 20%">
                      <div class="ui checkbox">
                        <input type="checkbox" v-model="filters.risks[1]" />
                        <label>MODERATE</label>
                      </div>
                    </td>
                    <td class="field" style="width: 20%">
                      <div class="ui checkbox">
                        <input type="checkbox" v-model="filters.risks[2]" />
                        <label>BALANCED</label>
                      </div>
                    </td>
                    <td class="field" style="width: 20%">
                      <div class="ui checkbox">
                        <input type="checkbox" v-model="filters.risks[3]" />
                        <label>GROWTH</label>
                      </div>
                    </td>
                    <td class="field" style="width: 20%">
                      <div class="ui checkbox">
                        <input type="checkbox" v-model="filters.risks[4]" />
                        <label>AGGRESSIVE</label>
                      </div>
                    </td>
                    <td>
                      <div
                        class="ui mini basic button"
                        @click="clearFilter(false, false, true)"
                        style="margin-left: 0.5rem; width: 70px"
                      >
                        Any
                      </div>
                    </td>
                  </tr>
                  <tr style="height: 50px !important">
                    <th style="white-space: nowrap; padding-right: 1rem">
                      Includes:
                    </th>
                    <td class="field" style="width: 20%">
                      <div class="ui checkbox">
                        <input type="checkbox" v-model="filters.myTokens" />
                        <label>Your tokens</label>
                      </div>
                    </td>
                    <td class="field" colspan="4">
                      <div
                        class="ui input"
                        :class="{ disabled: filters.myTokens }"
                      >
                        <input
                          type="text"
                          v-model.trim="filters.assets"
                          placeholder="Comma separated list of token symbols (e.g. DEXTF,WETH,UNI)..."
                          style="margin-right: 1rem"
                          @input="processInputedAssets()"
                        />
                      </div>
                    </td>
                    <td>
                      <div
                        class="ui mini basic button"
                        @click="clearFilter(false, true, false)"
                        style="margin-left: 0.5rem; width: 70px"
                      >
                        Any
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </fieldset>
        </form>
      </div>

      <div
        class="content"
        style="border-top: 1px solid #2a2a2a; padding-top: 10px !important"
        :style="{ height: bottomContentHeightInPx }"
      >
        <table style="border-spacing: 0; xbackground-color: red">
          <tr>
            <td style="width: 100%">
              <!-- <MessageBar v-show="messages.length > 0" :messages="messages" /> -->
            </td>

            <td
              style="white-space: nowrap; padding-left: 8px; min-width: 165px"
            >
              <div
                class="ui fluid button"
                @click="clearFilter(true, true, true)"
              >
                Clear
              </div>
            </td>

            <td
              style="white-space: nowrap; padding-left: 8px; min-width: 165px"
            >
              <div
                class="ui fluid primary button"
                :class="{ disabled: !dataChanged }"
                @click="applyFilter(true)"
              >
                Apply
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FundFilters',
  props: {
    initialFilters: {
      type: Object,
      required: true,
      default: () => {
        return {
          invested: false,
          favourite: false,
          uniswap: false,
          kyber: false,
          inactive: false,
          risks: [true, true, true, true, true],
          assets: '',
          myTokens: false
        }
      }
    }
  },
  data() {
    return {
      // cnt: 0,
      filters: {
        cnt: 0,
        invested: false,
        favourite: false,
        uniswap: false,
        kyber: false,
        inactive: false,
        risks: [true, true, true, true, true],
        assets: '',
        myTokens: false
      }
    }
  },
  computed: {
    topContentHeight() {
      return 50
    },
    topContentHeightInPx() {
      return this.topContentHeight + 'px'
    },
    bottomContentHeight() {
      return 70
    },
    bottomContentHeightInPx() {
      return this.bottomContentHeight + 'px'
    },
    dataChanged() {
      if (this.filters.cnt < 0) {
        // Will never happen, just to make it reactive
        return false
      }

      return (
        this.filters.invested != this.initialFilters.invested ||
        this.filters.favourite != this.initialFilters.favourite ||
        this.filters.uniswap != this.initialFilters.uniswap ||
        this.filters.kyber != this.initialFilters.kyber ||
        this.filters.inactive != this.initialFilters.inactive ||
        this.filters.risks.toString() != this.initialFilters.risks.toString() ||
        this.filters.assets != this.initialFilters.assets ||
        this.filters.myTokens != this.initialFilters.myTokens
      )
    }
  },
  watch: {
    initialFilters(v) {
      this.filters.invested = v.invested
      this.filters.favourite = v.favourite
      this.filters.uniswap = v.uniswap
      this.filters.kyber = v.kyber
      this.filters.inactive = v.inactive
      this.filters.risks[0] = v.risks[0]
      this.filters.risks[1] = v.risks[1]
      this.filters.risks[2] = v.risks[2]
      this.filters.risks[3] = v.risks[3]
      this.filters.risks[4] = v.risks[4]
      this.filters.assets = v.assets
      this.filters.myTokens = v.myTokens
    }
  },
  created() {
    this.filters.invested = this.initialFilters.invested
    this.filters.favourite = this.initialFilters.favourite
    this.filters.uniswap = this.initialFilters.uniswap
    this.filters.kyber = this.initialFilters.kyber
    this.filters.inactive = this.initialFilters.inactive
    this.filters.risks[0] = this.initialFilters.risks[0]
    this.filters.risks[1] = this.initialFilters.risks[1]
    this.filters.risks[2] = this.initialFilters.risks[2]
    this.filters.risks[3] = this.initialFilters.risks[3]
    this.filters.risks[4] = this.initialFilters.risks[4]
    this.filters.assets = this.initialFilters.assets
    this.filters.myTokens = this.initialFilters.myTokens
  },
  mounted() {
    this.$refs.fundFilters.addEventListener('keyup', this.escapeHandler)
  },
  beforeDestroy() {
    this.$refs.fundFilters.removeEventListener('keyup', this.escapeHandler)
  },
  methods: {
    riskChanged(event) {
      // console.log('riskClicked', event)
    },
    clearFilter(attributes, assets, risks) {
      if (attributes) {
        this.filters.invested = false
        this.filters.favourite = false
        this.filters.uniswap = false
        this.filters.kyber = false
        this.filters.inactive = false
      }
      if (assets) {
        this.filters.assets = ''
        this.filters.myTokens = false
      }
      if (risks) {
        this.filters.risks = [true, true, true, true, true]
      }
    },
    applyFilter() {
      ++this.filters.cnt // To force reactivity
      this.$emit('filterUpdated', this.filters)
      this.emitClose()
    },
    processInputedAssets() {
      this.filters.assets = this.filters.assets.toUpperCase().replace(' ', '')
    },
    escapeHandler(e) {
      e.stopPropagation()
      if (e.key === 'Escape' || e.key === 'Esc') {
        // console.log('FundFilters.keyup', e)
        this.emitClose()
      }
    },
    emitClose() {
      this.$emit('close')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
</style>
