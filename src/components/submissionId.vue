<template>
  <div>
    <div v-if="!edit">
      <span v-if="internal_id">{{internal_id}} </span><span v-else>Not Assigned </span> <q-btn size="sm" label="Modify" @click="edit=true"/>
    </div>
    <div v-else>
      <q-select
        dense
        v-model="project_id"
        :options="project_ids"
        option-value="id"
        :option-label="opt => `${opt.generate_id}`"
        emit-value
        map-options
        label="Assign Project ID"
        @input="idChanged()"
      />
      <q-checkbox v-model="email" label="Email submitter"/>
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
      project_id: null,
      email: true,
      edit: false,
      project_ids: []
    }
  },
  methods: {
    idChanged () {
      const self = this
      console.log('status', this.status)
      this.$axios.post(`/api/submissions/${this.submission.id}/update_id/`, {project_id: this.project_id, email: this.email})
        .then(function (response) {
          self.$q.notify({message: response.data.message, type: 'positive'})
          self.internal_id = response.data.internal_id
          self.$emit('input', self.internal_id)
          self.edit = false
        })
        .catch(function (response) {
          self.$q.notify({message: 'ID assignment failed!', type: 'negative'})
          self.project_id = null
          self.edit = false
        })
    },
    loadProjectIds () {
      const self = this
      this.$axios.get(`/api/project_ids/?lab_id=${this.submission.lab.id}`)
        .then(
          function (response) {
            self.project_ids = response.data.results
          })
        .catch(
          function () {
            self.$q.notify({message: 'Error getting project ids.', type: 'negative'})
          }
        )
    }
  },
  mounted () {
    this.loadProjectIds()
  }
}
</script>
