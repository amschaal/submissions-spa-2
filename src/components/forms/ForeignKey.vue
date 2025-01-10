<template>
  <!-- Loosely based on example: https://codepen.io/Hawkeye64/pen/xxbXajq -->
  <div>
    <div>
      <q-select
        v-model="model"
        :options="getOptions()"
        label="Foreign Key Reference"
        hint="You may validate that the value for this column matches a record from another table.  Select which table and column to reference."
        stack-label
        clearable
        @input="change"
      >
        <template v-slot:option="scope">
          <q-expansion-item
            expand-separator
            :default-opened="hasChild(scope)"
             header-class="text-weight-bold"
            :label="scope.opt.label"
          >
            <template v-for="child in scope.opt.children">
              <q-item
                :key="child.label"
                clickable
                v-ripple
                v-close-popup
                @click="set(scope.opt.label, child.label)"
                :class="{ 'bg-light-blue-1': model === child.label }"
              >
                <q-item-section>
                  <q-item-label v-html="child.label" class="q-ml-md" ></q-item-label>
                </q-item-section>
              </q-item>
            </template>
          </q-expansion-item>
        </template>
      </q-select>
    </div>
    <q-badge color="primary" multi-line v-if="model">
      Table: {{ model[0] }} Column: {{ model[1] }}
    </q-badge>
  </div>
</template>

<script>
export default {
  props: ['schema', 'value'],
  data () {
    return {
      model: this.value && this.value.slice ? this.value.slice() : null
    }
  },
  methods: {
    set (table, column) {
      this.model = [table, column]
      this.change()
    },
    change () {
      this.$emit('input', this.model)
    },
    getLabel (scope) {
      console.log(scope)
      return scope.label
    },
    hasChild (scope) {
      return scope.opt.children.some(c => c.label === this.model)
    },
    getOptions () {
      const options = [], self = this
      // {
      //   label: 'American cars',
      //   children: [
      //     {
      //       label: 'Ford'
      //     },
      //     {
      //       label: 'General Motors'
      //     },
      //     {
      //       label: 'Tesla'
      //     }
      //   ]
      // },
      this.$schema.getTableSchemas(this.schema).forEach(function (table) {
        const tableOptions = { label: table.table }
        tableOptions['children'] = self.$schema.getNonTables(table.schema).map(function (v) {
          return { label: v }
        })
        options.push(tableOptions)
      })
      return options
    }
  }
}
</script>
