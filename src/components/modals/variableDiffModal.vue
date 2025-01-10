<template>
  <q-dialog ref="dialog" @hide="onDialogHide">
    <q-card class="q-dialog-plugin" style="min-width: 1000px; max-width: 90vw;">
      <q-card-section>
        <div class="text-h6">Compare submission types against variable "{{ variable.variable }}"</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
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
              <td class="text-left"><router-link :to="{ name: 'submission_type', params: { id: t.type.id } }">{{
                t.type.name }}</router-link></td>
              <td class="text-right">{{ t.path }}</td>
              <td class="text-right">
                <q-chip clickable @click="viewDiff(t)" v-if="t.diff" text-color="white" color="negative"
                  icon="list">View Diff</q-chip>
                <q-chip v-else color="green" text-color="white" icon="check">No changes</q-chip>
              </td>
            </tr>
          </tbody>
        </q-markup-table>
      </q-card-section>
      <q-card-actions align="right">
        <!-- <q-btn color="primary" label="OK" @click="onOKClick" /> -->
        <q-btn color="primary" label="Dismiss" @click="onCancelClick" />
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
      this.$refs.dialog.show()
    },
    hide () {
      this.$refs.dialog.hide()
    },
    viewDiff (t) {
      this.$q.dialog({
        component: jsonDiffModal,
        parent: this,
        text: `Differences found between Settings->${this.variable.variable} and "${t.type.name}"->${t.path}.`,
        left: this.variable.schema,
        right: null,
        dismissOnly: true,
        diff: t.diff
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
        const variables = []
        this.submission_types.forEach(t => {
          t.submission_schema.order.forEach(v => {
            if (t.submission_schema.properties[v].type === 'table') {
              t.submission_schema.properties[v].schema.order.forEach(v2 => {
                const schema = t.submission_schema.properties[v].schema.properties[v2]
                if (v2 === this.variable.variable && schema) {
                  variables.push({ type: t, path: `${v}->${v2}`, schema, diff: JD.diff(this.variable.schema, schema) })
                }
              })
            }
          })
        })
        return variables
      } else {
        // return this.submission_types
        return this.submission_types.filter(t => t.submission_schema.order.indexOf(this.variable.variable) !== -1 && t.submission_schema.properties[this.variable.variable] !== undefined).map(t => ({ type: t, path: this.variable.variable, schema: t.submission_schema.properties[this.variable.variable], diff: JD.diff(this.variable.schema, t.submission_schema.properties[this.variable.variable]) }))
      }
    }
  }
}
</script>
