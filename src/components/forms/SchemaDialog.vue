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
          <schemaForm v-model="schema" :options="{variables: $store.getters.lab.table_variables}" type="table"/>
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
  props: ['value', 'variable'],
  data () {
    return {
      opened: false,
      schema: {}
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
  },
  components: {
    schemaForm: () => import('./schemaForm.vue')
  }
}

</script>
