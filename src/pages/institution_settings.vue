<template>
  <q-page padding>
    <div v-if="institution">
      {{institution}}
      <h5>Permissions for "{{institution.name}}"</h5>
      <q-tabs
          v-model="tab"
          class="text "
        >
        <q-tab name="permissions_tab" label="Permissions" />
        <q-tab name="labs_tab" label="Labs" />
        <q-tab name="plugins_tab" label="Plugins"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="permissions_tab">
          <!-- {{institution}} -->
          <permissions :base-url="`/api/institutions/${institution.id}`" v-if="institution && institution.id"/>
        </q-tab-panel>
        <q-tab-panel name="labs_tab">
          <q-table
            title="Labs"
            :data="labs"
            row-key="lab_id"
            :dense="true"
            :filter="filter"
            selection="single"
            :selected.sync="selected"
            v-if="!lab"
          >
            <template v-slot:top-left>
              <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </template>
            <template v-slot:body-cell-name="props">
              <q-td :props="props">
                <div>
                  <q-btn color="primary" label="Edit" size="sm" @click="editLab(props.row.lab_id)"/>{{props.value}}
                </div>
                <div>
                  {{ props.row.lab_id }}
                </div>
              </q-td>
            </template>
          </q-table>
          <div v-if="lab">
            {{lab_id}}
            {{lab}}
            <q-btn label="cancel" color="red" @click="lab=null"/>
          </div>
        </q-tab-panel>
        <q-tab-panel name="plugins_tab">
          <div v-if="available_plugins.length > 0">
            <q-checkbox v-model="plugin_selection" :val="plugin" :label="plugin" v-for="plugin in available_plugins" :key="plugin"/>
            <q-btn label="Add selected" color="primary" @click="addPlugins"/>
          </div>
          <q-tabs
              v-model="plugin_tab"
              dense
              class="bg-primary text-grey shadow-2"
              active-color="white"
              narrow-indicator
            >
            <template v-for="(config, plugin) in plugin_settings">
              <q-tab :key="plugin" :name="plugin" :label="plugin"/>
            </template>
          </q-tabs>
          <q-tab-panels v-model="plugin_tab" animated>
            <template v-for="(config, plugin) in plugin_settings">
              <q-tab-panel :key="plugin" :name="plugin">
                <pluginSettings :updateUrl="'/api/institutions/'+institution.id+'/update_plugin/'" :formUrl="('/api/institutions/'+institution.id+'/plugin_form/'+plugin+'/')" :plugin="plugin" :config="config"/>
              </q-tab-panel>
            </template>
          </q-tab-panels>
        </q-tab-panel>
      </q-tab-panels>

    </div>
  </q-page>
</template>

<script>
import permissions from '../components/permissions.vue'
import pluginSettings from '../components/pluginSettings.vue'
export default {
  name: 'institution_settings',
  data () {
    return {
      institution: this.$store.getters.institution,
      tab: 'permissions_tab',
      plugin_tab: null,
      plugins: [],
      plugin_settings: {},
      plugin_selection: [],
      labs: [],
      filter: '',
      selected: [],
      lab_id: null,
      lab: null,
      edit_lab: false
    }
  },
  mounted () {
    this.$axios
      .get('/api/plugins/')
      .then(response => {
        this.plugins = response.data
      })
    this.$axios
      .get(`/api/institutions/${this.institution.id}/plugin_settings/`)
      .then(response => {
        this.plugin_settings = response.data
      })
    this.$axios
      .get('/api/labs/?include_disabled=true')
      .then(response => {
        this.labs = response.data.results
      })
  },
  methods: {
    addPlugins () {
      this.$axios
        .post(`/api/institutions/${this.institution.id}/manage_plugins/add/`, {'plugins': this.plugin_selection})
        .then((response) => {
          this.plugin_selection.forEach((plugin) => {
            if (!this.plugin_settings[plugin]) {
              this.$set(this.plugin_settings, plugin, response.data.plugins[plugin])
            }
          }
          )
        })
    },
    editLab (labId) {
      this.$axios
        .get(`/api/labs/${labId}/`)
        .then(response => {
          this.lab = response.data
          this.edit_lab = true
        })
    }
  },
  watch: {
  },
  computed: {
    'available_plugins': function () {
      return this.plugins.filter(v => !this.plugin_settings[v])
    }

  },
  components: {
    permissions,
    pluginSettings
  }
}
</script>
