<template>
    <fieldset class="advanced-filters">
        <legend>Advanced Filters</legend>
        <q-select v-model="type" :options="lab_filters" option-value="id" option-label="name" label="Submission Type" outlined @input="clearVariables"/>
        <!-- {{ type_filters }} -->
        <span class="col filter"><q-select v-if="type" v-model="variable" :options="variable_options" option-value="variable" option-label="variable" label="Choose Field" @input="addVariable" outlined/></span>
        <!-- {{ variable_options }} -->
        <div v-if="variables">
            <div v-for="v in variables" :key="v.variable" class="row">
                <q-field label="Field" stack-label outlined>
                    <template v-slot:control>
                        <div class="self-center full-width no-outline">{{ v.variable }}: {{ v.title }}</div>
                    </template>
                </q-field>
                <q-select ref="filters" v-model="v.filter" :options="v.filters" option-value="filter" option-label="label" class="self-center self-stretch filter validate" label="Filter" outlined :rules="[ val => !!val || 'Please select a filter' ]"/>
                <q-input ref="filters" v-model="v.value" label="value" class="col" outlined :rules="[ val => !!val || 'Please enter a value' ]"/>
                <q-btn color="red" size="" icon="delete" @click="removeVariable(v)"/>
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
      qs: ''
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
      if (this.$refs.filters.map(c => c.validate()).indexOf(false) !== -1) {
        return
      }
      this.qs = this.type && this.type.id === 'ALL' ? '' : '&type=' + this.type.id
      console.log(this.variables)
      this.variables.forEach(v => (this.qs += '&' + v.filter.filter + '=' + v.value))
      console.log('qs', this.qs)
      this.$emit('update', this.qs)
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
</style>
