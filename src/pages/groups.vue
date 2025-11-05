<template>
  <q-page padding class="docs-input row justify-center">

    <q-card>
      <q-card-section>
        Groups
      </q-card-section>

      <q-separator />
      <q-card-section>
       <group-table></group-table>
    </q-card-section>
  </q-card>
  </q-page>
</template>

<style>
</style>

<script>
import GroupTable from '../components/tables/GroupTable.vue'
export default {
  name: 'PagePIs',
  components: {
    GroupTable
  }
}
</script>
