<template>
  <div class="row">
      <!-- <q-editor ng-model="foo" v-if="false"/> -->
      <div v-for="v in fields" :key="v.variable" class="field" v-bind:class="colWidth(v.variable)">
        <div v-if="$store.getters.isLoggedIn || !v.schema.internal">
          <span v-if="!modify" v-bind:class="{'warning': warnings && warnings[v.variable]}">
            <p class="caption">{{v.schema.title ? v.schema.title : v.variable}}</p>

            <span><q-tooltip v-if="warnings && warnings[v.variable]">{{warnings ? getWarning(v) : ''}}</q-tooltip><q-icon v-if="warnings && warnings[v.variable]" size="14px" name="warning" color="orange"/> {{widget(v).formatValue(value[v.variable],'None')}}</span>
          </span>
          <span v-else>
            <q-field
              v-if="['q-input', 'q-select', 'q-file'].indexOf(widgetClass(v).component) == -1"
              bottom-slots
              :error="hasError(v.variable) || hasWarning(v)"
              :error-message="errors ? getError(v) : ''"
              :warning="hasWarning(v)"
              :warning-message="warnings ? getWarning(v) : ''"
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
              <div v-if="hasWarning(v)" class="warning">{{getWarning(v)}}</div>
            </template>
            </q-field>
            <component
              :is="widgetClass(v).component"
              :value="value[v.variable] || widget(v).getDefault()"
              @input="val => {setValue('input', value, v.variable, val)}"
              v-bind="widget(v).getOptions()"
              v-else
              bottom-slots
              :error="hasError(v.variable) || hasWarning(v)"
              :warning="hasWarning(v)"
              :warning-message="warnings ? getWarning(v) : ''"
              :label="v.schema.title ? v.schema.title : v.variable"
              stack-label
              :hint="v.schema.description"
              map-options emit-value
            >
            <template v-slot:error>
              <div v-if="hasError(v.variable)">{{getError(v)}}</div>
              <div v-if="hasWarning(v)" class="warning">{{getWarning(v)}}</div>
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
import { QSelect } from 'quasar'
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
      var error = v.schema.error_message ? v.schema.error_message : this.errors[v.variable]
      return error && error.join ? error.join(', ') : error
    },
    hasError (v) {
      return this.errors && this.errors[v] !== undefined
    },
    getWarning (v, flatten) {
      var warning = v.schema.error_message || this.warnings[v.variable]
      return warning && warning.join ? warning.join(', ') : ''
    },
    hasWarning (v) {
      return this.warnings && this.getWarning(v) !== ''
    },
    setValue (type, value, variable, val, e) {
      if (value.cancelBubble) {
        value.cancelBubble = true
      } else if (!value.target) {
        this.$set(value, variable, val)
      }
      console.log('setValue', type, value, variable, val, e)
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
    QSelect
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
