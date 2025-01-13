<template>
  <q-layout view="lHh Lpr lff" ><!--v-if="$store.getters.institution"-->
    <q-header reveal elevated>
      <q-toolbar
      >
        <router-link :to="{ name: 'index'}">
          <img v-if="$store.getters.institution && $store.getters.institution.logo" :src="$store.getters.institution.logo" style="max-height:60px;max-width:120px;"/>
          <img v-else-if="$store.getters.institution && !$store.getters.institution.logo" src="/images/wordmark.png" style="height:60px"/>
        </router-link>
        <q-toolbar-title>
            <!-- <router-link style="color: white; text-decoration: none;" :to="{ name: 'lab', params: { lab_id: $route.params.lab_id } }">{{$store.getters.lab.name}}</router-link> -->
            <selectLabModal>
              <template v-slot:button="{ open }">
                <q-btn size="large" flat :label="$store.getters.labId && $store.getters.lab ? $store.getters.lab.name : 'Select Lab'" icon-right="arrow_drop_down" @click="open" title="Change lab"/>
              </template>
            </selectLabModal>
          <!-- <div slot="subtitle">Sample Submission System</div> -->
          <q-btn v-if="!$store.getters.isLoggedIn" @click="$login()" class="float-right" flat>Login</q-btn>
          <span v-else class="float-right">
            <q-btn-dropdown color="primary" class="q-btn--flat" icon="person" :label="$store.getters.getUser.username">
              <q-list>
                <q-item clickable v-close-popup :to="{ name: 'my_submissions'}" replace>
                  <q-item-section>
                    <q-item-label>My Submissions</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup :to="{ name: 'profile'}" replace>
                  <q-item-section>
                    <q-item-label>Profile</q-item-label>
                  </q-item-section>
                </q-item>
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
        <!-- <q-route-tab to="/" replace label="Home" /> -->
        <q-route-tab :to="{ name: 'lab', params: { lab_id: $store.getters.labId} }" replace label="Home" v-if="$store.getters.labId"/>
        <q-route-tab :to="{ name: 'create_submission', params: { lab_id: $store.getters.labId } }" replace label="Create Submission" v-if="$store.getters.labId"/>
        <!-- <q-route-tab :to="{ name: 'my_submissions', params: {  } }" v-if="$store.getters.isLoggedIn" replace label="My Submissions" /> -->
        <!-- <q-route-tab class="restricted" :to="{ name: 'submissions', params: { lab_id: $store.getters.labId } }" v-if="$store.getters.isStaff && $store.getters.labId" replace label="Submissions" /> -->
        <!-- <q-route-tab :to="{ name: 'imports' }" v-if="$store.getters.isLoggedIn && $store.getters.labId" replace label="Imports" /> -->
        <!-- <q-route-tab class="restricted" :to="{ name: 'submission_types', params: { lab_id: $store.getters.labId} }" v-if="$store.getters.isStaff && $store.getters.labId" label="Submission Types"/> -->
        <!-- <q-route-tab class="restricted" :to="{ name: 'settings', params: { lab_id: $store.getters.labId} }" v-if="$store.getters.isStaff && $store.getters.labId" label="Settings"/> -->
        <!-- <q-btn-dropdown auto-close stretch flat label="Core" class="restricted" icon="vpn_key" v-if="$store.getters.isStaff && $store.getters.labId"> -->
          <q-btn-dropdown auto-close stretch flat label="Core" class="restricted" icon="vpn_key" v-if="$store.getters.labId && ($perms.hasLabPerm('MEMBER') || $perms.hasLabPerm('ADMIN') || $perms.hasLabPerm('ASSOCIATE'))">
          <q-list>
            <q-item clickable :to="{ name: 'submissions', params: { lab_id: $store.getters.labId} }">
              <q-item-section>Submissions</q-item-section>
            </q-item>
            <q-item clickable :to="{ name: 'submission_types', params: { lab_id: $store.getters.labId} }">
              <q-item-section>Submission Types</q-item-section>
            </q-item>
            <q-item clickable :to="{ name: 'settings', params: { lab_id: $store.getters.labId} }" v-if="$perms.hasLabPerm('MEMBER') || $perms.hasLabPerm('ADMIN')">
              <q-item-section>Settings</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
        <q-btn-dropdown auto-close stretch flat label="Institution" class="restricted" icon="vpn_key" v-if="$store.getters.isInstitutionAdmin">
          <q-list>
            <q-item clickable :to="{ name: 'institution_settings', params: {} }">
              <q-item-section>Settings</q-item-section>
            </q-item>
          </q-list>
        </q-btn-dropdown>
      </q-tabs>
      <!-- <q-tabs v-model="tab" id="testing">
          <q-tab name="submissions" label="Submissions" />
          <q-tab name="types" label="Submission Types" />
          <q-tab name="settings" label="Settings" />
      </q-tabs> -->

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
      <div v-if="!$store.getters.institution">
        <q-banner v-if="error" inline-actions class="text-white bg-red">
          Unable to load institution data.  Please try reloading the page.
        </q-banner>
        <q-circular-progress
          v-else
          indeterminate
          size="50px"
          color="lime"
          class="q-ma-md"
        />
      </div>
      <router-view v-else :key="$route.fullPath"/>
      <version/>
    </q-page-container>
    <!-- <Auth ref="auth"/> -->
    <q-footer elevated>
      <q-toolbar>
          Developed by the <a href="https://bioinformatics.ucdavis.edu" target="_blank"> Bioinformatics Core</a> at the <a href="https://genomecenter.ucdavis.edu" target="_blank"> UC Davis Genome Center</a>
      </q-toolbar>
    </q-footer>
  </q-layout>
</template>

<script>
import { openURL } from 'quasar'
import selectLabModal from '../components/modals/selectLabModal.vue'
import version from '../components/version.vue'
// import Auth from '../components/auth.vue'

export default {
  name: 'BaseLayout',
  data () {
    return {
      leftDrawerOpen: this.$q.platform.is.desktop,
      show_login: false,
      error: false
    }
  },
  methods: {
    openURL
  },
  mounted: function () {
    if (!this.$store.getters.institution) {
      const self = this
      setTimeout(function () {
        if (!self.$store.getters.institution) {
          self.error = true
        }
      }, 2000)
    }
  },
  computed: {
    institution () {
      return this.$store.getters.institution
    }
  },
  components: {
    // Auth
    selectLabModal,
    version
  }
}
</script>

<style>
.restricted {
  color: gold;
}
footer a {
  color: white;
  margin: 0px 5px 0px 5px;
}
</style>
