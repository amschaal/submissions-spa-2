<template>
  <div><q-btn icon="warning" label="Cancel Submission" title="Cancel submission" @click="cancel" v-if="!submission.cancelled && (!submission.locked || $store.getters.isLoggedIn)" color="red"/><q-btn label="Uncancel" title="Uncancel submission" @click="uncancel" v-if="submission.cancelled && $store.getters.isLoggedIn" color="green"/></div>
</template>

<script>
export default {
  props: ['submission'],
  methods: {
    cancel () {
      if (!confirm('Are you sure you want to cancel this submission?')) {
        return
      }
      var self = this
      this.$axios.post(`/api/submissions/${this.submission.id}/cancel/`)
        .then(
          function (response) {
            self.$q.notify({message: 'Submission cancelled.', type: 'positive'})
            self.submission.cancelled = true
          })
        .catch(
          function () {
            self.$q.notify({message: 'Error cancelling submission.', type: 'negative'})
          }
        )
    },
    uncancel () {
      var self = this
      this.$axios.post(`/api/submissions/${this.submission.id}/uncancel/`)
        .then(
          function (response) {
            self.$q.notify({message: 'Submission "uncancelled".', type: 'positive'})
            self.submission.cancelled = null
          })
        .catch(
          function () {
            self.$q.notify({message: 'Error "uncancelling" submission.', type: 'negative'})
          }
        )
    }
  }
}
</script>
