<template>
  <div v-if="$store.getters.isLoggedIn">
    {{lab}}
    {{prefixes}}
  </div>
</template>

<script>
export default {
  props: ['lab'],
  data () {
    return {
      prefixes: []
    }
  },
  methods: {
    loadPrefixes () {
      var self = this
      this.$axios.get(`/api/prefixes/?lab_id=${this.lab.id}`)
        .then(
          function (response) {
            self.prefixes = response
          })
        .catch(
          function () {
            self.$q.notify({message: 'Error getting prefixes.', type: 'negative'})
          }
        )
    }
  },
  watch: {
    lab: function (lab) {
      console.log('lab', lab)
    }
  }
}
</script>
