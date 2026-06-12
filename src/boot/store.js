import store from 'src/store'

// Install the Vuex store on the app. app-webpack v4 no longer wires Vuex
// automatically (only Pinia), so we do it here. This boot file is listed
// first so $store is available to every other boot file and the router guard.
export default ({ app }) => {
  app.use(store)
}

export { store }
