<template>
  <q-page class="docs-input justify-center">
    <saveSearch v-model="saveSearch" :namespace="this.filterNamespace" :filters="filters" :advanced-filters="advancedFilters"/>
    <loadSearch v-model="openLoadSearch" :namespace="this.filterNamespace" @loadSearch="loadSettings"/>
    <!-- advancedFilters: {{ advancedFilters }} -->
    <!-- defaultFilters: {{ defaultFilters.advancedFilters }} -->
    <q-table
      ref="table"
      :data="serverData"
      :columns="allColumns"
      :visible-columns="filters.visibleColumns"
      :filter="filters.filter"
      row-key="id"
      :pagination.sync="filters.serverPagination"
      :loading="loading"
      @request="request"
      binary-state-sort
      :rows-per-page-options="[10,25,50]"
    >
      <template slot="top">
        <div class="row full-width">
          <div class="col-3">
            <q-select
              v-model="filters.visibleColumns"
              multiple
              outlined
              dense
              options-dense
              :display-value="$q.lang.table.columns"
              emit-value
              map-options
              :options="allColumns"
              option-value="name"
              options-cover
              style="min-width: 150px"
            >
            <template v-slot:after>
              <q-checkbox v-model="showCustomColumns" label="Custom Columns" dense style="font-size: 14px;" v-if="lab">
                <q-tooltip>Allow selecting custom fields for display</q-tooltip>
              </q-checkbox>
            </template>
            </q-select>
            <q-checkbox v-model="filters.showCancelled" label="Show cancelled" @input="refresh"/>
            <q-checkbox v-model="filters.showCompleted" label="Show completed" @input="refresh"><q-tooltip>Include submissions with a status of "completed"</q-tooltip></q-checkbox>
            <q-checkbox v-if="this.lab" v-model="filters.participating" label="Participating" @input="refresh"><q-tooltip>Only show submissions in which I am a participant</q-tooltip></q-checkbox>
            <q-checkbox v-if="this.lab" v-model="filters.mySubmissions" label="My submissions" @input="refresh"><q-tooltip>Only show submissions for which I am a submitter or PI</q-tooltip></q-checkbox>
          </div>
          <div class="col-6 q-table__title text-center"><span v-if="lab && $store.getters.lab">{{$store.getters.lab.name}} Submissions <selectLabModal page="submissions"/></span><span v-else>My Submissions</span></div>
        <!-- <q-search hide-underline v-model="filters.filter" :props="props"/> -->
        <div class="col-3">
          <q-input
            v-model="filters.filter"
            debounce="1500"
            placeholder="Search"
            rounded
            outlined
            dense
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-btn round dense flat icon="settings">
                <q-menu>
                  <q-list separator class="scroll" style="min-width: 100px">
                    <!-- <q-item
                      v-close-popup
                      clickable
                      @click.native="saveSettings"
                    >
                      <q-item-section>Save search settings</q-item-section>
                    </q-item> -->
                    <q-item
                      v-close-popup
                      clickable
                      @click="loadDefaults()"
                    >
                      <q-item-section>Reset search criteria</q-item-section>
                    </q-item>
                    <q-item
                      v-close-popup
                      clickable
                      @click="saveSearch=true"
                    >
                      <q-item-section>Save current search</q-item-section>
                    </q-item>
                    <q-item
                      v-close-popup
                      clickable
                      @click="openLoadSearch=true"
                    >
                      <q-item-section>Load saved search</q-item-section>
                    </q-item>
                  </q-list>
                </q-menu>
              </q-btn>
            </template>
          </q-input>
          <!-- <q-btn size="sm" label="Save Search Settings" @click="saveSettings"/> -->

        </div>
        </div>
        <!-- {{ advancedParams }} -->
        <q-btn label="Advanced filters" color="primary" v-if="!advanced" @click="advanced=true"/>
        <advancedFilters ref="advancedFilters" :lab="lab" @update="updateAdvancedFilters" :params="advancedFilters" v-show="advanced"/>
      </template>
      <template slot="body" slot-scope="props">
        <q-tr :props="props" v-bind:class="{'cancelled': props.row.cancelled, 'completed': props.row.status && props.row.status.toUpperCase() === 'COMPLETED'}">
          <q-td key="locked" :props="props"><q-icon size="18px" name="cancel" v-if="props.row.cancelled" color="red" title="Submission cancelled"/><q-icon size="18px" name="warning" v-if="hasWarnings(props.row)" color="warning" title="There are warnings associated with this submission"/><q-icon size="18px" name="lock" v-if="props.row.locked" color="red"/><q-icon size="18px" name="lock_open" v-else color="green"/></q-td>
          <q-td key="id" :props="props"><router-link :to="{ name: 'submission', params: { id: props.row.id }}">{{ props.row.id }}</router-link></q-td>
          <q-td key="internal_id" :props="props"><router-link :to="{ name: 'submission', params: { id: props.row.id }}"><span v-if="props.row.internal_id">{{props.row.internal_id}}</span><span v-else>None Assigned</span></router-link></q-td>
          <q-td key="import_internal_id" :props="props">{{ props.row.import_internal_id }}</q-td>
          <q-td key="lab" :props="props">{{ props.row.lab.name }}</q-td>
          <q-td key="type" :props="props"><router-link v-if="lab" :to="{'name': 'submission_type', 'params': { id: props.row.type.id }}">{{ props.row.type.name }}</router-link><span v-else>{{ props.row.type.name }}</span></q-td>
          <q-td key="status" :props="props">{{ props.row.status }}</q-td>
          <q-td key="participant_names" :props="props">{{ props.row.participant_names.join(', ') }}</q-td>
          <q-td key="submitted" :props="props">{{ props.row.submitted | formatDate }}</q-td>
          <q-td key="name" :props="props">{{ props.row.first_name }} {{ props.row.last_name }}</q-td>
          <q-td key="email" :props="props">{{ props.row.email }}</q-td>
          <q-td key="pi_name" :props="props">{{ props.row.pi_first_name }} {{ props.row.pi_last_name }}</q-td>
          <q-td key="pi_email" :props="props">{{ props.row.pi_email }}</q-td>
          <q-td key="table_count" :props="props"><span v-for="(count, v, index) in props.row.table_count" :key="v">{{count}} {{v}}<span v-if="index != Object.keys(props.row.table_count).length - 1">, </span></span></q-td>
          <q-td key="samples_received" :props="props"><q-icon size="18px" name="check_circle" v-if="props.row.samples_received" color="green"><q-tooltip>Received on {{props.row.samples_received|formatDate}} by {{props.row.received_by_name}}</q-tooltip></q-icon></q-td>
          <q-td :key="'submission_data.'+v" v-for="v in labVariables" :props="props">
            <span v-if="Array.isArray(props.row.submission_data[v])">
              <a class="open-table" @click="openTable(`${props.row.id}_table_${v}`)">{{ props.row.submission_data[v].length }} <q-icon name="fas fa-table" /></a>
              <Agschema
                  v-model="props.row.submission_data[v]"
                  :schema="props.row.submission_schema.properties[v].schema"
                  :editable="false"
                  :allow-examples="false"
                  :allow-force-save="false"
                  :ref="`${props.row.id}_table_${v}`"
                  />
            </span>
            <span v-else :class="getValueClass(props.row.submission_data[v])">{{ props.row.submission_data[v] }}</span>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-btn-dropdown color="primary" label="Export as">
      <q-tooltip class="bg-accent">Export the current search results in one of the supported formats.  For complete submission data, including data from custom tables, use JSON.</q-tooltip>
      <q-list>
        <q-item clickable v-close-popup @click="exportSubmissions('xlsx')">
          <q-item-section>
            <q-item-label>XLSX</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="exportSubmissions('tsv')">
          <q-item-section>
            <q-item-label>TSV</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="exportSubmissions('csv')">
          <q-item-section>
            <q-item-label>CSV</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="exportSubmissions('json')">
          <q-item-section>
            <q-item-label>JSON</q-item-label>
          </q-item-section>
        </q-item>
        <q-item clickable v-close-popup @click="exportSubmissions('workbook')">
          <q-item-section>
            <q-item-label>XLSX (w/ tables)</q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </q-btn-dropdown>
    <reportsModal ref="reports"/>
    <q-btn v-if="$perms.hasLabPerm('MEMBER') || $perms.hasLabPerm('ADMIN')" label="Create Report" @click="createReport"/>
  </q-page>
</template>

<script>
// import axios from 'axios'
import _ from 'lodash'
import selectLabModal from '../components/modals/selectLabModal.vue'
import advancedFilters from '../components/search/advancedFilters.vue'
import saveSearch from '../components/search/saveSearch.vue'
import loadSearch from '../components/search/loadSearch.vue'
import reportsModal from '../components/modals/reportsModal.vue'
export default {
  name: 'submissions',
  props: ['lab'],
  components: {
    reportsModal,
    selectLabModal,
    advancedFilters,
    saveSearch,
    loadSearch,
    Agschema: () => import('../components/agschema.vue')
  },
  data () {
    var defaultFilters = this.getDefaultFilters()
    return {
      // defaultFilters: _.cloneDeep(defaultFilters),
      filters: defaultFilters.filters,
      advanced: false,
      advancedFilters: defaultFilters.advancedFilters,
      loading: false,
      serverData: [],
      columns: [
        { name: 'locked', label: 'Locked', field: 'locked', sortable: true },
        { name: 'id', label: 'System ID', field: 'id', sortable: true },
        { name: 'internal_id', label: 'ID', field: 'internal_id', sortable: true },
        { name: 'import_internal_id', label: 'Imported ID', field: 'import_internal_id', sortable: true },
        { name: 'lab', label: 'Core', field: 'lab' },
        { name: 'type', label: 'Type', field: 'type' },
        { name: 'status', label: 'Status', field: 'status', sortable: true },
        { name: 'participant_names', label: 'Participants', field: 'participant_names', sortable: false },
        { name: 'submitted', label: 'Submitted', field: 'submitted', sortable: true },
        { name: 'name', label: 'Name', field: 'name' },
        { name: 'email', label: 'Email', field: 'email', sortable: true },
        { name: 'pi_name', label: 'PI', field: 'pi_name' },
        { name: 'pi_email', label: 'PI Email', field: 'pi_email', sortable: true },
        { name: 'table_count', label: 'Table rows', field: 'table_count' },
        { name: 'samples_received', label: 'Received', field: 'samples_received', sortable: false }
      ],
      // customColumns: [],
      showCustomColumns: false,
      saveSearch: false,
      openLoadSearch: false
    }
  },
  methods: {
    getSearchQuery ({ pagination, filter}) {
      console.log(pagination, filter)
      var sortBy = pagination.sortBy
      if (pagination.descending) {
        sortBy = '-' + sortBy
      }
      // var type = this.$route.query.type ? `&type__name__icontains=${this.$route.query.type}` : ''
      var qs = this.$refs['advancedFilters'] ? this.$refs['advancedFilters'].qs : ''
      var lab = this.$store.getters.labId && this.lab ? '&lab=' + this.$store.getters.labId : ''
      var search = this.filters.filter !== '' ? `&search=${this.filters.filter}` : ''
      var cancelled = !this.filters.showCancelled ? '&cancelled__isnull=true' : ''
      var completed = !this.filters.showCompleted ? '&exclude_status=completed' : ''
      var participating = this.filters.participating && this.lab ? '&participating' : ''
      var mySubmissions = this.filters.mySubmissions || !this.lab ? '&my_submissions' : ''
      var pageSize = pagination.rowsPerPage ? pagination.rowsPerPage : 1000000 // HACKY
      return `ordering=${sortBy}&page=${pagination.page}&page_size=${pageSize}${lab}${search}${cancelled}${completed}${participating}${mySubmissions}${qs}`
    },
    exportSubmissions (format) {
      var pagination = _.clone(this.filters.serverPagination)
      pagination.rowsPerPage = 10000
      var qs = this.getSearchQuery({
        pagination: pagination,
        filter: this.filters.filter
      })
      if (format === 'json') {
        window.open(`/server/api/submissions/?${qs}&format=json`)
      } else {
        window.open(`/server/api/submissions/export/?${qs}&export_format=${format}`)
      }
    },
    createReport (format) {
      var pagination = _.clone(this.filters.serverPagination)
      pagination.rowsPerPage = 10000
      var qs = this.getSearchQuery({
        pagination: pagination,
        filter: this.filters.filter
      })
      console.log('createReport', this.$refs, qs)
      this.$refs.reports.open(qs)
    },
    request ({ pagination, filter }) {
      // console.log('request', qs, )
      // we set QTable to "loading" state
      this.loading = true
      // we do the server data fetch, based on pagination and filter received
      // (using Axios here, but can be anything; parameters vary based on backend implementation)
      var qs = this.getSearchQuery({ pagination, filter})
      this.$axios
        .get(`/api/submissions/?${qs}`)// ${pagination.descending}&filter=${filter}
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
          this.$q.notify({message: 'There was an error retrieving submissions.  Please ensure your search terms are valid.', type: 'negative'})
        })
    },
    updateAdvancedFilters (params) {
      this.advancedFilters = _.cloneDeep(params)
      this.refresh()
    },
    refresh () {
      this.request({
        pagination: this.filters.serverPagination,
        filter: this.filters.filter
      })
    },
    hasWarnings (submission) {
      return submission.warnings && _.size(submission.warnings) > 0
    },
    saveSettings () {
      const settings = { filters: this.filters, advancedFilters: this.advancedFilters }
      this.$store.dispatch('updateSettings', {path: this.filterNamespace, value: settings, axios: this.$axios, self: this})
    },
    loadSettings (settings) {
      // const settings = this.$store.getters.getUserSettings[this.filterNamespace]
      // this.filters = _.assign(this.defaultFilters, _.clone(settings.filters))
      this.$set(this, 'filters', _.assign(this.getDefaultFilters().filters, _.clone(settings.filters)))
      // this.$set(this, 'filters', _.cloneDeep(settings.filters))
      if (settings.advancedFilters) {
        // this.advancedFilters = _.cloneDeep(settings.advancedFilters)
        this.$refs['advancedFilters'].update(_.assign({}, _.cloneDeep(settings.advancedFilters)))
        this.advanced = true
        // this.$refs['advancedFilters'].update()
      }
      if (settings.name) {
        this.$q.notify({message: `Loaded saved search settings '${settings.name}'.`, type: 'positive'})
      }
      // this.filters = this.$store.getters.getUserSettings[filterNamespace] ? _.assign(defaultFilters, _.clone(this.$store.getters.getUserSettings[filterNamespace].filters)) : defaultFilters.filters
    },
    loadDefaults (useUserDefault) {
      this.advanced = false
      const settings = useUserDefault && this.settings && this.settings.default ? this.settings.default : this.getDefaultFilters()
      // if (settings.advancedFilters && settings.advancedFilters.filters && settings.advancedFilters.length || settings.advancedFilters)
      this.loadSettings(settings)
    },

    openTable (v) {
      // console.log('refs', this.$refs, v, this.$refs[v])
      this.$refs[v][0].openSamplesheet()
    },
    getValueClass (v) {
      if (['Yes', 'yes', 'true', 'True', true].indexOf(v) !== -1) {
        return 'text-positive'
      } else if (['No', 'no', 'false', 'False', true].indexOf(v) !== -1) {
        return 'text-negative'
      }
    },
    getDefaultFilters () {
      return {
        filters: {
          filter: '',
          showCancelled: false,
          showCompleted: false,
          participating: false,
          mySubmissions: !this.lab,
          serverPagination: {
            page: 1,
            rowsNumber: 0, // specifying this determines pagination is server-side
            rowsPerPage: 10,
            descending: true,
            sortBy: 'submitted'
          },
          visibleColumns: ['locked', 'internal_id', 'lab', 'type', 'status', 'submitted', 'name', 'email', 'pi_name', 'table_count', 'samples_received']
        },
        advancedFilters: {}
      }
    }
  },
  mounted () {
    // once mounted, we need to trigger the initial server data fetch
    console.log(this.$route.query.search)
    if (this.$route.query.search) {
      this.filters.filter = this.$route.query.search
    }
    // if (this.lab) {
    //   this.filters.visibleColumns.splice(this.defaultFilters.visibleColumns.indexOf('lab'), 1) //Causes mutation error.  Idea was to keep lab column from showing up unnecessarily
    // }
    this.loadDefaults(true)
    // this.refresh()
  },
  computed: {
    allColumns () {
      return this.showCustomColumns ? this.columns.concat(this.customColumns) : this.columns
    },
    customColumns () {
      return !this.lab || !this.$store.getters.lab ? [] : this.$store.getters.lab.submission_variables.order.map(v => { return { name: 'submission_data.' + v, label: v, field: 'submission_data.' + v, sortable: false } })
      // return this.$store.getters.lab && this.$store.getters.lab.submission_variables ? this.$store.getters.lab.submission_variables.order.map(v => { return { name: 'submission_data.' + v, label: v, field: 'submission_data.' + v, sortable: false } }) : []
    },
    labVariables () {
      return !this.lab || !this.$store.getters.lab || !this.$store.getters.lab.submission_variables ? [] : this.$store.getters.lab.submission_variables.order
    },
    filterNamespace () {
      return this.lab ? this.$store.getters.labId + '_filters' : 'my_submission_filters'
    },
    settings () {
      return this.$store.getters.getUserSettings.searches ? this.$store.getters.getUserSettings.searches[this.filterNamespace] : {}
    }
  }
}
</script>
<style>
tr.cancelled td, tr.cancelled td a {
  color: red;
}
tr.completed td, tr.completed td a {
  color: green;
}
/*
.q-table-middle.scroll, .scroll {
  overflow: inherit !important;
}
*/
.open-table {
  cursor: pointer;
  color: blue;
}
</style>
