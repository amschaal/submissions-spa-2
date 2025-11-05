<template>
  <q-page padding class="docs-input row justify-center">

    <q-card>
      <q-card-section>
        Institutions
      </q-card-section>

      <q-separator />
      <q-card-section>
       <institution-table></institution-table>
    </q-card-section>
  </q-card>
  </q-page>
</template>

<style>
</style>

<script>
import InstitutionTable from '../components/tables/InstitutionTable.vue'
export default {
  name: 'Institutions',
  components: {
    InstitutionTable
  }
}
</script>
