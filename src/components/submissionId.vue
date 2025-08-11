<template>
  <div>
    <div v-if="!edit">
      <span v-if="internal_id">{{internal_id}} </span><span v-else>Not Assigned </span> <q-btn size="sm" label="Modify" @click="edit=true"/>
    </div>
    <div v-else>
      <q-select
        v-if="!custom"
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
      <span v-else>
        <q-input label="Custom Project ID" v-model="custom_id"/><q-btn label="assign" @click="assignCustomId()" :disable="!custom_id"/>
      </span>
      <q-checkbox v-model="email" label="Email submitter"/>
      <q-checkbox v-model="custom" label="Custom"/>
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
      custom_id: this.value ? this.value : null,
      email: true,
      custom: false,
      edit: false,
      project_ids: []
    }
  },
  methods: {
    idChanged () {
      var self = this
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
    assignCustomId () {
      if (!confirm('Custom IDs should only be used for special cases where assigning from a designated project ID series will not work.  Please confirm that you want to assign a custom ID.')) {
        return false
      }
      this.$axios.post(`/api/submissions/${this.submission.id}/update_id/`, {custom_id: this.custom_id, email: this.email})
        .then(response => {
          this.$q.notify({message: response.data.message, type: 'positive'})
          this.internal_id = response.data.internal_id
          this.$emit('input', this.internal_id)
          this.edit = false
        })
        .catch(error => {
          this.$q.notify({message: 'ID assignment failed: ' + error.response.data.message, type: 'negative'})
          this.project_id = null
          this.edit = false
        })
    },
    loadProjectIds () {
      var self = this
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
