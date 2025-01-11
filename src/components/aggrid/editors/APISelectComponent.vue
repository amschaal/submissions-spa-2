<template>
    <div>
      <q-select
        filter
        v-model="value"
        :options="options"
        ref="select"
        @input="selected(value)"
        map-options emit-value
      />
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
    selected (value) {
      this.params.stopEditing()
    },
    getOptions () {
      const self = this
      this.$axios
        .get(`${this.url}?${this.query_params}`)
        .then(function (response) {
          console.log('response', response)
          self.options = response.data.results.map(
            o => ({value: o[self.value_property], label: o[self.label_property]})
          )
          self.$refs.select.showPopup()
        })
        // .catch(function (error, stuff) {
        // })
    },
    getValue () {
      return this.value
    }
  },
  created () {
    this.value = this.params.value
    console.log('select params', this.params)
    const options = this.params.widget_options ? this.params.widget_options : {}
    this.url = options.url
    this.query_params = options.params
    this.value_property = options.value_property
    this.label_property = options.label_property
    if (!this.url) {
      this.$q.notify({message: 'No API has been specified.', color: 'red'})
    } else {
      this.getOptions()
    }
  },
  mounted () {
    nextTick(() => {
      if (this.$refs.select) {
        console.log('select', this.$refs.select)
        this.$refs.select.focus()
      }
    })
  }
}

</script>

<style scoped>
</style>
