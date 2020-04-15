<template>
    <div class="grid">
      <!-- <q-input color="amber" v-model="value" placeholder="Featuring static data" ref="input">
        <q-autocomplete
          @search="search"
          :min-characters="2"
          @selected="selected"
        />
      </q-input> -->
      <Agschema
        v-model="value"
        :schema="schema"
        :type="{}"
        :editable="true"
        :allow-examples="true"
        :allow-force-save="true"
        ref="grid"
        />
      <a @click="$refs.grid.openSamplesheet()">Grid ({{value.length}})</a>
    </div>
</template>

<script>
import Vue from 'vue'
// import _ from 'lodash'
// import Agschema from '../../agschema.vue'
export default Vue.extend({
  data () {
    return {
      value: null,
      showAgSchema: false
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
    console.log('created', this.params)
    this.value = this.params.value ? this.params.value : []
    this.schema = this.params.widget_options._schema
    console.log('grid schema', this.schema, this.params.widget_options)
  },
  mounted () {
    Vue.nextTick(() => {
      console.log('nextTick', this.params)
      // this.$refs.grid.openSamplesheet()
    })
  },
  destroyed () {
    console.log('destroyed GridComponent')
  },
  components: {
    Agschema: () => import('../../agschema.vue')
  }
})

</script>

<style scoped>
</style>
