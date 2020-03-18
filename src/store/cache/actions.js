// Passing in this.$axios from application.  Seems like an antipattern, but I need to use same configuration for axios.
// import axios from 'axios'
// import axiosInstance from '../../plugins/axios'

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
  return axios.get('/api/submission_types/?page_size=100&active=true')
    .then(function (response) {
      context.commit('types', response.data.results)
    })
    .catch(function (error) {
      console.log(error.message)
    })
}
export const fetchStatuses = (context, {axios}) => {
  return axios.get('/api/statuses/?page_size=100&show=true')
    .then(function (response) {
      context.commit('statuses', response.data.results)
    })
    .catch(function (error) {
      console.log(error.message)
    })
}
export const fetchLab = (context, {axios}) => {
  return axios.get('/api/labs/default/')
    .then(function (response) {
      console.log('lab', response)
      context.commit('lab', response.data)
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
  fetchLab(context, {axios})
  fetchValidators(context, {axios})
  fetchTypes(context, {axios})
  fetchStatuses(context, {axios})
  fetchStaff(context, {axios})
}
