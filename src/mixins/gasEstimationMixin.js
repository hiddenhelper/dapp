/**
 * A module to retrieve gas price estimates
 * @module cryptoPriceHelpers
 */

import axios from 'axios'

const API_KEY = '0911d24b87dea6e41822b85ee24647c90e9f73b415cfda5ee3faba4c52db'
// const ETH_GAS_STATION_API_URL = 'https://data-api.defipulse.com/api/v1/egs/api/ethgasAPI.json'
const ETH_GAS_STATION_API_URL = 'https://ethgasstation.info/api/ethgasAPI.json'
// const ETH_GAS_STATION_API_URL = 'https://ethgasstation.info/json/ethgasAPI.json'
const FULL_URL = getFullURL(ETH_GAS_STATION_API_URL, { 'api-key': API_KEY })
const FAILOVER_URL = 'https://api.dextf.com/dcp/gas/price'

const USE_FAILOVER = true

/**
 * Current recommended fastest, fast, standard and safe low gas prices in x10 Gwei
 */
const priceEstimations = {
  safeLow: {
    priceInGwei: 0,
    avgTime: 0,
    timeGroup: '< 30 mins'
  },
  average: {
    priceInGwei: 0,
    avgTime: 0,
    timeGroup: '< 5 mins'
  },
  fast: {
    priceInGwei: 0,
    avgTime: 0,
    timeGroup: '< 2 mins'
  },
  fastest: {
    priceInGwei: 0,
    avgTime: 0,
    timeGroup: '~ 30 secs'
  }
}

let gasPriceRange = []

/**
 * Current recommended fastest, fast, standard and safe low gas prices in x10 Gwei
 */
var gasEstimationMixin = {
  data() {
    return {
      priceEstimations: priceEstimations,
      gasPriceRange: gasPriceRange
    }
  },
  methods: {
    async fetchEstimations() {
      if (USE_FAILOVER) {
        const data = await axios.get(FAILOVER_URL).then((result) => {
          return result.data.data
        })

        console.log('Failover data', data)

        // The API returns prices in Wei, so I need to divide by 10^9
        priceEstimations.safeLow.priceInGwei = data.slow / Math.pow(10, 9)

        priceEstimations.average.priceInGwei = data.standard / Math.pow(10, 9)

        priceEstimations.fast.priceInGwei = data.fast / Math.pow(10, 9)

        priceEstimations.fastest.priceInGwei = data.rapid / Math.pow(10, 9)
      } else {
        const data = await axios.get(FULL_URL).then(({ data }) => {
          return data
        })

        console.log('Eth Gas Station data', data)

        // The API returns prices in x10 Gwei, so I need to divide by 10
        priceEstimations.safeLow.priceInGwei = data.safeLow / 10
        priceEstimations.safeLow.avgTime = minutesToString(data.safeLowWait)

        priceEstimations.average.priceInGwei = data.average / 10
        priceEstimations.average.avgTime = minutesToString(data.avgWait)

        priceEstimations.fast.priceInGwei = data.fast / 10
        priceEstimations.fast.avgTime = minutesToString(data.fastWait)

        priceEstimations.fastest.priceInGwei = data.fastest / 10
        priceEstimations.fastest.avgTime = minutesToString(data.fastestWait)

        // Clear the gasPriceRange array with a splice and add new items.
        // Do not replace the full array or we loose reactivity.
        gasPriceRange.splice(0, gasPriceRange.length)
        Object.entries(data.gasPriceRange).forEach(([key, value]) => {
          gasPriceRange.push({ key: key / 10, value: value })
        })

        // console.log('gasPriceRange', gasPriceRange)
      }

      // console.log('priceEstimations', priceEstimations)
      return priceEstimations
    },
    estimateTime(gasPrice) {
      return minutesToString(closest(gasPrice, gasPriceRange).value)
    }
  }
}

/**
 * Prepare full url
 * @function
 * @param {string} url - The url
 * @param {QueryParameter[]} [parameters] - The parameters for the query string
 * @returns {string}  Full url including the query string with parameters
 */
function getFullURL(url, parameters = []) {
  const params = []
  for (let key in parameters) {
    params.push(`${key}=${parameters[key]}`)
  }
  return url + (params.length > 0 ? '?' + params.join('&') : '')
}

function closest(toFind, values) {
  return values.reduce((a, b) => {
    let aDiff = Math.abs(a.key - toFind)
    let bDiff = Math.abs(b.key - toFind)

    if (aDiff == bDiff) {
      return a.key > b.key ? a : b
    } else {
      return bDiff < aDiff ? b : a
    }
  })
}

function minutesToString(totMinutes) {
  let days = Math.floor(totMinutes / 1440)
  let remainder = totMinutes % 1440

  let hours = Math.floor(remainder / 60)
  remainder = remainder % 60

  let minutes = Math.floor(remainder)
  let seconds = Math.floor((remainder - minutes) * 60)

  let str = ' '
  if (days > 0) {
    str += `${days}d `
  }
  if (hours > 0) {
    str += `${hours}h `
  }
  if (minutes > 0) {
    str += `${minutes}m `
  }
  if (seconds > 0) {
    str += `${seconds}s`
  }

  // console.log(totMinutes, str)

  return str
}

export { gasEstimationMixin }
