<template>
  <q-layout view="lHh Lpr lFf">
    <q-layout-header reveal>
      <q-toolbar
        color="primary"
        :inverted="$q.theme === 'ios'"
      >
        <img src="/statics/images/wordmark.png" style="height:60px"/>
        <q-toolbar-title>
          {{$store.getters.lab.name}}
          <div slot="subtitle">Sample Submission System</div>
          <q-btn v-if="!$store.getters.isLoggedIn" @click="$login()" class="float-right" color="primary">Admin</q-btn>
          <q-btn v-if="$store.getters.isLoggedIn" @click="$logout()" class="float-right" color="primary">Logout</q-btn>
        </q-toolbar-title>
      </q-toolbar>
      <q-tabs
        color="primary"
        :inverted="$q.theme === 'ios'"
        :style="$q.theme === 'ios' ? { background: 'rgba(255,255,255,0.95' } : null"
      >
        <q-route-tab slot="title" to="/" replace label="Home" />
        <q-route-tab slot="title" :to="{ name: 'create_submission' }" replace label="Create Submission" />
        <q-route-tab slot="title" :to="{ name: 'submissions' }" v-if="$store.getters.isLoggedIn" replace label="Submissions" />
        <q-route-tab slot="title" :to="{ name: 'imports' }" v-if="$store.getters.isLoggedIn" replace label="Imports" />
        <q-route-tab slot="title" :to="{ name: 'submission_types' }" v-if="$store.getters.isLoggedIn" label="Submission Types"/>
        <q-route-tab slot="title" :to="{ name: 'settings' }" v-if="$store.getters.isLoggedIn" label="Settings"/>
      </q-tabs>

    </q-layout-header>

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
    <Auth ref="auth"/>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'
import Auth from '../components/auth.vue'

export default {
  name: 'LayoutDefault',
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
    Auth
  }
}
</script>

<style>
</style>
