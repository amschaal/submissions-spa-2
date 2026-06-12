import moment from 'moment'
import { sanitize, safeHtml } from '../utils/sanitize.js'

// Vue 3 removed template filters. These were Vue.filter('formatDate'/'formatDateTime')
// in Vue 2; they are now instance methods used as {{ $formatDate(x) }} in templates.
function formatDate (value) {
  if (value) {
    return moment(String(value)).format('MM/DD/YYYY')
  }
}
function formatDateTime (value) {
  if (value) {
    return moment(String(value)).format('MM/DD/YYYY hh:mm')
  }
}

export default ({ app }) => {
  app.config.globalProperties.$formatDate = formatDate
  app.config.globalProperties.$formatDateTime = formatDateTime
  // DOMPurify-backed replacement for v-html (see utils/sanitize.js).
  app.config.globalProperties.$sanitize = sanitize
  app.directive('safe-html', safeHtml)
}

export { formatDate, formatDateTime }
