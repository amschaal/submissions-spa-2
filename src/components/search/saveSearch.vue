<template>
<q-dialog v-model="show">
    <q-card style="width: 1000px; max-width: 80vw;">
      <q-bar>
        <div>Save the current search</div>
        <q-space />
        <q-btn dense flat icon="close" @click="show = false">
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-bar>

      <q-card-section>
        <q-radio v-model="mode" val="new" label="New search"/><q-radio v-model="mode" val="existing" label="Save to existing search"/>
        <fieldset v-if="mode=='new'">
            <legend>Give this search a name and description.</legend>
            <q-input v-model="name" label="Search Name" hint="This name must be unique, and will replace any search by the same name.  You may use the special name of 'default' if you want the search to be your default search view."/>
            <q-input v-model="description" label="Description"/>
        </fieldset>
        <savedSearchesTable :namespace="namespace" v-else>
            <template v-slot:action="{props}">
                <q-btn flat label="Save" @click="save(props.row)"/>
                <q-btn flat label="Delete" color="negative" @click="deleteSearch(props.row)" />
            </template>
        </savedSearchesTable>
      </q-card-section>

      <q-card-actions align="right">
        <q-btn flat label="Save" color="primary" @click="save()" v-if="mode=='new'"/> <q-btn flat label="Cancel" color="negative" @click="close()" />
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
      mode: 'new',
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
    },
    deleteSearch (row) {
      this.$store.dispatch('deleteSetting', {path: `${this.namespace}.${row.name}`, axios: this.$axios, self: this})
    },
    reset () {
      this.name = this.description = ''
    },
    close () {
      this.reset()
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
