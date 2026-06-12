<template>
  <div class="q-pa-md">
    <q-table
      title="Saved Searches"
      :rows="searches"
      :columns="columns"
      row-key="name"
      :filter="filter"
      :pagination="pagination"
    >
      <template v-slot:top-right>
        <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
          <template v-slot:append>
            <q-icon name="search" />
          </template>
        </q-input>
      </template>
      <template v-slot:body-cell-action="props">
        <q-td :props="props">
          <slot name="action" v-bind="{props}"></slot>
        </q-td>
      </template>
    </q-table>
  </div>
</template>
<script>
import _ from 'lodash'
import { date } from 'quasar'
export default {
  props: ['namespace'],
  data () {
    return {
      filter: null,
      columns: [
        { name: 'updated', align: 'center', label: 'Updated', field: 'updated', sortable: true, format: (val, row) => date.formatDate(val, 'MM/DD/YYYY hh:mma'), sortOrder: 'da', sort: (a, b) => a - b },
        { name: 'name', align: 'center', label: 'Name', field: 'name', sortable: true },
        { name: 'description', align: 'center', label: 'Description', field: 'description', sortable: false },
        { name: 'action', align: 'center', label: 'Action', field: 'name', sortable: false }
      ],
      pagination: {
        sortBy: 'updated',
        descending: true,
        rowsPerPage: 10
      },
      data: []
    }
  },
  computed: {
    searches () {
      const settings = this.$store.getters.getUserSettings.searches ? this.$store.getters.getUserSettings.searches[this.namespace] : {}
      return _.values(settings)
    }
  }
}
</script>
