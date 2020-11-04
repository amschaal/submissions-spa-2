import Vue from 'vue'
// var plugins = []
var plugins = ['test', 'bioshare']

class PluginManager {
  constructor () {
    console.log('PluginManager', plugins, this)
    this.plugins = []
    this.tabs = []
    for (var i in plugins) {
      // this.plugins.append(plugins[i])
      import('assets/plugins/' + plugins[i] + '/config.js')
        .then(module => {
          console.log('plugin', module, self, this)
          this.plugins.push(module.config)
          this.tabs = this.tabs.concat(module.config.submission_tabs)
          module.config.submission_tabs.forEach(t => Vue.component(this.componentName(t.id), t.component))
          // module.loadPageInto(main);
        })
        .catch(err => {
          console.log('plugin error', err.message)
        })
    }
  }
  componentName (id) {
    return `submission-tab-${id}`
  }
}
var pluginManager = new PluginManager(plugins)
Vue.prototype.$plugins = pluginManager
export { plugins }
