<template>
  <div xstyle="background-color: blue">
    <AppNav
      id="nav"
      :no-of-managed-funds="totalNoOfManagedFunds"
      :no-of-funds="investibleFunds.length"
      :no-of-tradeable-funds="tradeableFunds.length"
      :width-in-px="appNavWidthInPx"
      @heightSet="pusherHeightInPx = $event"
      @clicked="menuClicked($event)"
      :initial-tab="2"
    />

    <div
      :style="{ height: pusherHeightInPx }"
      Xstyle="background-color: red"
      _note="Push down - same as nav's height"
    ></div>

    <div
      v-if="showStatsPanel"
      class="ui vertical segment"
      style="margin-top: 1.2rem; margin-bottom: 3.6rem; xbackground-color: yellow"
    >
      <StatsPanel
        style="xbackground-color: pink; margin-left: auto; margin-right: auto"
        :style="{ width: statsPanelWidthInPx }"
      />
    </div>

    <div
      class="ui vertical segment"
      xstyle="background-color: #ff0000 !important"
      xxstyle="background-color: #121212"
    >
      <div
        id="centerPanel"
        style="
          xbackground-color: green !important;
          height: 100%;
          margin-left: auto;
          margin-right: auto;
        "
        :style="{
          width: centerPanelWidthInPx
        }"
      >
        <div
          id="fundDetailSidebar"
          class="ui right sidebar"
          xclass="ui very wide right sidebar"
          style="padding: 0.3rem 0 0 2rem; xbackground-color: yellow"
          :style="{ width: sideBarWidthInPx }"
        >
          <FundInfo
            v-if="$store.state.dappLoaded"
            :fund="sidebarFund"
            :show-launch-button="activeTabIs(1)"
            :show-rebalance-button="activeTabIs(1)"
            :show-edit-button="activeTabIs(1)"
            :show-view-button="activeTabIs(2) || activeTabIs(4)"
            style="height: 250px"
            @edit="openCreateModifyWizard(sidebarFund)"
            @rebalance="openRebalanceWizard(sidebarFund)"
            @reset="reset(sidebarFund)"
            @launch="launch(sidebarFund)"
          />
          <FundOperation
            v-if="isInvestor && $store.state.dappLoaded"
            v-show="activeTabIs(2) || activeTabIs(4)"
            xstyle="height: 571px"
            :height="571"
            :fund="sidebarFund"
            :init-tab="
              advancedMode ? (showRebalanceInfo ? 'rebalance' : 'mint-redeem') : 'buy-sell'
            "
            :show-tab="{
              buySell: true,
              mintRedeem: advancedMode,
              trade: advancedMode
            }"
            :enable-tab="{
              buySell: true,
              mintRedeem: advancedMode,
              trade: advancedMode && showRebalanceInfo
            }"
            @setDimmer="setDimmer($event.show, $event.closable, $event.msg)"
          />
          <FundDetails v-if="$store.state.dappLoaded" :fund="sidebarFund" style="height: 571px" />
          <FundLineChart :fund="sidebarFund" :suspended="!sideBarVisible" :height="432" />
        </div>

        <div class="pusher" style="xbackground-color: pink">
          <div
            id="fundsPanel"
            xclass="ui basic segment left floated"
            style="xbackground-color: blue; padding: 0"
            :style="{
              width: fundsPanelWidthInPx
            }"
          >
            <!--
              **************************************
              MENU
              **************************************
              -->
            <div v-show="actionMenuVisible" class="ui vertical segment">
              <div class="ui secondary menu" style="margin-left: 0; margin-right: 0">
                <div class="item">
                  <div class="ui left icon input" style="width: 400px">
                    <i class="search icon"></i>
                    <input
                      style="background-color: transparent !important"
                      :style="{
                        borderColor: searchText.length > 0 ? '#95FC70' : ''
                      }"
                      type="text"
                      placeholder="Search for a fund name, symbol or address"
                      ref="searchInput"
                    />
                  </div>
                </div>

                <!-- Right sub-menu -->
                <div class="right menu">
                  <div v-if="isFundManager" v-show="activeTabIs(1)" class="item">
                    <div class="field" _note="needed to size the button like the others">
                      <div
                        class="ui primary button"
                        :class="{
                          disabled: workInProgress || !connector || !isConnected || !isNetworkValid
                        }"
                        @click="openCreateModifyWizard()"
                      >
                        Create fund
                      </div>
                    </div>
                  </div>

                  <div v-show="activeTabIs(2) && isEthereum" class="item">
                    <div
                      id="modeToggleId"
                      class="ui toggle checkbox"
                      :class="{ disabled: workInProgress }"
                      style="margin-right: 2rem !important"
                    >
                      <input type="checkbox" name="toggle" id="toggle" />
                      <label for="toggle">Advanced</label>
                      <span>Simple</span>
                    </div>
                  </div>

                  <div class="item" style="margin-right: 1px">
                    <div class="ui icon basic buttons" style="border: none">
                      <div
                        class="ui button"
                        :class="{ disabled: workInProgress }"
                        :style="{
                          'padding-right': activeFilter > 0 ? '0.8rem' : undefined,
                          color: activeFilter > 0 ? '#95FC70' : undefined
                        }"
                        @click="showModal('#fundFiltersModalId')"
                        data-tooltip="Filters"
                        data-position="bottom right"
                        data-inverted=""
                      >
                        <i class="filter icon"></i>
                        <sub
                          class="ui text"
                          :style="{
                            'margin-left': activeFilter > 0 ? '-0.3rem' : undefined
                          }"
                        >
                          {{ activeFilter > 0 ? activeFilter : '' }}
                        </sub>
                      </div>
                      <div
                        class="ui button"
                        :class="{ disabled: workInProgress }"
                        @click="load(true)"
                        data-tooltip="Reload"
                        data-position="bottom right"
                        data-inverted=""
                      >
                        <i class="sync alternate icon"></i>
                      </div>
                    </div>
                  </div>

                  <!--
                  <div class="item">
                    <div
                      class="field"
                      _note="needed to size the button like the others"
                    >
                      <div
                        class="ui white basic inverted button"
                        :class="{ disabled: workInProgress }"
                        @click="load()"
                      >
                        Reload
                      </div>
                    </div>
                  </div>

                  <div class="item">
                    <div
                      class="field"
                      _note="needed to size the button like the others"
                    >
                      <div
                        class="ui white basic inverted button"
                        :class="{ disabled: workInProgress }"
                        @click="showModal('#fundFiltersModalId')"
                      >
                        Filters
                        {{ activeFilter > 0 ? '(' + activeFilter + ')' : '' }}
                      </div>
                    </div>
                  </div>
                  -->
                </div>
              </div>
            </div>

            <!--
              **************************************
              VIEWPORT
              **************************************
              -->
            <div
              class="ui vertical segment"
              style="xbackground-color: grey; margin: 0; margin-top: 1rem; width: 100%"
              :style="{
                height: viewportHeightInPx,
                'max-height': viewportHeightInPx,
                'overflow-y': smallDevice && activeTabIs(4) ? 'auto' : undefined
              }"
            >
              <!-- Manage -->
              <div
                v-show="activeTabIs(1)"
                xstyle="background-color: yellow"
                :style="{ height: tabHeightInPx }"
              >
                <div v-if="!isFundManager">
                  <div class="ui vertical segment" xstyle="background-color: orange">
                    <div class="ui fluid card _gradient1" xstyle="height: 220px">
                      <div class="content">
                        <div class="ui two column divided grid" style="height: 100%; margin: 0">
                          <div class="stretched row">
                            <div class="column">
                              <div
                                style="
                                  font-weight: 600;
                                  font-size: 36px;
                                  color: rgba(255, 255, 255, 0.87);
                                  line-height: 53px;
                                "
                              >
                                Create your funds with
                                <br />
                                <img
                                  src="/images/logo_long_dark.png"
                                  alt="DOMANI"
                                  style="width: 270px; xmargin-left: 1rem"
                                />
                                <!-- <span
                                  style="
                                    font-style: italic;
                                    font-weight: 400;
                                    color: white;
                                    padding: 0 0.5rem 0 0;
                                    border-top: 1px solid #6ce546;
                                    border-right: 1px solid #6ce546;
                                    border-bottom: 1px solid #6ce546;
                                  "
                                >
                                  V2
                                </span> -->
                              </div>
                            </div>
                            <div class="column" style="font-weight: 450; font-size: 16px">
                              <div
                                class="ui basic segment"
                                style="margin: 0; xbackground-color: red"
                              >
                                <span
                                  class="ui black circular label"
                                  style="
                                    font-weight: 600;
                                    font-size: 13px;
                                    color: #6ce546;
                                    border: 1px solid white;
                                  "
                                >
                                  1
                                </span>
                                &nbsp;Choose among <b>{{ $store.state.assets.length }}</b> different
                                assets
                              </div>
                              <div
                                class="ui basic segment"
                                style="margin: 0; xbackground-color: green"
                              >
                                <span
                                  class="ui black circular label"
                                  style="
                                    font-weight: 600;
                                    font-size: 13px;
                                    color: #6ce546;
                                    border: 1px solid white;
                                  "
                                >
                                  2
                                </span>
                                &nbsp;Manage your funds with active rebalancing
                              </div>
                              <div
                                class="ui basic segment"
                                style="margin: 0; xbackground-color: blue"
                              >
                                <span
                                  class="ui black circular label"
                                  style="
                                    font-weight: 600;
                                    font-size: 13px;
                                    color: #6ce546;
                                    border: 1px solid white;
                                  "
                                >
                                  3
                                </span>
                                &nbsp;Apply a management fee
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    class="ui vertical segment"
                    style="margin: 2rem 7rem 0 7rem; xbackground-color: blue"
                  >
                    <SignUpPanel
                      v-if="showSignUp"
                      style="height: 700px"
                      :busy="workInProgress"
                      @switchToLogIn="showSignUp = false"
                    />
                    <EmailConnectorPanel
                      v-show="!showSignUp"
                      :errors="emailLoginErrors"
                      :busy="workInProgress"
                      @connectEmail="connectEmail($event)"
                      @switchToSignUp="showSignUp = true"
                    />
                    <div class="ui divider"></div>
                    <h2 class="ui header" style="margin-top: 0.5rem">
                      <div class="sub header" style="text-align: center; line-height: 1.5">
                        By using the DOMANI ÐAPP you acknowledge having read the
                        <a
                          class="item"
                          :class="{ disabled: true }"
                          href="docs/DEXTF_Dapp_Beta_Disclaimer_v0.1.pdf"
                          target="disclaimer"
                          v-text="'Disclaimer'"
                        />
                        <br />
                        and agree with the
                        <a
                          href="docs/DEXTF_TC_v0.1.pdf"
                          target="tc"
                          v-text="'Terms and Conditions'"
                        />
                      </div>
                    </h2>
                  </div>
                </div>
                <div v-else>
                  <!-- Multiple tables for bigger screens -->
                  <div v-if="splitManagedFundsIntoMultipleTables" xstyle="background-color: orange">
                    <div
                      v-if="managedFunds.active.data.length > 0"
                      :style="{
                        'padding-top': managedFunds.active.style.paddingTop + 'px',
                        'padding-bottom': managedFunds.active.style.paddingBottom + 'px'
                      }"
                    >
                      <FundTable
                        :funds="managedFunds.active.data"
                        :mode="'Managed'"
                        :header="managedFunds.active.header"
                        :filters.sync="filters"
                        :initial-sort-options="sortOptions"
                        :search-text="searchText"
                        :selected="selectedFunds.get(1) ? selectedFunds.get(1).symbol : ''"
                        :styles="styles"
                        :height="managedFunds.active.style.tableHeight"
                        @sort="sortHeaderClicked($event)"
                        @filter="filterUpdated($event)"
                        @modify="openCreateModifyWizard($event)"
                        @launch="launch($event)"
                        @selected="selectFund($event)"
                        @cancelProposal="cancelProposal($event)"
                        @startTrading="startTrading($event)"
                        @closeTrading="closeTrading($event)"
                        @upgradeModule="openCreateModifyWizard($event)"
                      />
                    </div>

                    <div
                      v-if="managedFunds.pending.data.length > 0"
                      :style="{
                        'padding-top': managedFunds.pending.style.paddingTop + 'px',
                        'padding-bottom': managedFunds.pending.style.paddingBottom + 'px'
                      }"
                    >
                      <FundTable
                        :funds="managedFunds.pending.data"
                        :mode="'Managed'"
                        :header="managedFunds.pending.header"
                        :filters.sync="filters"
                        :initial-sort-options="sortOptions"
                        :search-text="searchText"
                        :selected="selectedFunds.get(1) ? selectedFunds.get(1).symbol : ''"
                        :styles="styles"
                        :height="managedFunds.pending.style.tableHeight"
                        @sort="sortHeaderClicked($event)"
                        @filter="filterUpdated($event)"
                        @modify="openCreateModifyWizard($event)"
                        @launch="launch($event)"
                        @selected="selectFund($event)"
                        @cancelProposal="cancelProposal($event)"
                        @startTrading="startTrading($event)"
                        @closeTrading="closeTrading($event)"
                        @upgradeModule="openCreateModifyWizard($event)"
                      />
                    </div>

                    <div
                      v-if="managedFunds.inactive.data.length > 0"
                      :style="{
                        'padding-top': managedFunds.inactive.style.paddingTop + 'px',
                        'padding-bottom': managedFunds.inactive.style.paddingBottom + 'px'
                      }"
                    >
                      <FundTable
                        :funds="managedFunds.inactive.data"
                        :mode="'Managed'"
                        :header="managedFunds.inactive.header"
                        :filters.sync="filters"
                        :initial-sort-options="sortOptions"
                        :search-text="searchText"
                        :selected="selectedFunds.get(1) ? selectedFunds.get(1).symbol : ''"
                        :styles="styles"
                        :height="managedFunds.inactive.style.tableHeight"
                        @sort="sortHeaderClicked($event)"
                        @filter="filterUpdated($event)"
                        @modify="openCreateModifyWizard($event)"
                        @launch="launch($event)"
                        @selected="selectFund($event)"
                        @cancelProposal="cancelProposal($event)"
                        @startTrading="startTrading($event)"
                        @closeTrading="closeTrading($event)"
                        @upgradeModule="openCreateModifyWizard($event)"
                      />
                    </div>
                  </div>

                  <!-- One single table for smaller screens -->
                  <div v-else xstyle="margin-bottom: 40px !important">
                    <FundTable
                      :funds="managedFunds.all.data"
                      :mode="'Managed'"
                      :header="managedFunds.all.header"
                      :filters.sync="filters"
                      :initial-sort-options="sortOptions"
                      :search-text="searchText"
                      :show-investor-visibility="true"
                      :selected="this.selectedFunds.get(1) ? this.selectedFunds.get(1).symbol : ''"
                      :styles="styles"
                      :height="managedFunds.all.style.tableHeight"
                      @sort="sortHeaderClicked($event)"
                      @filter="filterUpdated($event)"
                      @modify="openCreateModifyWizard($event)"
                      @launch="launch($event)"
                      @selected="selectFund($event)"
                      @cancelProposal="cancelProposal($event)"
                      @startTrading="startTrading($event)"
                      @closeTrading="closeTrading($event)"
                      @upgradeModule="openCreateModifyWizard($event)"
                    />
                  </div>
                </div>
              </div>

              <!-- Mint/Redeem -->
              <div
                v-if="isInvestor"
                v-show="activeTabIs(2)"
                xstyle="background-color: orange"
                :style="{ height: tabHeightInPx }"
              >
                <FundTable
                  :funds="investibleFunds"
                  :mode="'Investment'"
                  :show-rebalance-bar="advancedMode"
                  :filters.sync="filters"
                  :initial-sort-options="sortOptions"
                  :search-text="searchText"
                  :selected="selectedFunds.get(2) ? selectedFunds.get(2).symbol : ''"
                  :styles="styles"
                  :height="investibleFundsTableHeight"
                  @sort="sortHeaderClicked($event)"
                  @filter="filterUpdated($event)"
                  @invest="openInvestWizard(fund)"
                  @redeem="openRedeemWizard(fund)"
                  @selected="selectFund($event)"
                />
              </div>

              <!-- Marketplace -->
              <div
                v-if="isInvestor"
                v-show="activeTabIs(3)"
                xstyle="background-color: green"
                :style="{ height: tabHeightInPx }"
              >
                <FundTable
                  :funds="tradeableFunds"
                  :mode="'Trade'"
                  :filters.sync="filters"
                  :initial-sort-options="sortOptions"
                  :search-text="searchText"
                  :selected="selectedFunds.get(3) ? selectedFunds.get(3).symbol : ''"
                  :styles="styles"
                  :height="tradeableFundsTableHeight"
                  @sort="sortHeaderClicked($event)"
                  @filter="filterUpdated($event)"
                  @selected="selectFund($event)"
                />
              </div>

              <!-- Invested -->
              <InvestmentTab
                v-if="isInvestor"
                v-show="activeTabIs(4)"
                :investments="investments"
                :height="tabHeight"
                @setDimmer="setDimmer($event.show, $event.closable, $event.msg)"
              >
              </InvestmentTab>

              <!-- Admin Tab -->
              <AdminTab
                v-if="isAdmin"
                v-show="activeTabIs(5)"
                :height="tabHeight"
                :style="{ height: tabHeightInPx }"
                @accrue="accrueFee($event)"
              >
              </AdminTab>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!--
    **************************************
    MODALS
    **************************************
    -->

    <div
      id="fundFiltersModalId"
      class="ui top aligned modal"
      style="background-color: transparent; width: auto; box-shadow: none; border: none"
    >
      <FundFilters
        style="margin: 0 1rem"
        :initial-filters="filters"
        @filterUpdated="filterUpdated($event)"
        @close="hideModal('#fundFiltersModalId')"
      />
    </div>

    <!--
    <div
      id="fundCreationModalId"
      v-if="isFundManager"
      class="ui top aligned modal"
      style="background-color: transparent; width: auto"
    >
      <FundCreation
        xid="fundCreationId"
        style="width: 1005px"
        v-if="showCreation"
        :height="864"
        :fund="fund"
        @close="hideModal('#fundCreationModalId')"
      />
    </div>
    -->

    <!--
    **************************************
    TRANSITIONS
    **************************************
    -->

    <transition v-if="isFundManager" name="modal">
      <div class="modal-mask" v-show="showCreation">
        <div class="modal-wrapper">
          <FundCreation
            class="modal-container"
            v-if="showCreation"
            :height="Math.floor(Math.min(windowSize.height * 0.9, 1000))"
            :fund="fund"
            @close="showCreation = false"
            @add="addFund($event)"
            @modify="modifyFund($event)"
          />
        </div>
      </div>
    </transition>

    <transition v-if="isFundManager" name="modal">
      <div class="modal-mask" v-show="showRebalancing">
        <div class="modal-wrapper">
          <FundRebalance
            class="modal-container"
            v-if="showRebalancing"
            :height="Math.floor(Math.min(windowSize.height * 0.9, 1000))"
            :fund="fund"
            @close="showRebalancing = false"
            @broadcast="broadcastProposal($event)"
          />
        </div>
      </div>
    </transition>

    <template>
      <ChangePassword
        :id="'changePasswordModal'"
        :user="$store.state.user"
        :modal="true"
        :message="'Please, take a moment to set your own password.'"
        :forbidden-words="['domani', userFirstName.toLowerCase(), userFamilyName.toLowerCase()]"
        @changed="forcePasswordChangeCompleted()"
      />
    </template>

    <DimmerMessage
      :id="dimmerMessageId"
      :dimmer-message="dimmerMessage"
      :inverted-dimmer="invertedDimmer"
      :page-dimmer="true"
    />

    <div
      v-if="false"
      id="feedbackMessageId"
      class="ui info compact message"
      style="position: fixed; right: 10px; top: 0; z-index: 1000"
    >
      <i class="close icon" @click="closeFeedbackMessage()"></i>
      <div
        class="content _pointer"
        style="margin-right: 1rem"
        @click="goTo('https://feedback.dextf.com', 'dextf_feedback')"
      >
        <i class="comment dots outline icon"></i>
        Feedback
      </div>
    </div>
  </div>
</template>

<script>
import { utils as etherUtils } from 'ethers'
import axios from 'axios'
import numeral from 'numeral'
import { mapGetters } from 'vuex'
import BigNumber from 'bignumber.js'

import { FundState, Module, getSetAddedEventFromReceipt } from '@helium'

import { caseInsensitiveEquality } from '../modules/utils.js'
import { sizeHandlerMixin } from '../mixins/windowMixins.js'
import { blockchainMixin } from '../mixins/blockchainMixin.js'
import { fundMixin } from '../mixins/fundMixins.js'
import { utilsMixin } from '../mixins/utilsMixin.js'
import { API_KEY } from '../modules/cryptoPriceHelpers.js'
import { getData } from '../modules/uniswap'
import { CCC } from '../modules/ccc-streamer-utilities.js'
import AppNav from '../components/AppNav.vue'
import StatsPanel from '../components/StatsPanel.vue'
import FundCreation from '../components/FundCreation.vue'
import FundRebalance from '../components/FundRebalance.vue'
import FundFilters from '../components/FundFilters.vue'
import ChangePassword from '../components/ChangePassword.vue'
import DimmerMessage from '../components/DimmerMessage.vue'
import FundInfo from '../components/FundInfo.vue'
import FundOperation from '../components/FundOperation.vue'
import FundLineChart from '../components/FundLineChart.vue'
import FundTable from '../components/FundTable.vue'
import FundDetails from '../components/FundDetails.vue'
import InvestmentTab from '../components/InvestmentTab.vue'
import AdminTab from '../components/AdminTab.vue'
import SignUpPanel from '../components/SignUpPanel.vue'
import EmailConnectorPanel from '../components/EmailConnectorPanel.vue'

export default {
  name: 'CommandCentre',
  components: {
    AppNav,
    StatsPanel,
    FundCreation,
    FundRebalance,
    FundFilters,
    ChangePassword,
    DimmerMessage,
    FundInfo,
    FundOperation,
    FundLineChart,
    FundTable,
    FundDetails,
    InvestmentTab,
    AdminTab,
    SignUpPanel,
    EmailConnectorPanel
  },
  mixins: [sizeHandlerMixin, fundMixin, blockchainMixin],
  data() {
    return {
      dextfEthPoolApy: '',
      activeTab: 1,
      advancedMode: false,
      dimmerMessage: {},
      invertedDimmer: false,
      fundToInvestInto: null,
      buyOrder: null,
      sellOrder: null,
      fundToRedeem: null,
      showCreation: false,
      showRebalancing: false,
      socket: null,
      livePrices: false,
      fund: this.createNewFund(),
      modalDuration: 400,
      pusherHeightInPx: '60px',
      filtersOpen: false,
      sortOpen: false,
      copyAddressMessage: '',
      searchText: '',
      sidebarFund: undefined,
      selectedFunds: new Map(),
      sideBarVisible: false,
      showComposition: false,
      showButtons: false,
      connecting: false,
      showSignUp: false,
      emailLoginErrors: [],
      breakdownStyles1: {
        asset: {
          header: 'Fund',
          style: 'width: 100%; xbackground-color: yellow'
        },
        allocation: {
          header: 'Allocation',
          style: 'min-width: 120px; xbackground-color: blue'
        },
        quantity: {
          header: 'Balance',
          key: 'value',
          style: 'min-width: 120px; xbackground-color: pink'
        },
        wallet: {
          header: 'Value',
          style: 'min-width: 180px; xbackground-color: pink'
        }
      },
      breakdownStyles2: {
        asset: {
          header: 'Asset',
          style: 'width: 100%; xbackground-color: yellow'
        },
        allocation: {
          header: 'Allocation',
          style: 'min-width: 120px; xbackground-color: blue'
        },
        quantity: {
          header: 'Balance',
          key: 'value',
          style: 'min-width: 120px; xbackground-color: pink'
        },
        wallet: {
          header: 'Value',
          style: 'min-width: 180px; xbackground-color: pink'
        }
      },
      styles: [
        'min-width: 360px; width: 360px; xbackground-color: red',
        'min-width: 320px; xbackground-color: blue' + this.showComposition ? '; width: 100%' : '',
        'min-width: 165px; width: 165px; xbackground-color: yellow',
        'min-width: 115px; width: 115px; xbackground-color: orange',
        'min-width: 115px; width: 115px; xbackground-color: green',
        'width:100%; xmin-width: 145px; xwidth: 145px; xbackground-color: pink'
        // 'width: 145px; xbackground-color: orange'
        // 'width: 450px; xbackground-color: grey'
      ]
    }
  },
  computed: {
    ...mapGetters(['getFundBySymbol']),
    dimmerMessageId() {
      return `dimmerMessageId${this._uid}`
    },
    smallDevice() {
      return this.windowSize.height <= 1000
    },
    actionMenuVisible() {
      return (this.activeTabIs(1) && this.isFundManager) || this.activeTabIs(2)
    },
    broadcastToChannels() {
      return process.env.VUE_APP_REBALANCE_PROPOSAL_BROADCAST === 'true'
    },
    showStatsPanel() {
      if (this.isEthereum) {
        if (this.smallDevice) {
          return this.activeTabIs(2)
        } else {
          return this.actionMenuVisible
        }
      }
      return false
    },
    statsPanelWidth() {
      return 955 // 1320
    },
    statsPanelWidthInPx() {
      return this.statsPanelWidth + 'px'
    },
    sideBarWidth() {
      return 472
    },
    sideBarWidthInPx() {
      return this.sideBarWidth + 'px'
    },
    appNavWidth() {
      return 1395
    },
    appNavWidthInPx() {
      return this.appNavWidth + 'px'
    },
    centerPanelWidth() {
      if (this.sideBarVisible) {
        return 1395
      } else {
        return 955
      }
    },
    centerPanelWidthInPx() {
      return this.centerPanelWidth + 'px'
    },
    fundsPanelWidth() {
      if (this.sideBarVisible) {
        return this.centerPanelWidth - this.sideBarWidth
      } else {
        return this.centerPanelWidth
      }
    },
    fundsPanelWidthInPx() {
      return this.fundsPanelWidth + 'px'
    },
    safeVerticalGapHeight() {
      // This corresponds to the AppNav menu height
      return 110
    },
    statsPanelHeight() {
      return this.showStatsPanel ? 90 : 0
    },
    actionMenuHeight() {
      return this.actionMenuVisible ? 125 : 0
    },
    viewportHeight() {
      return (
        this.windowSize.height -
        this.statsPanelHeight -
        this.actionMenuHeight -
        this.safeVerticalGapHeight
      )
    },
    viewportHeightInPx() {
      return this.viewportHeight + 'px'
    },
    tabHeight() {
      return this.viewportHeight
    },
    tabHeightInPx() {
      return this.tabHeight + 'px'
    },
    splitManagedFundsIntoMultipleTables() {
      return false
      // return this.windowSize.height >= 1080
    },
    investibleFundsTableHeight() {
      return this.tabHeight
    },
    tradeableFundsTableHeight() {
      return this.tabHeight
    },
    investedBreakdownHeight() {
      return 600
    },
    investedBreakdownHeightInPx() {
      return this.investedBreakdownHeight + 'px'
    },
    investedFundsTableHeight() {
      // return this.tabHeight - this.investedBreakdownHeight - 10
      // let h = this.investedFunds.length >
      return !this.smallDevice ? 250 : 0
    },
    totalNoOfManagedFunds() {
      return this.managedFunds.all.data.length
    },
    filters() {
      return this.$store.state.options.filters
    },
    sortOptions() {
      return this.$store.state.options.sortOptions
    },
    activeTabSelectedFund() {
      if (this.activeTab > -1) {
        return this.selectedFunds.get(this.activeTab)
      }
      return undefined
    },
    sortFunction() {
      let val0 = this.sortOptions.order === 'asc' ? 1 : -1
      let val1 = this.sortOptions.order === 'desc' ? 1 : -1
      if (this.sortOptions.by === 'Symbol') {
        return function (a, b) {
          if (a.symbol > b.symbol) return val0
          else if (a.symbol < b.symbol) return val1
          return 0
        }
      } else if (this.sortOptions.by === 'Name') {
        return function (a, b) {
          if (a.name > b.name) return val0
          else if (a.name < b.name) return val1
          return 0
        }
      } else if (this.sortOptions.by === 'Risk') {
        return function (a, b) {
          if (a.risk > b.risk) return val0
          else if (a.risk < b.risk) return val1
          return 0
        }
      } else if (this.sortOptions.by === 'Price') {
        return function (a, b) {
          if (a.currentPrice().gt(b.currentPrice())) return val0
          else if (a.currentPrice().lt(b.currentPrice())) return val1
          return 0
        }
      } else if (this.sortOptions.by === 'AUM') {
        return function (a, b) {
          if (a.aum().gt(b.aum())) return val0
          else if (a.aum().lt(b.aum())) return val1
          return 0
        }
      }
      // Launch Date
      return function (a, b) {
        const aStr = isNaN(Date.parse(a.launchDate)) ? '' : a.launchDate
        const bStr = isNaN(Date.parse(b.launchDate)) ? '' : b.launchDate
        if (aStr > bStr) return val0
        else if (aStr < bStr) return val1
        return 0
      }
    },
    sortedFunds() {
      let temp = [...this.$store.state.funds]
      return temp.sort(this.sortFunction)
    },
    managedFunds() {
      const obj = {
        totalGroups: 0,
        totalLength: 0,
        all: {
          header: '',
          data: [],
          length: 0,
          style: {
            paddingTop: 0,
            paddingBottom: 0,
            tableHeight: this.tabHeight
          }
        }
      }

      if (this.isFundManager && this.$store.state.funds) {
        // All
        const all = this.sortedFunds.filter(
          (f) => f.fundManagerEmail == this.$store.state.user.userId
        )

        obj.all.length = all.length
        obj.all.data = all

        if (this.splitManagedFundsIntoMultipleTables) {
          // Active
          const active = this.sortedFunds.filter((f) => {
            if (f.fundManagerEmail == this.$store.state.user.userId) {
              // visible to investors and launched
              return f.visibleToInvestors && f.launched
            }
            return false
          })
          // active.splice(0, active.length) // TO TEST:

          obj.active = {
            header: 'Active',
            length: active.length,
            data: active,
            style: {
              paddingTop: 0,
              paddingBottom: 0,
              tableHeight: 0
            }
          }

          // Pending
          const pending = this.sortedFunds.filter((f) => {
            if (f.fundManagerEmail == this.$store.state.user.userId) {
              // ready to launch OR launching
              return !f.launched || f.launching
            }
            return false
          })
          // pending.splice(0, pending.length) // TO TEST:

          obj.pending = {
            header: 'Pending',
            length: pending.length,
            data: pending,
            style: {
              paddingTop: 0,
              paddingBottom: 0,
              tableHeight: 0
            }
          }

          // Inactive
          const inactive = this.sortedFunds.filter((f) => {
            if (f.fundManagerEmail == this.$store.state.user.userId) {
              // Not visible to investors
              return !f.visibleToInvestors
            }
            return false
          })
          // inactive.splice(0, inactive.length) // TO TEST:

          obj.inactive = {
            header: 'Inactive',
            length: inactive.length,
            data: inactive,
            style: {
              paddingTop: 0,
              paddingBottom: 0, // always 0, because it's the last group
              tableHeight: 0
            }
          }

          // Set paddings
          const nOfGroups =
            (obj.active.length > 0) + (obj.pending.length > 0) + (obj.inactive.length > 0)

          if (obj.active.length > 0 && nOfGroups > 1) {
            obj.active.style.paddingBottom = 20
          }

          if (obj.pending.length > 0 && obj.inactive.length > 0) {
            obj.inactive.style.paddingTop = 20
          }

          // Set heights

          // Equal heights (minus the individual paddings)
          /*
          obj.active.style.tableHeight = Math.round(
            this.viewportHeight / nOfGroups -
              obj.active.style.paddingTop -
              obj.active.style.paddingBottom
          )
          obj.pending.style.tableHeight = Math.round(
            this.viewportHeight / nOfGroups -
              obj.pending.style.paddingTop -
              obj.pending.style.paddingBottom
          )
          obj.inactive.style.tableHeight = Math.round(
            this.viewportHeight / nOfGroups -
              obj.inactive.style.paddingTop -
              obj.inactive.style.paddingBottom
          )
          */

          // Currently both a row and a header are approx 85px each
          // const totRowsAtCurrentHeight = Math.floor(this.viewportHeight / 85)

          if (obj.active.length > 0 && nOfGroups > 1) {
            obj.active.style.tableHeight = Math.round(
              this.viewportHeight * 0.45 -
                obj.active.style.paddingTop -
                obj.active.style.paddingBottom
            )
          } else {
            obj.active.style.tableHeight = Math.round(
              this.viewportHeight - obj.active.style.paddingTop - obj.active.style.paddingBottom
            )
          }

          if (obj.pending.length > 0 && nOfGroups > 1) {
            if (nOfGroups == 2) {
              obj.pending.style.tableHeight = Math.round(
                this.viewportHeight * 0.275 -
                  obj.pending.style.paddingTop -
                  obj.pending.style.paddingBottom
              )
            } else {
              obj.pending.style.tableHeight = Math.round(
                this.viewportHeight * 0.275 -
                  obj.pending.style.paddingTop -
                  obj.pending.style.paddingBottom
              )
            }
          } else {
            obj.pending.style.tableHeight = Math.round(
              this.viewportHeight - obj.pending.style.paddingTop - obj.pending.style.paddingBottom
            )
          }

          if (obj.inactive.length > 0 && nOfGroups > 1) {
            if (nOfGroups == 2) {
              obj.inactive.style.tableHeight = Math.round(
                this.viewportHeight * 0.275 -
                  obj.inactive.style.paddingTop -
                  obj.inactive.style.paddingBottom
              )
            } else {
              obj.inactive.style.tableHeight = Math.round(
                this.viewportHeight * 0.275 -
                  obj.inactive.style.paddingTop -
                  obj.inactive.style.paddingBottom
              )
            }
          } else {
            obj.inactive.style.tableHeight = Math.round(
              this.viewportHeight - obj.inactive.style.paddingTop - obj.inactive.style.paddingBottom
            )
          }

          // console.log('active', obj.active.style.tableHeight)
          // console.log('pending', obj.pending.style.tableHeight)
          // console.log('inactive', obj.inactive.style.tableHeight)
        }
      }

      return obj
    },
    /*
    managedFundsActive() {
      if (this.isFundManager && this.$store.state.funds) {
        return this.sortedFunds.filter((f) => {
          if (f.fundManagerEmail == this.$store.state.user.userId) {
            // visible to investors and launched
            return f.visibleToInvestors && f.launched
          }
          return false
        })
      }
      return []
    },
    managedFundsPending() {
      if (this.isFundManager && this.$store.state.funds) {
        return this.sortedFunds.filter((f) => {
          if (f.fundManagerEmail == this.$store.state.user.userId) {
            // ready to launch OR launching
            return !f.launched || f.launching
          }
          return false
        })
      }
      return []
    },
    managedFundsInactive() {
      if (this.isFundManager && this.$store.state.funds) {
        return this.sortedFunds.filter((f) => {
          if (f.fundManagerEmail == this.$store.state.user.userId) {
            // Not visible to investors
            return !f.visibleToInvestors
          }
          return false
        })
      }
      return []
    },
    */
    investibleFunds() {
      if (this.isInvestor && this.$store.state.funds) {
        return this.sortedFunds.filter((f) => {
          return (f.canInvest || f.canRedeem || f.uniswap) && (this.advancedMode || f.isTop)
        })
      }
      return []
    },
    tradeableFunds() {
      if (this.isInvestor && this.$store.state.funds) {
        return this.sortedFunds.filter(
          (f) => f.takerBuyPositions.length > 0 || f.takerSellPositions.length > 0
        )
      }
      return []
    },
    investedFunds() {
      if (
        this.isInvestor &&
        this.$store.state.funds
        // this.$store.state.currentAccount !== '0x'
      ) {
        return this.sortedFunds.filter((f) => f.balance.gt(0))
      }
      return []
    },
    investments() {
      const investments = {
        overviewData: [],
        total: {
          usd: new BigNumber(0),
          eth: new BigNumber(0),
          btc: new BigNumber(0)
        },
        funds: [],
        assets: []
      }

      if (this.$store.state.dappLoaded && this.isInvestor && this.$store.state.funds) {
        const uniqueAssetTokens = new Map()

        let step = this.investedFunds.length > 0 ? 1 / this.investedFunds.length : 1
        let i = 1

        this.investedFunds.forEach((f) => {
          const token = {
            symbol: f.symbol,
            description: f.description,
            color: `rgba(${this.$store.state.primaryColor.rgb}, ${i * step})`,
            image: f.image,
            value: f.balance,
            balance: f.balance.times(f.currentPrice())
          }

          investments.funds.push(token)

          investments.total.usd = investments.total.usd.plus(token.balance)

          const allocation = f.allocation.current.assets

          allocation.forEach((a) => {
            let token = uniqueAssetTokens.get(a.symbol)
            if (!token) {
              const assetDef = this.$store.getters.getAssetBySymbol(a.symbol)
              token = {
                symbol: assetDef.symbol,
                description: assetDef.description,
                color: assetDef.color,
                image: assetDef.image,
                value: new BigNumber(0),
                price: assetDef.price,
                balance: new BigNumber(0)
              }
              uniqueAssetTokens.set(a.symbol, token)
            }

            token.value = token.value.plus(f.balance.times(a.unitQuantity))
          })

          i++
        })

        investments.total.eth = investments.total.usd.div(
          this.$store.state.currentAccount.cryptos.WETH.priceUSD
        )
        investments.total.btc = investments.total.usd.div(
          this.$store.state.currentAccount.cryptos.WBTC.priceUSD
        )

        investments.funds.forEach((token) => {
          token.percentage = token.balance.div(investments.total.usd).times(100).sd(4).toNumber()
        })

        uniqueAssetTokens.forEach((value, key) => investments.assets.push(value))

        investments.assets.forEach((token) => {
          token.balance = token.value.times(token.price)
          token.percentage = token.balance.div(investments.total.usd).times(100).sd(4).toNumber()
        })
      }

      investments.overviewData.push({
        header: 'Number of funds',
        text: `<div
                style="font-size: 36px; font-weight: 450"
              >
                <span
                  class="ui text primary"
                  style="line-height: inherit"
                >
                  ${investments.funds.length}&nbsp;
                </span>
              </div>`
      })

      return investments
    },
    needToChangePassword() {
      // Use a computed property to avoid errors during a logout when this.$store.state.user becomes undefined
      return this.$store.state.user && this.$store.state.user.needToChangePassword
    },
    userFirstName() {
      if (this.$store.state.user) {
        return this.$store.state.user.firstName || ''
      }
      return ''
    },
    userFamilyName() {
      if (this.$store.state.user) {
        return this.$store.state.user.familyName || ''
      }
      return ''
    },
    showRebalanceInfo() {
      return (
        this.sidebarFund &&
        this.sidebarFund.canRebalance &&
        this.sidebarFund.rebalance.state !== 'Error' &&
        this.sidebarFund.rebalance.state !== 'Regular'
      )
    },
    activeFilter() {
      if (this.filters.cnt < 0) {
        // Will never happen, just to make it reactive
        return 0
      }

      let cnt = 0
      if (this.filters.invested) {
        cnt++
      }
      if (this.filters.favourite) {
        cnt++
      }
      if (this.filters.uniswap) {
        cnt++
      }
      if (this.filters.kyber) {
        cnt++
      }
      if (this.filters.assets.length > 0 || this.filters.myTokens) {
        cnt++
      }
      if (this.filters.inactive) {
        cnt++
      }
      for (var i = 0; i < this.filters.risks.length; i++) {
        if (this.filters.risks[i] == false) {
          cnt++
          break
        }
      }
      return cnt
    },
    managedModules() {
      // For now, 3 modules are managed on our Dapp
      return [Module.IssuanceModule, Module.DextfTradeModule, Module.StreamingFeeModule]
    }
    /*
    ,selectedFundSymbol() {
      return this.activeTabSelectedFund ? this.activeTabSelectedFund.symbol : ''
    }*/
  },
  watch: {
    currentNetwork(newValue, oldValue) {
      console.log('currentNetwork changed (old > new)', oldValue, '>', newValue)
    },
    currentAddress(newValue, oldValue) {
      console.log('currentAddress changed (old > new)', oldValue, '>', newValue)
      if (!this.connecting && !this.isEthereum && !caseInsensitiveEquality(newValue, oldValue)) {
        // eslint-disable-next-line
        console.log(this.connector, 'Reloading...')
        window.location.reload()
        // Note: if we change the backend GCP functions and DO NOT check for the session
        // we could simply call this.load(true) passing the user account as userId
      }
    }
  },
  created() {
    this.log(this.$options.name + ' created')
    this.initCopyAddressMessage()

    this.activeTab = 2

    /*
    if (this.isFundManager) {
      this.activeTab = 1
    } else {
      if (this.investedFunds.length > 0) {
        this.activeTab = 4
      } else {
        this.activeTab = 2
      }
    }
    */

    // activeTab = 1 - managed
    this.selectedFunds.set(1, undefined)
    // activeTab = 2 - investible
    this.selectedFunds.set(2, undefined)
    // activeTab = 3 - tradeable
    this.selectedFunds.set(3, undefined)
    // activeTab = 4 - invested
    this.selectedFunds.set(4, undefined)

    if (this.isEthereum) {
      this.$store.dispatch('reloadCookies').then(() => {
        this.advancedMode = this.$store.state.options.userMode === 'advanced'
        $('#modeToggleId').checkbox(this.advancedMode ? 'check' : 'uncheck')
      })
    } else {
      this.advancedMode = true
    }
  },
  mounted() {
    this.log(this.$options.name + ' mounted')
    if (!this.loggedIn) {
      return
    }

    console.time(this.$options.name + ' mounted')

    // Initialize Search Input listener (use debounce for the keyUp)
    this.$refs.searchInput.addEventListener('keydown', this.searchInputKeyDown)
    this.$refs.searchInput.addEventListener('keyup', (e) =>
      utilsMixin.debounce(this.searchInputKeyUp(e), 300)
    )

    // Initialize Semantic UI jquery:
    // if (this.needToChangePassword) {
    $('#changePasswordModal')
      .modal({
        centered: false,
        duration: this.modalDuration,
        onApprove: function () {
          // returns false to prevent the modal from closing
          return false
        }
      })
      .modal('setting', 'closable', false)
    // .modal('setting', 'transition', 'horizontal flip')
    // .modal('show')
    // }

    /*
    $('#fundCreationModalId')
      .modal({
        duration: this.modalDuration
      })
      .modal('setting', 'closable', false)
    // .modal('setting', 'transition', 'horizontal flip')
    */

    $('#fundFiltersModalId')
      .modal({
        duration: this.modalDuration
      })
      .modal('setting', 'closable', false)
    // .modal('setting', 'transition', 'horizontal flip')

    // Sidebar for fund details
    $('#fundDetailSidebar')
      .sidebar({
        context: $('#centerPanel'),
        dimPage: false,
        closable: false,
        onHide: () => {
          this.sideBarVisible = false
        },
        onVisible: () => {
          this.sideBarVisible = true
        }
      })
      .sidebar('setting', 'transition', 'overlay')

    $('#modeToggleId').checkbox({
      onChecked: () => {
        this.advancedMode = true
        this.selectFund(undefined)
        this.$store.dispatch('updateOptionsValues', { userMode: 'advanced' })
      },
      onUnchecked: () => {
        this.advancedMode = false
        this.selectFund(undefined)
        this.$store.dispatch('updateOptionsValues', { userMode: 'simple' })
      }
    })

    // No more required to fetch Gas Options with V2
    // this.$store.dispatch('fetchGasOptions')

    this.load()

    // for DEXT-ETH pool add liquidity button
    const promises = []

    let apiDomain = 'https://api.dextf.com/dp'
    promises.push(axios.get(apiDomain + '/token/supply/total'))
    promises.push(axios.get(apiDomain + '/token/airdrop/daily'))

    let token = { supply: { total: 0 }, airdrop: { daily: 0 } }

    Promise.all(promises)
      .then((responses) => {
        // console.log('responses', responses)
        token.supply.total = responses[0].data
        token.airdrop.daily = responses[1].data
      })
      .catch((err) => {
        console.error(err)
      })
      .finally(() => {
        getData(token.airdrop.daily, token.supply.total)
          .then((res) => {
            this.dextfEthPoolApy = numeral(res.apr).format('0,0')
          })
          .catch((err) => {
            console.error('Getting APR failed', err)
          })
      })

    console.timeEnd(this.$options.name + ' mounted')
  },
  beforeDestroy() {
    // Remove the listeners
    this.$refs.searchInput.removeEventListener('keydown', this.searchInputKeyDown)
    this.priceStreamer(false)
  },
  methods: {
    async test(checkForButton = false) {
      if (checkForButton) {
        // Return false to hide the button
        return !this.isProductionEnvironment
      }

      // Code to test here:
      /*
      const transactionAddress =
        '0xcc699fd24fc8cf8afcddd0939ab04d0edf8705c2674bed0778d560244a7acc0f'
      const totalTimeoutInMillis = 1000 // 1 secs
      const statusResult = await this.connector.waitForTransaction(
        transactionAddress,
        1,
        totalTimeoutInMillis
      )
      */
      // console.log(statusResult)

      /*
      const txAddresses = [
        '0xef000bc4e5dd4d95439a167879529abf31860a7faf14875a1f4eab48e6ba7568',
        '0x138f93d389bc65adc611a0a4a39e01ac91a375c76da2e9090afbbc3139e8b812'
      ]
      Promise.all(
        txAddresses.map((a) => this.connector.web3.eth.getTransactionReceipt(a))
      ).then((results) => {
        results.forEach((r) =>
          this.log(
            r && r.status ? r.transactionHash + '|' + r.gasUsed : 'failed'
          )
        )
      })
      */
    },
    formatQuantity(n, limit = 1000000) {
      if (isNaN(n)) return '-'

      // numeral returns NaN for numbers with precision less than 10^-6
      if (Math.abs(n) < 0.000001) {
        return '0'
      }

      let s
      if (n < limit) {
        s = numeral(n).format('0,0.000')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.00a')
      }
      return s == 'NaN' ? '0' : s
    },
    formatWallet(n, limit = 1000000) {
      if (isNaN(n)) return '-'

      // numeral returns NaN for numbers with precision less than 10^-6
      if (Math.abs(n) < 0.000001) {
        return '$0'
      }

      let s
      if (n < limit) {
        s = numeral(n).format('0,0.00')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.00a')
      }
      return s == 'NaN' ? '0' : '$' + s
    },
    initCopyAddressMessage() {
      this.copyAddressMessage = 'Copy fund data to clipboard'
    },
    /*
    copyDataToClipoard(checkForButton = false) {
      if (checkForButton) {
        // Return false to hide the button
        return this.isAdmin
      }

      let data = ''
      const tab = String.fromCharCode(9)
      const lf = String.fromCharCode(10)
      const fetchTimestamp = new Date().toISOString()

      data += 'Symbol'
      data += tab
      data += 'Address'
      data += tab
      data += 'Timestamp'
      data += tab
      data += 'Price'
      data += tab
      data += 'Category'
      data += tab
      data += 'Note'
      data += lf

      // Major tokens
      const tokens = ['DEXTF', 'WETH', 'WBTC', 'USDC']
      tokens.forEach((symbol) => {
        const token = this.$store.getters.getAssetBySymbol(symbol)
        data += symbol
        data += tab
        data += token.contract
        data += tab
        data += fetchTimestamp
        data += tab
        data += token.price
        data += tab
        data += 'Token'
        data += tab
        data += lf
      })

      // Funds
      this.investibleFunds.forEach((f) => {
        data += f.symbol
        data += tab
        data += f.address
        data += tab
        data += fetchTimestamp
        data += tab
        data += f.currentPrice().toFixed(5)
        data += tab
        data += 'Fund'
        data += tab
        data += f.allocation.current.assets.some((a) => a.symbol == 'DEXTF')
          ? 'fund_with_dextf'
          : 'fund_without_dextf'
        data += lf
      })
      if (copy(data)) {
        this.copyAddressMessage = 'Copied!'
      }
    },
    */
    showErrorModal() {
      $('#errors')
        .modal({
          inverted: true,
          onApprove: function () {
            this.log('Approved!')
          }
        })
        .modal('show')
    },
    showModal(id) {
      $(id).modal('show')
    },
    hideModal(id) {
      $(id).modal('hide')
    },
    async openCreateModifyWizard(fund) {
      if (!this.connector) {
        this.log('not connected')
        return
      }

      if (fund) {
        await this.$store.dispatch('updateFundCurrentAllocation', fund.symbol)

        // Make a clone of the selected fund (detached from the Store's fund list)
        this.fund = this.cloneFund(this.$store.state, fund)
        this.fund._ops = 'modify'
      } else {
        this.fund = this.createNewFund(this.$store.state, true)
        this.fund._ops = 'add'
      }

      if (!this.fund) return

      this.$store.dispatch('setWorkInProgress', true)

      console.time('openCreateModifyWizard.fetchCurrentAssetPrices')

      this.$store
        .dispatch('fetchCurrentAssetPrices', {
          fetchFullData: true,
          caller: this.$options.name + '.created'
        })
        .finally(() => {
          this.$store.dispatch('setWorkInProgress', false)

          if (this.fund._ops == 'add') this.triggerGAEvent('new_fund_start')
          else this.triggerGAEvent('modify_fund_start')

          this.showCreation = true
          // this.showModal('#fundCreationModalId')

          console.timeEnd('openCreateModifyWizard.fetchCurrentAssetPrices')
        })
    },
    openRebalanceWizard(fund) {
      if (!this.connector) {
        this.log('not connected')
        return
      }

      this.fund = fund

      if (!this.fund) return

      this.$store.dispatch('setWorkInProgress', true)

      console.time('openRebalanceWizard.fetchCurrentAssetPrices')

      this.$store
        .dispatch('fetchCurrentAssetPrices', {
          fetchFullData: true,
          caller: this.$options.name + '.created'
        })
        .finally(() => {
          this.$store.dispatch('setWorkInProgress', false)

          this.triggerGAEvent('rebalance_fund_start')

          this.showRebalancing = true

          console.timeEnd('openRebalanceWizard.fetchCurrentAssetPrices')
        })
    },
    priceStreamer(goLive) {
      // Refer to https://github.com/cryptoqween/cryptoqween.github.io and specifically
      // the 'Current streamer example' (https://cryptoqween.github.io/streamer/current/)

      const to = 'USD'
      const subscriptions = []
      this.$store.state.assets.forEach((a) => {
        if (!a.priceSymbol.startsWith('?')) {
          subscriptions.push('5~CCCAGG~' + a.priceSymbol + '~' + to)
          // console.log('5~CCCAGG~' + a.priceSymbol + '~' + to)
        }
      })

      if (goLive && (!this.socket || this.socket.readyState == WebSocket.CLOSED)) {
        var streamUrl = `wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`
        this.socket = new WebSocket(streamUrl)

        let ccStreamer = this.socket

        ccStreamer.onopen = function (event) {
          ccStreamer.send(JSON.stringify({ action: 'SubAdd', subs: subscriptions }))
        }
        ccStreamer.onmessage = this.priceUpdateReceived

        this.log('LiveData - ON')
      } else if (!goLive && this.socket && this.socket.readyState == WebSocket.OPEN) {
        this.socket.send({ action: 'SubRemove', subs: subscriptions })
        this.socket.close()

        this.log('LiveData - OFF')
        this.socket = null
      }
    },
    priceUpdateReceived(event) {
      // For the moment do nothing.
      // I have changed asset price and change24HourPct to BigNumbers, so the code does not work anymore.
      // Maybe we should forget about the streamer and just create our own setInterval and call store.fetchCurrentAssetPrices.
      return

      // console.log(event)
      if (event && event.data) {
        const message = JSON.parse(event.data)
        var messageType = message.TYPE

        if (messageType == CCC.STATIC.TYPE.CURRENTAGG) {
          var data = CCC.CURRENT.unpack(message)
          this.log(data)

          var from = data['FROMSYMBOL']
          var to = data['TOSYMBOL']
          var flags = data['FLAGS']
          var price = data['PRICE']
          var open24hour = data['OPEN24HOUR']

          if (flags != CCC.CURRENT.FLAGS.PRICEUNCHANGED) {
            const asset = this.$store.state.assets.find((a) => a.priceSymbol === from)
            if (asset) {
              asset.price = price
              if (open24hour > 0) {
                // The OPEN24HOUR is received once a day or at socket connection
                asset.open24hour = open24hour
              }
              asset.change24HourPct = ((asset.price - asset.open24hour) / asset.open24hour) * 100
              // this.log(asset.symbol,asset.priceSymbol,from,price,asset.change24HourPct)
            }
            this.log(from, to, price, flags, asset)
          }
        }
      }
    },
    filterUpdated(filters) {
      this.filtersOpen = !this.filtersOpen
      this.$store.dispatch('updateOptionsValues', { filters: filters })
    },
    sortHeaderClicked(sortOptions) {
      // console.log('dispatch', sortOptions.by, sortOptions.order)
      this.$store.dispatch('updateOptionsValues', {
        sortOptions: sortOptions
      })
    },
    menuClicked(id) {
      if (id < 10) {
        this.activeTab = id
        // Get the selected fund for the active tab
        this.selectFund(this.selectedFunds.get(this.activeTab))
      } else if (id == 10) {
        // this.load()
      }
    },
    activeTabIs(id) {
      return this.activeTab == id
    },
    moduleFriendlyName(name) {
      switch (name) {
        case Module.IssuanceModule:
          return 'Issuance'
        case Module.DextfTradeModule:
          return 'Trade'
        case Module.StreamingFeeModule:
          return 'Management Fee'
        default:
          return 'Unknown'
      }
    },
    setDimmer(show, closable = false, msg = {}, variation = false) {
      this.dimmerMessage = msg || {}
      this.dimmerMessage.closable = closable || false
      if (show) {
        $(`#${this.dimmerMessageId}`)
          .dimmer({ closable: closable || false, variation: variation })
          .dimmer('show')
      } else {
        $(`#${this.dimmerMessageId}`).dimmer('hide')
      }
    },
    async selectFund(fund) {
      this.selectedFunds.set(this.activeTab, fund)
      this.sidebarFund = fund
      if (fund) {
        $('#fundDetailSidebar').sidebar('show')
      } else {
        $('#fundDetailSidebar').sidebar('hide')
      }
    },
    startTrading(fund) {
      this.log(`${this.$options.name}startTrading`)
      this.transitionToState(fund, 'Trading', `Start trading session for your Fund ${fund.symbol}`)
    },
    cancelProposal(fund) {
      this.log(`${this.$options.name}cancelProposal`)
      this.transitionToState(
        fund,
        'Regular',
        `Rebalance proposal cancellation for your Fund ${fund.symbol}`
      )
    },
    closeTrading(fund) {
      this.log(`${this.$options.name}.closeTrading`)
      this.transitionToState(fund, 'Regular', `Close the rebalance for your Fund ${fund.symbol}`)
    },
    transitionToState(fund, state, header) {
      this.log(`${this.$options.name}transitionToState`, header)
      if (fund && ['Regular', 'Trading'].includes(state)) {
        let msg = {}
        let subHeaders = []

        subHeaders.push(`Please accept the transaction in MetaMask...`)

        msg = {
          type: '',
          header,
          subHeaders: subHeaders
        }

        this.setDimmer(true, false, msg)

        this.$store.dispatch('setWorkInProgress', true)

        const dextfTradeApi = this.connector.dextfTradeApi

        let promise
        if (state == 'Regular') {
          promise = dextfTradeApi.revertToRegularState(fund.address)
        } else {
          promise = dextfTradeApi.startTrading(fund.address)
        }

        promise
          .then((result) => {
            if (result.errors.length == 0) {
              const transactionAddress = result.data.contractTransaction.hash

              msg = {
                type: '',
                header,
                subHeaders: [
                  `Transaction hash: ${transactionAddress}`,
                  '',
                  'Do not change the transaction in MetaMask',
                  'Do not close the window',
                  '',
                  'Please wait...'
                ]
              }
              this.setDimmer(true, false, msg)

              const totalTimeoutInMillis = 30 * 60 * 1000 // 30 mins
              this.connector
                .waitForTransaction(transactionAddress, 1, totalTimeoutInMillis)
                .then((statusResult) => {
                  if (statusResult.errors.length == 0) {
                    // 0 means reverted
                    if (statusResult.data.transactionReceipt.status == 0) {
                      msg = {
                        type: 'error',
                        header,
                        subHeaders: ['Oops, something went wrong'],
                        lines: [`Transaction ${transactionAddress} reverted`]
                      }

                      this.setDimmer(true, true, msg)
                    } else {
                      this.$store.dispatch('updateRebalanceInfo', fund.symbol)

                      axios
                        .post(this.$store.state.APIs.updateRebalanceState, {
                          userId: this.$store.state.user.userId,
                          networkId: this.currentNetwork.chainId,
                          symbol: fund.symbol,
                          state: FundState[state]
                        })
                        .then(() => {
                          this.log(`Rebalance state ${state}: successfully stored in the DB`)
                        })
                        .catch((error) => {
                          console.error(
                            `Rebalance state ${state}: failed to store in the DB`,
                            error
                          )
                        })

                      msg = {
                        type: 'ok',
                        header,
                        subHeaders: ['Status successfully updated']
                      }
                      this.setDimmer(true, true, msg)
                    }
                  } else {
                    const errorMessages = statusResult.errors.map(
                      (logMessage) => logMessage.message
                    )

                    msg = {
                      type: 'error',
                      header,
                      subHeaders: ['Oops, something went wrong'],
                      lines: errorMessages
                    }

                    this.setDimmer(true, true, msg)
                  }
                })
                .finally(() => {
                  this.$store.dispatch('setWorkInProgress', false)
                })
            } else {
              const errorMessages = result.errors.map((logMessage) => logMessage.message.message)

              msg = {
                type: 'error',
                header,
                subHeaders: ['Oops, something went wrong'],
                lines: errorMessages
              }

              this.setDimmer(true, true, msg)

              this.$store.dispatch('setWorkInProgress', false)
            }
          })
          .catch((error) => {
            msg = {
              type: 'error',
              header,
              subHeaders: [`Oops, something went wrong`],
              lines: [error]
            }

            this.setDimmer(true, true, msg)

            this.$store.dispatch('setWorkInProgress', false)
          })
      }
    },
    /**
     * Reset the fund allocation to the latest rebalancing
     */
    async reset(fund) {
      console.warn('temporarily disabled')
      // const allocation = { DAI: 0.123456, USDC: 89 }
      // this.rebalance(fund.allocation)
    },
    /**
     * Rebalance the fund
     */
    async rebalance(fund, allocation) {
      this.log(this.$options.name, 'rebalance', allocation)
      if (!fund || !allocation) {
        return
      }

      if (!this.connector) {
        this.log('not connected')
        return
      }

      if (fund.isSn) {
        this.log('Structured Note cannot be rebalanced')
        return
      }

      if (!fund.launched) {
        console.warn('Fund not launched yet')
        return
      }

      if (this.workInProgress) return

      this.triggerGAEvent('rebalance_fund_start')
      let msg
      let result
    },
    /**
     * The launch is a 2-step operation: creation and initialization
     */
    async launch(fund, cascadeAfterSave = false) {
      this.log(this.$options.name, 'launch')
      if (!fund) {
        return
      }

      if (!this.connector) {
        this.log('not connected')
        return
      }

      if (fund.isSn && !this.isAdmin) {
        this.log('Structured Note cannot be launched by non-Admin')
        return
      }

      if (fund.launched) {
        console.warn('Fund already launched')
        return
      }

      if (fund.creating) {
        console.warn('Fund creation in progress')
        return
      }

      if (fund.initializing) {
        console.warn('Fund initialization in progress')
        return
      }

      if (!cascadeAfterSave && this.workInProgress) return

      // console.log('launch', fund.symbol, fund.created, fund.initialized)
      if (fund.created && !fund.initialized) {
        // Fund was created, but still need to complete the setup
        await this.setupFund(fund, 'launch (complete)')
        return
      }

      this.triggerGAEvent('launch_create_fund_start')
      let msg
      let result

      this.creatingFund({ symbol: fund.symbol }, cascadeAfterSave ? 'STEP 2/3 - ' : 'STEP 1/2 - ')

      const symbolsToFetchPriceOf = fund.allocation.current.assets.map((asset) => asset.symbol)
      console.log(symbolsToFetchPriceOf)
      // Refresh the prices
      await this.$store.dispatch('fetchCurrentAssetPrices', {
        symbols: symbolsToFetchPriceOf,
        fetchFullData: false,
        caller: 'CommandCentre.launch'
      })

      if (!fund.created) {
        //
        // Check if a fund with same symbol already exists
        //
        try {
          const existingFundAddress = await this.checkFundExistsInChain(fund.symbol)
          if (existingFundAddress) {
            this.fundLaunchCreationCompleted(
              {
                symbol: fund.symbol,
                address: ''
              },
              `A fund with the same symbol already exists (address ${existingFundAddress})`
            )
            this.triggerGAEvent('launch_create_fund_error')
            return
          }
        } catch (err) {
          console.log('Errors checking the fund symbol:', err)
          this.fundLaunchCreationCompleted(
            {
              symbol: fund.symbol,
              address: ''
            },
            'Unable to check the fund symbol'
          )
          this.triggerGAEvent('launch_create_fund_error')

          return
        }
      }

      //
      // Prapare the data for the call to createFund
      //
      const assetsInfo = []
      const componentAddresses = []
      const componentPrices = []
      const componentProportions = []
      let componentUnits = []

      // ** DAPP-229: DELETE AFTER V1 > V2 MIGRATION ***
      result = { data: { fundUnits: [] } }
      // *************************************

      fund.assets.forEach(async function (asset) {
        componentAddresses.push(asset.definition.contract)
        componentProportions.push(new BigNumber(asset.percentage).div(100))

        // ** DAPP-229: DELETE AFTER V1 > V2 MIGRATION ***
        if (fund.clonedFromV1) {
          componentPrices.push(asset.launchPrice)
          result.data.fundUnits.push(asset.unitQuantity)

          assetsInfo.push({
            symbol: asset.symbol,
            launchPrice: asset.launchPrice.toString(),
            unitQuantity: '0.0'
          })
        } else {
          // *************************************
          componentPrices.push(asset.definition.price)

          assetsInfo.push({
            symbol: asset.symbol,
            launchPrice: asset.definition.price.toString(),
            unitQuantity: '0.0'
          })
        }
      })

      // ** DAPP-229: DELETE AFTER V1 > V2 MIGRATION ***
      if (!fund.clonedFromV1) {
        result = this.connector.calculateFundUnits(
          componentPrices,
          componentProportions,
          new BigNumber(100) // Target price
        )
        if (result.errors.length > 0) {
          const errorMessages = result.errors.map((logMessage) => logMessage.message)
          console.error('Errors are present:', errorMessages)
          // Transaction failed
          this.fundLaunchCreationCompleted(
            {
              symbol: fund.symbol,
              address: ''
            },
            'Unable to calculate the fund units'
          )
          this.triggerGAEvent('launch_create_fund_error')

          return
        }
      }
      // *************************************

      componentUnits = result.data.fundUnits

      /* ********* TEMPORARY, UNTIL calculateFundUnits IS FIXED (ask MarMar if it has been modified to use 8 significant digits) */
      /*
      componentUnits = []
      result.data.fundUnits.forEach((u) =>
        componentUnits.push(new BigNumber(u.toPrecision(8)))
      )
      */
      /* ******************************************************* */

      /*
      this.log('addresses', componentAddresses)
      this.log(
        'prices',
        componentPrices.reduce((a, v) => a + ', ' + v)
      )
      this.log(
        'proportions',
        componentProportions.reduce((a, v) => a + ', ' + v)
      )
      this.log(
        'units',
        componentUnits.reduce((a, v) => a + ', ' + v)
      )
      */

      let i = 0
      assetsInfo.forEach((a) => (a.unitQuantity = componentUnits[i++].toString()))

      //
      // Create the fund
      //

      /*
      let txOptions = await this.$store.getters.getTxOptions(
        fund.allocation.current.assets.length,
        'launch'
      )
      this.log('txOptions', txOptions)
      */

      try {
        result = await this.connector.ControllerApi.createFund(
          componentAddresses,
          componentUnits,
          fund.name.substr(0, 32),
          fund.symbol
        )
      } catch (createFundError) {
        console.error('createFundError', createFundError)
        this.fundLaunchCreationCompleted(
          {
            symbol: fund.symbol,
            address: ''
          },
          'Creation transaction failed'
        )
        this.triggerGAEvent('launch_create_fund_error')

        return
      }

      // this.log(result)

      if (result.errors.length > 0) {
        const errorMessages = result.errors.map((logMessage) => logMessage.message)
        console.error('Errors are present:', errorMessages)
        // Transaction failed
        this.fundLaunchCreationCompleted(
          {
            symbol: fund.symbol,
            address: ''
          },
          'Creation transaction failed'
        )
        this.triggerGAEvent('launch_create_fund_error')

        return
      }

      // Collect relevant info to store immediately into the DB
      const transactionAddress = result.data.contractTransaction.hash
      /*
      const minInvestableQuantity =
        result.data.minInvestableQuantity.toNumber()
      result.data.components.forEach((component) => {
        let asset = this.$store.getters.getAssetByContract(component.address)
        if (!asset) {
          console.warn('Unknown asset with address', component.address)
        } else {
          asset = assetsInfo.find((a) => a.symbol == asset.symbol)
          if (!asset) {
            console.warn('Unknown asset with symbol', asset.symbol)
          } else {
            asset.unitQuantity = component.unitFundTokens
          }
        }
      })
      */

      fund.transaction = transactionAddress

      // Lightest payload, strip out everything unnecessary
      let fundPayload = {
        symbol: fund.symbol,
        transaction: transactionAddress,
        // minInvestableQuantity: minInvestableQuantity,
        assets: assetsInfo,
        wallet: this.$store.state.user.txOptions.from
      }

      // Send immediately the transaction and relevant info to the server
      axios
        .post(this.$store.state.APIs.launchFund, {
          userId: this.$store.state.user.userId,
          networkId: this.currentNetwork.chainId,
          fund: fundPayload
        })
        .then(async (launchCreate1Response) => {
          this.log('Transaction stored in DB:', launchCreate1Response.data)

          msg = {
            type: '',
            // header: 'Creating the fund',
            header: `${cascadeAfterSave ? 'STEP 2/3' : 'STEP 1/2'} - Create your Fund ${
              fund.symbol
            }`,
            subHeaders: [
              `Transaction hash: ${transactionAddress}`,
              '',
              'Do not change the transaction in MetaMask',
              'Do not close the window',
              '',
              'Please wait...'
            ]
          }
          this.setDimmer(true, false, msg)

          /* ===================
             Everything that follows can go to the server
          ====================== */

          // Check transaction status
          const totalTimeoutInMillis = 30 * 60 * 1000 // 30 mins
          // const statusResult = await this.fetchTransactionStatus(
          //   transactionAddress
          // )
          const statusResult = await this.connector.waitForTransaction(
            transactionAddress,
            1,
            totalTimeoutInMillis
          )

          this.log('launchCreate waitForTransaction result', statusResult)

          if (statusResult.errors.length == 0) {
            // 0 means reverted
            if (statusResult.data.transactionReceipt.status == 0) {
              this.log('Launch creation transaction - errors: transaction unsuccessful')

              // Couldn't retrieve the transaction status and the fund address
              this.fundLaunchCreationCompleted(
                {
                  symbol: fund.symbol,
                  address: ''
                },
                `Transaction ${transactionAddress} failed`
              )
              this.triggerGAEvent('launch_create_fund_error')
            } else {
              this.log('Launch creation transaction - successful')
              const addedEvent = getSetAddedEventFromReceipt(statusResult.data.transactionReceipt)
              const fundAddress = addedEvent._setToken

              this.log('Created fund with address', fundAddress)
              // Lightest payload, strip out everything unnecessary
              fundPayload = {
                symbol: fund.symbol,
                address: fundAddress
              }

              axios
                .post(this.$store.state.APIs.launchFund, {
                  userId: this.$store.state.user.userId,
                  networkId: this.currentNetwork.chainId,
                  fund: fundPayload
                })
                .then((launchCreate2Response) => {
                  this.fundLaunchCreationCompleted({
                    symbol: fund.symbol,
                    address: fundAddress
                  })
                  this.triggerGAEvent('launch_create_fund_success')

                  this.setupFund(fund, 'launch', cascadeAfterSave ? 'STEP 3/3 - ' : 'STEP 2/3 - ')
                })
                .catch((launchCreate2Error) => {
                  this.log('launchCreate2Error', launchCreate2Error)
                  // Couldn't save the fund address into the DB
                  this.fundLaunchCreationCompleted(
                    {
                      symbol: fund.symbol,
                      address: fundAddress
                    },
                    `Could not save the fund address ${fundAddress}`
                  )
                  this.triggerGAEvent('launch_create_fund_error')
                })
            }
          } else {
            const errorMessages = statusResult.errors.map((logMessage) => logMessage.message)
            this.log('Launch creation transaction - errors:', errorMessages)

            // Couldn't retrieve the transaction status and the fund address
            this.fundLaunchCreationCompleted(
              {
                symbol: fund.symbol,
                address: ''
              },
              `Could not retrieve the status of transaction ${transactionAddress} and the fund address`
            )
            this.triggerGAEvent('launch_create_fund_error')
          }
        })
        .catch((launchCreate1Error) => {
          this.log('launchCreate1Error', launchCreate1Error)
          // Couldn't save the transaction into the DB
          this.fundLaunchCreationCompleted(
            {
              symbol: fund.symbol,
              address: ''
            },
            `Could not save the transaction ${transactionAddress}`
          )
          this.triggerGAEvent('launch_create_fund_error')
        })
    },
    /**
     * Using the given fundApi, add the list of modules
     */
    async addModulesToFund(fund, fundApi, modules) {
      this.log(this.$options.name, 'addModulesToFund', fund.symbol)

      let msg = {}
      let header = `Setup your Fund ${fund.symbol}`
      let subHeaders = []
      const transactionDesc = 'ADD MODULE'

      subHeaders.push(
        `Please accept ${modules.length} ${transactionDesc} transaction${
          modules.length > 1 ? 's' : ''
        } in MetaMask...`
      )
      subHeaders.push('')
      modules.forEach((module) =>
        subHeaders.push(`- Add ${this.moduleFriendlyName(module.name)} module transaction`)
      )

      msg = {
        type: '',
        header,
        subHeaders: subHeaders
      }

      this.setDimmer(true, false, msg)

      this.$store.dispatch('setWorkInProgress', true)

      let transactions = []
      let errorMessages = []
      const promises = []

      for (let i = 0; i < modules.length; i++) {
        const module = modules[i]
        if (this.managedModules.includes(module.name)) {
          this.log(`${i}) Adding ${module.name} module`)
          const response = await fundApi.addModule(module.name)
          if (response.errors.length == 0) {
            transactions.push(response.data.contractTransaction.hash)
          } else {
            response.errors.forEach((e) =>
              errorMessages.push(
                `Adding ${this.moduleFriendlyName(module.name)} module: ${e.message.message}`
              )
            )
            transactions = []
            break
          }
        } else {
          this.log(`${i}) Skipped ${module.name} module`)
        }
      }

      if (errorMessages.length == 0) {
        // Check transactions' statuses
        const totalTimeoutInMillis = 30 * 60 * 1000 // 30 mins

        subHeaders = []
        subHeaders.push(
          `Processing ${modules.length} ${transactionDesc} transaction${
            modules.length > 1 ? 's' : ''
          }`
        )
        subHeaders.push('')

        transactions.forEach((tx, i) => {
          const module = modules[i]
          promises.push(this.connector.waitForTransaction(tx, 1, totalTimeoutInMillis))
          subHeaders.push(`Adding ${this.moduleFriendlyName(module.name)} module: ${tx}`)
        })

        // subHeaders.push('Processing the authorization transactions')
        subHeaders.push('')
        subHeaders.push('Do not change any transaction in MetaMask')
        subHeaders.push('Do not close the window')
        subHeaders.push('')
        subHeaders.push('Please wait...')

        msg = {
          type: '',
          header,
          subHeaders: subHeaders
        }
        this.setDimmer(true, false, msg)

        await Promise.allSettled(promises).then((values) => {
          // this.log('Fund setup transactions - completed', values)

          values.forEach((v, i) => {
            if (v.status == 'fulfilled') {
              // this.log(v.status, v.value)
              const statusResult = v.value

              if (statusResult.errors.length == 0) {
                const transactionAddress = transactions[i]

                // 0 means reverted
                if (statusResult.data.transactionReceipt.status == 0) {
                  this.log(`${transactionDesc} transaction ${transactionAddress} reverted`)

                  errorMessages.push(
                    `${transactionDesc} transaction ${transactionAddress} reverted`
                  )
                }
              } else {
                statusResult.errors.forEach((logMessage) =>
                  errorMessages.push(logMessage.message.message)
                )
                this.log('Add module errors:', errorMessages)
              }
            } else {
              // this.log(v.status, v.reason)
              errorMessages.push(v.reason)
            }
          })
        })
      }

      if (errorMessages.length > 0) {
        msg = {
          type: 'error',
          header,
          subHeaders: [`Oops, something went wrong when setting up your Fund ${fund.symbol}`],
          lines: errorMessages
        }
        // this.triggerGAEvent('invest_wallet_authorize_error')
      } else {
        msg = {
          type: 'ok',
          header: `Your Fund ${fund.symbol} has been successfully setup`
        }
        // this.triggerGAEvent('invest_wallet_authorize_success')
      }

      this.setDimmer(true, true, msg)

      this.$store.dispatch('setWorkInProgress', false)

      return errorMessages.length == 0
    },
    /**
     * Using the given fundApi, initialize the list of modules
     */
    async initializeModulesOfFund(fund, fundApi, modules) {
      this.log(this.$options.name, 'initializeModulesOfFund', fund.symbol)

      let msg = {}
      let header = `Initialize your Fund ${fund.symbol}`
      let subHeaders = []
      const transactionDesc = 'INITIALIZE'

      subHeaders.push(
        `Please accept ${modules.length} ${transactionDesc} transaction${
          modules.length > 1 ? 's' : ''
        } in MetaMask...`
      )
      subHeaders.push('')
      modules.forEach((module) =>
        subHeaders.push(`- Initialize ${this.moduleFriendlyName(module.name)} module transaction`)
      )

      msg = {
        type: '',
        header,
        subHeaders: subHeaders
      }

      this.setDimmer(true, false, msg)

      this.$store.dispatch('setWorkInProgress', true)

      let transactions = []
      let errorMessages = []
      const promises = []

      for (let i = 0; i < modules.length; i++) {
        const module = modules[i]
        if (this.managedModules.includes(module.name)) {
          this.log(`${i}) Initializing ${module.name} module`)

          let settings = module.settings
          if (module.name == Module.StreamingFeeModule) {
            // Use a new object and convert the streaming fee from the 0-100 range to the 0-1 range
            settings = { streamingFeeSettings: {} }
            Object.entries(module.settings.streamingFeeSettings).forEach(([key, value]) => {
              if (key === 'streamingFeePercentage') {
                // This safeguard should not be necessary
                if (typeof value === 'string' || typeof value === 'number') {
                  value = new BigNumber(value)
                  console.warn('value of type', typeof value, ', variable converted to BigNumber')
                }
                settings.streamingFeeSettings[key] = value.div(100)
              } else if (key === 'maxStreamingFeePercentage') {
                // This safeguard should not be necessary
                if (typeof value === 'string' || typeof value === 'number') {
                  value = new BigNumber(value)
                  console.warn('value of type', typeof value, ', variable converted to BigNumber')
                }
                // The Streaming Fee smart contract checks for streamingFeePercentage < maxStreamingFeePercentage
                // rather than streamingFeePercentage <= maxStreamingFeePercentage. This causes issues when the users
                // set the fee to the max; let's fix it storing a slightly bigger max (+0.1).
                settings.streamingFeeSettings[key] = value.plus(0.1).div(100)
              } else {
                settings.streamingFeeSettings[key] = value
              }
            })

            // Get the module's feeRecipient (collector address)
            const result = await axios.get(this.$store.state.APIs.feeCollectorRecipient)

            try {
              const validAddress = etherUtils.getAddress(result.data.toLowerCase())
              settings.streamingFeeSettings.feeRecipient = validAddress
            } catch (error) {
              errorMessages.push('Invalid fee collector address')
              break
            }
          }

          const response = await fundApi.initializeFund(module.name, settings)
          if (response.errors.length == 0) {
            transactions.push(response.data.contractTransaction.hash)
          } else {
            response.errors.forEach((e) =>
              errorMessages.push(
                `Initializing ${this.moduleFriendlyName(module.name)} module: ${e.message.message}`
              )
            )
            transactions = []
            break
          }
        } else {
          this.log(`${i}) Skipped ${module.name} module initialization`)
        }
      }

      if (errorMessages.length == 0) {
        // Check transactions' statuses
        const totalTimeoutInMillis = 30 * 60 * 1000 // 30 mins

        subHeaders = []
        subHeaders.push(
          `Processing ${modules.length} ${transactionDesc} transaction${
            modules.length > 1 ? 's' : ''
          }`
        )
        subHeaders.push('')

        transactions.forEach((tx, i) => {
          const module = modules[i]
          promises.push(this.connector.waitForTransaction(tx, 1, totalTimeoutInMillis))
          subHeaders.push(`Initializing ${this.moduleFriendlyName(module.name)} module: ${tx}`)
        })

        // subHeaders.push('Processing the authorization transactions')
        subHeaders.push('')
        subHeaders.push('Do not change any transaction in MetaMask')
        subHeaders.push('Do not close the window')
        subHeaders.push('')
        subHeaders.push('Please wait...')

        msg = {
          type: '',
          header,
          subHeaders: subHeaders
        }
        this.setDimmer(true, false, msg)

        await Promise.allSettled(promises).then((values) => {
          // this.log('Fund initialization transactions - completed', values)

          values.forEach((v, i) => {
            if (v.status == 'fulfilled') {
              // this.log(v.status, v.value)
              const statusResult = v.value

              if (statusResult.errors.length == 0) {
                const transactionAddress = transactions[i]

                // 0 means reverted
                if (statusResult.data.transactionReceipt.status == 0) {
                  this.log(`${transactionDesc} transaction ${transactionAddress} reverted`)

                  errorMessages.push(
                    `${transactionDesc} transaction ${transactionAddress} reverted`
                  )
                }
              } else {
                statusResult.errors.forEach((logMessage) =>
                  errorMessages.push(logMessage.message.message)
                )
                this.log('Module initialization errors:', errorMessages)
              }
            } else {
              // this.log(v.status, v.reason)
              errorMessages.push(v.reason)
            }
          })
        })
      }

      if (errorMessages.length > 0) {
        msg = {
          type: 'error',
          header,
          subHeaders: [`Oops, something went wrong when initializing your Fund ${fund.symbol}`],
          lines: errorMessages
        }
        // this.triggerGAEvent('invest_wallet_authorize_error')
      } else {
        msg = {
          type: 'ok',
          header: `Your Fund ${fund.symbol} has been successfully initialized`
        }
        // this.triggerGAEvent('invest_wallet_authorize_success')
      }

      this.setDimmer(true, true, msg)

      this.$store.dispatch('setWorkInProgress', false)

      return errorMessages.length == 0
    },
    /**
     * Update the list of modules
     */
    async updateModulesOfFund(fund, updateCalls) {
      this.log(this.$options.name, 'updateModulesOfFund', updateCalls)

      let msg = {}
      let header
      let subHeaders = []
      let transactionDesc

      header = `Updating the modules of your Fund ${fund.symbol}`

      transactionDesc = 'UPDATE'

      subHeaders.push(
        `Please accept ${updateCalls.length} ${transactionDesc} transaction${
          updateCalls.length > 1 ? 's' : ''
        } in MetaMask...`
      )
      subHeaders.push('')
      updateCalls.forEach((callToDo) =>
        subHeaders.push(
          `- Update ${this.moduleFriendlyName(callToDo.moduleName)} module transaction`
        )
      )

      msg = {
        type: '',
        header,
        subHeaders: subHeaders
      }

      this.setDimmer(true, false, msg)

      this.$store.dispatch('setWorkInProgress', true)

      let transactions = []
      let errorMessages = []
      const promises = []

      for (let i = 0; i < updateCalls.length; i++) {
        const callToDo = updateCalls[i]

        this.log(`${i}) Updating ${callToDo.moduleName} module`)

        const response = await this.connector[callToDo.apiName][callToDo.functionName](
          ...callToDo.args
        )

        if (response.errors.length == 0) {
          transactions.push(response.data.contractTransaction.hash)
        } else {
          response.errors.forEach((e) =>
            errorMessages.push(
              `Updating ${this.moduleFriendlyName(callToDo.moduleName)} module: ${
                e.message.message
              }`
            )
          )
          transactions = []
          break
        }
      }

      if (errorMessages.length == 0) {
        // Check transactions' statuses
        const totalTimeoutInMillis = 30 * 60 * 1000 // 30 mins

        subHeaders = []
        subHeaders.push(
          `Processing ${updateCalls.length} ${transactionDesc} transaction${
            updateCalls.length > 1 ? 's' : ''
          }`
        )
        subHeaders.push('')

        transactions.forEach((tx, i) => {
          const callToDo = updateCalls[i]
          promises.push(this.connector.waitForTransaction(tx, 1, totalTimeoutInMillis))
          subHeaders.push(`Updating ${this.moduleFriendlyName(callToDo.moduleName)} module: ${tx}`)
        })

        // subHeaders.push('Processing the authorization transactions')
        subHeaders.push('')
        subHeaders.push('Do not change any transaction in MetaMask')
        subHeaders.push('Do not close the window')
        subHeaders.push('')
        subHeaders.push('Please wait...')

        msg = {
          type: '',
          header,
          subHeaders: subHeaders
        }
        this.setDimmer(true, false, msg)

        await Promise.allSettled(promises).then((values) => {
          // this.log('Fund module update transactions - completed', values)

          values.forEach((v, i) => {
            if (v.status == 'fulfilled') {
              // this.log(v.status, v.value)
              const statusResult = v.value

              if (statusResult.errors.length == 0) {
                const transactionAddress = transactions[i]

                // 0 means reverted
                if (statusResult.data.transactionReceipt.status == 0) {
                  this.log(`${transactionDesc} transaction ${transactionAddress} reverted`)

                  errorMessages.push(
                    `${transactionDesc} transaction ${transactionAddress} reverted`
                  )
                }
              } else {
                statusResult.errors.forEach((logMessage) =>
                  errorMessages.push(logMessage.message.message)
                )
                this.log('Module update errors:', errorMessages)
              }
            } else {
              // this.log(v.status, v.reason)
              errorMessages.push(v.reason)
            }
          })
        })
      }

      if (errorMessages.length > 0) {
        msg = {
          type: 'error',
          header,
          subHeaders: [
            `Oops, something went wrong when updadinf the modules of your Fund ${fund.symbol}`
          ],
          lines: errorMessages
        }
        // this.triggerGAEvent('invest_wallet_authorize_error')
      } else {
        msg = {
          type: 'ok',
          header: `Your Fund ${fund.symbol} has been successfully updated`
        }
        // this.triggerGAEvent('invest_wallet_authorize_success')
      }

      this.setDimmer(true, true, msg)

      this.$store.dispatch('setWorkInProgress', false)

      return errorMessages.length == 0
    },
    /**
     * Set up the fund adding and/or initializing the required modules
     */
    async setupFund(fund, caller, step = '') {
      this.log(this.$options.name, 'initializeFund', caller, step)
      if (!fund || !fund.address) {
        return true
      }

      if (!this.connector) {
        this.log('not connected')
        return true
      }

      const modulesToAdd = []
      const modulesToInitialize = []
      const moduleUpdateCallsToDo = []

      const hasModulesToUpdate = fund.modules.some(
        (m) => m.settings && m.settings.updatedFields && m.settings.updatedFields.length > 0
      )
      if (!hasModulesToUpdate) {
        // No module to update, reload the modules from the blockchain
        await this.$store.dispatch('updateFundModules', fund.symbol)
      }

      fund.modules.forEach((m) => {
        if (fund.initializedModules.includes(m.name)) {
          // Already added and initialized, check if some module needs to be updated

          let updatedFields = []
          if (m.settings && m.settings.updatedFields) {
            updatedFields = m.settings.updatedFields
          }

          if (updatedFields.length > 0) {
            if (m.name === Module.StreamingFeeModule) {
              updatedFields.forEach((f) => {
                if (f === 'streamingFeePercentage') {
                  const args = [
                    this.fund.address,
                    m.settings.streamingFeeSettings.streamingFeePercentage.div(100)
                  ]
                  moduleUpdateCallsToDo.push({
                    moduleName: m.name,
                    apiName: 'streamingFeeApi',
                    functionName: 'updateStreamingFee',
                    args
                  })
                } else {
                  this.log(`${m.name} module / ${f} field: unhandled update`)
                }
              })
            } else {
              this.log(`${m.name} module: unhandled update`)
            }
          }
        } else if (fund.pendingModules.includes(m.name)) {
          // Already added, just needs to be initialized
          modulesToInitialize.push(m)
        } else {
          // Brand new module... needs to be added and initialized
          modulesToAdd.push(m)
          modulesToInitialize.push(m)
        }
      })

      // this.log('to add', modulesToAdd)
      // this.log('to initialize', modulesToInitialize)
      // this.log('to update', moduleUpdateCallsToDo)

      const fundApi = this.$store.getters.getFundApiByContract(fund.address)

      //
      // Add modules
      //

      let success

      if (modulesToAdd.length > 0) {
        success = await this.addModulesToFund(fund, fundApi, modulesToAdd)
        if (!success) {
          return false
        }
      }

      //
      // Initialize modules
      //

      if (modulesToInitialize.length > 0) {
        success = await this.initializeModulesOfFund(fund, fundApi, modulesToInitialize)
        if (!success) {
          return false
        }
      }

      //
      // Update modules
      //

      if (moduleUpdateCallsToDo.length > 0) {
        success = await this.updateModulesOfFund(fund, moduleUpdateCallsToDo)
        if (!success) {
          return false
        }
      }

      if (modulesToAdd.length > 0 || modulesToInitialize.length > 0) {
        await this.$store.dispatch('updateFundModules', fund.symbol)
        fund.canInvest = true
        fund.canRedeem = true
        fund.canRebalance = true
        this.evalFundStatus(fund, 'setupFund')
      }

      // this.log('initializeFund DONE')
      return true
    },
    addFund(data) {
      this.log(this.$options.name, data, `addFund(${data.launch})`)

      if (this.workInProgress) return

      if (!this.fund || this.fund._ops !== 'add') return

      this.showCreation = false

      let msg = {
        type: '',
        header: `${data.launch ? 'STEP 1/3 - ' : ''}Save your Fund ${this.fund.symbol}`,
        subHeaders: [`Please wait, it won't take long...`]
      }
      this.setDimmer(true, false, msg)
      this.$store.dispatch('setWorkInProgress', true)

      // IMPORTANT: this could be avoided if I reload the fund at the end
      this.fund.allocation.inception.date = new Date().toISOString()
      this.fund.allocation.inception.assets = []

      data.allocation.forEach((a) => {
        this.fund.allocation.inception.assets.push({
          symbol: a.symbol,
          percentage: a.percentage
        })

        // Unfortunately I still have to add the assets to the .assets property... one day we can rely on .allocation only
        const asset = this.$store.getters.getAssetBySymbol(a.symbol)
        asset.percentage = a.percentage
        this.fund.assets.push(asset)
      })
      // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

      // Lightest payload, strip out everything unnecessary
      const fundPayload = {
        symbol: this.fund.symbol,
        name: this.fund.name,
        description: this.fund.description,
        targetPrice: this.fund.targetPrice,
        risk: this.fund.risk,
        visibleToInvestors: this.fund.visibleToInvestors,
        assets: data.allocation,
        modules: []
      }
      // Mandatory module
      fundPayload.modules.push({
        name: Module.IssuanceModule,
        version: '1.0',
        settings: {}
      })

      // Other modules
      data.modules.forEach((m) => {
        fundPayload.modules.push(m)
      })

      // console.log('payload', JSON.stringify(fundPayload))

      // IMPORTANT: this could be avoided if I reload the fund at the end
      this.fund.modules = fundPayload.modules
      // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

      axios
        .post(this.$store.state.APIs.addFund, {
          userId: this.$store.state.user.userId,
          networkId: this.currentNetwork.chainId,
          fund: fundPayload
        })
        .then(async (response) => {
          this.fund._ops = ''

          await this.$store.dispatch('addFund', this.fund)

          if (this.sidebarFund && this.sidebarFund.symbol === this.fund.symbol) {
            this.sidebarFund = this.fund
          }

          this.triggerGAEvent('new_fund_success')

          if (data.launch) {
            await this.launch(this.fund, true)
          } else {
            msg = {
              type: 'ok',
              header: `Your Fund ${this.fund.symbol} has been successfully saved`
            }
            this.setDimmer(true, true, msg)
          }
        })
        .catch((error) => {
          // console.log(error.response)
          let lines = []
          if (error.response && error.response.data && error.response.data.errors) {
            this.log('Server Error(s)', error.response.data.errors)
            lines = error.response.data.errors
          } else {
            this.log('Generic Error', error)
            lines = error.message ? [error.message] : []
          }

          let supportEmailBody = 'Errors:%0D%0A'
          lines.forEach((line) => (supportEmailBody += '%0D%0A' + line))

          msg = {
            type: 'error',
            supportEmailSubject: `Error saving fund ${this.fund.symbol}`,
            supportEmailBody: supportEmailBody,
            header: 'ERROR',
            subHeaders: [`Oops, something went wrong when saving your Fund ${this.fund.symbol}`],
            lines: lines
          }
          this.setDimmer(true, true, msg)
          this.triggerGAEvent('new_fund_error')
        })
        .finally(() => {
          this.$store.dispatch('setWorkInProgress', false)
          this.fund = undefined
        })
    },
    modifyFund(data) {
      this.log(this.$options.name, data, `modifyFund(${data.launch})`)

      if (this.workInProgress) return

      if (!this.fund || this.fund._ops !== 'modify') return

      const f = this.getFundBySymbol(this.fund.symbol)
      if (!f) {
        console.error('Fund does not exist')
        return
      }

      this.showCreation = false

      let msg = {
        type: '',
        header: `Update your Fund ${this.fund.symbol}`,
        subHeaders: [`Please wait, it won't take long...`]
      }
      this.setDimmer(true, false, msg)
      this.$store.dispatch('setWorkInProgress', true)

      // Lightest payload, strip out everything unnecessary
      const fundPayload = {
        symbol: this.fund.symbol,
        name: this.fund.name,
        description: this.fund.description,
        risk: this.fund.risk,
        modules: []
      }
      if (!this.fund.launched || this.fund.totalNoOfTokens == 0) {
        fundPayload.visibleToInvestors = this.fund.visibleToInvestors
      }
      if (!this.fund.created) {
        fundPayload.targetPrice = this.fund.targetPrice
        fundPayload.assets = data.allocation
      }

      const fundModules = []
      const payloadModules = []

      // Mandatory module
      fundModules.push({
        name: Module.IssuanceModule,
        version: '1.0',
        settings: {}
      })
      payloadModules.push({
        name: Module.IssuanceModule,
        version: '1.0',
        settings: {}
      })

      // Other modules
      data.modules.forEach((m) => {
        fundModules.push(m)

        const dbModule = { name: m.name, version: m.version, settings: {} }
        Object.entries(m.settings).forEach(([key, value]) => {
          if (key !== 'updatedFields') {
            dbModule.settings[key] = value
          }
        })
        payloadModules.push(dbModule)
      })

      // console.log('payload', fundPayload)

      // IMPORTANT: this could be avoided if I reload the fund at the end
      this.fund.modules = fundModules
      // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

      fundPayload.modules = payloadModules

      axios
        .post(this.$store.state.APIs.updateFund, {
          userId: this.$store.state.user.userId,
          networkId: this.currentNetwork.chainId,
          fund: fundPayload
        })
        .then(async (response) => {
          this.fund._ops = ''

          await this.$store.dispatch('replaceFund', this.fund)

          if (this.sidebarFund && this.sidebarFund.symbol === this.fund.symbol) {
            this.sidebarFund = this.fund
          }

          this.triggerGAEvent('modify_fund_success')

          if (data.launch) {
            await this.launch(this.fund, true)
          } else {
            if (await this.setupFund(this.fund, 'modifyFund')) {
              msg = {
                type: 'ok',
                header: `Your Fund ${this.fund.symbol} has been successfully updated`
              }
              this.setDimmer(true, true, msg)
            } else {
              this.log('Something went wrong during the fund setup (modify)')
            }
          }
        })
        .catch((error) => {
          // console.log(error.response)
          let lines = []
          if (error.response && error.response.data && error.response.data.errors) {
            this.log('Server Error(s)', error.response.data.errors)
            lines = error.response.data.errors
          } else {
            this.log('Generic Error', error)
            lines = error.message ? [error.message] : []
          }

          let supportEmailBody = 'Errors:%0D%0A'
          lines.forEach((line) => (supportEmailBody += '%0D%0A' + line))

          msg = {
            type: 'error',
            supportEmailSubject: `Error updating fund ${this.fund.symbol}`,
            supportEmailBody: supportEmailBody,
            header: 'ERROR',
            subHeaders: [`Oops, something went wrong when updating your Fund ${this.fund.symbol}`],
            lines: lines
          }
          this.setDimmer(true, true, msg)
          this.triggerGAEvent('modify_fund_error')
        })
        .finally(() => {
          this.$store.dispatch('setWorkInProgress', false)
          this.fund = undefined
        })
    },
    /**
     *
     */
    broadcastProposal(data) {
      this.log(`${this.$options.name}.broadcastProposal`)
      // console.log(JSON.stringify(data))

      this.showRebalancing = false

      let msg = {}
      let header = `Broadcast rebalance proposal for your Fund ${this.fund.symbol}`
      let subHeaders = []

      subHeaders.push(`Please accept the transaction in MetaMask...`)

      msg = {
        type: '',
        header,
        subHeaders: subHeaders
      }

      this.setDimmer(true, false, msg)

      this.$store.dispatch('setWorkInProgress', true)

      const dextfTradeApi = this.connector.dextfTradeApi

      dextfTradeApi
        .proposeTrade(
          data.fundAddress,
          data.maxTradedFundTokens,
          data.minimumDelay,
          data.minimumApproverVotes,
          data.minimumBlockerVotes,
          data.inboundAddresses,
          data.inboundRealUnits,
          data.outboundAddresses,
          data.outboundRealUnits
        )
        .then((result) => {
          if (result.errors.length == 0) {
            const transactionAddress = result.data.contractTransaction.hash

            msg = {
              type: '',
              header,
              subHeaders: [
                `Transaction hash: ${transactionAddress}`,
                '',
                'Do not change the transaction in MetaMask',
                'Do not close the window',
                '',
                'Please wait...'
              ]
            }
            this.setDimmer(true, false, msg)

            const totalTimeoutInMillis = 30 * 60 * 1000 // 30 mins
            this.connector
              .waitForTransaction(transactionAddress, 1, totalTimeoutInMillis)
              .then((statusResult) => {
                if (statusResult.errors.length == 0) {
                  // 0 means reverted
                  if (statusResult.data.transactionReceipt.status == 0) {
                    msg = {
                      type: 'error',
                      header,
                      subHeaders: ['Oops, something went wrong'],
                      lines: [`Transaction ${transactionAddress} reverted`]
                    }

                    this.setDimmer(true, true, msg)
                  } else {
                    this.fund.rebalanceState.rationale = data.rationale

                    this.$store.dispatch('updateRebalanceInfo', this.fund.symbol).then(() => {
                      if (this.broadcastToChannels) {
                        const f = this.getFundBySymbol(data.symbol)
                        const endTimestamp = new Date(
                          f.rebalance.proposalEndTimestamp * 1000
                        ).toUTCString()

                        const assetsForChannels = data.assets.map((a) => {
                          a.in = a.in.replace('Buy', 'Send    ')
                          a.out = a.out.replace('Sell', 'Receive ')
                          return a
                        })

                        // Broadcast a message to Discord
                        this.sendMessageToDiscord(
                          f,
                          data.rationale ? [data.rationale] : [],
                          endTimestamp,
                          assetsForChannels
                        )
                          .then(() => {
                            this.log('Rebalance proposal to Discord: successfully sent')
                          })
                          .catch((error) => {
                            console.error('Rebalance proposal to Discord: failed to send', error)
                          })

                        // Broadcast a message to Telegram
                        this.sendMessageToTelegram(
                          f,
                          data.rationale ? [data.rationale] : [],
                          endTimestamp,
                          assetsForChannels
                        )
                          .then(() => {
                            this.log('Rebalance proposal to Telegram: successfully sent')
                          })
                          .catch((error) => {
                            console.error('Rebalance proposal to Telegram: failed to send', error)
                          })
                      }
                    })

                    const state = 'Proposal'

                    // Update the DB state
                    axios
                      .post(this.$store.state.APIs.updateRebalanceState, {
                        userId: this.$store.state.user.userId,
                        networkId: this.currentNetwork.chainId,
                        symbol: this.fund.symbol,
                        state: FundState[state],
                        note: data.rationale,
                        details: {
                          maxTradedFundTokens: data.maxTradedFundTokens.toString(),
                          minimumDelay: data.minimumDelay,
                          minimumApproverVotes: data.minimumApproverVotes,
                          minimumBlockerVotes: data.minimumBlockerVotes,
                          assets: data.assets
                        }
                      })
                      .then(() => {
                        this.log(`Rebalance state ${state}: successfully stored in the DB`)
                      })
                      .catch((error) => {
                        console.error(`Rebalance state ${state}: failed to store in the DB`, error)
                      })

                    msg = {
                      type: 'ok',
                      header: `Rebalance proposal broadcasted successfully`
                    }
                    this.setDimmer(true, true, msg)
                  }
                } else {
                  const errorMessages = statusResult.errors.map((logMessage) => logMessage.message)

                  msg = {
                    type: 'error',
                    header,
                    subHeaders: ['Oops, something went wrong'],
                    lines: errorMessages
                  }

                  this.setDimmer(true, true, msg)
                }
              })
              .finally(() => {
                this.$store.dispatch('setWorkInProgress', false)
                this.fund = undefined
              })
          } else {
            const errorMessages = result.errors.map((logMessage) => logMessage.message.message)

            msg = {
              type: 'error',
              header,
              subHeaders: ['Oops, something went wrong'],
              lines: errorMessages
            }

            this.setDimmer(true, true, msg)

            this.$store.dispatch('setWorkInProgress', false)
            this.fund = undefined
          }
        })
        .catch((error) => {
          msg = {
            type: 'error',
            header,
            subHeaders: [`Oops, something went wrong`],
            lines: [error]
          }

          this.setDimmer(true, true, msg)

          this.$store.dispatch('setWorkInProgress', false)
          this.fund = undefined
        })
    },
    sendMessageToDiscord(fund, rationaleLines, endTimestamp, assets) {
      if (!this.broadcastToChannels) {
        return Promise.resolve('Broadcast to Discord: skipped')
      }

      const payload = {
        userId: this.$store.state.user.userId,
        networkId: this.currentNetwork.chainId,
        fundImage: 'https://cdn.dextf.com/' + fund.image,
        fundSymbol: fund.symbol,
        fundName: fund.name,
        rationale: rationaleLines,
        endTimestamp,
        assets
      }
      // console.log(payload)

      return axios.post(this.$store.state.APIs.broadcastProposalToDiscord, payload)
    },
    sendMessageToTelegram(fund, rationale, endTimestamp, assets) {
      if (!this.broadcastToChannels) {
        return Promise.resolve('Broadcast to Telegram: skipped')
      }

      const payload = {
        userId: this.$store.state.user.userId,
        networkId: this.currentNetwork.chainId,
        fundSymbol: fund.symbol,
        fundName: fund.name,
        rationale,
        endTimestamp,
        assets
      }
      // console.log(payload)

      return axios.post(this.$store.state.APIs.broadcastProposalToTelegram, payload)
    },
    /**
     *
     */
    creatingFund(data, step = '') {
      this.log('CREATING', JSON.stringify(data))
      const msg = {
        type: '',
        header: `${step} Create your Fund ${data.symbol}`,
        subHeaders: ['Please accept the transaction in MetaMask...']
      }
      this.setDimmer(true, false, msg)
      this.$store.dispatch('setWorkInProgress', true)
      const f = this.getFundBySymbol(data.symbol)
      if (f) {
        f.launchDate = 'Creating...'
        f.creating = true
        this.evalFundStatus(f, 'creatingFund')

        f.canInvest = false
        f.canRedeem = false
      } else {
        console.error('Fund not in memory')
      }
    },
    initializingFund(data, step = '') {
      const msg = {
        type: '',
        header: `${step} Initialize your Fund ${data.symbol}`,
        subHeaders: ['Please accept the transaction in MetaMask...']
      }
      this.setDimmer(true, false, msg)
      this.$store.dispatch('setWorkInProgress', true)
      const f = this.getFundBySymbol(data.symbol)
      if (f) {
        f.launchDate = 'Initializing...'
        f.initializing = true
        this.evalFundStatus(f, 'initializingFund')

        f.canInvest = false
        f.canRedeem = false
      } else {
        console.error('Fund not in memory')
      }
    },
    fundLaunchCreationCompleted(data, error) {
      this.log('fundLaunchCreationCompleted', error ? 'with error: ' + error : '', data)

      const f = this.getFundBySymbol(data.symbol)
      if (f) {
        f.address = data.address
        f.creating = false
        this.evalFundStatus(f, 'fundLaunchCreationCompleted')

        let msg
        if (error) {
          msg = {
            type: 'error',
            supportEmailSubject: `Error creating fund ${data.symbol}`,
            supportEmailBody: error,
            header: 'ERROR',
            subHeaders: [`Oops, something went wrong when creation your Fund ${data.symbol}`],
            lines: [error]
          }
        } else {
          msg = {
            type: 'ok',
            header: `Your Fund ${data.symbol} has been successfully created`,
            subHeaders: [`It's contract address is ${data.address}`]
          }
        }
        this.setDimmer(true, true, msg)
      } else {
        console.error('Fund not in memory')
      }

      this.$store.dispatch('setWorkInProgress', false)
    },
    fundLaunchInitializationCompleted(data, error) {
      this.log(
        'fundLaunchInitializationCompleted',
        error ? 'with error: ' + error : ''
        // , JSON.stringify(data)
      )

      const f = this.getFundBySymbol(data.symbol)
      if (f) {
        f.launchDate = data.launchDate
        f.initializing = false
        this.evalFundStatus(f, 'fundLaunchInitializationCompleted')

        let msg
        if (error) {
          msg = {
            type: 'error',
            supportEmailSubject: `Error creating fund ${data.symbol}`,
            supportEmailBody: error,
            header: 'ERROR',
            subHeaders: [`Oops, something went wrong when initializing your Fund ${data.symbol}`],
            lines: [error]
          }
        } else {
          f.canInvest = true
          f.canRedeem = true

          msg = {
            type: 'ok',
            header: `Your Fund ${data.symbol} has been successfully launched`,
            subHeaders: [`It's contract address is ${f.address}`]
          }
        }
        this.setDimmer(true, true, msg)
      } else {
        console.error('Fund not in memory')
      }

      this.$store.dispatch('setWorkInProgress', false)
    },
    forcePasswordChangeCompleted() {
      $('#changePasswordModal').modal('hide')

      // Give the time to  complete the modal transition,
      // then update the flag and proceed with the load
      setTimeout(() => {
        this.$store.state.user.needToChangePassword = undefined
        this.$store.dispatch('updateUserCookie')

        this.load()
      }, this.modalDuration * 1.2)
    },
    /**
     * Connect to the system with Email and password
     */
    connectEmail(params) {
      this.log(`${this.$options.name}.connectEmail`)

      if (this.workInProgress) return
      this.$store.dispatch('setWorkInProgress', true)

      this.emailLoginErrors = []

      try {
        params.type = 'email'

        const msg = {
          type: '',
          header: 'Logging you in...',
          subHeaders: [`Please wait, it won't take long...`]
        }

        this.setDimmer(true, false, msg, 'medium')
        this.$store.dispatch('setWorkInProgress', true)

        this.$store
          .dispatch('login', params)
          .then(async () => {
            delete params.pwd

            this.triggerGAEvent('home_page_login_fm_success')

            // setWorkInProgress to false, otherwise .load() will immediately return
            this.$store.dispatch('setWorkInProgress', false)

            if (this.needToChangePassword) {
              $('#changePasswordModal').modal('show')
            } else {
              await this.load(true)
            }
          })
          .catch((error) => {
            this.emailLoginErrors = error.response.data.errors
            this.setDimmer(false)
          })
          .finally(() => {
            this.$store.dispatch('setWorkInProgress', false)
            this.setDimmer(false)
          })
      } catch (error) {
        console.error(error)
        let err
        if (error.code == 4001) {
          err = error.message
        } else {
          err = 'Error during Email connection!'
        }

        this.emailLoginErrors = [err]
        this.setDimmer(false)
        this.$store.dispatch('setWorkInProgress', false)
      }
    },
    async load(isReload = false) {
      this.selectFund(undefined)

      if (!this.$store.state.user || !this.$store.state.user.userId || isReload) {
        this.$store.dispatch('setAssets', [])
        this.$store.dispatch('setCompanies', [])
        this.$store.dispatch('setFunds', [])
        this.$store.dispatch('setTopFunds', [])
        this.$store.dispatch('setMakerOrders', [])
        if (!isReload) return
      }

      if (this.workInProgress) return

      if (this.needToChangePassword) return

      if (!this.connector) {
        if (this.$route.params && this.$route.params.network == 'ethereum') {
          this.connecting = true
          this.$store.dispatch('setWorkInProgress', true) // new

          await this.$store
            .dispatch('connect', this.$route.params)
            .then((credentials) => {
              this.connecting = false
            })
            .catch((error) => {
              if (error.message === 'Already processing eth_requestAccounts. Please wait.') {
                $('body').toast({
                  position: 'top attached',
                  class: 'orange centered',
                  title: 'MetaMask',
                  message: 'MetaMask request in progress. Check the plugin.',
                  displayTime: 3000
                })
                return
              } else {
                // Log out the user so that he can start over again
                this.$store
                  .dispatch('setWorkInProgress', true)
                  .then(this.$store.dispatch('logout'))
                  .finally(() => {
                    this.$router.push({ name: 'home' })
                    this.$store.dispatch('setWorkInProgress', false)
                  })
                return
              }
            })
            .finally(() => {
              this.$store.dispatch('setWorkInProgress', false) // new
            })
        } else {
          // Unknown blockchain, log out the user so that he can choose one
          this.$store
            .dispatch('setWorkInProgress', true)
            .then(this.$store.dispatch('logout'))
            .finally(() => {
              this.$router.push({ name: 'home' })
              this.$store.dispatch('setWorkInProgress', false)
            })
          return
        }
      }

      if (!this.isConnected || !this.isNetworkValid || this.connecting) {
        return
      }

      console.time(this.$options.name + '.load (TOTAL)')

      const msg = {
        type: '',
        header: 'Loading Funds',
        subHeaders: [`Please wait, it won't take long...`]
      }
      this.setDimmer(true, false, msg, 'medium')
      this.$store.dispatch('setWorkInProgress', true)

      let errorMessage

      let topFundSymbols = []

      if (this.isEthereum) {
        if (!this.isProduction) {
          // TO TEST:
          topFundSymbols.push('XTF2000DV2')
          topFundSymbols.push('XTF2000F00')
          topFundSymbols.push('XTF2000F01')
          topFundSymbols.push('XTF2000F02')
          topFundSymbols.push('XTF2000F03')
        } else {
          console.time(this.$options.name + '.load.topFunds')
          this.log('Assets API', this.$store.state.APIs.featuredFunds)
          await axios
            .get(this.$store.state.APIs.featuredFunds)
            .then(({ data }) => {
              // console.log(data)
              topFundSymbols = data.featured || []
            })
            .catch(async (err) => {
              console.error(err)
              errorMessage = {
                type: 'error',
                supportEmailSubject: `Loading error (1/4)`,
                supportEmailBody: '',
                header: 'ERROR',
                subHeaders: ['Oops, something went wrong during loading (step 1/4)']
              }
              topFundSymbols = []
            })
            .finally(() => {
              console.timeEnd(this.$options.name + '.load.topFunds')
            })
        }
      }

      // console.log('topFundSymbols', topFundSymbols.length)
      await this.$store.dispatch('setTopFunds', topFundSymbols)

      console.time(this.$options.name + '.load.assets')
      // console.log('Assets API', this.$store.state.APIs.assets)

      let assets = []
      await axios
        .get(this.$store.state.APIs.assets, {
          params: { network: this.currentNetwork.chainId }
        })
        .then(async ({ data }) => {
          // console.log('assets', data.assets.length)
          assets = data.assets || []

          /* TEST new assets */
          /*
          assets.push({
            symbol: '1INCH.e',
            network: '43114',
            website: 'https://1inch.exchange/',
            coinGecko: 'https://www.coingecko.com/en/coins/1inch',
            contract: '0xd501281565bf7789224523144Fe5D98e8B28f267',
            priceSymbol: '1INCH',
            isActive: true,
            image: 'images/assets/1inch.png',
            notes: ['DeFi', 'Dex'],
            category: 'Crypto Currency',
            decimals: 18,
            isKyberCompatible: false,
            description: '1Inch',
            color: '#C7382F'
          })
          */

          if (this.isProduction && this.isEthereum) {
            // TO DO: IMPORTANT when we are fully in V2 and there are no more funds with the current KNC
            // we can rename KNC > KNCL and add the new KNC to the DB
            const oldKNC = assets.find((a) => a.symbol == 'KNC')
            if (oldKNC) {
              oldKNC.description = 'KNC - Legacy'
              oldKNC.symbol = 'KNCL'
              oldKNC.image = 'images/assets/kncl.png'
              oldKNC.isKyberCompatible = false
              oldKNC.priceSymbol = 'KNCL'

              assets.push({
                category: 'Crypto Currency',
                color: '#31CB9D',
                contract: '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202',
                decimals: 18,
                description: 'Kyber Network Crystal',
                symbol: 'KNC',
                image: 'images/assets/knc.svg',
                isActive: true,
                isDisabled: false,
                isKyberCompatible: true,
                notes: [],
                priceSymbol: 'KNC',
                website: 'https://kyber.network',
                coinGecko: 'https://www.coingecko.com/en/coins/kyber-network-crystal'
              })
            }
          }

          // TODO: This sorting should be done in the lambda:
          assets.sort((a, b) => {
            // if (a.category < b.category) return -1
            // if (a.category > b.category) return 1
            if (a.symbol < b.symbol) return -1
            if (a.symbol > b.symbol) return 1
            return 0
          })

          assets.forEach((a) => a.notes.sort())
        })
        .catch(async (err) => {
          console.error(err)
          errorMessage = {
            type: 'error',
            supportEmailSubject: `Loading error (1/4)`,
            supportEmailBody: '',
            header: 'ERROR',
            subHeaders: ['Oops, something went wrong during loading (step 1/4)']
          }
          assets = []
        })
        .finally(() => {
          console.timeEnd(this.$options.name + '.load.assets')
        })
      // console.log('assets', assets.length)
      await this.$store.dispatch('setAssets', assets)

      if (errorMessage) {
        console.timeEnd(this.$options.name + '.load (TOTAL)')
        this.setDimmer(true, true, errorMessage)
        this.$store.dispatch('setWorkInProgress', false)
        return
      }

      // Fetch the Assets' prices
      console.time(this.$options.name + '.load.asset.prices')
      this.$store
        .dispatch('fetchCurrentAssetPrices', {
          fetchFullData: false,
          caller: 'CommandCentre.load (load.asset.prices)'
        })
        .finally(() => {
          console.timeEnd(this.$options.name + '.load.asset.prices')
        })

      console.time(this.$options.name + '.load.companies')
      // this.log('Companies API', this.$store.state.APIs.companies)

      let companies = []
      await axios
        .get(this.$store.state.APIs.companies)
        .then(async ({ data }) => {
          // console.log(data)
          companies = data.companies || []
        })
        .catch(async (err) => {
          console.error(err)
          errorMessage = {
            type: 'error',
            supportEmailSubject: `Loading error (2/4)`,
            supportEmailBody: '',
            header: 'ERROR',
            subHeaders: ['Oops, something went wrong during loading (step 2/4)']
          }
          companies = []
        })
        .finally(() => {
          console.timeEnd(this.$options.name + '.load.companies')
        })
      // console.log('companies', companies.length)
      await this.$store.dispatch('setCompanies', companies)

      if (errorMessage) {
        console.timeEnd(this.$options.name + '.load (TOTAL)')
        this.setDimmer(true, true, errorMessage)
        this.$store.dispatch('setWorkInProgress', false)
        return
      }

      if (false && this.isEthereum) {
        console.time(this.$options.name + '.load.makerOrders')
        this.log('makerOrders API', this.$store.state.APIs.makerOrders)
        let makerOrders = []
        // FOR THE MOMENT COMMENTED
        await axios
          .get(this.$store.state.APIs.makerOrders, {
            params: {
              userId: this.$store.state.user.userId,
              networkId: this.currentNetwork.chainId
            }
          })
          .then(async ({ data }) => {
            // console.log(data)
            makerOrders = data.makerOrders || []
          })
          .catch(async (err) => {
            console.error(err)
            errorMessage = {
              type: 'error',
              supportEmailSubject: `Loading error (3/4)`,
              supportEmailBody: '',
              header: 'ERROR',
              subHeaders: ['Oops, something went wrong during loading (step 3/4)']
            }
            makerOrders = []
          })
          .finally(() => {
            console.timeEnd(this.$options.name + '.load.makerOrders')
          })
        // console.log('makerOrders', Object.keys(makerOrders).length)
        await this.$store.dispatch('setMakerOrders', makerOrders)
      }

      if (errorMessage) {
        console.timeEnd(this.$options.name + '.load (TOTAL)')
        this.setDimmer(true, true, errorMessage)
        this.$store.dispatch('setWorkInProgress', false)
        return
      }

      console.time(this.$options.name + '.load.funds')
      // console.log('Funds API', this.$store.state.APIs.funds)

      let funds = []
      await axios
        .post(this.$store.state.APIs.funds, {
          userId: this.$store.state.user.userId,
          networkId: this.currentNetwork.chainId
        })
        .then(({ data }) => {
          // console.log('funds', data.funds.length)
          const imagepath = 'images/'
          funds = data.funds
          funds.forEach((f) => {
            // This won't be necessary anymore once all funds have the allocation
            if (!f.allocation) {
              f.allocation = { inception: {} }
              f.allocation.inception.date = f.launchDate
              f.allocation.inception.assets = []
              f.assets.forEach((a) => {
                f.allocation.inception.assets.push({
                  percentage: a.percentage,
                  price: a.launchPrice,
                  symbol: a.symbol,
                  unitQuantity: a.unitQuantity
                })
              })
              this.log(`missing fund.allocation for ${f.symbol}, built it`)
            }

            // For each allocation, replace the strings with BigNumbers
            Object.keys(f.allocation).forEach((key) => {
              f.allocation[key].assets.forEach((a) => {
                a.price = new BigNumber(a.price || 0)
                a.unitQuantity = new BigNumber(a.unitQuantity || 0)
              })
            })

            // For the moment I manage 1 pair
            f.uniswapInfo = f.uniswapInfo && f.uniswapInfo.length > 0 ? f.uniswapInfo[0] : {}
            if (f.image && !f.image.startsWith(imagepath)) {
              f.image = imagepath + f.image
            }
          })
        })
        .catch((err) => {
          console.error(err)
          errorMessage = {
            type: 'error',
            supportEmailSubject: `Loading error (4/4)`,
            supportEmailBody: '',
            header: 'ERROR',
            subHeaders: ['Oops, something went wrong during loading (step 4/4)']
          }
          funds = []
        })
        .finally(() => {
          console.timeEnd(this.$options.name + '.load.funds')

          if (errorMessage) {
            console.timeEnd(this.$options.name + '.load (TOTAL)')

            this.setDimmer(true, true, errorMessage)
            this.$store.dispatch('setWorkInProgress', false)
            this.$store.state.dappLoaded = true
          } else {
            this.$store.dispatch('setFunds', funds).then(async () => {
              // this.$store.dispatch('setWorkInProgress', false)

              await this.$store.dispatch('fetchEthPrice')

              if (funds.length > 0) {
                // Simple page dimmer
                this.setDimmer(true, false, undefined, 'very light')

                const promises = funds.map((fund) => this.refreshFund(fund))

                Promise.all(promises).then(() => {
                  console.timeEnd(this.$options.name + '.load (TOTAL)')

                  this.setDimmer(false)
                  this.$store.dispatch('setWorkInProgress', false)
                  this.$store.state.dappLoaded = true
                })
              } else {
                this.setDimmer(false)
                this.$store.dispatch('setWorkInProgress', false)
                this.$store.state.dappLoaded = true
              }
            })
          }
        })
    },
    refreshFund(fund, time = false) {
      if (time) console.time(`refreshFund ${fund.symbol}`)

      this.$store.dispatch('updateFundState', {
        symbol: fund.symbol,
        refreshing: true
      })

      const resultPromise = new Promise((resolve, reject) => {
        const fundRefreshPromises = [
          this.$store.dispatch('updateFundBalance', fund.symbol),
          this.$store.dispatch('updateFundModules', fund.symbol),
          this.$store.dispatch('updateRebalanceInfo', fund.symbol),
          this.$store.dispatch('updateFundCurrentAllocation', fund.symbol),
          this.$store.dispatch('fetchFundUniswapPrice', fund.symbol)
        ]

        Promise.all(fundRefreshPromises)
          .then(() => {
            // Link to Maker Orders
            if (this.$store.state.makerOrders.length > 0) {
              const takerBuyPositions = this.$store.getters.getMakerOrdersByFundSymbol(
                fund.symbol,
                true
              )
              const takerSellPositions = this.$store.getters.getMakerOrdersByFundSymbol(
                fund.symbol,
                false
              )

              if (takerBuyPositions.length > 0) {
                fund.takerBuyPositions = takerBuyPositions
              }

              if (takerSellPositions.length > 0) {
                fund.takerSellPositions = takerSellPositions
              }
            }

            resolve('success')
          })
          .catch((error) => {
            console.error(`${fund.symbol} - error refreshing fund: ${error}`)
            reject(`${fund.symbol} - error refreshing fund: ${error}`)
          })
          .finally(() => {
            this.$store.dispatch('updateFundState', {
              symbol: fund.symbol,
              refreshing: false
            })
            if (time) console.timeEnd(`refreshFund ${fund.symbol}`)
          })
      })

      return resultPromise
    },
    openInvestWizard(fund) {
      if (!fund.canInvest) {
        return
      }

      this.fundToInvestInto = fund
      this.triggerGAEvent('invest_start')
    },
    investmentCompleted(event) {
      if (event && event.success == true) {
        this.log(this.$options.name, 'investmentCompleted', event)
        this.$store.dispatch('updateFundBalance', event.obj.symbol)
        this.fundToInvestInto = null
      }
    },
    redemptionCompleted(event) {
      if (event && event.success == true) {
        this.log(this.$options.name, 'redemptionCompleted', event)
        this.$store.dispatch('updateFundBalance', event.obj.symbol)
        this.fundToRedeem = null
      }
    },
    orderFilled(event) {
      if (event && event.success == true) {
        this.log(this.$options.name, 'orderFilled', event)
        this.$store.dispatch('updateFundBalance', event.symbol)
        this.buyOrder = null
        this.sellOrder = null
      }
    },
    openRedeemWizard(fund) {
      if (!fund.canRedeem) {
        return
      }

      this.fundToRedeem = fund
      this.triggerGAEvent('redeem_start')
    },
    closeFeedbackMessage() {
      $('#feedbackMessageId').transition('fade')
    },
    goTo(address, target) {
      if (address) {
        window.open(address, target)
        return true
      }
      return false
    },
    keyDownListener(event) {
      // console.log('CommandCentre.keyDownListener')
      if (event.code === 'Escape' || event.code === 'Esc') {
        this.showCreation = false
        this.hideModal('#fundFiltersModalId')
      }
    },
    searchInputKeyDown(event) {
      // First thing to do is to stop the event propagation
      event.stopPropagation()

      if (event.code === 'Escape' || event.code === 'Esc') {
        this.$refs.searchInput.value = ''
        this.searchText = this.$refs.searchInput.value
        // this.$refs.searchInput.blur()
      }
    },
    searchInputKeyUp(event) {
      // First thing to do is to stop the event propagation
      event.stopPropagation()

      this.searchText = this.$refs.searchInput.value
    },
    async checkFundExistsInChain(symbol) {
      if (!this.connector) return undefined

      const promises = []
      const fundList = await this.connector.ControllerApi.getFundList()
      fundList.forEach((fund) => promises.push(this.connector.getTokenDetails(fund)))
      return await Promise.all(promises).then((tokenDetails) => {
        const existingFund = tokenDetails.find((d) => d.data.symbol == symbol)
        return existingFund && existingFund.data ? existingFund.data.address : undefined
      })
    },
    async accrueFee(fund) {
      this.log(this.$options.name, 'accrueFee')

      if (!fund) {
        return
      }

      if (!this.connector) {
        this.log('not connected')
        return
      }

      if (!this.isAdmin) {
        this.log('Accrual cannot be done by non-Admin')
        return
      }

      let msg = {}
      let header = `Accrue fees for Fund ${fund.symbol}`
      let subHeaders = []
      const transactionDesc = 'ACCRUE FEE'

      subHeaders.push(`Please accept the ${transactionDesc} transaction in MetaMask...`)
      subHeaders.push('')

      msg = {
        type: '',
        header,
        subHeaders: subHeaders
      }

      this.setDimmer(true, false, msg)

      this.$store.dispatch('setWorkInProgress', true)

      let errorMessages = []

      try {
        const streamingFeeApi = this.connector.streamingFeeApi

        let result = await streamingFeeApi.accrueFee(fund.address)

        if (result.errors.length === 0) {
          const transactionAddress = result.data.contractTransaction.hash

          msg = {
            type: '',
            header,
            subHeaders: [
              `Transaction hash: ${transactionAddress}`,
              '',
              'Do not change the transaction in MetaMask',
              'Do not close the window',
              '',
              'Please wait...'
            ]
          }
          this.setDimmer(true, false, msg)

          const totalTimeoutInMillis = 30 * 60 * 1000 // 30 mins
          result = await this.connector.waitForTransaction(
            transactionAddress,
            1,
            totalTimeoutInMillis
          )
          if (result.errors.length == 0) {
            // 0 means reverted
            if (result.data.transactionReceipt.status == 0) {
              msg = {
                type: 'error',
                header,
                subHeaders: ['Oops, something went wrong'],
                lines: [`Transaction ${transactionAddress} reverted`]
              }
            } else {
              msg = {
                type: 'ok',
                header,
                subHeaders: ['Fees successfully accrued']
              }

              this.$store.dispatch('fetchStreamingFeeModuleSettings', fund.symbol)
            }
          } else {
            const errorMessages = result.errors.map((logMessage) => logMessage.message)

            msg = {
              type: 'error',
              header,
              subHeaders: ['Oops, something went wrong'],
              lines: errorMessages
            }
          }

          this.setDimmer(true, true, msg)
        } else {
          const errorMessages = result.errors.map((logMessage) => logMessage.message.message)
          console.error('Errors are present:', errorMessages)

          msg = {
            type: 'error',
            header,
            subHeaders: [
              `Oops, something went wrong when accruing the fees of the Fund ${fund.symbol}`
            ],
            lines: ['Could not accrue the fees']
          }

          this.setDimmer(true, true, msg)
        }
      } catch (accrueError) {
        console.error('Errors are present:', accrueError)

        msg = {
          type: 'error',
          header,
          subHeaders: [
            `Oops, something went wrong when accruing the fees of the Fund ${fund.symbol}`
          ],
          lines: [accrueError]
        }
        this.setDimmer(true, true, msg)
      }

      this.$store.dispatch('setWorkInProgress', false)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
i.sort.amount {
  color: #525252;
  margin: 0px;
  cursor: pointer;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

/* To center vertically */
.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

/* To center horizontally */
.modal-container {
  width: 1000px;
  height: 864px;
  margin: auto;
  transition: all 0.7s ease;
}

/* To center horizontally */
.modal-error-container {
  width: 90%;
  max-width: 700px;
  margin: auto;
  padding: 20px 30px;
  transition: all 0.7s ease;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

#centerPanel {
  transition: width 0.5s;
}

/*--------------
  Semantic UI overrides
  ---------------*/

.ui.secondary.menu > .item,
.right.menu > .item {
  padding-left: 0;
  padding-right: 0;
}

.ui.vertical.segment {
  padding: 0;
}
</style>
