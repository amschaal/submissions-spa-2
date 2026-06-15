<template>
    <div></div>
</template>

<script>
import axios from 'axios'
export default {
  methods: {
    checkVersion () {
      axios
        .get('/version.json',
          {
            // query URL without using browser cache
            headers: {
              'Cache-Control': 'no-cache',
              'Pragma': 'no-cache',
              'Expires': '0'
            },
            params: {
              t: new Date().getTime()
            }
          }
        )
        .then((response) => {
          // Compare the deployed build id to the one baked into this bundle.
          const deployed = response.data && (response.data.commit || response.data.builtAt)
          if (deployed && deployed !== process.env.APP_BUILD_ID) {
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
          location.reload()
        }
      })
    }
  },
  mounted () {
    // Only run in production builds that have a baked-in build id; skip in dev
    // (quasar dev doesn't run beforeBuild, so there is no meaningful version.json).
    if (!process.env.PROD || !process.env.APP_BUILD_ID) {
      return
    }
    // First check shortly after load (so an already-newer deploy is caught
    // quickly), then poll on the interval.
    setTimeout(this.checkVersion, 5000)
  }
}

</script>

<style scoped>
</style>
