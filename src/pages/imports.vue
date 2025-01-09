<template>
  <q-page class="docs-input justify-center"><!-- row -->
    <q-table
      ref="table"
      :data="serverData"
      :columns="columns"
      :visible-columns="visibleColumns"
      :filter="filter"
      row-key="id"
      v-model:pagination="serverPagination"
      :loading="loading"
      @request="request"
      binary-state-sort
      :rows-per-page-options="[10,25,0]"
    >
      <template v-slot:top-left>
        <!-- <q-table-columns
          color="secondary"
          class="q-mr-sm"
          v-model="visibleColumns"
          :columns="columns"
          :props="props"
        /> -->
        <q-select
          v-model="visibleColumns"
          multiple
          outlined
          dense
          options-dense
          :display-value="$q.lang.table.columns"
          emit-value
          map-options
          :options="columns"
          option-value="name"
          options-cover
          style="min-width: 150px"
        />
        <q-checkbox v-model="showImported" label="Show imported" @input="refresh"/>
      </template>
      <template v-slot:top-right>
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
      <template v-slot:body="props" >
        <q-tr :props="props" v-bind:class="{'imported': props.row.submission}">
          <q-td key="created" :props="props">{{ props.row.created | formatDate }}</q-td>
          <q-td key="external_id" :props="props"><a target="_blank" :href="props.row.url">{{ props.row.external_id }}</a></q-td>
          <q-td key="url" :props="props"><a target="_blank" :href="props.row.url">{{ props.row.url }}</a></q-td>
          <q-td key="submissions" :props="props">
            <span v-for="(s, key) in props.row.submissions" :key="s.id">
              <router-link :to="{ name: 'submission', params: { id: s.id }}"><span v-if="s.internal_id">{{s.internal_id}}</span><span v-else class="red">{{s.id}}</span></router-link>
              <span v-if="key+1 != props.row.submissions.length">, </span>
            </span>
          </q-td>
          <q-td key="actions" :props="props"><q-btn :to="{name: 'create_submission', query: {import: props.row.api_url}}" label="import"/></q-td>
        </q-tr>
      </template>
    </q-table>
  </q-page>
</template>

<script>
// import axios from 'axios'
// import _ from 'lodash'

export default {
  name: 'ImportsPage',
  data () {
    return {
      filter: '',
      showImported: false,
      loading: false,
      serverPagination: {
        page: 1,
        rowsNumber: 0, // specifying this determines pagination is server-side
        rowsPerPage: 10,
        descending: true,
        sortBy: 'created'
      },
      serverData: [],
      columns: [
        { name: 'created', label: 'Created', field: 'created', sortable: true },
        // { name: 'id', label: 'System ID', field: 'id', sortable: true },
        { name: 'external_id', label: 'External submission', field: 'external_id' },
        { name: 'url', label: 'URL', field: 'url' },
        { name: 'submissions', label: 'Submissions', field: 'submissions', sortable: false },
        { name: 'actions', label: 'Actions', field: 'actions' }
      ],
      visibleColumns: ['created', 'external_id', 'submissions', 'actions']
    }
  },
  methods: {
    request ({ pagination, filter }) {
      // we set QTable to "loading" state
      this.loading = true

      // we do the server data fetch, based on pagination and filter received
      // (using Axios here, but can be anything; parameters vary based on backend implementation)
      console.log(pagination, filter)
      let sortBy = pagination.sortBy
      if (pagination.descending) {
        sortBy = '-' + sortBy
      }
      const search = this.filter !== '' ? `&search=${this.filter}` : ''
      const imported = this.showImported ? '' : '&submissions__id__isnull=True'
      const pageSize = pagination.rowsPerPage ? pagination.rowsPerPage : 1000000 // HACKY
      // var type = this.$route.query.type ? `&type__name__icontains=${this.$route.query.type}` : ''
      this.$axios
        .get(`/api/imports/?ordering=${sortBy}&page=${pagination.page}&page_size=${pageSize}${search}${imported}`)// ${pagination.descending}&filter=${filter}
        .then(({ data }) => {
          console.log('data', data)
          // updating pagination to reflect in the UI
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
    console.log(this.$route.query.search)
    if (this.$route.query.search) {
      this.filter = this.$route.query.search
    }
    this.refresh()
  }
}
</script>
<style>
tr.cancelled td, tr.cancelled td a {
  color: red;
}
tr.imported td, tr.imported td a {
  color: green;
}
.red {
  color: red;
}
/*
.q-table-middle.scroll, .scroll {
  overflow: inherit !important;
}
*/

</style>
