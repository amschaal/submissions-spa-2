import { createRouter, createMemoryHistory, createWebHistory, createWebHashHistory } from 'vue-router'
import routes from './routes'
import {axiosInstance} from '../boot/axios.js'

export default function ({ store, ssrContext }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in the quasar.config file instead!
    // quasar.config file -> build -> vueRouterMode
    // quasar.config file -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  })
  Router.beforeEach((to, from, next) => {
    // redirect to login page if not logged in and trying to access a restricted page
    const { authorize } = to.meta
    // console.log('route', to, from, next, to.params)
    if (to.params.lab_id && to.params.lab_id !== store.getters.labId) {
      store.dispatch('setLabId', {axios: axiosInstance, labId: to.params.lab_id})
    }
    // console.log('route isStaff', authorize, !store.getters.isStaff)
    if (authorize && authorize.isLoggedIn && to.path !== '/' && !store.getters.isLoggedIn) {
      store.dispatch('checkAuth', {axios: axiosInstance})
        .then(function (response) {
          if (!store.getters.isLoggedIn || (authorize && authorize.isStaff && !store.getters.isStaff)) {
            return next({ path: '/' })
          }
          if (authorize && authorize.isSuperuser && !store.getters.isSuperuser) {
            return next({ path: '/' })
          }
          // console.log('got auth', response)
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

/*
import Vue from 'vue'
import VueRouter from 'vue-router'
// import store from '../store'
import routes from './routes'
import {axiosInstance} from '../boot/axios.js'

Vue.use(VueRouter)

export default function ({ store, ssrContext }) {
  const Router = new VueRouter({
    scrollBehavior: () => ({ x: 0, y: 0 }),
    routes,

    // Leave these as they are and change in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    mode: process.env.VUE_ROUTER_MODE,
    base: process.env.VUE_ROUTER_BASE
  })
  Router.beforeEach((to, from, next) => {
    // redirect to login page if not logged in and trying to access a restricted page
    const { authorize } = to.meta
    // console.log('route', to, from, next, to.params)
    if (to.params.lab_id && to.params.lab_id !== store.getters.labId) {
      store.dispatch('setLabId', {axios: axiosInstance, labId: to.params.lab_id})
    }
    // console.log('route isStaff', authorize, !store.getters.isStaff)
    if (authorize && authorize.isLoggedIn && to.path !== '/' && !store.getters.isLoggedIn) {
      store.dispatch('checkAuth', {axios: axiosInstance})
        .then(function (response) {
          if (!store.getters.isLoggedIn || (authorize && authorize.isStaff && !store.getters.isStaff)) {
            return next({ path: '/' })
          }
          if (authorize && authorize.isSuperuser && !store.getters.isSuperuser) {
            return next({ path: '/' })
          }
          // console.log('got auth', response)
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
*/
