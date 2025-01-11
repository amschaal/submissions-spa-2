<template>
    <div class="date">
      <!-- mask="date" :rules="['date']" -->
      <q-input v-model="value" ref="input">
        <template v-slot:append>
          <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
            <q-date v-model="value" @input="onInput" mask="YYYY-MM-DD"/>
          </q-popup-proxy>
        </template>
      </q-input>
    </div>
</template>

<script>
import { nextTick } from 'vue'

export default {
  data () {
    return {
      value: null
    }
  },
  methods: {
    getValue () {
      return this.value.substr(0, 10)
    },
    onInput () {
      this.$refs.qDateProxy.hide()
      this.close()
    },
    close () {
      this.params.stopEditing()
    }
  },
  created () {
    console.log('date', this, this.params)
    this.value = this.params.value
  },
  mounted () {
    nextTick(() => {
      if (this.$refs.input) {
        // this.$refs.input.show()
        this.$refs.qDateProxy.show()
      }
    })
  }
}

</script>

<style scoped>
    .date {
        margin: 2px
    }
    .date input {
      width: 100%;
    }
</style>
