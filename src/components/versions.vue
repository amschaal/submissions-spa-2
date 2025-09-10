<template>
  <div>
    <q-markup-table>
      <thead>
        <tr>
          <th class="text-left">Action</th>
          <th class="text-left">Compare</th>
          <th class="text-left">Created</th>
          <th class="text-left">Created By</th>
          <th class="text-right">Comment</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="v in versions" :key="v.id">
          <td><q-btn label="revert" @click="revert(v)"/></td>
          <td class="text-left"><q-radio v-model="v1" :val="v" label="V1" /><q-radio v-model="v2" :val="v" label="V2" :disable="v1 && v1.revision.date_created < v.revision.date_created"/></td>
          <td class="text-left">{{ v.revision.date_created}}</td>
          <td class="text-left"><span v-if="v.revision.user">{{ v.revision.user.username}}</span><span v-else></span></td>
          <td class="text-right">{{ v.revision.comment}}</td>
        </tr>
      </tbody>
    </q-markup-table>
    <q-btn color="primary" label="Compare" @click="loadVersions"/>
    <!-- {{ versions }} -->
  </div>
</template>

<script>
import jsonDiffModal from './modals/jsonDiffModal.vue'
export default {
  props: ['versionsUrl'],
  data () {
    return {
      versions: [],
      versionDetails: {},
      v1: null,
      v2: null
    }
  },
  mounted: function () {
    this.refreshVersions()
  },
  methods: {
    refreshVersions () {
      this.$axios
        .get(this.versionsUrl)
        .then(({ data }) => {
          this.versions = data
        })
        .catch(error => {
          console.log(error)
          this.$q.notify({message: 'Unable to load versions'})
        })
    },
    compareVersions () {
      if (this.v1 && this.v2 && this.versionDetails[this.v1.id] && this.versionDetails[this.v2.id]) {
        this.$q.dialog({
          component: jsonDiffModal,
          parent: this,
          // props forwarded to component
          // (everything except "component" and "parent" props above):
          text: `Showing changes that happened between ${this.v2.revision.date_created} and ${this.v1.revision.date_created}`,
          dismissOnly: true,
          left: this.versionDetails[this.v2.id],
          right: this.versionDetails[this.v1.id]
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
          .get(`${this.versionsUrl}/${id}/serialize/`)
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
        if (this.versionDetails[this.v1.id] && this.versionDetails[this.v2.id]) {
          this.compareVersions()
        } else {
          this.loadAndCompare(this.v1.id)
          this.loadAndCompare(this.v2.id)
        }
      } else {
        this.$q.notify({message: 'Please select 2 versions to compare'})
      }
    },
    revert (version) {
      if (!confirm(`Are you sure you want to revert to the version from ${version.revision.date_created}?`)) {
        return
      }
      this.$axios
        .post(`${this.versionsUrl}/${version.id}/revert/`)
        .then(({ data }) => {
          // this.$q.notify({message: `Version reverted to ${version.revision.date_created}, please refresh this page.`})
          this.$q.notify({
            message: `Version reverted to ${version.revision.date_created}, please refresh this page.`,
            icon: 'refresh',
            closeBtn: 'Refresh',
            color: "positive",
            timeout: 0,
            onDismiss () {
              location.reload(true)
            }
          })
        })
        .catch(error => {
          console.log(error)
          this.$q.notify({message: 'Unable to load version '})
        })
    }
  },
  watch: {
    v1 (val) {
      if (val && this.v2 && this.v2.revision.date_created > val.revision.date_created) {
        this.v2 = null
      }
    }
  }
}
</script>
