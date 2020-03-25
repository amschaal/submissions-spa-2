<template>
  <div>
    <q-banner dense rounded class="text-white bg-warning" v-if="!value.samples_received">
      <template v-slot:avatar>
        <q-icon name="warning" size="sm"/>
      </template>
      Samples not yet received.
      <span v-if="admin">
        Mark as received <a class="action" @click="markReceived()">today by me</a>
        or <a class="action" @click="openModal">set a specific date</a>.
      </span>
    </q-banner>
    <q-banner dense rounded class="text-white bg-positive" v-else>
      <template v-slot:avatar>
        <q-icon name="info" size="sm"/>
      </template>
      Samples received on {{value.samples_received|formatDate}} by {{value.received_by_name}} <a class="action" @click="openModal" v-if="admin">Edit</a>
    </q-banner>

    <q-dialog  v-model="opened" :content-css="{width: '500px', minHeight: '40vh'}" ref="modal">
        <q-card>
          <q-card-section>
            <q-toolbar-title>
              Samples received for {{data.internal_id}}
            </q-toolbar-title>
          </q-card-section>
          <q-card-section v-if="opened && data && data.id">
              <!-- <q-datetime v-model="data.samples_received" type="date" /> -->
              <q-input
                helper="Select the date that samples were received. Will default to today."
                label="Received"
                :error="errors.samples_received"
                :error-message="errors.samples_received"
                filled v-model="data.samples_received"
                > <!--mask="date" :rules="['date']"-->
                <template v-slot:append>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy ref="qDateProxy" transition-show="scale" transition-hide="scale">
                      <q-date v-model="data.samples_received" @input="() => $refs.qDateProxy.hide()" mask="YYYY-MM-DD" />
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <q-select
                v-model="data.received_by"
                :options="$store.getters.staffOptions"
                label="Received by"
                helper="Who received the samples?  Will default to you."
                :error="errors.received_by"
                :error-message="errors.received_by"
                emit-value
                map-options
              />
          </q-card-section>
          <q-card-actions align="right">
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
          </q-card-actions>
        </q-card>
    </q-dialog>
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
