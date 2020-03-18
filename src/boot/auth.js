import auth from '../store/auth/index.js'

function login () {
  window.location.href = '/server/accounts/login/'
}
function logout () {
  window.location.href = '/server/accounts/logout/' // '/server/accounts/login/redirect?logout' // http://test.submissions.dnatech.ucdavis.edu/server/accounts/logout
}
export default ({ app, Vue }) => {
  console.log('export auth', auth)
  Vue.prototype.$auth = auth
  Vue.prototype.$login = login
  Vue.prototype.$logout = logout
}
// // "async" is optional
// export default async ({ /* app, router, Vue, ... */ }) => {
//   // something to do
// }
