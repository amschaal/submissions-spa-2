<template>
    <q-input
      v-model="text"
      filled
      type="textarea"
      style="width:100%"
      @update:model-value="onInput"
    />
</template>
<script>

export default {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  data () {
    return {
      text: this.modelValue
    }
  },
  methods: {
    onInput () {
      this.$emit('update:modelValue', this.text)
    }
  },
  mounted () {
    // Vue.nextTick(() => {
    // })
  }
}
</script>
