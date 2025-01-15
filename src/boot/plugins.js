import _ from 'lodash'
import Payment from '../components/payment/ucdAccount.vue'

// var plugins = []
// var plugins = ['test', 'bioshare']

class PluginManager {
  constructor (plugins, app) {
    this.app = app
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
        this.plugins[pluginId] = {'config': module.config, 'tabs': module.config.submission_tabs, 'payment': module.config.payment}
        // register Vue component for tabs
        module.config.submission_tabs.forEach(t => this.app.component(this.componentName(t.id), t.component))
        for (const j in module.config.submission_tabs) {
          this.permissions[module.config.submission_tabs[j].id] = module.config.submission_tabs[j].permissions
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

const pluginManager = new PluginManager([])

import { boot } from 'quasar/wrappers'

export default boot(({ app }) => {
  pluginManager.app = app
  app.config.globalProperties.$plugins = pluginManager
})

export { pluginManager }
