<template>
  <q-page padding class="row justify-center">
    <div class="col-12 col-sm-9 col-md-6 col-lg-5">
      <q-card>
        <q-card-section>
          <h1 class="text-h5 q-my-none">Sign in</h1>
        </q-card-section>

        <q-card-section>
          <h2 class="text-subtitle1 text-weight-medium q-my-none">Sign in with your email address</h2>
          <template v-if="step === 'email'">
            <p class="q-mt-sm">We will email you a one-time sign-in code. There is no password and nothing to set up.</p>
            <q-input
              ref="email"
              v-model.trim="email"
              type="email"
              label="Email address"
              autocomplete="email"
              outlined
              lazy-rules
              :rules="[v => !!v || 'Enter your email address', v => /^\S+@\S+\.\S+$/.test(v || '') || 'Enter a valid email address']"
              :disable="busy"
              @keyup.enter="requestCode"
            />
            <q-btn color="primary" label="Email me a sign-in code" :loading="busy" @click="requestCode" />
          </template>
          <template v-else>
            <p class="q-mt-sm">
              If <b>{{ email }}</b> can sign in with a code, one is on its way. Enter it below.
              It can be used once and expires after 10 minutes.
            </p>
            <q-input
              ref="code"
              v-model="code"
              label="Sign-in code"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="12"
              outlined
              autofocus
              :error="!!codeError"
              :error-message="codeError"
              :disable="busy"
              @keyup.enter="confirmCode"
            />
            <div class="q-gutter-sm">
              <q-btn color="primary" label="Sign in" :loading="busy" :disable="!cleanCode" @click="confirmCode" />
              <q-btn flat :label="resendWait > 0 ? `Send a new code (${resendWait}s)` : 'Send a new code'" :disable="busy || resendWait > 0" @click="requestCode" />
              <q-btn flat label="Use a different email" :disable="busy" @click="startOver()" />
            </div>
            <p class="text-caption q-mt-md q-mb-none">
              No email? Check your spam folder. Lab staff are sent a short note instead of a code: use single sign-on below.
            </p>
          </template>
        </q-card-section>

        <q-separator />

        <q-card-section :class="{ 'bg-blue-1': ssoRequired }">
          <h2 class="text-subtitle1 text-weight-medium q-my-none">Lab staff</h2>
          <p class="q-mt-sm">
            <template v-if="ssoRequired">This account signs in with single sign-on.</template>
            <template v-else>Core lab staff and administrators sign in with {{ institutionName }} single sign-on.</template>
          </p>
          <q-btn outline color="primary" label="Sign in with single sign-on" @click="$login(next)" />
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script>
import { getCsrfToken } from '../utils/csrf.js'
import { safeNext } from '../utils/next.js'

const MAX_ATTEMPTS = 3
const RESEND_SECONDS = 30

export default {
  name: 'Login',
  data () {
    return {
      step: 'email',
      email: '',
      code: '',
      codeError: '',
      attempts: 0,
      busy: false,
      ssoRequired: false,
      resendWait: 0,
      resendTimer: null
    }
  },
  computed: {
    next () {
      return safeNext(this.$route.query.next)
    },
    cleanCode () {
      return (this.code || '').replace(/\D/g, '')
    },
    institutionName () {
      const institution = this.$store.getters.institution
      return institution && institution.name ? institution.name : 'your institution\'s'
    }
  },
  mounted () {
    const self = this
    // Also hands the browser its CSRF cookie, which the code requests need.
    this.$store.dispatch('checkAuth', { axios: this.$axios }).then(function () {
      if (self.$store.getters.isLoggedIn) {
        self.$router.replace(self.next)
      }
    })
  },
  beforeUnmount () {
    this.stopResendTimer()
  },
  methods: {
    errorCode (response) {
      const errors = (response.data && response.data.errors) || []
      return errors.length ? errors[0].code : null
    },
    ensureCsrf () {
      return getCsrfToken() ? Promise.resolve() : this.$axios.get('/api/get_user/').catch(() => {})
    },
    startOver (message) {
      this.step = 'email'
      this.code = ''
      this.codeError = ''
      this.attempts = 0
      if (message) {
        this.$q.notify({ message, type: 'warning' })
      }
    },
    startResendTimer () {
      const self = this
      this.stopResendTimer()
      this.resendWait = RESEND_SECONDS
      this.resendTimer = setInterval(function () {
        self.resendWait -= 1
        if (self.resendWait <= 0) {
          self.stopResendTimer()
        }
      }, 1000)
    },
    stopResendTimer () {
      if (this.resendTimer) {
        clearInterval(this.resendTimer)
        this.resendTimer = null
      }
      this.resendWait = 0
    },
    finish () {
      // A full page load, like the single sign-on path, so nothing loaded
      // while signed out is left behind.
      window.location.assign(this.next)
    },
    requestCode () {
      const self = this
      if (this.busy) {
        return
      }
      if (this.step === 'email' && this.$refs.email && !this.$refs.email.validate()) {
        return
      }
      this.busy = true
      this.ssoRequired = false
      this.ensureCsrf()
        .then(function () {
          return self.$store.dispatch('requestLoginCode', { axios: self.$axios, email: self.email })
        })
        .then(function (response) {
          if (response.status === 401) {
            const resent = self.step === 'code'
            self.step = 'code'
            self.code = ''
            self.codeError = ''
            self.attempts = 0
            self.startResendTimer()
            if (resent) {
              self.$q.notify({ message: 'A new code has been sent. Earlier codes no longer work.', type: 'info' })
            }
          } else if (response.status === 409) {
            self.finish() // already signed in
          } else if (self.errorCode(response) === 'too_many_login_attempts') {
            self.$q.notify({ message: 'Too many codes have been requested. Please wait a few minutes and try again.', type: 'negative' })
          } else if (response.status === 400) {
            self.startOver('Please check the email address and try again.')
          } else {
            self.$q.notify({ message: 'We could not send a sign-in code. Please try again.', type: 'negative' })
          }
        })
        .catch(function () {
          self.$q.notify({ message: 'We could not send a sign-in code. Please try again in a moment.', type: 'negative' })
        })
        .then(function () {
          self.busy = false
        })
    },
    confirmCode () {
      const self = this
      if (this.busy || !this.cleanCode) {
        return
      }
      this.busy = true
      this.$store.dispatch('confirmLoginCode', { axios: this.$axios, code: this.cleanCode })
        .then(function (response) {
          if (response.status === 200) {
            self.finish()
            return
          }
          if (response.status === 400) {
            self.attempts += 1
            if (self.attempts >= MAX_ATTEMPTS) {
              self.startOver('That code was entered incorrectly too many times. Request a new one.')
            } else {
              const left = MAX_ATTEMPTS - self.attempts
              self.code = ''
              self.codeError = `That code is not right. ${left} ${left === 1 ? 'try' : 'tries'} left.`
            }
          } else if (response.status === 403 && self.errorCode(response) === 'sso_required') {
            self.ssoRequired = true
            self.startOver()
          } else if (response.status === 403) {
            self.startOver('A sign-in code cannot be used for this email address. Please contact the lab.')
          } else {
            // 409: the code expired, was replaced, or was requested in another browser.
            self.startOver('That code is no longer valid. Request a new one.')
          }
        })
        .catch(function () {
          self.$q.notify({ message: 'We could not check the code. Please try again.', type: 'negative' })
        })
        .then(function () {
          self.busy = false
        })
    }
  }
}
</script>
