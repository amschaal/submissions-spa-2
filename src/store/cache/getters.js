// this.$store.getters.SOMETHING
export const validators = (state) => {
  return state.validators
}
export const validatorDict = (state) => {
  var validators = {}
  for (var i in state.validators) {
    validators[state.validators[i].id] = state.validators[i]
  }
  return validators
}
function createDict (objs, idField) {
  var dict = {}
  var id = idField || 'id'
  for (var i in objs) {
    dict[objs[i][id]] = objs[i]
  }
  return dict
}
export const types = (state) => {
  return state.types
}
export const typesDict = (state) => {
  return Object.freeze(createDict(state.types))
}
export const typeOptions = (state) => {
  console.log('typeOptions', state)
  return state.types.map(opt => ({label: opt.name, value: opt.id}))
}
export const statuses = (state) => {
  return state.statuses
}
export const vocabularies = (state) => {
  return state.vocabularies
}
export const lab = (state) => {
  return state.lab
}
export const labPermissions = (state) => {
  return state.lab ? state.lab.user_permissions : []
}
export const labId = (state) => {
  return state.lab_id
}
export const labs = (state) => {
  return state.labs
}
export const institution = (state) => {
  return state.institution
}
export const staff = (state) => {
  return state.staff
}
export const staffOptions = (state) => {
  // console.log('staffOptions', state.staff)
  return state.lab.users.map(opt => ({label: `${opt.first_name} ${opt.last_name}`, value: opt.id}))
}
