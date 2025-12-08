<template>
  <q-page padding class="docs-input row justify-center">

    <q-card>
      <q-card-section>
        <router-link :to="{ name: 'groups'}">Groups</router-link> / <span v-if="group && group.institution"><router-link :to="{ name: 'institution', params: { id: group.institution.id }}">{{group.institution.name}}</router-link> / </span><span v-if="group">{{ group.last_name }}, {{ group.first_name }}</span>
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
          <q-tab name="details"  default>Details</q-tab>
          <q-tab name="submissions" label="Submissions"/>
        </q-tabs>
        <q-tab-panels v-model="tab" animated :keep-alive="true">
          <q-tab-panel name="details">
            <q-card-section class="text-h6 q-mb-sm">
            {{ group.name }}
          </q-card-section>

          <!-- Body – Department & Institution -->
          <q-card-section class="row q-col-gutter-md">
            <div class="col-12 col-sm-6">
              <q-item dense>
                <q-item-section side>
                  <q-icon name="work" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-subtitle2">Department</q-item-label>
                  <q-item-label caption>{{ group.department }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>

            <div class="col-12 col-sm-6">
              <q-item dense>
                <q-item-section side>
                  <q-icon name="business" color="primary" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-subtitle2">Institution</q-item-label>
                  <q-item-label caption><router-link :to="{ name: 'institution', params: { id: group.institution.id }}">{{ group.institution.name }}</router-link></q-item-label>
                </q-item-section>
              </q-item>
            </div>
          </q-card-section>
          </q-tab-panel>
          <q-tab-panel name="submissions">
            <q-card-section>
            <submissions :query-params="`pi__id=${group.id}`" v-if="group"></submissions>
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
import submissions from '../components/submissions.vue'
export default {
  props: ['id'],
  data () {
    return {
      'group': null,
      'tab': 'details'
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
    submissions
  }
}
</script>
