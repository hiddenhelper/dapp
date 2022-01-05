const SUPPRESS_LOGS = (process.env.NODE_ENV || 'production') == 'production'

var blockchainMixin = {
  methods: {
    /**
     * This method is a wrapper around @seth/connectorUtils.fetchTransactionStatus,
     * and it manages delays that can occur on testnet or mainnet.
     * It tries multiple times before a given timeout is reached.
     */
    async fetchTransactionStatus(
      tx,
      totalTimeoutInMillis = 30 * 60 * 1000 // 30 mins
    ) {
      const fetchTimeoutInMillis = 60 * 1000 // 1 min
      let attempt = 0
      let success = false
      let result

      if (!SUPPRESS_LOGS) {
        // eslint-disable-next-line
        console.log(
          'fetchTransactionStatus',
          'tx:',
          tx,
          '| timeout',
          totalTimeoutInMillis,
          'ms'
        )
      }

      let start

      while (!success && totalTimeoutInMillis > 0) {
        if (attempt > 0) {
          // 0.5 sec break beetween subsequent fetch requests
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
        attempt++

        const id = 'tx ' + tx.substring(0, 6) + '|'
        if (!SUPPRESS_LOGS) {
          // eslint-disable-next-line
          console.log(id, 'Attempt', attempt)
        }

        start = Date.now()

        try {
          // Check transaction status
          // result = await utilFetchTransactionStatus(
          //   this.connector,
          //   tx,
          //   1000, // 1 sec polling
          //   fetchTimeoutInMillis
          // )
          result = await this.connector.waitForTransaction(
            tx,
            1,
            fetchTimeoutInMillis
          )
          if (!SUPPRESS_LOGS) {
            // eslint-disable-next-line
            console.log('result', result)
          }

          totalTimeoutInMillis -= Date.now() - start

          if (result.errors.length == 0) {
            if (
              result.data.status &&
              result.data.status.startsWith('successful')
            ) {
              success = true
              if (!SUPPRESS_LOGS) {
                // eslint-disable-next-line
                console.log(id, 'Successful |', 'Result', result)
              }
            } else if (result.data.status && result.data.status == 'pending') {
              // Transaction still pending, let's extend the time (if necessary)
              if (totalTimeoutInMillis <= 0) {
                totalTimeoutInMillis = fetchTimeoutInMillis / 2
              }
            } else {
              // Permanent failure (pointless to continue)
              result = { errors: [] }
              result.errors.push({
                message: 'Transaction confirmation failed permanently'
              })
              if (!SUPPRESS_LOGS) {
                // eslint-disable-next-line
                console.log(
                  id,
                  'connectorUtils.fetchTransactionStatus Failed |',
                  'Errors',
                  result.errors
                )
              }
              break
            }
          } else {
            // Most probably a timeout
            if (!SUPPRESS_LOGS) {
              const errorMessages = result.errors.map(
                (logMessage) => logMessage.message
              )
              // eslint-disable-next-line
              console.log(id, '.2Failed |', 'Errors', errorMessages)
            }
          }
        } catch (txStatusError) {
          result = { errors: [] }
          result.errors.push({ message: txStatusError })
          if (!SUPPRESS_LOGS) {
            // eslint-disable-next-line
            console.log(id, 'Failed |', 'txStatusError', txStatusError)
          }
        }
      }
      return result
    },
    fetchTransactionStatusPromise(
      tx,
      totalTimeoutInMillis = 30 * 60 * 1000 // 30 mins
    ) {
      return new Promise(async (resolve, reject) => {
        const statusResult = await this.fetchTransactionStatus(
          tx,
          totalTimeoutInMillis,
          SUPPRESS_LOGS
        )
        if (statusResult.errors.length == 0) {
          resolve(statusResult)
        } else {
          reject(statusResult)
        }
      })
    }
  }
}

export { blockchainMixin }
