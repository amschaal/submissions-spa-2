<template>
  <q-page padding class="docs-input row justify-center">

    <q-card>
      <q-card-section>
        <router-link :to="{ name: 'institutions'}">Institutions</router-link> / <span v-if="institution">{{ institution.name }}</span>
      </q-card-section>

      <q-separator />
      <q-card-section>
       <group-table :query-params="`institution__id=${this.id}`"></group-table>
    </q-card-section>
  </q-card>
  </q-page>
</template>

<style>
</style>

<script>
import GroupTable from '../components/tables/GroupTable.vue'
export default {
  props: ['id'],
  data () {
    return {
      'institution': null
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
    GroupTable
  }
}
</script>
