<template>
  <div>
    <!-- <HotTable :settings="settings"></HotTable> -->
    <!-- <q-select :value="value" :options="options" @change="handleChange" filter filter-placeholder="select"/> -->
    <q-modal v-model="opened" :content-css="{minWidth: '90vw', minHeight: '90vh'}" ref="modal" no-backdrop-dismiss>
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Samplesheet
          </q-toolbar-title>
        </q-toolbar>

        <!-- <q-toolbar slot="header">
        </q-toolbar> -->

        <div class="layout-padding">
          <q-btn
            color="primary"
            @click="show_help = true"
            label="Help"
            icon="fas fa-question-circle"
            v-if="type.help"
          />
            <div id="example1" class="hot handsontable htRowHeaders htColumnHeaders"></div>
        </div>
        <q-toolbar slot="footer">
          <q-toolbar-title>
            <q-btn
              color="positive"
              label="Add Row"
              v-if="hst.addRow"
              @click="hst.addRow"
            />
            <q-btn
              color="negative"
              label="Remove selected rows"
              v-if="hst.removeRows"
              @click="hst.removeRows"
            />
            <q-btn
              label="Validate"
              v-if="hst.removeRows"
              @click="validate(false)"
            />
            <q-btn
              color="negative"
              label="Discard"
              @click="close"
              class="float-right"
            />
            <q-btn
              color="positive"
              label="Save"
              @click="validate(true)"
              class="float-right"
            />
          </q-toolbar-title>
        </q-toolbar>
      </q-modal-layout>
    </q-modal>
    <q-modal v-model="show_help">
      <q-modal-layout>
        <q-toolbar slot="header">
          <q-toolbar-title>
            Help
          </q-toolbar-title>
        </q-toolbar>
        <div class="layout-padding">
          <div v-html="type.help" v-if="type.help"></div>
          <q-btn
            color="primary"
            @click="show_help = false"
            label="Close"
          />
        </div>
      </q-modal-layout>
    </q-modal>
    <q-btn label="Samplesheet"  @click="openSamplesheet"/>
  </div>
</template>
<!-- <link type="text/css" rel="stylesheet" href="https://docs.handsontable.com/4.0.0/components/handsontable/dist/handsontable.full.min.css"> -->
<!-- <script src="https://cdnjs.cloudflare.com/ajax/libs/ajv/6.5.2/ajv.bundle.js"></script> -->

<!-- <script src='../assets/hot/handsontable.full.min.js'></script>
<script src='/statics/hot-schema/example_schema.js'></script>
<script src='/statics/hot-schema/hotschema.js'></script> -->

<script>
import { QSelect } from 'quasar'
// import HotTable from '@handsontable/vue'
// import Handsontable from 'handsontable'
import HotSchemaTable from '../assets/hot-schema/hotschema'
import _ from 'lodash'
// import axios from 'axios'

export default {
  props: ['value', 'type'],
  data () {
    return {
      opened: false,
      show_help: false,
      hst: {},
      // data: this.value ? this.value : [{}],
      settings: {
        data: [
          ['', 'Ford', 'Volvo', 'Toyota', 'Honda'],
          ['2016', 10, 11, 12, 13],
          ['2017', 20, 11, 14, 13],
          ['2018', 30, 15, 12, 13]
        ],
        colHeaders: true,
        rowHeaders: true
      }
    }
  },
  methods: {
    openSamplesheet () {
      console.log('data', this.value)
      if (!this.type || !this.type.schema) {
        this.$q.dialog({
          title: 'Alert',
          message: 'Please select a submission type first.'
        })
        return
      }
      // console.log('hst', HotSchemaTable)
      // if (!this.opened)
      // this.opened = true
      var self = this
      console.log('openSamplesheet')
      this.$refs.modal.show().then(() => {
        self.createTable(self.type.schema, _.cloneDeep(this.value))
      })
      console.log('endOpenSamplesheet')
      // this.hst = new HotSchemaTable(document.getElementById('example1'), ExampleSchemas.veggie)
    },
    // closeSamplesheet () {
    //   var self = this
    //   this.$refs.modal.hide().then(() => {
    //     self.hst.table.destroy()
    //     self.hst = {}
    //   })
    //   // this.hst = new HotSchemaTable(document.getElementById('example1'), ExampleSchemas.veggie)
    // },
    createTable (schema, data) {
      // var useschema = schema ? schema : ExampleSchemas.veggie
      console.log('create table', schema, data)
      if (this.hst.table) {
        console.log('Destroy!')
        this.hst.table.destroy()
      }
      this.hst = new HotSchemaTable(document.getElementById('example1'), schema, data)
      // this.hst.validateTable()
      console.log('end create table', schema, data)
    },
    save () {
      this.$emit('input', this.hst.table.getSourceData())
      this.close()
    },
    validate (save) {
      // this.hst.validateTable(true)
      console.log('validate', save)
      var self = this
      if (this.type) {
        this.$axios.post('/api/submission_types/' + this.type.id + '/validate_data/', {data: this.hst.table.getSourceData()})
          .then(function (response) {
            console.log(response)
            self.$q.notify({message: 'Submission successfully validated.', type: 'positive'})
            if (save) {
              self.save()
            }
          })
          .catch(function (error, stuff) {
            console.log('ERROR', error.response)
            self.hst.setErrors(error.response.data.errors)
            self.$q.notify({message: 'There were errors in your data.', type: 'negative'})
            // if (error.response) {
            //   self.errors = error.response.data.errors
            // }
          })
      }
    },
    close () {
      // this.data = this.value.slice()
      this.hst.table.destroy()
      this.hst = {}
      this.$refs.modal.hide()
    },
    modalOpened () {
      alert('hello?')
      console.log('modal opened')
    }

  },
  components: {
    // QSelect
    // HotTable
  },
  watch: {
    'hst.table': function (newval, oldval) {
      if (!oldval && newval) {
        this.validate()
      }
    }
  }
}

</script>

<style src="../../node_modules/handsontable/dist/handsontable.full.css"></style>
<style>
.htContextMenu, .htComments{
  z-index: 9999999 !important;
}
</style>
