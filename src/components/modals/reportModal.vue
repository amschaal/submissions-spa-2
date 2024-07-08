<template>
  <span>
    <q-dialog
      v-model="opened"
    >
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Reports</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- qs: {{ qs }}
          {{ reports }} -->
          <q-table
            :data="reports"
            :columns="columns"
            :filter="filter"
            row-key="id"
            binary-state-sort
            :rows-per-page-options="[10,25,0]"
            v-if="reports"
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
                <q-btn flat label="Export" /> <q-btn color="primary" flat label="View" />
              </q-td>
            </template>
          </q-table>
          <h3 v-else>
            Loading reports...
          </h3>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
         <q-btn flat label="Cancel" @click="cancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </span>
</template>
<script>
export default {
  props: {
  },
  data () {
    return {
      qs: '',
      opened: false,
      reports: null,
      filter: null,
      columns: [
        { name: 'name', align: 'center', label: 'Name', field: 'name', sortable: true },
        { name: 'description', align: 'center', label: 'Description', field: 'description', sortable: false },
        { name: 'action', align: 'center', label: 'Action', field: 'name', sortable: false }
      ],
      pagination: {
        sortBy: 'name',
        descending: true,
        rowsPerPage: 10
      }
    }
  },
  mounted () {
    this.$axios.get('/api/submissions/reports/').then(response => {
      this.reports = response.data
    })
  },
  methods: {
    open (qs) {
      this.qs = qs
      this.opened = true
    },
    cancel () {
      this.opened = false
    }
  }
}
</script>
