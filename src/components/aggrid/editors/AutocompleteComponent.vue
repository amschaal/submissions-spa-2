<template>
    <div class="autocomplete">
      <q-input color="amber" v-model="value" placeholder="Featuring static data">
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
import { filter } from 'quasar'
export default Vue.extend({
  data () {
    return {
      value: null,
      options: ['one', 'two', 'three']
    }
  },
  methods: {
    selected (item) {
      this.value = item.value
      // this.$q.notify(`Selected suggestion "${item.label}"`)
    },
    search (terms, done) {
      console.log(terms)
      setTimeout(() => {
        done(filter(terms, {field: 'value', list: this.options}))
        // done([{value: 'one', label: 'one'}, {value: 'two', label: 'two'}]) // filter(terms, {field: 'value', list: ['one', 'two', 'three']}) // ['one', 'two', 'three']
      }, 100)
    },
    getValue () {
      return this.value
    }
  },
  created () {
    this.value = this.params.value
    Vue.set(this, 'options', this.params.definition.enum.map(v => ({value: v, label: v})))
    console.log('autocomplete params', this.params)
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
