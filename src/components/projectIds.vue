<template>
  <div v-if="$store.getters.isStaff">
    <q-table
      title="Project IDs"
      :data="project_ids"
      :columns="columns"
      row-key="id"
      style="max-width:800px"
      :pagination="initialPagination"
    >
    <template slot="body" slot-scope="props">
      <q-tr :props="props" v-bind:class="{'new': !props.row.id}">
        <q-td auto-width key="prefix" :props="props" style="width: 10em"><q-input v-model="props.row.prefix" /></q-td>
        <q-td key="next_id" :props="props" style="width: 5em"><q-input v-model="props.row.next_id"/></q-td>
        <q-td key="num_digits" :props="props" style="width: 5em"><q-input v-model="props.row.num_digits" type="number"/></q-td>
        <q-td key="generate_id" :props="props" style="width: 20em">{{generate_id(props.row)}}</q-td>
        <q-td key="action"><span class="float-right"><q-btn label="Save" @click="save(props.row)"/> <q-btn label="Delete" color="negative" @click="deleteProjectID(props.row)"/></span></q-td>
      </q-tr>
    </template>
    </q-table>
    <q-btn label="New" @click="create()" color="positive"/>
  </div>
</template>

<script>
export default {
  props: ['lab'],
  data () {
    return {
      project_ids: [],
      columns: [
        { name: 'prefix', label: 'Prefix', field: 'prefix', sortable: true },
        { name: 'next_id', label: 'Sequence #', field: 'next_id', sortable: true },
        { name: 'num_digits', label: '# Digits', field: 'num_digits', sortable: true },
        { name: 'generate_id', label: 'Projected Next ID', field: 'generate_id', sortable: false },
        { name: 'action', label: 'Action', field: 'action', sortable: false }
      ],
      initialPagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 0
      }
    }
  },
  methods: {
    loadProjectIDs () {
      var self = this
      this.$axios.get(`/api/project_ids/?lab_id=${this.lab.id}`)
        .then(
          function (response) {
            self.project_ids = response.data.results
          })
        .catch(
          function () {
            self.$q.notify({message: 'Error getting project ids.', type: 'negative'})
          }
        )
    },
    save (obj) {
      var self = this
      var action = !obj.id ? 'post' : 'put'
      var url = obj.id ? `/api/project_ids/${obj.id}/` : '/api/project_ids/'
      // var url = !this.create ? '/api/submissions/' + id + '/update/' : '/api/submit/'
      this.$axios[action]('' + url, obj)
        .then(function (response) {
          obj.id = response.data.id
          self.$set(obj, 'id', response.data.id)
          self.$q.notify({message: 'Project ID saved.', type: 'positive'})
        })
        .catch(function () {
          self.$q.notify({message: 'Unable to save Project ID: ' + obj.prefix, type: 'negative'})
        })
    },
    deleteProjectID (obj) {
      if (obj.id && !confirm(`Are you sure you want to delete Project ID "${obj.prefix}"?  This cannot be undone.`)) {
        return
      }
      var self = this
      function remove () {
        var i = self.project_ids.indexOf(obj)
        self.project_ids.splice(i, 1)
      }
      if (!obj.id) {
        remove()
      } else {
        this.$axios.delete(`/api/project_ids/${obj.id}/`)
          .then(function (response) {
            self.$q.notify({message: `Project ID ${obj.prefix} deleted.`, type: 'positive'})
            remove()
          })
          .catch(function () {
            self.$q.notify({message: 'Unable to delete Project ID: ' + obj.prefix, type: 'negative'})
          })
      }
    },
    create () {
      this.project_ids.push({'prefix': 'PREFIX', 'next_id': 1, 'num_digits': 4, 'lab': this.lab.id})
    },
    generate_id (obj) {
      var n = obj.next_id + ''
      var suffix = n.length >= obj.num_digits ? n : new Array(obj.num_digits - n.length + 1).join('0') + n
      return obj.prefix + suffix
    }
  },
  mounted () {
    this.loadProjectIDs()
  },
  watch: {
    lab: function (lab) {
      console.log('lab', lab)
      this.loadProjectIDs()
    }
  }
}
</script>
