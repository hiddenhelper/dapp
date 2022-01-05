import numeral from 'numeral'

export const format = (n, fmt = '0,0.00') => {
  // numeral returns NaN for numbers with precision less than 10^-6
  return Math.abs(n) < 0.000001 ? numeral(0).format(fmt) : numeral(n).format(fmt)
}

export const formatQuantity = (n, limit = 1000000) => {
  if (isNaN(n)) return '-'

  // numeral returns NaN for numbers with precision less than 10^-6
  if (Math.abs(n) < 0.000001) {
    return '$0'
  }

  let s
  if (n < limit) {
    s = numeral(n).format('0,0.[000]')
  } else {
    // Use m for millions, etc...
    s = numeral(n).format('0.[00]a')
  }
  return s == 'NaN' ? '0' : s
}

export const formatWallet = (n, limit = 1000000) => {
  if (isNaN(n)) return '-'

  // numeral returns NaN for numbers with precision less than 10^-6
  if (Math.abs(n) < 0.000001) {
    return '$0'
  }

  let s
  if (n < limit) {
    s = numeral(n).format('0,0.[00]')
  } else {
    // Use m for millions, etc...
    s = numeral(n).format('0.[00]a')
  }
  return s == 'NaN' ? '-' : '$' + s
}

export const formatPct = (n, maxDecimals = 4) => {
  if (isNaN(n)) return '-'

  return n == 0 ? '0%' : numeral(n).format(`0.[${'0'.repeat(maxDecimals)}]`) + '%'
}

export const capitalize = (word) => {
  const loweredCase = word.toLowerCase()
  return word[0].toUpperCase() + loweredCase.slice(1)
}
