<template>
    <div>
      <q-select
        filter
        v-model="value"
        :options="options"
        ref="select"
        @input="selected(value)"
      />
    </div>
</template>

<script>
import Vue from 'vue'
// import { filter } from 'quasar'
export default Vue.extend({
  data () {
    return {
      value: null,
      options: []
    }
  },
  methods: {
    selected (value) {
      this.params.stopEditing()
    },
    getOptions () {
      var self = this
      this.$axios
        .get(`${this.url}?page_size=1000`)
        .then(function (response) {
          console.log('response', response)
          self.options = response.data.results.map(
            o => ({value: o.name, label: o.name})
          )
        })
        // .catch(function (error, stuff) {
        // })
    },
    getValue () {
      return this.value
    }
  },
  computed: {
    url () {
      return `http://sims.ucdavis.edu:8000/api/adapters/${this.db}/`
    }
  },
  created () {
    console.log('adapter autocomplete params', this.params)
    if (this.params.widget_options.db_variable) {
      this.db_variable = this.params.widget_options.db_variable
      this.db = this.params.node.data[this.db_variable]
      if (!this.db) {
        this.$q.notify({message: `No adapter database has been selected.  Please make a selection for "${this.db_variable}"`, color: 'red'})
      }
    }
    this.getOptions()
  },
  mounted () {
    Vue.nextTick(() => {
      if (this.$refs.select) {
        console.log('select', this.$refs.select)
        this.$refs.select.show()
      }
    })
  }
})

</script>

<style scoped>
</style>
