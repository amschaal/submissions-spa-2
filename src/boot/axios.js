import axios from 'axios'

// axios.defaults.withCredentials = true
axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
// We create our own axios instance and set a custom base URL.
const axiosInstance = axios.create({
  baseURL: '/server'
})

export default ({ app }) => {
  app.config.globalProperties.$axios = axiosInstance
}

export { axiosInstance }
