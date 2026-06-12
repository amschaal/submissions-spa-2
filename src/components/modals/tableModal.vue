<template>
  <span>
    <q-dialog
      v-model="opened"
    >
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">{{title}}
              <q-btn color="primary" v-if="help">
              Help
              <q-tooltip class="bg-primary" style="font-size: 16px" :offset="[10, 10]">
                {{help}}
              </q-tooltip>
            </q-btn>
          </div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <!-- Slot content should call updateSelected with the new selection
               (e.g. <userTable @selected="slotProps.updateSelected"/>). -->
          <slot name="table" :update-selected="updateSelected">Table </slot>
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="OK" @click="select" /> <q-btn flat label="Cancel" @click="cancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-btn :size="buttonProps.size" :label="buttonProps.label" @click="open"/>
  </span>
</template>
<script>
export default {
  props: {
    title: String,
    modelValue: Array,
    buttonProps: { type: Object, default: function () { return { label: 'Modify', size: 'sm'} }},
    help: String
  },
  emits: ['update:modelValue'],
  data () {
    return {
      opened: false,
      selected: this.modelValue ? this.modelValue : []
    }
  },
  methods: {
    open () {
      this.opened = true
    },
    select () {
      this.$emit('update:modelValue', this.selected)
      this.opened = false
    },
    cancel () {
      this.selected = this.modelValue ? this.modelValue : []
      this.opened = false
    },
    updateSelected (selection) {
      console.log('selection updated', selection)
      this.selected = selection
    }
  }
}
</script>
