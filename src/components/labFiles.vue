<template>
  <div>
    <p class="text-caption">
      Files your lab offers for download, such as templates for submission forms.
      Anyone with a public file's link can download it. Internal files can only be downloaded by people with a permission on this lab.
    </p>
    <q-table :rows="files" :columns="columns" row-key="id" :loading="loading" :pagination="{ rowsPerPage: 0 }" hide-pagination flat bordered no-data-label="No files yet.">
      <template v-slot:body-cell-name="props">
        <q-td :props="props">
          <a :href="downloadUrl(props.row)">{{ props.row.name }}</a>
          <q-badge v-if="props.row.internal" class="q-ml-sm" color="grey-7" label="Internal"/>
          <div class="text-caption text-grey-7" v-if="props.row.description">{{ props.row.description }}</div>
        </q-td>
      </template>
      <template v-slot:body-cell-actions="props">
        <q-td :props="props" auto-width>
          <q-btn flat dense icon="link" @click="copyLink(props.row)"><q-tooltip>Copy download link</q-tooltip></q-btn>
          <template v-if="canManage">
            <q-btn flat dense icon="edit" @click="edit(props.row)"><q-tooltip>Edit or replace</q-tooltip></q-btn>
            <q-btn flat dense icon="delete" color="negative" @click="remove(props.row)"><q-tooltip>Delete</q-tooltip></q-btn>
          </template>
        </q-td>
      </template>
    </q-table>
    <q-btn v-if="canManage" class="q-mt-md" color="positive" label="Upload file" @click="edit()"/>

    <q-dialog v-model="dialog">
      <q-card style="min-width: 400px">
        <q-card-section class="text-h6">{{ form.id ? 'Edit file' : 'Upload file' }}</q-card-section>
        <q-card-section>
          <q-file ref="picker" outlined dense v-model="upload" :label="form.id ? `Replace ${form.filename} (optional)` : 'Choose a file'" clearable
            :error="!!errors.file" :error-message="err('file')">
            <template v-slot:prepend><q-icon name="attach_file"/></template>
            <template v-slot:after><q-btn unelevated color="primary" label="Browse" @click="$refs.picker.pickFiles()"/></template>
          </q-file>
          <q-input dense v-model="form.name" label="Name" :error="!!errors.name" :error-message="err('name')"/>
          <q-input dense v-model="form.description" label="Description" type="textarea" autogrow/>
          <q-checkbox v-model="form.internal" label="Internal: only people with a permission on this lab can download it"/>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancel" v-close-popup/>
          <q-btn color="primary" label="Save" :loading="saving" @click="save"/>
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script>
import { copyToClipboard, format } from 'quasar'

const blank = () => ({ name: '', description: '', internal: false })

export default {
  // lab: the lab object ({id, lab_id})
  props: ['lab'],
  data () {
    return {
      files: [],
      loading: false,
      dialog: false,
      saving: false,
      form: blank(),
      upload: null,
      errors: {},
      columns: [
        { name: 'name', label: 'Name', field: 'name', align: 'left', sortable: true },
        { name: 'filename', label: 'File', field: 'filename', align: 'left' },
        { name: 'size', label: 'Size', field: 'size', align: 'right', format: size => size == null ? 'missing' : format.humanStorageSize(size) },
        { name: 'modified', label: 'Updated', field: 'modified', align: 'left', sortable: true, format: date => new Date(date).toLocaleString() },
        { name: 'uploaded_by', label: 'Uploaded by', field: 'uploaded_by', align: 'left' },
        { name: 'actions', label: '', field: 'id' }
      ]
    }
  },
  computed: {
    canManage () { // matches the API: lab admins and members manage files
      return this.$perms.hasLabPerm('ADMIN') || this.$perms.hasLabPerm('MEMBER')
    }
  },
  mounted () {
    this.load()
  },
  watch: {
    upload (file) { // default the name to the chosen file's name
      if (file && !this.form.name) {
        this.form.name = file.name
      }
    }
  },
  methods: {
    err (field) {
      return [].concat(this.errors[field] || []).join(' ')
    },
    downloadUrl (file) {
      return `${this.$axios.defaults.baseURL}/api/lab_files/${file.id}/download/`
    },
    load () {
      this.loading = true
      this.$axios.get('/api/lab_files/', { params: { lab: this.lab.lab_id } })
        .then(({ data }) => { this.files = data })
        .catch(() => this.$q.notify({ message: 'Error loading files.', type: 'negative' }))
        .finally(() => { this.loading = false })
    },
    edit (file) {
      Object.assign(this, { form: file ? { ...file } : blank(), upload: null, errors: {}, dialog: true })
    },
    save () {
      const data = new FormData()
      if (this.upload) {
        data.append('file', this.upload)
      }
      data.append('name', this.form.name)
      data.append('description', this.form.description)
      data.append('internal', this.form.internal ? 'true' : 'false')
      if (!this.form.id) {
        data.append('lab', this.lab.id)
      }
      const request = this.form.id
        ? this.$axios.patch(`/api/lab_files/${this.form.id}/`, data)
        : this.$axios.post('/api/lab_files/', data)
      this.saving = true
      request
        .then(() => {
          this.dialog = false
          this.$q.notify({ message: 'File saved.', type: 'positive' })
          this.load()
        })
        .catch(error => {
          this.errors = (error.response && error.response.data) || {}
          this.$q.notify({ message: this.err('non_field_errors') || this.err('detail') || 'Error saving file.', type: 'negative' })
        })
        .finally(() => { this.saving = false })
    },
    copyLink (file) {
      copyToClipboard(window.location.origin + this.downloadUrl(file))
        .then(() => this.$q.notify({ message: 'Download link copied.', type: 'positive' }))
        .catch(() => this.$q.notify({ message: 'Unable to copy the link.', type: 'negative' }))
    },
    remove (file) {
      this.$q.dialog({ title: 'Delete file?', message: `"${file.name}" will no longer be downloadable, including from any links you've shared.`, cancel: true })
        .onOk(() => this.$axios.delete(`/api/lab_files/${file.id}/`)
          .then(() => { this.files = this.files.filter(f => f.id !== file.id) })
          .catch(() => this.$q.notify({ message: 'Error deleting file.', type: 'negative' })))
    }
  }
}
</script>
