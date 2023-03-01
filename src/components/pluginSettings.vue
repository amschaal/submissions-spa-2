<template>
  <div>
    <q-checkbox v-model="config.enabled" label="Enabled" />
    <fieldset v-if="form && form.public && form.public.order">
      <legend>Public config</legend>
      <CustomFields v-model="config.public" :schema="form.public" ref="public_config" :errors="errors.public.errors" :modify="true"/>
    </fieldset>
    <fieldset v-if="form && form.private && form.private.order">
      <legend>Private config</legend>
      <CustomFields v-model="config.private" :schema="form.private" ref="private_config" :errors="errors.private.errors" :modify="true"/>
    </fieldset>
    <q-btn @click="updateConfig" label="Update"/>
  </div>
</template>

<script>
// import userField from './forms/userField.vue'
import CustomFields from './forms/customFields.vue'

export default {
  props: ['updateUrl', 'formUrl', 'plugin', 'config'],
  components: {
    CustomFields
  },
  data () {
    return {
      form: null,
      errors: { public: {}, private: {}}
    }
  },
  mounted () {
    var self = this
    this.$axios.get(this.formUrl)
      .then(
        function (response) {
          self.form = response.data.form
        })
      .catch(
        function () {
          self.$q.notify({message: 'Error getting plugin config.', type: 'negative'})
        }
      )
  },
  methods: {
    updateConfig () {
      var self = this
      this.$axios.post(this.updateUrl, {plugin: this.plugin, config: this.config})
        .then(
          function (response) {
            self.$set(self, 'errors', { public: {}, private: {}})
            self.$q.notify({message: 'Plugin updated.', type: 'positive'})
          })
        .catch(
          function (error) {
            self.errors = error.response.data
            self.$q.notify({message: 'Error updating plugin.', type: 'negative'})
          }
        )
    }
  }
}
</script>
