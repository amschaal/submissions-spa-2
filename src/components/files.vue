<template>
  <div>
    <q-uploader :factory="uploadFactory" field-name="file" :multiple="true" label="Upload files" ref="uploader" @added="filesSelected" @uploaded="onUploaded" @failed="onFailed"/>
    <q-table
      ref="table"
      :rows="serverData"
      :columns="columns"
      :filter="filter"
      row-key="id"
      v-model:pagination="serverPagination"
      :loading="loading"
      @request="request"
      :refresh="true"
    >
      <!-- <template v-slot:top-right="props">
        <q-search hide-underline v-model="filter" />
      </template> -->
      <template v-slot:body="props">
        <q-tr :props="props">
          <q-td key="file" :props="props"><q-btn v-if="$perms.hasSubmissionPerms(submission, ['ADMIN','STAFF'], 'ANY')" class="float-left" color="red" label="Delete" @click="deleteFile(props.row)"/><a :href="props.row.file" target="_blank" rel="noopener noreferrer">{{ props.row.filename }}</a></q-td>
          <q-td key="uploaded_at" :props="props">{{ $formatDate(props.row.uploaded_at) }}</q-td>
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
      let sortBy = pagination.sortBy
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
    filesSelected () {
      // auto-start the upload as soon as files are added
      this.$refs.uploader.upload()
    },
    getCsrfToken () {
      const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/)
      return match ? decodeURIComponent(match[1]) : ''
    },
    onUploaded () {
      this.$q.notify({message: 'File uploaded', type: 'positive'})
      this.refreshTable()
    },
    onFailed () {
      this.$q.notify({message: 'Error uploading file', type: 'negative'})
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
      const self = this
      this.$axios.delete(`/api/submission_files/${file.id}/?submission=${this.submission.id}`)
        .then(function () {
          self.$q.notify({message: 'File deleted', type: 'positive'})
          self.refreshTable()
        })
        .catch(function () {
          self.$q.notify({message: 'Error deleting file', type: 'negative'})
        })
    },
    uploadFactory (files) {
      // Quasar v2 QUploader factory: return the upload config; QUploader does
      // the XHR (progress + per-file status) itself. The previous Vue 2 code did
      // a manual axios upload and poked the removed internal __updateFile().
      // The file is sent as the `file` field (field-name); `submission` is an
      // extra form field. CSRF + session cookie are needed because the axios
      // instance (which normally adds them) is bypassed here.
      return Promise.resolve({
        url: '/server/api/submission_files/',
        method: 'POST',
        fieldName: 'file',
        formFields: [{ name: 'submission', value: String(this.submission.id) }],
        headers: [{ name: 'X-CSRFToken', value: this.getCsrfToken() }],
        withCredentials: true
      })
    }
  }
}
</script>
