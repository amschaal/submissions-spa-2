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
        <q-tab name="plugins_tab" label="Plugins"/>
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="permissions_tab">
          <!-- {{institution}} -->
          <permissions :base-url="`/api/institutions/${institution.id}`" v-if="institution && institution.id"/>
        </q-tab-panel>
        <q-tab-panel name="plugins_tab">
          Plugins: {{available_plugins}}{{plugins}}
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
            <template v-for="(config, plugin) in institution.plugins">
              <q-tab :key="plugin" :name="plugin" :label="plugin"/>
            </template>
          </q-tabs>
          <q-tab-panels v-model="plugin_tab" animated>
            <template v-for="(config, plugin) in institution.plugins">
              <q-tab-panel :key="plugin" :name="plugin">
                <pluginSettings :updateUrl="'/api/institutions/'+institution.id+'/update_plugin/'" :plugin="plugin" :config="config"/>
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
      plugin_selection: []
    }
  },
  mounted () {
    this.$axios
      .get('/api/plugins/')
      .then(response => {
        this.plugins = response.data
      })
  },
  methods: {
    addPlugins () {
      this.$axios
        .post(`/api/institutions/${this.institution.id}/manage_plugins/add/`, {'plugins': this.plugin_selection})
        .then((response) => {
          this.plugin_selection.forEach((plugin) => {
            if (!this.institution.plugins[plugin]) {
              this.$set(this.institution.plugins, plugin, response.data.plugins[plugin])
            }
          }
          )
        })
    }
  },
  watch: {
  },
  computed: {
    'available_plugins': function () {
      return this.plugins
      // return this.plugins.filter(function (v) {
      //   return true // return !self.institution.plugins[v]
      // })
    }

  },
  components: {
    permissions,
    pluginSettings
  }
}
</script>
