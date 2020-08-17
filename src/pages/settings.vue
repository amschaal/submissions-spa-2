<template>
  <q-page padding>
    <div v-if="lab">
      <h5>Settings for "{{lab.name}}"</h5>
      <q-tabs
          v-model="tab"
          class="text "
        >
        <q-tab name="settings_tab" label="General" />
        <q-tab name="project_id_tab" label="Project IDs" />
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="settings_tab">
          <!-- <draggable :list="statuses">
            <div v-for="status in statuses" :key="status" class="q-chip row no-wrap inline items-center q-chip-small bg-primary text-white">
              <div class="q-chip-main ellipsis">{{status}}</div>
            </div>
              <button slot="header">Add</button>
          </draggable> -->
          <q-list bordered class="rounded-borders">
            <q-expansion-item
              expand-separator
              label="Users"
              caption="Edit users"
              group="settings"
            >
            <q-select
              label="Users"
              v-if="user_options"
              multiple
              v-model="lab.users"
              :options="user_options"
              map-options emit-value
            />
            </q-expansion-item>
            <q-expansion-item
              expand-separator
              label="Content"
              caption="Edit page contents"
              group="settings"
            >
              <q-field
                label="Home Page"
                stack-label
              >
                <q-editor v-model="lab.home_page"
                :toolbar="toolbar"
                />
              </q-field>
              <q-field
                label="Submission Page"
                stack-label
                hint="Enter custom content to be shown at the top of the submission page."
              >
                <q-editor v-model="lab.submission_page"
                :toolbar="toolbar"
                />
              </q-field>
            </q-expansion-item>
            <q-expansion-item
              expand-separator
              label="Statuses"
              caption="Edit available type statuses"
              group="settings"
            >
            <q-select
              dense options-dense
              v-model="lab.statuses"
              @input="addStatus" @remove="removeStatus"
              use-input
              use-chips
              multiple
              hide-dropdown-icon
              input-debounce="0"
              new-value-mode="add-unique"
              placeholder="Enter options"
              stack-label
              label="Statuses"
              hint="A list of statuses that can be used for submission types.  Special statuses include 'Samples Received' and 'Completed'."
              />
            </q-expansion-item>
            <q-expansion-item
              expand-separator
              label="Submission variables"
              group="settings"
            >
              <h5>Submission variables</h5>
              <schemaForm v-model="lab.submission_variables" :options="{variables: {}}" type="submission"/>
            </q-expansion-item>
            <q-expansion-item
              expand-separator
              label="Table variables"
              caption="Table level variables"
              group="settings"
            >
            <h5>Table variables</h5>
            <schemaForm v-model="lab.table_variables" :options="{variables: {}}" type="table"/>
            </q-expansion-item>
          </q-list>

          <!-- <q-field
            label="Statuses"
            label-width="2"
            hint="A list of statuses that can be used for submission types.  Special statuses include 'Samples Received' and 'Completed'."
          >
            <q-chips-input v-model="lab.statuses" @input="addStatus" @remove="removeStatus"/>
          </q-field> -->

          <q-card-actions>
            <q-btn @click="save" label="Save"></q-btn>
          </q-card-actions>
        </q-tab-panel>
        <q-tab-panel name="project_id_tab">
          <projectIds :lab="lab"/>
        </q-tab-panel>
      </q-tab-panels>

    </div>
  </q-page>
</template>

<script>
import schemaForm from '../components/forms/schemaForm.vue'
import projectIds from '../components/projectIds.vue'
import _ from 'lodash'
// import draggable from 'vuedraggable'
export default {
  name: 'settings',
  data () {
    return {
      lab: _.cloneDeep(this.$store.getters.lab),
      settings: null,
      labs: [],
      submission_variables: {},
      table_variables: {},
      statuses: ['one', 'two', 'three'],
      user_options: [],
      tab: 'settings_tab',
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
    var self = this
    this.$axios
      .get('/api/users/?show=true')
      .then(function (response) {
        self.user_options = response.data.results.map(opt => ({label: `${opt.first_name} ${opt.last_name}`, value: opt.id}))
      })
  },
  methods: {
    save () {
      var self = this
      if (this.$store.getters.labId) {
        this.$axios
          .put(`/api/labs/${this.$store.getters.labId}/`, this.lab)
          .then(({ data }) => {
            self.$store.commit('lab', data)
            self.$q.notify({message: `Settings saved for ${data.name}`, type: 'positive'})
          })
          .catch(error => {
            self.$q.notify({message: `Error: unable to save settings`, type: 'negative'})
            console.log('error', error)
          })
      }
    },
    addStatus (val) {
      this.lab.statuses.sort()
    },
    removeStatus ({index, value}) {
      // alert('removing')
      // return true
    }
  },
  watch: {
    '$store.getters.lab': function () {
      this.lab = _.cloneDeep(this.$store.getters.lab)
    }
  },
  components: {
    schemaForm,
    projectIds
  }
}
</script>
<style>
  .list-group-item {
    background-color: navy;
    color: white;
    border-radius: 3px;
    border: thin solid grey;
  }
</style>
