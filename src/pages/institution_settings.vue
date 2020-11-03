<template>
  <q-page padding>
    <div v-if="institution">
      <h5>Permissions for "{{institution.name}}"</h5>
      <q-tabs
          v-model="tab"
          class="text "
        >
        <q-tab name="permissions_tab" label="Permissions" />
      </q-tabs>
      <q-tab-panels v-model="tab" animated>
        <q-tab-panel name="permissions_tab">
          <!-- {{institution}} -->
          <permissions :base-url="`/api/institutions/${institution.id}`" v-if="institution && institution.id"/>
        </q-tab-panel>
      </q-tab-panels>

    </div>
  </q-page>
</template>

<script>
import permissions from '../components/permissions.vue'
export default {
  name: 'institution_settings',
  data () {
    return {
      institution: this.$store.getters.institution,
      tab: 'permissions_tab'
    }
  },
  mounted () {
  },
  methods: {
  },
  watch: {
  },
  components: {
    permissions
  }
}
</script>
