import Vue from 'vue'
// var plugins = []
var plugins = ['test', 'bioshare']

class PluginManager {
  constructor (plugins) {
    console.log('PluginManager', plugins, this)
    this.labs = {}
    this.plugins = {}
    // this.tabs = []
    this.permissions = {} // tab IDs assumed to be unique, should probably namespace under plugin id
    // this.plugins.append(plugins[i])
    var manager = this
    plugins.forEach(p =>
      import('assets/plugins/' + p + '/config.js')
        .then(module => {
          console.log('plugin', module, self, this)
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
    console.log('plugins', this.plugins)
  }
  componentName (pluginId) {
    return `submission-tab-${pluginId}`
  }
  getPermissions (tabId) {
    return this.permissions[tabId]
  }
  initLab (labId, plugins) {
    console.log('initLab', this)
    if (!this.labs[labId]) {
      this.labs[labId] = {'tabs': []}
      for (var i in plugins) {
        var p = plugins[i]
        console.log('init lab', labId, p, this.plugins[p])
        this.labs[labId].tabs = this.labs[labId].tabs.concat(this.plugins[p].tabs)
      }
    }
    console.log('initLab', labId, this.labs)
  }
  getTabs (labId) {
    if (!labId) {
      return []
    } else if (!this.labs[labId]) {
      this.initLab(labId, [])
    }
    console.log('getTabs', labId, this.labs[labId].tabs)
    return this.labs[labId].tabs
  }
}
var pluginManager = new PluginManager(plugins)
Vue.prototype.$plugins = pluginManager
export { plugins }
