<template>
<q-dialog v-model="show">
    <q-card style="width: 1000px; max-width: 80vw;">
      <q-bar color="primary">
        <div>Load a saved search</div>
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <savedSearchesTable :namespace="namespace">
            <template v-slot:action="{props}">
                <q-btn label="Load" @click="load(props.row)"/>
            </template>
        </savedSearchesTable>
      </q-card-section>

      <q-card-actions align="right">
          <q-btn flat label="Cancel" color="negative" v-close-popup />
        </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
import savedSearchesTable from './savedSearchesTable.vue'
export default {
  components: { savedSearchesTable },
  props: ['value', 'namespace'],
  data () {
    return {
      name: '',
      description: ''
    }
  },
  methods: {
    load (row) {
      this.$emit('loadSearch', row)
      this.show = false
    }
  },
  computed: {
    show: {
      get: function () {
        return this.value
      },
      set: function (val) {
        this.$emit('input', val)
      }
    }
  }
}
</script>
