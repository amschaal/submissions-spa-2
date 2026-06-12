/* eslint-env node */
// Configuration for @quasar/app-webpack v4 (Quasar v2 / Vue 3)
// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js
// NOTE: compiled as ESM by the CLI — use imports, not require().
import fs from 'node:fs'
import { exec } from 'node:child_process'

export default function (ctx) {
  return {
    // app boot file (/src/boot)
    // https://v2.quasar.dev/quasar-cli-webpack/boot-files
    // NOTE: 'store' is first — the router guard and auth boot rely on the
    // Vuex store being installed (the CLI no longer wires it automatically).
    boot: [
      'store',
      'i18n',
      'axios',
      'auth',
      'schema',
      'plugins',
      'permissions',
      'filters'
    ],

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#css
    css: [
      'app.scss'
    ],

    // https://github.com/quasarframework/quasar/tree/dev/extras
    extras: [
      'roboto-font',
      'material-icons',
      'fontawesome-v5'
    ],

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#build
    build: {
      vueRouterMode: 'history', // 'hash' or 'history'

      // Writes public/version.json with the app version + git commit hash.
      // build.beforeBuild is still supported by @quasar/app-webpack v4.
      beforeBuild: ({ quasarConf }) => {
        exec('git rev-parse --short HEAD', function (err, stdout) {
          if (err) {
            console.warn('Could not read git commit hash for version.json:', err.message)
            return
          }
          const version = JSON.parse(fs.readFileSync('./package.json', 'utf-8')).version
          fs.writeFileSync('./public/version.json', JSON.stringify({ version: version, commit: stdout.trim() }), 'utf-8')
        })
      }
    },

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#devserver
    // webpack-dev-server v5: proxy is an array of { context, target, ... }.
    devServer: {
      https: false,
      port: 8080,
      open: false,
      proxy: [
        {
          context: ['/server'],
          target: 'http://api:8000',
          changeOrigin: false,
          pathRewrite: { '^/server': '' }
        }
      ]
    },

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#framework
    framework: {
      iconSet: 'material-icons',
      lang: 'en-US',

      // Quasar plugins
      plugins: ['Notify', 'Loading', 'Dialog']
    },

    // https://v2.quasar.dev/options/animations
    animations: [],

    // Keep the existing index HTML template (v4 default is 'index.html').
    sourceFiles: {
      indexHtmlTemplate: 'src/index.template.html'
    },

    // https://v2.quasar.dev/quasar-cli-webpack/developing-ssr/configuring-ssr
    ssr: {
      pwa: false
    },

    // https://v2.quasar.dev/quasar-cli-webpack/developing-pwa/configuring-pwa
    pwa: {
      workboxMode: 'GenerateSW'
    },

    // https://v2.quasar.dev/quasar-cli-webpack/developing-cordova-apps/configuring-cordova
    cordova: {
      // noIosLegacyBuildFlag: true
    },

    // https://v2.quasar.dev/quasar-cli-webpack/developing-capacitor-apps/configuring-capacitor
    capacitor: {
      hideSplashscreen: true
    },

    // https://v2.quasar.dev/quasar-cli-webpack/developing-electron-apps/configuring-electron
    electron: {
      bundler: 'packager',
      packager: {},
      builder: {
        appId: 'submissions'
      }
    }
  }
}
