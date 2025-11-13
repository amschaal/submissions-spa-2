<template>
  <q-page padding class="docs-input row justify-center">

    <q-card>
      <q-card-section>
        <router-link :to="{ name: 'institutions'}">Institutions</router-link> / <span v-if="institution">{{ institution.name }}</span>
      </q-card-section>

      <q-separator />
      <q-card-section>
        <q-tabs
          v-model="tab"
          dense
          class="bg-primary text-grey shadow-2"
          active-color="white"
          align="justify"
          narrow-indicator
        >
          <q-tab name="groups"  default>Groups</q-tab>
          <q-tab name="submissions" label="Submissions"/>
        </q-tabs>
        <q-tab-panels v-model="tab" animated :keep-alive="true">
          <q-tab-panel name="groups">
            <q-card-section>
            <group-table :query-params="`institution__id=${this.id}`"></group-table>
            </q-card-section>
          </q-tab-panel>
          <q-tab-panel name="submissions">
            <q-card-section>
            <submissions :query-params="`pi__institution__id=${id}`" v-if="id"></submissions>
            </q-card-section>
          </q-tab-panel>
        </q-tab-panels>

    </q-card-section>
  </q-card>
  </q-page>
</template>

<style>
</style>

<script>
import GroupTable from '../components/tables/GroupTable.vue'
import submissions from '../components/submissions.vue'
export default {
  props: ['id'],
  data () {
    return {
      'institution': null,
      'tab': 'groups'
    }
  },
  mounted () {
    this.$axios.get(`/api/group_institutions/${this.id}/`)
      .then(response => {
        this.institution = response.data
      })
  },
  name: 'Institution',
  components: {
    GroupTable,
    submissions
  }
}
</script>
