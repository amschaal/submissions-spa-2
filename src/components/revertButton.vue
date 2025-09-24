<template>
  <q-btn label="revert" color="red" @click="revert()"/>
</template>

<script>
export default {
  props: ['version', 'objectUrl', 'revertUrl'],
  data () {
    return {
    }
  },
  mounted: function () {
  },
  methods: {
    revert () {
      if (!confirm(`Are you sure you want to revert to the version from ${this.version.revision.date_created}?`)) {
        return
      }
      this.$axios
        .post(this.revertUrl)
        .then(({ data }) => {
          // this.$q.notify({message: `Version reverted to ${version.revision.date_created}, please refresh this page.`})
          this.$q.notify({
            message: `Reverted to version from ${this.version.revision.date_created}.`,
            color: "positive"
          })
          if (this.objectUrl) {
            this.$router.push(`${this.objectUrl}?reverted_to=${this.version.id}`)
          }
        })
        .catch(error => {
          console.log(error)
          this.$q.notify({message: 'Unable to revert to version'})
        })
    }
  }
}
</script>
