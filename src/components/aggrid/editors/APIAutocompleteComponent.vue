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
      var self = this
      this.$axios
        .get(`${this.url}?search=${terms}&${this.query_params}`)
        .then(function (response) {
          done(response.data.results.map(o => ({value: o[self.value_property], label: o[self.label_property]})))
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
  created () {
    this.value = this.params.value
    console.log('autocomplete params', this.params)
    var options = this.params.widget_options ? this.params.widget_options : {}
    this.url = options.url
    this.query_params = options.params
    this.value_property = options.value_property
    this.label_property = options.label_property
    if (!this.url) {
      this.$q.notify({message: 'No API has been specified.', color: 'red'})
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
