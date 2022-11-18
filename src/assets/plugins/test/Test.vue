<template>
  <div>
    Config: {{config}}
    Submission: {{submission.id}}
  </div>
</template>

<script>
export default {
  props: ['submission', 'config'],
  data () {
    return {
    }
  },
  methods: {
  },
  mounted () {
  },
  computed: {
  }
}
</script>
