<template>
  <div>{{config}}
    <div v-if="shares.length > 0">
      <!-- {{shares}} -->
      <q-markup-table>
       <thead>
         <tr>
           <th class="text-left">URL</th>
           <th class="text-right">Name</th>
           <th class="text-right">Description</th>
           <th class="text-right">Shared with</th>
           <th class="text-right">Action</th>
         </tr>
       </thead>
       <tbody v-for="share in shares">
         <Share :share="share" :submission="submission"/>
       </tbody>
     </q-markup-table>

    </div>
    <div v-else>
      <h4>No shares have been created yet.</h4>
    </div>
    <div v-if="$perms.hasLabPerm('ADMIN') || $perms.hasLabPerm('MEMBER')">
      <q-btn label="Create Share"  @click="createShareDialog" color="primary"/>
    </div>
    <q-dialog v-model="createDialog" persistent >
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Create a New Share</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input dense outlined hint="Share name" v-model="shareName" autofocus @keyup.enter="prompt = false" />
          <q-input
            v-model="shareDescription"
            outlined
            type="textarea"
            hint="Description"
            dense
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn label="Cancel" color="negative" v-close-popup />
          <q-btn label="Create Share" color="primary" @click="createShare" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import Share from './Share.vue'
export default {
  props: ['submission', 'config'],
  data () {
    return {
      shares: [],
      permissions: null,
      createDialog: false,
      shareName: '',
      shareDescription: ''
    }
  },
  methods: {
    getShares () {
      var self = this
      this.$axios
        .get(`/api/plugins/bioshare/submissions/${self.submission.id}/submission_shares/?submission=${self.submission.id}`)
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
    createShareDialog () {
      this.shareName = `${this.submission.pi_last_name}, ${this.submission.pi_first_name}: ` + this.submission.internal_id || this.submission.id
      if (this.shares.length > 0) {
        this.shareName += ' #' + (this.shares.length + 1)
      }
      this.createDialog = true
    },
    createShare () {
      var self = this
      this.$axios.post(`/api/plugins/bioshare/submissions/${self.submission.id}/submission_shares/`, {submission: this.submission.id, name: this.shareName, notes: this.shareDescription})
        .then(function (response) {
          self.shares.push(response.data)
          self.createDialog = false
          self.$q.notify({message: `Share created!`, type: 'positive'})
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
