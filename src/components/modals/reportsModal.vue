<template>
  <span>
    <reportModal ref="report"/>
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
          {{ selected_report }}
          <q-table
            :data="reports"
            :columns="columns"
            :filter="filter"
            row-key="id"
            binary-state-sort
            :rows-per-page-options="[10,25,0]"
            selection="single"
            :selected.sync="selected"
            v-if="reports"
          >
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
            <!-- <template v-slot:body-cell-action="props">
              <q-td :props="props">
              </q-td>
            </template> -->
          </q-table>
          <h3 v-else>
            Loading reports...
          </h3>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
            <q-select style="min-width: 200px;" outlined dense :options="selected_report.periods" v-if="selected_report && selected_report.periods" label="Choose Period" v-model="period"/>
            <q-btn class="btn btn-primary" label="View" @click="view(selected_report.id)" v-if="selected_report && (period || !selected_report.periods)"/>
            <q-btn-dropdown color="primary" label="Download" v-if="selected_report && (period || !selected_report.periods)">
              <q-tooltip class="bg-accent">Export the current report in one of the supported formats.</q-tooltip>
              <q-list>
                <q-item clickable v-close-popup @click="download(selected_report.id, 'xlsx')">
                  <q-item-section>
                    <q-item-label>XLSX</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="download(selected_report.id, 'tsv')">
                  <q-item-section>
                    <q-item-label>TSV</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="download(selected_report.id, 'csv')">
                  <q-item-section>
                    <q-item-label>CSV</q-item-label>
                  </q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="download(selected_report.id, 'json')">
                  <q-item-section>
                    <q-item-label>JSON</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </q-btn-dropdown>
         <q-btn flat label="Cancel" @click="cancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </span>
</template>
<script>
import reportModal from './reportModal.vue'
export default {
  components: {
    reportModal
  },
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
      },
      selected: [],
      period: null
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
    view (reportId) {
      const period = this.selected_report.periods && this.period ? this.period : null
      this.$refs.report.open(this.qs, reportId, period)
    },
    cancel () {
      this.opened = false
    },
    download (id, format) {
      const period = this.selected_report.periods && this.period ? this.period : null
      if (format === 'json') {
        window.open(`/server/api/submissions/report/?${this.qs}&report_id=${id}&export_format=${format}&period=${period}`)
      } else {
        window.open(`/server/api/submissions/report/?${this.qs}&report_id=${id}&export_format=${format}&period=${period}`)
      }
    }
  },
  computed: {
    selected_report () {
      return this.selected.length === 1 ? this.selected[0] : null
    }
  }
}
</script>
