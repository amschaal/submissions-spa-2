export const validators = (state, validators) => {
  state.validators = validators
}
export const types = (state, types) => {
  state.types = Object.freeze(types)
}
export const lab = (state, lab) => {
  state.lab = lab
  state.types = lab.submission_types
}
export const labId = (state, labId) => {
  state.lab_id = labId
}
export const labs = (state, labs) => {
  state.labs = labs
}
export const institution = (state, institution) => {
  state.institution = institution
}
export const staff = (state, staff) => {
  state.staff = staff
}
export const vocabularies = (state, vocabularies) => {
  state.vocabularies = vocabularies
}
