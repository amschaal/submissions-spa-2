import Vue from 'vue'
import _ from 'lodash'
import Payment from '../components/payment/ucdAccount.vue'

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
  initLab (labId, plugins) {
    console.log('initLab', labId, plugins)
    var labPlugins = plugins != null ? plugins : {}
    var promises = []
    if (!this.labs[labId]) {
      this.labs[labId] = {'tabs': [], 'plugins': labPlugins}
      var pluginIds = _.keys(labPlugins)
      // console.log('pluginIds', pluginIds)
      pluginIds.forEach((pluginId) => {
        var manager = this
        if (!this.plugins[pluginId]) { // Plugin is not yet loaded.  Load it, then add to the lab config.
          var promise = manager.initPlugin(pluginId).then(() => {
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
        module.config.submission_tabs.forEach(t => Vue.component(this.componentName(t.id), t.component))
        for (var j in module.config.submission_tabs) {
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
  getPayment (lab) {
    return this.initLab(lab.lab_id, lab.plugins).then(() => {
      return this.plugins[lab.payment_type_id] ? this.plugins[lab.payment_type_id].payment : Payment
    })
  }
  getLabConfig (labId, pluginId) {
    return this.labs[labId].plugins[pluginId]
  }
}
console.log('plugins', this)
var pluginManager = new PluginManager([])

Vue.prototype.$plugins = pluginManager
export { pluginManager }
