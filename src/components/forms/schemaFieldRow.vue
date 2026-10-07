<template>
  <div class="row">
    <div class="col-1"><slot name="controls"></slot></div>
    <div class="col-1"><q-checkbox dense v-if="field" :aria-label="`${variable} internal`" v-model="field.internal" @update:model-value="toggleRequired"/></div>
    <div class="col-1"><q-checkbox dense :aria-label="`${variable} required`" v-model="schema.required" :val="variable" :disable="field && field.internal"/></div>
    <div class="col-2">{{variable}}</div>
    <div class="col-2"><q-input dense :aria-label="`${variable} name`" v-model="field.title" /></div>
    <div class="col-2">
      <q-select
        dense options-dense
        :aria-label="`${variable} type`"
        v-model="field.type"
        :options="typeOptions"
        map-options emit-value
      />
    </div>
    <div class="col-1" v-if="options.showWidth">
      <q-select
        dense options-dense
        :aria-label="`${variable} column width`"
        map-options emit-value
        :model-value="schema.layout[variable] ? schema.layout[variable].width : null"
        :options="widthOptions"
        @update:model-value="setWidth"
      />
    </div>
    <div class="col-2">
      <SchemaDialog v-if="field.type == 'table'" v-model="field.schema" :root-schema="rootSchema" :variable="{variable, schema: field}"/>
      <fieldoptions v-else style="display:inline-block" :schema="schema" v-model="schema.properties[variable]" :variable="variable" :type="type" :root-schema="rootSchema"/>
      <q-btn label="Delete" color="negative" @click="$emit('delete', variable)"></q-btn>
      <slot name="buttons-after"></slot>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import Fieldoptions from '../fieldoptions.vue'

export const TYPE_OPTIONS = [{ 'label': 'Text', 'value': 'string' }, { 'label': 'Number', 'value': 'number' }, { 'label': 'True / False', 'value': 'boolean' }, { 'label': 'Table', 'value': 'table' }]
export const WIDTH_OPTIONS = [{ 'label': '100%', 'value': 'col-md-12 col-sm-12 col-xs-auto' }, { 'label': '5/6', 'value': 'col-md-10 col-sm-12 col-xs-auto' }, { 'label': '3/4', 'value': 'col-md-9 col-sm-12 col-xs-auto' }, { 'label': '2/3', 'value': 'col-md-8 col-sm-12 col-xs-auto' }, { 'label': '1/2', 'value': 'col-md-6 col-sm-12 col-xs-auto' }, { 'label': '1/3', 'value': 'col-md-4 col-sm-6 col-xs-auto' }, { 'label': '1/4', 'value': 'col-md-3 col-sm-6 col-xs-auto' }, { 'label': '1/6', 'value': 'col-md-2 col-sm-4 col-xs-auto' }]

// One field of a schema in schemaForm. Edits the field (and the schema's
// required/layout entries for it) in place, as schemaForm always has.
export default {
  name: 'schemaFieldRow',
  props: ['schema', 'variable', 'options', 'type', 'rootSchema'],
  emits: ['delete'],
  data () {
    return {
      typeOptions: TYPE_OPTIONS,
      widthOptions: WIDTH_OPTIONS
    }
  },
  computed: {
    field () {
      return this.schema.properties[this.variable]
    }
  },
  methods: {
    setWidth (width) {
      if (!this.schema.layout[this.variable]) {
        this.schema.layout[this.variable] = {}
      }
      this.schema.layout[this.variable].width = width
    },
    toggleRequired () {
      const index = this.schema.required.indexOf(this.variable)
      if (this.field && this.field.internal && index >= 0) {
        this.schema.required.splice(index, 1)
      }
    }
  },
  components: {
    Fieldoptions,
    SchemaDialog: defineAsyncComponent(() => import('./SchemaDialog.vue'))
  }
}
</script>
