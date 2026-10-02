<template>
  <div>
        <div v-if="schema" style="width:100%">
          <div class="row"><div class="col-1"></div><div class="col-1" title="Should the field only be available to staff?">Internal</div><div class="col-1">Required</div><div class="col-2">Variable</div><div class="col-2">Name</div><div class="col-2">Type</div><div class="col-1" v-if="options.showWidth">Column Width</div><div class="col-2"></div></div>
          <!-- Grouped layout: layout_order holds ungrouped fields and group ids, each group holds its own fields -->
          <draggable v-if="groupsEnabled" :list="schema.layout_order" :item-key="id => id" :group="{ name: 'schema-layout' }" handle=".drag-handle" @end="syncLayout">
            <template #item="{ element: id }">
              <div :data-layout-group="isGroup(id) ? id : null">
                <q-card v-if="isGroup(id)" flat bordered class="q-my-sm">
                  <div class="row items-center bg-grey-2 q-py-xs">
                    <div class="col-1">
                      <q-icon name="drag_indicator" size="sm" class="drag-handle cursor-move" aria-hidden="true"/>
                      <q-btn flat dense round icon="arrow_upward" color="primary" :aria-label="`Move group ${schema.groups[id].title} up`" @click="moveItem(id, -1)" v-if="canMove(id, -1)"/>
                      <q-btn flat dense round icon="arrow_downward" color="primary" :aria-label="`Move group ${schema.groups[id].title} down`" @click="moveItem(id, 1)" v-if="canMove(id, 1)"/>
                    </div>
                    <div class="col-4 q-pr-md"><q-input dense :aria-label="`Group ${id} title`" placeholder="Group title" v-model="schema.groups[id].title"/></div>
                    <div class="col-2 q-pr-md">
                      <q-select dense options-dense :aria-label="`Group ${id} display`" :options="groupDisplayOptions" map-options emit-value
                        :model-value="schema.groups[id].display || 'box'" @update:model-value="val => { schema.groups[id].display = val }"/>
                    </div>
                    <div class="col-2">
                      <q-btn dense flat icon="settings" label="Options" :aria-label="`Group ${id} options`">
                        <q-menu>
                          <q-card style="min-width: 300px">
                            <q-card-section class="q-gutter-sm">
                              <q-input dense autogrow label="Description" v-model="schema.groups[id].description"/>
                              <q-checkbox dense label="Collapsible" :model-value="!!schema.groups[id].collapsible" @update:model-value="val => { schema.groups[id].collapsible = val }"/>
                              <q-checkbox dense label="Start collapsed" :disable="!schema.groups[id].collapsible" :model-value="!!schema.groups[id].collapsed" @update:model-value="val => { schema.groups[id].collapsed = val }"/>
                              <div class="text-subtitle2">Printing</div>
                              <q-input dense label="Print label" :model-value="groupPrinting(id).label" @update:model-value="val => setGroupPrinting(id, 'label', val)"/>
                              <q-checkbox dense label="Hidden" :model-value="!!groupPrinting(id).hidden" @update:model-value="val => setGroupPrinting(id, 'hidden', val)"/>
                            </q-card-section>
                          </q-card>
                        </q-menu>
                      </q-btn>
                    </div>
                    <div class="col-1" v-if="options.showWidth">
                      <q-select dense options-dense :aria-label="`Group ${id} width`" :options="width_options" map-options emit-value
                        :model-value="schema.groups[id].layout ? schema.groups[id].layout.width : null" @update:model-value="val => setGroupWidth(id, val)"/>
                    </div>
                    <div class="col-2"><q-btn label="Delete group" color="negative" @click="deleteGroup(id)"/></div>
                  </div>
                  <draggable class="schema-group-fields" :list="schema.groups[id].fields" :item-key="v => v" :group="{ name: 'schema-layout', put: canDropInGroup }" handle=".drag-handle" @end="syncLayout">
                    <template #item="{ element: variable }">
                      <schemaFieldRow class="q-pl-lg" :schema="schema" :variable="variable" :options="options" :type="type" :root-schema="rootSchema" @delete="deleteVariable">
                        <template #controls>
                          <q-icon name="drag_indicator" size="sm" class="drag-handle cursor-move" aria-hidden="true"/>
                          <q-btn flat dense round icon="arrow_upward" color="primary" :aria-label="`Move ${variable} up`" @click="moveItem(variable, -1)" v-if="canMove(variable, -1)"/>
                          <q-btn flat dense round icon="arrow_downward" color="primary" :aria-label="`Move ${variable} down`" @click="moveItem(variable, 1)" v-if="canMove(variable, 1)"/>
                        </template>
                      </schemaFieldRow>
                    </template>
                  </draggable>
                </q-card>
                <schemaFieldRow v-else :schema="schema" :variable="id" :options="options" :type="type" :root-schema="rootSchema" @delete="deleteVariable">
                  <template #controls>
                    <q-icon name="drag_indicator" size="sm" class="drag-handle cursor-move" aria-hidden="true"/>
                    <q-btn flat dense round icon="arrow_upward" color="primary" :aria-label="`Move ${id} up`" @click="moveItem(id, -1)" v-if="canMove(id, -1)"/>
                    <q-btn flat dense round icon="arrow_downward" color="primary" :aria-label="`Move ${id} down`" @click="moveItem(id, 1)" v-if="canMove(id, 1)"/>
                  </template>
                </schemaFieldRow>
              </div>
            </template>
          </draggable>
          <template v-else>
            <div v-for="variable in fields_sorted" :key="variable.variable">
              <schemaFieldRow :schema="schema" :variable="variable.variable" :options="options" :type="type" :root-schema="rootSchema" @delete="deleteVariable">
                <template #controls>
                  <q-btn flat dense round icon="arrow_upward" color="primary" :aria-label="`Move ${variable.variable} up`" @click="move(variable.variable, -1)" v-if="schema.order && schema.order.indexOf(variable.variable) != 0"/> <q-btn flat dense round icon="arrow_downward" color="primary" :aria-label="`Move ${variable.variable} down`" @click="move(variable.variable, 1)" v-if="schema.order && schema.order.indexOf(variable.variable) != schema.order.length - 1"/>
                </template>
                <template #buttons-after>
                  <slot name="variable-buttons-after" v-bind:variable="variable" v-bind:rootSchema="rootSchema"></slot>
                </template>
              </schemaFieldRow>
            </div>
          </template>
        </div>
        <q-btn v-if="groupsEnabled" color="primary" label="Add group" class="q-mr-sm" @click="promptAddGroup"/>
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

    <q-dialog v-model="variable_modal" ref="modal">
      <q-card style="min-width: 30vw; min-height: 30vh;">
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
// import axios from 'axios'
import _ from 'lodash'
import draggable from 'vuedraggable'
import schemaFieldRow, { TYPE_OPTIONS, WIDTH_OPTIONS } from './schemaFieldRow.vue'
import { GROUP_DISPLAY_OPTIONS, addGroup, canMoveLayoutItem, isGroup, moveLayoutItem, normalizeLayout, removeGroup } from '../../utils/schemaGroups.js'
// import Formatoptions from '../components/formatoptions.vue'
import jsonDiffModal from '../modals/jsonDiffModal.vue'
// import Agschema from '../agschema.vue'
export default {
  name: 'schemaForm',
  emits: ['update:modelValue'],
  props: {
    modelValue: {
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
      schema: this.modelValue,
      errors: {},
      type_options: TYPE_OPTIONS,
      width_options: WIDTH_OPTIONS,
      groupDisplayOptions: GROUP_DISPLAY_OPTIONS,
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
      if (this.groupsEnabled) {
        normalizeLayout(this.schema)
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
        if (this.schema.groups && this.schema.groups[name]) {
          return 'That name is used by a group'
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
      this.syncLayout()
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
          // Quasar v2: custom-component props must be under componentProps.
          componentProps: {
            text: message,
            left: this.schema.properties[v],
            right: this.options.variables.properties[v]
          }
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
        this.syncLayout()
        this.$q.notify({message: `Variable "${v}" added.`, type: 'positive'})
      }
    },
    move (variable, displacement) {
      console.log('moveUp', variable)
      const index = this.schema.order.indexOf(variable)
      this.schema.order.splice(index + displacement, 0, this.schema.order.splice(index, 1)[0])
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
    deleteVariable (variable) {
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
        const required = self.schema.required.indexOf(variable)
        if (required >= 0) {
          self.schema.required.splice(required, 1)
        }
        delete self.schema.layout[variable]
        self.syncLayout()
        self.$q.notify({message: 'Variable "' + variable + '" deleted.', type: 'negative'})
      })
    },
    // Field groups (submission schemas only), see utils/schemaGroups.js
    syncLayout () {
      if (this.groupsEnabled) {
        normalizeLayout(this.schema)
      }
    },
    isGroup (id) {
      return isGroup(this.schema, id)
    },
    canMove (id, displacement) {
      return canMoveLayoutItem(this.schema, id, displacement)
    },
    moveItem (id, displacement) {
      moveLayoutItem(this.schema, id, displacement)
    },
    canDropInGroup (to, from, dragEl) {
      // Groups can't be nested
      return !dragEl.dataset.layoutGroup
    },
    groupPrinting (id) {
      return this.schema.groups[id].printing || {}
    },
    setGroupPrinting (id, key, value) {
      this.schema.groups[id].printing = { ...this.groupPrinting(id), [key]: value }
    },
    setGroupWidth (id, width) {
      this.schema.groups[id].layout = { ...(this.schema.groups[id].layout || {}), width }
    },
    promptAddGroup () {
      this.$q.dialog({
        title: 'Add group',
        message: 'Fields can be dragged into the group once it is added.',
        prompt: { model: '', type: 'text', label: 'Group title', isValid: val => !!val.trim() },
        cancel: true
      }).onOk(title => {
        addGroup(this.schema, title.trim())
      })
    },
    deleteGroup (id) {
      this.$q.dialog({
        title: 'Confirm group deletion',
        message: `Are you sure you want to delete the group "${this.schema.groups[id].title}"?  Its fields will be kept, ungrouped.`,
        ok: 'Okay',
        cancel: 'Cancel'
      }).onOk(() => {
        removeGroup(this.schema, id)
      })
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
    groupsEnabled () {
      return !!(this.options && this.options.groups)
    },
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
        this.$emit('update:modelValue', this.schema)
      },
      deep: true
    },
    modelValue: {
      handler (newVal, oldVal) {
        this.schema = newVal
        this.setMissingProperties()
      },
      deep: false
    }
  },
  components: {
    draggable,
    schemaFieldRow
    // Formatoptions,
    // Agschema
  }
}
</script>
<style>
.inactive {
  color: red;
}
.schema-group-fields {
  min-height: 2.5em;
}
.schema-group-fields:empty::before {
  content: 'Drag fields here';
  display: block;
  padding: 0.5em 0 0.5em 4em;
  color: #757575;
}
</style>
