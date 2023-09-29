<template>
    <q-input
      v-model="text"
      filled
      type="textarea"
      style="width:100%"
      @input="onInput"
    />
</template>
<script>
import Vue from 'vue'

export default Vue.extend({
  props: ['value'],
  data () {
    return {
      text: this.value
    }
  },
  methods: {
    onInput () {
      this.$emit('input', this.text)
    }
  },
  mounted () {
    // Vue.nextTick(() => {
    // })
  }
})
</script>
