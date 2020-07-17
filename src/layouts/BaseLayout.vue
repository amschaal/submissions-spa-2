<template>
  <q-layout view="lHh Lpr lFf">
    <q-header reveal>
      <q-toolbar
      >
        <router-link :to="{ name: 'index'}"><img src="/statics/images/wordmark.png" style="height:60px"/></router-link>
        <q-toolbar-title>
          <span v-if="$store.getters.labId && $store.getters.lab"><router-link style="color: white" :to="{ name: 'lab', params: { lab_id: $route.params.lab_id } }">{{$store.getters.lab.name}}</router-link></span>
          <div slot="subtitle">Sample Submission System</div>
          <q-btn v-if="!$store.getters.isLoggedIn" @click="$login()" class="float-right" color="primary">Login</q-btn>
          <span v-else class="float-right">
            <q-btn-dropdown color="primary" class="q-btn--flat" icon="person" :label="$store.getters.getUser.username">
              <q-list>
                <q-item clickable v-close-popup @click="$logout()">
                  <q-item-section>
                    <q-item-label>Logout</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <!-- <q-btn v-if="$store.getters.isLoggedIn" @click="$logout()"  color="primary">Logout</q-btn> -->
          </span>
        </q-toolbar-title>
      </q-toolbar>
      <q-tabs
      >
        <q-route-tab to="/" replace label="Home" />
        <q-route-tab :to="{ name: 'my_submissions', params: {  } }" v-if="$store.getters.isLoggedIn" replace label="My Submissions" />
        <q-route-tab :to="{ name: 'lab', params: { lab_id: $store.getters.labId} }" replace label="Core Home" v-if="$store.getters.labId"/>
        <q-route-tab :to="{ name: 'create_submission', params: { lab_id: $store.getters.labId } }" replace label="Create Submission" v-if="$store.getters.labId"/>
        <q-route-tab :to="{ name: 'submissions', params: { lab_id: $store.getters.labId } }" v-if="$store.getters.isStaff && $store.getters.labId" replace label="Submissions" />
        <!-- <q-route-tab :to="{ name: 'imports' }" v-if="$store.getters.isLoggedIn && $store.getters.labId" replace label="Imports" /> -->
        <q-route-tab :to="{ name: 'submission_types', params: { lab_id: $store.getters.labId} }" v-if="$store.getters.isStaff && $store.getters.labId" label="Submission Types"/>
        <q-route-tab :to="{ name: 'settings', params: { lab_id: $store.getters.labId} }" v-if="$store.getters.isStaff && $store.getters.labId" label="Settings"/>
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
