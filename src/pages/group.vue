<template>
  <q-page padding class="docs-input row justify-center">

    <q-card>
      <q-card-section>
        <router-link :to="{ name: 'groups'}">Groups</router-link> / <span v-if="group && group.institution"><router-link :to="{ name: 'institution', params: { id: group.institution.id }}">{{group.institution.name}}</router-link> / </span><span v-if="group">{{ group.last_name }}, {{ group.first_name }}</span>
      </q-card-section>

      <q-separator />
      <q-card-section>
       {{group}}
    </q-card-section>
  </q-card>
  </q-page>
</template>

<style>
</style>

<script>
export default {
  props: ['id'],
  data () {
    return {
      'group': null
    }
  },
  mounted () {
    this.$axios.get(`/api/groups/${this.id}/`)
      .then(response => {
        this.group = response.data
      })
  },
  name: 'Group',
  components: {
  }
}
</script>
