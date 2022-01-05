<template>
  <div
    class="ui minimal comments"
    style="max-width: 950px; width: 100%; margin-top: 0; margin-bottom: 0"
  >
    <div class="comment">
      <div class="avatar center aligned" v-html="rebalanceData.iconClass"></div>

      <i
        id="rationalePopup"
        v-show="showRationale"
        class="lightbulb outline icon right floated _pointer"
        style="margin: 0"
        :data-content="`FUND MANAGER'S RATIONALE: ${fund.rebalance.rationale}`"
        data-position="bottom right"
        data-variation="wide inverted"
      ></i>

      <div class="content">
        <span
          class="author"
          :class="{
            _info: fund.rebalance.state == 'Proposal',
            _green: fund.rebalance.state == 'Trading'
          }"
          style="
            text-transform: uppercase;
            margin-right: 0.5rem;
            xbackground-color: green;
          "
        >
          {{ rebalanceData.title.trim() }}
        </span>
        <div class="metadata" style="margin-left: 0; xbackground-color: red">
          <div v-for="(meta, index) in rebalanceData.metadata" :key="index">
            <!-- <span v-if="index > 0" style="color: white; margin-right: 0.5rem">
              |
            </span> -->
            <i v-if="index > 0" class="ellipsis vertical icon"></i>
            <span v-html="meta"></span>
          </div>
        </div>
        <div class="text _muted" v-html="rebalanceData.text"></div>
        <div v-if="rebalanceData.actions.length > 0" class="actions">
          <a
            v-for="(action, index) in rebalanceData.actions"
            :key="index"
            v-html="action.html"
            style="margin-left: 0.5rem"
            @click.stop="$emit(action.event, fund)"
          ></a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import numeral from 'numeral'
import BigNumber from 'bignumber.js'

export default {
  name: 'RebalanceInfoBar',
  components: {},
  props: {
    fund: {
      type: Object,
      required: true
      // default: () => {
      //   return {}
      // }
    },
    user: {
      type: String,
      default: 'Investment',
      validator: function (value) {
        return ['Investor', 'Manager', 'Trader'].includes(value)
      }
    },
    titlePrefix: {
      type: String,
      default: ''
    },
    showRationale: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {}
  },
  computed: {
    rebalanceData() {
      const data = {
        iconClass: '',
        title: `${this.titlePrefix} ${this.fund.rebalance.state}`,
        metadata: [],
        text: '',
        actions: []
      }

      //
      // Upgrade required
      //
      if (this.fund.rebalance.state == 'Upgradeable') {
        data.title = `${this.titlePrefix}`

        data.iconClass =
          '<i class="circular colored yellow exclamation icon" style="margin: 0"></i>'
        data.metadata.push(`New version available`)
        data.actions.push({
          html: `<span class="_warning" data-tooltip="Add the new version of the Rebalance module" data-position="bottom right" data-inverted=""><!--<i class="stop icon"></i>-->Upgrade</span>`,
          event: 'upgradeModule'
        })
        data.text =
          'Edit the fund and add the new version of the Rebalance module.'
      }

      //
      // Trading
      //
      else if (this.fund.rebalance.state == 'Trading') {
        const pct = this.fund.rebalance.tradedFundTokens
          .div(this.fund.rebalance.maxTradedFundTokens)
          .times(100)
          .toNumber()

        data.iconClass =
          pct == 100
            ? '<i class="circular colored green double check icon" style="margin: 0"></i>'
            : '<i class="circular colored green spinner loading icon" style="margin: 0"></i>'

        if (this.fund.rebalance.tradingTimestamp) {
          const tradingStartDate = new Date(
            this.fund.rebalance.tradingTimestamp
          )
          data.metadata.push(
            `started on <b>${tradingStartDate.toLocaleString()}</b>`
          )
        }
        data.metadata.push(`<b>${this.formatPct(pct, 2)}</b> completed`)
        if (this.user == 'Manager') {
          data.actions.push({
            html: `<span class="_green" data-tooltip="Close the rebalance" data-position="bottom right" data-inverted=""><!--<i class="stop icon"></i>-->Close</span>`,
            event: 'closeTrading'
          })
        }
        const tradedFundTokens = this.formatQuantity(
          this.fund.rebalance.tradedFundTokens
        )
        const maxTradedFundTokens = this.formatQuantity(
          this.fund.rebalance.maxTradedFundTokens
        )
        let remainingTokens = this.fund.rebalance.maxTradedFundTokens.minus(
          this.fund.rebalance.tradedFundTokens
        )

        // The smallest among remainingTokens and totalSupply
        remainingTokens = BigNumber.minimum(
          remainingTokens,
          this.fund.totalNoOfTokens
        )

        remainingTokens = this.formatQuantity(remainingTokens)

        data.text =
          'Remaining supply to rebalance: <b>' +
          remainingTokens +
          '</b> fund tokens.'

        if (pct == 100) {
          data.text += ' Rebalance completed.'
        }
      }

      //
      // Proposal
      //
      else if (this.fund.rebalance.state == 'Proposal') {
        const slippage = this.fund.rebalance.slippage.toNumber()
        let colorClass = ''
        const dataText = {
          color: slippage > 0 ? '_green' : '_red',
          text: slippage > 0 ? 'increase' : 'drop',
          iconDirection: slippage > 0 ? 'up' : 'down',
          position: slippage > 0 ? 'top right' : ''
        }

        data.iconClass = '<i class="icons">'
        if (Math.abs(slippage) > 5) {
          // colorClass = '_warning'
          colorClass = '_info'
          data.iconClass += `<i class="circular colored teal exclamation icon ${colorClass}"></i>`
        } else {
          colorClass = '_info'
          data.iconClass += `<i class="circular colored teal info icon ${colorClass}"></i>`
        }
        data.iconClass += `<i class="${dataText.position} corner inverted arrow alternate circle ${dataText.iconDirection} outline icon ${dataText.color}" style="font-size: 0.9em"></i>`
        data.iconClass += '</i>'

        const proposalEndTimestampMillis =
          this.fund.rebalance.proposalEndTimestamp * 1000
        const proposalEndDate = new Date(proposalEndTimestampMillis)
        if (proposalEndTimestampMillis < Date.now()) {
          data.metadata.push(
            `ended on <b>${proposalEndDate.toLocaleString()}</b>`
          )
        } else {
          data.metadata.push(
            `will end on <b>${proposalEndDate.toLocaleString()}</b>`
          )
        }

        data.text =
          `Based on the current asset prices a full rebalance will
           <span class="${dataText.color}">${
            dataText.text
          }<i class="ui long arrow alternate ${
            dataText.iconDirection
          } icon" style="margin: 0"></i></span>
          the fund price by <b class="${dataText.color}">${this.formatPct(
            Math.abs(slippage),
            2
          )}</b> ` +
          '<span data-tooltip="Estimate based on the current asset prices" data-position="top center" data-inverted=""><i id="rationalePopup" class="info circle icon _pointer" style="margin: 0"></i></span>.' +
          data.text

        if (this.user == 'Manager') {
          data.actions.push({
            html: '<span class="_green" data-tooltip="Cancel the rebalance proposal" data-position="bottom right" data-inverted=""><!--<i class="stop icon"></i>-->Cancel</span>',
            event: 'cancelProposal'
          })
          if (proposalEndTimestampMillis < Date.now()) {
            data.actions.push({
              html: '<span class="_green" data-tooltip="Start the trading session" data-position="bottom right" data-inverted=""><!--<i class="stop icon"></i>-->Start Trading</span>',
              event: 'startTrading'
            })
            // data.metadata.push(`ended on <b>${proposalEndDate.toLocaleString()}</b>`)
          } else {
            // data.metadata.push(`will end on <b>${proposalEndDate.toLocaleString()}</b>`)
          }
        }

        if (proposalEndTimestampMillis < Date.now()) {
          data.text =
            '<u>The trading session can start any time from now</u>. ' +
            data.text
        }

        if (this.user == 'Investor') {
          data.text =
            data.text +
            ' As an investor, review the proposal to decide to hold/redeem your fund tokens.'
        }
      }
      // data.iconClass = "circular colored teal info icon _info"
      // data.iconClass = "circular colored teal bullhorn icon _info"
      // data.iconClass = "circular colored teal bell outline icon _info"
      // data.iconClass = "circular colored teal check double icon _info"
      // data.iconClass = "circular colored teal ui broadcast tower icon _info"

      return data
    }
  },
  created() {
    numeral.zeroFormat('0.00')
    numeral.nullFormat('0.00')
  },
  mounted() {
    $('#rationalePopup').popup()
  },
  methods: {
    formatQuantity(n) {
      if (isNaN(n)) return '-'
      let s
      if (n < 100000) {
        s = numeral(n).format('0,0.[000000]')
      } else if (n < 1000000) {
        s = numeral(n).format('0,0.[0000]')
      } else {
        // Use m for millions, etc...
        s = numeral(n).format('0,0.[0000]a')
      }
      return s == 'NaN' ? '0' : s
    },
    formatPct(n, maxDecimals = 4) {
      if (isNaN(n)) return '-'

      return n == 0
        ? '0%'
        : numeral(n).format(`0.[${'0'.repeat(maxDecimals)}]`) + '%'
    }
  }
}
</script>

<style scoped>
</style>