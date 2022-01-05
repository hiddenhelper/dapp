import axios from 'axios'

const apiGraphQL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2'

let uniswapAxios

/**
 * Get Annual Percentage Rate with Token
 * @param {String} token
 */
const getData = function(dextfDailyDrop) {
  return new Promise((resolve, reject) => {
    if (uniswapAxios === undefined) {
      uniswapAxios = axios.create()
      // Remove Authorization Header for Uniswap API Calls
      delete uniswapAxios.defaults.headers.common['Authorization']
    }

    const promises = []
    promises.push(
      uniswapAxios.post(apiGraphQL, {
        query: `{
          pair(id: "0xa1444ac5b8ac4f20f748558fe4e848087f528e00") {
            reserveETH
            token1Price
          }
        }`
      })
    )

    promises.push(
      uniswapAxios.post(apiGraphQL, {
        query: '{ bundle(id: "1" ) { ethPrice } }'
      })
    )

    Promise.all(promises)
      .then((responses) => {
        const response1 = responses[0].data.data.pair
        const response2 = responses[1].data.data.bundle
        // console.log(response1)
        // console.log(response2)

        const apr =
          ((30 * dextfDailyDrop * response1.token1Price) /
            response1.reserveETH) *
          365.25

        const result = {
          apr: apr,
          dextfPriceUsd: response1.token1Price * response2.ethPrice
        }

        resolve(result)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

const getPairInfo = function(pairId) {
  return new Promise((resolve, reject) => {
    if (uniswapAxios === undefined) {
      uniswapAxios = axios.create()
      // Remove Authorization Header for Uniswap API Calls
      delete uniswapAxios.defaults.headers.common['Authorization']
    }

    uniswapAxios
      .post(apiGraphQL, {
        query: `{
          pair(id: "${pairId}") {
            id
            token0 {
              id
              symbol
              derivedETH
            }
            token1 {
              id
              symbol
              derivedETH
            }
            reserve0
            reserve1
            reserveUSD
            token0Price
            token1Price
          }
        }`
      })
      .then((response) => {
        const pairInfo = response.data.data.pair
        // console.log(pairInfo)

        // const apr =
        //   ((30 * dextfDailyDrop * response1.token1Price) /
        //     response1.reserveETH) *
        //   365.25

        // const result = {
        //   apr: apr,
        //   dextfPriceUsd: response1.token1Price * response2.ethPrice
        // }

        resolve(pairInfo)
      })
      .catch((err) => {
        reject(err)
      })
  })
}

export { getData, getPairInfo }
