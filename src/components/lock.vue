<template>
  <div v-if="$store.getters.isStaff"><q-btn label="Unlocked" title="Click to lock" icon="lock_open" @click="lock" v-if="!submission.locked" color="green"/><q-btn label="Locked" title="Click to unlock" icon="lock" @click="unlock" v-if="submission.locked" color="red"/></div>
</template>

<script>
export default {
  props: ['submission'],
  methods: {
    lock () {
      const self = this
      this.$axios.post(`/api/submissions/${this.submission.id}/lock/`)
        .then(
          function (response) {
            self.$q.notify({message: 'Submission locked.', type: 'positive'})
            self.submission.locked = true
          })
        .catch(
          function () {
            self.$q.notify({message: 'Error locking submission.', type: 'negative'})
          }
        )
    },
    unlock () {
      const self = this
      this.$axios.post(`/api/submissions/${this.submission.id}/unlock/`)
        .then(
          function (response) {
            self.$q.notify({message: 'Submission unlocked.', type: 'positive'})
            self.submission.locked = false
          })
        .catch(
          function () {
            self.$q.notify({message: 'Error unlocking submission.', type: 'negative'})
          }
        )
    }
  }
}
</script>
