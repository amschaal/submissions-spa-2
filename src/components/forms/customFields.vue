<template>
  <div class="row">
      <!-- <q-editor ng-model="foo" v-if="false"/> -->
      <div v-for="v in fields" :key="v.variable" class="field q-pb-lg q-pl-sm q-pr-sm" v-bind:class="colWidth(v.variable)">
        <div v-if="$store.getters.isLoggedIn || !v.schema.internal">
          <span v-if="v.schema.type=='table'">
            <!-- :error="sample_data_error"
            bottom-slots :error-message="sample_data_error_label"
            :warning="sample_data_warning"
            warning-label="Samples contain warnings" -->
            <q-field
              v-if="v.schema.schema && v.schema.schema.order && v.schema.schema.order.length"
              :hint="(v.schema.title ? v.schema.title : v.variable) + ': Click on the button above to open the table'"
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
                  v-model="value[v.variable]"
                  :schema="v.schema.schema"
                  :editable="modify && ($store.getters.isLoggedIn || !v.schema.internal)"
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

            <span><q-tooltip v-if="warnings && warnings[v.variable]">{{warnings ? getWarning(v) : ''}}</q-tooltip><q-icon v-if="warnings && warnings[v.variable]" size="14px" name="warning" color="orange"/> {{widget(v).formatValue(value[v.variable],'None')}}</span>
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
            <!-- {{widget(v).getOptions()}} {{widget(v).getDefault()}} value: "{{value[v.variable]}}" -->
              <!-- <q-input v-model="value[v.variable]" type="text" stack-label :label="v.schema.title ? v.schema.title : v.variable"/> -->
              <!-- @change="val => {setValue('change', value, v.variable, val, $event)}" -->
              <component :is="widgetClass(v).component"
              :value="value[v.variable] || widget(v).getDefault()"
              @input="val => {setValue('input', value, v.variable, val)}"
                v-bind="widget(v).getOptions()"
              />

    <!--
    stack-label :label="v.schema.title ? v.schema.title : v.variable"
    v-model="value[v.variable]"
    :value="value[v.variable] || widgetClass(v).default"
    @change="val => { value[v.variable] = val }"
    @change="val => {setValue('change', value, v.variable, val, $event)}"
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
              :value="value[v.variable] || widget(v).getDefault()"
              @input="val => {setValue('input', value, v.variable, val)}"
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
            <!-- {{widget(v).getOptions()}}|{{widgetClass(v).component}}|{{value}}|{{v.variable}}|{{value[v.variable]}}|{{widget(v).getDefault()}} -->
          </span>
        </div>
    </div>
  </div>
</template>

<script>
import widgetFactory from '../forms/widgets.js'
import { QSelect, QOptionGroup } from 'quasar'
// import _ from 'lodash'

export default {
  props: ['value', 'schema', 'editable', 'errors', 'warnings', 'modify'],
  data () {
    return {
      data: this.value ? this.value : {}
    }
  },
  mounted () {
    console.log('customFields', this.schema, this.value)
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
        this.$set(value, variable, val)
      }
      console.log('setValue', type, value, variable, val, e)
    },
    openTable (v) {
      console.log('refs', this.$refs, v, this.$refs[v.variable][0])
      this.$refs[v.variable][0].openSamplesheet()
    },
    table_button_label (v) {
      console.log('table_button_label', v, v.variable, this.value, this.value[v.variable])
      return (v.schema.title ? v.schema.title : v.variable) + ' (' + (this.value[v.variable] && this.value[v.variable].length ? this.value[v.variable].length : 0) + ')'
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
    Agschema: () => import('../agschema.vue')
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
</style>
