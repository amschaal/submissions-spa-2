<template>
  <div class="full-width">
    <div v-if="definition.template && !readonly" class="q-mb-sm">
      <q-btn outline dense no-caps color="primary" icon="download" :href="templateUrl" :label="templateName ? `Download template: ${templateName}` : 'Download template'"/>
    </div>
    <div v-if="info" class="row items-center q-gutter-x-sm q-mb-xs">
      <q-icon name="description"/>
      <a v-if="info.file" :href="downloadUrl">{{ info.filename }}</a>
      <span v-else>{{ info.filename }} <span class="text-caption text-grey-7">(saved with the submission)</span></span>
      <q-btn v-if="!readonly" flat dense round size="sm" icon="close" @click="remove"><q-tooltip>Remove file</q-tooltip></q-btn>
    </div>
    <span v-else-if="readonly">None</span>
    <q-file v-if="!readonly" ref="picker" outlined dense v-model="picked" :accept="definition.accept || undefined" :loading="uploading"
      :label="info ? 'Replace file' : 'Choose a file'" :hint="hint" @update:model-value="upload">
      <template v-slot:prepend><q-icon name="attach_file"/></template>
      <template v-slot:after><q-btn unelevated color="primary" label="Browse" :disable="uploading" @click="$refs.picker.pickFiles()"/></template>
    </q-file>
  </div>
</template>

<script>
// A schema file field ({"type": "string", "format": "file"}). The file is uploaded as soon as it is chosen and the
// field's value becomes the upload's id; the server attaches the upload when the submission is saved.
export default {
  props: {
    modelValue: { default: null },
    definition: { type: Object, default: () => ({}) },
    variable: { type: String, default: null },
    readonly: { type: Boolean, default: false }
  },
  emits: ['update:modelValue'],
  // Provided by submissionForm: () => ({submission}) when editing, () => ({type}) for a new submission.
  inject: { fileUploadTarget: { default: null } },
  data () {
    return { info: null, picked: null, uploading: false, templateName: null }
  },
  computed: {
    downloadUrl () {
      return `${this.$axios.defaults.baseURL}/api/submission_files/${this.info.id}/download/`
    },
    templateUrl () {
      return `${this.$axios.defaults.baseURL}/api/lab_files/${this.definition.template}/download/`
    },
    hint () {
      return this.definition.accept ? `Accepted file types: ${this.definition.accept}` : undefined
    }
  },
  watch: {
    modelValue: { immediate: true, handler: 'loadInfo' },
    'definition.template': {
      immediate: true,
      handler (template) {
        this.templateName = null
        if (template && !this.readonly) {
          this.$axios.get(`/api/lab_files/${template}/`).then(({ data }) => { this.templateName = data.name }).catch(() => {})
        }
      }
    }
  },
  methods: {
    loadInfo (id) {
      if (!id) {
        this.info = null
      } else if (!this.info || this.info.id !== id) {
        this.$axios.get(`/api/submission_files/${id}/`)
          .then(({ data }) => { this.info = data })
          .catch(() => { this.info = { id, filename: 'File not found', file: null } })
      }
    },
    upload (file) {
      if (!file) {
        return
      }
      const data = new FormData()
      data.append('file', file)
      data.append('variable', this.variable)
      const target = this.fileUploadTarget ? this.fileUploadTarget() : {}
      Object.entries(target).forEach(([key, value]) => { if (value) data.append(key, value) })
      this.uploading = true
      this.$axios.post('/api/submission_files/field_upload/', data)
        .then(({ data }) => {
          this.info = data
          this.$emit('update:modelValue', data.id)
        })
        .catch(error => {
          const errors = (error.response && error.response.data) || {}
          const message = [].concat(errors.file || errors.variable || errors.type || errors.submission || errors.detail || 'Error uploading the file.').join(' ')
          this.$q.notify({ message, type: 'negative' })
        })
        .finally(() => {
          this.uploading = false
          this.picked = null
        })
    },
    remove () {
      this.info = null
      this.$emit('update:modelValue', null)
    }
  }
}
</script>
