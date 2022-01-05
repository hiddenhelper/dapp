module.exports = {
  root: true,
  env: {
    node: true
  },
  // extends: ['prettier']
  // plugins: ['plugin:prettier/recommended']
  // rules: {
  //  'prettier/prettier': 'error'
  // }

  // extends: ['plugin:vue/recommended', 'standard'],
  extends: [
    'plugin:vue/base',
    'plugin:vue/essential',
    'plugin:vue/strongly-recommended'
    // 'plugin:prettier/recommended' // 23/07/2020 - comment for the moment because it complains of space before parenthersis of anonymous functions
    // '@vue/prettier'
  ],
  rules: {
    'vue/singleline-html-element-content-newline': 'off',
    'vue/multiline-html-element-content-newline': 'off',
    'no-console':
      process.env.NODE_ENV === 'production'
        ? ['error', { allow: ['warn', 'error', 'time', 'timeEnd'] }]
        : ['off', { allow: ['warn', 'error', 'time', 'timeEnd'] }],
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'spaced-comment': ['error', 'always'],
    'vue/html-self-closing': 'off',
    'vue/html-indent': 'off', // 23/07/2020 - comment for the moment because it complains about moutache indentation
    'vue/max-attributes-per-line': [
      'error',
      {
        singleline: 4,
        multiline: {
          max: 1,
          allowFirstLine: true
        }
      }
    ]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
