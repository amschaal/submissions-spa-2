<template>
    <fieldset class="advanced-filters">
        <legend>
            Advanced Filters
            <q-icon name="help" color="primary">
                <q-tooltip content-class="tooltip">
                    <p>When using advanced filters, it is necessary to click on update each time filters are changed in order to update the search.</p>
                </q-tooltip>
            </q-icon>
        </legend>
        <q-select dense v-model="type" :options="lab_filters.custom" option-value="id" option-label="name" label="Submission Type" outlined @input="clearVariables">
            <template v-slot:after>
                <q-icon name="help" color="primary">
                    <q-tooltip content-class="tooltip">
                        <p>Select a submission type to show only submissions of that type.  Once chosen, you may add additional filters specific to that submission type.</p>
                        <p>In addition to the generally available filters, you may search using any custom fields that are defined for the selected submission type.  After selecting any fields to filter on, choose the type of filter, and a value to search on.</p>
                        <p>If "ALL" is chosen for the submission type, a list of custom submission variables configured in the lab's settings page will be provided to search on.  Please note that these fields are not guaranteed to exist across submission types, and is dependent on how consistent the lab was with custom variable/field names across types.</p>
                        <p>Please be aware that while some variables may have flexible search filters (like case insensitive containment, etc), variables that are used in tables can only be searched on using an exact match.</p>
                    </q-tooltip>
                </q-icon>
            </template>
        </q-select>
        <!-- {{ type_filters }} -->
        <!-- {{ filteredVariables }} -->
        <!-- <span class="col filter">
            <q-select dense v-model="variable" @filter="filterFn" use-input input-debounce="0" :options="filteredVariables" option-value="variable" :option-label="opt => opt.variable ? `${opt.variable}: ${opt.title}` : opt.title" label="Add custom field filter" @input="addVariable" borderless style="width: 250px" behavior="dialog">
                <template v-slot:after>
                    <q-icon name="help" color="primary">
                        <q-tooltip content-class="tooltip">
                            <p>You may search using any custom fields that are defined for the above submission type.  After selecting any fields to filter on, choose the type of filter, and a value to search on.</p>
                            <p>If "ALL" is chosen for the submission type, a list of custom submission variables configured in the lab's settings page will be provided to search on.  Please note that these fields are not guaranteed to exist across submission types, and is dependent on how consistent the lab was with custom variable/field names across types.</p>
                            <p>Please be aware that while some variables may have flexible search filters (like case insensitive containment, etc), variables that are used in tables can only be searched on using an exact match.</p>
                        </q-tooltip>
                    </q-icon>
                </template>
            </q-select>
        </span> -->
        <!-- {{ variable_options }} -->
        <div v-if="variables" class="filters">
            <div v-for="v in variables" :key="v.variable" class="row">
                <q-field dense label="Field" stack-label outlined class="col">
                    <template v-slot:control>
                        <div class="self-center full-width no-outline" v-if="v.variable">{{ v.variable }}: {{ v.title }}</div>
                        <div class="self-center full-width no-outline" v-else>{{ v.title }}</div>
                    </template>
                </q-field>
                <q-select dense ref="filters" v-model="v.filter" :options="v.filters" option-value="filter" option-label="label" class="self-center self-stretch filter validate col" label="Filter" outlined :rules="[ val => !!val || 'Please select a filter' ]"/>
                <q-select
                    v-if="v.enum"
                    outlined
                    v-model="v.value"
                    :options="v.enum"
                    label="Select Value"
                    class="col"
                    dense
                    emit-value
                    map-options
                    :rules="[ val => !!val || 'Please enter a value' ]"
                >
                    <template v-slot:after>
                        <q-btn color="red" size="sm" icon="delete" @click="removeVariable(v)" round class="remove-button">
                            <q-tooltip content-class="tooltip">Remove filter.  You must click update for changes to take effect.</q-tooltip>
                        </q-btn>
                    </template>
                </q-select>
                <q-input v-else-if="v.type=='date'" ref="filters" class="col" outlined dense v-model="v.value" :rules="[ val => !!val && /^(\d{4})-(\d{2})-(\d{2})$/.test(val) || 'Please enter a valid date of format YYYY-MM-DD' ]">
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer">
                      <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                        <q-date v-model="v.value" mask="YYYY-MM-DD">
                          <div class="row items-center justify-end">
                            <q-btn v-close-popup label="Close" color="primary" flat />
                          </div>
                        </q-date>
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                  <template v-slot:after>
                        <q-btn color="red" size="sm" icon="delete" @click="removeVariable(v)" round class="remove-button">
                            <q-tooltip content-class="tooltip">Remove filter.  You must click update for changes to take effect.</q-tooltip>
                        </q-btn>
                    </template>
                </q-input>
                <q-input v-else dense ref="filters" v-model="v.value" label="Value" class="col" outlined :rules="[ val => !!val || 'Please enter a value' ]">
                    <template v-slot:after>
                        <q-btn color="red" size="sm" icon="delete" @click="removeVariable(v)" round class="remove-button">
                            <q-tooltip content-class="tooltip">Remove filter.  You must click update for changes to take effect.</q-tooltip>
                        </q-btn>
                    </template>
                </q-input>
            </div>
        </div>
        <div>
          <q-btn label="Add filter" color="primary" @click="openSearchFilters" /> <q-btn color="primary" label="Update" @click="update"/>
        </div>
        <q-dialog v-model="search_filters">
          <q-card style="width: 900px; max-width: 100vw;">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">Add search filters</div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section>
              <p>
                <b v-if="type && type.id && this.filterMap[type.id].name">
                Showing search filters available for selected submission type "{{ this.filterMap[type.id].name }}"
              </b>
            </p>
              <!-- {{ sources }} -->
            <p>
              Only show filters from source:
              <q-checkbox v-for="source in sources" :key="source" v-model="filter_sources" :val="source" :label="source"/>
            </p>
            <p>
              <q-btn label="reset filters" @click="resetSearchFilters" color="primary" size="sm"/>
            </p>
              <!-- {{ filter_sources }} -->
              <q-table
                title="Filters"
                :data="variable_options"
                :columns="search_filter_columns"
                row-key="variable"
                :filter="search_filter"
                virtual-scroll
                style="height: 600px"
                :rows-per-page-options="[0]"
                :pagination.sync="pagination"
              >
              <template v-slot:top-right>
                <q-input borderless dense debounce="300" v-model="search_filter" placeholder="Search" ref="advanced-filter-search">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>
              <template v-slot:body-cell-title="props">
                <q-td :props="props">
                      <span v-if="props.row.variable">{{ props.row.variable }}: </span>
                      {{ props.row.title }}
                      <q-icon name="help" color="primary" v-if="props.row.description">
                          <q-tooltip content-class="tooltip">
                              <p>{{ props.row.description }}</p>
                          </q-tooltip>
                      </q-icon>
                </q-td>
              </template>
              <template v-slot:body-cell-filters="props">
                <q-td :props="props">
                    <q-badge v-for="f in props.value" :key="f.filter" color="grey" :label="f.label" />
                </q-td>
              </template>
              <template v-slot:body-cell-variable="props">
                <q-td :props="props">
                    <q-btn label="Add" size="sm" color="primary" @click="addVariable(props.row)"/>
                </q-td>
              </template>
              </q-table>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Done" color="primary" v-close-popup />
            </q-card-actions>
          </q-card>
      </q-dialog>
    </fieldset>
</template>

<script>
// import { QSelect } from 'quasar'
import _ from 'lodash'

export default {
  props: [],
  data () {
    return {
      variables: [],
      filters: [],
      lab_filters: {},
      variable: null,
      filterMap: {},
      sources: [],
      filter_sources: [],
      type: null,
      qs: '',
      filteredVariables: [],
      search_filters: false,
      search_filter_columns: [
        { name: 'source', label: 'Source', field: 'source', sortable: true},
        { name: 'title', label: 'Title', field: 'title', sortable: true},
        { name: 'filters', label: 'Filters', field: 'filters' },
        { name: 'variable', label: 'Action', field: 'variable' }
      ],
      search_filter: '',
      pagination: {
        rowsPerPage: 0
      }
    }
  },
  mounted () {
    this.$axios
      .get(`/api/labs/${this.$store.getters.labId}/filters/`)
      .then(({ data }) => {
        this.lab_filters = data
        this.sources = this.filter_sources = Object.keys(data)
        this.lab_filters.custom.forEach(t => {
          Object.keys(t.filters).forEach(k => {
            t.filters[k].source = 'custom'
          })
        })
        Object.keys(this.lab_filters).forEach(k => {
          if (k !== 'custom') {
            Object.keys(this.lab_filters[k]).forEach(v => {
              this.lab_filters[k][v].source = k
            })
          }
        })
        this.lab_filters.custom.forEach(f => (this.filterMap[f.id] = f))
        this.type = this.filterMap['ALL']
      })
      .catch(error => {
        console.log(error)
      })
  },
  methods: {
    update () {
      if (this.$refs.filters && this.$refs.filters.map(c => c.validate()).indexOf(false) !== -1) {
        return
      }
      this.qs = !this.type || (this.type && this.type.id === 'ALL') ? '' : '&type=' + this.type.id
      // console.log(this.variables)
      this.variables.forEach(v => (this.qs += '&' + v.filter.filter + '=' + v.value))
      // console.log('qs', this.qs)
      this.$emit('update')
    },
    addVariable (v) {
      // console.log(v)
      var variable = _.cloneDeep(v || this.variable)
      variable.filter = variable.filters.length === 1 ? variable.filters[0] : null
      this.variables.push(variable)
      this.variable = null
      this.$q.notify({ type: 'positive', message: 'Filter added.'})
    },
    removeVariable (v) {
      this.variables.splice(this.variables.indexOf(v), 1)
    },
    clearVariables () {
      this.variables = this.variables.filter(v => !v.variable)
    },
    openSearchFilters () {
      this.resetSearchFilters()
      this.search_filters = true
      console.log(this.$refs)
      setTimeout(() => this.$refs['advanced-filter-search'].focus(), 100)
    },
    resetSearchFilters () {
      this.search_filter = ''
      this.filter_sources = this.sources
    },
    filterFn (val, update) {
      if (val === '') {
        update(() => {
          this.filteredVariables = this.variable_options
          // with Quasar v1.7.4+
          // here you have access to "ref" which
          // is the Vue reference of the QSelect
        })
        return
      }

      update(() => {
        const needle = val.toLowerCase()
        this.filteredVariables = this.variable_options.filter(v => `${v.variable}: ${v.title}`.toLowerCase().indexOf(needle) > -1)
      })
    }
  },
  computed: {
    type_filters () {
      return this.type ? this.filterMap[this.type.id].filters : []
    },
    variable_options () {
      var filters = Object.values(this.type_filters)
      // .concat(Object.values(this.lab_filters.general || {}))
      Object.keys(this.lab_filters).forEach(k => {
        if (k !== 'custom') {
          filters = filters.concat(Object.values(this.lab_filters[k]))
        }
      })
      return filters.filter(f => this.filter_sources.indexOf(f.source) !== -1)
    }
  }
}
</script>
<style>
.filter {
    /* padding: 0px 10px; */
    min-width: 150px;
}
.filter span {
    width: 100%;
    text-align: center;
}
fieldset.advanced-filters {
    width: 100%;
}
.tooltip {
    font-size: 16px;
}
.filters {
  margin: 15px 0px 15px 0px;
}
.filters .row .col {
  height: 40px;
}
.filters .remove-button {
  width: 40px;
}
</style>
