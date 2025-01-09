import { createStore } from 'vuex'
import auth from './auth'
import cache from './cache'
// import example from './module-example'

export default function (/* { ssrContext } */) {
  const Store = createStore({
    modules: {
      auth,
      cache
    },

    // enable strict mode (adds overhead!)
    // for dev mode and --debug builds only
    strict: process.env.DEBUGGING
  })

  return Store
}

/*

import Vue from 'vue'
import Vuex from 'vuex'

// import example from './module-example'
import auth from './auth'
import cache from './cache'

Vue.use(Vuex)

//  * If not building with SSR mode, you can
//  * directly export the Store instantiation;
//  *
//  * The function below can be async too; either use
//  * async/await or return a Promise which resolves
//  * with the Store instance.

export default function () {
  const Store = new Vuex.Store({
    modules: {
      auth,
      cache
    },

    // enable strict mode (adds overhead!)
    // for dev mode only
    strict: process.env.DEV
  })

  return Store
}
*/
