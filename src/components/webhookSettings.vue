<template>
  <div>
    <p class="text-caption" v-if="submissionType">
      <template v-if="hook.id">This override replaces the lab's webhook for this submission type. Remove it to use the lab's webhook again.</template>
      <template v-else>This submission type uses the lab's webhook. Saving here creates an override that replaces it for this type.</template>
      <span :class="{ 'text-negative text-weight-bold': blocking }">With "Enabled" unchecked, no webhooks are sent for this type, not even the lab's.</span>
    </p>
    <p class="text-caption" v-else>
      A small JSON event (submission id, status, who made the change, and an API link) is POSTed to this URL whenever a submission is created or updated.
    </p>
    <q-checkbox v-model="hook.enabled" label="Enabled"/>
    <q-input dense v-model="hook.url" label="URL" placeholder="https://..." :error="!!errors.url" :error-message="err('url')"/>
    <q-input dense v-model="hook.auth_header" label="Authentication header" hint="e.g. Authorization" :error="!!errors.auth_header" :error-message="err('auth_header')"/>
    <q-input dense v-model="secret" :type="showSecret ? 'text' : 'password'" autocomplete="new-password" label="Authentication value (secret)"
      :placeholder="hook.has_secret ? 'Saved and hidden. Type to replace it.' : 'e.g. Bearer abc123'"
      hint="Sent as the header's value. Stored encrypted; only lab admins can reveal it."
      :error="!!errors.secret" :error-message="err('secret')">
      <template v-slot:append v-if="hook.has_secret">
        <q-btn flat dense label="Reveal" @click="reveal" v-if="!showSecret"/>
        <q-btn flat dense label="Clear" @click="save({secret: ''})"/>
      </template>
    </q-input>
    <div class="q-mt-sm text-caption" v-if="hook.last_sent">
      Last delivery {{ new Date(hook.last_sent).toLocaleString() }}: {{ hook.last_error || `HTTP ${hook.last_status}` }}
    </div>
    <div class="q-mt-md q-gutter-sm">
      <q-btn color="primary" label="Save" @click="save()"/>
      <q-btn label="Send test" @click="ping" v-if="hook.id"/>
      <q-btn flat color="negative" :label="submissionType ? 'Remove override' : 'Delete'" @click="remove" v-if="hook.id"/>
    </div>
  </div>
</template>

<script>
const blank = () => ({ enabled: true, url: '', auth_header: 'Authorization', has_secret: false })

export default {
  // lab: the lab object ({id, lab_id}); submissionType: a type id to edit its override, else the lab default.
  props: ['lab', 'submissionType'],
  data () {
    return { hook: blank(), secret: '', showSecret: false, errors: {} }
  },
  computed: {
    blocking () { // a disabled override switches the lab's webhook off for this type
      return Boolean(this.hook.id && !this.hook.enabled)
    }
  },
  mounted () {
    const params = { lab: this.lab.lab_id, ...(this.submissionType ? { submission_type: this.submissionType } : { submission_type__isnull: true }) }
    this.$axios.get('/api/webhooks/', { params })
      .then(({ data }) => { this.hook = data[0] || blank() })
      .catch(() => this.$q.notify({ message: 'Error loading webhook.', type: 'negative' }))
  },
  methods: {
    err (field) {
      return [].concat(this.errors[field] || []).join(' ')
    },
    save (changes) {
      // The secret is write-only: send it only when typed (omitted keeps it, '' clears it).
      const data = changes || { ...this.hook, ...(this.secret ? { secret: this.secret } : {}) }
      const request = this.hook.id
        ? this.$axios.patch(`/api/webhooks/${this.hook.id}/`, data)
        : this.$axios.post('/api/webhooks/', { ...data, lab: this.lab.id, submission_type: this.submissionType || null })
      request
        .then(({ data }) => {
          Object.assign(this, { hook: data, secret: '', showSecret: false, errors: {} })
          this.$q.notify({ message: 'Webhook saved.', type: 'positive' })
        })
        .catch(error => {
          this.errors = (error.response && error.response.data) || {}
          this.$q.notify({ message: this.err('non_field_errors') || this.err('detail') || 'Error saving webhook.', type: 'negative' })
        })
    },
    reveal () {
      this.$axios.post(`/api/webhooks/${this.hook.id}/reveal_secret/`)
        .then(({ data }) => Object.assign(this, { secret: data.secret, showSecret: true }))
        .catch(() => this.$q.notify({ message: 'Error revealing secret.', type: 'negative' }))
    },
    ping () {
      this.$axios.post(`/api/webhooks/${this.hook.id}/ping/`)
        .then(({ data }) => {
          Object.assign(this.hook, { last_sent: new Date().toISOString(), last_status: data.status, last_error: data.error })
          this.$q.notify(data.error ? { message: `Test failed: ${data.error}`, type: 'negative' } : { message: `Test delivered (HTTP ${data.status}).`, type: 'positive' })
        })
        .catch(() => this.$q.notify({ message: 'Error sending test.', type: 'negative' }))
    },
    remove () {
      this.$q.dialog(this.submissionType
        ? { title: 'Remove override?', message: "Submissions of this type will use the lab's webhook again.", cancel: true }
        : { title: 'Delete webhook?', message: 'No more events will be sent to this URL.', cancel: true })
        .onOk(() => this.$axios.delete(`/api/webhooks/${this.hook.id}/`)
          .then(() => Object.assign(this, { hook: blank(), secret: '', showSecret: false })))
    }
  }
}
</script>
