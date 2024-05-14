<template>
<q-dialog v-model="show" persistent>
    <q-card>
      <q-bar>
        <q-space />
        <q-btn dense flat icon="close" @click="show = false">
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <q-input v-model="name" label="Search Name"/>
        <q-input v-model="description" label="Description"/>
        <savedSearchesTable :namespace="namespace">
            <template v-slot:action="props">
                <q-btn label="Save" @action="save(props.row)"/>
            </template>
        </savedSearchesTable>
      </q-card-section>

      <q-card-actions align="right">
          <q-btn flat label="Save" color="primary" @click="save()" />
        </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script>
import savedSearchesTable from './savedSearchesTable.vue'
export default {
  props: ['value', 'namespace', 'filters', 'advancedFilters'],
  components: { savedSearchesTable },
  data () {
    return {
      name: '',
      description: ''
    }
  },
  methods: {
    // close () {
    //   this.$emit('update')
    // },
    save (row) {
      let settings = null
      if (row) {
        settings = { name: row.name, description: row.description, filters: this.filters, advancedFilters: this.advancedFilters }
      } else {
        settings = { name: this.name, description: this.description, filters: this.filters, advancedFilters: this.advancedFilters }
      }
      this.$store.dispatch('updateSettings', {path: `${this.namespace}.${settings.name}`, value: settings, axios: this.$axios, self: this})
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
