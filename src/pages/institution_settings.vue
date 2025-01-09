<template>
  <q-page padding>
    <div v-if="institution">
      <h5>Permissions for "{{institution.name}}"</h5>
      <q-tabs
          v-model="tab"
          class="text "
        >
        <q-tab name="settings_tab" label="Settings" />
        <q-tab name="permissions_tab" label="Permissions" />
        <q-tab name="labs_tab" label="Labs" />
        <q-tab name="plugins_tab" label="Plugins"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="settings_tab">
          <q-field
            label="Home Page"
            stack-label
          >
            <q-editor v-model="institution.home_page"
            :toolbar="toolbar"
            />
          </q-field>
          <q-btn @click="save" color="primary" label="save"/>
        </q-tab-panel>
        <q-tab-panel name="permissions_tab">
          <!-- {{institution}} -->
          <permissions :base-url="`/api/institutions/${institution.id}`" v-if="institution && institution.id"/>
        </q-tab-panel>
        <q-tab-panel name="labs_tab">
          <div v-if="!lab">
            <q-btn label="Create lab" color="primary" @click="lab={}"/>
            <q-table
              title="Labs"
              :columns="lab_columns"
              :data="labs"
              row-key="lab_id"
              :dense="true"
              :filter="filter"
            >
              <template v-slot:top-left>
                <q-input borderless dense debounce="300" v-model="filter" placeholder="Search">
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>
              <template v-slot:body-cell-action="props">
                <q-td :props="props">
                  <q-btn color="primary" size="sm" :to="{ name: 'lab', params: { lab_id: props.row.lab_id} }" label="Home"/>
                  <q-btn color="primary" size="sm" :to="{ name: 'settings', params: { lab_id: props.row.lab_id} }" label="Settings"/>
                  <q-btn color="primary" label="Edit" size="sm" @click="editLab(props.row.lab_id)"/>
                  <!-- <q-toggle label="Enabled" :false-value="true" :true-value="false" v-model="props.row.disabled" @input="toggleDisabled(props.row)"/> -->
                </q-td>
              </template>
              <template v-slot:body-cell-disabled="props">
                <q-td :props="props">
                  <q-toggle :false-value="true" :true-value="false" v-model="props.row.disabled" @input="toggleDisabled(props.row)"/>
                </q-td>
              </template>
            </q-table>
          </div>
          <div v-else>
            <q-input label="Name" v-model="lab.name"/>
            <q-input label="Lab ID" v-model="lab.lab_id"/>
            <q-input label="Email" v-model="lab.email"/>
            <br/>
            <q-btn label="save" color="primary" @click="saveLab" v-if="lab.id"/>
            <q-btn label="create" color="primary" @click="createLab" v-else/>
            <q-btn label="cancel" color="red" @click="returnToLabList"/>
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
            <template v-for="(config, plugin) in plugin_settings" :key="plugin">
              <q-tab :name="plugin" :label="plugin"/>
            </template>
          </q-tabs>
          <q-tab-panels v-model="plugin_tab" animated>
            <template v-for="(config, plugin) in plugin_settings" :key="plugin">
              <q-tab-panel :name="plugin">
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
import _ from 'lodash'

export default {
  name: 'institution_settings',
  data () {
    return {
      institution: _.cloneDeep(this.$store.getters.institution),
      tab: 'settings_tab',
      plugin_tab: null,
      plugins: [],
      plugin_settings: {},
      plugin_selection: [],
      labs: [],
      filter: '',
      lab_id: null,
      lab: null,
      edit_lab: false,
      lab_columns: [{name: 'name', field: 'name', label: 'Name'}, {name: 'lab_id', field: 'lab_id', label: 'Lab ID'}, {name: 'action', field: 'lab_id', label: 'Action'}, {name: 'disabled', field: 'disabled', label: 'Enabled'}],
      toolbar: [
        ['bold', 'italic', 'strike', 'underline'],
        ['token', 'link', 'custom_btn'],
        ['print', 'fullscreen'],
        [
          {
            label: 'Formatting', // this.$q.i18n.editor.formatting,
            icon: 'Formatting', // this.$q.icon.editor.formatting,
            list: 'no-icons',
            options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code']
          },
          'removeFormat'
        ],
        ['quote', 'unordered', 'ordered'],
        [
          {
            label: 'Align', // this.$q.i18n.editor.align,
            icon: 'Align', // this.$q.icon.editor.align,
            fixedLabel: true,
            list: 'only-icons',
            options: ['left', 'center', 'right', 'justify']
          }
        ],
        ['undo', 'redo']
      ]
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
    this.loadLabs()
  },
  methods: {
    save () {
      if (this.institution.id) {
        this.$axios
          .put(`/api/institutions/${this.institution.id}/`, this.institution)
          .then(({ data }) => {
            this.$store.commit('institution', data)
            this.$q.notify({message: `Settings saved for ${data.name}`, type: 'positive'})
          })
          .catch(error => {
            this.$q.notify({message: `Error: unable to save settings`, type: 'negative'})
            console.log('error', error)
          })
      }
    },
    loadLabs () {
      this.$axios
        .get('/api/labs/?include_disabled=true')
        .then(response => {
          this.labs = response.data.results
        })
    },
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
      this.lab_id = labId
      this.$axios
        .get(`/api/labs/${labId}/`)
        .then(response => {
          this.lab = response.data
          this.edit_lab = true
        })
    },
    toggleDisabled (lab) {
      this.$axios
        .post(`/api/labs/${lab.lab_id}/toggle_disabled/`)
        .then(response => {
          lab.disabled = response.data.disabled
          this.$q.notify({message: 'Lab ' + lab.name + ' has been ' + (lab.disabled ? 'disabled' : 'enabled'), type: 'positive'})
        }).catch(error => {
          this.$q.notify({message: 'Error ' + (lab.disabled ? 'disabling' : 'enabling') + ' lab ' + lab.name, type: 'negative'})
          lab.disabled = !lab.disabled
          console.log('error', error)
        })
    },
    saveLab () {
      this.$axios
        .put(`/api/labs/${this.lab_id}/`, this.lab)
        .then(response => {
          this.lab = response.data
          this.$q.notify({message: 'Lab ' + this.lab.name + ' has been updated', type: 'positive'})
          this.returnToLabList()
          this.loadLabs()
        }).catch(error => {
          this.$q.notify({message: 'Error updating lab ' + this.lab.name, type: 'negative'})
          console.log('error', error)
        })
    },
    createLab () {
      this.$axios
        .post(`/api/labs/`, this.lab)
        .then(response => {
          this.lab = response.data
          this.$q.notify({message: 'Lab ' + this.lab.name + ' has been created', type: 'positive'})
          this.returnToLabList()
          this.loadLabs()
        }).catch(error => {
          this.$q.notify({message: 'Error creating lab ' + this.lab.name, type: 'negative'})
          console.log('error', error)
        })
    },
    returnToLabList () {
      this.lab_id = null
      this.lab = null
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
