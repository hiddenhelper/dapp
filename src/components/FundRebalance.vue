<template>
  <div _note="semantic modal's less shrinks the border of the first/last element">
    <div class="ui fluid card">
      <div
        class="content"
        style="background-color: #2a2a2a"
        :style="{ height: topContentHeightInPx }"
      >
        <i
          class="close icon right floated _pointer"
          style="margin-top: 0.5rem"
          @click="$emit('close')"
        ></i>
        <a
          class="right floated"
          href="https://dextf.notion.site/Rebalancing-Guide-FM-8387a8a0c34f4035b79fee2cc0037299"
          target="wiki"
        >
          <i
            class="circular colored question icon primary"
            style="font-size: 0.65rem; margin-top: 0.3rem; margin-right: 1rem"
          >
          </i>
        </a>
        <h3 class="ui header" xstyle="margin-bottom: 2rem">
          Rebalance fund
          <span class="ui text primary">
            {{ fund.symbol }}
          </span>
        </h3>
      </div>

      <div class="content">
        <form class="ui form">
          <fieldset style="margin: 0; padding: 0; border-style: none">
            <div class="ui grid" :style="{ height: gridHeightInPx }">
              <div class="row">
                <div class="column" style="border-bottom: 1px solid #2a2a2a">
                  <div class="ui fluid card _gradient1" xstyle="height: 220px">
                    <div class="content">
                      <div class="ui grid middle aligned" style="height: 100%; margin: 0">
                        <div class="stretched row">
                          <div class="ten wide column">
                            <Token
                              :image="fund.image"
                              :font-size="'large'"
                              :label="`<b>${fund.symbol}</b> ${
                                isAdmin
                                  ? '(' + formatPrice(fund.currentPrice().toNumber()) + ')'
                                  : ''
                              }`"
                              :sub-label="fund.name"
                              :max-width="'100%'"
                            />
                          </div>
                          <div
                            class="three wide column right aligned"
                            style="font-weight: 500; font-size: large; line-height: 1.2"
                          >
                            <b>Total Supply</b>
                            <div class="_muted _normal">
                              {{ formatQuantity(fund.totalNoOfTokens.toNumber()) }}
                            </div>
                          </div>
                          <div
                            class="three wide column right aligned"
                            style="font-weight: 500; font-size: large; line-height: 1.2"
                          >
                            <b>Total AUM</b>
                            <div class="_muted _normal">
                              {{ formatPrice(fund.aum().toNumber()) }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <br />
                  <div class="ui grid">
                    <div class="eight wide column">
                      <div class="field">
                        <label xstyle="margin-bottom: 1rem"> Target price </label>
                        <div class="fields">
                          <div class="four wide field" xstyle="background-color: blue">
                            <div class="ui input" Xclass="{ disabled: fund.created }">
                              <BigNumberInput
                                style="max-width: 100px"
                                :input-value="newTargetPrice"
                                @changed="changedNewTarget($event)"
                              />
                              <span style="z-index: 10; position: relative; left: -85px; top: 15px">
                                $
                              </span>
                            </div>
                          </div>
                          <div
                            class="twelve wide field"
                            style="xbackground-color: green; padding-left: 0"
                          >
                            <div
                              id="newTargetSlider"
                              class="ui bottom aligned labeled ticked slider"
                              :class="{ small: true, _muted: true }"
                              style="padding-top: 0; xbackground-color: green"
                            ></div>
                            <div class="center aligned" style="line-height: 1.3">
                              <div
                                class="ui grid"
                                :class="{ 'middle aligned': true }"
                                style="margin: 0; xbackground-color: red"
                              >
                                <div
                                  class="six wide column"
                                  :class="{
                                    'right aligned bottom aligned': true
                                  }"
                                  style="padding-bottom: 0; padding-left: 0; padding-right: 0"
                                  v-html="sliderLeftLabel"
                                ></div>
                                <div class="four wide column" style="padding-bottom: 0">
                                  Slippage
                                  <!--
                                  Current price
                                  <br />
                                  {{ formatPrice(totals.current.toNumber()) }}
                                  -->
                                </div>
                                <div
                                  class="six wide column"
                                  :class="{
                                    'left aligned bottom aligned': true
                                  }"
                                  style="padding-bottom: 0; padding-left: 0; padding-right: 0"
                                  v-html="sliderRightLabel"
                                ></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div v-if="true" class="eight wide column">
                      <div class="field">
                        <label xstyle="margin-bottom: 1rem"> Proposal rationale (optional) </label>
                        <textarea
                          ref="rationale"
                          v-model.trim="rationale"
                          placeholder="Tell your investors about the rationale behind this rebalancing proposal..."
                          style="resize: none"
                          rows="3"
                        ></textarea>
                      </div>
                    </div>

                    <div v-else class="eight wide column">
                      <div class="ui info message visible" style="height: 100%">
                        <div class="header" xstyle="background-color: red">
                          <i class="info circle icon"></i>
                          Modify the asset allocation
                        </div>
                        <ul class="list" style="margin-left: 1rem">
                          <li>change the percentages</li>
                          <li>
                            reset to the inception allocation with
                            <i
                              class="ui history icon"
                              style="margin-right: 0; color: white !important"
                            ></i>
                            button
                          </li>
                          <li v-if="everRebalanced">
                            reset to the latest rebalance allocation with
                            <i
                              class="ui undo alternate icon"
                              style="margin-right: 0; color: white !important"
                            ></i>
                            button
                          </li>
                          <li>
                            add assets with the
                            <i
                              class="ui plus icon"
                              style="margin-right: 0; color: white !important"
                            ></i>
                            button
                          </li>
                          <li>
                            remove assets with the
                            <i
                              xclass="ui times circle icon"
                              class="ui trash alternate outline icon"
                              style="margin-right: 0; color: white !important"
                            ></i>
                            button
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <br />

                  <table
                    class="ui clear table bottom aligned"
                    style="
                      margin: 1rem 0 0 0;
                      font-size: 14px;
                      border-spacing: 0;
                      xbackground-color: blue;
                    "
                  >
                    <thead class="full-width">
                      <tr>
                        <th
                          class="center aligned"
                          :style="selectedAssetsStyles.topHeaderAllocation.column1.style"
                          v-html="selectedAssetsStyles.topHeaderAllocation.column1.header"
                        ></th>
                        <th
                          class="center aligned"
                          :style="selectedAssetsStyles.topHeaderAllocation.column2.style"
                          v-html="selectedAssetsStyles.topHeaderAllocation.column2.header"
                        ></th>
                        <th style="min-width: 16px; width: 16px"></th>
                        <th
                          class="center aligned"
                          :style="selectedAssetsStyles.topHeaderAllocation.column3.style"
                          v-html="selectedAssetsStyles.topHeaderAllocation.column3.header"
                        ></th>
                      </tr>
                    </thead>
                  </table>

                  <div class="field" xstyle="background-color: blue">
                    <!-- <label>Allocation</label> -->
                    <AssetTable
                      :assets="selectedAssetItems"
                      :show-header="true"
                      :show-full-name="true"
                      :styles="selectedAssetsStyles"
                      :height="selectedAssetsTableHeight"
                      :font-size="'14px'"
                      :read-only="false"
                      :hoverable="false"
                      @changedPercentage="changedPercentage($event)"
                      @resetTo="resetTo($event)"
                      @addAsset="addAsset($event)"
                    />
                  </div>

                  <div
                    class="ui segment"
                    style="height: 48px; border-radius: 8px; background-color: #2a2a2a; padding: 0"
                  >
                    <table
                      class="ui clear table bottom aligned"
                      style="height: 100%; xbackground-color: blue"
                    >
                      <!-- <thead class="full-width"> -->
                      <thead class="full-width">
                        <!-- Header, also used to impose the columns' widths -->
                        <tr>
                          <th
                            class="_normal _muted"
                            :style="selectedAssetsStyles.asset.style"
                            style="padding-left: 0.5rem !important"
                          >
                            <span
                              class="ui text"
                              :class="{
                                error: this.validations.allocation.highlightError
                              }"
                              style="padding-left: 0.5rem"
                            >
                              {{
                                `${includedAssetItems.length} ${
                                  includedAssetItems.length > 1 ? 'tokens' : 'token'
                                }`
                              }}
                            </span>
                          </th>
                          <th
                            v-if="selectedAssetsStyles.previousQtyInput"
                            class="right aligned _normal _muted"
                            style="padding-right: 0.5rem"
                            :style="selectedAssetsStyles.previousQtyInput.style"
                            v-html="formatPrice(totals.previous.toNumber())"
                          ></th>

                          <th
                            class="right aligned _normal _muted"
                            v-if="selectedAssetsStyles.currentQtyInput"
                            style="padding-right: 0.5rem"
                            :style="selectedAssetsStyles.currentQtyInput.style"
                            v-html="formatPrice(totals.current.toNumber())"
                          ></th>

                          <th
                            v-if="selectedAssetsStyles.percentageInput"
                            _note="separator"
                            style="min-width: 8px; width: 8px; padding: 0"
                          ></th>
                          <th
                            v-if="selectedAssetsStyles.percentageInput"
                            class="right aligned _normal _muted"
                            :class="{ _error: totals.new.eq(0) }"
                            style="padding-right: 0.5rem"
                            :style="selectedAssetsStyles.percentageInput.style"
                            v-html="formatPrice(totals.new.toNumber())"
                          ></th>
                          <th
                            v-if="selectedAssetsStyles.percentageInput && false"
                            _note="separator"
                            class="center aligned"
                            style="
                              min-width: 1.5rem;
                              width: 1.5rem;
                              padding: 0;
                              background-color: #1e1e1e;
                            "
                          ></th>

                          <!--
                          <th
                            v-if="selectedAssetsStyles.newQtyInput"
                            _note="separator"
                            style="min-width: 1.5rem; width: 1.5rem; padding: 0"
                          ></th>
                          <th
                            class="right aligned _normal _muted"
                            v-if="selectedAssetsStyles.newQtyInput"
                            style="padding-right: 0.5rem"
                            :style="selectedAssetsStyles.newQtyInput.style"
                            v-html="formatPrice(totals.new.toNumber())"
                          ></th>
                          -->

                          <th
                            v-if="selectedAssetsStyles.newQtyIn"
                            _note="separator"
                            style="min-width: 1.5rem; width: 1.5rem; padding: 0"
                          ></th>
                          <th
                            v-if="selectedAssetsStyles.newQtyIn"
                            class="right aligned _normal _muted"
                            :class="{ _error: totals.in.eq(0) }"
                            style="padding-right: 0.5rem"
                            :style="selectedAssetsStyles.newQtyIn.style"
                            v-html="formatPrice(totals.in.toNumber())"
                          ></th>

                          <th
                            v-if="selectedAssetsStyles.newQtyOut"
                            _note="separator"
                            style="min-width: 8px; width: 8px; padding: 0"
                          ></th>
                          <th
                            v-if="selectedAssetsStyles.newQtyOut"
                            class="right aligned _normal _muted"
                            :class="{ _error: totals.out.eq(0) }"
                            style="padding-right: 0.5rem"
                            :style="selectedAssetsStyles.newQtyOut.style"
                            v-html="formatPrice(totals.out.toNumber())"
                          ></th>
                        </tr>
                      </thead>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </fieldset>
        </form>
      </div>

      <div
        class="content"
        style="padding-top: 10px !important"
        :style="{ height: bottomContentHeightInPx }"
      >
        <table style="border-spacing: 0; xbackground-color: red">
          <tr>
            <td style="width: 100%; padding: 0 !important">
              <MessageBar
                v-show="messages.length > 0"
                :messages="messages"
                style="height: 48px !important; margin: 0"
              />
            </td>

            <td
              style="white-space: nowrap; padding-left: 8px; min-width: 165px"
              :data-tooltip="isConnected ? undefined : 'Wallet not connected'"
              data-position="top center"
              data-inverted=""
            >
              <div
                class="ui fluid primary button"
                :class="{
                  disabled: inProgress || !isConnected || inputIncomplete || !somethingChanged
                }"
                @click="broadcast()"
              >
                Broadcast proposal
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral'
import BigNumber from 'bignumber.js'
import axios from 'axios'
import { fundMixin } from '../mixins/fundMixins.js'
import AssetTable from './AssetTable.vue'
import MessageBar from './MessageBar.vue'
import Token from './Token.vue'
import BigNumberInput from './BigNumberInput.vue'

export default {
  name: 'FundRebalance',
  components: { AssetTable, MessageBar, Token, BigNumberInput },
  mixins: [fundMixin],
  props: {
    height: {
      type: Number,
      default: 1000
    },
    fund: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      bigNumberInputValue: new BigNumber(25), // undefined,
      newTargetPrice: new BigNumber(0),
      assetItems: [],
      xxselectedAssetItems: [],
      refreshingPrices: false,
      everRebalanced: false,
      rationale: undefined,
      sliderSettings: {
        min: 0,
        max: 10,
        step: 0.25,
        smooth: false,
        percentage: 0
      },
      totals: {
        previous: new BigNumber(0),
        current: new BigNumber(0),
        new: new BigNumber(0),
        in: new BigNumber(0),
        out: new BigNumber(0)
      },
      validations: {
        allocation: {
          active: false,
          function: this.allocationValidation,
          validated: true
        },
        totalPercentage: {
          active: false,
          // function: this.totalPercentageValidation,
          validated: true,
          highlightError: false
        },
        inOut: {
          active: false,
          // function: this.inOutValidation,
          validated: true,
          highlightError: false
        }
      },
      inputIncompleteX: true,
      searchText: '',
      messages: [],
      selectedAssetsStyles: {
        topHeaderAllocation: {
          column1: {
            header: '',
            style: 'width: 100%; xbackground-color: yellow'
          },
          column2: {
            header: '<h4 class="ui dividing header">Allocation</h4>',
            style: 'min-width: 360px; width: 360px; xbackground-color: green'
          },
          column3: {
            header: '<h4 class="ui dividing header">Rebalance trades</h4>',
            style: 'min-width: 240px; width: 240px; xbackground-color: orange'
          }
        },
        asset: {
          header: this.buttonGroup(),
          style: 'width: 100%; padding-left: 0; xbackground-color: yellow'
        },
        price24h: {
          header: '24h<br/>Price',
          style: 'min-width: 115px; width: 115px; xbackground-color: blue'
        },
        previousQtyInput: {
          header: '<div id="previousQtyInputHeader">Latest<br/>Rebalance</div>',
          style: 'min-width: 120px; width: 120px; vertical-align: middle; xbackground-color: orange'
        },
        currentQtyInput: {
          header: 'Current',
          style: 'min-width: 120px; width: 120px; vertical-align: middle; xbackground-color: pink'
        },
        percentageInput: {
          header: 'New',
          style: 'min-width: 120px; width: 120px; vertical-align: middle; xbackground-color: blue',
          resettable: true
        },
        newQtyIn: {
          header: 'Quantity In',
          style: 'min-width: 120px; width: 120px; vertical-align: middle; xbackground-color: green'
        },
        newQtyOut: {
          header: 'Quantity Out',
          style: 'min-width: 120px; width: 120px; vertical-align: middle; xbackground-color: red'
        }
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
    gridHeight() {
      return this.height - this.topContentHeight - this.bottomContentHeight // + 15
    },
    gridHeightInPx() {
      return this.gridHeight + 'px'
    },
    assetTableHeight() {
      return this.gridHeight - 82
    },
    assetTableHeightInPx() {
      return this.assetTableHeight + 'px'
    },
    textareaHeight() {
      const h = this.gridHeight - 420
      if (h < 60) return 60
      return Math.min(150, h)
    },
    textareaHeightInPx() {
      return this.textareaHeight + 'px'
    },
    selectedAssetsTableHeight() {
      return this.gridHeight - this.textareaHeight - 240
    },
    selectedAssetsTableHeightInPx() {
      return this.selectedAssetsTableHeight + 'px'
    },
    bottomContentHeight() {
      return 70
    },
    bottomContentHeightInPx() {
      return this.bottomContentHeight + 'px'
    },
    inProgress() {
      return false
    },
    selectedAssetItems() {
      return this.assetItems.filter((a) => a.selected)
    },
    includedAssetItems() {
      return this.selectedAssetItems.filter((a) => a.allocation.new.percentage > 0)
    },
    prices() {
      return this.includedAssetItems.map((a) => a.price)
    },
    percentages() {
      return this.includedAssetItems.map((a) => new BigNumber(a.allocation.new.percentage).div(100))
    },
    totalPercentage() {
      let totalPercentage = this.percentages.reduce((a, b) => a.plus(b), new BigNumber(0))
      return new BigNumber(totalPercentage.toFixed(3)).times(100)
    },
    inputIncomplete() {
      /*
      this.log(
        'inputIncomplete',
        !this.validations.allocation.validated ||
          !this.validations.totalPercentage.validated ||
          !this.validations.inOut.validated
      )
      */
      return (
        !this.validations.allocation.validated ||
        !this.validations.totalPercentage.validated ||
        !this.validations.inOut.validated
      )
    },
    somethingChanged() {
      const x = this.totals.in.gt(0) || this.totals.out.gt(0)
      // const x = this.selectedAssetItems.some(
      //   (item) =>
      //     item.allocation.in.unitQuantity.gt(0) ||
      //     item.allocation.out.unitQuantity.gt(0)
      // )
      return x
    },
    sliderLeftLabel() {
      let label = ''
      let color = ''
      if (this.sliderSettings.percentage < 0) {
        label +=
          this.format(this.sliderSettings.percentage, '+0.[00]') +
          '%' +
          (this.sliderSettings.percentage < -100
            ? '<i class="ui less than icon small" style="margin: 0 0 0 0.2rem"></i>'
            : '') +
          '<i class="long arrow alternate left icon" style="margin: 0 0 0 0.5rem"></i>'
        const minPct = this.sliderValueToPct(this.sliderSettings.min)
        if (this.sliderSettings.percentage < minPct) {
          color = 'warning'
          label += `<span data-tooltip="Slippage exceeds 5%" data-position="bottom left" data-inverted=""><i class="exclamation circle icon ${color}" style="margin: 0 0 0 0.5rem"></i></span>`
        }
      }
      return `<span class="ui text ${color}">${label}</span>`
    },
    sliderRightLabel() {
      let label = ''
      let color = ''
      if (this.sliderSettings.percentage > 0) {
        label +=
          '<i class="long arrow alternate right icon" style="margin: 0 0.5rem 0 0"></i>' +
          (this.sliderSettings.percentage >= 100
            ? '<i class="ui greater than equal icon small" style="margin: 0 0.2rem 0 0"></i>'
            : '') +
          this.format(Math.min(this.sliderSettings.percentage, 100), '+0.[00]') +
          '%'
        const maxPct = this.sliderValueToPct(this.sliderSettings.max)
        if (this.sliderSettings.percentage > maxPct) {
          color = 'warning'
          label += `<span data-tooltip="Slippage exceeds 5%" data-position="bottom right" data-inverted=""><i class="exclamation circle icon ${color}" style="margin: 0 0 0 0.5rem"></i></span>`
        }
      }
      return `<span class="ui text ${color}">${label}</span>`
    }
  },
  watch: {},
  beforeCreate() {},
  created() {
    this.log(this.$options.name + ' created')

    // this.newTargetPrice = new BigNumber(
    //   this.format(this.fund.currentPrice().toNumber(), '0.000')
    // )

    if (this.fund.allocation.latest) {
      this.everRebalanced = true
    } else {
      this.everRebalanced = false
      // this.fund.allocation.latest = this.fund.allocation.inception
      // console.log('built this.fund.allocation.latest')
    }

    this.initializeToCurrent()

    this.newTargetPrice = new BigNumber(this.format(this.totals.current.toNumber(), '0.000'))
    // new BigNumber(this.format(this.fund.currentPrice().toNumber(), '0.000'))
  },
  beforeMount() {},
  mounted() {
    this.log(this.$options.name + ' mounted')

    //
    // Set the slider
    //

    const labels = []
    const interpretLabelFn = function (value) {
      return labels[value]
    }

    this.sliderSettings.interpretLabel = function (value) {
      return labels[value]
    }
    this.sliderSettings.onChange = this.changedSlider

    for (
      let i = this.sliderSettings.min;
      i <= this.sliderSettings.max / this.sliderSettings.step;
      i++
    ) {
      const v = i * this.sliderSettings.step - this.sliderSettings.max / 2
      if (v == 0) {
        // labels.push(this.formatPrice(this.fund.currentPrice().toNumber()))
        // labels.push('&#9550;')
        labels.push('0')
      } else {
        labels.push(this.format(v, '+0.[00]') + '%')
      }
    }
    $('#newTargetSlider')
      .slider(this.sliderSettings)
      .slider('set value', this.pctToSliderValue(0), false)

    //
    // Set the buttons
    //

    // $('#addNewAsset').on('click', () => this.addNewAsset())
    /*
    $('#resetToInceptionBtn').on('click', () => this.resetTo(true))
    if (this.everRebalanced) {
      $('#resetToPreviousRebalanceBtn').on('click', () => this.resetTo(false))
    } else {
      $('#previousQtyInputHeader').text('Inception')
      $('#resetToPreviousRebalanceBtn').hide()
    }
    */
    $('#resetToInceptionBtn').hide()
    $('#resetToPreviousRebalanceBtn').on('click', () => this.resetTo(false))
    if (!this.everRebalanced) {
      $('#previousQtyInputHeader').text('Inception')
      $('#resetToPreviousRebalanceBtn').attr('data-tooltip', 'Reset to the inception allocation')
    }
  },
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {
    /*
    $('#resetToInceptionBtn').off('click')
    if (this.everRebalanced) {
      $('#resetToPreviousRebalanceBtn').off('click')
    }
    */
    $('#resetToPreviousRebalanceBtn').off('click')
  },
  destroyed() {
    this.log(this.$options.name + ' destroyed')
  },
  methods: {
    formatQuantity(n) {
      if (isNaN(n)) return '-'

      const precision = '0'.repeat(9)
      let s = numeral(n.toPrecision(precision.length)).format(`0,0.[${precision}]`)

      return s == 'NaN' ? '0' : s
    },
    formatPrice(n) {
      if (isNaN(n)) return '-'
      let s
      if (n < 1000000) {
        s = numeral(n).format('$0,0.[00]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('$0,0.00a')
      }

      return s == 'NaN' ? '0' : s
    },
    formatPct(n, maxDecimals = 4) {
      if (isNaN(n)) return '-'

      return n == 0 ? '0%' : numeral(n).format(`0.[${'0'.repeat(maxDecimals)}]`) + '%'
    },
    format(n, fmt = '0,0') {
      return numeral(n).format(fmt)
    },
    allocationValidation() {
      // this.log('allocationValidation')
      if (this.validations.allocation.active == false) {
        // Validation will start after the user has entered the first token
        if (this.includedAssetItems.length > 0) {
          this.validations.allocation.active = true
        }
        return
      }

      const id = 'selectedAssetsError'
      let message = this.messages.find((m) => m.id == id)
      let text = ''

      if (this.includedAssetItems.length < 2 || this.includedAssetItems.length > 10) {
        text = 'Wrong allocation (min 2, max 10 tokens)'
      }

      this.validations.allocation.validated = !text
      this.evalStatus()

      this.validations.allocation.highlightError = !this.validations.allocation.validated

      if (text) {
        if (message) {
          message.text = text
        } else {
          message = { id: id, text: text, type: 'error' }
          this.messages.push(message)
        }
      } else {
        this.removeMessage(id)
      }
    },
    totalPercentageValidation() {
      // this.log('totalPercentageValidation', this.totalPercentage.toString())

      const id = 'totalPercentageError'
      let message = this.messages.find((m) => m.id == id)
      let text = ''

      // if (!this.totalPercentage.eq(100)) {
      if (this.totalPercentage.toFixed(2) != '100.00') {
        text = `Total allocation is ${this.formatPct(
          this.totalPercentage.toNumber()
        )}, must be <b>100%</b>`
      }

      this.validations.totalPercentage.validated = !text
      this.evalStatus()

      this.validations.totalPercentage.highlightError = !this.validations.totalPercentage.validated

      if (text) {
        if (message) {
          message.text = text
        } else {
          message = { id: id, text: text, type: 'error' }
          this.messages.splice(0, 0, message) // insert at index 0
        }
      } else {
        this.removeMessage(id)
      }
    },
    inOutValidation() {
      // this.log('inOutValidation')

      if (this.validations.inOut.active == false) {
        // Validation will start at the next change
        this.validations.inOut.active = true
        return
      }

      if (!this.validations.totalPercentage.validated) {
        // Priority to the total percentage validation
        return
      }

      const id = 'inOutWarning'
      let message = this.messages.find((m) => m.id == id)
      let text = ''

      const diff = this.totals.in.minus(this.totals.out).div(this.totals.current).times(100)

      /*
      this.log(
        'new qty',
        this.totals.new.toString(),
        ' | current qty',
        this.totals.current.toString(),
        ' | diff',
        diff.toString()
      )
      */

      let compact = true
      let error = false
      if (this.totals.in.lt(0.01) && this.totals.out.lt(0.01)) {
        error = true
        text = `There are no Buy/Sell trades, and market makers will not execute this rebalance. Please review the allocation and make sure there are both Buy and Sell trades.`
      } else if (this.totals.in.lt(0.01)) {
        error = true
        text = `There are no Buy trades, and market makers will not execute this rebalance. Please review the allocation and make sure there are both Buy and Sell trades.`
      } else if (this.totals.out.lt(0.01)) {
        error = true
        text = `There are no Sell trades, and market makers will not execute this rebalance. Please review the allocation and make sure there are both Buy and Sell trades.`
      } else if (diff.lt(-5.01)) {
        text = `Fund price is expected to drop by ${this.format(
          -diff.toNumber(),
          '0.[00]'
        )}% after rebalancing, that exceeds the slippage threshold of 5%. Please review the allocation and make sure it's the intended effect.`
      } else if (diff.gt(5.01)) {
        text = `Fund price is expected to increase by ${this.format(
          diff.toNumber(),
          '0.[00]'
        )}% after rebalancing, that exceeds the slippage threshold of 5%, and market makers might not execute this rebalance. Please review the allocation and make sure it's the intended effect.`
      }

      this.validations.inOut.validated = !error
      this.evalStatus()

      if (text) {
        if (message) {
          this.removeMessage(id)
        }
        message = {
          id: id,
          text: text,
          type: error ? 'error' : 'warning',
          size: compact ? 'tiny' : undefined,
          'padding-top': compact ? '0.4rem' : undefined,
          'padding-bottom': compact ? '0.4rem' : undefined
        }

        this.messages.splice(0, 0, message) // insert at index 0
      } else {
        this.removeMessage(id)
      }
    },
    calculateTotal(keys) {
      keys.forEach((key) => {
        const flattenedItems = this.selectedAssetItems.map((item) => item.allocation[key])
        this.totals[key] = this.calculateAllocationTotal(flattenedItems)
        // console.log(`Total for '${key}'`, this.totals[key].toString())
      })

      if (keys.includes('in') || keys.includes('out')) {
        this.inOutValidation()
      }
    },
    calculatePercentage(keys) {
      keys.forEach((key) => {
        const flattenedItems = this.selectedAssetItems.map((item) => item.allocation[key])
        this.updateAllocationPercentages(flattenedItems, this.totals[key])
      })
      this.totalPercentageValidation()
    },
    evalStatus() {
      return
      /*
      console.log('--------evalStatus--------')
            console.log(
        'inputIncomplete-allocation: validated ?',
        this.validations.allocation.validated
      )
      console.log('-----------')
      */
      this.inputIncomplete =
        // this.messages.length > 0 ||
        !this.validations.allocation.validated ||
        !this.validations.totalPercentage.validated ||
        !this.validations.inOut.validated
    },
    resetUnitQuantities() {
      this.selectedAssetItems.forEach((a) => {
        a.allocation.new.unitQuantity = new BigNumber(0)
        a.allocation.in.unitQuantity = new BigNumber(0)
        a.allocation.out.unitQuantity = new BigNumber(0)
      })
      this.totals.new = new BigNumber(0)
      this.totals.in = new BigNumber(0)
      this.totals.out = new BigNumber(0)
    },
    removeMessage(id) {
      const i = this.messages.findIndex((m) => m.id == id)
      if (i >= 0) this.messages.splice(i, 1)
    },
    changedSlider(value) {
      this.sliderSettings.percentage = this.sliderValueToPct(value)

      let p = this.totals.current.toNumber()
      if (this.sliderSettings.percentage !== 0) {
        p *= 1 + this.sliderSettings.percentage / 100
      }
      this.newTargetPrice = new BigNumber(this.format(p, '0.000'))

      this.refreshUnitQuantities('changedSlider')
    },
    sliderValueToPct(value) {
      return value - this.sliderSettings.max / 2
    },
    pctToSliderValue(pct) {
      return pct + this.sliderSettings.max / 2
    },
    changedNewTarget(value) {
      this.newTargetPrice = new BigNumber(value)

      // check and update slider
      let newPct = new BigNumber(this.newTargetPrice).minus(this.totals.current)
      newPct = newPct.div(this.totals.current).times(100)

      if (newPct.gt(0)) {
        const maxPct = this.sliderValueToPct(this.sliderSettings.max)
        if (newPct.gt(maxPct)) {
          // Upper bound exceeded
          $('#newTargetSlider').slider('set value', this.sliderSettings.max, false)
        } else {
          $('#newTargetSlider').slider('set value', this.pctToSliderValue(newPct.toNumber()), false)
        }
      } else if (newPct.lt(0)) {
        const minPct = this.sliderValueToPct(this.sliderSettings.min)
        if (newPct.lt(minPct)) {
          // Lower bound exceeded
          $('#newTargetSlider').slider('set value', this.sliderSettings.min, false)
        } else {
          $('#newTargetSlider').slider('set value', this.pctToSliderValue(newPct.toNumber()), false)
        }
      } else {
        $('#newTargetSlider').slider('set value', this.pctToSliderValue(0), false)
      }

      this.sliderSettings.percentage = newPct.toNumber()

      this.refreshUnitQuantities('changedNewTarget')
    },
    changedPercentage(data) {
      const asset = this.assetItems.find((a) => a.symbol == data.symbol)
      if (asset) {
        asset.allocation.new.percentage = data.percentage.toNumber()

        // asset.selected = !data.percentage.eq(0)

        this.totalPercentageValidation()

        if (!this.totalPercentage.eq(100) || !this.connector) {
          this.selectedAssetItems.forEach((item) => {
            item.allocation.new.unitQuantity = new BigNumber(0)
            if (item.allocation.new.percentage == 0) {
              item.allocation.new.error = false
              this.calculateInOut(item)
            } else {
              item.allocation.new.error = true
              item.allocation.in.unitQuantity = new BigNumber(0)
              item.allocation.out.unitQuantity = new BigNumber(0)
            }
          })
          this.calculateTotal(['new', 'in', 'out'])
          this.allocationValidation()
          // }
          return
        }

        this.refreshUnitQuantities('changedPercentage')
      }
    },
    refreshUnitQuantities(caller) {
      // this.log('refreshUnitQuantities', caller)
      if (this.connector) {
        // Calculate the unit quantities based on the updated percentages
        // but keeping the fund price the same
        const result = this.connector.calculateFundUnits(
          this.prices,
          this.percentages,
          this.newTargetPrice
        )

        result.data.fundUnits.forEach((u, i) => {
          const item = this.includedAssetItems[i]
          item.allocation.new.error = false
          item.allocation.new.unitQuantity = u
          this.calculateInOut(item)
        })

        this.calculateTotal(['new', 'in', 'out'])
        this.calculatePercentage(['new'])
      }
    },
    calculateInOut(item) {
      const diff = item.allocation.new.unitQuantity.minus(item.allocation.current.unitQuantity)
      /*
      console.log(
        item.symbol,
        item.allocation.new.unitQuantity.toString(),
        '-',
        item.allocation.current.unitQuantity.toString(),
        '=',
        diff.toString()
      )
      */
      if (diff.gt(0)) {
        item.allocation.in.unitQuantity = diff
        item.allocation.out.unitQuantity = new BigNumber(0)
      } else {
        item.allocation.in.unitQuantity = new BigNumber(0)
        item.allocation.out.unitQuantity = diff.abs()
      }
    },
    initializeToCurrent() {
      // this.log(`${this.$options.name}.initializeToCurrent`)

      let assetItems = []

      this.$store.state.assets.forEach((asset) => {
        // Skip Yield, Option, Funds and disabled assets
        if (
          asset.category != 'Yield' &&
          asset.category != 'Option' &&
          asset.category != 'Fund' &&
          (asset.isDisabled === undefined || asset.isDisabled === false)
        ) {
          const inceptionAllocation = this.fund.allocation.inception.assets.find(
            (a) => a.symbol == asset.symbol
          )

          const latestAllocation = this.fund.allocation.latest
            ? this.fund.allocation.latest.assets.find((a) => a.symbol == asset.symbol)
            : undefined

          const currentAllocation = this.fund.allocation.current.assets.find(
            (a) => a.symbol == asset.symbol
          )

          // this.log(asset.symbol, 'inception', !!inceptionAllocation)
          // this.log(asset.symbol, 'latest', !!latestAllocation)

          let inceptionPrice = new BigNumber(0)
          let inceptionPercentage = 0
          let inceptionUnitQuantity = new BigNumber(0)
          if (inceptionAllocation) {
            inceptionPrice = inceptionAllocation.price
            inceptionPercentage = inceptionAllocation.percentage
            inceptionUnitQuantity = inceptionAllocation.unitQuantity
          }

          let previousPrice = new BigNumber(0)
          let previousPercentage = 0
          let previousUnitQuantity = new BigNumber(0)
          if (latestAllocation) {
            previousPrice = latestAllocation.price
            previousPercentage = latestAllocation.percentage
            previousUnitQuantity = latestAllocation.unitQuantity
          } else if (!this.everRebalanced) {
            previousPrice = inceptionPrice
            previousPercentage = inceptionPercentage
            previousUnitQuantity = inceptionUnitQuantity
          }

          let currentUnitQuantity = previousUnitQuantity
          if (currentAllocation) {
            currentUnitQuantity = currentAllocation.unitQuantity
          }

          const item = {
            symbol: asset.symbol,
            image: asset.image,
            contract: asset.contract,
            description: asset.description,
            change24HourPct: asset.change24HourPct,
            coinGecko: asset.coinGecko,
            price: asset.price,
            selected: previousUnitQuantity.gt(0),
            allocation: {
              inception: {
                price: inceptionPrice,
                percentage: inceptionPercentage,
                unitQuantity: inceptionUnitQuantity
              },
              previous: {
                price: previousPrice,
                percentage: previousPercentage,
                unitQuantity: previousUnitQuantity
              },
              current: {
                price: asset.price,
                percentage: 0, // Dynamically calculated
                unitQuantity: currentUnitQuantity
              },
              new: {
                price: asset.price,
                percentage: 0, // Dynamically calculated
                unitQuantity: currentUnitQuantity,
                error: false
              },
              in: {
                price: asset.price,
                unitQuantity: new BigNumber(0) // Dynamically calculated
              },
              out: {
                price: asset.price,
                unitQuantity: new BigNumber(0) // Dynamically calculated
              }
            }
          }

          assetItems.push(item)
        }
      })

      this.assetItems = assetItems

      this.calculateTotal(['previous', 'current', 'new', 'in', 'out'])
      this.calculatePercentage(['current', 'new'])

      this.validations.allocation.active = this.includedAssetItems.length > 0

      if (this.validations.allocation.active) this.allocationValidation()
    },
    resetTo(inception) {
      this.log(`${this.$options.name}.resetTo(${inception ? 'inception' : 'previous'})`)
      if (inception) {
        this.assetItems.forEach((item) => {
          item.allocation.new.percentage = item.allocation.inception.percentage
          /*
          this.log(
            item.symbol,
            'inception / current / new',
            item.allocation.inception.percentage,
            item.allocation.current.percentage,
            item.allocation.new.percentage
          )
          */
          if (item.allocation.current.percentage > 0 && item.allocation.inception.percentage == 0) {
            // Asset present in the current allocation but not at inception, therefore I need to remove it
            item.allocation.new.error = false
            item.allocation.new.unitQuantity = new BigNumber(0)
            this.calculateInOut(item)
          }
          item.selected =
            item.allocation.current.percentage > 0 || item.allocation.new.percentage > 0
        })
      } else {
        this.assetItems.forEach((item) => {
          item.allocation.new.percentage = item.allocation.previous.percentage
          item.selected =
            item.allocation.current.percentage > 0 && item.allocation.new.percentage > 0
        })
      }

      this.refreshUnitQuantities('resetTo')
    },
    addAsset(symbol) {
      this.log('FundRebalance.addAsset', symbol)
      const a = this.assetItems.find((a) => a.symbol == symbol)
      if (a) {
        a.selected = true
      }
    },
    isAssetForCreationVisible(symbol) {
      const asset = this.assetItems.find((a) => a.symbol == symbol)

      if (!asset) return false

      return asset.selected === false
    },
    broadcast() {
      this.log(this.$options.name, 'broadcast')

      /*
      fundAddress          = Address of the Fund to be reallocated
      maxTradedFundTokens  = The maximum number of fund tokens that can be traded
      minimumDelay         = The minimum delay in seconds between the proposal state and the trading state
      minimumApproverVotes = The minimum number of approver votes to transition to the trading state
      minimumBlockerVotes  = The minimum number of blocker votes needed to stop a trade proposal
      inboundAddresses     = The component addresses entering the fund
      inboundTokensArray   = The value of the incoming tokens per fund token, in tokens
      outboundAddresses    = The component addresses exiting the fund
      outboundTokensArray  = The value of the outgoing tokens per fund token, in tokens
    */

      const assets = []
      const inboundAddresses = []
      const inboundRealUnits = []
      const outboundAddresses = []
      const outboundRealUnits = []

      this.includedAssetItems.forEach((item) => {
        assets.push({
          symbol: item.symbol,
          currentQty: item.allocation.current.unitQuantity.toString(),
          newQty: item.allocation.new.unitQuantity.toString(),
          in: item.allocation.in.unitQuantity.gt(0)
            ? 'Buy ' + item.allocation.in.unitQuantity.toString()
            : '-',
          out: item.allocation.out.unitQuantity.gt(0)
            ? 'Sell ' + item.allocation.out.unitQuantity.toString()
            : '-'
        })
        if (item.allocation.in.unitQuantity.gt(0)) {
          inboundAddresses.push(item.contract)
          inboundRealUnits.push(item.allocation.in.unitQuantity)
        } else if (item.allocation.out.unitQuantity.gt(0)) {
          outboundAddresses.push(item.contract)
          outboundRealUnits.push(item.allocation.out.unitQuantity)
        }
      })

      const data = {
        fundAddress: this.fund.address,
        maxTradedFundTokens: this.fund.totalNoOfTokens,
        minimumDelay: process.env.VUE_APP_REBALANCE_PROPOSAL_MIN_DELAY || 21600, // 6 hours
        minimumApproverVotes: 0,
        minimumBlockerVotes: 1,
        assets,
        inboundAddresses,
        inboundRealUnits,
        outboundAddresses,
        outboundRealUnits,
        symbol: this.fund.symbol,
        rationale: this.rationale
      }

      // console.log(JSON.stringify(data))

      this.$emit('broadcast', data)
    },
    buttonGroup() {
      const button1 = `<div
        id="addAssetBtn"
        class="ui button disabled"
        data-tooltip="Add asset"
        data-position="bottom left"
        data-inverted=""
      >
        <i class="plus icon"></i>
      </div>`

      const button2 = `<div
        id="resetToInceptionBtn"
        class="ui button"
        style="margin: 0"
        data-tooltip="Reset to the inception allocation"
        data-position="bottom left"
        data-inverted=""
      >
        <i class="history icon"></i>
      </div>`

      const button3 = `<div
        id="resetToPreviousRebalanceBtn"
        class="ui button"
        style="margin: 0"
        data-tooltip="Reset to the latest rebalance allocation"
        data-position="bottom left"
        data-inverted=""
      >
        <i class="undo alternate icon"></i>
      </div>`

      return `<div class="ui icon basic tiny buttons" style="border: none">${button1}${button2}${button3}</div>`
    }
  }
}
</script>

<style scoped>
._gradient1 {
  background: linear-gradient(112.77deg, #191919, #131313) !important;
}

.content {
  xbackground-color: yellow !important;
  padding: 1rem !important;
}

.grid {
  xbackground-color: pink !important;
}

.row {
  xbackground-color: green !important;
  padding: 0 !important;
}

.row > .column {
  xbackground-color: red !important;
  padding: 1rem;
}
</style>
