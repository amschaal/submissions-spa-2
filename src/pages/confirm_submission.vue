<template>
  <q-page padding class="docs-input row justify-center">
    Confirm {{submission}}
  </q-page>
</template>

<script>
export default {
  name: 'confirm_submission',
  props: ['id'],
  data () {
    return {
      submission: {}
    }
  },
  mounted: function () {
    const self = this
    this.$axios
      .get(`/api/submissions/${self.id}/`)
      .then(function (response) {
        console.log('response', response)
        self.submission = response.data
      })
  }
}
</script>
