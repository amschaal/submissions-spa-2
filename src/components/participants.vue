<template>
  <div>
    <userField v-model="participants" @input="update"/>
  </div>
</template>

<script>
import userField from './forms/userField.vue'
export default {
  props: ['submission'],
  components: {
    userField
  },
  data () {
    return {
      participants: this.submission.participants
    }
  },
  methods: {
    update () {
      var self = this
      this.$axios.post(`/api/submissions/${this.submission.id}/update_participants/`, { participants: this.participants })
        .then(function (response) {
          self.$q.notify({message: 'Participants updated.', type: 'positive'})
        })
        .catch(function (response) {
          self.$q.notify({message: 'Error: Unable to update participants!', type: 'negative'})
        })
    }
  }
}

</script>
