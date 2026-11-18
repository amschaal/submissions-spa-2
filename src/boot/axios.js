import axios from 'axios'
import { Notify } from 'quasar'
import store from '../store'

// axios.defaults.withCredentials = true
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
// We create our own axios instance and set a custom base URL.
const axiosInstance = axios.create({
  baseURL: '/server'
})

// The API answers a request without a valid session with 401, or with 403 and
// `authenticated: false` in the body.  That happens when the session expires
// while the app is open.
function isSignedOutResponse (response) {
  if (!response) {
    return false
  }
  return response.status === 401 || (response.status === 403 && !!response.data && response.data.authenticated === false)
}

export default ({ app, router }) => {
  app.config.globalProperties.$axios = axiosInstance
  let notified = false
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      const config = error.config || {}
      const url = config.url || ''
      const route = router.currentRoute.value
      // get_user is how the app asks "am I signed in?", so a refusal there is an answer, not an error.
      if (isSignedOutResponse(error.response) && url.indexOf('/api/get_user/') === -1 && !(route.meta && route.meta.public)) {
        store.commit('logout')
        if ((config.method || 'get').toLowerCase() === 'get') {
          router.push({ name: 'login', query: { next: route.fullPath } })
        } else if (!notified) {
          // Don't navigate away from a form that may hold unsaved work.
          notified = true
          Notify.create({
            message: 'You have been signed out, so this was not saved. Sign in again in another tab, then retry here.',
            type: 'warning',
            timeout: 0,
            actions: [{ label: 'Dismiss', color: 'white', handler: () => { notified = false } }]
          })
        }
      }
      return Promise.reject(error)
    }
  )
}

export { axiosInstance }
