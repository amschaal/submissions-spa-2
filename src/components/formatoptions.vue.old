<template>
  <div>
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
            Print options for: {{variable}}
          </q-toolbar-title>
        </q-toolbar>

        <div class="layout-padding">
          {{data}}
          <q-field
            label="Field label"
          >
            <q-input v-model="data.label" placeholder="Optionally add a shortened label."/>
          </q-field>
          <q-field
            label="Hidden"
          >
            <!-- <q-checkbox v-model="data.unique" :false-value="true" :true-value="false" indeterminate-icon="check_box_outline_blank" unchecked-icon="check_box" checked-icon="check_box_outline_blank" keep-color /> -->
            <q-checkbox v-model="data.hidden"/>
            <!-- :false-value="undefined" toggle-indeterminate="false" indeterminate-value="none"/> -->
          </q-field>
          <q-field
            label="Truncate after N characters"
          >
            <q-input v-model="data.truncate_at" type="number" />
          </q-field>

          <!-- <td v-if="p.type == 'string'"><q-btn v-if="p.enum" @click="removeOptions(p)">Remove options</q-btn><q-btn v-if="!p.enum" @click="useOptions(p)">Use Options</q-btn><q-chips-input v-if="p.enum" v-model="p.enum" placeholder="Enter options" /></td>
          <td v-if="p.type == 'number'">Number stuff</td> -->
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
    </q-modal>
    <q-btn label="Printing"  @click="openModal"/>
  </div>
</template>

<script>
import _ from 'lodash'
export default {
  props: ['value', 'variable'],
  data () {
    return {
      opened: false,
      data: {hidden: false}
    }
  },
  mounted () {
  },
  methods: {
    setup () {
      if (this.value) {
        this.data = _.cloneDeep(this.value)
      }
      if (!this.data.hidden) {
        this.$set(this.data, 'hidden', false)
      }
    },
    openModal () {
      this.setup()
      this.$refs.modal.show().then(() => {

      })
    },
    save () {
      var val = _.cloneDeep(this.data)
      console.log('save', val)
      this.$emit('input', val)
      this.$refs.modal.hide()
      // this.data
    },
    discard () {
      this.$refs.modal.hide()
    }
  }
}

</script>
