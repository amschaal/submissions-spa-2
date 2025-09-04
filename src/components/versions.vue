<template>
  <div>
    <q-markup-table>
      <thead>
        <tr>
          <th class="text-left">Compare</th>
          <th class="text-left">Created</th>
          <th class="text-left">Created By</th>
          <th class="text-right">Comment</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="v in versions" :key="v.id">
          <td class="text-left"><q-radio v-model="v1" :val="v.id" label="V1" /><q-radio v-model="v2" :val="v.id" label="V2" /></td>
          <td class="text-left">{{ v.revision.date_created}}</td>
          <td class="text-left">{{ v.revision.user.username}}</td>
          <td class="text-right">{{ v.revision.comment}}</td>
        </tr>
      </tbody>
    </q-markup-table>
    <q-btn label="Compare" @click="loadVersions"/>
    <!-- {{ versions }} -->
      {{ diff }}
  </div>
</template>

<script>
import jsonDiffModal from './modals/jsonDiffModal.vue'
export default {
  props: ['submission'],
  data () {
    return {
      versions: [],
      versionDetails: {},
      v1: null,
      v2: null,
      diff: null
    }
  },
  mounted: function () {
    this.refreshVersions()
  },
  methods: {
    refreshVersions () {
      this.$axios
        .get(`/api/submissions/${this.submission.id}/versions/`)
        .then(({ data }) => {
          this.versions = data
        })
        .catch(error => {
          console.log(error)
          this.$q.notify({message: 'Unable to load versions'})
        })
    },
    compareVersions () {
      if (this.versionDetails[this.v1] && this.versionDetails[this.v2]) {
        this.$q.dialog({
          component: jsonDiffModal,
          parent: this,
          // props forwarded to component
          // (everything except "component" and "parent" props above):
          // text: 'Comparing selected versions:',
          dismissOnly: true,
          left: this.versionDetails[this.v1],
          right: this.versionDetails[this.v2]
        // }).onOk(() => {
        //   // this.$q.notify({message: `Okay.`, type: 'positive'})
        // }).onCancel(() => {
        //   console.log('Cancel')
        }).onDismiss(() => {
          console.log('Called on OK or Cancel')
        })
      }
    },
    loadAndCompare (id) {
      if (this.versionDetails[id]) {
        this.compareVersions()
      } else {
        this.$axios
          .get(`/api/submissions/${this.submission.id}/versions/${id}/serialize/`)
          .then(({ data }) => {
            this.versionDetails[id] = data
            this.compareVersions()
          })
          .catch(error => {
            console.log(error)
            this.$q.notify({message: 'Unable to load version '})
          })
      }
    },
    loadVersions () {
      if (this.v1 && this.v2) {
        if (this.versionDetails[this.v1] && this.versionDetails[this.v2]) {
          this.compareVersions()
        } else {
          this.loadAndCompare(this.v1)
          this.loadAndCompare(this.v2)
        }
      } else {
        this.$q.notify({message: 'Please select 2 versions to compare'})
      }
    }
  }
}
</script>
