<template>
  <div>
    <span v-for="(u, index) in value" :key="u.id"><span v-if="index != 0">, </span>{{u.first_name}} {{u.last_name}} </span>
    <tableModal title="Select users" v-model="users" @input="$emit('input', users)"><template v-slot:table><userTable :value="users" :query-params="queryParams"/></template></tableModal>
  </div>
</template>
<script>
import userTable from '../tables/userTable.vue'
import tableModal from '../modals/tableModal.vue'
export default {
  props: ['value', 'queryParams'],
  components: {
    userTable,
    tableModal
  },
  data () {
    return {
      users: this.value
    }
  }
}
</script>
