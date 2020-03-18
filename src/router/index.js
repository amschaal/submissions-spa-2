import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'
import routes from './routes'
import {axiosInstance} from '../boot/axios.js'

Vue.use(VueRouter)

const Router = new VueRouter({
  /*
   * NOTE! Change Vue Router mode from quasar.conf.js -> build -> vueRouterMode
   *
   * When going with "history" mode, please also make sure "build.publicPath"
   * is set to something other than an empty string.
   * Example: '/' instead of ''
   */

  // Leave as is and change from quasar.conf.js instead!
  mode: process.env.VUE_ROUTER_MODE,
  base: process.env.VUE_ROUTER_BASE,
  scrollBehavior: () => ({ y: 0 }),
  routes
})

Router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const { authorize } = to.meta
  console.log('route', to, from, next)
  if (authorize && authorize.isLoggedIn && to.path !== '/' && !store.getters.isLoggedIn) {
    // TODO: Don't repeat the code alread in auth store (use dispatch)
    console.log('check auth!!!')
    // store.dispatch('checkAuth', {axios: axiosInstance})
    //   .then(() => {
    //     next()
    //   })
    //   .catch(() => {
    //     // console.log('catch');
    //     return next({ path: '/' })
    //   })
    axiosInstance.get('/api/get_user/')
      .then(function (response) {
        next()
      })
      .catch(function (error) {
        console.log('error', error)
        return next({ path: '/' })
      })
  } else {
    next()
  }

  // if (authorize && authorize.isLoggedIn && to.path !== '/' && !store.getters.isLoggedIn) {
  //   return next({ path: '/' })
  // }
  // next()

  /*
  const currentUser = authenticationService.currentUserValue;

  if (authorize) {
      if (!currentUser) {
          // not logged in so redirect to login page with the return url
          return next({ path: '/login', query: { returnUrl: to.path } });
      }

      // check if route is restricted by role
      if (authorize.length && !authorize.includes(currentUser.role)) {
          // role not authorised so redirect to home page
          return next({ path: '/' });
      }
  }
  */
})

export default Router
