<template>
  <span>
    <q-dialog
      v-model="opened"
    >
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">{{title}}</div>
        </q-card-section>

        <q-card-section class="q-pt-none" v-on:selected="updateSelected">
          <slot name="table">Table </slot>
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="OK" @click="select" /> <q-btn flat label="Cancel" @click="cancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-btn size="sm" label="Modify" @click="opened = true"/>
  </span>
</template>
<script>
export default {
  props: ['title', 'value'],
  data () {
    return {
      opened: false,
      selected: this.value ? this.value : []
    }
  },
  mounted () {
    this.$on('selected', this.updateSelected)
  },
  methods: {
    select () {
      // alert('selected')
      this.$emit('input', this.selected)
      this.opened = false
    },
    cancel () {
      // alert('selected')
      this.selected = this.value ? this.value : []
      this.opened = false
    },
    updateSelected (selection) {
      console.log('selection updated', selection)
      this.selected = selection
    }
  }
}
</script>
