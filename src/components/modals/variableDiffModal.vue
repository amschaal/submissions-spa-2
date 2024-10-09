<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="min-width: 800px; max-width: 80vw;">
      <q-card-section>
        <div class="text-h6">Compare submission types against variable {{ variable.variable }}</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <!-- {{ filtered_types }} -->
        <q-markup-table>
          <thead>
            <tr>
              <th class="text-left">Submission Type</th>
              <th class="text-right">Path</th>
              <th class="text-right">Changes</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="t in filtered_types" :key="t.id">
              <td class="text-left">{{t.type.name}}</td>
              <td class="text-right">{{t.path}}</td>
              <td class="text-right">
                <q-chip clickable @click="viewDiff(t.schema, t.diff)" v-if="t.diff" text-color="white" color="negative" icon="list">View Diff</q-chip>
                <q-chip v-else color="green" text-color="white" icon="check">No changes</q-chip>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn color="primary" label="OK" @click="onOKClick" />
        <q-btn color="primary" label="Cancel" @click="onCancelClick" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script>
import jsonDiffModal from './jsonDiffModal.vue'
import * as jsondiffpatch from 'jsondiffpatch'
const JD = jsondiffpatch.create({})
export default {
  props: ['variable', 'submission_types', 'type'],

  methods: {
    show () {
      console.log('refs', this.$refs)
      this.$refs.dialog.show()
    },
    hide () {
      this.$refs.dialog.hide()
    },
    viewDiff (left, diff) {
      this.$q.dialog({
        component: jsonDiffModal,
        parent: this,
        text: '',
        left: left,
        right: null,
        diff: diff
      }).onOk(() => {
      }).onCancel(() => {
        console.log('Cancel')
      }).onDismiss(() => {
        console.log('Called on OK or Cancel')
      })
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
  },
  computed: {
    filtered_types () {
      if (this.type === 'table') {
        return []
      } else {
        // return this.submission_types
        return this.submission_types.filter(t => t.submission_schema.order.indexOf(this.variable.variable) !== -1 && t.submission_schema.properties[this.variable.variable] !== undefined).map(t => ({ type: t, path: this.variable.variable, schema: t.submission_schema.properties[this.variable.variable], diff: JD.diff(this.variable.schema, t.submission_schema.properties[this.variable.variable])}))
      }
    }
  }
}
</script>
