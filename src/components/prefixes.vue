<template>
  <div v-if="$store.getters.isLoggedIn">
    Prefixes:
    {{prefixes}}
    <q-table
      title="Prefixes"
      :data="prefixes"
      :columns="columns"
      row-key="id"
    />
  </div>
</template>

<script>
export default {
  props: ['lab'],
  data () {
    return {
      prefixes: [],
      columns: [
        { name: 'prefix', label: 'Prefix', field: 'prefix', sortable: true },
        { name: 'next_id', label: 'Sequence #', field: 'next_id', sortable: true },
        { name: 'num_digits', label: '# Digits', field: 'num_digits', sortable: true },
        { name: 'generate_id', label: 'Next ID', field: 'generate_id', sortable: false }
      ]
    }
  },
  methods: {
    loadPrefixes () {
      var self = this
      this.$axios.get(`/api/prefixes/?lab_id=${this.lab.id}`)
        .then(
          function (response) {
            self.$q.notify({message: 'Got the prefixes.'})
            self.prefixes = response.data.results
          })
        .catch(
          function () {
            self.$q.notify({message: 'Error getting prefixes.', type: 'negative'})
          }
        )
    }
  },
  mounted () {
    this.loadPrefixes()
  },
  watch: {
    lab: function (lab) {
      console.log('lab', lab)
      this.loadPrefixes()
    }
  }
}
</script>
