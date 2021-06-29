<template>
  <div>
    <div v-if="!edit">
      <span v-if="value">{{value}} </span><span v-else>None </span> <q-btn size="sm" label="Modify" @click="edit=true"/>
    </div>
    <div v-else>
      <q-select
        label="Set Status"
        v-model="status"
       :options="statusOptions"
       @input="statusChanged()"
       map-options emit-value
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
      status: this.value ? this.value : null,
      email: false,
      options: this.$store.getters.statusOptions,
      edit: false
    }
  },
  methods: {
    statusChanged () {
      var self = this
      console.log('status', this.status)
      this.$axios.post(`/api/submissions/${this.submission.id}/update_status/`, {status: this.status, email: this.email})
        .then(function (response) {
          self.$q.notify({message: response.data.message, type: 'positive'})
          self.$emit('input', self.status)
        })
        .catch(function (response) {
          self.$q.notify({message: 'Status update failed!', type: 'negative'})
          self.status = self.value ? self.value.id : null
        })
    }
  },
  computed: {
    statusOptions () {
      return this.submission.type.statuses.map(t => ({label: t, value: t}))
    }
  }
}
</script>
