// Passing in this.$axios from application.  Seems like an antipattern, but I need to use same configuration for axios.
// import axios from 'axios'
// import axiosInstance from '../../plugins/axios'

export const login = (context, {username, password, axios, dispatch}) => {
  return new Promise((resolve, reject) => {
    axios.post('/api/login/', {
      username: username,
      password: password
      // headers: auth.getAuthHeader(),
    })
      .then(function (response) {
        context.commit('login', response.data.user)
        // dispatch('fetchAll', {axios: axios})
        resolve(response)
      })
      .catch(function (error) {
        console.log('errors', error.message)
        reject(error.message)
      })
  })
}

// return axios.post('/api/login/', {
//   username: username,
//   password: password
//   // headers: auth.getAuthHeader(),
// })
//   .then(function (response) {
//     context.commit('login', response.data.user)
//   })
//   .catch(function (error) {
//     console.log('errors', error.message)
//   })

export const checkAuth = (context, {axios}) => {
  console.log('context', context)
  return axios.get('/api/get_user/')
    .then(function (response) {
      context.commit('login', response.data.user)
      context.commit('userSettings', response.data.user.profile ? response.data.user.profile.settings : {})
    })
    .catch(function (error) {
      console.log(error.message)
    })
}

export const logout = (context, {axios}) => {
  return axios.post('/api/logout/', {
    // headers: auth.getAuthHeader(),
  })
    .then(function (response) {
      context.commit('logout')
    })
    .catch(function (error) {
      console.log('error!!!', error.message)
      return Promise.reject(new Error('failed'))
    })
}

export const updateSettings = (context, {path, value, axios, self, dispatch}) => {
  return new Promise((resolve, reject) => {
    axios.post('/api/users/update_settings/', {
      path: path,
      value: value
      // headers: auth.getAuthHeader(),
    })
      .then(function (response) {
        context.commit('userSettings', response.data.settings)
        self.$q.notify({message: 'Settings updated', type: 'positive'})
        resolve(response)
      })
      .catch(function (error) {
        console.log('errors', error.message)
        self.$q.notify({message: 'Unable to update settings', type: 'negative'})
        reject(error.message)
      })
  })
}
export const deleteSetting = (context, {path, axios, self, dispatch}) => {
  return new Promise((resolve, reject) => {
    axios.post('/api/users/delete_setting/', {
      path: path
      // headers: auth.getAuthHeader(),
    })
      .then(function (response) {
        context.commit('userSettings', response.data.settings)
        self.$q.notify({message: `Setting at path "${path}" deleted`, type: 'positive'})
        resolve(response)
      })
      .catch(function (error) {
        console.log('errors', error.message)
        self.$q.notify({message: 'Unable to delete setting', type: 'negative'})
        reject(error.message)
      })
  })
}
