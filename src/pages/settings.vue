<template>
  <q-page padding>
    <div v-if="lab">
      <h5>Settings for "{{lab.name}}"</h5>
      <!-- <draggable :list="statuses">
        <div v-for="status in statuses" :key="status" class="q-chip row no-wrap inline items-center q-chip-small bg-primary text-white">
          <div class="q-chip-main ellipsis">{{status}}</div>
        </div>
          <button slot="header">Add</button>
      </draggable> -->
      <q-field
        label="Users"
        v-if="user_options"
        label-width="2"
      >
        <q-select
          float-label="Select"
          multiple
          v-model="lab.users"
          :options="user_options"
        />
      </q-field>
      <q-field
        label="Home Page"
        label-width="2"
      >
        <q-editor v-model="lab.home_page"
        :toolbar="toolbar"
        />
      </q-field>
      <q-field
        label="Submission Page"
        label-width="2"
        helper="Enter custom content to be shown at the top of the submission page."
      >
        <q-editor v-model="lab.submission_page"
        :toolbar="toolbar"
        />
      </q-field>
      <q-field
        label="Statuses"
        label-width="2"
        helper="A list of statuses that can be used for submission types.  Special statuses include 'Samples Received' and 'Completed'."
      >
        <q-chips-input v-model="lab.statuses" @input="addStatus" @remove="removeStatus"/>
      </q-field>
      <h5>Submission variables</h5>
      <schemaForm v-model="lab.submission_variables" :options="{variables: {}}" type="submission"/>
      <h5>Sample variables</h5>
      <schemaForm v-model="lab.sample_variables" :options="{variables: {}}" type="samples"/>
      <q-card-actions>
        <q-btn @click="save" label="Save"></q-btn>
      </q-card-actions>
    </div>
  </q-page>
</template>

<script>
import schemaForm from '../components/forms/schemaForm.vue'
// import draggable from 'vuedraggable'
export default {
  name: 'settings',
  data () {
    return {
      lab: this.$store.getters.lab,
      settings: null,
      labs: [],
      submission_variables: {},
      sample_variables: {},
      statuses: ['one', 'two', 'three'],
      user_options: [],
      toolbar: [
        ['bold', 'italic', 'strike', 'underline'],
        ['token', 'link', 'custom_btn'],
        ['print', 'fullscreen'],
        [
          {
            label: this.$q.i18n.editor.formatting,
            icon: this.$q.icon.editor.formatting,
            list: 'no-icons',
            options: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code']
          },
          'removeFormat'
        ],
        ['quote', 'unordered', 'ordered'],
        [
          {
            label: this.$q.i18n.editor.align,
            icon: this.$q.icon.editor.align,
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
      if (this.lab.id) {
        this.$axios
          .put(`/api/labs/${this.lab.id}/`, this.lab)
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
  components: {
    schemaForm
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
