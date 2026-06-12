<template>
  <div>
    <span v-for="(u, index) in modelValue" :key="u.id"><span v-if="index != 0">, </span>{{u.first_name}} {{u.last_name}} </span>
    <tableModal title="Select users" :model-value="users" @update:model-value="u => { users = u; $emit('update:modelValue', u) }"  :button-props="buttonProps" :help="help"><template v-slot:table="slotProps"><userTable :model-value="users" @selected="slotProps.updateSelected" :query-params="queryParams"/></template></tableModal>
  </div>
</template>
<script>
import userTable from '../tables/userTable.vue'
import tableModal from '../modals/tableModal.vue'
export default {
  props: {
    queryParams: String,
    modelValue: Array,
    buttonProps: Object,
    help: String
  },
  emits: ['update:modelValue'],
  components: {
    userTable,
    tableModal
  },
  data () {
    return {
      users: this.modelValue
    }
  }
}
</script>
