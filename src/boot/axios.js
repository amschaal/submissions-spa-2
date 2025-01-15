// import Vue from 'vue'
// import axios from 'axios'

// // axios.defaults.withCredentials = true
// axios.defaults.xsrfCookieName = 'csrftoken'
// axios.defaults.xsrfHeaderName = 'X-CSRFToken'
// // We create our own axios instance and set a custom base URL.
// // Note that if we wouldn't set any config here we do not need
// // a named export, as we could just `import axios from 'axios'`
// const axiosInstance = axios.create({
//   baseURL: '/server' //  'http://submission.ucdavis.edu'// ,
//   // withCredentials: true,
//   // xsrfCookieName: 'csrftoken',
//   // xsrfHeaderName: 'X-CSRFToken'
// })

// Vue.prototype.$axios = axiosInstance
// export { axiosInstance }

import { boot } from 'quasar/wrappers'
import axios from 'axios'

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
const axiosInstance = axios.create({ baseURL: '/server' })

export default boot(({ app }) => {
  // for use inside Vue files (Options API) through this.$axios and this.$api

  app.config.globalProperties.$axios = axiosInstance
  // ^ ^ ^ this will allow you to use this.$axios (for Vue Options API form)
  //       so you won't necessarily have to import axios in each vue file

  app.config.globalProperties.$axiosBase = axios
  // ^ ^ ^ this will allow you to use this.$api (for Vue Options API form)
  //       so you can easily perform requests against your app's API
})

export { axiosInstance }
