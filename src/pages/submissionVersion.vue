<template>
  <q-page padding class="docs-input row justify-center">
    <q-card class="p90">
        <q-card-section>
          <Submission :submission="submission" v-if="(!modify || !canModify) && id"/>
        </q-card-section>
  </q-card>
  </q-page>
</template>

<script>
import Submission from '../components/submission.vue'
import Vue from 'vue'

export default {
  name: 'submission_version',
  props: ['id', 'version_id', 'modify'],
  data () {
    return {
      submission: {'sample_data': [], 'payment': {}, 'contacts': []},
      errors: {},
      submission_types: [],
      type_options: this.$store.getters.typeOptions
    }
  },
  mounted: function () {
    console.log('mounted')
    var self = this
    if (this.id && this.version_id) {
      console.log('id', this.id)
      this.$axios
        .get(`/api/submissions/${self.id}/versions/${self.version_id}/serialize/`)
        .then(function (response) {
          console.log('response', response)
          if (!response.data.sample_data) {
            response.data.sample_data = []
          }
          Vue.set(self, 'submission', response.data)
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
    }
  },
  components: {
    Submission
  }
}
</script>

<style scoped>
  .p90 {
    width: 90%;
  }
</style>
