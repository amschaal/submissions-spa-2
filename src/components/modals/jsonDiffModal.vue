<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="min-width: 800px; max-width: 80vw;">
      <q-card-section>
        <div class="text-h6">{{ getTitle }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <h6 v-if="text">{{ text }}</h6>
      </q-card-section>
      <q-card-section class="q-pt-none">
        Change details:
        <jsonDiff v-if="left && right || left && diff" :left="left" :right="right" :diff="diff"/>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick" />
        <q-btn color="primary" label="Cancel" @click="onCancelClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import jsonDiff from '../jsonDiff.vue'
export default {
  props: ['left', 'right', 'diff', 'text', 'title'],

  methods: {
    show () {
      this.$refs.dialog.show()
    },
    hide () {
      this.$refs.dialog.hide()
    },
    onDialogHide () {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },

    onOKClick () {
      // on OK, it is REQUIRED to
      // emit "ok" event (with optional payload)
      // before hiding the QDialog
      this.$emit('ok')
      // or with payload: this.$emit('ok', { ... })

      // then hiding dialog
      this.hide()
    },

    onCancelClick () {
      // we just need to hide dialog
      this.hide()
    }
  },
  components: {
    jsonDiff
  },
  computed: {
    getTitle () {
      return this.title || 'JSON Diff Viewer'
    }
  }
}
</script>
