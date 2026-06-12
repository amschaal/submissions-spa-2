module.exports = {
  root: true,

  // vue-eslint-parser handles <template>; it delegates <script> to @babel/eslint-parser.
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    babelOptions: {
      presets: ['@quasar/babel-preset-app']
    },
    sourceType: 'module'
  },

  env: {
    browser: true,
    node: true
  },

  extends: [
    'standard',
    'plugin:vue/vue3-essential' // Priority A: Essential (Error Prevention)
  ],

  // required to lint *.vue files
  plugins: [
    'vue'
  ],

  globals: {
    ga: true, // Google Analytics
    cordova: true,
    __statics: true,
    process: true,
    Capacitor: true,
    chrome: true
  },

  rules: {
    // This codebase uses many intentional single-word component names
    // (submission, settings, imports, ...); the Vue 3 multi-word convention
    // is not worth a mass rename.
    'vue/multi-word-component-names': 'off',

    // Pre-existing pattern: components mutate nested fields of object/array
    // props (e.g. submission, config). This works in Vue 3 (same object ref)
    // and reworking it to an emit-based flow is out of scope for the upgrade.
    // Kept as a warning so new violations are still visible.
    'vue/no-mutating-props': 'warn',
    'vue/no-v-text-v-html-on-component': 'warn',

    'generator-star-spacing': 'off',
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

    'object-curly-spacing': 'off',
    'dot-notation': 'off',
    quotes: 'off',
    'quote-props': 'off',
    'lines-between-class-members': 'off',
    'no-prototype-builtins': 'off'
  }
}
