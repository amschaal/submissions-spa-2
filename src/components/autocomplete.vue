<template>
    <div class="autocomplete">
      <q-select
        :value="value"
        use-input
        hide-selected
        fill-input
        input-debounce="0"
        :options="options"
        @filter="filterFn"
        @input-value="selected"
        @input="close"
        :option-value="option_value"
        :option-label="option_label"
        hint="Search Users"
        ref="select"
        map-options emit-value
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
export default Vue.extend({
  props: {
    url: String,
    query_params: {
      type: String
      default: ''
    },
    search_param: {
      type: String,
      default: 'search'
    },
    option_value: {
      type: Function,
      default: (item) => item
    },
    option_label: {
      type: Function,
      required: true
    }
  },
  ['url','query_params','search_param', 'option_value', 'option_label'],
  // opt => Object(opt) === opt && 'id' in opt ? opt.id : null
  data () {
    return {
      value: null,
      options: [],
      search: this.search_param || 'search'
    }
  },
  methods: {
    // search (terms, done) {
    //   var self = this
    //   this.$axios
    //     .get(`${this.url}?search=${terms}&${this.query_params}`)
    //     .then(function (response) {
    //       done(response.data.results.map(o => ({value: o[self.value_property], label: o[self.label_property]})))
    //     })
    //     // .catch(function (error, stuff) {
    //     // })
    // },
    filterFn (val, update, abort) {
      var self = this
      this.$axios
        .get(`${this.url}?${this.search}=${val}&${this.query_params}`)
        .then(function (response) {
          update(() => {
            self.options = response.data.results.map(o => ({value: o[self.value_property], label: o[self.label_property]}))
            console.log('filter autocomplete', response.data.results, self.options)
          })
        })
    },
    selected (item) {
      console.log('item', item)
      this.value = item
    },
    getValue () {
      return this.value
    },
    close () {
      this.params.stopEditing()
    }
  },
  mounted () {
  }
})

</script>

<style scoped>
</style>
