<template>
  <q-page padding class="docs-input row justify-center">
    <q-card class="p90">
        <q-card-section>
          <div class="row">
            <div class="field col-12 q-mt-xs q-mb-xs">
              <q-banner dense class="text-white bg-primary" rounded>
                <p v-if="!version_details">Loading version details...</p>
                <div v-else>
                  <RevertButton v-if="version_details" :object-url="`/submissions/${id}`" :version="version_details" :revert-url="`/api/submissions/${id}/versions/${version_details.id}/revert/`" class="float-right"/>
                  <p>Version created by {{ created_by }} at <b>{{ version_details.revision.date_created | formatDateTime }}</b></p>
                  <p>You may view or modify the submission as it was at this version.  If modifying the submission from this version, the version will remain the same and a new version of the submission will be created.</p>
                  <p><router-link class="text-white" :to="{ name: 'submission', params: { id: id }}">Return</router-link> to the current version.</p>
                </div>
                </q-banner>
            </div>
          </div>
          <SubmissionForm :create="false" :submission_types="submission_types" :type_options="type_options" :id="id" v-if="(modify && id && canModify)" ref="submission_form" :version="version"/>
          <Submission :submission="submission" v-if="(!modify || !canModify) && id" :version="version"/>
        </q-card-section>
  </q-card>
  </q-page>
</template>

<script>
import Submission from '../components/submission.vue'
import RevertButton from '../components/revertButton.vue'
import SubmissionForm from '../components/forms/submissionForm.vue'
import Vue from 'vue'

export default {
  name: 'submission_version',
  props: ['id', 'version', 'modify'],
  data () {
    return {
      submission: {'sample_data': [], 'payment': {}, 'contacts': []},
      version_details: null,
      errors: {},
      submission_types: [],
      type_options: this.$store.getters.typeOptions
    }
  },
  mounted: function () {
    console.log('mounted')
    var self = this
    if (this.id && this.version) {
      console.log('id', this.id)
      this.$axios
        .get(`/api/submissions/${self.id}/versions/${self.version}/`)
        .then(function (response) {
          console.log('response', response)
          self.version_details = response.data
          var submission = response.data.serialized
          if (!submission.sample_data) {
            submission.sample_data = []
          }
          Vue.set(self, 'submission', submission)
          self.setLab()
        })
    }
  },
  methods: {
    submissionUpdated (submission) {
      console.log('submissionUpdated', submission)
      Vue.set(this, 'submission', submission)
    },
    setLab () {
      if (!this.$store.getters.lab || this.$store.getters.lab.lab_id !== this.submission.lab.lab_id) {
        this.$store.dispatch('setLabId', {axios: this.$axios, labId: this.submission.lab.lab_id, pluginManager: this.$plugins})
      }
    }
  },
  watch: {
    'id': function (id) {
      console.log('id', id)
      var self = this
      if (this.id) {
        self.$axios
          .get('/api/submissions/' + self.id)
          .then(function (response) {
            console.log('response', response)
            self.submission = response.data
            Vue.set(self.submission, 'type', response.data.type.id)
            self.setLab()
          })
      } else {
        Vue.set(this, 'submission', {'sample_data': [], 'contacts': [], 'payment': {}})
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
    },
    created_by () {
      var u = this.version_details.revision.user
      return u && u.first_name ? `${u.last_name}, ${u.first_name} (${u.email})` : 'unknown'
    }
  },
  components: {
    Submission,
    SubmissionForm,
    RevertButton
  }
}
</script>

<style scoped>
  .p90 {
    width: 90%;
  }
</style>
