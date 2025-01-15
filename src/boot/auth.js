import auth from '../store/auth/index.js'
import { boot } from 'quasar/wrappers'

function login () {
  window.location.href = '/server/accounts/login/'
}
function logout () {
  window.location.href = '/server/accounts/logout/' // '/server/accounts/login/redirect?logout' // http://test.submissions.dnatech.ucdavis.edu/server/accounts/logout
}
export default boot(({ app }) => {
  app.config.globalProperties.$auth = auth
  app.config.globalProperties.$login = login
  app.config.globalProperties.$logout = logout
})
// export default ({ app, Vue }) => {
//   console.log('export auth', auth)
//   Vue.prototype.$auth = auth
//   Vue.prototype.$login = login
//   Vue.prototype.$logout = logout
// }
// // "async" is optional
// export default async ({ /* app, router, Vue, ... */ }) => {
//   // something to do
// }

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
