import Vue from 'vue'
// import store from '../store'
// var plugins = []
// window.permissions_store = store
class Permissions {
  // constructor (store) {
  //   this.store_class = store
  //   this.store_instance = null
  //   // console.log('permissions store', store)
  // }
  init (store) { // this must be done when mounting App.vue
    this.store = store
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
  hasInstitutionPerm (perm) {
  }
}
var permissions = new Permissions()
Vue.prototype.$perms = permissions

// export { plugins }
