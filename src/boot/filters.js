import moment from 'moment'
import { sanitize, safeHtml } from '../utils/sanitize.js'
import { editorA11y } from '../utils/a11y.js'

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
  // Adds accessible names to QEditor toolbar buttons (see utils/a11y.js).
  app.directive('editor-a11y', editorA11y)
}

export { formatDate, formatDateTime }
