<template>
  <!-- <q-modal v-model="opened" :content-css="{minWidth: '30vw', minHeight: '30vh'}" ref="modal">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-toolbar-title>
          {{title}}!!!
        </q-toolbar-title>
      </q-toolbar>
    <div class="layout-padding">
      <div v-for="(v, i) in fields" :key="i">
        <q-field
          :error="hasError(v.variable)"
          :error-label="error(v.variable)"
        >
          <q-input v-model="data[v.variable]" stack-label :label="v.label" />
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
  </q-modal> -->

  <q-dialog v-model="opened" :content-css="{minWidth: '30vw', minHeight: '30vh'}" ref="modal">
    <q-card>
      <q-bar>
        {{title}}
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section v-if="opened">
        {{fields}}
        <div v-for="(v, i) in fields" :key="i">
          <q-field
            :error="hasError(v.variable)"
            :error-label="error(v.variable)"
          >
            <q-input v-model="data[v.variable]" stack-label :label="v.label" />
          </q-field>
        </div>
      </q-card-section>
      <q-card-actions align="right">
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
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
// import Vue from 'vue'
import _ from 'lodash'
export default {
  props: ['fields', 'variable', 'schema', 'value', 'title', 'WidgetClass'],
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
      this.errors = this.widget.validateOptions(this.data, this.variable, this.schema)
      console.log('save', this.errors, this.data)
      if (this.errors && !_.isEmpty(this.errors)) {
        return
      }
      this.$emit('input', this.data)
      this.close()
    },
    open () {
      this.errors = {}
      this.data = _.cloneDeep(this.value)
      this.widget = new (this.WidgetClass)(this.variable, this.data)
      console.log('widget', this.widget, this.WidgetClass)
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
