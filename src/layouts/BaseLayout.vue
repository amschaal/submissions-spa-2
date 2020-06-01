<template>
  <q-layout view="lHh Lpr lFf">
    <q-header reveal>
      <q-toolbar
      >
        <router-link :to="{ name: 'index'}"><img src="/statics/images/wordmark.png" style="height:60px"/></router-link>
        <q-toolbar-title>
          <span v-if="$route.params.lab_id && $store.getters.lab"><router-link :to="{ name: 'lab', params: { lab_id: $route.params.lab_id } }">{{$store.getters.lab.name}}</router-link></span>
          <div slot="subtitle">Sample Submission System</div>
          <q-btn v-if="!$store.getters.isLoggedIn" @click="$login()" class="float-right" color="primary">Admin</q-btn>
          <q-btn v-if="$store.getters.isLoggedIn" @click="$logout()" class="float-right" color="primary">Logout</q-btn>
        </q-toolbar-title>
      </q-toolbar>
      <q-tabs
      >
        <q-route-tab to="/" replace label="Home" />
        <q-route-tab :to="{ name: 'lab', params: { lab_id: $route.params.lab_id} }" replace label="Core Home" v-if="$route.params.lab_id"/>
        <q-route-tab :to="{ name: 'create_submission' }" replace label="Create Submission" v-if="$route.params.lab_id"/>
        <q-route-tab :to="{ name: 'submissions' }" v-if="$store.getters.isLoggedIn" replace label="Submissions" />
        <q-route-tab :to="{ name: 'imports' }" v-if="$store.getters.isLoggedIn && $route.params.lab_id" replace label="Imports" />
        <q-route-tab :to="{ name: 'submission_types' }" v-if="$store.getters.isLoggedIn && $route.params.lab_id" label="Submission Types"/>
        <q-route-tab :to="{ name: 'settings' }" v-if="$store.getters.isLoggedIn && $route.params.lab_id" label="Settings"/>
      </q-tabs>

    </q-header>

<!--
        <q-item v-if="$store.getters.isLoggedIn" @click.native="$refs.auth.logout()">
          <q-item-side icon="fas fa-user" />
          <q-item-main v-if="$store.getters.isLoggedIn" @click="$refs.auth.logout()">
            <q-item-tile label>{{$store.state.auth.user.first_name}} {{$store.state.auth.user.last_name}}</q-item-tile>
            <q-item-tile sublabel >Logout</q-item-tile>
          </q-item-main>
        </q-item>
 -->

    <q-page-container>
      <router-view :key="$route.fullPath"/>
    </q-page-container>
    <!-- <Auth ref="auth"/> -->
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'
// import Auth from '../components/auth.vue'

export default {
  name: 'BaseLayout',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      show_login: false
    }
  },
  methods: {
    openURL
  },
  components: {
    // Auth
  }
}
</script>

<style>
</style>
