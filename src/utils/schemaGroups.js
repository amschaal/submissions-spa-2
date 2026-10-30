// Field groups in submission schemas.
//
// `layout_order` lists ungrouped field names and group ids in display order,
// and `groups[id].fields` lists each group's fields in display order.  `order`
// stays the flat list of every field and is rebuilt from `layout_order`, so
// code that doesn't know about groups keeps working.  The rules mirror
// normalize_layout() in schema/utils.py on the server.

export const GROUP_DISPLAY_OPTIONS = [
  { label: 'Box', value: 'box' },
  { label: 'Header', value: 'header' }
]

const has = (obj, key) => Object.prototype.hasOwnProperty.call(obj, key)
const isObject = value => !!value && typeof value === 'object' && !Array.isArray(value)
// Replaces an array's contents in place, so lists bound to the editor keep their identity
const assign = (obj, key, items) => {
  if (Array.isArray(obj[key])) {
    obj[key].splice(0, obj[key].length, ...items)
  } else {
    obj[key] = items
  }
}

export function hasLayout (schema) {
  return !!schema && (has(schema, 'groups') || has(schema, 'layout_order'))
}

export function isGroup (schema, id) {
  return isObject(schema.groups) && has(schema.groups, id)
}

// Makes every field appear exactly once in `order` and once in `layout_order`
// (directly or inside a group).  Ids that no longer exist are dropped, unplaced
// fields and groups are appended, and duplicates keep their first position.
// Mutates and returns `schema`.
export function normalizeLayout (schema) {
  const properties = isObject(schema.properties) ? schema.properties : {}
  const groups = isObject(schema.groups) ? schema.groups : {}
  Object.keys(groups).forEach(id => {
    if (!isObject(groups[id]) || has(properties, id)) {
      delete groups[id]
    }
  })
  const seen = new Set()
  const place = id => !seen.has(id) && seen.add(id)
  const layoutOrder = (Array.isArray(schema.layout_order) ? schema.layout_order : [])
    .filter(id => (has(properties, id) || has(groups, id)) && place(id))
  // Fill groups in display order so a duplicated field stays in the first one
  const groupIds = layoutOrder.filter(id => has(groups, id))
    .concat(Object.keys(groups).filter(id => !seen.has(id)))
  groupIds.forEach(id => {
    const fields = Array.isArray(groups[id].fields) ? groups[id].fields : []
    assign(groups[id], 'fields', fields.filter(field => has(properties, field) && place(field)))
  })
  const order = Array.isArray(schema.order) ? schema.order : []
  order.concat(Object.keys(properties)).forEach(field => {
    if (has(properties, field) && place(field)) {
      layoutOrder.push(field)
    }
  })
  Object.keys(groups).forEach(id => {
    if (place(id)) {
      layoutOrder.push(id)
    }
  })
  schema.groups = groups
  assign(schema, 'layout_order', layoutOrder)
  assign(schema, 'order', flatten(schema))
  return schema
}

function flatten (schema) {
  return schema.layout_order.reduce(
    (fields, id) => fields.concat(isGroup(schema, id) ? schema.groups[id].fields : [id]), [])
}

// The list of things to render: ungrouped fields and groups (with their fields)
// in display order.  Never mutates `schema`.  Schemas without groups render
// exactly as before, straight from `order`.
export function layoutItems (schema) {
  if (!schema || !Array.isArray(schema.order)) {
    return []
  }
  const properties = schema.properties || {}
  const field = variable => ({ type: 'field', key: variable, variable, schema: properties[variable] })
  if (!hasLayout(schema)) {
    return schema.order.map(field)
  }
  const groups = {}
  Object.entries(isObject(schema.groups) ? schema.groups : {}).forEach(([id, group]) => {
    groups[id] = isObject(group) ? { ...group, fields: (group.fields || []).slice() } : group
  })
  const normalized = normalizeLayout({
    properties,
    order: schema.order.slice(),
    layout_order: Array.isArray(schema.layout_order) ? schema.layout_order.slice() : [],
    groups
  })
  return normalized.layout_order.map(id => isGroup(normalized, id)
    ? { type: 'group', key: 'group:' + id, id, group: normalized.groups[id], fields: normalized.groups[id].fields.map(field) }
    : field(id))
}

// The list (layout_order or a group's fields) that currently holds `id`
function containingList (schema, id) {
  if (schema.layout_order.includes(id)) {
    return { list: schema.layout_order, groupId: null }
  }
  const groupId = Object.keys(schema.groups).find(g => schema.groups[g].fields.includes(id))
  return groupId ? { list: schema.groups[groupId].fields, groupId } : null
}

// Whether moveLayoutItem() can move `id` by `displacement` (-1 up, +1 down)
export function canMoveLayoutItem (schema, id, displacement) {
  const location = containingList(schema, id)
  if (!location) {
    return false
  }
  const index = location.list.indexOf(id)
  // A field at either end of a group can always step out of it
  return location.groupId !== null || (index + displacement >= 0 && index + displacement < location.list.length)
}

// Keyboard-friendly alternative to dragging: moves `id` one visual slot up
// (-1) or down (+1).  Fields step into an adjacent group and out of the ends
// of their group; groups only move among top-level items.
export function moveLayoutItem (schema, id, displacement) {
  if (!canMoveLayoutItem(schema, id, displacement)) {
    return schema
  }
  const { list, groupId } = containingList(schema, id)
  const index = list.indexOf(id)
  const target = index + displacement
  if (groupId !== null && (target < 0 || target >= list.length)) {
    // Step out of the group, just above or below it
    list.splice(index, 1)
    const groupIndex = schema.layout_order.indexOf(groupId)
    schema.layout_order.splice(displacement < 0 ? groupIndex : groupIndex + 1, 0, id)
  } else if (groupId === null && !isGroup(schema, id) && isGroup(schema, list[target])) {
    // Step into the adjacent group, at the end nearest to where the field was
    list.splice(index, 1)
    const fields = schema.groups[list[displacement < 0 ? target : index]].fields
    if (displacement < 0) {
      fields.push(id)
    } else {
      fields.unshift(id)
    }
  } else {
    list.splice(target, 0, list.splice(index, 1)[0])
  }
  return normalizeLayout(schema)
}

// A group id derived from `title` that collides with no field or group
export function newGroupId (schema, title) {
  const base = 'group_' + (title.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'untitled')
  let id = base
  for (let n = 2; has(schema.properties || {}, id) || isGroup(schema, id); n++) {
    id = `${base}_${n}`
  }
  return id
}

export function addGroup (schema, title) {
  const id = newGroupId(schema, title)
  schema.groups[id] = { title, fields: [], display: 'box' }
  schema.layout_order.push(id)
  return normalizeLayout(schema)
}

// Deletes a group, leaving its fields ungrouped where the group was
export function removeGroup (schema, id) {
  const index = schema.layout_order.indexOf(id)
  if (index >= 0) {
    schema.layout_order.splice(index, 1, ...schema.groups[id].fields)
  }
  delete schema.groups[id]
  return normalizeLayout(schema)
}
