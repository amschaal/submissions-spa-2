<template>
  <q-modal v-model="opened" :content-css="{minWidth: '30vw', minHeight: '30vh'}" ref="modal">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-toolbar-title>
          {{title}}!!!
        </q-toolbar-title>
      </q-toolbar>
    <div class="layout-padding">
      <!-- Widget options:  {{fields}} {{value}} {{data}} {{WidgetClass.schema}} -->
      <div v-for="(v, i) in fields" :key="i">
        <q-field
          :error="hasError(v.variable)"
          :error-label="error(v.variable)"
        >
          <q-input v-model="data[v.variable]" :stack-label="v.label" />
        </q-field>
      </div>
    </div>
    <q-toolbar slot="footer">
      <q-toolbar-title>
        <q-btn
          color="positive"
          @click="save()"
          label="Save"
        />
        <q-btn
          @click="opened = false"
          label="Cancel"
          color="negative"
        />
      </q-toolbar-title>
    </q-toolbar>
  </q-modal-layout>
  </q-modal>
</template>

<script>
// import Vue from 'vue'
import _ from 'lodash'
export default {
  props: ['fields', 'variable', 'schema', 'value', 'title'],
  data () {
    return {
      data: _.cloneDeep(this.value),
      opened: false,
      errors: {}
    }
  },
  mounted: function () {
  },
  methods: {
    save () {
      this.$emit('input', this.data)
      this.close()
    },
    open () {
      this.errors = {}
      this.data = _.cloneDeep(this.value)
      this.opened = true
    },
    close () {
      this.opened = false
    },
    hasError (variable) {
      return this.errors && this.errors[variable]
    },
    error (variable) {
      return this.errors[variable] ? this.errors[variable].join(', ') : ''
    }
  },
  components: {
  }
}
</script>
