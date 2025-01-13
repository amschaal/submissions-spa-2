import { boot } from 'quasar/wrappers'
import { date } from 'quasar'

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api
  app.config.globalProperties.$filters = {
    formatDate (value, format) {
      return date.formatDate(value, format || 'YYYY-MM-DD HH:mm')
    }
  }
})
