<template>
    <div class="autocomplete">
      <q-input color="amber" v-model="temp_value" placeholder="Search" ref="input">
        <q-autocomplete
          @search="search"
          :min-characters="2"
          @selected="selected"
          @hide="hide"
        />
      </q-input>
    </div>
</template>

<script>
import Vue from 'vue'
// import { filter } from 'quasar'
export default Vue.extend({
  data () {
    return {
      value: null
    }
  },
  methods: {
    selected (item) {
      this.value = item.value
      // this.params.stopEditing() // This closes it when merely highlighting a suggestion
    },
    hide () {
      this.params.stopEditing()
    },
    search (terms, done) {
      this.$axios
        .get(`/api/terms/${this.vocabulary}/?search=${terms}`)
        .then(function (response) {
          console.log('response', response)
          done(response.data.results.map(o => ({value: o.value, label: o.value})))
        })
        // .catch(function (error, stuff) {
        // })
      console.log(terms)
    },
    getValue () {
      return this.value
    }
  },
  created () {
    this.value = this.params.value
    this.temp_value = this.params.value
    console.log('autocomplete params', this.params)
    if (this.params.widget_options.vocabulary_variable) {
      this.vocabulary_variable = this.params.widget_options.vocabulary_variable
      this.vocabulary = this.params.node.data[this.vocabulary_variable]
      if (!this.vocabulary) {
        this.$q.notify({message: `No vocabulary has been selected.  Please make a selection for "${this.vocabulary_variable}"`, color: 'red'})
      }
    } else if (this.params.widget_options.vocabulary) {
      this.vocabulary = this.params.widget_options.vocabulary
    }
  },
  mounted () {
    Vue.nextTick(() => {
      if (this.$refs.input) {
        this.$refs.input.select()
      }
    })
  }
})

</script>

<style scoped>
</style>
