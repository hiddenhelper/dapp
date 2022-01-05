<template>
  <div _note="semantic modal's less shrinks the border of the first/last element">
    <div ref="fundCreation" class="ui fluid card">
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
        <a
          class="right floated"
          href="https://dextf.notion.site/Create-and-Launch-XTF2-aa29fd7917784c4b937cddb916aa4c68"
          target="wiki"
        >
          <i
            class="circular colored question icon primary"
            style="font-size: 0.65rem; margin-top: 0.3rem; margin-right: 1rem"
          >
          </i>
        </a>
        <h3 class="ui header" xstyle="margin-bottom: 2rem">
          {{ fund._ops == 'modify' ? 'Modify' : 'Create new' }}
          fund
          <span v-if="fund._ops == 'modify'" class="ui text primary">
            {{ fund.symbol }}
          </span>
        </h3>
      </div>

      <div class="content" style="border-bottom: 1px solid #2a2a2a">
        <form class="ui form">
          <fieldset style="margin: 0; padding: 0; border-style: none">
            <div class="ui grid">
              <div
                id="centerContent"
                class="fifteen wide column pushable"
                xstyle="background-color: green"
              >
                <div
                  id="addAssetSidebar"
                  class="ui right very wide sidebar"
                  style="padding: 1rem; background-color: #121212; border-left: 1px solid #2a2a2a"
                >
                  <div class="field" style="margin-bottom: 0.5rem">
                    <div class="ui icon input fluid">
                      <i class="search icon"></i>
                      <input
                        type="text"
                        placeholder="Search for a token name, symbol or address"
                        ref="searchInput"
                      />
                    </div>
                  </div>

                  <div class="field" style="margin-bottom: 0">
                    <AssetTable
                      :assets="assetItems"
                      :show-header="false"
                      :show-percentage-input="false"
                      :show-address="true"
                      :styles="assetsForCreationStyles"
                      :height="assetTableHeight"
                      :font-size="'14px'"
                      :hover-image="'images/buttons/plus.png'"
                      xread-only="fund._ops == 'modify'"
                      :read-only="!canAddAssets"
                      :search-text="searchText"
                      :is-asset-visible="isAssetForCreationVisible"
                      @selected="toggleAsset($event)"
                    />
                  </div>
                </div>

                <div
                  id="addModuleSidebar"
                  class="ui top very wide sidebar"
                  style="padding: 1rem; background-color: #121212; border-bottom: 1px solid #2a2a2a"
                  :style="{
                    height: moduleSidebarHeightInPx + ' !important'
                  }"
                >
                  <div class="field">
                    <label>Available optional modules:</label>
                    <div class="ui one column grid" style="margin-top: 1rem">
                      <div v-show="!hasTradeModule" class="column">
                        <div class="ui card" style="width: 100%">
                          <div class="content">
                            <div class="header">
                              Rebalance (Trade)
                              <span
                                class="ui text small"
                                style="margin-left: 1rem; filter: brightness(40%)"
                              >
                                v.
                                {{ tradeModuleVersion }}
                              </span>
                              <a
                                class="ui right corner label"
                                style="border-color: transparent !important"
                                href="https://dextf.notion.site/Rebalancing-Guide-Fund-Managers-8387a8a0c34f4035b79fee2cc0037299"
                                target="wiki"
                              >
                                <i class="circular colored question small icon primary"></i>
                              </a>
                            </div>

                            <div class="description _muted">
                              <p>
                                The <b>Trade</b> module adds the ability to rebalance the fund
                                changing its allocation (underlying assets and weights). This will
                                make the fund <b>dynamic</b>.
                              </p>
                            </div>
                          </div>
                          <div class="extra content">
                            <span
                              class="ui text primary left floated _pointer"
                              @click="addTradeModule()"
                            >
                              <i class="add icon"></i>
                              Add module
                            </span>
                            <div v-if="false" class="right floated">
                              <span class="ui yellow text"> New </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-show="!hasFeeModule" class="column">
                        <div class="ui card" style="width: 100%">
                          <div class="content">
                            <div class="header">
                              Management Fee
                              <span
                                class="ui text small"
                                style="margin-left: 1rem; filter: brightness(40%)"
                              >
                                v.
                                {{ streamingFeeModuleVersion }}
                              </span>
                              <a
                                class="ui right corner label"
                                style="border-color: transparent !important"
                                href="https://dextf.notion.site/Add-Management-Fees-Module-5c917bb48ac7440288d9660f00fd739f"
                                target="wiki"
                              >
                                <i class="circular colored question small icon primary"></i>
                              </a>
                            </div>

                            <div class="description _muted">
                              <p>
                                The <b>Management Fee</b> module allows you to earn a
                                <b>fee</b> calculated as a percentage of the <b>total supply</b>.
                                The <b>fee</b> is accrued monthly (subject to gas costs) and can be
                                paid in DEXTF tokens or fund tokens.
                              </p>
                            </div>
                          </div>
                          <div class="extra content">
                            <span
                              class="ui text primary left floated _pointer"
                              @click="addStreamingFeeModule()"
                            >
                              <i class="add icon"></i>
                              Add module
                            </span>
                            <div class="right floated">
                              <span class="ui yellow text"> New </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  class="pusher"
                  style="padding: 1rem; xbackground-color: pink"
                  :style="{ height: gridHeightInPx }"
                >
                  <div class="ui two column divided grid">
                    <div class="row">
                      <div class="column">
                        <div class="fields">
                          <div class="five wide field">
                            <label>Symbol</label>
                            <div
                              class="ui labeled icon input"
                              :class="{ disabled: fund._ops == 'modify' }"
                            >
                              <div
                                class="ui label"
                                style="padding-right: 0.5rem; background-color: #2a2a2a"
                              >
                                <span
                                  class="ui text"
                                  style="color: white; font-weight: 600"
                                  v-text="$store.getters.fundSymbolPrefix"
                                ></span>
                              </div>
                              <input
                                ref="symbolNoPrefix"
                                v-model.trim="symbolNoPrefix"
                                type="text"
                                placeholder="123"
                                :maxlength="maxSymbolLength"
                                style="padding-left: 0.5rem; padding-right: 0.2rem"
                              />
                              <!-- The icon will be used for the loading -->
                              <i
                                class="small icon"
                                :class="{
                                  stopwatch: false && validations.symbolNoPrefix.apiCallInProgress,
                                  'clock outline': validations.symbolNoPrefix.apiCallInProgress
                                }"
                              ></i>
                            </div>
                          </div>
                          <div
                            v-if="false && fund._ops === 'modify'"
                            class="eleven wide field right aligned"
                          >
                            <label>Embed link</label>

                            <div style="padding-top: 1rem">
                              <a
                                style="text-decoration: underline"
                                :href="fundPublicLink"
                                target="blank"
                                >Public link to your fund
                              </a>
                              <span
                                style="
                                  cursor: copy;
                                  white-space: nowrap;
                                  margin-left: 0.2rem;
                                  color: #a5a5a5;
                                "
                                :data-tooltip="copyAddressMessage"
                                data-position="bottom right"
                                data-inverted=""
                                @click.stop="copyTextToClipboard(fundPublicLink)"
                                @mouseleave="copyAddressMessage = 'Copy to clipboard'"
                              >
                                <i class="icon copy outline"></i>
                              </span>
                            </div>
                          </div>
                        </div>

                        <div class="field">
                          <label>Name</label>
                          <div class="ui input" :class="{ disabled: fund.created }">
                            <input
                              ref="name"
                              v-model.trim="fund.name"
                              type="text"
                              placeholder="Enter the fund name..."
                              maxlength="32"
                            />
                          </div>
                        </div>

                        <div class="field">
                          <label>Description</label>
                          <textarea
                            ref="description"
                            v-model.trim="fund.description"
                            placeholder="Tell your investors about your fund strategy, vision and goals..."
                            style="resize: none"
                            :style="{
                              'min-height': textareaHeightInPx,
                              height: textareaHeightInPx
                            }"
                            Xrows="2"
                          ></textarea>
                        </div>

                        <div class="field">
                          <label>Risk profile</label>
                          <RiskSelector
                            :risk.sync="fund.risk"
                            :single-value="false"
                            :read-only="false"
                            style="background-color: #2a2a2a"
                          />
                        </div>

                        <div class="field">
                          <label>Visible to investors</label>
                          <div
                            id="visibleToInvestorsToggle"
                            class="ui toggle checkbox"
                            :class="{ disabled: workInProgress }"
                            style="margin-right: 2rem !important; margin-top: 0"
                          >
                            <input type="checkbox" name="toggle" />
                            <label for="toggle">Visible</label>
                            <span>Hidden</span>
                          </div>
                        </div>

                        <div v-if="false" class="field">
                          <label>Address</label>
                          <div class="ui input disabled">
                            <input
                              ref="address"
                              v-model.trim="fund.address"
                              type="text"
                              placeholder="-"
                            />
                          </div>
                        </div>
                      </div>

                      <div class="column">
                        <div class="field">
                          <label>
                            {{ (fund._ops == 'modify' ? 'Current ' : 'Initial ') + 'allocation' }}
                            <div v-if="fund.clonedFromV1" style="font-weight: normal">
                              (clone of a V1 fund, allocation is fixed)
                            </div>
                            <span v-else-if="!fund.created" style="font-weight: normal">
                              (target price
                              <span class="ui text primary"> $100 USD</span>)
                            </span>
                          </label>
                          <div
                            v-if="fund.clonedFromV1"
                            class="ui segment centered"
                            style="
                              background-color: #2a2a2a;
                              overflow-y: auto !important;
                              margin-top: 0;
                            "
                            :style="{
                              height: selectedAssetsTableHeight - 10 + 'px'
                            }"
                          >
                            <div class="ui two column very compact grid">
                              <div
                                v-for="asset in fund.assets"
                                :key="asset.symbol"
                                class="column"
                                Xstyle="{
                            'background-color': `rgb(${index * 40}, 0, 0)`
                          }"
                              >
                                <h4 class="ui header">
                                  <img
                                    class="ui mini image"
                                    :src="asset.definition.image"
                                    style="height: 2rem"
                                  />

                                  <div class="content" style="padding-right: 0 !important">
                                    {{ asset.percentage }}%
                                    {{ asset.symbol }}
                                    <div class="sub header">
                                      Launch price: ${{
                                        formatPrice(asset.launchPrice, '0,0.[000]')
                                      }}
                                      <br />
                                      Tokens:
                                      {{ formatQuantity(asset.unitQuantity.toNumber()) }}
                                    </div>
                                  </div>
                                </h4>
                              </div>
                            </div>
                          </div>
                          <AssetTable
                            v-else
                            v-show="selectedAssetItems.length > 0"
                            :assets="selectedAssetItems"
                            :show-header="false"
                            :show-percentage-input="true"
                            :show-address="false"
                            :styles="selectedAssetsStyles"
                            :height="selectedAssetsTableHeight"
                            :font-size="'14px'"
                            :hover-image="'images/buttons/minus.png'"
                            :read-only="!canAddAssets"
                            xread-only="fund._ops == 'modify'"
                            :is-asset-visible="isSelectedAssetVisible"
                            @selected="toggleAsset($event)"
                            @changedPercentage="changedPercentage($event)"
                          />
                          <div
                            v-show="selectedAssetItems.length == 0"
                            class="ui placeholder segment center aligned"
                            style="border-radius: 8px; margin: 0; background-color: #2a2a2a"
                            :style="{
                              'min-height': selectedAssetsTableHeightInPx,
                              height: selectedAssetsTableHeightInPx
                            }"
                          >
                            <div id="addAssetsIcon" class="_pointer">
                              <i class="huge icons">
                                <i class="coins icon"></i>
                                <i
                                  class="bottom right corner add icon primary"
                                  :style="{
                                    'text-shadow':
                                      '-1px -1px 0 #121212, 1px -1px 0 #121212, -1px 1px 0 #121212, 1px 1px 0 #121212 !important'
                                  }"
                                ></i>
                              </i>
                              <div class="_muted" style="margin: 0.5rem 0; font-weight: 400">
                                Add 2 to 10 tokens
                              </div>
                            </div>
                          </div>
                        </div>

                        <div
                          class="ui segment _muted"
                          style="height: 48px; border-radius: 8px; background-color: #2a2a2a"
                        >
                          <span
                            class="ui text"
                            :class="{
                              error: this.validations.allocation.highlightError
                            }"
                          >
                            {{
                              `${selectedAssetItems.length} ${
                                selectedAssetItems.length > 1 ? 'tokens' : 'token'
                              }`
                            }}
                          </span>
                          <span
                            class="ui text right floated"
                            :class="{
                              error: this.validations.totalPercentage.highlightError
                            }"
                          >
                            {{ formatPct(totalPercentage.toNumber(), 2) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div class="one column row" style="border-top: 1px solid #2a2a2a">
                      <div class="column">
                        <div class="field">
                          <label>Modules</label>
                          <div
                            v-show="selectedModules.length > 0"
                            class="ui compact grid"
                            xstyle="background-color: #2a2a2a"
                          >
                            <div class="four wide column">
                              <div
                                id="modulesMenu"
                                class="ui vertical fluid tabular menu"
                                style="height: 100%"
                              >
                                <div
                                  v-show="hasTradeModule"
                                  class="item"
                                  :data-tab="tradeModuleTab"
                                  @click="activeTab = tradeModuleTab"
                                  style="
                                    xbackground-color: red;
                                    padding-left: 0.5rem;
                                    padding-right: 0.5rem;
                                  "
                                >
                                  Rebalance
                                </div>
                                <div
                                  v-show="hasFeeModule"
                                  class="item"
                                  :data-tab="feeModuleTab"
                                  @click="activeTab = feeModuleTab"
                                  style="
                                    xbackground-color: red;
                                    padding-left: 0.5rem;
                                    padding-right: 0.5rem;
                                  "
                                >
                                  <table style="border-spacing: 0; width: 100%">
                                    <tr>
                                      <td xstyle="background-color: blue">Management Fee</td>
                                      <td xstyle="background-color: green">
                                        <span
                                          class="ui text"
                                          :class="{ small: feeDisabled }"
                                          style="font-weight: 100 !important"
                                          :data-tooltip="
                                            feeDisabled
                                              ? 'Need to set a fee and a valid receiver'
                                              : undefined
                                          "
                                          data-position="bottom center"
                                          data-inverted=""
                                        >
                                          {{
                                            feeDisabled
                                              ? 'DISABLED'
                                              : formatPct(streamingFeePercentage, 2)
                                          }}
                                        </span>
                                      </td>
                                    </tr>
                                  </table>
                                </div>
                              </div>
                            </div>
                            <div class="twelve wide stretched column">
                              <div
                                class="ui tab segment"
                                style="margin: 0 !important; background-color: #2a2a2a"
                                :style="{ height: moduleTabHeightInPx }"
                                :data-tab="tradeModuleTab"
                              >
                                <p style="margin-right: 1.5rem">
                                  Ability to rebalance the fund changing its allocation (underlying
                                  assets and weights).
                                  <br />
                                  This will make the fund <b>dynamic</b>.
                                </p>
                                <a
                                  class="ui right corner label"
                                  style="
                                    border-color: transparent !important;
                                    margin: 0.5rem 0.5rem 0 0 !important;
                                  "
                                  href="https://dextf.notion.site/Rebalancing-Guide-FM-8387a8a0c34f4035b79fee2cc0037299"
                                  target="wiki"
                                >
                                  <i class="circular colored question small icon primary"></i>
                                </a>
                                <div class="ui bottom right attached label">
                                  v.
                                  {{ tradeModuleVersion }}
                                </div>
                              </div>
                              <div
                                class="ui tab segment"
                                style="margin: 0 !important; background-color: #2a2a2a"
                                :style="{ height: moduleTabHeightInPx }"
                                :data-tab="feeModuleTab"
                              >
                                <p style="margin-right: 1.5rem">
                                  Earn a <b>fee</b> as a percentage of the
                                  <b>total supply</b> (1/10<sup>th</sup> of which goes to the
                                  protocol).
                                  <br />
                                  The <b>fee</b> is accrued monthly (subject to gas costs).
                                </p>
                                <a
                                  class="ui right corner label"
                                  style="
                                    border-color: transparent !important;
                                    margin: 0.5rem 0.5rem 0 0 !important;
                                  "
                                  href="https://dextf.notion.site/Add-Management-Fees-Module-5c917bb48ac7440288d9660f00fd739f"
                                  target="wiki"
                                >
                                  <i class="circular colored question small icon primary"></i>
                                </a>
                                <div style="margin-top: 1.5rem">
                                  <StreamingFee
                                    :streaming-fee-percentage="streamingFeePercentage"
                                    :max-fee="maxFee"
                                    :receiver="receiver"
                                    :fund-token="fundToken"
                                    :pay-fee-with-dextf="payFeeWithDextf"
                                    @changed="streamingFeeChanged"
                                    v-if="activeTab === feeModuleTab"
                                  />
                                </div>
                                <div class="ui bottom right attached label">
                                  v.
                                  {{ streamingFeeModuleVersion }}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            v-show="selectedModules.length == 0"
                            class="ui placeholder segment center aligned"
                            style="border-radius: 8px; margin: 0; background-color: #2a2a2a"
                            :style="{
                              'min-height': moduleTabHeightInPx,
                              height: moduleTabHeightInPx
                            }"
                          >
                            <div id="addModulesIcon" style="margin-top: 2rem">
                              <i class="huge icons _pointer">
                                <i class="block layout icon"></i>
                                <i
                                  class="bottom right corner add icon primary"
                                  style="margin-right: -7px; margin-bottom: -7px"
                                  :style="{
                                    'text-shadow':
                                      '-1px -1px 0 #121212, 1px -1px 0 #121212, -1px 1px 0 #121212, 1px 1px 0 #121212 !important'
                                  }"
                                ></i>
                              </i>

                              <div class="_muted" style="margin: 0.5rem 0; font-weight: 400">
                                Add optional<br />modules
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div
                class="center aligned one wide column"
                style="background-color: #121212; padding: 0; border-left: 1px solid #2a2a2a"
              >
                <div
                  class="ui inverted vertical labeled icon menu"
                  style="xmargin: 0; font-size: 0.7rem !important; xbackground-color: red"
                >
                  <a
                    id="addAssetsMenuItem"
                    class="item"
                    :class="{ disabled: !canAddAssets }"
                    data-tooltip="Add new assets"
                    data-position="left center"
                    data-inverted=""
                  >
                    <i class="coins icon"></i>
                    Assets
                  </a>
                  <a
                    id="addModulesMenuItem"
                    class="item"
                    :class="{
                      disabled: missingModulesCount == 0
                    }"
                    data-tooltip="Add new modules"
                    data-position="left center"
                    data-inverted=""
                  >
                    <i class="block layout icon"></i>
                    Modules
                    <div
                      v-if="missingModulesCount > 0"
                      class="bottom floating ui mini circular label"
                      style="
                        padding-top: 0.2rem !important;
                        background-color: #1e1e1e;
                        border: 1px solid #7f7f7f;
                      "
                    >
                      {{ missingModulesCount }}
                    </div>
                  </a>
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

            <td style="white-space: nowrap; padding-left: 8px; min-width: 165px">
              <div
                class="ui fluid button"
                :class="{
                  primary: !canLaunch,
                  disabled: inProgress || inputIncomplete
                }"
                @click="save(false)"
              >
                Save
              </div>
            </td>

            <td
              v-if="canLaunch"
              style="white-space: nowrap; padding-left: 8px; min-width: 165px"
              :data-tooltip="isConnected ? undefined : 'Wallet not connected'"
              data-position="top center"
              data-inverted=""
            >
              <div
                class="ui fluid primary button"
                :class="{
                  disabled: inProgress || inputIncomplete || !isConnected
                }"
                @click="save(true)"
              >
                Save & Launch
              </div>
            </td>
          </tr>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import copy from 'copy-to-clipboard'
import numeral from 'numeral'
import BigNumber from 'bignumber.js'
import axios from 'axios'
import { Module } from '@helium'
import { utilsMixin } from '../mixins/utilsMixin.js'
import AssetTable from './AssetTable.vue'
import RiskSelector from './RiskSelector.vue'
import MessageBar from './MessageBar.vue'
import StreamingFee from './StreamingFee.vue'

export default {
  name: 'FundCreation',
  components: { AssetTable, RiskSelector, MessageBar, StreamingFee },
  mixins: [],
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
      copyAddressMessage: 'Copy to clipboard',
      activeTab: '',
      streamingFeePercentage: new BigNumber(0),
      maxFee: new BigNumber(3),
      receiver: this.$store.state.currentAccount.address,
      earnedFees: new BigNumber(0),
      payFeeWithDextf: true,
      lastStreamingFeeTimestamp: new BigNumber(999999),
      tradeModuleVersion: '1.0',
      streamingFeeModuleVersion: '1.0',
      assetItems: [],
      refreshingPrices: false,
      validations: {
        symbolNoPrefix: {
          active: false,
          function: utilsMixin.debounce(this.symbolNoPrefixValidation),
          validated: false,
          highlightError: false,
          apiCallInProgress: false
        },
        name: {
          active: false,
          function: this.nameValidation,
          validated: false
        },
        description: {
          active: false,
          function: this.descriptionValidation,
          validated: false
        },
        allocation: {
          active: false,
          function: this.allocationValidation,
          validated: false
        },
        totalPercentage: {
          active: false,
          // function: this.totalPercentageValidation,
          validated: false,
          highlightError: false
        }
      },
      inputIncomplete: true,
      symbolNoPrefix: '',
      searchText: '',
      allModules: [],
      messages: [],
      selectedAssetsStyles: {
        asset: {
          header: 'Asset',
          style: 'width: 100%; padding-left: 3.2rem; xbackground-color: yellow'
        },
        price24h: {
          header: '24h<br/>Price',
          style: 'min-width: 115px; width: 115px; xbackground-color: blue'
        },
        percentageInput: {
          header: '%<br/>Qty',
          style: 'min-width: 120px; width: 120px; xbackground-color: olive'
        }
      },
      assetsForCreationStyles: {
        asset: {
          header: 'Asset',
          style: 'width: 100%; padding-left: 3.2rem; xbackground-color: yellow'
        },
        address: {
          header: 'Address',
          style: 'min-width: 150px; width: 150px; xbackground-color: blue'
        },
        price24h: {
          header: '24h<br/>Price',
          style: 'min-width: 120px; width: 120px; xbackground-color: pink'
        }
      }
    }
  },
  computed: {
    fundPublicLink() {
      return `${location.origin}/fund-overview?network=${this.currentNetwork.chainId}&symbol=${this.fund.symbol}`
    },
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
      return this.gridHeight - 90
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
    moduleTabHeight() {
      return 230
    },
    moduleTabHeightInPx() {
      return this.moduleTabHeight + 'px'
    },
    moduleSidebarHeight() {
      return this.gridHeight - this.moduleTabHeight - 50
    },
    moduleSidebarHeightInPx() {
      return this.moduleSidebarHeight + 'px'
    },
    selectedAssetsTableHeight() {
      return this.gridHeight - 410
      // return this.gridHeight - this.textareaHeight - 303
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
    fundToken() {
      return this.symbolNoPrefix ? `${this.fund.symbol} (fund token)` : 'Fund token'
    },
    maxSymbolLength() {
      return 10 - this.$store.getters.fundSymbolPrefix.length
    },
    /*
    inputIncomplete() {
      if (this.messages.length > 0) return true

      console.log(
        'inputIncomplete-symbolNoPrefix: validated ?',
        this.validations.symbolNoPrefix.validated
      )
      console.log(
        'inputIncomplete-name: validated ?',
        this.validations.name.validated
      )
      console.log(
        'inputIncomplete-description: validated ?',
        this.validations.description.validated
      )
      console.log(
        'inputIncomplete-allocation: validated ?',
        this.validations.allocation.validated
      )
      console.log(
        'inputIncomplete-totalPercentage: validated ?',
        this.validations.totalPercentage.validated
      )

      return (
        !this.validations.symbolNoPrefix.validated ||
        !this.validations.name.validated ||
        !this.validations.description.validated ||
        !this.validations.allocation.validated ||
        !this.validations.totalPercentage.validated
      )
    },
    */
    noOfAssetsWithNoPercentage() {
      let i = 0
      this.selectedAssetItems.forEach((a) => {
        if (a.allocation.new.percentage == 0) i++
      })
      return i
    },
    selectedAssetItems() {
      return this.assetItems.filter((a) => a.selected)
    },
    prices() {
      return this.selectedAssetItems.map((a) => a.price)
    },
    percentages() {
      return this.selectedAssetItems.map((a) => new BigNumber(a.allocation.new.percentage).div(100))
    },
    totalPercentage() {
      let totalPercentage = this.percentages.reduce((a, b) => a.plus(b), new BigNumber(0))
      return totalPercentage.times(100)
    },
    canLaunch() {
      return !this.fund.launched && !this.fund.launching
    },
    canAddAssets() {
      return !this.fund.created && !this.fund.clonedFromV1
    },
    feeDisabled() {
      return this.streamingFeePercentage.eq(0) || !this.receiver
    },
    tradeModuleTab() {
      return `${Module.DextfTradeModule}Tab`
    },
    feeModuleTab() {
      return `${Module.StreamingFeeModule}Tab`
    },
    hasTradeModule() {
      return this.tradeModule !== undefined && this.tradeModule.selected
    },
    hasFeeModule() {
      return this.feeModule !== undefined && this.feeModule.selected
    },
    tradeModule() {
      return this.allModules.find((m) => m.name === Module.DextfTradeModule)
    },
    feeModule() {
      return this.allModules.find((m) => m.name === Module.StreamingFeeModule)
    },
    selectedModules() {
      return this.allModules.filter((m) => m.selected)
    },
    missingModulesCount() {
      return this.allModules.length - this.selectedModules.length
    }
  },
  watch: {},
  beforeCreate() {},
  created() {
    this.log(this.$options.name + '.created')
    console.time(this.$options.name + '.created')

    if (this.fund._ops == 'add') {
      this.fund.symbol = this.$store.getters.fundSymbolPrefix
    } else {
      if (this.fund.symbol.startsWith(this.$store.getters.fundSymbolPrefix)) {
        this.symbolNoPrefix = this.fund.symbol.substring(
          this.$store.getters.fundSymbolPrefix.length
        )
      } else {
        console.warn(
          'fund symbol',
          this.fund.symbol,
          'does not star with',
          this.$store.getters.fundSymbolPrefix
        )
      }
    }

    if (this.fund.visibleToInvestorsToggle === undefined) {
      this.fund.visibleToInvestorsToggle = true // Set the default visibleToInvestorsToggle
    }

    //
    // DextfTradeModule
    //

    this.allModules.push({
      name: Module.DextfTradeModule,
      selected: this.fund.hasDextfTradeModule, // || this.fund._ops == 'add',
      version: this.tradeModuleVersion,
      settings: {}
    })

    //
    // StreamingFeeModule
    //

    const tradeModuleSelected = this.fund.hasStreamingFeeModule // || this.fund._ops == 'add'

    if (tradeModuleSelected) {
      if (this.fund.hasStreamingFeeModule) {
        const feeModule = this.fund.modules.find((m) => m.name === Module.StreamingFeeModule)
        const feeSettings = feeModule.settings.streamingFeeSettings

        this.streamingFeePercentage = new BigNumber(feeSettings.streamingFeePercentage)
        this.receiver = feeSettings.receiver
        this.earnedFees = feeSettings.earnedFees
        this.payFeeWithDextf = feeSettings.payFeeWithDextf
        this.lastStreamingFeeTimestamp = feeSettings.lastStreamingFeeTimestamp
      }
    }

    this.allModules.push({
      name: Module.StreamingFeeModule,
      selected: tradeModuleSelected,
      version: this.streamingFeeModuleVersion,
      settings: {
        streamingFeeSettings: {
          streamingFeePercentage: this.streamingFeePercentage,
          maxStreamingFeePercentage: this.maxFee,
          receiver: this.receiver,
          earnedFees: this.earnedFees,
          payFeeWithDextf: this.payFeeWithDextf,
          lastStreamingFeeTimestamp: this.lastStreamingFeeTimestamp
        }
      }
    })

    if (this.selectedModules.length > 0) {
      this.activeTab = `${this.selectedModules[0].name}Tab`
    }

    // if (this.fund.symbol.length < 8) {
    //   // It's an new fund with no symbol, Initialize the prefix
    //   this.prefix = this.userSymbolPrefix
    //   this.fund.symbol = this.prefix
    // } else {
    //   // It's an existing fund, extract the prefix
    //   this.prefix = this.fund.symbol.substring(0, 7)
    // }

    // this.symbolNoPrefix = this.fund.symbol.substring(7)

    let assetItems = []

    this.$store.state.assets.forEach((asset) => {
      // Skip Yield, Option, Funds and disabled assets
      if (
        asset.category != 'Yield' &&
        asset.category != 'Option' &&
        asset.category != 'Fund' &&
        (asset.isDisabled === undefined || asset.isDisabled === false)
      ) {
        let allocation

        if (this.fund._ops == 'modify' && this.fund.created) {
          allocation = this.fund.allocation.current
          /*
          this.log(
            `${allocation.assets.length} assets: `,
            allocation.assets.reduce(
              (a, v) =>
                a + ', ' + v.unitQuantity.toString() + ` (${v.percentage}%)`,
              'current unitQuantities'
            )
          )
          */
        } else {
          allocation = this.fund.allocation.latest || this.fund.allocation.inception
          /*
          this.log(
            `${allocation.assets.length} assets: `,
            allocation.assets.reduce(
              (a, v) =>
                a + ', ' + v.unitQuantity.toString() + ` (${v.percentage}%)`,
              'latest unitQuantities'
            )
          )
          */
        }
        const found = allocation.assets.find((a) => a.symbol == asset.symbol)

        let price = new BigNumber(0)
        let percentage = 0
        let unitQuantity = new BigNumber(0)
        if (found) {
          price = asset.price
          percentage = found.percentage
          unitQuantity = found.unitQuantity
        }

        const item = {
          symbol: asset.symbol,
          image: asset.image,
          contract: asset.contract,
          description: asset.description,
          change24HourPct: asset.change24HourPct,
          coinGecko: asset.coinGecko,
          price: asset.price,
          selected: !!found,
          allocation: {
            new: {
              price: price,
              percentage: percentage,
              unitQuantity: unitQuantity,
              error: false
            }
          }
        }

        assetItems.push(item)
      }
    })

    this.assetItems = assetItems

    if (this.fund._ops == 'modify' && this.fund.created) {
      this.calculateTotalAndPct('new')
    }

    this.validations.symbolNoPrefix.active = true
    this.validations.name.active = this.fund.name !== ''
    this.validations.description.active = this.fund.description !== ''
    this.validations.allocation.active = this.selectedAssetItems.length > 0
    this.validations.totalPercentage.active = this.selectedAssetItems.length > 0 // && !this.fund.created

    /*
    console.log(
      'this.validations.symbolNoPrefix.active',
      this.fund.symbol,
      this.symbolNoPrefix,
      this.validations.symbolNoPrefix.active
    )
    */

    if (this.fund.symbol.length > 7) this.symbolNoPrefixValidation()
    if (this.validations.name.active && !this.fund.launched) this.nameValidation()
    if (this.validations.description.active) this.descriptionValidation()
    if (this.validations.allocation.active) this.allocationValidation()
    if (this.validations.totalPercentage.active) this.totalPercentageValidation()

    console.timeEnd(this.$options.name + '.created')
  },
  beforeMount() {},
  mounted() {
    this.log(this.$options.name + '.mounted')
    console.time(this.$options.name + '.mounted')

    // Fomantic UI Checkbox initialize
    $('#visibleToInvestorsToggle').checkbox({
      onChecked: () => {
        this.fund.visibleToInvestorsToggle = true
      },
      onUnchecked: () => {
        this.fund.visibleToInvestorsToggle = false
      }
    })
    $('#visibleToInvestorsToggle').checkbox(
      this.fund.visibleToInvestorsToggle ? 'check' : 'uncheck'
    )

    $('#modulesMenu .item').tab()

    if (this.selectedModules.length > 0) {
      $('#modulesMenu .item').tab('change tab', `${this.selectedModules[0].name}Tab`)
    }

    $('#addAssetSidebar')
      .sidebar({
        context: $('#centerContent'),
        dimPage: true,
        closable: true
      })
      .sidebar('setting', 'transition', 'push')
      .sidebar('attach events', '#addAssetsMenuItem', 'toggle')
      .sidebar('attach events', '#addAssetsIcon', 'toggle')

    $('#addModuleSidebar')
      .sidebar({
        context: $('#centerContent'),
        dimPage: true,
        closable: true
      })
      .sidebar('setting', 'transition', 'overlay')
      .sidebar('attach events', '#addModulesMenuItem', 'toggle')
      .sidebar('attach events', '#addModulesIcon', 'toggle')

    this.$refs.fundCreation.addEventListener('keyup', this.escapeHandler)

    this.$refs.symbolNoPrefix.addEventListener('keyup', this.validations.symbolNoPrefix.function)

    if (this.fund.launched) {
      // No validation needed: the name of an existing fund cannot be changed and whatever
      // the rules we had at the time of inception we cannot enforce new rules now)
      this.validations.name.validated = true
      this.validations.totalPercentage.validated = true
      this.evalStatus('mounted')
    } else {
      if (this.validations.name.active) {
        this.$refs.name.addEventListener('keyup', this.validations.name.function)
      } else {
        this.$refs.name.addEventListener('change', this.nameValidationActivator)
      }
    }

    this.$refs.description.addEventListener('keyup', this.validations.description.function)
    /*
    this.$refs.description.addEventListener('paste', (event) => {
      let paste = (event.clipboardData || window.clipboardData).getData('text')
      console.log('pasted', paste, this.fund.description)
      // const selection = window.getSelection();
      // if (!selection.rangeCount) return false;
      // selection.deleteFromDocument();
      // selection.getRangeAt(0).insertNode(document.createTextNode(paste));

      // event.preventDefault();
    })
    */

    const input = this.$refs.searchInput
    input.addEventListener(
      'keyup',
      utilsMixin.debounce(() => (this.searchText = input.value))
    )

    console.timeEnd(this.$options.name + '.mounted')
  },
  beforeUpdate() {},
  updated() {},
  beforeDestroy() {
    this.$refs.fundCreation.removeEventListener('keyup', this.escapeHandler)
    this.$refs.symbolNoPrefix.removeEventListener('keyup', this.validations.symbolNoPrefix.function)
    this.$refs.name.removeEventListener('change', this.nameValidationActivator)
    this.$refs.name.removeEventListener('keyup', this.validations.name.function)
    this.$refs.description.removeEventListener('keyup', this.validations.description.function)
  },
  destroyed() {
    this.log(this.$options.name + ' destroyed')
  },
  methods: {
    streamingFeeChanged(settings) {
      this.streamingFeePercentage = settings.streamingFeePercentage
      this.receiver = settings.receiver

      this.feeModule.settings.streamingFeeSettings.payFeeWithDextf = settings.payFeeWithDextf
      this.feeModule.settings.streamingFeeSettings.streamingFeePercentage =
        this.streamingFeePercentage
      this.feeModule.settings.streamingFeeSettings.receiver = this.receiver

      if (this.fund._ops == 'modify') {
        this.feeModule.settings.updatedFields = settings.updatedFields
      }

      const id = 'streamingFeeError'
      let message = this.messages.find((m) => m.id == id)
      let text = ''

      if (!this.receiver) {
        text = `Streaming Fee receiver is invalid`
      }

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

      this.evalStatus('streamingFeeChanged')
    },
    formatPrice(n) {
      if (isNaN(n)) return '-'

      let s
      if (n < 1000000) {
        s = numeral(n).format('0,0.[000]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.00a')
      }

      return `$${s == 'NaN' ? '0' : s}`
    },
    formatQuantity(n) {
      if (isNaN(n)) return '-'

      const precision = '0'.repeat(9)
      let s = numeral(n.toPrecision(precision.length)).format(`0,0.[${precision}]`)

      return s == 'NaN' ? '0' : s
    },
    formatPct(n, maxDecimals = 4) {
      if (isNaN(n)) return '-'

      return n == 0 ? '0%' : numeral(n).format(`0.[${'0'.repeat(maxDecimals)}]`) + '%'
    },
    async symbolNoPrefixValidation() {
      // this.log('symbolNoPrefixValidation')
      if (this.validations.symbolNoPrefix.active == false) {
        // Validation will start at the next change
        this.validations.symbolNoPrefix.active = true
        return
      }

      this.symbolNoPrefix = this.symbolNoPrefix.toUpperCase()
      this.fund.symbol = this.$store.getters.fundSymbolPrefix + this.symbolNoPrefix

      const id = 'symbolError'
      let message = this.messages.find((m) => m.id == id)
      let text = ''

      text = this.$store.getters.validateFundSymbol(this.fund.symbol)

      if (!text && this.fund._ops != 'modify') {
        // this.fundSymbolError = 'checking...'
        text = await this.fundSymbolExists()
      }

      this.validations.symbolNoPrefix.validated = !text
      this.evalStatus('symbolNoPrefixValidation')

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
    nameValidationActivator() {
      // this.log('nameValidationActivator')

      this.validations.name.active = true
      // Remove the activator
      this.$refs.name.removeEventListener('change', this.nameValidationActivator)
      // Start listening at every keystroke
      this.$refs.name.addEventListener('keyup', this.validations.name.function)
      // Trigger first validation
      this.nameValidation()
    },
    nameValidation() {
      // this.log('nameValidation')
      if (this.validations.name.active == false) {
        return
      }

      const id = 'nameError'
      let message = this.messages.find((m) => m.id == id)
      let text = ''

      if (!this.fund.name || this.fund.name.length > 32 || this.fund.name.length < 8) {
        text = 'The Name is <b>mandatory</b> (min 8, max 32 characters)'
      } else if (/^[\w\s\-\.\!']+$/.test(this.fund.name) === false) {
        text = "The Name can contain only <b>letters, numbers and the basic symbols '.-!_</b>"
      }

      this.validations.name.validated = !text
      this.evalStatus('nameValidation')

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
    descriptionValidation() {
      // this.log('descriptionValidation')
      if (this.validations.description.active == false) {
        // Validation will start at the next change
        this.validations.description.active = true
        return
      }

      const id = 'descriptionError'
      let message = this.messages.find((m) => m.id == id)
      let text = ''

      if (
        !this.fund.description
        // || this.countWords(this.fund.description) < 5
      ) {
        text = 'The Description is <b>mandatory</b>'
      }

      this.validations.description.validated = !text
      this.evalStatus('descriptionValidation')

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
    allocationValidation() {
      // this.log('allocationValidation')
      if (this.validations.allocation.active == false) {
        // Validation will start after the user has entered the first token
        if (this.selectedAssetItems.length > 0) {
          this.validations.allocation.active = true
        }
        return
      }

      const id = 'selectedAssetsError'
      let message = this.messages.find((m) => m.id == id)
      let text = ''

      if (this.selectedAssetItems.length < 2 || this.selectedAssetItems.length > 10) {
        text = 'Wrong allocation (min 2, max 10 tokens)'
      }

      this.validations.allocation.validated = !text
      this.evalStatus('allocationValidation')

      this.validations.allocation.highlightError = !this.validations.allocation.validated

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
    totalPercentageValidation() {
      // this.log('totalPercentageValidation')
      if (this.validations.totalPercentage.active == false) {
        // Validation will start after the user has entered the first token
        if (this.selectedAssetItems.length > 0) {
          this.validations.totalPercentage.active = true
        }
        return
      }

      this.descriptionValidation()

      const id = 'totalPercentageError'
      let message = this.messages.find((m) => m.id == id)
      let text = ''

      const n = this.noOfAssetsWithNoPercentage
      if (n > 0) {
        text = `${n} token${n > 1 ? 's' : ''} with <b>no allocation</b> %`
        // } else if (!this.totalPercentage.eq(100)) {
      } else if (this.totalPercentage.toFixed(2) != '100.00') {
        text = `Total allocation is ${this.formatPct(
          this.totalPercentage.toNumber()
        )}, must be <b>100%</b>`
      }

      this.validations.totalPercentage.validated = !text
      this.evalStatus('totalPercentageValidation')

      this.validations.totalPercentage.highlightError = !this.validations.totalPercentage.validated

      if (text) {
        if (message) {
          message.text = text
        } else {
          message = { id: id, text: text, type: 'error' }
          this.messages.splice(0, 0, message) // insert at index 0
        }

        this.resetUnitQuantities()
      } else {
        this.removeMessage(id)
        if (!this.fund.created) {
          this.refreshUnitQuantities('totalPercentageValidation')
        }
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
          new BigNumber(100) // Target price
        )

        result.data.fundUnits.forEach((u, i) => {
          const item = this.selectedAssetItems[i]
          item.allocation.new.error = false
          item.allocation.new.unitQuantity = u
        })
      }
    },
    calculateTotalAndPct(key) {
      let totalPrice = new BigNumber(0)
      this.selectedAssetItems.forEach((item) => {
        // Calculate the total as sum of the prices
        const allocation = item.allocation[key]
        if (allocation) {
          totalPrice = totalPrice.plus(allocation.unitQuantity.times(allocation.price))
        }
      })

      // console.log('totalPrice', totalPrice.toString(), this.fund)

      this.selectedAssetItems.forEach((item) => {
        // Calculate the percentage based on the price and total
        const allocation = item.allocation[key]
        if (allocation) {
          allocation.percentage =
            1 * allocation.unitQuantity.times(item.price).div(totalPrice).times(100).toFormat(4)
        }
      })
    },
    evalStatus(caller) {
      // this.log('evalStatus', caller)

      /*
      console.log('symbolNoPrefix:', this.validations.symbolNoPrefix.validated)
      console.log('name:', this.validations.name.validated)
      console.log('description:', this.validations.description.validated)
      console.log('allocation:', this.validations.allocation.validated)
      console.log(
        'totalPercentage:',
        this.validations.totalPercentage.validated
      )
*/
      this.inputIncomplete =
        // this.messages.length > 0 ||
        !this.validations.symbolNoPrefix.validated ||
        !this.validations.name.validated ||
        !this.validations.description.validated ||
        !this.validations.allocation.validated ||
        !this.validations.totalPercentage.validated

      if (!this.inputIncomplete && this.hasFeeModule) {
        const id = 'streamingFeeError'
        this.inputIncomplete = this.messages.some((m) => m.id == id)
      }
    },
    resetUnitQuantities() {
      // TO DO: look for a better way to do this
      // this.fund.assets.forEach((a) => {
      //   a.definition.unitQuantity = new BigNumber(0)
      // })
      this.selectedAssetItems.forEach((a) => {
        a.allocation.new.error = true
        a.allocation.new.unitQuantity = new BigNumber(0)
      })
    },
    addTradeModule() {
      this.tradeModule.selected = true
      this.activeTab = `${this.tradeModule.name}Tab`
      $('#modulesMenu .item').tab('change tab', this.activeTab)
      if (this.missingModulesCount == 0) {
        $('#addModuleSidebar').sidebar('toggle')
      }
    },
    addStreamingFeeModule() {
      this.feeModule.selected = true
      this.activeTab = `${this.feeModule.name}Tab`
      $('#modulesMenu .item').tab('change tab', this.activeTab)
      if (this.missingModulesCount == 0) {
        $('#addModuleSidebar').sidebar('toggle')
      }
    },
    removeMessage(id) {
      const i = this.messages.findIndex((m) => m.id == id)
      if (i >= 0) this.messages.splice(i, 1)
    },
    toggleAsset(symbol) {
      const asset = this.assetItems.find((a) => a.symbol == symbol)
      if (asset) {
        asset.selected = !asset.selected
        /*
        var i = this.selectedAssetItems.indexOf(asset)
        if (i < 0) {
          asset.unitQuantity = new BigNumber(0)
          this.selectedAssetItems.push(asset)
        } else {
          asset.unitQuantity = new BigNumber(0)
          this.selectedAssetItems.splice(i, 1)
        }
        asset.selected = i < 0
        */
      }

      this.allocationValidation()
      this.totalPercentageValidation()
    },
    changedPercentage(data) {
      const asset = this.assetItems.find((a) => a.symbol == data.symbol)
      if (asset) {
        asset.allocation.new.percentage = data.percentage.toNumber()
        this.totalPercentageValidation()
      }
    },
    isAssetForCreationVisible(symbol) {
      const asset = this.assetItems.find((a) => a.symbol == symbol)

      if (!asset) return false

      return asset.selected === false
    },
    isSelectedAssetVisible(symbol) {
      const asset = this.selectedAssetItems.find((a) => a.symbol == symbol)

      if (!asset) return false
    },
    async fundSymbolExists() {
      if (!this.symbolNoPrefix) {
        return ''
      }

      if (this.$store.getters.getFundBySymbol(this.fund.symbol)) {
        return 'This Symbol already exists'
      }

      let text

      try {
        this.validations.symbolNoPrefix.apiCallInProgress = true

        const response = await axios.get(this.$store.state.APIs.fundExists, {
          params: { symbol: this.fund.symbol }
        })

        text = response.data.fundExists ? 'This Symbol already exists' : ''
      } catch (err) {
        console.error(err)
        text = ''
      } finally {
        this.validations.symbolNoPrefix.apiCallInProgress = false
      }

      return text
    },
    countWords(input) {
      if (!input) return 0
      return input.split(/\s+/).length
    },
    save(launch) {
      this.log(this.$options.name, `save(${launch})`)

      // Copy selected assets to fund
      /*
      this.fund.assets = this.selectedAssetItems.map((a) => {
        return {
          symbol: a.symbol,
          percentage: a.allocation.new.percentage,
          definition: a
        }
      })
*/

      if (['add', 'modify'].includes(this.fund._ops)) {
        const allocation = this.selectedAssetItems.map((i) => ({
          symbol: i.symbol,
          percentage: i.allocation.new.percentage
        }))

        this.$emit(this.fund._ops, {
          allocation: allocation,
          modules: this.selectedModules.map((m) => ({
            name: m.name,
            version: m.version,
            settings: m.settings
          })),
          launch: launch
        })
      } else {
        console.error('Unknown operation!')
      }
    },
    escapeHandler(e) {
      e.stopPropagation()
      if (e.key === 'Escape' || e.key === 'Esc') {
        // console.log('FundCreation.keyup', e)
        this.emitClose()
      }
    },
    emitClose() {
      this.$emit('close')
    },
    copyTextToClipboard(txt2BCopied) {
      if (copy(txt2BCopied)) {
        this.copyAddressMessage = 'Copied!'
      }
      return false
    }
  }
}
</script>

<style scoped>
/* .input {
  max-height: 48px;
} */

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
