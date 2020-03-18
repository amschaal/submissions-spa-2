<template>
    <div class="date">
      <q-datetime :ref="'input'" v-model="value" type="date" @input="close"/>
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
      return this.value.substr(0, 10)
    },
    close () {
      this.params.stopEditing()
    }
  },
  created () {
    this.value = this.params.value
  },
  mounted () {
    Vue.nextTick(() => {
      if (this.$refs.input) {
        this.$refs.input.show()
      }
    })
  }
})

</script>

<style scoped>
    .date {
        margin: 2px
    }
    .date input {
      width: 100%;
    }
</style>
