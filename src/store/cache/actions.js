// Passing in this.$axios from application.  Seems like an antipattern, but I need to use same configuration for axios.
// import axios from 'axios'
// import axiosInstance from '../../plugins/axios'
// return new Promise((resolve, reject) => {
//   axios.post('/api/login/', {
//     username: username,
//     password: password
//     // headers: auth.getAuthHeader(),
//   })
//     .then(function (response) {
//       context.commit('login', response.data.user)
//       // dispatch('fetchAll', {axios: axios})
//       resolve(response)
//     })
//     .catch(function (error) {
//       console.log('errors', error.message)
//       reject(error.message)
//     })
// })
export const fetchValidators = (context, {axios}) => {
  return axios.get('/api/validators/')
    .then(function (response) {
      context.commit('validators', response.data)
    })
    .catch(function (error) {
      console.log(error.message)
    })
}
export const fetchTypes = (context, {axios}) => {
  console.log('context', context)
  return new Promise((resolve, reject) => {
    return axios.get(`/api/submission_types/?page_size=100&lab=${context.state.lab_id}&active=true`)
      .then(function (response) {
        context.commit('types', response.data.results)
        resolve(response)
      })
      .catch(function (error) {
        console.log(error.message)
        reject(error)
      })
  })
}

export const fetchVocabularies = (context, {axios}) => {
  return axios.get('/api/vocabularies/?page_size=100')
    .then(function (response) {
      context.commit('vocabularies', response.data.results.map(vocab => vocab.id))
    })
    .catch(function (error) {
      console.log(error.message)
    })
}

export const setLabId = (context, {axios, labId}) => {
  context.commit('labId', labId)
  return axios.get(`/api/labs/${labId}/`)
    .then(function (response) {
      console.log('lab', response)
      context.commit('lab', response.data)
    })
    .catch(function (error) {
      console.log(error.message)
    })
}

export const fetchLab = (context, {axios, labId}) => {
  return axios.get(`/api/labs/${labId}/`)
    .then(function (response) {
      console.log('lab', response)
      context.commit('lab', response.data)
    })
    .catch(function (error) {
      console.log(error.message)
    })
}

export const fetchLabs = (context, {axios}) => {
  return axios.get('/api/labs/')
    .then(function (response) {
      console.log('labs', response)
      context.commit('labs', response.data.results)
    })
    .catch(function (error) {
      console.log(error.message)
    })
}

export const fetchInstitution = (context, {axios}) => {
  return axios.get('/api/institutions/default/')
    .then(function (response) {
      console.log('institution', response)
      context.commit('institution', response.data)
    })
    .catch(function (error) {
      console.log(error.message)
    })
}

export const fetchStaff = (context, {axios}) => {
  return axios.get('/api/users/?show=true&page_size=1000')
    .then(function (response) {
      console.log('staff', response.data.results)
      context.commit('staff', response.data.results)
    })
    .catch(function (error) {
      console.log(error.message)
    })
}
export const fetchAll = (context, {axios}) => {
  // fetchLab(context, {axios})
  fetchLabs(context, {axios})
  fetchInstitution(context, {axios})
  fetchValidators(context, {axios})
  // fetchTypes(context, {axios})
  // fetchStaff(context, {axios})
  fetchVocabularies(context, {axios})
}
