<template>
  <div>{{config}}
    <div v-if="shares.length > 0">
      {{shares}}
      <div v-for="share in shares">
        <Share :share="share" :submission="submission"/>{{share}}
      </div>
    </div>
    <div v-else>
      <h4>No shares have been created yet.</h4>
    </div>
    <div v-if="$perms.hasLabPerm('ADMIN') || $perms.hasLabPerm('MEMBER')">
      <q-btn label="Create Share" @click="createShare" color="primary"/>
    </div>
  </div>
</template>

<script>
import Share from './Share.vue'
export default {
  props: ['submission', 'config'],
  data () {
    return {
      shares: [],
      permissions: null
    }
  },
  methods: {
    getShares () {
      var self = this
      this.$axios
        .get(`/api/bioshare/submission_shares/?submission=${self.submission.id}`)
        .then(function (response) {
          self.shares = response.data.results
          for (var i in self.shares) {
            self.getPermissions(self.shares[i])
          }
          // self.getPermissions(share)
        })
        .catch(function (error) {
          if (error.response && error.response.status !== 404) {
            self.$q.notify({message: 'There was an error retrieving the share.', type: 'negative'})
          }
        })
    },
    createShare () {
      var self = this
      this.$axios.post('/api/bioshare/submission_shares/', {submission: this.submission.id})
        .then(function (response) {
          self.shares.push(response.data)
          self.$q.notify({message: `Submission created!`, type: 'positive'})
        })
        .catch(function (error) {
          // console.log('ERROR', error)
          self.$q.notify({message: 'There was an error creating the share.', type: 'negative'})
        })
    }
  },
  mounted () {
    this.getShares()
  },
  components: {
    Share
  }
}
</script>
