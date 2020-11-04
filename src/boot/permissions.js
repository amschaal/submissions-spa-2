import Vue from 'vue'
import store from '../store'
// var plugins = []
// window.permissions_store = store
class Permissions {
  constructor (store) {
    this.store_class = store
    this.store = null
    // console.log('permissions store', store)
  }
  labPermissions () {
    if (!this.store) {
      this.store = this.store_class()
    }
    // return 'wtf'
    // console.log('labPermissions', this.store, this.store.getters)
    return this.store.getters.labPermissions
  }
  hasLabPerm (perm) {
    // return false
    return this.labPermissions().indexOf(perm) >= 0
  }
}
var permissions = new Permissions(store)
Vue.prototype.$perms = permissions
// export { plugins }
