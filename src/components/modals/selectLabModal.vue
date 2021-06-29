<template>
  <span>
    <q-dialog
      v-model="opened"
    >
      <q-card style="width: 700px; max-width: 80vw;">
        <q-card-section>
          <div class="text-h6">Select Lab</div>
        </q-card-section>
<!-- v-on:selected="updateSelected" -->
        <q-card-section class="q-pt-none">
          <q-select
            v-model="lab"
            :options="$store.getters.labs"
            option-value="lab_id"
            option-label="name"
            emit-value
            map-options
            outlined
            style="min-width: 250px; max-width: 300px"
            v-if="$store.getters.labs.length"
            @input="action(lab)"
          />
        </q-card-section>

        <q-card-actions align="right" class="bg-white text-teal">
          <q-btn flat label="Cancel" @click="opened = false" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <slot name="button" v-bind:open="open">
      <q-btn size="sm" label="Change lab" @click="open" v-if="$store.getters.labs && $store.getters.labs.length > 1"/>
    </slot>
  </span>
</template>
<script>
export default {
  props: ['onSelect', 'page'],
  data () {
    return {
      opened: false,
      lab: null,
      goTo: this.page || 'lab',
      action: this.onSelect || this.goToLab
    }
  },
  mounted () {
  },
  methods: {
    goToLab (labId) {
      this.opened = false
      this.$router.push({ name: this.goTo, params: { lab_id: labId } })
    },
    open () {
      this.opened = true
    }
  }
}
</script>
