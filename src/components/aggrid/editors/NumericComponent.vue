<template>
    <div class="numeric">
        <input @change="onNumberChanged('number', $event)" :ref="'input'" v-model="number" type="number"/>
    </div>
</template>

<script>
import { nextTick } from 'vue'

export default {
  data () {
    return {
      number: null
    }
  },
  methods: {
    onNumberChanged (on, $event) {
      console.log(on, $event)
      // this.params.onNumberChanged()
    },
    getNumeric () {
      return this.number
    },
    getValue () {
      return this.number ? parseFloat(this.number) : this.number
    }
  },
  created () {
    // console.log('created', this.params, this.params.charPress)
    this.number = this.params.value
  },
  mounted (foo) {
    // console.log('NumericComponent', this, foo)
    const char = this.params.charPress
    nextTick(() => {
      this.number = !char || isNaN(char) ? this.params.value : parseInt(char)
      if (this.$refs.input) {
        this.$refs.input.select()
      }
    })
  }
}

</script>

<style scoped>
    .numeric {
        margin: 2px
    }
    .numeric input {
      width: 100%;
    }
</style>
