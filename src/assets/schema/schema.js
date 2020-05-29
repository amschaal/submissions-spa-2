var Schema = {}
Schema.getVariablesOfType = function (schema, t) {
  if (!schema || !schema.order || !schema.properties) {
    return []
  }
  return schema.order.filter(v => schema.properties[v] && schema.properties[v].type === t)
}
Schema.getTables = function (schema) {
  return Schema.getVariablesOfType(schema, 'table')
}
Schema.getNonTables = function (schema) {
  if (!schema || !schema.order || !schema.properties) {
    return []
  }
  return schema.order.filter(v => schema.properties[v] && schema.properties[v].type != 'table')
}
Schema.getTableSchema = function (schema, table_variable) {
  return schema.properties[table_variable].schema
}
Schema.getTableSchemas = function (schema) {
  return Schema.getTables(schema).map(v => ({ table: v, schema: Schema.getTableSchema(schema, v)}))
}
export default Schema
