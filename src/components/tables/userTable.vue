<template>
  <div class="q-pa-md">
    <q-table
      ref="table"
      :data="serverData"
      :columns="columns"
      :visible-columns="filters.visibleColumns"
      :filter="filters.filter"
      row-key="id"
      :pagination.sync="filters.serverPagination"
      :loading="loading"
      @request="request"
      binary-state-sort
      :rows-per-page-options="[10,25,0]"
      selection="multiple"
      :selected.sync="selected"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filters.filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
    </q-table>
  </div>
</template>

<script>
// import axios from 'axios'
export default {
  props: ['value', 'queryParams'],
  data () {
    return {
      filters: {
        filter: '',
        serverPagination: {
          page: 1,
          rowsNumber: 0, // specifying this determines pagination is server-side
          rowsPerPage: 10,
          descending: true,
          sortBy: 'first_name'
        },
        visibleColumns: ['first_name', 'last_name', 'email']
      },
      selected: this.value ? this.value : [],
      loading: false,
      serverData: [],
      columns: [
        { name: 'first_name', label: 'First', field: 'first_name', sortable: true },
        { name: 'last_name', label: 'Last', field: 'last_name', sortable: true },
        { name: 'email', label: 'Email', field: 'email', sortable: true }
      ]
    }
  },
  methods: {
    request ({ pagination, filter }) {
      // we set QTable to "loading" state
      this.loading = true

      // we do the server data fetch, based on pagination and filter received
      // (using Axios here, but can be anything; parameters vary based on backend implementation)
      console.log(pagination, filter)
      var sortBy = pagination.sortBy
      if (pagination.descending) {
        sortBy = '-' + sortBy
      }
      var search = this.filters.filter !== '' ? `&search=${this.filters.filter}` : ''
      var pageSize = pagination.rowsPerPage ? pagination.rowsPerPage : 1000000 // HACKY
      this.$axios
        .get(`/api/users/?ordering=${sortBy}&page=${pagination.page}&page_size=${pageSize}${search}&${this.queryParams}`)// ${pagination.descending}&filter=${filter}
        .then(({ data }) => {
          console.log('data', data)

          // console.log('pagination', pagination)
          // updating pagination to reflect in the UI
          this.filters.serverPagination = pagination

          this.filters.serverPagination.sortBy = pagination.sortBy

          // we also set (or update) rowsNumber
          this.filters.serverPagination.rowsNumber = data.count

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
        pagination: this.filters.serverPagination,
        filter: this.filters.filter
      })
    }
    // ,
    // selectionChanged () {
    //   alert('changed')
    // }
  },
  mounted () {
    this.refresh()
  },
  watch: {
    selected: function (val) {
      this.$parent.$emit('selected', val)
    }
  }
}
</script>
