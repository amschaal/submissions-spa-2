<template>
  <div>
  <span><q-btn label="Versions" @click="show"/></span>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="min-width: 90%;">
      <q-card-section>
        <div class="text-h6">Versions</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <Versions ref="versions" :versions-url="versionsUrl" @on-load="load" :object-id="objectId" :view-router-name="viewRouterName" :object-url-name="objectUrlName" :object-url="objectUrl"/>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="Dismiss" @click="dismiss" />
      </q-card-actions>
    </q-card>
  </q-dialog>
  </div>
</template>

<script>
import Versions from '../versions.vue'
export default {
  props: ['versionsUrl', 'onLoad', 'objectId', 'viewRouterName', 'objectUrlName', 'objectUrl'],
  emits: ['hide', 'on-load'],

  methods: {
    show () {
      this.$refs.dialog.show()
    },
    // Forward the Versions child's on-load event to this modal's parent.
    load (version) {
      this.$emit('on-load', version)
    },
    hide () {
      this.$refs.dialog.hide()
    },
    onDialogHide () {
      // required to be emitted
      // when QDialog emits "hide" event
      this.$emit('hide')
    },
    dismiss () {
      // we just need to hide dialog
      this.hide()
    }
  },
  components: {
    Versions
  }
}
</script>
