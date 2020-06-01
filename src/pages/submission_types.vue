<template>
  <q-page class="docs-input justify-center">
    <q-table
      ref="table"
      :data="serverData"
      :columns="columns"
      :filter="filter"
      row-key="id"
      :pagination.sync="serverPagination"
      :loading="loading"
      @request="request"
      binary-state-sort
      :rows-per-page-options="[10,25,0]"
    >
      <template slot="top-right" slot-scope="props" :props="props">
        <q-checkbox v-model="showInactive" label="Show inactive" @input="refresh" class="inactive"/>
        <q-input
          v-model="filter"
          debounce="500"
          placeholder="Search"
          rounded
          outlined
          dense
        >
          <template v-slot:prepend>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template slot="body" slot-scope="props">
        <q-tr :props="props" v-bind:class="{'inactive': !props.row.active}">
          <q-td key="sort_order" :props="props">{{ props.row.sort_order }}</q-td>
          <q-td key="name" :props="props"><router-link :to="{ name: 'submission_type', params: { id: props.row.id }}">{{ props.row.name }}</router-link></q-td>
          <q-td key="description" :props="props">{{ props.row.description }}</q-td>
          <q-td key="updated" :props="props">{{ props.row.updated | formatDate }}</q-td>
          <q-td key="submission_count" :props="props"><router-link :to="{ name: 'submissions', query: { search: props.row.name }}">{{ props.row.submission_count }}</router-link></q-td>
        </q-tr>
      </template>
      <template slot="top-left" slot-scope="props" :props="props">
        <q-btn color="primary" label="Create" class="q-mr-sm" :to="{name: 'create_submission_type'}"/>
      </template>
    </q-table>
  </q-page>
</template>

<script>
// import axios from 'axios'

export default {
  name: 'submission_types',
  data () {
    return {
      filter: '',
      loading: false,
      serverPagination: {
        page: 1,
        rowsNumber: 0, // specifying this determines pagination is server-side
        rowsPerPage: 10,
        descending: false,
        sortBy: 'sort_order'
      },
      serverData: [],
      showInactive: false,
      columns: [
        { name: 'sort_order', label: 'Sort Order', field: 'sort_order', sortable: true },
        { name: 'name', label: 'Name', field: 'name', sortable: true },
        { name: 'description', label: 'Description', field: 'description' },
        { name: 'updated', label: 'Updated', field: 'updated', sortable: true },
        { name: 'submission_count', label: 'Submissions', field: 'submission_count', sortable: true }
      ]
    }
  },
  methods: {
    request ({ pagination, filter }) {
      // we set QTable to "loading" state
      this.loading = true

      // we do the server data fetch, based on pagination and filter received
      // (using Axios here, but can be anything; parameters vary based on backend implementation)
      var sortBy = pagination.sortBy
      if (pagination.descending) {
        sortBy = '-' + sortBy
      }
      sortBy += ',name'
      var lab = '&lab=' + this.$route.params.lab_id
      var search = this.filter !== '' ? `&search=${this.filter}` : ''
      var inactive = !this.showInactive ? '&active=true' : ''
      var pageSize = pagination.rowsPerPage ? pagination.rowsPerPage : 1000000 // HACKY
      console.log('inactive', inactive)
      this.$axios
        .get(`/api/submission_types/?ordering=${sortBy}&page=${pagination.page}&page_size=${pageSize}${lab}${search}${inactive}`)// ${pagination.descending}&filter=${filter}
        .then(({ data }) => {
        /*
          // updating pagination to reflect in the UI
          this.serverPagination = pagination

          // we also set (or update) rowsNumber
          this.serverPagination.rowsNumber = data.rowsNumber

          // then we update the rows with the fetched ones
          */
          this.serverPagination = pagination

          // we also set (or update) rowsNumber
          this.serverPagination.rowsNumber = data.count

          // then we update the rows with the fetched ones
          this.serverData = data.results
          // finally we tell QTable to exit the "loading" state
          this.loading = false
        })
        .catch(error => {
          // there's an error... do SOMETHING
          console.log(error)
          // we tell QTable to exit the "loading" state
          this.loading = false
        })
    },
    refresh () {
      this.request({
        pagination: this.serverPagination,
        filter: this.filter
      })
    }
  },
  mounted () {
    // once mounted, we need to trigger the initial server data fetch
    this.request({
      pagination: this.serverPagination,
      filter: this.filter
    })
  }
}
</script>

<style>
tr.inactive td, tr.inactive td a, .inactive {
  color: red;
}
/*
.q-table-middle.scroll, .scroll {
  overflow: inherit !important;
}
*/

</style>
