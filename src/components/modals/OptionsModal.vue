<template>
  <q-dialog v-model="opened" :content-css="{minWidth: '30vw', minHeight: '30vh'}" ref="modal">
    <q-card>
      <q-bar class="bg-primary text-white">
        {{schema.title}} options
        <q-space />
        <q-btn dense flat icon="close" v-close-popup>
          <q-tooltip>Close</q-tooltip>
        </q-btn>
      </q-bar>
      <q-card-section v-if="opened">
        {{schema.description}}
        <CustomFields v-model="data" :schema="schema" :errors="errors" :warnings="warnings" modify="true"/>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          color="positive"
          @click="save()"
          label="Save"
        />
        <q-btn
          @click="opened = false"
          label="Cancel"
          color="negative"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
// import Vue from 'vue'
import _ from 'lodash'
import CustomFields from '../forms/customFields.vue'
export default {
  props: ['variable', 'parentSchema', 'value', 'schema'],
  data () {
    return {
      data: _.cloneDeep(this.value),
      opened: false,
      errors: {},
      warnings: {}
    }
  },
  mounted: function () {
  },
  methods: {
    save () {
      this.$emit('input', this.data)
      this.close()
    },
    open () {
      this.errors = {}
      this.data = _.cloneDeep(this.value)
      this.opened = true
    },
    close () {
      this.opened = false
    },
    hasError (variable) {
      return this.errors && this.errors[variable]
    },
    error (variable) {
      return this.errors[variable] ? this.errors[variable].join(', ') : ''
    }
  },
  components: {
    CustomFields
  }
}
</script>
