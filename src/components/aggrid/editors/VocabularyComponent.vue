<template>
    <div class="vocabulary">
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
import Vue from 'vue'
export default Vue.extend({
  data () {
    return {
      value: null,
      options: []
    }
  },
  methods: {
    filterFn (val, update, abort) {
      var self = this
      this.$axios
        .get(`/api/terms/${this.vocabulary}/?search=${val}`)
        .then(function (response) {
          update(() => {
            self.options = response.data.results.map(o => ({value: o.value, label: o.value}))
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
      if (this.$refs.select) {
        this.$refs.select.focus()
      }
    })
  }
})

</script>

<style scoped>
</style>
