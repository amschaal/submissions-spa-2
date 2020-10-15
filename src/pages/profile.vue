<template>
  <q-page padding class="docs-input row justify-center row">
    <q-card v-if="user" class="col-md-6 col-sm-12">
      <q-card-section>
        <h4>Profile</h4>
        <div class="row">
          <q-input label="First Name" v-model="user.first_name" class="col6" disable/>
          <q-input label="Last Name" v-model="user.last_name" class="col6" disable/>
        </div>
        <h5>Email</h5>
        <h6>Set primary email</h6>
        <div v-for="email in user.emails" :key="email">
          <q-radio v-model="primary_email" :val="email" :label="email" @input="setPrimaryEmail"/>
        </div>
        <div>
          <q-input bottom-slots v-model="claim_email" placeholder="Enter email" :dense="dense" v-if="!claim_in_progress">
          <template v-slot:hint>
            Add another email to your profile.
          </template>
          <template v-slot:after>
            <q-btn flat label="Request" @click="requestEmail"/>
          </template>
        </q-input>
        <q-input bottom-slots v-model="token" placeholder="Enter confirmation token" :dense="dense" v-else>
        <template v-slot:hint>
          Please enter the confirmation token that was sent to your email here.  If you do not receive an email in a couple minutes, you may try again.
        </template>
        <template v-slot:after>
          <q-btn flat label="Confirm" @click="confirmEmail"/>
        </template>
      </q-input>
        </div>
        <h5>API Key</h5>
        <q-input filled v-model="token" disable dense>
          <template v-slot:after>
            <q-btn dense label="View" @click="getToken" v-if="!view_token"/>
            <q-btn dense :label="token ? 'Regenerate' : 'Create'" color="green" @click="createToken" v-if="view_token"/>
            <q-btn dense label="Delete" color="red" @click="deleteToken" v-if="view_token && token"/>
        </template>
        </q-input>
      </q-card-section>
  </q-card>
  </q-page>
</template>

<style>
.min-90w {
  width: 90%;
}
</style>

<script>
export default {
  name: 'Profile',
  data () {
    return {
      user: null,
      primary_email: null,
      claim_email: null,
      claim_in_progress: false,
      token: null,
      view_token: false
    }
  },
  methods: {
    loadUser () {
      var self = this
      this.$q.loading.show()
      this.$axios
        .get('/api/get_user/')
        .then(function (response) {
          self.user = response.data.user
          self.primary_email = self.user.email
          self.$q.loading.hide()
        })
    },
    setPrimaryEmail () {
      var self = this
      this.$axios
        .post('/api/emails/set_primary/', { email: this.primary_email })
        .then(function (response) {
          self.$q.notify(response.data.message)
          self.user.email = self.primary_email
        })
        .catch(function () {
          self.$q.notify({message: `Error setting email as primary: ${self.primary_email}`, type: 'negative'})
          self.primary_email = self.user.email
        })
    },
    requestEmail () {
      var self = this
      this.$axios
        .post('/api/emails/claim/', { email: this.claim_email })
        .then(function (response) {
          self.$q.notify(`A code for claiming this email has been sent to ${self.claim_email}.`)
          self.claim_in_progress = true
        })
        .catch(function (error) {
          self.$q.notify({message: error.response.data.message, type: 'negative'})
        })
    },
    confirmEmail () {
      var self = this
      if (!this.token) {
        self.$q.notify({message: 'Please enter the confimation token sent to your email.', type: 'negative'})
      }
      this.$axios
        .post('/api/emails/validate/', { token: this.token })
        .then(function (response) {
          self.$q.notify(`You have successfully added ${self.claim_email} to your account.`)
          self.user.emails.push(response.data.email)
          self.claim_in_progress = false
          self.token = null
          self.claim_email = null
        })
        .catch(function (error) {
          self.$q.notify({message: error.response.data.message, type: 'negative'})
        })
    },
    getToken () {
      var self = this
      this.$axios
        .get('/api/users/get_token/')
        .then(function (response) {
          self.token = response.data.token
          self.view_token = true
          if (!self.token) {
            self.$q.notify({message: 'You do not currently have an auth token, but you may create one.', type: 'positive'})
          }
        })
    },
    createToken () {
      var self = this
      var create = function () {
        self.$axios
          .post('/api/users/create_token/')
          .then(function (response) {
            self.token = response.data.token
            self.$q.notify({message: 'A new auth token has been created.', type: 'positive'})
          })
      }
      if (!this.token) {
        create()
      } else {
        this.$q.dialog({
          title: 'Confirm Auth Token Regeneration',
          message: 'Are you sure you want to regenerate your auth token?  Your old token will become unusable.',
          cancel: true
        }).onOk(
          create
        )
      }
    },
    deleteToken () {
      var self = this
      this.$q.dialog({
        title: 'Confirm Auth Token Deletion',
        message: 'Are you sure you want to delete your auth token?',
        cancel: true
      }).onOk(() => {
        this.$axios
          .delete('/api/users/delete_token/')
          .then(function (response) {
            self.token = response.data.token
            self.$q.notify({message: 'Your auth token has been deleted.', type: 'positive'})
          })
      })
    }
  },
  mounted: function () {
    this.loadUser()
  },
  computed: {
    institution () {
      return this.$store.getters.institution
    }
  }
}
</script>
