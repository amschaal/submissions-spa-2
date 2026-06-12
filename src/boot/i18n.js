import { createI18n } from 'vue-i18n'
import messages from 'src/i18n'

const i18n = createI18n({
  legacy: true, // keep Options-API $t API; migrate to Composition mode before vue-i18n v12
  globalInjection: true,
  locale: 'en-us',
  fallbackLocale: 'en-us',
  messages
})

export default ({ app }) => {
  app.use(i18n)
}

export { i18n }
