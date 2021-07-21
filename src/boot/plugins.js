import Vue from 'vue'
import _ from 'lodash'
// var plugins = []
var plugins = ['test', 'bioshare']

class PluginManager {
  constructor (plugins) {
    this.labs = {}
    this.plugins = {}
    // this.tabs = []
    this.permissions = {} // tab IDs assumed to be unique, should probably namespace under plugin id
    // this.plugins.append(plugins[i])
    var manager = this
    plugins.forEach(p =>
      import('assets/plugins/' + p + '/config.js')
        .then(module => {
          manager.plugins[p] = {'config': module.config, 'tabs': module.config.submission_tabs}
          // register Vue component for tabs
          module.config.submission_tabs.forEach(t => Vue.component(manager.componentName(t.id), t.component))
          for (var j in module.config.submission_tabs) {
            manager.permissions[module.config.submission_tabs[j].id] = module.config.submission_tabs[j].permissions
          }
          // module.loadPageInto(main);
        })
        .catch(err => {
          console.log('plugin error', err.message)
        })
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
    if (!this.labs[labId]) {
      this.labs[labId] = {'tabs': []}
      var pluginIds = _.keys(labPlugins)
      for (var i in pluginIds) {
        var p = pluginIds[i]
        this.labs[labId].tabs = this.labs[labId].tabs.concat(this.plugins[p].tabs)
      }
    }
  }
  initLabs (labs) {
    labs.forEach(lab => this.initLab(lab.lab_id, lab.plugins))
  }
  getTabs (labId) {
    if (!labId) {
      return []
    } else if (!this.labs[labId]) {
      this.initLab(labId, [])
    }
    return this.labs[labId].tabs
  }
}
var pluginManager = new PluginManager(plugins)
Vue.prototype.$plugins = pluginManager
export { plugins }
