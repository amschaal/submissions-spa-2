<template>
  <div class="row">
      <!-- <q-editor ng-model="foo" v-if="false"/> -->
      <div v-for="v in fields" :key="v.variable" class="field q-mb-md q-pb-lg q-pl-sm q-pr-sm" v-bind:class="colWidth(v.variable)">
        <div v-if="$store.getters.isStaff || !v.schema.internal">
          <span v-if="v.schema.type=='table'">
            <!-- :error="sample_data_error"
            bottom-slots :error-message="sample_data_error_label"
            :warning="sample_data_warning"
            warning-label="Samples contain warnings" -->
            <q-field
              v-if="v.schema.schema && v.schema.schema.order && v.schema.schema.order.length"
              :hint="tableHint(v)"
              class="q-pb-xl q-mb-xl"
              borderless
              bottom-slots
              :error="hasError(v.variable) || hasWarning(v.variable)"
            >
              <!-- <Samplesheet v-model="submission.sample_data" :type="type"/> -->
              <template v-slot:control>
                <!-- :submission="submission"
                v-on:warnings="updateWarnings"
                v-on:errors="updateErrors" -->
                <Agschema
                  v-model="modelValue[v.variable]"
                  :schema="v.schema.schema"
                  :editable="modify && ($store.getters.isStaff || !v.schema.internal)"
                  :allow-examples="true"
                  :allow-force-save="true"
                  :ref="v.variable"
                  :table-warnings="getTableWarnings(v)"
                  :table-errors="getTableErrors(v)"
                  />
                <q-btn :label="table_button_label(v)"  @click="openTable(v)" />
              </template>
              <template v-slot:error>
                <div v-if="hasError(v.variable)">{{getError(v)}}</div>
                <div v-if="hasWarning(v.variable)" class="warning">Table contains warnings</div>
              </template>
            </q-field>
          </span>
          <span v-else-if="!modify" v-bind:class="{'warning': warnings && warnings[v.variable]}">
            <p class="caption">{{v.schema.title ? v.schema.title : v.variable}}</p>

            <span><q-tooltip v-if="warnings && warnings[v.variable]">{{warnings ? getWarning(v) : ''}}</q-tooltip><q-icon v-if="warnings && warnings[v.variable]" size="14px" name="warning" color="orange"/> {{widget(v).formatValue(modelValue[v.variable],'None')}}</span>
          </span>
          <span v-else>
            <q-field
              v-if="['q-input', 'q-select', 'q-file'].indexOf(widgetClass(v).component) == -1"
              bottom-slots
              :error="hasError(v.variable) || hasWarning(v.variable)"
              :label="v.schema.title ? v.schema.title : v.variable"
              stack-label
              orientation="vertical"
              :hint="v.schema.description"
              borderless
            >
            <!-- {{widget(v).getOptions()}} {{widget(v).getDefault()}} value: "{{modelValue[v.variable]}}" -->
              <!-- <q-input v-model="modelValue[v.variable]" type="text" stack-label :label="v.schema.title ? v.schema.title : v.variable"/> -->
              <!-- @change="val => {setValue('change', modelValue, v.variable, val, $event)}" -->
              <component :is="widgetClass(v).component"
              :model-value="modelValue[v.variable] || widget(v).getDefault()"
              @update:model-value="val => {setValue('input', modelValue, v.variable, val)}"
                v-bind="widget(v).getOptions()"
              />

    <!--
    stack-label :label="v.schema.title ? v.schema.title : v.variable"
    v-model="modelValue[v.variable]"
    :value="modelValue[v.variable] || widgetClass(v).default"
    @change="val => { modelValue[v.variable] = val }"
    @change="val => {setValue('change', modelValue, v.variable, val, $event)}"
    -->
            <template v-slot:hint v-if="v.schema.description">
              {{v.schema.description}}
            </template>
            <template v-slot:error>
              <div v-if="hasError(v.variable)">{{getError(v)}}</div>
              <div v-if="hasWarning(v.variable)" class="warning">{{getWarning(v)}}</div>
            </template>
            </q-field>
            <component
              :is="widgetClass(v).component"
              :model-value="modelValue[v.variable] || widget(v).getDefault()"
              @update:model-value="val => {setValue('input', modelValue, v.variable, val)}"
              v-bind="widget(v).getOptions()"
              v-else
              bottom-slots
              :error="hasError(v.variable) || hasWarning(v.variable)"
              :label="v.schema.title ? v.schema.title : v.variable"
              stack-label
              :hint="v.schema.description"
              map-options emit-value
            >
            <template v-slot:error>
              <div v-if="hasError(v.variable)">{{getError(v)}}</div>
              <div v-if="hasWarning(v.variable)" class="warning">{{getWarning(v)}}</div>
            </template>
          </component>
            <!-- {{widget(v).getOptions()}}|{{widgetClass(v).component}}|{{value}}|{{v.variable}}|{{modelValue[v.variable]}}|{{widget(v).getDefault()}} -->
          </span>
        </div>
    </div>
  </div>
</template>

<script>
import { defineAsyncComponent } from 'vue'
import widgetFactory from '../forms/widgets.js'
import { QSelect, QOptionGroup, QCheckbox } from 'quasar'
// import _ from 'lodash'

export default {
  props: ['modelValue', 'schema', 'editable', 'errors', 'warnings', 'modify'],
  data () {
    return {
      data: this.modelValue ? this.modelValue : {}
    }
  },
  mounted () {
    console.log('customFields', this.schema, this.modelValue)
  },
  methods: {
    widgetClass (v) {
      var widget = v.schema.widget ? v.schema.widget : {}
      console.log('widgetClass', v, widget)
      return widgetFactory.getWidget(widget.type, v.schema.type, v.schema)
    },
    widget (v) {
      var options = v.schema.widget && v.schema.widget.options ? v.schema.widget.options : {}
      var WidgetClass = this.widgetClass(v)
      return new WidgetClass(v, options)
    },
    colWidth (variable) {
      // if (!this.modify) {
      //   return 'col-4'
      // }
      return this.schema.layout[variable] && this.schema.layout[variable].width ? [this.schema.layout[variable].width] : ['col-12']
    },
    getError (v) {
      // console.log('getError1', v.schema, v.schema.error_message, this.errors, v.variable)
      var errors = v.schema.error_message ? v.schema.error_message : this.errors[v.variable]
      if (Array.isArray(errors)) {
        errors = errors.map(e => (typeof e === 'string' ? e : 'Table contains errors.'))
      }
      return errors && errors.join ? errors.join(', ') : errors
    },
    hasError (v) {
      return this.errors && this.errors[v] !== undefined
    },
    getWarning (v, flatten) {
      var warning = v.schema.error_message || this.warnings[v.variable]
      return warning && warning.join ? warning.join(', ') : ''
    },
    hasWarning (v) {
      return this.warnings && this.warnings[v] !== undefined
    },
    getTableWarnings (v) {
      return this.warnings && this.warnings[v.variable] ? this.warnings[v.variable] : {}
    },
    getTableErrors (v) {
      return this.errors && this.errors[v.variable] ? this.errors[v.variable] : {}
    },
    setValue (type, value, variable, val, e) {
      if (value.cancelBubble) {
        value.cancelBubble = true
      } else if (!value.target) {
        value[variable] = val
      }
      console.log('setValue', type, value, variable, val, e)
    },
    openTable (v) {
      console.log('refs', this.$refs, v, this.$refs[v.variable][0])
      this.$refs[v.variable][0].openSamplesheet()
    },
    table_button_label (v) {
      console.log('table_button_label', v, v.variable, this.modelValue, this.modelValue[v.variable])
      return (v.schema.title ? v.schema.title : v.variable) + ' (' + (this.modelValue[v.variable] && this.modelValue[v.variable].length ? this.modelValue[v.variable].length : 0) + ')'
    },
    tableHint (v) {
      if (v.schema.schema.description) {
        return v.schema.schema.description
      } else {
        return (v.schema.title ? v.schema.title : v.variable) + ': Click on the button above to open the table'
      }
    }
  },
  computed: {
    fields () {
      if (!this.schema) {
        return []
      }
      var self = this
      if (self.schema.order) {
        return self.schema.order.map(function (variable) {
          return {'variable': variable, 'schema': self.schema.properties[variable]}
        })
      }
      return []
    }
  },
  components: {
    QSelect,
    QOptionGroup,
    QCheckbox,
    Agschema: defineAsyncComponent(() => import('../agschema.vue'))
  },
  watch: {
  }
}
</script>
<style scoped>
.q-field {
  padding: 3px !important;
}
.warning {
  color: orange;
}
p.caption {
  font-weight: bold;
}
</style>
