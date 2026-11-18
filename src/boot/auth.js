import { Notify } from 'quasar'
import auth from '../store/auth/index.js'
import { axiosInstance } from './axios.js'
import { getCsrfToken } from '../utils/csrf.js'
import { safeNext } from '../utils/next.js'

// social-auth-app-django >= 6 only starts a login on POST, behind Django's
// CSRF check, so submit a form rather than navigating.  It goes to
// /server/accounts/login/, which re-sends it (307) to whichever login
// SOCIAL_LOGIN_URL names.  The csrftoken cookie normally exists already
// (App.vue calls /api/get_user/ on boot); if Login is clicked before that
// returns, fetch it first -- the 403 an anonymous user gets still sets it.
// `next` (optional) is the path inside this app to come back to afterwards.
function login (next) {
  const ready = getCsrfToken()
    ? Promise.resolve()
    : axiosInstance.get('/api/get_user/').catch(() => {})
  return ready.then(function () {
    const form = document.createElement('form')
    form.method = 'post'
    form.action = '/server/accounts/login/'
    if (typeof next === 'string' && safeNext(next) !== '/') {
      const target = document.createElement('input')
      target.type = 'hidden'
      target.name = 'next'
      target.value = safeNext(next)
      form.appendChild(target)
    }
    const token = document.createElement('input')
    token.type = 'hidden'
    token.name = 'csrfmiddlewaretoken'
    token.value = getCsrfToken()
    form.appendChild(token)
    document.body.appendChild(form)
    form.submit()
  })
}
// Unsaved submission forms are kept in localStorage (see submissionForm.vue);
// don't leave them behind for the next person on a shared computer.
function clearSavedSubmissions () {
  try {
    Object.keys(window.localStorage)
      .filter(key => key === 'submission' || key.indexOf('submission:') === 0)
      .forEach(key => window.localStorage.removeItem(key))
  } catch (e) {
    // storage unavailable: nothing to clear
  }
}
// Django 5 dropped GET support from LogoutView, so navigating the browser to
// /server/accounts/logout/ just returns a 405.  POST to the API endpoint
// instead (axios adds the CSRF header), then follow the URL it hands back --
// Keycloak's end session endpoint for a social login, otherwise '/'.  Either
// way it is a full page load, so no stale client state survives.
function logout () {
  return axiosInstance.post('/api/logout/')
    .then(function (response) {
      clearSavedSubmissions()
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
