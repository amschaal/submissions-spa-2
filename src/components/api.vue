<template>
  <div>
    <h5>API Key</h5>
    <q-input filled v-model="token" disable dense>
      <template v-slot:after>
        <q-btn dense label="View" @click="getToken" v-if="!view_token"/>
        <q-btn dense :label="token ? 'Regenerate' : 'Create'" color="green" @click="createToken" v-if="view_token"/>
        <q-btn dense label="Delete" color="red" @click="deleteToken" v-if="view_token && token"/>
    </template>
    </q-input>
    <div v-if="token">
      <h6>API Examples</h6>
      <h6>Querying submissions</h6>
      <strong>Using curl</strong>
      <q-banner dense class="bg-black text-white code" rounded>
curl -X GET '{{api_base}}/api/submissions/?page=1&page_size=10' -H 'Authorization: Token {{token}}'
      </q-banner>
      <strong>Python2</strong>
<q-banner dense class="bg-black text-white code" rounded>
import urllib2, json
response = urllib2.urlopen(urllib2.Request('{{api_base}}/api/submissions/?page=1&page_size=10', headers={'Authorization': 'Token {{token}}'}))
data = json.loads(response.read())
for submission in data['results']: #do something with submissions
  print("id: {}, project_id: {}".format(submission['id'], submission['internal_id']))
</q-banner>
<strong>Python3</strong>
<q-banner dense class="bg-black text-white code" rounded>
import urllib.request, json
req = urllib.request.Request('{{api_base}}/api/submissions/?page=1&page_size=10')
req.add_header('Authorization', 'Token {{token}}')
response = urllib.request.urlopen(req)
data = json.loads(response.read())
for submission in data['results']: #do something with submissions
  print("id: {}, project_id: {}".format(submission['id'], submission['internal_id']))
</q-banner>
</div>
</div>
</template>

<script>
export default {
  data () {
    return {
      token: null,
      view_token: false
    }
  },
  methods: {
    getToken () {
      const self = this
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
      const self = this
      const create = function () {
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
      const self = this
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
  computed: {
    api_base () {
      return 'https://' + window.location.host + '/server'
    }
  }
}
</script>
<style scoped>
.code {
  overflow-x: scroll;
  white-space: pre;
}
</style>
