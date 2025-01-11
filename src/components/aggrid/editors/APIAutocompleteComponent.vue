<template>
    <div class="autocomplete">
      <!-- <q-input color="amber" v-model="value" placeholder="Featuring static data" ref="input">
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
        :options="options"
        @filter="filterFn"
        @input-value="selected"
        @input="close"
        hint="Text autocomplete"
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
import { nextTick } from 'vue'
export default {
  data () {
    return {
      value: null,
      options: []
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
      const self = this
      this.$axios
        .get(`${this.url}?search=${val}&${this.query_params}`)
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
  created () {
    this.value = this.params.value
    console.log('autocomplete params', this.params)
    const options = this.params.widget_options ? this.params.widget_options : {}
    this.url = options.url
    this.query_params = options.params
    this.value_property = options.value_property
    this.label_property = options.label_property
    if (!this.url) {
      this.$q.notify({message: 'No API has been specified.', color: 'red'})
    }
  },
  mounted () {
    nextTick(() => {
      if (this.$refs.select) {
        this.$refs.select.focus()
      }
    })
  }
}

</script>

<style scoped>
</style>
