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
        <q-select dense v-model="type" :options="lab_filters" option-value="id" option-label="name" label="Submission Type" outlined @input="clearVariables">
            <template v-slot:after>
                <q-icon name="help" color="primary">
                    <q-tooltip content-class="tooltip">
                        Select a submission type to show only submissions of that type.  Once chosen, you may add additional filters specific to that submission type.
                    </q-tooltip>
                </q-icon>
            </template>
        </q-select>
        <!-- {{ type_filters }} -->
        <span class="col filter">
            <q-select dense v-if="type" v-model="variable" @filter="filterFn" use-input input-debounce="0" :options="filteredVariables" option-value="variable" :option-label="opt => `${opt.variable}: ${opt.title}`" label="Add custom field filter" @input="addVariable" borderless style="width: 250px" behavior="dialog">
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
        </span>
        <!-- {{ variable_options }} -->
        <div v-if="variables">
            <div v-for="v in variables" :key="v.variable" class="row">
                <q-field dense label="Field" stack-label outlined>
                    <template v-slot:control>
                        <div class="self-center full-width no-outline">{{ v.variable }}: {{ v.title }}</div>
                    </template>
                </q-field>
                <q-select dense ref="filters" v-model="v.filter" :options="v.filters" option-value="filter" option-label="label" class="self-center self-stretch filter validate" label="Filter" outlined :rules="[ val => !!val || 'Please select a filter' ]"/>
                <q-input dense ref="filters" v-model="v.value" label="value" class="col" outlined :rules="[ val => !!val || 'Please enter a value' ]">
                    <template v-slot:after>
                        <q-btn color="red" size="sm" icon="delete" @click="removeVariable(v)" round>
                            <q-tooltip content-class="tooltip">Remove filter.  You must click update for changes to take effect.</q-tooltip>
                        </q-btn>
                    </template>
                </q-input>
            </div>
            <div>
                <q-btn color="primary" label="Update" @click="update"/>
            </div>
        </div>
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
      lab_filters: [],
      variable: null,
      filterMap: {},
      type: null,
      qs: '',
      filteredVariables: []
    }
  },
  mounted () {
    this.$axios
      .get(`/api/labs/${this.$store.getters.labId}/filters/`)
      .then(({ data }) => {
        this.lab_filters = data
        this.lab_filters.forEach(f => (this.filterMap[f.id] = f))
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
      this.qs = this.type && this.type.id === 'ALL' ? '' : '&type=' + this.type.id
      console.log(this.variables)
      this.variables.forEach(v => (this.qs += '&' + v.filter.filter + '=' + v.value))
      console.log('qs', this.qs)
      this.$emit('update')
    },
    addVariable () {
      var variable = _.cloneDeep(this.variable)
      variable.filter = null
      this.variables.push(variable)
      this.variable = null
    },
    removeVariable (v) {
      this.variables.splice(this.variables.indexOf(v), 1)
    },
    clearVariables () {
      this.variables = []
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
      return Object.values(this.type_filters)
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
</style>
