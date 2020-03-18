<template>
  <q-page padding class="docs-input row justify-center">
    <q-card style="width:100%">
      <q-card-title>
        <span v-if="!type.id">Create</span> Submission Type <span class="inactive" v-if="type.id && !type.active"> (Inactive)</span>
        <q-btn :to="{ name: 'create_submission_type', query: { copy_from: type.id } }" label="Copy" v-if="type.id"/>
        <q-btn @click="delete_type" color="negative" label="Delete" class="float-right" v-if="type.id"  :disable="type.submission_count !== 0" title="Only types with no associated permissions may be deleted."/>
        <router-link v-if="type.submission_count > 0 && type.id" :to="{'name': 'submissions', 'query': { 'search': type.name }}" class="float-right">{{type.submission_count}} Submissions</router-link>
      </q-card-title>
      <!-- <q-btn :to="{ name: 'create_submission_type', query: { copy_from: type.id } }" label="Copy" v-if="type.id"/> -->
      <q-card-separator />
      <q-card-main>
        <q-field
          label="Active"
          :error="errors.active"
          :error-label="errors.active"
        >
          <q-checkbox v-model="type.active" label="Should this type be available for submission?"/>
        </q-field>
        <q-field
          label="Sort order"
          helper="Submission types will be displayed in numeric order as specified by this field"
          :error="errors.sort_order"
          :error-label="errors.sort_order"
        >
          <q-input v-model="type.sort_order" type="integer"/>
        </q-field>
        <q-field
          label="Name"
          helper="This shows up in the dropdown on the submission form"
          :error="errors.name"
          :error-label="errors.name"
        >
          <q-input v-model="type.name" type="text"/>
        </q-field>
        <q-field
          label="Internal ID"
          :error="next_id_error"
          :error-label="next_id_error"
          helper="The Prefix is concatenated with the Next ID to create the internal id for the submission."
        >
          <div class="row no-wrap">
            <q-input v-model="type.prefix" type="text" stack-label="Prefix" class="col"/>
            <q-input v-model="type.next_id" type="number" stack-label="Next ID" class="col"/>
            <div class="col">Next Internal ID:<br><b>{{next_internal_id}}</b></div>
          </div>
        </q-field>
        <q-field
          label="Default participants"
          :error="errors.type"
          :error-label="errors.type"
          v-if="user_options"
        >
          <q-select
            float-label="Select"
            multiple
            v-model="type.default_participants"
            :options="user_options"
          />
        </q-field>
        <q-field
          label="Description"
          :error="errors.description"
          :error-label="errors.description"
        >
          <q-input v-model="type.description" type="textarea"/>
        </q-field>
        <q-field
          label="Statuses"
          :error="errors.statuses"
          :error-label="errors.statuses"
          helper="Add statuses using the dropdown.  Statuses may reordered by dragging."
        >
          <!-- <q-chips-input v-model="type.statuses" /> -->
          <q-select
            float-label="Add Status"
            :options="status_options"
            filter
            @input="add_status"
          />
          <draggable :list="type.statuses">
            <div v-for="status in type.statuses" :key="status" class="q-chip row no-wrap inline items-center q-chip-small bg-primary text-white draggable">
              <div class="q-chip-main ellipsis draggable">{{status}}</div>
              <div class="q-chip-side q-chip-close q-chip-right row flex-center" @click="delete_status(status)"><i aria-hidden="true" class="q-icon cursor-pointer material-icons">cancel</i></div>
            </div>
          </draggable>
        </q-field>
        <q-field
          label="Submission Help"
          :error="errors.submission_help"
          :error-label="errors.submission_help"
        >
          <q-editor v-model="type.submission_help"
            :toolbar="[
              ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
              ['token', 'hr', 'link', 'custom_btn'],
              ['print', 'fullscreen'],
              ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
              ['undo', 'redo'],
              ['table']
            ]"
          />
        </q-field>
        <q-field
          label="Confirmation Text"
          helper="Text to provide additional instruction to submitter after submission is complete."
          :error="errors.confirmation_text"
          :error-label="errors.confirmation_text"
        >
          <q-input v-model="type.confirmation_text" type="textarea"/>
        </q-field>
        <h6>Submission Fields</h6>
        <schemaForm v-model="type.submission_schema" :options="{variables: $store.getters.lab.submission_variables, showWidth: true}" type="submission"/>
        <h5>Samplesheet definition</h5>
        <h6>Column Definitions</h6>
        <schemaForm v-model="type.sample_schema" :options="{variables: $store.getters.lab.sample_variables, showWidth: false}" type="samples"/>
        <div v-if="type && type.sample_schema && type.sample_schema.properties">
          <Agschema v-model="type.sample_schema.examples" :type="type" :editable="true"  ref="samplesheet" :allow-force-save="false"/>
          <q-btn :label="'Configure examples ('+type.sample_schema.examples.length+')'"  @click="openExamples"/>
        </div>
        <q-field
          label="Samplesheet Help"
          :error="errors.sample_help"
          :error-label="errors.sample_help"
        >
          <q-editor v-model="type.sample_help"
            :toolbar="[
              ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
              ['token', 'hr', 'link', 'custom_btn'],
              ['print', 'fullscreen'],
              ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
              ['undo', 'redo'],
              ['table']
            ]"
          />
        </q-field>
      </q-card-main>
      <q-card-separator />
      <q-card-actions>
        <q-btn @click="submit" label="Save" color="primary"></q-btn>
      </q-card-actions>

    </q-card>
  </q-page>

</template>

<script>
import '../components/forms/docs-input.styl'
import SchemaForm from '../components/forms/schemaForm.vue'
import Vue from 'vue'
import Agschema from '../components/agschema.vue'
import draggable from 'vuedraggable'
export default {
  name: 'submission_type',
  props: ['id'],
  data () {
    return {
      type: {active: true, help: '', examples: [], statuses: [], default_participants: [], submission_schema: {properties: {}, order: [], required: [], layout: {}, printing: {}}, sample_schema: {properties: {}, order: [], required: [], printing: {}, examples: []}},
      errors: {},
      submission_schema: [],
      examples: [],
      save_message: null,
      watch_changes: false,
      user_options: [],
      status_options: this.$store.getters.lab.statuses.map(status => ({label: status, value: status}))
    }
  },
  mounted: function () {
    // Edit, Create, and Copy from logic is a bit convoluted.  Would be good to clean this up.
    var self = this
    if (!this.id || this.id === 'create') {
      this.create = true
    }
    var id = this.$route.query.copy_from || this.id
    console.log('mounted', this.id, this.create, id, this.$route.query.copy_from)
    // if (this.create) {
    //   this.notify_autosave()
    // }
    if (!this.create || this.$route.query.copy_from) {
      this.$q.loading.show()
      this.$axios
        .get('/api/submission_types/' + id + '/')
        .then(function (response) {
          self.type = response.data
          if (!self.type.sample_schema.examples) {
            self.type.sample_schema.examples = []
          }
          if (!self.type.submission_schema.printing) {
            Vue.set(self.type.submission_schema, 'printing', {})
          }
          if (!self.type.sample_schema.printing) {
            Vue.set(self.type.sample_schema, 'printing', {})
          }
          if (self.$route.query.copy_from) {
            delete self.type['id']
            self.type.name = 'Copy from ' + self.type.name
          }
          self.$q.loading.hide()
          // self.notify_autosave()
        })
    }
    setTimeout(function () {
      self.watch_changes = true
    }, 5000)
    this.$axios
      .get('/api/users/?show=true')
      .then(function (response) {
        self.user_options = response.data.results.map(opt => ({label: `${opt.first_name} ${opt.last_name}`, value: opt.id}))
      })
    console.log('lab', this.$store.getters.lab)
  },
  beforeDestroy: function () {
    if (this.save_message) {
      this.save_message()
      this.save_message = null
    }
    if (this.autosave_message) {
      this.autosave_message()
      this.autosave_message = null
    }
  },
  methods: {
    openExamples () {
      this.$refs.samplesheet.openSamplesheet()
    },
    submit () {
      var self = this
      var id = this.id
      var action = !this.create ? 'put' : 'post'
      var url = !this.create ? '/api/submission_types/' + id + '/' : '/api/submission_types/'
      this.errors = {}
      this.$axios[action](url, this.type)
        .then(function (response) {
          console.log(response)
          self.$q.notify({message: 'Submission type successfully saved.', type: 'positive'})
          self.remove_autosave()
          if (self.create) {
            self.$router.push({name: 'submission_type', params: {id: response.data.id}})
          }
          self.$store.dispatch('fetchTypes', {axios: self.$axios})
        })
        .catch(function (error, stuff) {
          // raise different exception if due to invalid credentials
          console.log('ERROR', error.response)
          if (error.response) {
            self.errors = error.response.data
          }
          self.$q.notify('Error saving submission type!')
        })
      if (this.save_message) {
        this.save_message()
        this.save_message = null
      }
    },
    add_status (status) {
      if (this.type.statuses.indexOf(status) === -1) {
        this.type.statuses.push(status)
      }
    },
    delete_type () {
      var self = this
      if (this.type.id && this.type.submission_count === 0) {
        this.$axios.delete(`/api/submission_types/${this.type.id}/`)
          .then(function (response) {
            self.$router.push({name: 'submission_types'})
          })
          .catch(function () {
            self.$q.notify('Error deleting submission type!')
          })
      }
    },
    delete_status (status) {
      if (confirm(`Are you sure you want to delete "${status}"?`)) {
        this.type.statuses.splice(this.type.statuses.indexOf(status), 1)
      }
    },
    remove_autosave () {
      window.localStorage.removeItem(this.type_key)
    },
    get_autosave () {
      var jsonified = window.localStorage.getItem(this.type_key)
      return jsonified ? window.JSON.parse(jsonified) : null
    },
    autosave () {
      console.log('autosave!', this.type)
      this.type.updated = Date.now()
      window.localStorage.setItem(this.type_key, window.JSON.stringify(this.type))
    },
    load_autosave () {
      var saved = this.get_autosave()
      if (saved) {
        Vue.set(this, 'type', this.get_autosave())
      }
    },
    notify_autosave () {
      var autosave = this.get_autosave()
      var self = this
      if (autosave) {
        if (!this.create && this.type.updated && Date.parse(this.type.updated) > autosave.updated) {
          return
        }
        this.autosave_message = this.$q.notify({
          message: `An unsaved version was found.  Would you like to load it?`,
          timeout: 0, // in milliseconds; 0 means no timeout
          type: 'info',
          position: 'top', // 'top', 'left', 'bottom-left' etc.
          actions: [
            {
              label: 'Restore',
              handler: () => {
                try {
                  console.log('loading autosave', autosave)
                  Vue.set(self, 'type', autosave)
                  self.$q.notify({message: 'Submission type loaded.', type: 'positive', position: 'top'})
                } catch {
                  self.$q.notify({message: 'There was an error restoring the submission type.', type: 'negative'})
                }
              }
            },
            {
              label: 'Ignore',
              handler: () => {
                self.remove_autosave()
              }
            }

          ]
        })
      }
    }
  },
  computed: {
    next_internal_id () {
      var n = this.type.next_id + ''
      var suffix = n.length >= 4 ? n : new Array(4 - n.length + 1).join('0') + n
      return this.type.prefix + suffix
    },
    error_message (field) {
      return this.errors[field]
    },
    next_id_error () {
      var error = ''
      if (this.errors['next_id']) {
        error += this.errors['next_id'].join(', ')
      }
      if (this.errors['prefix']) {
        error += this.errors['prefix'].join(', ')
      }
      return error === '' ? false : error
    },
    type_key () {
      return this.id && this.id !== 'create' ? `submission_type_${this.id}` : 'submission_type'
    }
  },
  watch: {
    'type': {
      handler (newVal, oldVal) {
        if (!this.watch_changes) {
          return
        }
        // if (window.JSON && window.JSON.stringify) { // && (!newVal.updated || Date.now() - newVal.updated < 5000)
        //   clearTimeout(this.autosave_timeout)
        //   this.autosave_timeout = setTimeout(this.autosave, 10000)
        // }
        if (this.save_message) {
          return
        }
        var self = this
        this.save_message = this.$q.notify({
          message: `Changes have been detected.  Please save to keep your work.`,
          timeout: 0, // in milliseconds; 0 means no timeout
          type: 'info',
          position: 'bottom', // 'top', 'left', 'bottom-left' etc.
          actions: [
            {
              label: 'Save',
              handler: () => {
                self.submit()
              }
            }
          ]
        })
      },
      deep: true
    }
  },
  components: {
    SchemaForm,
    Agschema,
    draggable
  }
}
</script>
<style>
.inactive {
  color: red;
}
