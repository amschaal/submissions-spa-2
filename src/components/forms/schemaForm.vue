<template>
  <div>
        <div v-if="schema" style="width:100%">
          <div class="row"><div class="col-1"></div><div class="col-1" title="Should the field only be available to staff?">Internal</div><div class="col-1">Required</div><div class="col-2">Variable</div><div class="col-2">Name</div><div class="col-2">Type</div><div class="col-1" v-if="options.showWidth">Column Width</div><div class="col-2"></div></div>
          <div v-for="variable in fields_sorted" :key="variable.variable">
            <div class="row">
              <div class="col-1"><q-btn flat dense round icon="arrow_upward" color="primary" @click="move(variable.variable, -1, 'submission_schema')" v-if="schema.order && schema.order.indexOf(variable.variable) != 0"/> <q-btn flat dense round icon="arrow_downward" color="primary" @click="move(variable.variable, 1, 'submission_schema')" v-if="schema.order && schema.order.indexOf(variable.variable) != schema.order.length - 1"/></div>
              <div class="col-1"><q-checkbox dense v-if="variable.schema" v-model="variable.schema.internal" @input="toggleRequired(variable)"/></div>
              <div class="col-1"><q-checkbox dense v-model="schema.required" :val="variable.variable" :disable="variable.schema && variable.schema.internal"/></div>
              <div class="col-2">{{variable.variable}}</div>
              <div class="col-2"><q-input dense v-model="variable.schema.title" /></div>
              <div class="col-2">
                <q-select
                  dense options-dense
                  v-model="variable.schema.type"
                  :options="type_options"
                  map-options emit-value
                />
              </div>
              <div class="col-1" v-if="options.showWidth">
                <!-- v-bind:value="getNested(`schema.layout.${variable.variable}.width`)" -->
                <q-select
                  dense options-dense
                  map-options emit-value
                  v-model="schema.layout[variable.variable].width"
                  :options="width_options"
                  v-if="schema.layout[variable.variable]"
                  @input="setNested(`schema.layout.${variable.variable}.width`,$event)"
                />
                <q-select
                  dense options-dense
                  map-options emit-value
                  :options="width_options"
                  v-if="!schema.layout[variable.variable]"
                  @input="setNested(`schema.layout.${variable.variable}.width`,$event)"
                />
                <!-- @input="$set(item,'prop',$event.target.value)" -->

              </div>
              <div class="col-2">
                <SchemaDialog v-if="variable.schema.type == 'table'" v-model="variable.schema.schema" :root-schema="rootSchema" :variable="variable"/>
                <fieldoptions v-else style="display:inline-block" :schema="schema" v-model="schema.properties[variable.variable]" :variable="variable.variable" :type="type" :root-schema="rootSchema"/>
                <q-btn label="Delete" color="negative" @click="deleteVariable(variable.variable, 'submission_schema')"></q-btn>
                <slot name="variable-buttons-after" v-bind:variable="variable" v-bind:rootSchema="rootSchema"></slot>
              </div>
            </div>
          </div>
        </div>
        <q-btn-dropdown
        color="positive"
        label="Add field"
        >
          <q-list>
            <q-item v-close-popup @click="openModal" clickable>
              <q-item-label>
                <q-item-section label>New</q-item-section>
              </q-item-label>
              <q-item-section right icon="create" color="green" />
            </q-item>
            <q-separator/>
            <q-item clickable v-for="v in variables" :key="v" v-close-popup @click="addExistingVariable(v)">
              <q-item-label>
                <q-item-section label>{{v}}</q-item-section>
              </q-item-label>
            </q-item>
          </q-list>
        </q-btn-dropdown>

    <q-dialog v-model="variable_modal" :content-css="{minWidth: '30vw', minHeight: '30vh'}" ref="modal">
      <q-card>
        <q-bar class="bg-primary text-white">
          Add a variable
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section>
          <q-select
            dense options-dense
            v-model="new_variable.type"
            :options="type_options"
            map-options emit-value
            label="Type"
          />
          <q-input
            dense
            label="Variable Name"
            :error="variableError(new_variable.name)"
            :error-message="variableMessage(new_variable.name)"
            hint="Please only use lowercase letters, numbers, and underscores"
            v-model="new_variable.name"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            color="positive"
            @click="addVariable()"
            label="Add"
            :disable="variableError(new_variable.name) || !new_variable.name || !new_variable.type"
          />
          <q-btn
            @click="variable_modal = false"
            label="Cancel"
            color="negative"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    </div>
</template>

<script>
// import '../forms/docs-input.styl'
// import axios from 'axios'
import _ from 'lodash'
import Fieldoptions from '../fieldoptions.vue'
// import Formatoptions from '../components/formatoptions.vue'
import jsonDiffModal from '../modals/jsonDiffModal.vue'
// import Agschema from '../agschema.vue'
export default {
  name: 'schemaForm',
  props: {
    value: {
      type: Object,
      default: function () { return {} }
    },
    options: {
      type: Object,
      default: function () { return {} }
    },
    type: {
      type: String,
      default: 'submission'
    },
    rootSchema: {
      type: Object
    }
  },
  data () {
    return {
      schema: this.value,
      errors: {},
      type_options: [{ 'label': 'Text', 'value': 'string' }, { 'label': 'Number', 'value': 'number' }, { 'label': 'True / False', 'value': 'boolean' }, { 'label': 'Table', 'value': 'table' }],
      width_options: [{ 'label': '100%', 'value': 'col-md-12 col-sm-12 col-xs-auto' }, { 'label': '5/6', 'value': 'col-md-10 col-sm-12 col-xs-auto' }, { 'label': '3/4', 'value': 'col-md-9 col-sm-12 col-xs-auto' }, { 'label': '2/3', 'value': 'col-md-8 col-sm-12 col-xs-auto' }, { 'label': '1/2', 'value': 'col-md-6 col-sm-12 col-xs-auto' }, { 'label': '1/3', 'value': 'col-md-4 col-sm-6 col-xs-auto' }, { 'label': '1/4', 'value': 'col-md-3 col-sm-6 col-xs-auto' }, { 'label': '1/6', 'value': 'col-md-2 col-sm-4 col-xs-auto' }],
      new_variable: {},
      variable_modal: false,
      variable_re: /^[a-z0-9_]+$/
    }
  },
  created: function () {
    console.log('created!!!', this.schema)
    if (!this.options) {
      this.options = {}
    }
    this.setMissingProperties()
  },
  // beforeDestroy: function () {
  // },
  methods: {
    setMissingProperties () {
      if (!this.schema.properties) {
        this.schema.properties = {}
      }
      if (!this.schema.order) {
        this.schema.order = []
      }
      if (!this.schema.layout) {
        this.schema.layout = {}
      }
      if (!this.schema.printing) {
        this.schema.printing = []
      }
      if (!this.schema.required) {
        this.schema.required = []
      }
    },
    openModal () {
      this.new_variable = {schema: this.schema}
      this.variable_modal = true
    },
    variableError (name) {
      return this.variableMessage(name) !== null
    },
    variableMessage (name) {
      if (name && this.schema.properties) {
        if (!name.match(this.variable_re)) {
          return 'Variables should only contain lowercase letters, numbers, and underscores'
        }
        for (const n in this.schema.properties) {
          if (n.toLowerCase() === name.toLowerCase()) {
            return 'That variable name exists'
          }
        }
      }
      return null
    },
    addVariable () {
      if (this.new_variable.type === 'table') {
        this.schema.properties[this.new_variable.name] = {type: this.new_variable.type, internal: false, unique: false, schema: { order: [], properties: {}}, printing: { hidden: false }}
      } else {
        this.schema.properties[this.new_variable.name] = {type: this.new_variable.type, internal: false, unique: false}
      }

      this.schema.order.push(this.new_variable.name)
      // // this.schema.properties['VARIABLE_NAME'] = {added: true}
      // console.log(this.schema.properties)
      this.variable_modal = false
    },
    addExistingVariable (v) {
      if (this.schema.properties[v]) {
        const message = 'Are you sure you want to reset the variable "' + v + '", pulling the configuration from the lab settings?  All sub options will be replaced as well.  If it is a table, that includes every column in that table.'
        this.$q.dialog({
          component: jsonDiffModal,
          parent: this,
          // props forwarded to component
          // (everything except "component" and "parent" props above):
          text: message,
          left: this.schema.properties[v],
          right: this.options.variables.properties[v]
        }).onOk(() => {
          this.schema.properties[v] = _.cloneDeep(this.options.variables.properties[v])
          this.$q.notify({message: `Variable "${v}" updated.`, type: 'positive'})
        }).onCancel(() => {
          console.log('Cancel')
        }).onDismiss(() => {
          console.log('Called on OK or Cancel')
        })
      } else {
        this.schema.properties[v] = _.cloneDeep(this.options.variables.properties[v])
        this.schema.order.push(v)
        this.$q.notify({message: `Variable "${v}" added.`, type: 'positive'})
      }
    },
    move (variable, displacement, schema) {
      console.log('moveUp', variable)
      const index = this.schema.order.indexOf(variable)
      this.schema.order.splice(index + displacement, 0, this.schema.order.splice(index, 1)[0])
    },
    setNested (path, value) {
      const props = path.split('.')
      console.log('setNested', props, value)
      const self = this
      let last = this

      props.forEach(function (prop, index) {
        if (!last[prop] && index < props.length - 1) {
          console.log('set blank', last, prop)
          self.$set(last, prop, {})
        }
        if (index === props.length - 1) {
          console.log('set value', last, prop, value)
          self.$set(last, prop, value)
        }
        last = last[prop]
      })
    },
    getNested (path) {
      const props = path.split('.')
      console.log('getNested', props)
      let last = this
      props.forEach(function (prop, index) {
        if (index < props.length - 1 && !last[prop]) {
          return undefined
        } else if (index === props.length - 1) {
          return last[prop]
        }
        last = last[prop]
      })
    },
    deleteVariable (variable, schema) {
      const self = this
      this.$q.dialog({
        title: 'Confirm variable deletion',
        message: 'Are you sure you want to delete the variable "' + variable + '"?',
        ok: 'Okay',
        cancel: 'Cancel'
      }).onOk(() => {
        if (self.schema.order) {
          const index = self.schema.order.indexOf(variable)
          if (index >= 0) {
            self.schema.order.splice(index, 1)
          }
        }
        delete this.schema.properties[variable]
        self.$q.notify({message: 'Variable "' + variable + '" deleted.', type: 'negative'})
      })
    },
    toggleRequired (variable) {
      console.log('toggleRequired', variable)
      const index = this.schema.required.indexOf(variable.variable)
      if (variable.schema && variable.schema.internal && index >= 0) {
        this.schema.required.splice(index, 1)
      }
    },
    fields_sorted_method () {
      console.log('field_sorted', this.schema)
      return this.schema.order.map(function (variable) {
        return {variable, 'schema': this.schema.properties[variable]}
      })
    }

    // removeOptions (property) {
    //   console.log(property)
    //   // delete property.enum
    //   property.enum = null
    //   delete property.enum
    //   console.log(property)
    // },
    // useOptions (property) {
    //   property.enum = []
    // }
  },
  // watch: {
  //   'submission.type': function (newType) {
  //     console.log('type changed', newType)
  //     for (var i in this.submission_types) {
  //       if (this.submission_types[i].id === newType) {
  //         console.log('type', this.submission_types[i])
  //         this.schema = this.submission_types[i].sample_schema
  //       }
  //     }
  //   }
  // },
  computed: {
    fields_sorted () {
      // console.log('field_sorted', this.schema)
      // var sorted = []
      // for (var i in this.schema.order) {
      //   var variable = this.schema.order[i]
      //   sorted.push({'variable': variable, 'schema': this.schema.properties[variable]})
      // }
      // return this.schema.order.length
      if (!this.schema || !this.schema.order) {
        return []
      }
      const self = this
      return this.schema.order.map(function (variable) {
        return {variable, 'schema': self.schema.properties[variable]}
      })
    },
    variables () {
      const variables = this.options && this.options.variables && this.options.variables.order ? this.options.variables.order.slice() : []
      variables.sort()
      return variables
    }
    // nested: {
    //   // return {
    //   // getter
    //   get: function (path) {
    //     console.log('get', path)
    //     return this.getNested(path)
    //   },
    //   // setter
    //   set: function (path, newValue) {
    //     this.setNested(path, newValue)
    //   }
    //   // }
    // }
    // nested () {
    //   return path => this.getNested(path)
    // }
  },
  watch: {
    schema: {
      handler (newVal, oldVal) {
        // console.log('watch schema', this.schema)
        this.$emit('input', this.schema)
      },
      deep: true
    },
    value: {
      handler (newVal, oldVal) {
        this.schema = newVal
        this.setMissingProperties()
      },
      deep: false
    }
  },
  components: {
    Fieldoptions,
    SchemaDialog: () => import('./SchemaDialog.vue')
    // Formatoptions,
    // Agschema
  }
}
</script>
<style>
.inactive {
  color: red;
}
</style>
