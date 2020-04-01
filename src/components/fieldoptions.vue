<template>
  <div>
<!--
    <q-modal v-model="opened" :content-css="{minWidth: '80vw', minHeight: '80vh'}" ref="modal">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-btn
            flat
            round
            dense
            v-close-overlay
            icon="keyboard_arrow_left"
          />
          <q-toolbar-title>
            Field options for: {{variable}} {{type}}
          </q-toolbar-title>
        </q-toolbar>

        <div class="layout-padding" v-if="opened">
          <q-field
            label="Description"
          >
            <q-input v-model="data.description" type="textarea" placeholder="Enter description here."/>
          </q-field>
          <q-field
            label="Unique"
            v-if="type!='submission'"
          >
            <q-checkbox v-model="data.unique" indeterminate-icon="check_box_outline_blank"/>
          </q-field>
          <q-field
            label="Pin column"
            v-if="type!='submission'"
          >
          <q-select
            v-model="data.pinned"
            radio
           :options="[{label:'Not pinned',value:undefined},{label:'Pinned left',value:'left'},{label:'Pinned right',value:'right'}]"
          />
          </q-field>
          <q-field v-if="data.type === 'string'"
            label="Regular Expression"
            helper="Enter a valid regular expression to validate against. Example for matching values such as '20.3 ul': ^\d+(\.{1}\d+)? ul$"
          >
            <q-input v-model="data.pattern" />
          </q-field>
          <q-field v-if="data.type === 'string'"
            label="Choices"
            helper="If the variable should be constrained to specific choices, enter here."
          >
            <q-chips-input v-model="data.enum" placeholder="Enter options" />
          </q-field>
          <q-field
            label="Select multiple"
            v-if="data.type === 'string' && data.enum && data.enum.length"
          >
            <q-checkbox v-model="data.multiple" indeterminate-icon="check_box_outline_blank"/>
          </q-field>
          <q-field v-if="data.type === 'number'"
            label="Minimum"
            helper="Optionally, enter a minimum valid number."
          >
            <q-input v-model="data.minimum" type="number"/>
          </q-field>
          <q-field v-if="data.type === 'number'"
            label="Maximum"
            helper="Optionally, enter a maximum valid number."
          >
            <q-input v-model="data.maximum" type="number"/>
          </q-field>
          <q-field
            label="Widget"
          >
          <div class="row inline">
            <span class="col-9">
              <q-select
                v-model="data.widget.type"
                :options="widgetOptions"
                clearable
              />
            </span>
            <span class="col-3">
              <q-btn label="options" size="sm" @click="open('widget_options')"/>
              <WidgetOptions :WidgetClass="getWidget(data.widget.type)" v-model="data.widget.options" :fields="widgetSchema(data.widget.type)" :schema="schema" :variable="variable" :title="`${variable} widget options`" ref="widget_options"/>
            </span>
          </div>
          </q-field>
          <q-field v-if="data.validators"
            label="Custom validators"
          >
            <q-btn-dropdown label="Add validator">
              <q-list link>
                <q-item v-for="(v, id) in validatorsByType(data.type)" :key="id" v-close-overlay @click.native="addValidator(id)" :title="v.description">
                  <q-item-main>
                    <q-item-tile label>{{v.name}}</q-item-tile>
                  </q-item-main>
                </q-item>
              </q-list>
            </q-btn-dropdown>
            <div v-for="(v, index) in data.validators" :key="index" :title="validators[v.id].description">
              <q-btn flat dense round icon="delete_outline" @click="removeValidator(index)"/> {{validators[v.id].name}}  <label title="Raise as a warning only"><input type="checkbox" v-model="v.options.warning"/>Warning only</label><q-btn size="sm" v-if="validators[v.id].uses_options" label="Options" @click="open('validator_options_'+v.id)"/>
              <ValidatorOptions v-model="v.options" :fields="validators[v.id].schema" :schema="schema" :variable="variable" :title="`${validators[v.id].name} validator options`" :ref="`validator_options_${v.id}`" v-if="validators[v.id].uses_options"/>
            </div>
          </q-field>
          <q-field
            label="Validation Error Message"
          >
            <q-input v-model="data.error_message" type="textarea" placeholder="Optionally add a custom validation message here."/>
          </q-field>
          <h5>Printing options</h5>
            <q-field
              label="Field label"
            >
              <q-input v-model="data.printing.label" placeholder="Optionally add a shortened label."/>
            </q-field>
            <q-field
              label="Hidden"
            >
              <q-checkbox v-model="data.printing.hidden" indeterminate-icon="check_box_outline_blank"/>
            </q-field>
            <q-field
              label="Truncate after N characters"
            >
              <q-input v-model="data.printing.truncate_at" type="number" />
            </q-field>
        </div>
        <q-toolbar slot="footer">
          <q-toolbar-title>
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
          </q-toolbar-title>
        </q-toolbar>
      </q-modal-layout>
    </q-modal> -->

    <q-dialog v-model="opened" ref="modal">
      <q-card style="width: 800px; max-width: 80vw;">
        <q-bar>
          Field options for: {{variable}} {{type}}
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section v-if="opened">
          <q-input dense label="Description" v-model="data.description" autogrow placeholder="Enter description here."/>
            <!-- <q-checkbox v-model="data.unique" :false-value="true" :true-value="false" indeterminate-icon="check_box_outline_blank" unchecked-icon="check_box" checked-icon="check_box_outline_blank" keep-color /> -->
          <q-checkbox dense label="Unique" v-if="type!='submission'" v-model="data.unique"/>
            <!-- :false-value="undefined" toggle-indeterminate="false" indeterminate-value="none"/> -->
          <q-field label="Pin column" stack-label borderless>
            <q-radio dense v-model="data.pinned" :val="undefined" label="Not pinned" />
            <q-radio dense v-model="data.pinned" val="left" label="Pinned left" />
            <q-radio dense v-model="data.pinned" val="right" label="Pinned right" />
          </q-field>
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
            helper="Enter a valid regular expression to validate against. Example for matching values such as '20.3 ul': ^\d+(\.{1}\d+)? ul$"
            v-model="data.pattern"
            />
          <q-select
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
            helper="If the variable should be constrained to specific choices, enter here."
            />
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
            helper="Optionally, enter a minimum valid number."
            v-model="data.minimum"
            type="number"
            />
          <q-input
            dense
            v-if="data.type === 'number'"
            label="Maximum"
            helper="Optionally, enter a maximum valid number."
            v-model="data.maximum"
            type="number"
            />
          <q-field
            dense
            label="Widget"
            borderless
            style="width:100%"
          >
            <span class="col-9">
              <q-select
                dense options-dense
                v-model="data.widget.type"
                :options="widgetOptions"
                clearable
              />
            </span>
            <span class="col-3" v-if="hasWidgetOptions(data.widget.type)">
              <q-btn label="options" size="sm" @click="open('widget_options')"/>
              <WidgetOptions :WidgetClass="getWidget(data.widget.type)" v-model="data.widget.options" :fields="widgetSchema(data.widget.type)" :schema="schema" :variable="variable" :title="`${variable} widget options`" ref="widget_options"/>
            </span>
          </q-field>
          <q-field v-if="data.validators"
            label="Custom validators"
            stack-label
            borderless
          >
            <q-btn-dropdown size="md" label="Add validator">
              <q-list>
                <q-item clickable v-for="(v, id) in validatorsByType(data.type)" :key="id" v-close-popup @click.native="addValidator(id)" :title="v.description">
                  <q-item-label>
                    <q-item-section label>{{v.name}}</q-item-section>
                  </q-item-label>
                </q-item>
              </q-list>
            </q-btn-dropdown>
          </q-field>
          <div v-for="(v, index) in data.validators" :key="index" :title="validators[v.id].description">
            <q-btn flat dense round icon="delete_outline" @click="removeValidator(index)"/> {{validators[v.id].name}}  <label title="Raise as a warning only"><input type="checkbox" v-model="v.options.warning"/>Warning only</label><q-btn size="sm" v-if="validators[v.id].uses_options" label="Options" @click="open('validator_options_'+v.id)"/>
            <ValidatorOptions v-model="v.options" :fields="validators[v.id].schema" :schema="schema" :variable="variable" :title="`${validators[v.id].name} validator options`" :ref="`validator_options_${v.id}`" v-if="validators[v.id].uses_options"/>
          </div>
          <q-input label="Validation Error Message" v-model="data.error_message" autogrow placeholder="Optionally add a custom validation message here."/>
          <h5>Printing options</h5>
            <q-input dense label="Field label" v-model="data.printing.label" placeholder="Optionally add a shortened label."/>
            <!-- <q-checkbox v-model="data.unique" :false-value="true" :true-value="false" indeterminate-icon="check_box_outline_blank" unchecked-icon="check_box" checked-icon="check_box_outline_blank" keep-color /> -->
            <q-checkbox dense label="Hidden" v-model="data.printing.hidden"/>
            <!-- :false-value="undefined" toggle-indeterminate="false" indeterminate-value="none"/> -->
            <q-input dense label="Truncate after N characters" v-model="data.printing.truncate_at" type="number" />
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
import sampleWidgetFactory from './aggrid/widgets.js'
import WidgetOptions from './modals/WidgetOptions.vue'
import ValidatorOptions from './modals/ValidatorOptions.vue'

export default {
  props: ['value', 'variable', 'type', 'schema'],
  data () {
    return {
      opened: false,
      data: {enum: [], widget: {}, printing: {}},
      validators: this.$store.getters.validatorDict, // t{unique: {id: 'unique', name: 'Unique'}, foo: {id: 'foo', name: 'Foo'}},
      add_validator: null
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
      var validators = {}
      console.log('validators', this.$store.getters.validatorDict)
      for (var v in this.$store.getters.validatorDict) {
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
      var val = _.cloneDeep(this.data)
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
      this.data.validators.push({id: id, options: {}})
      console.log(id, this.data.validators)
    },
    removeValidator (index) {
      this.data.validators.splice(index, 1)
    },
    widgetSchema (id) {
      var factory = this.type === 'submission' ? submissionWidgetFactory : sampleWidgetFactory
      return factory.getWidgetSchema(id)
    },
    hasWidgetOptions (id) {
      return _.keys(this.widgetSchema(id)).length > 0
    },
    getWidget (id) {
      return this.widgetFactory.getWidget(id)
    }
  },
  computed: {
    widgetFactory () {
      return this.type === 'submission' ? submissionWidgetFactory : sampleWidgetFactory
    },
    widgetOptions () {
      console.log('widgetOptions', this.data.type, this.widgetFactory.getWidgets(this.data.type))
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
    WidgetOptions,
    ValidatorOptions
  }
}

</script>
