<template>
  <q-page padding class="docs-input row justify-center">
    <q-card class="p90">
    <q-tabs
      v-model="tab"
      dense
      class="bg-primary text-grey shadow-2"
      active-color="white"
      align="justify"
      narrow-indicator
    >
      <q-tab name="submission"  default><span v-if="submission.id">Submission</span><span v-else>Create Submission</span></q-tab>
      <!-- <q-tab name="files" label="Files"  v-if="submission.id && $perms.hasSubmissionPerms(submission, ['VIEW'], 'ALL')"/> -->
      <q-tab name="files" label="Files"  v-if="submission.id"/>
      <q-tab name="comments" label="comments"  v-if="submission.id"/>
      <q-tab name="charges" label="charges"  v-if="submission.id && $perms.hasSubmissionPerms(submission, ['ADMIN','STAFF'], 'ANY')"/>
      <template v-for="(tab, i) in plugin_tabs"><q-tab :key="i" :name="tab.id" :label="tab.label" v-if="submission.id && hasPluginPermission(submission, tab.id)"/></template>
    </q-tabs>
    <q-tab-panels v-model="tab" animated :keep-alive="true">
      <q-tab-panel name="submission">
        <q-card-section>
          <!-- <h6>Plugins here: {{$plugins}}</h6> -->
          <h3 v-if="submission.cancelled" class="text-red">Submission cancelled</h3>
          <h3 v-if="modify && id && !canModify">You do not have permission to modify this submission.</h3>
          <SubmissionForm :create="create" :submission_types="submission_types" :type_options="type_options" :id="id" v-if="(modify && id && canModify) || create" v-on:submission_updated="submissionUpdated"/>
          <Submission :submission="submission" v-if="(!modify || !canModify) && id"/>
        </q-card-section>
      </q-tab-panel>
      <q-tab-panel name="files"  v-if="submission.id">
        <q-card-section>
          <!-- <q-uploader url="/api/submission_files/" :upload-factory="uploadFile" multiple="true"/> -->
          <files :submission="submission"/>
        </q-card-section>
      </q-tab-panel>
      <q-tab-panel name="comments" v-if="submission.id">
        <q-card-section>
          <notes-tree :submission="submission"/>
        </q-card-section>
      </q-tab-panel>
      <q-tab-panel name="charges" v-if="submission.id && $perms.hasSubmissionPerms(submission, ['ADMIN','STAFF'], 'ANY')">
        <!-- <q-tab-panel name="charges" v-if="submission.id && $perms.hasSubmissionPerms(submission, ['ADMIN', 'STAFF'], 'ANY')"> -->
        <q-card-section>
          <charges :submission="submission"/>
        </q-card-section>
      </q-tab-panel>
      <!-- There can be a race condition with plugins loading, should use computed property or something that will wait until plugins are fully set up-->
      <template v-for="(tab, i) in plugin_tabs" :key="i">
        <q-tab-panel :name="tab.id">
          <q-card-section>
            <div v-html="tab.content"/>
            <!-- <h1 tab-test>{{tab.id}}</h1> -->
            <component v-bind:is="$plugins.componentName(tab.id)" :config="$plugins.getLabConfig(submission.lab.lab_id, tab.id)" :submission="submission"></component>
          </q-card-section>
        </q-tab-panel>
      </template>
    </q-tab-panels>

  </q-card>
  </q-page>
</template>

<script>
// import './docs-input.styl'
// import axios from 'axios'
// import Samplesheet from '../../components/samplesheet.vue'
// import Agschema from '../components/agschema.vue'
import SubmissionForm from '../components/forms/submissionForm.vue'
import Submission from '../components/submission.vue'
import Files from '../components/files.vue'
import NotesTree from '../components/notesTree.vue'
import Charges from '../components/charges.vue'

export default {
  name: 'SubmissionPage',
  props: ['id', 'create', 'modify'],
  data () {
    return {
      submission: {'sample_data': [], 'payment': {}, 'contacts': []},
      errors: {},
      submission_types: [],
      type_options: this.$store.getters.typeOptions,
      tab: 'submission',
      plugin_tabs: []
      // type: {},
      // debug: false,
      // modify: false,
      // create: false
    }
  },
  mounted: function () {
    console.log('mounted')
    const self = this

    // if (!this.id || this.id === 'create') {
    //   this.create = true
    // }
    // this.$axios
    //   .get('/api/submission_types/?show=true')
    //   .then(function (response) {
    //     console.log('response', response)
    //     console.log('id', self.id)
    //     self.type_options = response.data.results.map(opt => ({label: opt.name, value: opt.id}))
    //     self.submission_types = response.data.results
    //   })
    if (this.id) {
      console.log('id', this.id)
      this.$axios
        .get(`/api/submissions/${self.id}/`)
        .then(function (response) {
          console.log('response', response)
          if (!response.data.sample_data) {
            response.data.sample_data = []
          }
          // self.submission = response.data
          self.submission = response.data
          self.setLab()
          // self.plugin_tabs = self.$plugins.getTabs(self.submission.lab)
          self.$plugins.getTabs(self.submission.lab).then(function (tabs) {
            console.log('plugin_tabs', tabs, self.plugin_tabs)
            self.plugin_tabs = tabs
          })
        })
    }
  },
  methods: {
    submissionUpdated (submission) {
      // this.modify = false
      console.log('submissionUpdated', submission)
      this.submission = submission
      // this.submission = submission
    },
    setLab () {
      if (!this.$store.getters.lab || this.$store.getters.lab.lab_id !== this.submission.lab.lab_id) {
        this.$store.dispatch('setLabId', {axios: this.$axios, labId: this.submission.lab.lab_id, pluginManager: this.$plugins})
      }
    },
    hasPluginPermission (submission, tabId) {
      const permissions = this.$plugins.getPermissions(tabId)
      console.log('permissions', tabId, permissions)
      if (!permissions) {
        return true
      }
      if (permissions.ANY) {
        return this.$perms.hasSubmissionPerms(this.submission, permissions.ANY, 'ANY')
      }
      if (permissions.ALL) {
        return this.$perms.hasSubmissionPerms(this.submission, permissions.ALL, 'ALL')
      }
      return true
    }
  },
  watch: {
    'id': function (id) {
      console.log('id', id)
      // if (!id || id === 'create') {
      //   this.create = true
      // }
      const self = this
      if (this.id) {
        self.$axios
          .get('/api/submissions/' + self.id)
          .then(function (response) {
            console.log('response', response)
            self.submission = response.data
            self.submission.type = response.data.type.id
            self.setLab()
          })
      } else {
        this.submission = {'sample_data': [], 'contacts': [], 'payment': {}}
        // this.submission = {'sample_data': [], 'contacts': [], biocore: false}
      }
    }
  },
  computed: {
    error_message (field) {
      return this.errors[field]
    },
    isAdmin () {
      return this.submission && this.submission.permissions && this.submission.permissions.indexOf('ADMIN') !== -1
    },
    canModify () {
      return !this.submission.locked || this.isAdmin
      // return this.submission.editable && !submission.cancelled
    }
    // type_options () {
    //   return this.submission_types.map(opt => ({label: opt.name, value: opt.id}))
    // }

  },
  components: {
    Files,
    SubmissionForm,
    NotesTree,
    Submission,
    Charges
  }
}
</script>

<style scoped>
  .p90 {
    width: 90%;
  }
</style>
