import Vue from 'vue'
import _ from 'lodash'

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
        if (!this.plugins[pluginId]) {
          var manager = this
          var promise = manager.initPlugin(pluginId).then(() => {
            // console.log('initPlugin', pluginId, Object.keys(manager.plugins))
            manager.labs[labId].tabs = manager.labs[labId].tabs.concat(manager.plugins[pluginId].tabs)
          })
          promises.push(promise)
        }
      })
    }
    return Promise.all(promises)
  }
  initPlugin (pluginId) {
    // var manager = this
    return import('assets/plugins/' + pluginId + '/config.js')
      .then(module => {
        // console.log('set plugin', this, pluginId)
        this.plugins[pluginId] = {'config': module.config, 'tabs': module.config.submission_tabs}
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
  initLabs (labs) {
    labs.forEach(lab => this.initLab(lab.lab_id, lab.plugins))
  }
  getTabs (lab) {
    var labId = lab && lab.lab_id ? lab.lab_id : lab
    if (!labId) {
      return []
    }
    return new Promise((resolve, reject) => {
      this.initLab(labId, lab.plugins).then(() => {
        console.log('getTabsPromise', this, lab)
        resolve(this.labs[labId].tabs)
      })
    })
    // return new Promise((resolve, reject) => {
    //   setTimeout(() => {
    //     console.log('getTabsPromise', this, lab)
    //     resolve(this.labs[labId].tabs)
    //   }, 5000)
    // })
    // return this.labs[labId].tabs
  }
  // getTabsPromiseOld (lab) {
  //   return new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       console.log('getTabsPromise', this, lab)
  //       resolve(this.getTabs(lab))
  //     }, 5000)
  //   })
  // }
  getLabConfig (labId, pluginId) {
    return this.labs[labId].plugins[pluginId]
  }
}
console.log('plugins', this)
var pluginManager = new PluginManager([])
// pluginManager.config(plugins)
// axios.get('/api/plugins/', {
//   // headers: auth.getAuthHeader(),
// })
//   .then(function (response) {
//     pluginManager.config(['test', 'bioshare'])
//   })
//   .catch(function (error) {
//     console.log('error!!!', error.message)
//     return Promise.reject(new Error('failed'))
//   })

Vue.prototype.$plugins = pluginManager
export { pluginManager }
