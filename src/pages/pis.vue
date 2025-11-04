<template>
  <q-page padding class="docs-input row justify-center">

    <q-card>
      <q-card-section>
        PIs
      </q-card-section>

      <q-separator />
      <q-card-section>
       <pi-table></pi-table>
    </q-card-section>
  </q-card>
  </q-page>
</template>

<style>
</style>

<script>
import piTable from '../components/tables/piTable.vue'
export default {
  name: 'PagePIs',
  components: {
    piTable
  }
}
</script>
