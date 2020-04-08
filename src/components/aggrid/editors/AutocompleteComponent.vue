// @TODO: Replace autocomplete with select!  Broken stuff commented out for now...
<template>
    <div class="autocomplete">
      <!-- <q-input color="amber" v-model="value" placeholder="Featuring static data">
        <q-autocomplete
          @search="search"
          :min-characters="2"
          @selected="selected"
        />
      </q-input> -->
      <q-select
        :value="value"
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        :options="filteredOptions"
        @filter="filterFn"
        @input-value="selected"
        @input="close"
        hint="Text autocomplete"
        ref="select"

      >
        <template v-slot:no-option>
          <q-item>
            <q-item-section class="text-grey">
              No results
            </q-item-section>
          </q-item>
        </template>
      </q-select>
    </div>
</template>

<script>
import Vue from 'vue'
// import { filter } from 'quasar'
export default Vue.extend({
  data () {
    return {
      value: null,
      options: ['one', 'two', 'three'],
      filteredOptions: []
    }
  },
  methods: {
    filterFn (val, update, abort) {
      update(() => {
        const needle = val.toLocaleLowerCase()
        this.filteredOptions = this.options.filter(v => v.toLocaleLowerCase().indexOf(needle) > -1)
      })
    },
    selected (item) {
      console.log('item', item)
      this.value = item
      // this.close()
      // this.$q.notify(`Selected suggestion "${item.label}"`)
    },
    search (terms, done) {
      console.log(terms)
      setTimeout(() => {
        // done(filter(terms, {field: 'value', list: this.options}))
        // done([{value: 'one', label: 'one'}, {value: 'two', label: 'two'}]) // filter(terms, {field: 'value', list: ['one', 'two', 'three']}) // ['one', 'two', 'three']
      }, 100)
    },
    getValue () {
      return this.value
    },
    close () {
      this.params.stopEditing()
    }
  },
  created () {
    this.value = this.params.value
    Vue.set(this, 'options', this.params.definition.enum)
    Vue.set(this, 'filteredOptions', this.params.definition.enum)
    console.log('autocomplete params', this.params)
  },
  mounted () {
    Vue.nextTick(() => {
      if (this.$refs.select) {
        this.$refs.select.focus()
      }
    })
  }
})

</script>

<style scoped>
</style>
