<template>
  <q-modal v-model="opened" :content-css="{minWidth: '30vw', minHeight: '30vh'}" ref="modal">
    <q-modal-layout>
      <q-toolbar slot="header">
        <q-toolbar-title>
          {{title}}
        </q-toolbar-title>
      </q-toolbar>
    <div class="layout-padding">
      Testing {{schema}} {{value}} {{data}}
      <div v-for="(v, i) in schema" :key="i">
        <q-input v-model="data[v.variable]" :stack-label="v.label" />
      </div>
    </div>
    <q-toolbar slot="footer">
      <q-toolbar-title>
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
      </q-toolbar-title>
    </q-toolbar>
  </q-modal-layout>
  </q-modal>
</template>

<script>
// import Vue from 'vue'
import _ from 'lodash'
export default {
  props: ['schema', 'value', 'title'],
  data () {
    return {
      data: _.cloneDeep(this.value),
      opened: false
    }
  },
  mounted: function () {
  },
  methods: {
    save () {
      console.log('save', this.data)
      this.$emit('input', this.data)
      this.close()
    },
    open () {
      this.data = _.cloneDeep(this.value)
      this.opened = true
    },
    close () {
      this.opened = false
    }
  },
  components: {
  }
}
</script>
