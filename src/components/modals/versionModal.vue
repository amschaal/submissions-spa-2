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
        <div v-if="dismissOnly">
          <q-btn color="primary" label="Dismiss" @click="dismiss" />
        </div>
        <div v-else>
          <q-btn color="primary" label="Dismiss" @click="dismiss" />
        </div>
      </q-card-actions>
    </q-card>
  </q-dialog>
  </div>
</template>

<script>
import Versions from '../Versions.vue'
export default {
  props: ['versionsUrl', 'onLoad', 'objectId', 'viewRouterName', 'objectUrlName', 'objectUrl'],

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
    dismiss () {
      // we just need to hide dialog
      this.hide()
    },
    load (version) {
    }
  },
  computed: {
    versionCount () {
      console.log('refs!!', this.$refs)
      return 3
    }
  },
  components: {
    Versions
  }
}
</script>
