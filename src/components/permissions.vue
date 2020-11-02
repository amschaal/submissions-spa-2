<template>
  <div v-if="permissions">
    Permissions: {{permissions}} {{object}}
    <div>{{permission_rows}}</div>
    <div>columns: {{columns.length}}</div>
    <q-table
      title="Permissions"
      :data="permission_rows"
      :columns="columns"
      row-key="username"
      v-if="permission_rows"
    >
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="username" :props="props">
            {{ props.row.first_name }} {{ props.row.last_name }}
          </q-td>
          <q-td key="email" :props="props">
              {{ props.row.email }}
          </q-td>
          <q-td v-for="perm in permissions.available_permissions" :key="perm[0]">
            <q-checkbox v-model="props.row.permissions" :val="perm[0]" />
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-btn label="Save" @click="setPermissions"/>
  </div>
</template>

<script>
export default {
  props: ['baseUrl', 'object'],
  data () {
    return {
      permissions: null,
      columns: [
        { name: 'username', label: 'User', field: 'username', sortable: false, align: 'left'},
        { name: 'email', label: 'Email', field: 'email', sortable: true, align: 'left' }
      ]
    }
  },
  mounted () {
    this.getPermissions()
  },
  methods: {
    getPermissions () {
      var self = this
      this.$axios.get(`${this.baseUrl}${this.object.id}/permissions/`)
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
      this.$axios.post(`${this.baseUrl}${this.object.id}/set_permissions/`, this.permissions)
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
