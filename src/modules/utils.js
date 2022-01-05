function caseInsensitiveEquality(a, b) {
  const aUpperCase = a ? a.toUpperCase() : null
  const bUpperCase = b ? b.toUpperCase() : null
  return (!aUpperCase && !bUpperCase) || aUpperCase === bUpperCase
}

export { caseInsensitiveEquality }
