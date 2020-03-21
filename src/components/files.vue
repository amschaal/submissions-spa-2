<template>
  <div>
    <q-uploader :factory="uploadFile" :multiple="true" stack-label label="Upload files" ref="uploader" @add="filesSelected" hide-upload-button/>
    <q-table
      ref="table"
      :data="serverData"
      :columns="columns"
      :filter="filter"
      row-key="id"
      :pagination.sync="serverPagination"
      :loading="loading"
      @request="request"
      :refresh="true"
    >
      <!-- <template slot="top-right" slot-scope="props">
        <q-search hide-underline v-model="filter" />
      </template> -->
      <template slot="body" slot-scope="props">
        <q-tr :props="props">
          <q-td key="file" :props="props"><q-btn v-if="$store.getters.isLoggedIn" class="float-left" color="red" label="Delete" @click="deleteFile(props.row)"/><a :href="props.row.file" target="_blank">{{ props.row.filename }}</a></q-td>
          <q-td key="uploaded_at" :props="props">{{ props.row.uploaded_at | formatDate }}</q-td>
        </q-tr>
      </template>
    </q-table>

  </div>
</template>

<script>

export default {
  props: ['submission'],
  data () {
    return {
      filter: '',
      loading: false,
      serverPagination: {
        page: 1,
        rowsNumber: 0, // specifying this determines pagination is server-side
        rowsPerPage: 10,
        sortBy: 'uploaded_at',
        descending: true
      },
      serverData: [],
      columns: [
        { name: 'file', label: 'Filename', field: 'file', sortable: true },
        { name: 'uploaded_at', label: 'Uploaded', field: 'uploaded_at', sortable: true }
      ]
    }
  },
  mounted: function () {
    // console.log('mounted', this.$refs.table.refresh)
    // var self = this
    // this.$axios
    //   .get('/api/submission_files/', {params: {submission: this.submission.id, page_size: 100}})
    //   .then(function (response) {
    //     self.files = response.data.results
    //   })
    this.refreshTable()
  },
  methods: {
    request ({ pagination, filter }) {
      // we set QTable to "loading" state
      this.loading = true

      // we do the server data fetch, based on pagination and filter received
      // (using Axios here, but can be anything; parameters vary based on backend implementation)
      var sortBy = pagination.sortBy
      if (pagination.descending) {
        sortBy = '-' + sortBy
      }
      this.$axios
        .get(`/api/submission_files/?submission=${this.submission.id}&ordering=${sortBy}&page=${pagination.page}&page_size=${pagination.rowsPerPage}`)// ${pagination.descending}&filter=${filter}
        .then(({ data }) => {
          this.serverPagination = pagination
          this.serverPagination.rowsNumber = data.count
          this.serverData = data.results
          this.loading = false
        })
        .catch(error => {
          // there's an error... do SOMETHING
          console.log(error)
          // we tell QTable to exit the "loading" state
          this.loading = false
        })
    },
    filesSelected (one, two) {
      console.log('filesSelected', one, two)
      this.$refs.uploader.upload()
    },
    refreshTable () {
      this.request({
        pagination: this.serverPagination,
        filter: this.filter
      })
    },
    deleteFile (file) {
      if (!confirm(`Are you sure you want to delete this file: '${file.filename}'?`)) {
        return
      }
      var self = this
      this.$axios.delete(`/api/submission_files/${file.id}/`)
        .then(function () {
          self.$q.notify({message: 'File deleted', type: 'positive'})
          self.refreshTable()
        })
        .catch(function () {
          self.$q.notify({message: 'Error deleting file', type: 'negative'})
        })
    },
    uploadFile (files) {
      var file = files[0]
      // console.log('uploadFile', files, this.$refs)
      var self = this
      var formData = new FormData()
      formData.append('file', file)
      formData.append('submission', this.submission.id)
      var request = this.$axios.post('/api/submission_files/',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          },
          onUploadProgress: function (progressEvent) {
            // console.log('uploadProgress', this, progressEvent, self.$refs.uploader.__updateFile)
            // var percentCompleted = progressEvent.loaded / progressEvent.total
            self.$refs.uploader.__updateFile(file, null, progressEvent.loaded)
            // return percentCompleted * 100.0
          }
        }
      )
        .then(function () {
          // console.log('uploaded', self.$refs, files)
          self.$q.notify({message: 'File uploaded', type: 'positive'})
          self.refreshTable()
          self.$refs.uploader.__updateFile(file, 'uploaded')
          return new Promise((resolve, reject) => {
            resolve(file)
          })
          // self.request(self.serverPagination, self.filter)
        })
      return request
    }
  }
}
</script>
