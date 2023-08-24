<template>
  <div>
    <!-- {{config}} -->
    <div class="text-h4">Shares</div>
    <div v-if="shares.length > 0">
      <!-- {{shares}} -->
      <q-markup-table>
       <thead>
         <tr>
           <th class="text-left">URL</th>
           <th class="text-right">Name</th>
           <th class="text-right">Description</th>
           <th class="text-right" v-if="is_staff">Shared with</th>
           <th class="text-right" v-if="is_staff">Action</th>
         </tr>
       </thead>
       <tbody v-for="share in shares">
         <Share :share="share" :submission="submission" :remove-share="removeShare"/>
       </tbody>
     </q-markup-table>

    </div>
    <div v-else>
      <h4>No shares have been created yet.</h4>
    </div>
    <div v-if="$perms.hasLabPerm('ADMIN') || $perms.hasLabPerm('MEMBER')">
      <q-btn label="Create Share"  @click="createShareDialog" color="positive"/>
      <q-btn label="Import Share"  @click="importShareDialog" color="primary"/>
    </div>
    <q-dialog v-model="createDialog" persistent >
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Create a New Share</div>
        </q-card-section>

        <q-card-section class="q-pt-none" id="create-form">
          <q-input outlined hint="Share name" v-model="shareName" autofocus @keyup.enter="prompt = false" :error="'name' in errors" :error-message="'name' in errors ? errors['name'].join(', ') : ''"/>
          <q-input
            v-model="shareDescription"
            outlined
            type="textarea"
            hint="Description"
            :error="'notes' in errors"
            :error-message="'notes' in errors ? errors['notes'].join(', ') : ''"
          />
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn label="Cancel" color="negative" v-close-popup />
          <q-btn label="Create Share" color="primary" @click="createShare" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="importDialog" persistent >
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Import an existing Share</div>
        </q-card-section>

        <q-card-section class="q-pt-none" id="create-form">
          <q-input dense outlined hint="Enter Bioshare URL, e.g. https://bioshare-domain.com/bioshare/view/abcde0123456789/" v-model="import_url" autofocus/>
        </q-card-section>

        <q-card-actions align="right" class="text-primary">
          <q-btn label="Cancel" color="negative" v-close-popup />
          <q-btn label="Import" color="primary" @click="importShare" />
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
      importDialog: false,
      shareName: '',
      shareDescription: '',
      errors: {},
      import_url: null
    }
  },
  methods: {
    getShares () {
      var self = this
      this.$axios
        .get(`/api/plugins/bioshare/submissions/${self.submission.id}/submission_shares/?submission=${self.submission.id}`)
        .then(function (response) {
          self.shares = response.data.results
          if (self.is_staff) {
            for (var i in self.shares) {
              self.getPermissions(self.shares[i])
            }
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
    importShareDialog () {
      this.import_url = ''
      this.importDialog = true
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
          // console.log('ERROR', error.response.data)
          self.errors = error.response.data
          self.$q.notify({message: 'There was an error creating the share.', type: 'negative'})
        })
    },
    importShare () {
      var self = this
      this.$axios.post(`/api/plugins/bioshare/submissions/${self.submission.id}/submission_shares/import_share/`, {url: this.import_url})
        .then(function (response) {
          self.shares.push(response.data)
          self.importDialog = false
          self.$q.notify({message: `Share ${response.data.name} imported!`, type: 'positive'})
        })
        .catch(function (error) {
          // console.log('ERROR', error.response.data)
          var message = error.response.data && error.response.data.detail ? ' Error: '+ error.response.data.detail : ''
          self.$q.notify({message: 'There was an error importing the share.' + message , type: 'negative'})
        })
    },
    removeShare ( share ) {
      if (!confirm(`This will unlink the share ${share.name} from this submission.  To delete it, you should first delete it from Bioshare directly.  Do you want to unlink it from this submission?`))
        return
      this.$axios.delete(`/api/plugins/bioshare/submissions/${this.submission.id}/submission_shares/${share.id}/`)
        .then( response => {
          this.shares.splice(this.shares.indexOf(share),1)
          this.$q.notify({message: `Share unlinked!`, type: 'positive'})
        })
        .catch( error => {
          this.$q.notify({message: 'There was an error removing the share.', type: 'negative'})
        })
    }
  },
  mounted () {
    this.getShares()
  },
  onActivated () {
    alert('mounted')
  },
  computed: {
    'is_staff': function () {
      return this.submission.permissions.indexOf('STAFF') != -1
    }
  },
  components: {
    Share
  }
}
</script>

<style>
#create-form .q-field__bottom--animated {
    transform: none;
    position: relative;
    margin: 0 auto;
}
</style>