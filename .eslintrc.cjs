module.exports = {
  root: true,

  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false
  },

  env: {
    browser: true
  },

  extends: [
    'standard',
    // Uncomment any of the lines below to choose desired strictness,
    // but leave only one uncommented!
    // See https://eslint.vuejs.org/rules/#available-rules
    'plugin:vue/vue3-essential', // Priority A: Essential (Error Prevention)
    // 'plugin:vue/strongly-recommended' // Priority B: Strongly Recommended (Improving Readability)
    // 'plugin:vue/recommended' // Priority C: Recommended (Minimizing Arbitrary Choices and Cognitive Overhead)
    'plugin:quasar/legacy'
  ],

  // required to lint *.vue files
  plugins: [
    'vue',
    'quasar'
  ],

  globals: {
    'ga': true, // Google Analytics
    'cordova': true,
    '__statics': true,
    'process': true,
    'Capacitor': true,
    'chrome': true
  },

  // add your custom rules here
  // rules: {
  //   // allow async-await
  //   'generator-star-spacing': 'off',
  //   // allow paren-less arrow functions
  //   'arrow-parens': 'off',
  //   'one-var': 'off',
  //
  //   'import/first': 'off',
  //   'import/named': 'error',
  //   'import/namespace': 'error',
  //   'import/default': 'error',
  //   'import/export': 'error',
  //   'import/extensions': 'off',
  //   'import/no-unresolved': 'off',
  //   'import/no-extraneous-dependencies': 'off',
  //   'prefer-promise-reject-errors': 'off',
  //
  //   // allow debugger during development only
  //   'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  //
  //   'quasar/no-legacy-components': 'warn',
  //   'quasar/no-legacy-css': 'warn',
  //   'quasar/no-legacy-directives': 'warn',
  //   'quasar/no-legacy-properties': 'warn'
  // }
  rules: {
    // allow async-await
    'generator-star-spacing': 'off',

    // allow paren-less arrow functions
    'arrow-parens': 0,
    'one-var': 0,

    'import/first': 0,
    'import/named': 2,
    'import/namespace': 2,
    'import/default': 2,
    'import/export': 2,
    'import/extensions': 0,
    'import/no-unresolved': 0,
    'import/no-extraneous-dependencies': 0,

    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,

    'quasar/no-legacy-components': 'warn',
    'quasar/no-legacy-css': 'warn',
    'quasar/no-legacy-directives': 'warn',
    'quasar/no-legacy-properties': 'warn', // 'warn'

    'object-curly-spacing': 'off',
    'dot-notation': 'off',
    'quotes': 'off',
    'quote-props': 'off',
    'lines-between-class-members': 'off',
    'no-prototype-builtins': 'off',
    "space-before-function-paren": ["error", "always"],

    'vue/multi-word-component-names': 'off',
    'vue/no-v-text-v-html-on-component': 'off',
    // should re-enable below
    'vue/no-mutating-props': 'off',
    'vue/no-deprecated-events-api': 'off'

  }
}
