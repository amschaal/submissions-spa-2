<template>
  <div  class="inline row">
    <div v-if="!edit">
      <span v-if="internal_id">{{internal_id}}</span><span v-else>Not Assigned </span> <q-btn size="sm" label="Modify" @click="edit=true"/>
    </div>
    <div v-else>
      <q-select
        dense
        class="col-10"
        v-model="prefix_id"
        :options="prefixes"
        option-value="id"
        :option-label="opt => `${opt.generate_id}`"
        emit-value
        map-options
        label="Assign Project ID"
        @input="idChanged()"
      />
      <q-checkbox v-model="email" label="Email submitter" class="col-2"/>
      <q-btn size="sm" label="Cancel" color="negative" @click="edit=false"/>
    </div>
</div>
</template>

<script>
export default {
  props: ['value', 'submission'],
  data () {
    return {
      internal_id: this.value ? this.value : null,
      prefix_id: null,
      email: false,
      edit: false,
      prefixes: []
    }
  },
  methods: {
    idChanged () {
      var self = this
      console.log('status', this.status)
      this.$axios.post(`/api/submissions/${this.submission.id}/update_id/`, {prefix_id: this.prefix_id, email: this.email})
        .then(function (response) {
          self.$q.notify({message: response.data.message, type: 'positive'})
          self.$emit('input', response.data.internal_id)
          self.edit = false
        })
        .catch(function (response) {
          self.$q.notify({message: 'ID assignment failed!', type: 'negative'})
          self.prefix_id = null
          self.edit = false
        })
    },
    loadPrefixes () {
      var self = this
      this.$axios.get(`/api/prefixes/?lab_id=${this.submission.lab.id}`)
        .then(
          function (response) {
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
  }
}
</script>
