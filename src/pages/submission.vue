<template>
  <q-page padding class="docs-input row justify-center">
    <q-card class="p90">
    <q-tabs
      v-model="tab"
      dense
      class="text-grey"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      narrow-indicator
    >
      <q-tab name="submission"  default><span v-if="submission.id">Submission</span><span v-else>Create Submission</span></q-tab>
      <q-tab name="files" label="Files"  v-if="submission.id"/>
      <q-tab name="comments" label="comments"  v-if="submission.id"/>
      <q-tab name="charges" label="charges"  v-if="submission.id"/>
    </q-tabs>
    <q-tab-panels v-model="tab" animated>
      <q-tab-panel name="submission">
        <q-card-section>
          <h3 v-if="submission.cancelled" class="text-red">Submission cancelled</h3>
          <SubmissionForm :create="create" :submission_types="submission_types" :type_options="type_options" :id="id" v-if="(modify && id) || create" v-on:submission_updated="submissionUpdated"/>
          <Submission :submission="submission" v-if="!modify && id"/>
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
      <q-tab-panel name="charges" v-if="submission.id">
        <q-card-section>
          <charges :submission="submission"/>
        </q-card-section>
      </q-tab-panel>
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
import Vue from 'vue'

export default {
  name: 'submission',
  props: ['id', 'create', 'modify'],
  data () {
    return {
      submission: {'sample_data': [], 'payment': {}, 'contacts': []},
      errors: {},
      submission_types: [],
      type_options: this.$store.getters.typeOptions,
      tab: 'submission'
      // type: {},
      // debug: false,
      // modify: false,
      // create: false
    }
  },
  mounted: function () {
    console.log('mounted')
    var self = this

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
          Vue.set(self, 'submission', response.data)
        })
    }
  },
  methods: {
    submissionUpdated (submission) {
      // this.modify = false
      console.log('submissionUpdated', submission)
      Vue.set(this, 'submission', submission)
      // this.submission = submission
    }
  },
  watch: {
    'id': function (id) {
      console.log('id', id)
      // if (!id || id === 'create') {
      //   this.create = true
      // }
      var self = this
      if (this.id) {
        self.$axios
          .get('/api/submissions/' + self.id)
          .then(function (response) {
            console.log('response', response)
            self.submission = response.data
            Vue.set(self.submission, 'type', response.data.type.id)
          })
      } else {
        Vue.set(this, 'submission', {'sample_data': [], 'contacts': [], biocore: false, 'payment': {}})
        // this.submission = {'sample_data': [], 'contacts': [], biocore: false}
      }
    }
  },
  computed: {
    error_message (field) {
      return this.errors[field]
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
