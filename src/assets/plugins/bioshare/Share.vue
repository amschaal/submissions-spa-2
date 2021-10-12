<template>
  <div>{{config}}
    <div v-if="share">
      <p><a class="text-h5" target="_blank" :href="share.url">{{share.url}}</a></p>
      <div v-if="permissions">
      <q-markup-table flat bordered>
        <thead>
          <tr>
            <th colspan="3">
              <div class="row no-wrap items-center">
                <div class="text-h4 q-ml-md">Participant sharing (Full permissions)<q-btn label="Update Sharing" @click="shareWithParticipants" color="primary"/></div>
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
                <div class="text-h4 q-ml-md">Submitter/PI/Contact Sharing (Download only) <q-btn label="Update Sharing" @click="shareWithSubmitter" color="primary"/></div>
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
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: ['submission', 'share', 'config'],
  data () {
    return {
      permissions: null
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
      this.setPermissions('share_with_participants')
    },
    shareWithSubmitter () {
      this.setPermissions('share')
    },
    setPermissions (action) {
      var self = this
      this.$axios.post(`/api/bioshare/submission_shares/${this.share.id}/${action}/`, this.permissions)
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
      this.$axios.get(`/api/bioshare/submission_shares/${this.share.id}/permissions/`)
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
  }
}
</script>
