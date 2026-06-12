<template>
    <div class="date">
      <!-- <q-datetime :ref="'input'" v-model="value" type="date" @update:model-value="close"/> -->
      <q-input v-model="date" :rules="[ v => !v || /^\d{4}-\d{2}-\d{2}$/.test(v) || 'Date should be in format YYYY-MM-DD' ]" ref="input">
        <template v-slot:append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
              <q-date v-model="date" @update:model-value="onInput" mask="YYYY-MM-DD"/>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
</template>

<script>
import { nextTick } from 'vue'

export default {
  props: ['modelValue'],
  emits: ['update:modelValue'],
  data () {
    return {
      date: this.modelValue
    }
  },
  methods: {
    getValue () {
      return this.modelValue.substr(0, 10)
    },
    onInput () {
      this.$refs.qDateProxy.hide()
      this.$emit('update:modelValue', this.date)
      // this.close()
    },
    close () {
    }
  },
  created () {
    // console.log('date', this, this.params)
    // this.modelValue = this.params.value
  },
  mounted () {
    // Vue.nextTick(() => {
    //   console.log('date mounted', this, this.params)
    //   this.modelValue = this.params.value
    //   if (this.$refs.input) {
    //     this.$refs.input.show()
    //   }
    // })
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
