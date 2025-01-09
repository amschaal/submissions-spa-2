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
    this.$axios
      .get(`/api/submissions/${self.id}/`)
      .then(response => {
        console.log('response', response)
        this.submission = response.data
      })
  }
}
</script>
