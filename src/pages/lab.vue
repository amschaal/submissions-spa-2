<template>
  <q-page padding class="docs-input row justify-center">

    <q-card v-if="default_lab">
      <q-card-section>
        {{default_lab.name}} Sample Submissions
      </q-card-section>

      <q-separator />
      <q-card-section>
        <div v-safe-html="default_lab.home_page" v-if="default_lab.home_page"></div>
        <!-- <p>Welcome to the DNA Technologies Core new online submission portal. Please use this platform for all project submission for Nanopore and 10X (Genome and Single Cell assays).</p>
        <p>These steps will assure the trouble-free processing of your projects: Make sure that your lab has an account with the Genome Center and PPMS. We require a Genome Center account for each PI/lab/company before receiving samples and soon we will be migrating to PPMS for billing. Setting up the account is a simple process of entering contact information for the PI and a financial administrator. Please see "setting up your account and billing" here: <a href="https://dnatech.genomecenter.ucdavis.edu/getting-started/">https://dnatech.genomecenter.ucdavis.edu/getting-started/</a></p>
        <p>Before submitting samples, please check the sample requirements page: <a href="https://dnatech.genomecenter.ucdavis.edu/sample-requirements/">https://dnatech.genomecenter.ucdavis.edu/sample-requirements/</a> to plan your project accordingly. The sample shipping instructions on this page: <a href="https://dnatech.genomecenter.ucdavis.edu/sample-submission-scheduling/">https://dnatech.genomecenter.ucdavis.edu/sample-submission-scheduling/</a> Please consult our extensive FAQs first in case of questions. We do offer free consultations. Please contact us at <b>dnatech@ucdavis.edu</b> if you have further questions.</p>
        <router-link :to="{ name: 'create_submission' }">Click here</router-link> to start sample submission.
      -->
        <!-- Signed-out visitors are sent to sign in first and then on to the form. -->
        <q-btn :to="{ name: 'create_submission', params: { lab_id: $route.params.lab_id } }" :label="signedIn ? 'Create Submission' : 'Sign in to create a submission'"></q-btn>
    </q-card-section>
  </q-card>
  <q-card v-else-if="notFound">
    <q-card-section>
      <h1 class="text-h5 q-my-none">Lab not found</h1>
      <p class="q-mt-md">There is no lab at this address.</p>
      <q-btn flat color="primary" label="All labs" :to="{ name: 'index' }" />
    </q-card-section>
  </q-card>
  </q-page>
</template>

<style>
</style>

<script>
export default {
  name: 'PageLab',
  data () {
    return {
      publicLab: null, // what a signed-out visitor may see: the lab's name and welcome text
      notFound: false
    }
  },
  mounted () {
    if (!this.signedIn) {
      // This page is public.  The store's lab needs a signed-in user, so a
      // visitor gets the public view of it instead.
      const self = this
      this.$axios.get(`/api/public/labs/${encodeURIComponent(this.$route.params.lab_id)}/`)
        .then(function (response) {
          self.publicLab = response.data
        })
        .catch(function (error) {
          self.notFound = !!error.response && error.response.status === 404
        })
    }
  },
  computed: {
    signedIn () {
      return this.$store.getters.isLoggedIn
    },
    default_lab () {
      return this.signedIn ? this.$store.getters.lab : this.publicLab
    }
  }
}
</script>
