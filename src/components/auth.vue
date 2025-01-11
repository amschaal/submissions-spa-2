<template>
  <div>
    <q-modal v-model="opened" ref="modal" @hide="clear()">
      <q-modal-layout>
        <template v-slot:header>
<q-toolbar >
          <q-toolbar-title>
            Login
          </q-toolbar-title>
        </q-toolbar>
</template>

        <div class="layout-padding">
          <q-field
            label="Username"
            :error="error"
          >
            <q-input v-model="username"/>
          </q-field>
          <q-field
            label="Password"
            :error="error"
            error-label="Authentication failed"
          >
            <q-input v-model="password" type="password"/>
          </q-field>
        </div>
        <template v-slot:footer>
<q-toolbar >
          <q-toolbar-title>
            <q-btn
              color="positive"
              label="submit"
              @click="login"
            />
          </q-toolbar-title>
        </q-toolbar>
</template>
      </q-modal-layout>
    </q-modal>
  </div>
</template>

<script>
// import axios from 'axios'

export default {
  props: ['show_login'],
  data () {
    return {
      opened: this.show_login,
      username: null,
      password: null,
      error: false
    }
  },
  methods: {
    login () {
      const self = this
      console.log('$auth', this.$store._actions)
      this.$store.dispatch('login', {username: this.username, password: this.password, axios: this.$axios}).then(
        function () {
          self.clear()
          self.opened = false
        }).catch(
        function (error) {
          console.log('caught error', error)
          self.error = true
        })
    },
    logout () {
      this.$store.dispatch('logout', {axios: this.$axios})
    },
    clear () {
      this.error = false
      this.username = ''
      this.password = ''
    }
  },
  mounted () {
    console.log('mounting auth')
  }
}

</script>
