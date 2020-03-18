<template>
    <div class="autocomplete">
      <q-input color="amber" v-model="value" placeholder="Featuring static data" ref="input">
        <q-autocomplete
          @search="search"
          :min-characters="2"
          @selected="selected"
        />
      </q-input>
    </div>
</template>

<script>
import Vue from 'vue'
export default Vue.extend({
  data () {
    return {
      value: null
    }
  },
  methods: {
    selected (item) {
      this.value = item.value
      // this.$q.notify(`Selected suggestion "${item.label}"`)
    },
    search (terms, done) {
      // var self = this
      this.$axios
        .get(`${this.url}?search=${terms}`)
        .then(function (response) {
          done(response.data.results.map(o => ({value: o.name, label: o.name})))
        })
        // .catch(function (error, stuff) {
        // })
    },
    getValue () {
      return this.value
    },
    setValue (value) {
      if (!value) return
      this.value = value
    }
  },
  computed: {
    url () {
      return `http://sims.ucdavis.edu:8000/api/adapters/${this.db}/`
    }
  },
  created () {
    this.value = this.params.value
    console.log('adapter autocomplete params', this.params)
    if (this.params.widget_options.db_variable) {
      this.db_variable = this.params.widget_options.db_variable
      this.db = this.params.node.data[this.db_variable]
      if (!this.db) {
        this.$q.notify({message: `No adapter database has been selected.  Please make a selection for "${this.db_variable}"`, color: 'red'})
      }
    }
  },
  mounted () {
    Vue.nextTick(() => {
      if (this.$refs.input) {
        this.$refs.input.focus()
      }
    })
  }
})

</script>

<style scoped>
</style>
