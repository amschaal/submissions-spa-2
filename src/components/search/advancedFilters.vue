<template>
    <div>
        Advanced Filters: {{ $store.getters.labId }}
        <q-select v-model="type" :options="lab_filters" option-value="id" option-label="name" label="Submission Type" />
        <!-- {{ type_filters }} -->
        <q-select v-if="type" v-model="variable" :options="variable_options" option-value="variable" option-label="variable" label="Choose Field" @input="addVariable"/>
        <!-- {{ variable_options }} -->
        <div v-if="variables">
            <div v-for="v in variables" :key="v.variable" class="row">
                <span>{{ v.variable }}: {{ v.title }}</span>
                <q-select v-model="v.filter" :options="v.filters" option-value="filter" option-label="label" class="col" label="Filter"/>
                <q-input v-model="v.value" label="value" class="col"/>
            </div>
            <q-btn color="primary" label="Update" @click="update"/>
        </div>
        {{ qs }}
    </div>
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
      console.log('type', this.type)
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
</style>
