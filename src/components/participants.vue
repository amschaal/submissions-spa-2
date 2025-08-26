<template>
  <div>
    <span>
    <q-dialog
      v-model="opened"
    >
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Participants
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <userField v-model="newUsers" :query-params="`lab=${submission.lab.lab_id}`" @input="addParticipant" :buttonProps="{ label: 'Add participants'}"/>
          <table>
            <tr><th>User</th><th>Email</th><th>Roles</th><th></th></tr>
            <tr v-for="p in participants" :key="p.user.id">
              <td>{{ p.user.last_name }}</td>
              <td>{{ p.user.email }}</td>
              <td>
                <q-checkbox v-model="p.roles" val="lead" label="lead" />
                <q-checkbox v-model="p.roles" val="watcher" label="watcher"/>
              </td>
              <td><q-btn size="sm" color="red" @click="removeParticipant(p)" label="Remove"/></td>
            </tr>
          </table>
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Save" @click="update" /> <q-btn flat label="Cancel" @click="cancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-btn label="Modify" @click="modify"/>
  </span>
    <span v-for="(p, index)  in submission.participants" :key="p.user.id">{{ p.user.first_name }} {{ p.user.last_name }} <span v-if="p.roles && p.roles.length">({{ p.roles.join(', ') }})</span> <span v-if="index !== submission.participants.length - 1">, </span></span>
  </div>
</template>

<script>
import userField from './forms/userField.vue'
import _ from 'lodash'
export default {
  props: ['submission'],
  components: {
    userField
  },
  data () {
    return {
      participants: [],
      newUsers: [],
      opened: false
    }
  },
  methods: {
    addParticipant (newUsers) {
      // console.log(this.newUsers, newUsers)
      newUsers.forEach(user => {
        if (!this.participants.some(obj => obj.user.id === user.id)) {
          this.participants.push({user: user, roles: [], submission_id: this.submission.id})
        }
      })
    },
    modify () {
      this.participants = _.cloneDeep(this.submission.participants)
      this.opened = true
    },
    update () {
      this.$axios.post(`/api/submissions/${this.submission.id}/update_participants/`, { participants: this.participants })
        .then(response => {
          this.$q.notify({message: 'Participants updated.', type: 'positive'})
          this.submission.participants = this.participants
          this.opened = false
        })
        .catch(response => {
          this.$q.notify({message: 'Error: Unable to update participants!', type: 'negative'})
        })
    },
    removeParticipant (participant) {
      this.participants.splice(this.participants.indexOf(participant), 1)
    },
    cancel () {
      this.opened = false
    }
  }
}

</script>
