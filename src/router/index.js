import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import { axiosInstance } from '../boot/axios.js'
import store from '../store'

// app-webpack v4 only passes a store to this factory when Pinia is installed.
// We use Vuex, so we import the store singleton directly instead.
export default function (/* { ssrContext } */) {
  const createHistory = process.env.VUE_ROUTER_MODE === 'history'
    ? createWebHistory
    : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })

  // Everything needs a signed-in user except routes marked meta.public (the
  // landing pages, the sign-in page and the error pages).  The first
  // navigation asks the server who we are; after that the store knows.
  let authCheck = null
  function whenAuthKnown () {
    if (store.getters.isLoggedIn) {
      return Promise.resolve()
    }
    if (!authCheck) {
      authCheck = store.dispatch('checkAuth', { axios: axiosInstance })
    }
    return authCheck
  }

  Router.beforeEach((to, from, next) => {
    const authorize = to.meta.authorize || {}
    whenAuthKnown()
      .then(function () {
        if (!store.getters.isLoggedIn) {
          if (to.meta.public) {
            // Public pages render either way; they check the store to decide
            // what to show a signed-out visitor.
            return next()
          }
          authCheck = null // ask again next time, e.g. after signing in in another tab
          // Sign in first, then come back to the page that was asked for.
          return next({ name: 'login', query: { next: to.fullPath } })
        }
        if (to.params.lab_id && to.params.lab_id !== store.getters.labId) {
          store.dispatch('setLabId', { axios: axiosInstance, labId: to.params.lab_id })
        }
        if (authorize.isSuperuser && !store.getters.isSuperuser) {
          return next({ path: '/' })
        }
        if (authorize.isStaff && !store.getters.isStaff) {
          return next({ path: '/' })
        }
        next()
      })
      .catch(function (error) {
        console.log('error', error)
        if (to.meta.public) {
          return next()
        }
        return next({ name: 'login', query: { next: to.fullPath } })
      })
  })

  // Per-route document title (WCAG 2.4.2). Uses meta.title when set, otherwise
  // a humanized route name, suffixed with the app name.
  const APP_NAME = 'CoreOmics Submissions'
  Router.afterEach((to) => {
    const named = to.meta && to.meta.title
      ? to.meta.title
      : (to.name ? String(to.name).replace(/[_-]+/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '')
    document.title = named ? `${named} — ${APP_NAME}` : APP_NAME
  })

  return Router
}
