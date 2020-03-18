<template>
    <div class="boolean">
      <q-checkbox v-model="value" />
    </div>
</template>

<script>
import Vue from 'vue'

export default Vue.extend({
  data () {
    return {
      value: null
    }
  },
  methods: {
    getValue () {
      return this.value
    },
    setValue (value) {
      if (!value) return
      this.value = value
      // this.params.onNumberChanged()
    }
  },
  created () {
    this.value = this.params.value
  }
  // ,
  // mounted () {
  //   Vue.nextTick(() => {
  //     if (this.$refs.input) {
  //       this.$refs.input.select()
  //     }
  //   })
  // }
})

</script>

<style scoped>
</style>
