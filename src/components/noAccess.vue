<template>
  <q-card class="q-pa-md" style="max-width: 680px">
    <q-card-section>
      <h1 class="text-h5 q-my-none">This submission is not available</h1>
      <p class="q-mt-md">
        Either it does not exist, or it does not list the email address you are signed in with.
        A submission can be opened by its submitter, its PI and the contacts listed on it.
      </p>
      <p v-if="email">You are signed in as <b>{{ email }}</b>.</p>
      <ul>
        <li>If the submission lists a different address of yours, sign out and sign in with that address, or add it to your account under Profile, Emails.</li>
        <li>Otherwise ask the submitter, or the lab, to add you as a contact on the submission.</li>
      </ul>
    </q-card-section>
    <q-card-actions>
      <q-btn flat color="primary" label="My submissions" :to="{ name: 'my_submissions' }" />
      <q-btn flat color="primary" label="Add another email" :to="{ name: 'profile' }" />
      <q-btn flat color="primary" label="Sign out" @click="$logout()" />
    </q-card-actions>
  </q-card>
</template>

<script>
// Shown in place of a submission the API answered 403/404 for.
export default {
  name: 'NoAccess',
  computed: {
    email () {
      const user = this.$store.getters.getUser
      return user ? (user.email || user.username) : ''
    }
  }
}
</script>
