<template>
    <div></div>
</template>

<script>
import Vue from 'vue'
import axios from 'axios'
export default Vue.extend({
  data () {
    return {
      version: null
    }
  },
  methods: {
    checkVersion () {
      axios
        .get('/version.json')
        .then((response) => {
          if (!this.version) {
            this.version = response.data.version
            this.poll()
          } else if (this.version !== response.data.version) {
            this.outOfDate()
          } else {
            this.poll()
          }
        })
        .catch(() => {
          this.poll()
        })
    },
    poll () {
      setTimeout(this.checkVersion, 600000) // poll every 10 minutes
    },
    outOfDate () {
      this.$q.notify({
        message: 'There is a new version available, please refresh this page.',
        icon: 'cloud_download',
        closeBtn: 'Refresh',
        color: "negative",
        timeout: 0,
        onDismiss () {
          location.reload(true)
        }
      })
    }
  },
  mounted () {
    this.poll()
  }
})

</script>

<style scoped>
</style>
