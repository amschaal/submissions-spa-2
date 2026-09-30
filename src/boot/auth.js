import { Notify } from 'quasar'
import auth from '../store/auth/index.js'
import { axiosInstance } from './axios.js'
import { getCsrfToken } from '../utils/csrf.js'

// social-auth-app-django >= 6 only starts a login on POST, behind Django's
// CSRF check, so submit a form to it rather than navigating there.  The
// csrftoken cookie normally exists already (App.vue calls /api/get_user/ on
// boot); if Login is clicked before that returns, fetch it first -- the 403
// an anonymous user gets still sets the cookie.
function login () {
  const ready = getCsrfToken()
    ? Promise.resolve()
    : axiosInstance.get('/api/get_user/').catch(() => {})
  return ready.then(function () {
    const form = document.createElement('form')
    form.method = 'post'
    form.action = '/server/social/login/keycloak/'
    const token = document.createElement('input')
    token.type = 'hidden'
    token.name = 'csrfmiddlewaretoken'
    token.value = getCsrfToken()
    form.appendChild(token)
    document.body.appendChild(form)
    form.submit()
  })
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
