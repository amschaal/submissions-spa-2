import auth from '../store/auth/index.js'

function login () {
  window.location.href = '/server/accounts/login/'
}
function logout () {
  window.location.href = '/server/accounts/logout/'
}
export default ({ app }) => {
  app.config.globalProperties.$auth = auth
  app.config.globalProperties.$login = login
  app.config.globalProperties.$logout = logout
}
