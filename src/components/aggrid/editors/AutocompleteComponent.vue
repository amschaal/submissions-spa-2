<template>
    <div class="autocomplete">
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
