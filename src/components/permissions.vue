<template>
  <div v-if="permissions">
    <!-- Permissions: {{permissions}}
    <div>{{permission_rows}}</div>
    <div>columns: {{columns.length}}</div> -->
    <q-table
      title="Permissions"
      :data="permission_rows"
      :columns="columns"
      row-key="username"
      v-if="permission_rows"
      :filter="filter"
      :pagination="initialPagination"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="last_name" :props="props">
            {{ props.row.last_name }}, {{ props.row.first_name }}
          </q-td>
          <q-td key="email" :props="props">
              {{ props.row.email }}
          </q-td>
          <q-td v-for="perm in permissions.available_permissions" :key="perm[0]" class="text-right">
            <q-checkbox v-model="props.row.permissions" :val="perm[0]" />
          </q-td>
        </q-tr>
      </template>
      <template v-slot:top-left>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:top-right>
        <userField v-model="new_users" query-params="is_staff=1" @input="addUsers" :button-props="{ label: 'Add User', size: 'md'}"/>
        <q-btn label="Save" @click="setPermissions" color="primary"/>
      </template>
    </q-table>
  </div>
</template>

<script>
import userField from './forms/userField.vue'
export default {
  props: ['baseUrl'],
  components: {
    userField
  },
  data () {
    return {
      filter: '',
      permissions: null,
      columns: [
        { name: 'last_name', label: 'User', field: 'last_name', sortable: true, align: 'left'},
        { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' }
      ],
      initialPagination: {
        sortBy: 'last_name',
        descending: false,
        page: 1,
        rowsPerPage: -1
        // rowsNumber: xx if getting data from a server
      },
      new_users: []
    }
  },
  mounted () {
    this.getPermissions()
  },
  methods: {
    addUsers () {
      while (this.new_users.length) {
        var user = this.new_users.pop()
        if (!this.permissions.user_permissions[user.username]) {
          this.$set(this.permissions.user_permissions, user.username, user)
          this.$set(user, 'permissions', [])
        } else {
          this.$q.notify({message: `The user "${user.first_name} ${user.last_name}" has already has permissions.  Please update them in the permissions table.`, type: 'negative'})
        }
      }
    },
    getPermissions () {
      var self = this
      this.$axios.get(`${this.baseUrl}/permissions/`)
        .then(
          function (response) {
            // self.columns = self.columns.concat(self.columns.response.data.permissions.map(p => ({ name: p[0], label: p[1], field: p[0], sortable: true })))
            // var columns = response.data.permissions.map(p => ({ name: p[0], label: p[1], field: p[0], sortable: true }))
            // console.log('columns', columns)
            // self.columns.splice(2, 0, columns)
            // columns.forEach(c => self.columns.push(c))
            response.data.available_permissions.forEach(p => self.columns.push({ name: p[0], label: p[1], field: p[0], sortable: false, align: 'right' }))
            console.log('columns', self.columns)
            self.permissions = response.data
          })
        .catch(
          function () {
            self.$q.notify({message: 'Error fetching permissions.', type: 'negative'})
          }
        )
    },
    setPermissions () {
      var self = this
      this.$axios.post(`${this.baseUrl}/set_permissions/`, this.permissions)
        .then(
          function (response) {
            self.$q.notify({message: 'Permissions set.', type: 'positive'})
            self.permissions = response.data
          })
        .catch(
          function () {
            self.$q.notify({message: 'Error setting permissions.', type: 'negative'})
          }
        )
    }
  },
  computed: {
    permission_rows () {
      return Object.values(this.permissions.user_permissions)
    }
  }
}
</script>
