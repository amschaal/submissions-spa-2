<template>
  <span>
    <q-dialog
      v-model="opened"
    >
      <q-card style="width:80vw; max-width: 90vw;">
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
                <q-btn class="btn btn-primary" label="View" />
                <q-btn-dropdown color="primary" label="Download">
                  <q-tooltip class="bg-accent">Export the current report in one of the supported formats.</q-tooltip>
                  <q-list>
                    <q-item clickable v-close-popup @click="download(props.row.id, 'xlsx')">
                      <q-item-section>
                        <q-item-label>XLSX</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="download(props.row.id, 'tsv')">
                      <q-item-section>
                        <q-item-label>TSV</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="download(props.row.id, 'csv')">
                      <q-item-section>
                        <q-item-label>CSV</q-item-label>
                      </q-item-section>
                    </q-item>
                    <q-item clickable v-close-popup @click="download(props.row.id, 'json')">
                      <q-item-section>
                        <q-item-label>JSON</q-item-label>
                      </q-item-section>
                    </q-item>
                  </q-list>
                </q-btn-dropdown>
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
    },
    download (id, format) {
      if (format === 'json') {
        window.open(`/server/api/submissions/report/?${this.qs}&report_id=${id}&format=${format}`)
      } else {
        window.open(`/server/api/submissions/report/?${this.qs}&report_id=${id}&export_format=${format}`)
      }
    }
  }
}
</script>
