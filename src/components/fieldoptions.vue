<template>
  <div>

    <q-dialog v-model="opened" ref="modal">
      <q-card style="width: 800px; max-width: 80vw;">
        <q-bar class="bg-primary text-white">
          Field options for: {{variable}} {{type}}
          <q-space />
        </q-bar>
        <q-card-section v-if="opened">
          <q-input dense label="Description" v-model="data.description" autogrow placeholder="Enter description here."/>
            <!-- <q-checkbox v-model="data.unique" :false-value="true" :true-value="false" indeterminate-icon="check_box_outline_blank" unchecked-icon="check_box" checked-icon="check_box_outline_blank" keep-color /> -->
          <h5>Validation</h5>
          <q-checkbox dense label="Unique" v-if="type!='submission'" v-model="data.unique"/>
            <!-- :false-value="undefined" toggle-indeterminate="false" indeterminate-value="none"/> -->
          <!-- <q-select
            dense options-dense
            label="Pin column"
            v-if="type!='submission'"
            v-model="data.pinned"
           :options="[{label:'Not pinned',value:undefined},{label:'Pinned left',value:'left'},{label:'Pinned right',value:'right'}]"
          /> -->
          <q-input
            dense
            v-if="data.type === 'string'"
            label="Regular Expression"
            hint="Enter a valid regular expression to validate against. Example for matching values such as '20.3 ul': ^\d+(\.{1}\d+)? ul$"
            v-model="data.pattern"
            />
          <!-- <q-select
            dense options-dense
            v-model="data.enum"
            use-input
            use-chips
            multiple
            hide-dropdown-icon
            input-debounce="0"
            new-value-mode="add-unique"
            placeholder="Enter options"
            v-if="data.type === 'string'"
            stack-label
            label="Choices"
            hint="If the variable should be constrained to specific choices, enter here."
            /> -->
            <q-input
              dense
              v-if="data.type === 'string'"
              label="Choices"
              hint="If the variable should be constrained to specific choices, enter here.  Choices may be added, reordered, or removed."
              v-model="option"
              :error="data.enum.indexOf(option) != -1"
              error-message="Choices must be unique."
              bottom-slots
              @keydown.enter="addChoice"
              >
              <template v-slot:append>
                <q-icon name="add_circle" @click="addChoice" class="cursor-pointer" />
              </template>
            </q-input>
            <draggable :list="data.enum">
              <div v-for="choice in data.enum" :key="choice" class="q-chip row no-wrap inline items-center q-chip-small bg-primary text-white draggable">
                <div class="q-chip-main ellipsis draggable">{{choice}}</div>
                <div class="q-chip-side q-chip-close q-chip-right row flex-center" @click="deleteChoice(choice)"><i aria-hidden="true" class="q-icon cursor-pointer material-icons">cancel</i></div>
              </div>
            </draggable>
          <q-checkbox
            dense
            label="Select multiple"
            v-if="data.type === 'string' && data.enum && data.enum.length"
            v-model="data.multiple"
            />
          <q-input
            dense
            v-if="data.type === 'number'"
            label="Minimum"
            hint="Optionally, enter a minimum valid number."
            v-model="data.minimum"
            type="number"
            />
          <q-input
            dense
            v-if="data.type === 'number'"
            label="Maximum"
            hint="Optionally, enter a maximum valid number."
            v-model="data.maximum"
            type="number"
            />

          <ForeignKey :schema="rootSchema" v-model="data.fk"/>
          <q-field
            label="Custom validators"
            stack-label
            borderless
            v-if="data.type !== 'table' && data.validators"
          >
            <q-btn-dropdown size="md" label="Add validator">
              <q-list>
                <q-item clickable v-for="(v, id) in validatorsByType(data.type)" :key="id" v-close-popup @click="addValidator(id)" :title="v.description">
                  <q-item-label>
                    <q-item-section label>{{v.name}}</q-item-section>
                  </q-item-label>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-field>
          <div v-for="(v, index) in data.validators" :key="index" :title="validators[v.id].description">
            <q-btn flat dense round icon="delete_outline" @click="removeValidator(index)"/> {{validators[v.id].name}}  <label title="Raise as a warning only"><input type="checkbox" v-model="v.options.warning"/>Warning only</label><q-btn size="sm" v-if="validators[v.id].uses_options" label="Options" @click="open('validator_options_'+v.id)"/>
            <OptionsModal v-model="v.options" :schema="validator_schema(validators[v.id])" :parent-schema="schema" :variable="variable" :ref="`validator_options_${v.id}`" v-if="validators[v.id].uses_options"/>
          </div>
          <q-input label="Validation Error Message" dense v-model="data.error_message" autogrow placeholder="Optionally add a custom validation message here." v-if="data.type !== 'table'"/>
          <h5>Display</h5>
          <q-field label="Pin column" stack-label borderless v-if="type==='table'">
            <q-radio dense v-model="data.pinned" :val="undefined" label="Not pinned" />
            <q-radio dense v-model="data.pinned" val="left" label="Pinned left" />
            <q-radio dense v-model="data.pinned" val="right" label="Pinned right" />
          </q-field>
          <q-field
            dense
            label="Widget"
            borderless
            style="width:100%"
            v-if="data.type !== 'table'"
          >
            <span class="col-9">
              <q-select
                dense options-dense
                v-model="data.widget.type"
                :options="widgetOptions"
                clearable
                map-options emit-value
              />
            </span>
            <span class="col-3" v-if="hasWidgetOptions(data.widget.type)">
              <q-btn label="options" size="sm" @click="open('widget_options')"/>
              <OptionsModal :WidgetClass="getWidget(data.widget.type)" v-model="data.widget.options" :schema="widget_schema(data.widget.type)" :parent-schema="schema" :variable="variable" :ref="'widget_options'"/>
            </span>
          </q-field>
          <!-- <h5>Search</h5>
          <q-checkbox dense label="Searchable" v-model="data.searchable"/> -->
          <h5>Printing options</h5>
            <q-input dense label="Field label" v-model="data.printing.label" placeholder="Optionally add a shortened label." v-if="data.type !== 'table'"/>
            <!-- <q-checkbox v-model="data.unique" :false-value="true" :true-value="false" indeterminate-icon="check_box_outline_blank" unchecked-icon="check_box" checked-icon="check_box_outline_blank" keep-color /> -->
            <q-checkbox dense label="Hidden" v-model="data.printing.hidden"/>
            <!-- :false-value="undefined" toggle-indeterminate="false" indeterminate-value="none"/> -->
            <q-input dense label="Truncate after N characters" v-model="data.printing.truncate_at" type="number" v-if="data.type !== 'table'"/>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            color="negative"
            label="Discard"
            @click="discard"
            class="float-right"
          />
          <q-btn
            color="positive"
            label="Keep"
            @click="save"
            class="float-right"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-btn label="Options"  @click="openModal"/>
  </div>
</template>

<script>
import _ from 'lodash'
import submissionWidgetFactory from './forms/widgets.js'
import tableWidgetFactory from './aggrid/widgets.js'
import OptionsModal from './modals/OptionsModal.vue'
import ForeignKey from './forms/ForeignKey.vue'
import draggable from 'vuedraggable'
export default {
  props: ['value', 'variable', 'type', 'schema', 'rootSchema'],
  data () {
    return {
      opened: false,
      data: {enum: [], widget: {}, printing: {}},
      validators: this.$store.getters.validatorDict, // t{unique: {id: 'unique', name: 'Unique'}, foo: {id: 'foo', name: 'Foo'}},
      add_validator: null,
      option: null
      // options: this.value && this.value.enum ? this.value.enum : []
    }
  },
  mounted () {
    // console.log('widgetFactory', widgetFactory.getWidgetOptions('text'))
    // this.setup()
  },
  methods: {
    setup () {
      this.data = _.cloneDeep(this.value)

      if (!this.data.enum) {
        this.$set(this.data, 'enum', [])
      }
      if (!this.data.widget) {
        this.$set(this.data, 'widget', {'type': null, 'options': {}})
      }
      if (!this.data.printing) {
        this.$set(this.data, 'printing', {'hidden': false})
      }
      if (!this.data.validators) {
        this.$set(this.data, 'validators', [])
      }
    },
    openModal () {
      this.setup()
      // this.data = _.cloneDeep(this.value)
      console.log('root', this.$root.validators)

      console.log('openModal', this.value, this.data)
      this.$refs.modal.show()
      // .then(() => {
      //
      // })
    },
    open (ref) {
      console.log('open', this.$refs[ref], ref)
      if (Array.isArray(this.$refs[ref])) {
        this.$refs[ref][0].open()
      } else {
        this.$refs[ref].open()
      }
    },
    validatorsByType (type) {
      const validators = {}
      console.log('validators', this.$store.getters.validatorDict)
      for (const v in this.$store.getters.validatorDict) {
        console.log('supported', type, this.$store.getters.validatorDict[v].supported_types)
        if (this.$store.getters.validatorDict[v].supported_types && this.$store.getters.validatorDict[v].supported_types.indexOf(type) !== -1) {
          validators[v] = this.$store.getters.validatorDict[v]
        }
      }
      console.log('validatorsByType', type, validators)
      return validators
    },
    save () {
      // this.local_data = this.hst.table.getSourceData()
      // this.data = this.hst.table.getSourceData() // this.local_data
      // this.value = this.options
      const val = _.cloneDeep(this.data)
      if (val.enum.length < 1) {
        val.enum = undefined
      }
      console.log('emit', val)
      this.$emit('input', val)
      this.$refs.modal.hide()
      // this.data
    },
    discard () {
      this.$refs.modal.hide()
    },
    addValidator (id) {
      this.data.validators.push({id, options: {}})
      console.log(id, this.data.validators)
    },
    removeValidator (index) {
      this.data.validators.splice(index, 1)
    },
    deleteChoice (choice) {
      if (confirm(`Are you sure you want to delete "${choice}"?`)) {
        this.data.enum.splice(this.data.enum.indexOf(choice), 1)
      }
    },
    addChoice () {
      if (this.option) {
        const option = this.option.trim()
        if (!this.data.enum) {
          this.data.enum = []
        }
        if (this.data.enum.indexOf(option) === -1) {
          this.data.enum.push(option)
          this.option = ''
        }
      }
    },
    widgetSchema (id) {
      const factory = this.type === 'submission' ? submissionWidgetFactory : tableWidgetFactory
      return factory.getWidgetSchema(id)
    },
    hasWidgetOptions (id) {
      return _.keys(this.widgetSchema(id)).length > 0
    },
    getWidget (id) {
      console.log('widgetFactory', this.widgetFactory, id, this.widgetFactory.getWidget(id))
      return this.widgetFactory.getWidget(id)
    },
    validator_schema (validator) {
      const schema = { order: [], properties: {}, layout: {}, title: validator.name, description: validator.description }
      validator.schema.forEach(function (v) {
        schema.order.push(v.variable)
        schema.properties[v.variable] = v
        schema.properties[v.variable].title = schema.properties[v.variable].label
      })
      return schema
    },
    widget_schema (id) {
      const factory = this.type === 'submission' ? submissionWidgetFactory : tableWidgetFactory
      const widgetSchema = factory.getWidgetSchema(id, this.schema, this)
      const widget = factory.getWidget(id)
      console.log('widget_schema', widget, widgetSchema)
      const schema = { order: [], properties: {}, layout: {}, title: widget.name, description: widget.description }
      widgetSchema.forEach(function (v) {
        schema.order.push(v.variable)
        schema.properties[v.variable] = v
        schema.properties[v.variable].title = schema.properties[v.variable].label
      })
      return schema
    }
  },
  computed: {
    widgetFactory () {
      return this.type === 'submission' ? submissionWidgetFactory : tableWidgetFactory
    },
    widgetOptions () {
      return this.widgetFactory.getWidgets(this.data.type)
      // switch (this.data.type) {
      //   case 'boolean':
      //     return widgetFactory.getWidgetOptions('text')// [{label: 'Checkbox', value: 'checkbox'}, {label: 'Toggle switch', value: 'toggle'}]
      //   case 'number':
      //     return [{label: 'Number', value: 'number'}]
      //   default:
      //     return [{label: 'Text', value: 'text'}]
      // }
    }
  },
  components: {
    OptionsModal,
    ForeignKey,
    draggable
  }
}

</script>
