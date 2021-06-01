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
  hasSubmissionPerms (submission, perms, operator) {
    // ["ADMIN", "MODIFY", "VIEW", "STAFF"]
    if (!operator) {
      operator = 'ALL'
    }
    if (!submission || !submission.permissions) {
      return false
    }
    if (operator === 'ANY') {
      for (var i in perms) {
        if (submission.permissions.indexOf(perms[i]) !== -1) {
          return true
        }
      }
      return false
    } else {
      for (var j in perms) {
        if (submission.permissions.indexOf(perms[j]) === -1) {
          return false
        }
      }
      return true
    }
  }
}
var permissions = new Permissions()
Vue.prototype.$perms = permissions

// export { plugins }
