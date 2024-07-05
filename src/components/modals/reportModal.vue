<template>
  <span>
    <q-dialog
      v-model="opened"
    >
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Reports</div>
        </q-card-section>

        <q-card-section class="q-pt-none" v-on:selected="updateSelected">
          <!-- qs: {{ qs }}
          {{ reports }} -->
          <table v-if="reports">
            <thead>
              <tr><th>Name</th><th>Description</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in reports" :key="r.id">
                <td>{{ r.name }}</td>
                <td>{{ r.description }}</td>
              </tr>
            </tbody>
          </table>
          <h3 v-else>
            Loading reports...
          </h3>
        </q-card-section>
        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Export" @click="select" /> <q-btn flat label="Create" @click="create" />  <q-btn flat label="Cancel" @click="cancel" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </span>
</template>
<script>
export default {
  props: {
  },
  data () {
    return {
      qs: '',
      opened: false,
      reports: null
    }
  },
  mounted () {
    this.$axios.get('/api/submissions/reports/').then(response => {
      this.reports = response.data
    })
  },
  methods: {
    open (qs) {
      this.qs = qs
      this.opened = true
    },
    cancel () {
      this.opened = false
    }
  }
}
</script>
