<template>
    <div>
        Advanced Filters: {{ $store.getters.labId }}
        <q-select v-model="type" :options="filters" option-value="id" option-label="name" label="Submission Type" />
        {{ type_filters }}
    </div>
</template>

<script>
// import { QSelect } from 'quasar'
// import _ from 'lodash'

export default {
  props: [],
  data () {
    return {
      filters: [],
      filterMap: {},
      type: null
    }
  },
  mounted () {
    this.$axios
      .get(`/api/labs/${this.$store.getters.labId}/filters/`)
      .then(({ data }) => {
        this.filters = data
        this.filters.forEach(f => (this.filterMap[f.id] = f))
      })
      .catch(error => {
        console.log(error)
      })
  },
  methods: {
    update () {
    }
  },
  computed: {
    type_filters () {
      return this.type ? this.filterMap[this.type.id] : []
    }
  }
}
</script>
<style>
</style>
