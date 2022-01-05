/**
 * A module to retrieve crypto prices
 * @module cryptoPriceHelpers
 */

import axios from 'axios'

const API_KEY = 'b924a8a780a30055a88bafeb7af1e416b584a83e786a5892d1578135f0d1b19c'

const HEADERS = { Authorization: 'Apikey ' + API_KEY }

const API_SINGLE_URL = 'https://min-api.cryptocompare.com/data/price'
const API_MULTI_URL = 'https://min-api.cryptocompare.com/data/pricemulti'
const API_MULTI_FULL_URL = 'https://min-api.cryptocompare.com/data/pricemultifull'
const API_UNISWAP_URL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'
const COINGECKO_URL = `https://api.coingecko.com/api/v3/simple/token_price`
// const COINGECKO_FULL_URL = `https://api.coingecko.com/api/v3/coins`

const COINGECKO_ASSETS = new Map()

//
// Ethereum
//

COINGECKO_ASSETS.set('DEXTF', {
  id: 'dextf',
  symbol: 'DEXTF',
  address: '0x5f64ab1544d28732f0a24f4713c2c8ec0da089f0'
})
COINGECKO_ASSETS.set('DPI', {
  id: 'defipulse-index',
  symbol: 'DPI',
  address: '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b'
})
COINGECKO_ASSETS.set('AAVE', {
  id: 'aave',
  symbol: 'AAVE',
  address: '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9'
})
COINGECKO_ASSETS.set('RARI', {
  id: 'rarible',
  symbol: 'RARI',
  address: '0xfca59cd816ab1ead66534d82bc21e7515ce441cf'
})
COINGECKO_ASSETS.set('HEGIC', {
  id: 'hegic',
  symbol: 'HEGIC',
  address: '0x584bc13c7d411c00c01a62e8019472de68768430'
})
COINGECKO_ASSETS.set('AUC', {
  id: 'auctus',
  symbol: 'AUC',
  address: '0xc12d099be31567add4e4e4d0d45691c3f58f5663'
})
COINGECKO_ASSETS.set('VOX', {
  id: 'vox-finance',
  symbol: 'VOX',
  address: '0x12d102f06da35cc0111eb58017fd2cd28537d0e1'
})
COINGECKO_ASSETS.set('CORE', {
  id: 'cvault-finance',
  symbol: 'CORE',
  address: '0x62359ed7505efc61ff1d56fef82158ccaffa23d7'
})
COINGECKO_ASSETS.set('PRIA', {
  id: 'pria',
  symbol: 'PRIA',
  address: '0xb9871cb10738eada636432e86fc0cb920dc3de24'
})
COINGECKO_ASSETS.set('NFY', {
  id: 'non-fungible-yearn',
  symbol: 'NFY',
  address: '0x1cbb83ebcd552d5ebf8131ef8c9cd9d9bab342bc'
})
COINGECKO_ASSETS.set('BOND', {
  id: 'barnbridge',
  symbol: 'BOND',
  address: '0x0391d2021f89dc339f60fff84546ea23e337750f'
})
COINGECKO_ASSETS.set('KP3R', {
  id: 'keep3rv1',
  symbol: 'KP3R',
  address: '0x1ceb5cb57c4d4e2b2433641b95dd330a33185a44'
})
COINGECKO_ASSETS.set('CRO', {
  id: 'crypto-com-chain',
  symbol: 'CRO',
  address: '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b'
})
COINGECKO_ASSETS.set('iETH', {
  id: 'ieth',
  symbol: 'iETH',
  address: '0xa9859874e1743a32409f75bb11549892138bba1e'
})
COINGECKO_ASSETS.set('iBTC', {
  id: 'ibtc',
  symbol: 'iBTC',
  address: '0xd6014ea05bde904448b743833ddf07c3c7837481'
})
COINGECKO_ASSETS.set('cWBTC', {
  id: 'compound-wrapped-btc',
  symbol: 'cWBTC',
  address: '0xc11b1268c1a384e55c48c2391d8d480264a3a7f4'
})
COINGECKO_ASSETS.set('XSGD', {
  id: 'xsgd',
  symbol: 'XSGD',
  address: '0x70e8de73ce538da2beed35d14187f6959a8eca96'
})
COINGECKO_ASSETS.set('IDLE', {
  id: 'idle',
  symbol: 'IDLE',
  address: '0x875773784af8135ea0ef43b5a374aad105c5d39e'
})
COINGECKO_ASSETS.set('KNCL', {
  id: 'kyber-network',
  symbol: 'KNCL',
  address: '0xdd974d5c2e2928dea5f71b9825b8b646686bd200'
})
COINGECKO_ASSETS.set('KNC', {
  id: 'kyber-network-crystal',
  symbol: 'KNC',
  address: '0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202'
})
COINGECKO_ASSETS.set('BANK', {
  id: 'bankless-dao',
  symbol: 'BANK',
  address: '0x2d94aa3e47d9d5024503ca8491fce9a2fb4da198'
})
COINGECKO_ASSETS.set('FF', {
  id: 'forefront',
  symbol: 'FF',
  address: '0x7e9d8f07a64e363e97a648904a89fb4cd5fb94cd'
})
COINGECKO_ASSETS.set('FWB', {
  id: 'friends-with-benefits-pro',
  symbol: 'FWB',
  address: '0x35bd01fc9d6d5d81ca9e055db88dc49aa2c699a8'
})
COINGECKO_ASSETS.set('WETH', {
  id: 'weth',
  symbol: 'WETH',
  address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
})

//
// Avalanche
//

// https://api.coingecko.com/api/v3/coins/weth
COINGECKO_ASSETS.set('WETH.e', {
  id: 'weth',
  symbol: 'WETH.e',
  address: '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('WBTC.e', {
  id: 'wbtc',
  symbol: 'WBTC.e',
  address: '0x50b7545627a5162f82a992c33b87adc75187b218',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('USDC.e', {
  id: 'usdc',
  symbol: 'USDC.e',
  address: '0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('USDT.e', {
  id: 'tether',
  symbol: 'USDT.e',
  address: '0xc7198437980c041c805a1edcba50c1ce5db95118',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('DAI.e', {
  id: 'dai',
  symbol: 'DAI.e',
  address: '0xd586e7f844cea2f87f50152665bcbc2c279d8d70',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('AAVE.e', {
  id: 'aave',
  symbol: 'AAVE.e',
  address: '0x63a72806098bd3d9520cc43356dd78afe5d386d9',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('LINK.e', {
  id: 'link',
  symbol: 'LINK.e',
  address: '0x5947bb275c521040051d82396192181b413227a3',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('TIME', {
  id: 'wonderland',
  symbol: 'TIME',
  address: '0xb54f16fb19478766a268f172c9480f8da1a7c9c3',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('JOE', {
  id: 'joe',
  symbol: 'JOE',
  address: '0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('WAVAX', {
  id: 'wrapped-avax',
  symbol: 'WAVAX',
  address: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('ELK', {
  id: 'elk-finance',
  symbol: 'ELK',
  address: '0xe1c110e1b1b4a1ded0caf3e42bfbdbb7b5d7ce1c',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('PEFI', {
  id: 'penguin-finance',
  symbol: 'PEFI',
  address: '0xe896cdeaac9615145c0ca09c8cd5c25bced6384c',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('KLO', {
  id: 'kalao',
  symbol: 'KLO',
  address: '0xb27c8941a7df8958a1778c0259f76d1f8b711c35',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('OOE', {
  id: 'openocean',
  symbol: 'OOE',
  address: '0x0ebd9537a25f56713e34c45b38f421a1e7191469',
  network: 'avalanche'
})
COINGECKO_ASSETS.set('SHIBX', {
  id: 'shibavax',
  symbol: 'SHIBX',
  address: '0x440abbf18c54b2782a4917b80a1746d3a2c2cce1',
  network: 'avalanche'
})

// CoinGecko ids and symbols do not follow a casing standard (!!!),
// so I need a map to link back the id to the original symbol
const COINGECKO_ASSETS_ID_TO_SYMBOL = {}
COINGECKO_ASSETS.forEach((value, key) => {
  COINGECKO_ASSETS_ID_TO_SYMBOL[value.id] = key
})

let uniswapAxios = undefined

/**
 * Represent a (crypto)currency price in another (crypto)currency.
 * For example {'ETH': { 'USD': 148.05 } }.
 * @typedef {Object} CurrencyPrice
 * @property {string} symbol - The (crypto)currency symbol (ETH, BTC,... or USD, EUR, ...)
 * @property {CurrencyValue} price - A key-value pair like { 'USD': 148.05 }
 */

/**
 * Represent a (crypto)currency value.
 * For example { 'USD': 148.05 }.
 * @typedef {Object} CurrencyValue
 * @property {string} symbol - The (crypto)currency symbol (ETH, BTC,... or USD, EUR, ...)
 * @property {number} value
 */

/**
 * @typedef {Object} QueryParameter
 * @property {string} key
 * @property {string} value
 */

/**
 * Get the current price of any (crypto)currency in any other (crypto)currency that you need.
 * @function
 * @param {string} symbol - The (crypto)currency symbol of interest (ETH, BTC,... or USD, EUR, ...)
 * @param {string} [toCurrency=USD] - The (crypto)currency symbol to convert into (ETH, BTC,... or USD, EUR, ...)
 * @example
 * let p = await fetchCurrentPrice('ETH', 'USD')
 * // returns { 'ETH': {'USD': 148.05 } }
 * @returns {CurrencyPrice} Price in the given (crypto)currency
 * @see {@link https://min-api.cryptocompare.com/documentation?key=Price&cat=SingleSymbolPriceEndpoint}
 */
async function fetchCurrentPrice(symbol, toCurrency = 'USD') {
  const parameters = {
    fsym: symbol,
    tsyms: toCurrency
  }

  const fullURL = getFullURL(API_SINGLE_URL, parameters)
  // console.log(fullURL)

  return axios.get(fullURL, { headers: HEADERS }).then(({ data }) => {
    const result = {}
    result[symbol] = data
    return result
  })
}

/**
 * Get the current prices of any set of (crypto)currencies in any other (crypto)currency that you need.
 * @function
 * @param {string[]} symbols - The (crypto)currency symbols of interest (ETH, BTC,... or USD, EUR, ...)
 * @param {string} [toCurrency=USD] - The (crypto)currency symbol to convert into (ETH, BTC,... or USD, EUR, ...)
 * @example
 * let p = await fetchCurrentPrices(['ETH', 'BTC'], 'USD')
 * // returns { 'ETH': {'USD': 148.05 }, 'BTC': {'USD': 7765.02 }  }
 * @returns {CurrencyPrice[]} Prices in the given (crypto)currency
 * @see {@link https://min-api.cryptocompare.com/documentation?key=Price&cat=multipleSymbolsPriceEndpoint}
 */
async function fetchCurrentPrices(symbols, toCurrency = 'USD') {
  let parameters
  let fullURL

  const coinGeckoPromises = []
  const cryptoComparePromises = []
  const result = {}

  const cryptoCompareSymbols = symbols.filter((s) => !COINGECKO_ASSETS.has(s))
  const coinGeckoSymbols = symbols.filter((s) => COINGECKO_ASSETS.has(s))
  const coinGeckoAssets = coinGeckoSymbols.map((s) => COINGECKO_ASSETS.get(s))

  // console.log('symbols', symbols.length) // , symbols)
  // console.log('cryptoCompareSymbols', cryptoCompareSymbols.length) // , cryptoCompareSymbols)
  // console.log('coinGeckoSymbols', coinGeckoSymbols.length) // , coinGeckoSymbols)
  // console.log('coinGeckoAssets', coinGeckoAssets.length) // , coinGeckoAssets)

  //
  // CoinGecko - Ethereum
  //

  parameters = {
    contract_addresses: coinGeckoAssets
      .filter((a) => !a.network)
      .map((a) => a.address)
      .join(','),
    vs_currencies: toCurrency
  }

  if (parameters.contract_addresses.length > 0) {
    fullURL = getFullURL(COINGECKO_URL + '/ethereum', parameters)
    // console.log('CoinGecko-Ethereum', fullURL)
    coinGeckoPromises.push(axios.get(fullURL))
  }

  //
  // CoinGecko - Avalanche
  //

  parameters = {
    contract_addresses: coinGeckoAssets
      .filter((a) => a.network === 'avalanche')
      .map((a) => a.address)
      .join(','),
    vs_currencies: toCurrency
  }

  if (parameters.contract_addresses.length > 0) {
    fullURL = getFullURL(COINGECKO_URL + '/avalanche', parameters)
    // console.log('CoinGecko-Avalanche', fullURL)
    coinGeckoPromises.push(axios.get(fullURL))
  }

  //
  // CryptoCompare
  //

  // The API accepts max 300 characters as input, so we split the symbols into chunks of 50 items
  const chunks = chunkArray(cryptoCompareSymbols, 50)
  /*
  if (chunks.length > 0) {
    console.log(`${cryptoCompareSymbols.length} symbols split into ${chunks.length} arrays of 50 items each`)
  }
  */

  chunks.forEach((pr) => {
    parameters = {
      fsyms: pr.join(','),
      tsyms: toCurrency
    }

    fullURL = getFullURL(API_MULTI_URL, parameters)
    // console.log('CryptoCompare', fullURL)
    cryptoComparePromises.push(axios.get(fullURL, { headers: HEADERS }))
  })

  // The results
  console.time('Asset prices fetched')
  await Promise.allSettled([
    Promise.allSettled(coinGeckoPromises),
    Promise.allSettled(cryptoComparePromises)
  ])
    .then((results) => {
      const coinGeckoResults = results[0]
      let i = 0
      let chunk = 0
      coinGeckoResults.value.forEach((res) => {
        chunk++

        // console.log(`CoinGecko, chunk ${chunk}`, res.status)
        if (res.status == 'fulfilled') {
          const data = res.value.data
          // console.log(`CoinGecko, chunk ${chunk}, res.value.data`, data)
          // Format of data is { '0xd46ba6d942050d489dbd938a2c909a5d5039a161': { usd: 0.744501 } }
          coinGeckoAssets.forEach((a) => {
            const record = data[a.address.toLowerCase()]
            if (record) {
              const price = record[toCurrency.toLowerCase()]
              result[a.symbol] = { source: 'CoinGecko' }
              result[a.symbol][toCurrency.toUpperCase()] = price
              /*
              console.log(
                `CoinGecko, chunk ${chunk}, item ${++i}, price for`,
                a.symbol,
                result[a.symbol]
              )
              */
            } else {
              // Probably in another chunk
            }
          })
        } else {
          console.error(`CoinGecko, chunk ${chunk} failure`, res.reason)
        }
      })

      const cryptoCompareResults = results[1]
      i = 0
      chunk = 0
      cryptoCompareResults.value.forEach((res) => {
        chunk++

        // console.log(`CryptoCompare, chunk ${chunk}`, res.status)
        if (res.status == 'fulfilled') {
          const data = res.value.data
          // console.log(`CryptoCompare, chunk ${chunk}, res.value.data`, data)
          // Format of data is { OCEAN: { USD: 1.368 } }
          cryptoCompareSymbols.forEach((symbol) => {
            const record = data[symbol.toUpperCase()]
            if (record) {
              const price = record[toCurrency.toUpperCase()]
              result[symbol] = { source: 'CryptoCompare' }
              result[symbol][toCurrency.toUpperCase()] = price
              /*
              console.log(
                `CryptoCompare, chunk ${chunk}, item ${++i}, price for`,
                symbol,
                result[symbol]
              )
              */
            } else {
              // Probably in another chunk
            }
          })
        } else {
          console.error(`CryptoCompare, chunk ${chunk} failure`, res.reason)
        }
      })
    })
    .finally(() => console.timeEnd('Asset prices fetched'))

  return result
}

/**
 * Get all the current trading info (price, vol, open, high, low etc) of any list of cryptocurrencies in any other currency that you need.
 * @function
 * @param {string[]} symbols - The (crypto)currency symbols of interest (ETH, BTC,... or USD, EUR, ...)
 * @param {string} [toCurrency=USD] - The (crypto)currency symbol to convert into (ETH, BTC,... or USD, EUR, ...)
 * @example
 * let p = await fetchCurrentFullData(['ETH', 'BTC'], 'USD')
 * // returns { 'ETH': {'USD': 148.05 }, 'BTC': {'USD': 7765.02 }  }
 * @returns {Object} Trading raw information
 * @see {@link https://min-api.cryptocompare.com/documentation?key=Price&cat=multipleSymbolsFullPriceEndpoint}
 */
async function fetchCurrentFullData(symbols, toCurrency = 'USD') {
  let parameters
  let fullURL

  const coinGeckoPromises = []
  const cryptoComparePromises = []
  const result = {}

  const cryptoCompareSymbols = symbols.filter((s) => !COINGECKO_ASSETS.has(s))
  const coinGeckoSymbols = symbols.filter((s) => COINGECKO_ASSETS.has(s))
  const coinGeckoAssets = coinGeckoSymbols.map((s) => COINGECKO_ASSETS.get(s))

  // console.log('symbols', symbols.length) // , symbols)
  // console.log('cryptoCompareSymbols', cryptoCompareSymbols.length) // , cryptoCompareSymbols)
  // console.log('coinGeckoSymbols', coinGeckoSymbols.length) // , coinGeckoSymbols)
  // console.log('coinGeckoAssets', coinGeckoAssets)

  //
  // CoinGecko - Ethereum
  //

  parameters = {
    contract_addresses: coinGeckoAssets
      .filter((a) => !a.network)
      .map((a) => a.address)
      .join(','),
    vs_currencies: toCurrency,
    include_24hr_change: true
  }

  fullURL = getFullURL(COINGECKO_URL + '/ethereum', parameters)

  coinGeckoPromises.push(axios.get(fullURL))

  //
  // CoinGecko - Avalanche
  //

  parameters = {
    contract_addresses: coinGeckoAssets
      .filter((a) => a.network === 'avalanche')
      .map((a) => a.address)
      .join(','),
    vs_currencies: toCurrency,
    include_24hr_change: true
  }

  fullURL = getFullURL(COINGECKO_URL + '/avalanche', parameters)

  coinGeckoPromises.push(axios.get(fullURL))

  //
  // CryptoCompare
  //

  // The API accepts max 1000 characters as input, so we split the symbols into chunks of 200 items
  const chunks = chunkArray(cryptoCompareSymbols, 200)
  /*
  if (chunks.length > 0) {
    console.log(`${cryptoCompareSymbols.length} symbols split into ${chunks.length} arrays of 200 items each`)
  }
  */

  chunks.forEach((pr) => {
    parameters = {
      fsyms: pr.join(','),
      tsyms: toCurrency
    }

    fullURL = getFullURL(API_MULTI_FULL_URL, parameters)
    // console.log(fullURL)

    cryptoComparePromises.push(axios.get(fullURL, { headers: HEADERS }))
  })

  // The results
  console.time('Asset prices fetched')
  await Promise.allSettled([
    Promise.allSettled(coinGeckoPromises),
    Promise.allSettled(cryptoComparePromises)
  ])
    .then((results) => {
      const coinGeckoResults = results[0]
      let i = 0
      let chunk = 0
      coinGeckoResults.value.forEach((res) => {
        chunk++

        // console.log(`CoinGecko, chunk ${chunk}`, res.status)
        if (res.status == 'fulfilled') {
          const data = res.value.data
          // console.log(`CoinGecko, chunk ${chunk}, res.value.data`, data)
          // Format of data is { '0xd46ba6d942050d489dbd938a2c909a5d5039a161': { usd: 0.744501, usd_24h_change: -6.33 } }
          coinGeckoAssets.forEach((a) => {
            const record = data[a.address.toLowerCase()]
            if (record) {
              const price = record[toCurrency.toLowerCase()]
              const change = record[toCurrency.toLowerCase() + '_24h_change']
              result[a.symbol] = { source: 'CoinGecko' }
              result[a.symbol][toCurrency.toUpperCase()] = {
                PRICE: price,
                CHANGEPCT24HOUR: change
              }
              /*
              console.log(
                `CoinGecko, chunk ${chunk}, item ${++i}, price for`,
                a.symbol,
                result[a.symbol]
              )
              */
            } else {
              // Probably in another chunk
            }
          })
        } else {
          console.error(`CoinGecko, chunk ${chunk} failure`, res.reason)
        }

        const cryptoCompareResults = results[1]
        i = 0
        chunk = 0
        cryptoCompareResults.value.forEach((res) => {
          chunk++

          // console.log(`CryptoCompare, chunk ${chunk}`, res.status)
          if (res.status == 'fulfilled') {
            const data = res.value.data.RAW
            // console.log(`CryptoCompare, chunk ${chunk}, res.value.data.RAW`, data)
            // Format of data is { OCEAN: { USD: { PRICE: 1.388, CHANGEPCT24HOUR: -6.33, ... } } } }
            cryptoCompareSymbols.forEach((symbol) => {
              let record = data[symbol.toUpperCase()]
              if (record) {
                record = record[toCurrency.toUpperCase()]
                if (record) {
                  result[symbol] = { source: 'CryptoCompare' }
                  result[symbol][toCurrency.toUpperCase()] = {
                    PRICE: record.PRICE,
                    CHANGEPCT24HOUR: record.CHANGEPCT24HOUR
                  }
                  /*
                  console.log(
                    `CryptoCompare, chunk ${chunk}, item ${++i}, price for`,
                    symbol,
                    result[symbol]
                  )
                  */
                } else {
                  console.warn(
                    `CryptoCompare, chunk ${chunk}, item ${++i}, ${symbol}, no ${toCurrency.toUpperCase()} element`
                  )
                }
              } else {
                // Probably in another chunk
              }
            })
          } else {
            console.error(`CryptoCompare, chunk ${chunk} failure`, res.reason)
          }
        })
      })
    })
    .finally(() => console.timeEnd('Asset prices fetched'))

  // console.log('fetchCurrentFullData', result)

  return result
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

/**
 * Get ETH Price from Uniswap.
 */
async function fetchETHPrice() {
  let price = '0.0'
  try {
    if (!uniswapAxios) {
      uniswapAxios = axios.create()
      // Remove Authorization Header for Uniswap API Calls
      delete uniswapAxios.defaults.headers.common['Authorization']
    }

    const response = await uniswapAxios.post(API_UNISWAP_URL, {
      query: '{ bundle(id: "1" ) { ethPrice } }'
    })
    if (response.data.data.bundle) {
      price = response.data.data.bundle.ethPrice
    }
  } catch (err) {
    console.error('Error occurs when fetching ETH Price from Uniswap!', err)
  }
  return price
}

/**
 * Get fund price from Uniswap.
 * @function
 * @param {string} id : fund Id
 * @returns {BigNumber} price
 */
async function fetchUniswapPrice(id) {
  let price = '0.0'
  try {
    if (!uniswapAxios) {
      uniswapAxios = axios.create()
      // Remove Authorization Header for Uniswap API Calls
      delete uniswapAxios.defaults.headers.common['Authorization']
    }

    const response = await uniswapAxios.post(API_UNISWAP_URL, {
      query: '{ token(id: "' + id.toLowerCase() + '" ) { derivedETH } }'
    })
    if (response.data.data.token) {
      price = response.data.data.token.derivedETH
    }
  } catch (err) {
    console.warn(`Error occurs when fetching Uniswap Price of ${id}!`, err)
  }
  return price
}

/**
 * Returns an array with arrays of the given size.
 *
 * @param myArray {Array} Array to split
 * @param chunkSize {Integer} Size of every group
 */
function chunkArray(originalArray, chunk_size) {
  let results = []

  // Copy the original array to preserve it
  let myArray = originalArray.map((x) => x)

  while (myArray.length) {
    results.push(myArray.splice(0, chunk_size))
  }

  return results
}

export {
  API_KEY,
  fetchCurrentPrice,
  fetchCurrentPrices,
  fetchCurrentFullData,
  fetchETHPrice,
  fetchUniswapPrice
}
