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

  Router.beforeEach((to, from, next) => {
    // redirect to login page if not logged in and trying to access a restricted page
    const { authorize } = to.meta
    if (to.params.lab_id && to.params.lab_id !== store.getters.labId) {
      store.dispatch('setLabId', { axios: axiosInstance, labId: to.params.lab_id })
    }
    if (authorize && authorize.isLoggedIn && to.path !== '/' && !store.getters.isLoggedIn) {
      store.dispatch('checkAuth', { axios: axiosInstance })
        .then(function (response) {
          if (!store.getters.isLoggedIn || (authorize && authorize.isStaff && !store.getters.isStaff)) {
            return next({ path: '/' })
          }
          if (authorize && authorize.isSuperuser && !store.getters.isSuperuser) {
            return next({ path: '/' })
          }
          next()
        })
        .catch(function (error) {
          console.log('error', error)
          return next({ path: '/' })
        })
    } else if (authorize && authorize.isStaff && !store.getters.isStaff) {
      return next({ path: '/' })
    } else {
      next()
    }
  })
  return Router
}
