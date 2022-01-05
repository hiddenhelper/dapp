export const utilsMixin = {
  log() {
    if (process.env.NODE_ENV === 'production') {
      // Disable console log on production
      return
    }
    // eslint-disable-next-line
    console.log('>', ...arguments)
  },

  /**
   * Fisher-Yates shuffle.
   * Ref: https://medium.com/@nitinpatel_20236/how-to-shuffle-correctly-shuffle-an-array-in-javascript-15ea3f84bfb
   * @param {*} array
   */
  shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * i)
      const temp = array[i]
      array[i] = array[j]
      array[j] = temp
    }
  },

  debounce(callback, delay = 400) {
    let timeout
    return function() {
      clearTimeout(timeout)
      timeout = setTimeout(callback, delay)
    }
  }
}
