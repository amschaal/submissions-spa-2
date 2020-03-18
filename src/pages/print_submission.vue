<template>
  <div v-if="submission.type">
    <p class="heading">{{submission.type.name}} - {{submission.internal_id}}</p>
    <table class="full bordered compact submission">
    <tbody>
      <!-- <tr><th>Submitted</th><td>{{getDate(submission.submitted)}}</td><th>ID</th><td>{{submission.internal_id}}</td><th>Type</th><td colspan="3">{{submission.type.name}}</td></tr> -->
      <tr><th>ID</th><td>{{submission.internal_id}}</td><th>Date Samples Received</th><td>{{submission.samples_received|formatDate}}</td><th>Received by</th><td>{{submission.received_by_name}}</td></tr>
      <tr><th>PI</th><td>{{submission.pi_first_name}} {{submission.pi_last_name}}</td><th>PI email</th><td>{{submission.pi_email}}</td><th>PI Phone</th><td>{{submission.pi_phone}}</td></tr>
      <tr><th>Submitter</th><td>{{submission.first_name}} {{submission.last_name}}</td><th>Email</th><td>{{submission.email}}</td><th>Phone</th><td>{{submission.phone}}</td></tr>
      <tr v-for="(p, i) in submission.contacts" :key="i"><th>Additional contact</th><td>{{p.first_name}} {{p.last_name}}</td><th>Email</th><td colspan="3">{{p.email}}</td></tr>
      <tr><th>Institute</th><td colspan="5">{{submission.institute}}</td></tr>
      <tr v-if="submission.notes"><th>Notes</th><td colspan="7">{{submission.notes}}</td></tr>
    </tbody>
    <KeyValueTable :arr="chunk_arr(payment_array(true), 6)"/>
  </table>
    <table class="full bordered compact submission">
    <KeyValueTable :arr="chunk_arr(submission_field_data_array(true), 6)"/>
    <tbody v-if="submission.comments">
      <tr ><th>Special Instructions / Comments</th><td colspan="7">{{submission.comments}}</td></tr>
    </tbody>
    </table>

    <p class="heading">Total Number of Samples: {{submission.sample_data.length}}</p> <!--  page-break-before -->
<table class="horizontal full bordered compact page-break-after">
  <tr>
    <th></th><th :key="variable" v-for="variable in submission.sample_schema.order" v-show="!hidden(submission.sample_schema, variable)">{{getTitle(submission.sample_schema,variable)}}</th>
  </tr>

  <tr :key="index" v-for="(row,index) in submission.sample_data">
    <td>{{index + 1}}</td><td :key="index" v-for="(variable, index) in submission.sample_schema.order" v-show="!hidden(submission.sample_schema, variable)">{{truncate(submission.sample_schema, variable, row[variable])}}</td>
  </tr>
</table>
  </div>
</template>

<script>
import Vue from 'vue'
import { date } from 'quasar'
import KeyValueTable from '../components/keyValueTable.vue'
import _ from 'lodash'
const { formatDate } = date
export default {
  name: 'print_submission',
  props: ['id'],
  data () {
    return {
      submission: {'sample_data': []}
    }
  },
  mounted: function () {
    console.log('mounted')
    var self = this

    this.$axios
      .get(`/api/submissions/${self.id}/`)
      .then(function (response) {
        console.log('response', response)
        if (!response.data.sample_data) {
          response.data.sample_data = []
        }
        // self.submission = response.data
        Vue.set(self, 'submission', response.data)
      })
  },
  methods: {
    getTitle (schema, variable) {
      if (schema.properties[variable].printing && schema.properties[variable].printing.label) {
        return schema.properties[variable].printing.label
      }
      return schema.properties[variable] && schema.properties[variable].title ? schema.properties[variable].title : variable
    },
    truncate (schema, variable, value) {
      if (value && value.substr && schema.properties[variable].printing && schema.properties[variable].printing.truncate_at) {
        return value.substr(0, schema.properties[variable].printing.truncate_at) + ' ..'
      }
      return value
    },
    hidden (schema, variable) {
      // return true
      return schema.properties[variable].printing && schema.properties[variable].printing.hidden
    },
    getDate (timeStamp) {
      return formatDate(timeStamp, 'MM/DD/YYYY')
    },
    chunk_arr (arr, chunkSize = 8) {
      return _.chunk(arr, chunkSize)
    },
    submission_field_data_array (flatten = true) {
      var self = this
      var arr = this.submission.submission_schema.order.map(v => [self.getTitle(self.submission.submission_schema, v), self.truncate(self.submission.submission_schema, v, self.submission.submission_data[v])])
      return flatten ? _.flatten(arr) : arr
    },
    payment_array (flatten = true) {
      var arr = _.toPairs(this.submission.payment.display)
      return flatten ? _.flatten(arr) : arr
    }
  },
  computed: {
  },
  components: {
    KeyValueTable
  }
}
</script>

<style>
/* media="print" */
.full {
  width:100%;
}
td,th{
  text-align: left;
}
.bordered td, .bordered th{
  border: thin solid grey;
  margin: 0px;
  padding: 1px;
}
.bordered{
  border-spacing: 0;
  border-collapse: collapse;
}
.compact th td{
  word-wrap:break-word;
}
.compact td, .compact th{
  font-size:9pt;
}
table.submission td {
  min-width: 5em;
}
.heading{
  text-align:center;
  margin: 10px;
  font-size: 10pt;
  font-weight: bold;
}
.page-break-before{
  page-break-before:  always;
}
.page-break-after{
  page-break-after:  always;
}
/*
.horizontal.compact th{
  word-break: break-word;
}
*/

</style>
<style scoped type="text/css" media="print">
  @page {
    size: landscape;
  }
  body {
    width: 10in;
    font-size: 10pt;
  }
  .full {
    width:100%;
  }
  table {
    margin-bottom: 30px;
  }
</style>
