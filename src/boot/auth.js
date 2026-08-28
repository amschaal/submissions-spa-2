import { Notify } from 'quasar'
import auth from '../store/auth/index.js'
import { axiosInstance } from './axios.js'

function login () {
  window.location.href = '/server/accounts/login/'
}
// Django 5 dropped GET support from LogoutView, so navigating the browser to
// /server/accounts/logout/ just returns a 405.  POST to the API endpoint
// instead (axios adds the CSRF header), then follow the URL it hands back --
// Keycloak's end session endpoint for a social login, otherwise '/'.  Either
// way it is a full page load, so no stale client state survives.
function logout () {
  return axiosInstance.post('/api/logout/')
    .then(function (response) {
      window.location.href = response.data.redirect_url || '/'
    })
    .catch(function (error) {
      console.log('logout failed', error.message)
      Notify.create({ message: 'Unable to log out.  Please try again.', type: 'negative' })
    })
}
export default ({ app }) => {
  app.config.globalProperties.$auth = auth
  app.config.globalProperties.$login = login
  app.config.globalProperties.$logout = logout
}
