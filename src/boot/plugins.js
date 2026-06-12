import { markRaw } from 'vue'
import _ from 'lodash'
import RawPayment from '../components/payment/ucdAccount.vue'

// markRaw so the default payment component can be stored in reactive data
// (and passed to <component :is>) without Vue 3 reactivity warnings.
const Payment = markRaw(RawPayment)

// var plugins = []
// var plugins = ['test', 'bioshare']

class PluginManager {
  constructor (plugins) {
    this.labs = {}
    this.plugins = {}
    // this.tabs = []
    this.permissions = {} // tab IDs assumed to be unique, should probably namespace under plugin id
    // this.plugins.append(plugins[i])
    // var manager = this
    plugins.forEach(p =>
      this.initPlugin(p)
    )
  }
  componentName (pluginId) {
    return `submission-tab-${pluginId}`
  }
  getPermissions (tabId) {
    return this.permissions[tabId]
  }
  getTabComponent (tabId) {
    // Return the tab's component object for dynamic <component :is="...">.
    // Replaces Vue 2 global Vue.component() registration, which is
    // incompatible with Vue 3's register-before-mount requirement.
    for (const pluginId in this.plugins) {
      const tab = this.plugins[pluginId].tabs.find(t => t.id === tabId)
      if (tab) {
        return tab.component
      }
    }
  }
  initLab (labId, plugins) {
    console.log('initLab', labId, plugins)
    const labPlugins = plugins != null ? plugins : {}
    const promises = []
    if (!this.labs[labId]) {
      this.labs[labId] = {'tabs': [], 'plugins': labPlugins}
      const pluginIds = _.keys(labPlugins)
      // console.log('pluginIds', pluginIds)
      pluginIds.forEach((pluginId) => {
        const manager = this
        if (!this.plugins[pluginId]) { // Plugin is not yet loaded.  Load it, then add to the lab config.
          const promise = manager.initPlugin(pluginId).then(() => {
            // console.log('initPlugin', pluginId, Object.keys(manager.plugins))
            manager.labs[labId].tabs = manager.labs[labId].tabs.concat(manager.plugins[pluginId].tabs)
          })
          promises.push(promise)
        } else { // If plugin is already loaded, add it to the lab config
          manager.labs[labId].tabs = manager.labs[labId].tabs.concat(manager.plugins[pluginId].tabs)
        }
      })
    }
    return Promise.all(promises)
  }
  initPlugin (pluginId) {
    // var manager = this
    return import('assets/plugins/' + pluginId + '/config.js')
      .then(module => {
        console.log('set plugin', pluginId)
        // markRaw the component objects so Vue 3 doesn't try to make them
        // reactive when they're stored here / passed to <component :is="...">.
        const tabs = (module.config.submission_tabs || []).map(t => Object.assign({}, t, { component: markRaw(t.component) }))
        const payment = module.config.payment ? markRaw(module.config.payment) : module.config.payment
        this.plugins[pluginId] = {'config': module.config, tabs, payment}
        // Tab components are rendered via <component :is="getTabComponent(id)">
        // rather than global registration (see getTabComponent).
        for (const j in tabs) {
          this.permissions[tabs[j].id] = tabs[j].permissions
        }
        // module.loadPageInto(main);
      })
      .catch(err => {
        console.log('plugin error', err.message)
      })
  }
  // initLabs (labs) {
  //   labs.forEach(lab => this.initLab(lab.lab_id, lab.plugins))
  // }
  getTabs (lab) {
    // var labId = lab && lab.lab_id ? lab.lab_id : lab
    // if (!labId) {
    //   return new Promise []
    // }
    return this.initLab(lab.lab_id, lab.plugins).then(() => {
      return this.labs[lab.lab_id].tabs
    })
  }
  getLabPayment (lab) {
    // when it is a new submission, use the payment type configured for the lab
    if (!lab) {
      return Payment
    }
    return this.initLab(lab.lab_id, lab.plugins).then(() => {
      return this.plugins[lab.payment_type_id] ? this.plugins[lab.payment_type_id].payment : Payment
    })
  }
  getSubmissionPayment (submission) {
    // get payment type from submission.payment in case payment type was different at the time of submission
    return this.initLab(submission.lab.lab_id, submission.lab.plugins).then(() => {
      return this.plugins[submission.payment.plugin_id] ? this.plugins[submission.payment.plugin_id].payment : Payment
    })
  }
  getLabConfig (labId, pluginId) {
    return this.labs[labId].plugins[pluginId]
  }
}
// console.log('plugins', this)
const pluginManager = new PluginManager([])

export default ({ app }) => {
  app.config.globalProperties.$plugins = pluginManager
}

export { pluginManager }
