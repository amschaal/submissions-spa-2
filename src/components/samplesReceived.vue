<template>
  <div>
    <q-alert type="warning" v-if="!value.samples_received">
       Samples not yet received.
       <span v-if="admin">
         Mark as received <a class="action" @click="markReceived()">today by me</a>
         or <a class="action" @click="openModal">set a specific date</a>.
       </span>
    </q-alert>
    <q-alert type="positive" v-else>
      Samples received on {{value.samples_received|formatDate}} by {{value.received_by_name}} <a class="action" @click="openModal" v-if="admin">Edit</a>
    </q-alert>

    <q-modal v-model="opened" :content-css="{width: '500px', minHeight: '40vh'}" ref="modal">
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
            Samples received for {{data.internal_id}}
          </q-toolbar-title>
        </q-toolbar>

        <div class="layout-padding" v-if="opened && data && data.id">
            <q-field
              helper="Select the date that samples were received. Will default to today."
              label="Received"
              :error="errors.samples_received"
              :error-label="errors.samples_received"
            >
              <q-datetime v-model="data.samples_received" type="date" />
            </q-field>
            <q-field
              label="Received by"
              helper="Who received the samples?  Will default to you."
              :error="errors.received_by"
              :error-label="errors.received_by"
            >
              <q-select
                v-model="data.received_by"
                :options="$store.getters.staffOptions"
              />
            </q-field>
        </div>
        <q-toolbar slot="footer">
          <q-toolbar-title>
            <q-btn
              color="negative"
              label="Cancel"
              @click="cancel"
              class="float-right"
            />
            <q-btn
              color="positive"
              label="Save"
              @click="save"
              class="float-right"
            />
          </q-toolbar-title>
        </q-toolbar>
      </q-modal-layout>
    </q-modal>
  </div>
</template>

<script>
import _ from 'lodash'

export default {
  props: ['value', 'admin'],
  data () {
    return {
      opened: false,
      data: {}, // _.cloneDeep(this.value),
      errors: {}
    }
  },
  mounted () {
    // console.log('widgetFactory', widgetFactory.getWidgetOptions('text'))
    // this.setup()
    this.data = _.cloneDeep(this.value)
  },
  methods: {
    setup () {
      this.data = _.cloneDeep(this.value)
    },
    openModal () {
      this.setup()
      // this.data = _.cloneDeep(this.value)
      console.log('root', this.$root.validators)

      console.log('openModal', this.value, this.data)
      this.$refs.modal.show().then(() => {

      })
    },
    open (ref) {
      console.log('open', this.$refs[ref], ref)
      if (Array.isArray(this.$refs[ref])) {
        this.$refs[ref][0].open()
      } else {
        this.$refs[ref].open()
      }
    },
    save () {
      // this.local_data = this.hst.table.getSourceData()
      // this.data = this.hst.table.getSourceData() // this.local_data
      // this.value = this.options
      this.markReceived(this.data.samples_received, this.data.received_by)
      // this.data
    },
    markReceived (received, receivedBy) {
      // this.data['samples_received'] = '2019-12-01'
      // this.$emit('input', this.data)
      // this.$refs.modal.hide()
      var self = this
      var data = {}
      if (received) {
        data['received'] = received
      }
      if (receivedBy) {
        data['received_by'] = receivedBy
      }
      this.$axios.post(`/api/submissions/${this.value.id}/samples_received/`, data)
        .then(function (response) {
          console.log('received', self, response.data.submission)
          // self.$set(self, 'data', response.data.submission)
          self.data.samples_received = response.data.submission.samples_received
          self.data.received_by = response.data.submission.received_by
          self.data.received_by_name = response.data.submission.received_by_name
          self.$emit('input', self.data)
          self.$refs.modal.hide()
        })
        .catch(function (response) {
          self.$q.notify({message: 'Error: Unable to mark samples as received!', type: 'negative'})
        })
    },
    cancel () {
      this.$refs.modal.hide()
    }
  },
  computed: {
    receivedByOptions () {
      return []
    }
  }
}

</script>

<style>
a.action {
  text-decoration: underline;
  color: white;
  cursor: pointer;
}
</style>
