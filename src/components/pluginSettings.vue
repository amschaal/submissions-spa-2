<template>
  <div>
    <q-checkbox v-model="config.enabled" label="Enabled" />
    <q-btn @click="updateConfig" label="Update"/>
    {{config}}, {{plugin}}!!
  </div>
</template>

<script>
// import userField from './forms/userField.vue'
export default {
  props: ['updateUrl', 'plugin', 'config'],
  components: {
  },
  data () {
    return {
    }
  },
  mounted () {
  },
  methods: {
    updateConfig () {
      var self = this
      this.$axios.post(this.updateUrl, {plugin: this.plugin, config: this.config})
        .then(
          function (response) {
            self.$q.notify({message: 'Plugin updated.', type: 'positive'})
          })
        .catch(
          function () {
            self.$q.notify({message: 'Error updating plugin.', type: 'negative'})
          }
        )
    }
  }
}
</script>
