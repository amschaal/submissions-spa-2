<template>
  <q-page padding class="docs-input row justify-center">
    <q-card v-if="user">
      <q-card-section>
        <h4>Profile</h4>
        <q-input label="First Name" v-model="user.first_name"/>
        <q-input label="Last Name" v-model="user.last_name"/>
        <h5>Email</h5>
        <h6>Set primary email</h6>
        <div v-for="email in user.emails" :key="email">
          <q-radio v-model="primary_email" :val="email" :label="email" @input="setPrimaryEmail"/>
        </div>
      </q-card-section>
  </q-card>
  </q-page>
</template>

<style>
</style>

<script>
export default {
  name: 'Profile',
  data () {
    return {
      user: null,
      primary_email: null
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
