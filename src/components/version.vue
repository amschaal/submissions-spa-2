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
          this.poll()
          if (!this.version) {
            this.version = response.data.version
            this.poll()
          } else if (this.version !== response.data.version) {
            this.outOfDate()
          } else {
            this.poll()
          }
          console.log('version', response)
        })
        .catch(() => {
          console.log('error getting version')
          this.poll()
        })
    },
    poll () {
      setTimeout(this.checkVersion, 10000)
    },
    outOfDate () {
      this.$q.notify({
        message: 'Out of date, please refresh your page!!!',
        icon: 'cloud_download',
        closeBtn: 'Refresh',
        color: "negative",
        timeout: 36000,
        onDismiss () {
          location.reload(true)
        }
      })
      // alert('Out of date, please refresh your page')
    }
  },
  mounted () {
    this.poll()
  }
})

</script>

<style scoped>
</style>
