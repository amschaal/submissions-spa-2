<template>
  <div id="q-app">
    <router-view />
  </div>
</template>

<script>
// import axios from 'axios'
// import Keycloak from 'assets/keycloak/keycloak.js'
// import Vue from 'vue'
// import VueKeycloak from 'vue-keycloak'
// Vue.use(VueKeycloak, {
//   keycloakOptions: '/statics/keycloak.json',
//   keycloakInitOptions: {
//     // onLoad: 'check-sso'
//   }
// })\
import moment from 'moment'
import Vue from 'vue'

Vue.filter('formatDateTime', function (value) {
  if (value) {
    return moment(String(value)).format('MM/DD/YYYY hh:mm')
  }
})
Vue.filter('formatDate', function (value) {
  if (value) {
    return moment(String(value)).format('MM/DD/YYYY')
  }
})
export default {
  name: 'App',
  props: ['authenticated', 'blah'],
  mounted () {
    // var self = this
    this.$store.dispatch('checkAuth', {axios: this.$axios})
    // this.$store.dispatch('fetchValidators', {axios: this.$axios})
    // this.$store.dispatch('fetchTypes', {axios: this.$axios})
    // this.$store.dispatch('fetchStatuses', {axios: this.$axios})
    this.$store.dispatch('fetchAll', {axios: this.$axios})
    console.log('$store', this.$store)
    window.onbeforeunload = function () {
      return 'If you leave this page, any changes will be lost.  Consider opening links in a new tab or window.'
    }
    // once mounted, we need to trigger
    // console.log('set axios defaults', [document.cookie, document])
    // axios.defaults.withCredentials = true
    // axios.defaults.xsrfCookieName = 'csrftoken'
    // axios.defaults.xsrfHeaderName = 'X-CSRFToken'
    // axios.defaults.baseURL = '/server'
    // {withCredentials: true, xsrfCookieName: 'csrftoken', xsrfHeaderName: 'X-CSRFToken'}
    // this.$axios.get('/api/validators/')
    //   .then(function (response) {
    //     self.validators = response.data
    //   })
  }
}
</script>

<style>
</style>
