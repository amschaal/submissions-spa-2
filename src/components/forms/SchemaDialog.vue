<template>
  <div style="display: inline-block">
    <q-dialog v-model="opened" ref="modal" full-width>
      <q-card>
        <q-bar class="bg-primary text-white">
          Table definition for: {{variable.variable}}
          <q-space />
          <q-btn dense flat icon="close" v-close-popup>
            <q-tooltip>Close</q-tooltip>
          </q-btn>
        </q-bar>
        <q-card-section v-if="opened">
          <q-card class="p90">
          <q-tabs
            v-model="tab"
            dense
            class="bg-primary text-grey shadow-2"
            active-color="white"
            align="justify"
            narrow-indicator
          >
            <q-tab name="columns" label="Columns" />
            <q-tab name="options" label="Options" />
          </q-tabs>
          <q-separator />
          <q-tab-panels v-model="tab" animated>
            <q-tab-panel name="columns">
              <div class="text-h6">Columns</div>
              <Agschema v-model="schema.examples" :schema="schema" :editable="true"  ref="examples" :allow-force-save="false"/>
              <q-btn :label="exampleLabel"  @click="openExamples"/>
              <schemaForm v-model="schema" :root-schema="rootSchema" :options="{variables: $store.getters.lab.table_variables}" type="table"/>
            </q-tab-panel>
            <q-tab-panel name="options">
              <div class="text-h6">Options</div>
              <q-input dense label="Description" v-model="schema.description" autogrow placeholder="Enter optional description here."/>
              <q-field
                label="Help"
                stack-label
                borderless
              >
                <q-editor v-model="schema.help"
                  :toolbar="toolbar"
                  :fonts="fonts"
                />
              </q-field>
              <h5>Printing options</h5>
              <q-checkbox dense label="Hidden" v-model="schema.printing.hidden"/>
            </q-tab-panel>
          </q-tab-panels>
        </q-card>
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
    <q-btn @click="open" label="Configure"/>
    <!-- <q-btn label="Options"  @click="openModal"/> -->
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  props: ['value', 'variable', 'rootSchema'],
  data () {
    return {
      opened: false,
      schema: {},
      tab: 'columns',
      toolbar: [
        ['bold', 'italic', 'strike', 'underline', 'subscript', 'superscript'],
        ['token', 'hr', 'link', 'custom_btn'],
        ['quote', 'unordered', 'ordered', 'outdent', 'indent'],
        ['table'],
        [
          {
            label: this.$q.lang.editor.formatting,
            icon: this.$q.iconSet.editor.formatting,
            list: 'no-icons',
            options: [
              'p',
              'h1',
              'h2',
              'h3',
              'h4',
              'h5',
              'h6',
              'code'
            ]
          },
          {
            label: this.$q.lang.editor.fontSize,
            icon: this.$q.iconSet.editor.fontSize,
            fixedLabel: true,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'size-1',
              'size-2',
              'size-3',
              'size-4',
              'size-5',
              'size-6',
              'size-7'
            ]
          },
          {
            label: this.$q.lang.editor.defaultFont,
            icon: this.$q.iconSet.editor.font,
            fixedIcon: true,
            list: 'no-icons',
            options: [
              'default_font',
              'arial',
              'arial_black',
              'comic_sans',
              'courier_new',
              'impact',
              'lucida_grande',
              'times_new_roman',
              'verdana'
            ]
          },
          'removeFormat'
        ],
        ['undo', 'redo'],
        ['fullscreen'],
        ['viewsource']
      ],
      fonts: {
        arial: 'Arial',
        arial_black: 'Arial Black',
        comic_sans: 'Comic Sans MS',
        courier_new: 'Courier New',
        impact: 'Impact',
        lucida_grande: 'Lucida Grande',
        times_new_roman: 'Times New Roman',
        verdana: 'Verdana'
      }
      // options: this.value && this.value.enum ? this.value.enum : []
    }
  },
  mounted () {
    // console.log('widgetFactory', widgetFactory.getWidgetOptions('text'))
    // this.setup()
  },
  methods: {
    setup () {
      this.schema = _.cloneDeep(this.variable.schema.schema)
      if (!this.schema.examples) {
        this.$set(this.schema, 'examples', [])
      }
      if (!this.schema.printing) {
        this.$set(this.schema, 'printing', { hidden: false })
      }
    },
    open () {
      this.setup()
      // this.data = _.cloneDeep(this.value)
      console.log('root', this.$root.validators)

      console.log('openModal', this.value, this.data)
      this.$refs.modal.show()
      // .then(() => {
      //
      // })
    },
    openExamples () {
      this.$refs.examples.openSamplesheet()
    },
    // open (ref) {
    //   console.log('open', this.$refs[ref], ref)
    //   if (Array.isArray(this.$refs[ref])) {
    //     this.$refs[ref][0].open()
    //   } else {
    //     this.$refs[ref].open()
    //   }
    // },
    save () {
      // this.local_data = this.hst.table.getSourceData()
      // this.data = this.hst.table.getSourceData() // this.local_data
      // this.value = this.options
      // var val = _.cloneDeep(this.schema)
      this.$emit('input', this.schema)
      this.$refs.modal.hide()
      // this.data
    },
    discard () {
      this.$refs.modal.hide()
    }
  },
  computed: {
    exampleLabel () {
      return 'Examples (' + this.schema.examples.length + ')'
    }
  },
  components: {
    schemaForm: () => import('./schemaForm.vue'),
    Agschema: () => import('../agschema.vue')
  }
}

</script>
