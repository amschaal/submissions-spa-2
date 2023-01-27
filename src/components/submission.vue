<template>
  <div>
        <div class="row">
          <div class="field col-12 q-mt-xs q-mb-xs" v-if="submission.import_data">
            <q-banner dense class="text-white bg-light-blue" rounded>
              Imported from <a target="_blank" :href="submission.import_data.url">{{submission.import_data.internal_id}}: {{submission.import_data.type.name}}</a>
            </q-banner>
          </div>
          <div class="field col-12 q-mt-xs q-mb-xs">
            <SamplesReceived v-if="submission.id" v-model="submission" :admin="$perms.hasSubmissionPerms(submission, ['ADMIN','STAFF'], 'ANY')"/>
          </div>
          <div class="field col-12 q-mt-xs q-mb-xs" v-if="hasWarnings">
          <q-banner dense class="text-white bg-warning" rounded>
              There are warnings associated with this submission.
          </q-banner>
          </div>
          <div v-if="$route.query.created" class="field col-12 q-mt-xs q-mb-xs">
              <q-banner dense class="text-white bg-positive" rounded>
              <p>Submission Created!</p>
              <pre id="confirmation">{{submission_type.confirmation_text}}</pre>
            </q-banner>
          </div>
          <div class="col-sm-12 col-lg-12 q-mt-sm q-mb-sm">
            <div class="row">
              <div class="col-lg-12">
                <q-btn v-if="canModify" label="Modify" class="float-right q-ml-xs" @click="$router.push({name: 'modify_submission', params: {id: submission.id}})"/>
                <q-btn label="Print" class="float-right q-ml-xs" @click="$router.push({name: 'print_submission', params: {id: submission.id}})"/>
                <Lock v-if="submission.id && isAdmin" :submission="submission" class="float-right q-ml-xs"/>
                <Cancel v-if="submission.id && canCancel" :submission="submission" class="float-right q-ml-xs"/>
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="field col-sm-12 col-md-6">
            <p class="caption">Status</p>
            <StatusSelector v-model="submission.status" :submission="submission" v-if="submission.id && isAdmin"/><span v-else-if="submission.status">{{submission.status}}</span><span v-else>None</span>
          </div>
          <div class="field col-sm-12 col-md-6">
            <p class="caption">Project ID</p>
            <SubmissionId v-model="submission.internal_id" :submission="submission" v-if="submission.id && isAdmin"/><span v-else-if="submission.internal_id">{{submission.internal_id}}</span><span v-else>Not assigned</span>
          </div>
          <div class="field col-sm-12 col-md-6">
            <p class="caption">Type</p>
            {{submission_type.name}}
          </div>
          <div class="field col-sm-12 col-md-6">
            <p class="caption">Submitted</p>
            {{submission.submitted|formatDate}}
          </div>
          <div class="field col-sm-12 col-md-12" v-if="isAdmin">
            <p class="caption">Participants</p>
            <participants :submission="submission"/>
            <!-- <userField v-model="submission.participants" v-if="submission.id && isAdmin"/>
            <span v-else-if="submission.participants"></span> -->
          </div>
        </div>
        <div class="row">
          <div class="field col-sm-6 col-md-6 col-lg-2">
            <p class="caption">First Name</p>
            {{submission.first_name}}
          </div>
          <div class="field col-sm-6 col-md-6 col-lg-2">
            <p class="caption">Last Name</p>
            {{submission.last_name}}
          </div>
          <div class="field col-sm-12 col-md-6 col-lg-4">
            <p class="caption">Email</p>
            {{submission.email}}
          </div>
          <div class="field col-sm-12 col-md-6 col-lg-4">
            <p class="caption">Phone</p>
            {{submission.phone}}
          </div>
        </div>
        <div class="row">
          <div class="field col-sm-6 col-md-6 col-lg-2">
            <p class="caption">PI First Name</p>
            {{submission.pi_first_name}}
          </div>
          <div class="field col-sm-6 col-md-6 col-lg-2">
            <p class="caption">PI Last Name</p>
            {{submission.pi_last_name}}
          </div>
          <div class="field col-sm-12 col-md-6 col-lg-4">
            <p class="caption">PI Email</p>
            {{submission.pi_email}}
          </div>
          <div class="field col-sm-12 col-md-6 col-lg-4">
            <p class="caption">PI Phone</p>
            {{submission.pi_phone}}
          </div>
          <div class="field col-sm-12 col-md-4 col-lg-4">
            <p class="caption">Institute</p>
            {{submission.institute}}
          </div>
          <div class="field col-sm-12 col-md-8 col-lg-8">
            <p class="caption">Special Instructions / Comments</p>
            {{submission.comments}}
          </div>
        </div>
        <p class="caption" v-if="submission.contacts && submission.contacts.length">Additional Contacts:</p>
        <div class="row" v-for="(c, index) in submission.contacts" :key="index">
          <div class="field col-sm-12 col-md-12 col-lg-4">
            <p class="caption">First name</p>
            {{c.first_name}}
          </div>
          <div class="field col-sm-12 col-md-12 col-lg-4">
            <p class="caption">Last name</p>
            {{c.last_name}}
          </div>
          <div class="field col-sm-12 col-md-12 col-lg-4">
            <p class="caption">Email</p>
            {{c.email}}
          </div>
        </div>
        <p class="caption">Payment</p>
        <div class="row">
          <div class="field col-sm-12 col-md-6" v-for="(value, label) in submission.payment.display" :key="label">
            <p class="caption">{{label}}</p>
            {{value}}
          </div>
          <!-- <div class="field col-sm-12 col-md-6">
            {{submission.payment_type}}
          </div>
          <div class="field col-sm-12 col-md-6">
            <p class="caption">Payment information</p>
            {{submission.payment_info}}
          </div> -->
        </div>
        <div class="row" v-if="submission.biocore">
          <div class="field col-sm-12">
            <q-icon size="18px" name="check_circle" color="green"/> Bioinformatics Core to analyze data
          </div>
        </div>
        <CustomFields v-model="submission.submission_data" :schema="submission_schema" ref="submission_fields" :warnings="submission.warnings ? submission.warnings.submission_data : {}" v-if="submission_schema" :modify="false"/>
          <!-- <Samplesheet v-model="submission.sample_data" :type="type"/> -->
        <!-- <Agschema v-model="submission.sample_data" :type="submission_type" :editable="false" ref="samplesheet" v-if="submission_type && submission_type.sample_schema" :submission="submission"/> -->
        <!-- <q-icon size="25px" name="warning" v-if="hasWarnings" color="warning" title="Samples contain warnings."/> -->
        <!-- <q-btn :label="'Samples ('+submission.sample_data.length+')'"  @click="openSamplesheet"/> -->
        <div class="row" v-if="submission.id">
          <div class="col-lg-12">
            <q-btn class="float-right" label="Create copy" description="Create a new submission using data from this submission." @click="copySubmission"/>
            <q-btn label="Download" @click="download()"  class="float-right"/>
              <q-select
                v-model="downloadParams.format"
                :options="formatOptions"
                v-if="downloadParams.data !== 'all'"
                class="float-right"
                map-options emit-value
              />
              <q-select
                v-model="downloadParams.data"
                :options="dataOptions"
                class="float-right"
                map-options emit-value
              />
          </div>
        </div>

      </div>
</template>

<script>
// import './docs-input.styl'
// import Agschema from './agschema.vue'
import CustomFields from './forms/customFields.vue'
import StatusSelector from './statusSelector.vue'
import SubmissionId from './submissionId.vue'
import Lock from './lock.vue'
import Cancel from './cancel.vue'
import SamplesReceived from './samplesReceived.vue'
import participants from './participants.vue'
// import Vue from 'vue'
import _ from 'lodash'

export default {
  // name: 'submission',
  props: ['id', 'submission'],
  data () {
    return {
      downloadParams: {'data': 'all', 'format': 'xlsx'}
    }
  },
  // mounted: function () {
  //   console.log('mounted')
  //   var self = this
  //
  //   self.$axios
  //     .get('/api/submissions/' + self.id)
  //     .then(function (response) {
  //       console.log('response', response)
  //       self.submission = response.data
  //       // self.$axios
  //       //   .get(`/api/submission_types/${self.submission.type}/`)
  //       //   .then(function (response) {
  //       //     self.type = response.data
  //       //   })
  //     })
  // },
  methods: {
    // openSamplesheet () {
    //   if (!this.submission_type || !this.submission_type.sample_schema) {
    //     this.$q.dialog({
    //       title: 'Alert',
    //       message: 'Please select a submission type first.'
    //     })
    //   } else {
    //     this.$refs.samplesheet.openSamplesheet()
    //   }
    // },
    download () {
      window.location.href = `/server/api/submissions/${this.submission.id}/download/?format=${this.downloadParams.format}&data=${this.downloadParams.data}`
    },
    copySubmission () {
      this.$router.push({ name: 'create_submission', query: { import: window.location.href } })
      // window.location.href = window.location.href + '?import=' + window.location.href
    }
  },
  computed: {
    submission_type () {
      if (this.submission && this.submission.type && this.submission.type.id) {
        return this.submission.type
      } else if (this.submission && this.submission.type) {
        return this.$store.getters.typesDict[this.submission.type]
      }
      return {}
    },
    submission_schema () {
      if (this.submission && this.submission.submission_schema) {
        return this.submission.submission_schema
      } else if (this.submission_type) {
        return this.submission_type
      } else {
        return null
      }
    },
    hasWarnings () {
      return this.submission && this.submission.warnings && _.size(this.submission.warnings) > 0
    },
    formatOptions () {
      var options = [
        {
          label: 'XLSX',
          value: 'xlsx'
        },
        {
          label: 'TSV',
          value: 'tsv'
        }
      ]
      if (this.downloadParams.data === 'all') {
        return [options[0]]
      } else {
        return options
      }
    },
    dataOptions () {
      var opts = [
        {
          label: 'All (XLSX)',
          value: 'all'
        },
        {
          label: 'Submission',
          value: 'submission'
        }
      ]
      for (var i in this.submission.submission_schema.order) {
        var v = this.submission.submission_schema.order[i]
        if (this.submission.submission_schema.properties[v].type === 'table') {
          opts.push({ label: this.submission.submission_schema.properties[v].title || v, value: v })
        }
      }
      return opts
    },
    canCancel () {
      return this.submission && !this.submission.cancelled && (!this.submission.locked || this.isAdmin)
    },
    canModify () {
      return !this.submission.locked || this.isAdmin
      // return this.submission.editable && !submission.cancelled
    },
    isAdmin () {
      return this.submission && this.submission.permissions && this.submission.permissions.indexOf('ADMIN') !== -1
    }
  },
  components: {
    // Agschema,
    CustomFields,
    StatusSelector,
    Lock,
    Cancel,
    SamplesReceived,
    SubmissionId,
    participants
  }
}
</script>
<style scoped>
  .q-field {
    padding: 0px 0px;
  }
  .field {
    margin-bottom: 0px;
  }
  div.row div p.caption {
    margin: 0 0 5px;
    font-weight: bold;
  }
  pre#confirmation {
    white-space: pre-wrap;
  }
  .caption {
    font-weight: bold;
  }
</style>
