<template>
  <tr v-if="share">
    <th class="text-left"><a target="_blank" :href="share.url">{{share.url}}</a></th>
    <th class="text-right">{{share.name}}</th>
    <th class="text-right">{{share.notes}}</th>
    <th class="text-right">
      <span v-for="(e, index) in sharedWithEmails">
        <span v-if="index !== 0">, </span><span style="color:green">{{ e }}</span>
      </span> 
      <span v-for="(e, index) in missingEmails">
        <span v-if="index !== 0 || index == 0 && sharedWithEmails.length != 0">, </span><span style="color:red">{{ e }}</span>
      </span>
    </th>
    <th class="text-right">
      <div v-if="permissions" class="inline">
        <q-btn color="primary" size="sm" @click="open = true" label="Manage permissions"/>
        <q-dialog v-model="open" full-width>
          <q-layout view="Lhh lpR fff" container class="bg-white">
            <q-page-container>
            <q-page padding>
              <h5><a :href="share.url" target="_blank">{{share.name || share.url}}</a></h5>
              <q-markup-table flat bordered>
                <thead>
                  <tr>
                    <th colspan="3">
                      <div class="row no-wrap items-center">
                        <div class="text-h5 q-ml-md">Participant sharing (Full permissions)<q-btn label="Update Sharing" @click="shareWithParticipants" color="primary"/><q-checkbox label="send email" v-model="email_participants"/></div>
                      </div>
                    </th>
                  </tr>
                  <tr>
                    <th class="text-left">Participant</th>
                    <th class="text-right">Email</th>
                    <th class="text-right">Shared</th>
                  </tr>
                </thead>
                <tbody>
                <tr v-for="p in submission.participants">
                  <td class="text-left">{{p.first_name}} {{p.last_name}}</td>
                  <td class="text-right">{{p.email}}</td>
                  <td class="text-right"><q-icon name="check_circle" color="green" v-if="sharedWith(p.email)"/><q-icon name="cancel" color="red" v-else/></td>
                </tr>
              </tbody>
              </q-markup-table>
              <q-markup-table flat bordered>
                <thead>
                  <tr>
                    <th colspan="4">
                      <div class="row no-wrap items-center">
                        <div class="text-h5 q-ml-md">Submitter/PI/Contact Sharing (Download only) <q-btn label="Update Sharing" @click="shareWithSubmitter" color="primary"/><q-checkbox label="send email" v-model="email_submitter"/></div>
                      </div>
                    </th>
                  </tr>
                  <tr>
                    <th class="text-left">Type</th>
                    <th class="text-left">Name</th>
                    <th class="text-right">Email</th>
                    <th class="text-right">Shared</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td class="text-left">Submitter</td>
                    <td class="text-right">{{submission.first_name}} {{submission.last_name}}</td>
                    <td class="text-right">{{submission.email}}</td>
                    <td class="text-right"><q-icon name="check_circle" color="green" v-if="sharedWith(submission.email)"/><q-icon name="cancel" color="red" v-else/></td>
                  </tr>
                  <tr>
                    <td class="text-left">PI</td>
                    <td class="text-right">{{submission.pi_first_name}} {{submission.pi_last_name}}</td>
                    <td class="text-right">{{submission.pi_email}}</td>
                    <td class="text-right"><q-icon name="check_circle" color="green" v-if="sharedWith(submission.pi_email)"/><q-icon name="cancel" color="red" v-else/></td>
                  </tr>
                <tr v-for="c in submission.contacts">
                  <td class="text-left">Contact</td>
                  <td class="text-right">{{c.first_name}} {{c.last_name}}</td>
                  <td class="text-right">{{c.email}}</td>
                  <td class="text-right"><q-icon name="check_circle" color="green" v-if="sharedWith(c.email)"/><q-icon name="cancel" color="red" v-else/></td>
                </tr>
              </tbody>
              </q-markup-table>
              <q-btn color="primary" @click="open = false" label="Close" />
            </q-page>
          </q-page-container>
        </q-layout>

        </q-dialog>
      </div>
      <q-btn color="negative" size="sm" @click="removeShare(share)" label="Remove" class="inline"/>
    </th>
  </tr>
</template>

<script>
export default {
  props: ['submission', 'share', 'config', 'removeShare'],
  data () {
    return {
      permissions: null,
      open: false,
      email_participants: true,
      email_submitter: true
    }
  },
  methods: {
    // getShare () {
    //   var self = this
    //   this.$axios
    //     .get(`/api/bioshare/submission_shares/${self.share.id}/`)
    //     .then(function (response) {
    //       self.share = response.data
    //       self.getPermissions()
    //     })
    //     .catch(function (error) {
    //       if (error.response && error.response.status !== 404) {
    //         self.$q.notify({message: 'There was an error retrieving the share.', type: 'negative'})
    //       }
    //     })
    // },
    shareWithParticipants () {
      this.setPermissions('share_with_participants', this.email_participants)
    },
    shareWithSubmitter () {
      this.setPermissions('share', this.email_submitter)
    },
    setPermissions (action, email) {
      var self = this
      this.$axios.post(`/api/plugins/bioshare/submissions/${self.submission.id}/submission_shares/${this.share.id}/${action}/`, {email: email})
        .then(function (response) {
          self.permissions = response.data
          self.$q.notify({message: `Permissions updated!`, type: 'positive'})
        })
        .catch(function (error) {
          // console.log('ERROR', error)
          self.$q.notify({message: 'There was an error updating permissions.', type: 'negative'})
        })
    },
    getPermissions () {
      var self = this
      this.$axios.get(`/api/plugins/bioshare/submissions/${self.submission.id}/submission_shares/${this.share.id}/permissions/`)
        .then(function (response) {
          self.permissions = response.data
        })
        .catch(function (error) {
          // console.log('ERROR', error)
          self.$q.notify({message: 'There was an error retrieving share permissions.', type: 'negative'})
        })
    },
    sharedWith (email) {
      return !!Object.keys(this.permissions.permissions.user_perms).find(k => k.toLowerCase() === email.toLowerCase())
      // return this.permissions.user_email.some(function(element, i) {
      //   if (email === element.toLowerCase()) {
      //     index = i;
      //     return true;
      //   }
      // });
    }
  },
  mounted () {
    this.getPermissions()
  },
  computed: {
    sharedWithEmails: function () {
      return this.permissions ? Object.keys(this.permissions.permissions.user_perms) : []
    },
    missingEmails: function () {
      if (!this.permissions) {
        return []
      }
      var shared_with = new Set(Object.keys(this.permissions.permissions.user_perms).map(email=>email.toLowerCase()))
      return this.submissionEmails.filter(e=>!shared_with.has(e))
    },
    submissionEmails: function () {
      var submission_emails = new Set(this.submission.contacts.map(c => c.email.toLowerCase()))
      submission_emails.add(this.submission.email.toLowerCase())
      submission_emails.add(this.submission.pi_email.toLowerCase())
      return Array.from(submission_emails)
    }
  }
}
</script>
<style>
.inline {
  display: inline-block;
}</style>