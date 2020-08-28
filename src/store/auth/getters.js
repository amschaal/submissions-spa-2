export const getUser = (state) => {
  return state.user
}
export const getUserSettings = (state) => {
  return state.userSettings
}
export const isLoggedIn = (state) => {
  console.log(state)
  return state.user && state.user.username != null
}
// Replace this later if non staff members authenticate
export const isStaff = (state, getters, rootState, rootGetters) => {
  console.log('isStaff', state, rootGetters.labId)
  if (!state.user) {
    return false
  } else if (state.user.is_superuser) {
    return true
  } else if (state.user.labs && rootGetters.labId) {
    for (var i in state.user.labs) {
      if (state.user.labs[i].lab_id === rootGetters.labId) {
        return true
      }
    }
  }
  return false
  // return state.user && state.user.labs && state.user.labs.length > 0
}
