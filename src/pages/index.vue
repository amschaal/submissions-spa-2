<template>
  <q-page padding class="docs-input row justify-center">

    <q-card v-if="institution">
      <q-card-section>
        {{institution.name}}
      </q-card-section>

      <q-separator />
      <q-card-section>
        <div v-html="institution.home_page" v-if="institution.home_page"></div>
        <div v-else><h4>Welcome to the sample submission system of {{ institution.name }}!  To begin, please select a service core or lab below.</h4></div>
        <!-- <p>Welcome to the DNA Technologies Core new online submission portal. Please use this platform for all project submission for Nanopore and 10X (Genome and Single Cell assays).</p>
        <p>These steps will assure the trouble-free processing of your projects: Make sure that your lab has an account with the Genome Center and PPMS. We require a Genome Center account for each PI/lab/company before receiving samples and soon we will be migrating to PPMS for billing. Setting up the account is a simple process of entering contact information for the PI and a financial administrator. Please see "setting up your account and billing" here: <a href="https://dnatech.genomecenter.ucdavis.edu/getting-started/">https://dnatech.genomecenter.ucdavis.edu/getting-started/</a></p>
        <p>Before submitting samples, please check the sample requirements page: <a href="https://dnatech.genomecenter.ucdavis.edu/sample-requirements/">https://dnatech.genomecenter.ucdavis.edu/sample-requirements/</a> to plan your project accordingly. The sample shipping instructions on this page: <a href="https://dnatech.genomecenter.ucdavis.edu/sample-submission-scheduling/">https://dnatech.genomecenter.ucdavis.edu/sample-submission-scheduling/</a> Please consult our extensive FAQs first in case of questions. We do offer free consultations. Please contact us at <b>dnatech@ucdavis.edu</b> if you have further questions.</p>
        <router-link :to="{ name: 'create_submission' }">Click here</router-link> to start sample submission.
      -->
      <q-select
        filled
        v-model="lab"
        :options="labs"
        option-value="lab_id"
        option-label="name"
        emit-value
        map-options
        style="min-width: 250px; max-width: 300px"
        v-if="labs.length"
        @input="goToLab"
        label="Select Core"
      />
    </q-card-section>
  </q-card>
  </q-page>
</template>

<style>
</style>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'PageIndex',
  data () {
    return {
      lab: this.$store.getters.labId
    }
  },
  mounted () {
    console.log('mount labs', this.labs)
    this.isOnlyLab()
  },
  methods: {
    goToLab () {
      this.$router.push({ name: 'lab', params: { lab_id: this.lab } })
    },
    isOnlyLab () {
      console.log('checkLabs', this.labs)
      if (this.labs && this.labs.length === 1) {
        this.lab = this.labs[0].lab_id
        this.goToLab()
      }
    }
  },
  computed: mapGetters(['institution', 'labs']),
  watch: {
    labs: function (val) {
      this.isOnlyLab()
    }
  }
}
</script>
