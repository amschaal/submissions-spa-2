<template>
  <div>
      <q-btn class="pull-right" color="primary" @click="show_help = true" label="Help" icon="fas fa-question-circle" v-if="type && type.submission_help"><q-tooltip ref="help_tooltip">Click for help with {{type.name}}</q-tooltip></q-btn>
      <div v-html="$store.getters.lab.submission_page" v-if="$store.getters.lab.submission_page"></div>
      <q-checkbox v-model="debug" label="Debug" v-if="$store.getters.isStaff && false" />
        <span v-if="debug">
          warnings: {{this.warnings}}
        </span>
<!-- v-if="submission.participants && user_options && !create" -->
      <fieldset v-if="!id && $store.getters.isStaff">
        <legend>Submission import</legend>
        <q-banner dense class="text-white bg-light-blue" rounded v-if="imported">
          Importing from <a target="_blank" :href="imported.url">{{imported.internal_id}}: {{imported.type.name}}</a>
        </q-banner>
          <q-input
          :label-width="12"
          hint="You may import an existing submission, make modifications, and create a new submission."
          v-model="import_url" placeholder="Enter existing submission URL here (https://....../submissions/abcd12345678)">
          <template v-slot:append>
            <q-btn label="Import" @click="loadImport(import_url)"/>
          </template>
          </q-input>
      </fieldset>
          <q-select
            outlined
            emit-value map-options
            label="Participants"
            label-width="2"
            color="grey"
            options-selected-class="selected"
            :error="hasError('type')"
            bottom-slots :error-message="errorMessage('type')"
            v-if="isAdmin && user_options && submission.participants"
            multiple
            v-model="submission.participants"
            :options="user_options"
          />
        <fieldset>
          <legend>Please select the submission type</legend>
          <q-select
            outlined
            emit-value map-options
            :error="hasError('type')"
            bottom-slots :error-message="errorMessage('type')"
            class="required"
            label="* Submission Type"
            stack-label
            v-model="submission.type"
            :options="type_options"
            :disable="submission.id != undefined"
          />
      </fieldset>
        <fieldset>
        <legend>PI</legend>
        <div class="row">
          <div class="col-sm-6 col-md-6 col-lg-3 q-pa-sm">
            <q-input
              :error="hasError('pi_first_name')"
              bottom-slots :error-message="errorMessage('pi_first_name')"
              v-model="submission.pi_first_name"
              type="text"
              class="required"
              stack-label label="* PI First Name"
              />
          </div>
          <div class="col-sm-6 col-md-6 col-lg-3 q-pa-sm">
            <q-input
              :error="hasError('pi_last_name')"
              bottom-slots :error-message="errorMessage('pi_last_name')"
              v-model="submission.pi_last_name"
              type="text"
              class="required"
              stack-label label="* PI Last Name"
              />
          </div>
          <div class="col-sm-12 col-md-6 col-lg-3 q-pa-sm">
              <q-input
                v-model="submission.pi_email"
                :error="hasError('pi_email')"
                bottom-slots :error-message="errorMessage('pi_email')"
                type="text"
                class="required"
                stack-label label="* PI Email"
                />
          </div>
          <div class="col-sm-12 col-md-6 col-lg-3 q-pa-sm">
              <q-input
                :error="hasError('pi_phone')"
                bottom-slots :error-message="errorMessage('pi_phone')"
                v-model="submission.pi_phone"
                type="text"
                class="required"
                stack-label label="* PI phone"
                />
          </div>
          <div class="col-sm-12 col-md-12 col-lg-12 q-pa-sm">
            <q-input
              :error="hasError('institute')"
              bottom-slots :error-message="errorMessage('institute')"
              v-model="submission.institute" type="text" class="required" stack-label label="* Institute"
              />
          </div>
        </div>
      </fieldset>
      <fieldset>
      <legend>Submitter (<a class="link" @click="copyPI">Copy from PI</a>)</legend>
        <div class="row">
          <div class="col-sm-6 col-md-6 col-lg-3 q-pa-sm">
            <q-input
              :error="hasError('first_name')"
              bottom-slots :error-message="errorMessage('first_name')"
              v-model="submission.first_name"
              type="text"
              stack-label label="* First name"
              />
          </div>
          <div class="col-sm-6 col-md-6 col-lg-3 q-pa-sm">
            <q-input
              :error="hasError('last_name')"
              bottom-slots :error-message="errorMessage('last_name')"
              v-model="submission.last_name"
              type="text"
              stack-label label="* Last name"
              />
          </div>
          <div class="col-sm-12 col-md-6 col-lg-3 q-pa-sm">
            <q-input
              :error="hasError('email')"
              bottom-slots :error-message="errorMessage('email')"
              v-model="submission.email"
              type="email"
              :disable="submission.id != undefined"
              stack-label label="* Email"
              />
          </div>
          <div class="col-sm-12 col-md-6 col-lg-3 q-pa-sm">
            <q-input
              :error="hasError('phone')"
              bottom-slots :error-message="errorMessage('phone')"
              v-model="submission.phone"
              type="text"
              stack-label label="* Submitter phone"
              />
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Additional Contacts (<a @click="addContact" class="link">Add</a>)</legend>
        <div class="row" v-for="(c, index) in submission.contacts" :key="index">
          <div class="col-sm-12 col-md-4 col-lg-4 q-p-xl">
            <q-input
              :error="hasContactError(index,'first_name')"
              bottom-slots :error-message="getContactError(index,'first_name')"
              v-model="c.first_name"
              type="text"
              stack-label label="* First Name"
              />
          </div>
          <div class="col-sm-12 col-md-4 col-lg-4">
             <q-input
               :error="hasContactError(index,'last_name')"
               bottom-slots :error-message="getContactError(index,'last_name')"
               v-model="c.last_name"
               type="text"
               stack-label label="* Last Name"
               />
          </div>
          <div class="col-sm-12 col-md-4 col-lg-4">
            <q-input
              :error="hasContactError(index,'email')"
              bottom-slots :error-message="getContactError(index,'email')"
              v-model="c.email"
              type="text"
              stack-label label="* Email"
              />
            <q-btn @click="removeContact(index)" color="negative" label="remove"/>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend>Payment</legend>
        <!-- <UCDAccount v-model="submission.payment" :errors="errors.payment"/> -->
        <!-- <PPMS v-model="submission.payment" :errors="errors.payment"/> -->
        <Account v-model="submission.payment" :errors="errors.payment || {}"/>
        <!-- <div class="row">
          <div class="col-sm-12 col-md-6">
            <q-field
              :error="errors.payment_type"
              bottom-slots :error-message="errors.payment_type"
            >
              <q-select
                float-label="Select"
                v-model="submission.payment_type"
                :options="[
                  {label: 'Credit Card', value: 'Credit Card'},
                  {label: 'DaFIS', value: 'DaFIS'}
                ]"
                stack-label label="* Payment Type"
              />
            </q-field>
          </div>
          <div class="col-sm-12 col-md-6">
            <q-field
              :error="errors.payment_info"
              bottom-slots :error-message="errors.payment_info"
            >
              <q-input v-model="submission.payment_info" type="text" stack-label label="Payment Info"/>
            </q-field>
          </div>
        </div> -->
      </fieldset>
      <fieldset>
        <legend>Submission Information</legend>
        <p v-if="!type.id" class="error">***Please select submission type at the top of the form before filling in sample information***</p>
        <CustomFields v-model="submission.submission_data" :schema="submission.submission_schema || type.submission_schema" ref="submission_fields" v-if="type && type.submission_schema" :errors="errors.submission_data" :warnings="errors.warnings ? errors.warnings.submission_data : {}" modify="true"/>
<!--        <q-field
          :error="sample_data_error"
          bottom-slots :error-message="sample_data_error_label"
          :warning="sample_data_warning"
          warning-label="Samples contain warnings"
          v-if="type && type.sample_schema && type.sample_schema.order && type.sample_schema.order.length"
          hint="Click on the Samples button to enter sample information"
          class="q-pb-xl q-mb-xl"
          borderless
        >
          <template v-slot:control>
            <Agschema
              v-model="submission.sample_data"
              :schema="sample_schema"
              :type="type"
              :editable="true"
              :allow-examples="true"
              :allow-force-save="true"
              ref="samplesheet"
              v-if="type && type.sample_schema"
              :submission="submission"
              v-on:warnings="updateWarnings"
              v-on:errors="updateErrors"/>
            <q-btn :label="'Samples ('+submission.sample_data.length+')'"  @click="openSamplesheet" />
          </template>
        </q-field> -->
          <q-input
            :error="hasError('comments')"
            bottom-slots :error-message="errorMessage('comments')"
            v-model="submission.comments" type="textarea"
            stack-label label="Special Instructions / Comments"
            autogrow
            rows="1"
            class="q-mt-xl q-pt-xl"
          />
      </fieldset>
      <q-checkbox v-model="submission.biocore" label="I want the Bioinformatics Core to analyze my data" />
        <q-card-actions>
          <q-btn @click="submit" color="positive" label="Submit"></q-btn>
          <q-btn @click="saveDraft" v-if="!id" label="Save Draft"></q-btn>
          <q-btn v-if="submission.id" label="Cancel" color="negative" class="float-right" @click="$router.push({name: 'submission', params: {id: submission.id}})"/>
          <q-btn color="primary" @click="show_help = true" label="Help" icon="fas fa-question-circle" v-if="type && type.submission_help"><q-tooltip>Click for help with {{type.name}}</q-tooltip></q-btn>
        </q-card-actions>
        <q-dialog v-model="show_help">
          <q-card>
            <q-toolbar>
              Submission Help
            </q-toolbar>

            <q-card-section>
              <div v-html="type.submission_help" v-if="type && type.submission_help"></div>
            </q-card-section>
            <q-card-actions align="right" class="text-primary">
              <q-btn
                color="primary"
                @click="show_help = false"
                label="Close"
              />
            </q-card-actions>
          </q-card>
        </q-dialog>

        <!-- <q-modal v-model="show_help">
          <q-modal-layout>
            <q-toolbar slot="header">
              <q-toolbar-title>
                Submission Help
              </q-toolbar-title>
            </q-toolbar>
            <div class="layout-padding">
              <div v-html="type.submission_help" v-if="type && type.submission_help"></div>
              <q-btn
                color="primary"
                @click="show_help = false"
                label="Close"
              />
            </div>
          </q-modal-layout>
        </q-modal> -->
      </div>
</template>

<script>
import './docs-input.styl'
// import axios from 'axios'
// import Samplesheet from '../../components/samplesheet.vue'
// import Agschema from '../../components/agschema.vue'
import CustomFields from '../../components/forms/customFields.vue'
import Account from '../../components/payment/ucdAccount.vue'
// import PPMS from '../../components/payment/ppms.vue'
// import Files from '../../components/files.vue'
import Vue from 'vue'
import _ from 'lodash'

export default {
  // name: 'submission',
  props: ['id', 'submission_types', 'create'],
  data () {
    return {
      submission: {'submission_data': {}, 'contacts': [], biocore: false, 'payment': {}},
      errors: {contacts: [], payment: {}, warnings: {}},
      warnings: {},
      // submission_types: [{ foo: 'bar' }],
      // type_options: this.$store.getters.typeOptions,
      type: Object.freeze({}),
      type_id: null, // from query params ?type=, will force form to use type
      debug: false,
      user_options: null,
      show_help: false,
      payment: {},
      draft: null,
      messages: [],
      imported: null,
      import_url: ''
      // create: false
    }
  },
  mounted: function () {
    var self = this
    this.$q.loading.show({
      delay: 400 // ms
    })
    function init () {
      if (!self.$store.getters.types.length) {
        setTimeout(init, 500)
      } else {
        self.initialize()
      }
    }
    init()
    // if (!this.$store.getters.types.length) {
    //   setTimeout(init_timeout, 2000)
    //   // this.initialize()
    // } else {
    //   this.initialize()
    // }
  },
  beforeDestroy: function () {
    if (this.draft_message) {
      this.draft_message()
    }
    this.messages.forEach(m => m())
  },
  methods: {
    initialize: function () {
      var submission = window.localStorage.getItem('submission')
      var self = this
      if (!this.create) {
        // this.$axios
        //   .get(`/api/submissions/${self.id}/`)
        //   .then(function (response) {
        //     console.log('response', response)
        //     if (!response.data.sample_data) {
        //       response.data.sample_data = []
        //     }
        //     self.submission = response.data
        //     Vue.set(self.submission, 'type', response.data.type.id)
        //   })
        this.loadSubmission(this.id)
      } else {
        this.import = !this.id && this.$route.query.import ? this.$route.query.import : null
        console.log('import', this.import)
        this.draft = !this.id && this.$route.query.draft ? this.$route.query.draft : null
        if (this.import) {
          this.loadImport()
        } else if (this.draft) {
          this.loadDraft(this.draft)
        } else if (submission && window.JSON && window.JSON.parse) {
          var message = this.$q.notify({
            message: `An unsaved draft was found.  Would you like to load it?`,
            timeout: 0, // in milliseconds; 0 means no timeout
            type: 'info',
            position: 'top', // 'top', 'left', 'bottom-left' etc.
            actions: [
              {
                label: 'Restore',
                handler: () => {
                  try {
                    self.submission = window.JSON.parse(submission)
                    this.$q.notify({message: 'Submission restored.', type: 'positive', position: 'top'})
                  } catch {
                    this.$q.notify({message: 'There was an error restoring the submission.', type: 'negative'})
                  }
                }
              },
              {
                label: 'Ignore',
                handler: () => {
                  self.removeCached()
                }
              }

            ]
          })
          this.messages.push(message)
          // if (confirm('An unsaved draft was found.  Would you like to load it?')) {
          //   this.submission = window.JSON.parse(submission)
          // } else {
          //   this.removeCached()
          // }
        }
        console.log('draft', this.draft)
      }
      this.type_id = !this.id && this.$route.query.type ? this.$route.query.type : null
      if (this.type_id) {
        this.submission.type = this.type_id
      }
      if (this.submission.type) {
        if (this.submission.type.id) {
          this.submission.type = this.submission.type.id
        } else {
          this.type = this.$store.getters.typesDict[this.submission.type]
        }
      }

      // this.$axios
      //   .get('/api/submission_types/?show=true')
      //   .then(function (response) {
      //     console.log('response', response)
      //     console.log('id', self.id)
      //     self.type_options = response.data.results.map(opt => ({label: opt.name, value: opt.id}))
      //     self.submission_types = response.data.results
      //     if (self.create) {
      //       self.$axios
      //         .get('/api/submissions/' + self.id)
      //         .then(function (response) {
      //           console.log('response', response)
      //           self.submission = response.data
      //           Vue.set(self.submission, 'type', response.data.type.id)
      //         })
      //     }
      //   })
      if (this.$store.getters.isStaff) {
        this.$axios
          .get('/api/users/?show=true')
          .then(function (response) {
            self.user_options = response.data.results.map(opt => ({label: `${opt.first_name} ${opt.last_name}`, value: opt.id}))
          })
      }
      this.$q.loading.hide()
    },
    // openSamplesheet () {
    //   if (!this.type || !this.type.sample_schema) {
    //     this.$q.dialog({
    //       title: 'Alert',
    //       message: 'Please select a submission type first.'
    //     })
    //   } else {
    //     this.$refs.samplesheet.openSamplesheet()
    //   }
    // },
    updateWarnings (warnings) {
      console.log('update', warnings)
      // Vue.set(this.error.warnings, 'sample_data', warnings)
    },
    updateErrors (errors) {
      console.log('update errors', errors)
      // Vue.set(this.errors, 'sample_data', errors)
    },
    removeCached () {
      window.localStorage.removeItem('submission')
    },
    submit () {
      var self = this
      var id = this.submission.id
      var action = this.create ? 'post' : 'put'
      var url = !this.create ? `/api/submissions/${id}/` : '/api/submissions/'
      // var url = !this.create ? '/api/submissions/' + id + '/update/' : '/api/submit/'
      this.$axios[action]('' + url, this.submission)
        .then(function (response) {
          console.log('submit', response)
          // self.errors = {}
          // self.warnings = {}
          self.submission = response.data
          Vue.set(self, 'errors', response.data.data.errors)
          // Vue.set(self, 'warnings', response.data.data.warnings)
          // console.log(response)
          self.$q.notify({message: 'Submission successfully saved.', type: 'positive'})
          self.$emit('submission_updated', self.submission)
          // if (self.create) {
          if (self.draft_message) {
            self.draft_message()
          }
          self.removeCached()
          self.$router.push({name: 'submission', params: {id: response.data.id}, query: {created: self.create}})
          // }
        })
        .catch(function (error, stuff) {
          // raise different exception if due to invalid credentials
          console.log('ERROR', error.response)
          var message = error.response.data.detail || 'There were errors saving your submission.'
          self.$q.notify({message: message, type: 'negative'})
          if (error.response.data.warnings && !self.submission.ignore_warnings) {
            self.$q.notify({
              message: 'There are warnings in your submission.',
              timeout: 10000, // in milliseconds; 0 means no timeout
              type: 'warning',
              // position: 'bottom', // 'top', 'left', 'bottom-left' etc.
              actions: [
                {
                  label: 'Ignore warnings',
                  handler: () => {
                    self.submission.ignore_warnings = true
                  }
                }
              ]
            })
          }
          if (error.response) {
            // Vue.set(self, 'errors', error.response.data)
            self.errors = error.response.data
            Vue.set(self.errors, 'payment', error.response.data.payment || {})
          }
          throw error
        })
    },
    loadDraftMessage () {
      console.log(this.draft_message, this.draft)
      if (!this.draft_message && this.draft) {
        var page = window.location.href // self.$router.query.page
        if (!this.$route.query.draft) {
          page += '?draft=' + this.draft
        }
        var self = this
        this.draft_message = this.$q.notify({
          message: `This is a draft.  In order to make it a submission, you must first click on the submit button at the bottom of the form and ensure that the form submits without errors.  You may refer to this draft by the following URL: ${page}`,
          timeout: 0, // in milliseconds; 0 means no timeout
          type: 'info',
          position: 'top', // 'top', 'left', 'bottom-left' etc.
          actions: [
            {
              label: 'Dismiss',
              handler: () => {
                self.draft_message()
                self.draft_message = null
              }
            }
          ]
        })
      }
    },
    saveDraft () {
      var self = this
      var action = !this.draft ? 'post' : 'put'
      var url = this.draft ? `/api/drafts/${this.draft}/` : '/api/drafts/'
      // var url = !this.create ? '/api/submissions/' + id + '/update/' : '/api/submit/'
      this.$axios[action]('' + url, {data: this.submission})
        .then(function (response) {
          console.log('saveDraft', response)

          self.$q.notify({message: `Draft saved.`, type: 'positive'})
          self.draft = response.data.id
          self.loadDraftMessage()
          // self.$router.push({name: 'submission', params: {id: response.data.id}, query: {created: self.create}})
          // }
        })
        .catch(function (error, stuff) {
          // raise different exception if due to invalid credentials
          console.log('ERROR', error)
          self.$q.notify({message: 'There were errors saving your draft.', type: 'negative'})
          throw error
        })
    },
    loadDraft: function (id) {
      var self = this
      this.$axios
        .get(`/api/drafts/${id}/`)
        .then(function (response) {
          console.log('response', response)
          // if (!response.data.sample_data) {
          //   response.data.data.sample_data = []
          // }
          self.submission = response.data.data
          self.loadDraftMessage()
          // Vue.set(self.submission, 'type', response.data.type.id)
        }).catch(function (error, stuff) {
          self.$q.notify({message: `No draft was found with ID: ${id}`, type: 'negative'})
          self.draft = null
          self.$router.push({name: 'create_submission'})
          throw error
        })
    },
    loadImport: function (url) {
      if (url) {
        this.import = url
      }
      var self = this
      this.$axios
        // .get(`${self.import}/`)
        .get(`/api/imports/get_submission/?url=${self.import}`)
        .then(function (response) {
          var imported = response.data.data
          // Rather than getting the url directly, which may have security restrictions, proxy through server which will clean the following.
          var type = imported['type']
          self.imported = _.cloneDeep(imported)
          delete imported['id']
          delete imported['type']
          delete imported['submission_schema']
          delete imported['sample_schema']
          delete imported['participants']
          delete imported['received_by']
          delete imported['samples_received']
          var internalID = imported['internal_id']
          delete imported['internal_id']
          if (imported.contacts) {
            for (var i in imported.contacts) {
              delete imported.contacts[i]['id']
            }
          }
          imported['import_internal_id'] = internalID
          imported['import_data'] = _.cloneDeep(self.imported)
          console.log('import response', response.data)
          self.submission = imported
          self.$q.notify({message: `Submission information from submission "${internalID}: ${type.name}" loaded.  Please select the target type and attempt saving the import.`, type: 'positive', timeout: 15000})
          // self.loadDraftMessage()
          // Vue.set(self.submission, 'type', response.data.type.id)
        }).catch(function (error, stuff) {
          self.$q.notify({message: `Unable to load import from url: ${self.import}`, type: 'negative'})
          self.$router.push({name: 'create_submission'})
          throw error
        })
    },
    loadSubmission: function (id) {
      var self = this
      this.$axios
        .get(`/api/submissions/${id}/`)
        .then(function (response) {
          console.log('response', response)
          // if (!response.data.sample_data) {
          //   response.data.sample_data = []
          // }
          self.submission = response.data
          Vue.set(self, 'errors', {contacts: [], payment: {}, warnings: response.data.warnings})
          // Vue.set(self, 'warnings', response.data.warnings || {})
          Vue.set(self.submission, 'type', response.data.type.id)
        })
    },
    addContact () {
      this.submission.contacts.push({})
      console.log('contacts', this.submission.contacts)
    },
    removeContact (index) {
      this.submission.contacts.splice(index, 1)
    },
    hasContactError (index, field) {
      return this.getContactError(index, field) !== ''
    },
    getContactError (index, field) {
      if (this.errors && this.errors.contacts && this.errors.contacts[index] && this.errors.contacts[index][field]) {
        return this.errors.contacts[index][field].join(', ')
      }
      return ''
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
    // assignType (id) {
    //   for (var i in this.submission_types) {
    //     if (this.submission_types[i].id === id) {
    //       // console.log('type', this.submission_types[i])
    //       this.type = this.submission_types[i]
    //     }
    //   }
    // },
    copyPI () {
      Vue.set(this.submission, 'first_name', this.submission.pi_first_name)
      Vue.set(this.submission, 'last_name', this.submission.pi_last_name)
      Vue.set(this.submission, 'phone', this.submission.pi_phone)
      Vue.set(this.submission, 'email', this.submission.pi_email)
    },
    flashHelpTooltip () {
      var self = this
      // this.$refs.help_tooltip.show()
      setTimeout(function () {
        console.log('tooltip', self.$refs.help_tooltip)
        self.$refs.help_tooltip.show()
      }, 250)
      setTimeout(function () {
        console.log('tooltip', self.$refs.help_tooltip)
        self.$refs.help_tooltip.hide()
      }, 5000)
    }
  },
  watch: {
    'submission.type': function (id) {
      // this.assignType(id)
      console.log('type dict', id, this.$store.getters.typesDict[id])
      this.type = id ? Object.freeze(this.$store.getters.typesDict[id]) : Object.freeze({})
      console.log('type changed', id, this.type, this.$store.getters.typesDict)
      if (this.type.submission_help) {
        this.flashHelpTooltip()
      }
      // this.type = this.submission.type
      // this.submission.type = this.type.id
    },
    'submission': {
      handler (newVal, oldVal) {
        console.log('submission changed')
        if (window.JSON && window.JSON.stringify && !newVal.id) {
          window.localStorage.setItem('submission', window.JSON.stringify(newVal))
        }
        // console.log('submission saved', window.localStorage.getItem('submission'))
      },
      deep: true
    },
    'id': function (id) {
      console.log('form id', id)
      this.loadSubmission(id)
    },
    'create': function (create) {
      console.log('form create', create)
      this.loadSubmission(create ? null : this.id)
    }
    // 'id': function (id) {
    //   var self = this
    //   if (self.id && self.id !== 'create') {
    //     self.$axios
    //       .get('/api/submissions/' + self.id)
    //       .then(function (response) {
    //         console.log('response', response)
    //         self.submission = response.data
    //         Vue.set(self.submission, 'type', response.data.type.id)
    //       })
    //   } else {
    //     this.submission = {'sample_data': [{}, {}]}
    //   }
    // }
  },
  computed: {
    // sample_schema () {
    //   if (this.type && this.type.sample_schema) {
    //     return Object.freeze(Object.assign({}, this.type.sample_schema))
    //   } else {
    //     return {}
    //   }
    // },
    error_message (field) {
      return this.errors[field]
    },
    // sample_data_warning () {
    //   return this.errors.warnings && this.errors.warnings.sample_data && _.size(this.errors.warnings.sample_data) > 0
    // },
    // sample_data_error () {
    //   return this.errors && this.errors.sample_data && _.size(this.errors.sample_data) > 0
    // },
    // sample_data_error_label () {
    //   return _.size(this.submission.sample_data) > 0 ? 'Samples contain errors.' : 'Please click on the Samples button and enter at least 1 sample.'
    // },
    type_options () {
      return this.$store.getters.typeOptions
    },
    isAdmin () {
      return this.submission.permissions && this.submission.permissions.indexOf('ADMIN') !== -1
    }
    // type_options () {
    //   return this.submission_types.map(opt => ({label: opt.name, value: opt.id}))
    // }

  },
  components: {
    // Agschema,
    // Agschema: () => import('../../components/agschema.vue'),
    CustomFields,
    Account
    // UCDAccount
    // PPMS
  }
}
</script>
<style scoped>
  .q-field {
    padding: 0px 0px;
  }
  .link {
    color: -webkit-link;
    cursor: pointer;
    text-decoration: underline;
  }
  /* This isn't working.... */
  .required .q-if-label .q-if-label-inner, .required .q-field-label .q-field-label-inner {
    font-weight: bold !important;
  }
  .docs-input .q-field {
    margin: 2px 0px;
  }
  fieldset {
    margin-top: 12px;
    border: 1px solid #006daf;
    padding: 12px;
    border-radius: 8px;
    padding-bottom: 20px;
  }
  legend {
    color: #006daf;
    font-style: italic;
    padding-left: 12px;
    padding-right: 12px;
  }
  .error {
    color: var(--q-color-negative);
  }
</style>
