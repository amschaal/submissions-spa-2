<template>
  <q-btn label="References">
    <q-menu>
      <q-list style="min-width: 100px" v-for="table in $schema.getTableSchemas(schema)" :key="table.table">
        <q-item clickable>
          <q-item-section>{{table.table}}</q-item-section>
          <q-item-section side>
            <q-icon name="keyboard_arrow_right" />
          </q-item-section>
          <q-menu anchor="top right" self="top left">
            <q-list style="min-width: 100px" v-for="v in $schema.getNonTables(table.schema)" :key="v">
              <q-item clickable v-close-popup @click="set(table.table, v)">
                <q-item-section>{{v}}</q-item-section>
              </q-item>
            </q-list>
          </q-menu>
        </q-item>
      </q-list>
    </q-menu>
  </q-btn>
</template>

<script>
export default {
  props: ['schema', 'value'],
  methods: {
    set (table, column) {
      this.$emit('input', [table, column])
    }
  }
}
</script>
