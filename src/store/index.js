import { createStore } from 'vuex'

import auth from './auth'
import cache from './cache'

// app-webpack v4 dropped CLI store wiring for Vuex (it only auto-wires Pinia),
// so we export a ready store instance and install it via boot/store.js.
const store = createStore({
  modules: {
    auth,
    cache
  },

  // enable strict mode (adds overhead!) for dev only
  strict: !!process.env.DEV
})

export default store
