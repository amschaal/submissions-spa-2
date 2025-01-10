<template>
    <div class="autocomplete">
      <q-select
        v-model="value"
        use-input
        fill-input
        input-debounce="0"
        :options="options"
        @filter="filterFn"
        @input-value="selected"
        @input="close"
        hint="Search Users"
        ref="select"
        map-options emit-value
        clearable
        behavior="dialog"
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
export default {
  props: {
    queryParams: {
      type: String,
      default: ''
    }
  },
  // props: {
  //   url: String,
  //   query_params: {
  //     type: String
  //     default: ''
  //   },
  //   search_param: {
  //     type: String,
  //     default: 'search'
  //   },
  //   option_value: {
  //     type: Function,
  //     default: (item) => item
  //   },
  //   option_label: {
  //     type: Function,
  //     required: true
  //   }
  // },
  // ['url','query_params','search_param', 'option_value', 'option_label'],
  // opt => Object(opt) === opt && 'id' in opt ? opt.id : null
  data () {
    return {
      value: null,
      options: []
    }
  },
  methods: {
    filterFn (val, update, abort) {
      const self = this
      this.$axios
        .get(`/api/users/?search=${val}&${this.queryParams}`)
        .then(function (response) {
          update(() => {
            self.options = response.data.results.map(u => ({value: u, label: `${u.last_name}, ${u.first_name}: ${u.email}`}))
            console.log('filter autocomplete', response.data.results, self.options)
          })
        })
    },
    selected (item) {
      console.log('item', item)
      this.value = null
    }
  },
  mounted () {
  }
}

</script>

<style scoped>
</style>
