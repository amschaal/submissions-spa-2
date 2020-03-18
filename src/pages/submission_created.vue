<template>
  <q-page padding class="docs-input row justify-center">
    Confirm {{submission}}
  </q-page>
</template>

<script>
import Vue from 'vue'

export default {
  name: 'confirm_submission',
  props: ['id'],
  data () {
    return {
      submission: {}
    }
  },
  mounted: function () {
    var self = this
    this.$axios
      .get(`/api/submissions/${self.id}/`)
      .then(function (response) {
        console.log('response', response)
        Vue.set(self, 'submission', response.data)
      })
  }
}
</script>
