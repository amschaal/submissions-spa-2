<template>
  <div class="q-pa-md">
    <q-table
      title="Saved Searches"
      :data="searches"
      :columns="columns"
      row-key="name"
      :filter="filter"
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
export default {
  props: ['namespace'],
  data () {
    return {
      filter: null,
      columns: [
        { name: 'name', align: 'center', label: 'Name', field: 'name', sortable: true },
        { name: 'description', align: 'center', label: 'Description', field: 'description', sortable: false },
        { name: 'action', align: 'center', label: 'Action', field: 'name', sortable: false }
      ],
      data: []
    }
  },
  computed: {
    searches () {
      const settings = this.$store.getters.getUserSettings[this.namespace]
      return _.values(settings)
    }
  }
}
</script>
