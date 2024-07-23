<template>
  <span>
    <q-dialog
      v-model="opened"
    >
      <q-card style="width:80vw; max-width: 90vw;">
        <q-card-section>
          <div class="text-h6" v-if="report">Report "{{ report.name }}""</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- {{ report }} -->
          <q-table
            :data="report.data"
            :columns="columns"
            :filter="filter"
            binary-state-sort
            :rows-per-page-options="[10,25,0]"
            v-if="report"
          >
            <template v-slot:top-right>
              <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
          </q-table>
          <h3 v-else>
            Loading report...
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
      report: null,
      filter: null,
      pagination: {
        sortBy: 'name',
        descending: true,
        rowsPerPage: 10
      }
    }
  },
  mounted () {
  },
  methods: {
    open (qs, reportId, period) {
      this.qs = qs
      this.opened = true
      this.report = null
      this.$axios.get(`/api/submissions/report/?${qs}&report_id=${reportId}&export_format=json&period=${period}`).then(response => {
        this.report = response.data
      })
    },
    cancel () {
      this.opened = false
    }
  },
  computed: {
    columns () {
      if (!this.report || !this.report.headers) {
        return null
      } else {
        const columns = []
        for (var c in this.report.headers) {
          const label = this.report.headers[c]
          columns.push({ name: c, label: label, field: c, sortable: true})
        }
        return columns
      }
    }
  }
}
</script>
