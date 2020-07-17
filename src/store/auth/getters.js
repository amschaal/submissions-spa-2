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
export const isStaff = (state) => {
  return state.user && state.user.labs && state.user.labs.length > 0
}
