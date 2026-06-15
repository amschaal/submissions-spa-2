/* eslint-env node */
// Configuration for @quasar/app-webpack v4 (Quasar v2 / Vue 3)
// https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js
// NOTE: compiled as ESM by the CLI — use imports, not require().
import fs from 'node:fs'
import { execSync } from 'node:child_process'

// Build identity for the "new version, please refresh" prompt (see
// src/components/version.vue). Resolved ONCE per build so the value baked into
// the bundle (build.env.APP_BUILD_ID) matches what beforeBuild writes to
// public/version.json. Precedence: explicit env (set by CI/Docker via
// --build-arg APP_COMMIT) -> local git short hash -> a per-build timestamp.
// The timestamp fallback guarantees version.json is always written with a
// value that changes every build, even where git is unavailable (e.g. the
// Docker build of the spa submodule on node:alpine).
function resolveBuildId () {
  if (process.env.APP_COMMIT) {
    return process.env.APP_COMMIT.trim()
  }
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim()
  } catch (e) {
    return 'build-' + Date.now()
  }
}
const BUILD_ID = resolveBuildId()
const APP_VERSION = JSON.parse(fs.readFileSync('./package.json', 'utf-8')).version

export default function (ctx) {
  return {
    // app boot file (/src/boot)
    // https://v2.quasar.dev/quasar-cli-webpack/boot-files
    // NOTE: 'store' is first — the router guard and auth boot rely on the
    // Vuex store being installed (the CLI no longer wires it automatically).
    boot: [
      'errorhandler',
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

      // Exposed to the app via process.env.*. AG_GRID_LICENSE_KEY suppresses the
      // AG Grid Enterprise trial watermark; set it in the environment at build time.
      env: {
        AG_GRID_LICENSE_KEY: process.env.AG_GRID_LICENSE_KEY || '',
        // Baked into the bundle so the running app knows its own build identity
        // and can compare it against the deployed public/version.json.
        APP_BUILD_ID: BUILD_ID
      },

      // Writes public/version.json with the build identity. Synchronous and
      // unconditional (BUILD_ID is already resolved above) so the file is always
      // present and matches the baked APP_BUILD_ID.
      // build.beforeBuild is still supported by @quasar/app-webpack v4.
      beforeBuild: () => {
        fs.writeFileSync(
          './public/version.json',
          JSON.stringify({ version: APP_VERSION, commit: BUILD_ID, builtAt: new Date().toISOString() }),
          'utf-8'
        )
      }
    },

    // https://v2.quasar.dev/quasar-cli-webpack/quasar-config-js#devserver
    // webpack-dev-server v5: proxy is an array of { context, target, ... }.
    devServer: {
      https: false,
      port: 8080,
      open: false,
      client: {
        overlay: {
          // "ResizeObserver loop ..." is a benign browser notice (fired by
          // AG Grid / Quasar resize handling); it is not a real error and does
          // not occur in production. Keep it out of the dev error overlay.
          runtimeErrors: (error) => !(error && /ResizeObserver loop/.test(error.message))
        }
      },
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
