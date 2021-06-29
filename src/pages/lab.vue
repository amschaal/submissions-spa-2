<template>
  <q-page padding class="docs-input row justify-center">

    <q-card v-if="default_lab">
      <q-card-section>
        {{default_lab.name}} Sample Submissions
      </q-card-section>

      <q-separator />
      <q-card-section>
        <div v-html="default_lab.home_page" v-if="default_lab.home_page"></div>
        <!-- <p>Welcome to the DNA Technologies Core new online submission portal. Please use this platform for all project submission for Nanopore and 10X (Genome and Single Cell assays).</p>
        <p>These steps will assure the trouble-free processing of your projects: Make sure that your lab has an account with the Genome Center and PPMS. We require a Genome Center account for each PI/lab/company before receiving samples and soon we will be migrating to PPMS for billing. Setting up the account is a simple process of entering contact information for the PI and a financial administrator. Please see "setting up your account and billing" here: <a href="https://dnatech.genomecenter.ucdavis.edu/getting-started/">https://dnatech.genomecenter.ucdavis.edu/getting-started/</a></p>
        <p>Before submitting samples, please check the sample requirements page: <a href="https://dnatech.genomecenter.ucdavis.edu/sample-requirements/">https://dnatech.genomecenter.ucdavis.edu/sample-requirements/</a> to plan your project accordingly. The sample shipping instructions on this page: <a href="https://dnatech.genomecenter.ucdavis.edu/sample-submission-scheduling/">https://dnatech.genomecenter.ucdavis.edu/sample-submission-scheduling/</a> Please consult our extensive FAQs first in case of questions. We do offer free consultations. Please contact us at <b>dnatech@ucdavis.edu</b> if you have further questions.</p>
        <router-link :to="{ name: 'create_submission' }">Click here</router-link> to start sample submission.
      -->
        <q-btn :to="{ name: 'create_submission' }" label="Create Submission"></q-btn>
    </q-card-section>
  </q-card>
  </q-page>
</template>

<style>
</style>

<script>
export default {
  name: 'PageLab',
  computed: {
    default_lab () {
      return this.$store.getters.lab
    }
  }
}
</script>
