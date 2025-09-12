<template>
  <q-page padding class="docs-input row justify-center" v-if="$store.getters.lab">
    <q-card style="width:100%">
      <q-card-section>
        <span v-if="!version_id">
        <q-btn @click="delete_type" color="negative" label="Delete" class="q-ml-sm float-right" v-if="type.id && can_modify"  :disable="type.submission_count !== 0" title="Only types with no associated permissions may be deleted."/>
        <q-btn :to="{ name: 'create_submission_type', query: { copy_from: type.id } }" label="Copy" v-if="type.id && can_modify" class="q-ml-sm float-right"/>
        </span>
        <VersionModal v-if="this.id" :versions-url="`/api/submission_types/${this.id}/versions/`" class="q-ml-sm float-right" :object-id="id" view-router-name="submission_type_version"/>
        <router-link v-if="type.submission_count > 0 && type.id" :to="{'name': 'submissions', 'query': { 'search': type.name }}" class="float-right">{{type.submission_count}} Submissions</router-link>
        <div><b><span v-if="!type.id">Create</span> Submission Type <span v-if="type.id && type.name"> - <i>{{ type.name }}</i></span><span class="inactive" v-if="type.id && !type.active"> (Inactive)</span></b></div>
        <div v-if="version_id" class="text-primary"><b>This is a specific version of the submission type.  You may work from it and save it as the current version, or you may <router-link v-if="type.id && type.prefix" :to="{'name': 'submission_type', 'params': {'id': id}}">load the current version</router-link>.</b></div>
        <b v-if="!can_modify"> (Viewing with read only permissions)</b>
      </q-card-section>
      <!-- <q-btn :to="{ name: 'create_submission_type', query: { copy_from: type.id } }" label="Copy" v-if="type.id"/> -->
      <q-separator />
      <q-card-section>
        <q-field
          dense
          label="Active"
          stack-label
          :error="hasError('active')"
          :error-message="errorMessage('active')"
          borderless
        >
          <q-checkbox v-model="type.active" label="Should this type be available for submission?"/>
        </q-field>
        <div class="row">
          <q-input
            dense
            label="Sort order"
            hint="Submission types will be displayed in numeric order as specified by this field"
            :error="hasError('sort_order')"
            :error-message="errorMessage('sort_order')"
            v-model="type.sort_order" type="integer"
            class="col"
            />
            <q-input
              dense
              label="Identifier"
              :error="hasError('prefix')"
              :error-message="errorMessage('prefix')"
              v-model="type.prefix"
              type="text"
              class="col"
              >
              <template v-slot:hint>
                Identifier can be used to link directly to a form for the submission type. <router-link v-if="type.id && type.prefix" :to="{'name': 'create_submission', 'params': {'lab_id': $store.getters.lab.lab_id}, 'query': { 'type': type.prefix }}">Direct link</router-link>
              </template>
            </q-input>
        </div>
        <q-input
          dense
          label="Name"
          hint="This shows up in the dropdown on the submission form"
          :error="hasError('name')"
          :error-message="errorMessage('name')"
          v-model="type.name"
          type="text"
          />
<!--
        <q-field
          dense
          label="Internal ID"
          stack-label
          :error="next_id_error !== ''"
          :error-message="next_id_error"
          hint="The Prefix is concatenated with the Next ID to create the internal id for the submission."
          borderless
        >
          <q-input dense v-model="type.prefix" type="text" stack-label label="Prefix" class="col"/>
          <q-input dense v-model="type.next_id" type="number" stack-label label="Next ID" class="col"/>
          <div class="col">Next Internal ID:<br><b>{{next_internal_id}}</b></div>
        </q-field>
-->
        <q-select
          dense
          v-model="type.default_id"
          :options="project_ids"
          option-value="id"
          :option-label="opt => `${opt.generate_id}`"
          emit-value
          map-options
          label="Auto-assign Project ID (optional)"
          clearable
        />
        <q-select
          dense
          label="Default participants"
          :error="hasError('type')"
          :error-message="errorMessage('type')"
          v-if="user_options"
          multiple
          v-model="type.default_participants"
          :options="user_options"
          map-options emit-value
        />
        <q-input
          dense
          label="Description"
          :error="hasError('description')"
          :error-message="errorMessage('description')"
          v-model="type.description"
          autogrow
          />
        <q-field
          dense
          label="Statuses"
          :error="hasError('statuses')"
          :error-message="errorMessage('statuses')"
          hint="Add statuses using the dropdown.  Statuses may reordered by dragging."
          borderless
        >
          <!-- <q-chips-input v-model="type.statuses" /> -->
          <q-select
            dense
            v-model="status_option"
            label="Add Status"
            :options="status_options"
            @input="add_status"
            map-options emit-value
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
          stack-label
          :error="hasError('submission_help')"
          :error-message="errorMessage('submission_help')"
          borderless
        >
          <q-editor v-model="type.submission_help"
            :toolbar="toolbar"
            :fonts="fonts"
          />
        </q-field>
        <q-input
          dense
          label="Confirmation Text"
          hint="Text to provide additional instruction to submitter after submission is complete."
          :error="hasError('confirmation_text')"
          :error-message="errorMessage('confirmation_text')"
          v-model="type.confirmation_text"
          autogrow
          />
        <h6>Custom Fields</h6>
        <q-input
        :label-width="12"
        hint="If you want to import a schema from an existing submission type, or submission, enter the URL and click import."
        v-model="import_url" placeholder="Enter existing submission or submission type URL here (https://....../submissions/abcd12345678)">
        <template v-slot:append>
          <q-btn label="Import" @click="importSchema(import_url)"/>
        </template>
        </q-input>
        <schemaForm v-model="type.submission_schema" :root-schema="type.submission_schema" :options="{variables: $store.getters.lab.submission_variables, showWidth: true}" type="submission"/>
<!--
        <h5>Samplesheet definition</h5>
        <h6>Column Definitions</h6>
        <schemaForm v-model="type.sample_schema" :options="{variables: $store.getters.lab.sample_variables, showWidth: false}" type="samples"/>
        <div v-if="type && type.sample_schema && type.sample_schema.properties">
          <Agschema v-model="type.sample_schema.examples" :type="type" :editable="true"  ref="samplesheet" :allow-force-save="false"/>
          <q-btn :label="'Configure examples ('+type.sample_schema.examples.length+')'"  @click="openExamples"/>
        </div>
        <q-field
          label="Samplesheet Help"
          stack-label
          :error="hasError('sample_help')"
          :error-message="errorMessage('sample_help')"
          borderless
        >
          <q-editor v-model="type.sample_help"
            :toolbar="toolbar"
            :fonts="fonts"
          />
        </q-field> -->
      </q-card-section>
      <q-separator />
      <q-card-actions>
        <q-btn @click="submit" label="Save" color="primary" v-if="can_modify"></q-btn>
      </q-card-actions>

    </q-card>
  </q-page>

</template>

<script>
import '../components/forms/docs-input.styl'
import SchemaForm from '../components/forms/schemaForm.vue'
import Vue from 'vue'
// import Agschema from '../components/agschema.vue'
import draggable from 'vuedraggable'
import VersionModal from '../components/modals/versionModal.vue'
export default {
  name: 'submission_type',
  props: ['id', 'version_id'],
  data () {
    return {
      type: {active: true, submission_help: '', help: '', statuses: [], default_participants: [], submission_schema: {properties: {}, order: [], required: [], layout: {}, printing: {}}, sample_schema: {properties: {}, order: [], required: [], printing: {}, examples: []}},
      errors: {},
      import_url: null,
      submission_schema: [],
      // examples: [],
      save_message: null,
      watch_changes: false,
      user_options: [],
      project_ids: [],
      status_option: null,
      status_options: [],
      toolbar: [
        ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
        ['token', 'hr', 'link', 'custom_btn'],
        ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
        ['table'],
        [
          {
            label: this.$q.lang.editor.formatting,
            icon: this.$q.iconSet.editor.formatting,
            list: 'no-icons',
            options: [
              'p',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'code'
            ]
          },
          {
            label: this.$q.lang.editor.fontSize,
            icon: this.$q.iconSet.editor.fontSize,
            fixedLabel: true,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'size-1',
              'size-2',
              'size-3',
              'size-4',
              'size-5',
              'size-6',
              'size-7'
            ]
          },
          {
            label: this.$q.lang.editor.defaultFont,
            icon: this.$q.iconSet.editor.font,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'default_font',
              'arial',
              'arial_black',
              'comic_sans',
              'courier_new',
              'impact',
              'lucida_grande',
              'times_new_roman',
              'verdana'
            ]
          },
          'removeFormat'
        ],
        ['undo', 'redo'],
        ['fullscreen'],
        ['viewsource']
      ],
      fonts: {
        arial: 'Arial',
        arial_black: 'Arial Black',
        comic_sans: 'Comic Sans MS',
        courier_new: 'Courier New',
        impact: 'Impact',
        lucida_grande: 'Lucida Grande',
        times_new_roman: 'Times New Roman',
        verdana: 'Verdana'
      }
    }
  },
  mounted: function () {
    // Edit, Create, and Copy from logic is a bit convoluted.  Would be good to clean this up.
    var self = this
    this.init_lab()
    if ((!this.id || this.id === 'create') && !this.version_id) {
      this.create = true
    }
    var id = this.$route.query.copy_from || this.id
    console.log('mounted', this.id, this.create, id, this.$route.query.copy_from)
    // if (this.create) {
    //   this.notify_autosave()
    // }
    if (this.version_id && this.id) {
      this.$q.loading.show()
      this.$axios
        .get(`/api/submission_types/${id}/versions/${this.version_id}/serialize`)
        .then(function (response) {
          self.type = response.data
          self.$q.loading.hide()
        })
    } else if (!this.create || this.$route.query.copy_from) {
      this.$q.loading.show()
      this.$axios
        .get('/api/submission_types/' + id + '/')
        .then(function (response) {
          self.type = response.data
          // if (!self.type.sample_schema.examples) {
          //   self.type.sample_schema.examples = []
          // }
          if (!self.type.submission_schema.printing) {
            Vue.set(self.type.submission_schema, 'printing', {})
          }
          // if (!self.type.sample_schema.printing) {
          //   Vue.set(self.type.sample_schema, 'printing', {})
          // }
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
      .get(`/api/users/?show=true&lab=${this.$store.getters.labId}`)
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
    // openExamples () {
    //   this.$refs.samplesheet.openSamplesheet()
    // },
    init_lab () {
      if (this.$store.getters.lab) {
        this.status_options = this.$store.getters.lab.statuses.map(status => ({label: status, value: status}))
        this.loadProjectIDs()
      }
    },
    submit () {
      var self = this
      var id = this.id
      var action = !this.create ? 'put' : 'post'
      var url = !this.create ? '/api/submission_types/' + id + '/' : '/api/submission_types/'
      if (this.create) {
        this.type.lab = this.$store.getters.lab.id
      }
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
    loadProjectIDs () {
      var self = this
      this.$axios.get(`/api/project_ids/?lab_id=${this.$store.getters.lab.id}`)
        .then(
          function (response) {
            self.project_ids = response.data.results
          })
        .catch(
          function () {
            self.$q.notify({message: 'Error getting project IDs.', type: 'negative'})
          }
        )
    },
    add_status (status) {
      if (this.type.statuses.indexOf(status) === -1) {
        this.type.statuses.push(status)
      }
      this.status_option = null
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
    },
    hasError (field) {
      return this.errors[field] !== undefined
    },
    errorMessage (field) {
      if (this.errors && this.errors[field] && this.errors[field]) {
        return this.errors[field].join ? this.errors[field].join(', ') : this.errors[field]
      }
      return ''
    },
    importSchema (url) {
      if (confirm('Are you sure you want to import a schema from another submission or submission type?  This will overwrite your current schema.')) {
        var self = this
        this.$axios
          .get(`/api/submission_types/get_submission_schema/?url=${url}`)
          .then(function (response) {
            self.type.submission_schema = response.data
            self.$q.notify({ type: 'positive', message: 'Schema has been loaded.  Click save to retain changes'})
          })
          .catch(function () {
            self.$q.notify({ type: 'negative', message: 'Unable to load schema.  Ensure that the URL is a valid submission or submission type URL.'})
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
      return error
    },
    type_key () {
      return this.id && this.id !== 'create' ? `submission_type_${this.id}` : 'submission_type'
    },
    can_modify () {
      return this.$perms.hasLabPerm('MEMBER') || this.$perms.hasLabPerm('ADMIN')
    }
  },
  watch: {
    '$store.getters.lab': function () {
      this.init_lab()
    },
    'type': {
      handler (newVal, oldVal) {
        if (!this.watch_changes || !this.can_modify) {
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
    // Agschema,
    draggable,
    VersionModal
  }
}
</script>
<style>
.inactive {
  color: red;
}
