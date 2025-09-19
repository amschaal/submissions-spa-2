<template>
  <div>
    <div v-for="note in notes" :key="note.id" class="notes">
      <q-card :class="getClasses(note)">
        <q-card-section>
           <div class="text-h7">{{getTypeText(note)}} {{getEmailsText(note)}} <span class="float-right"><q-icon name="edit" @click.native="$set(note, 'edit', true)" v-if="note.can_modify"/> <q-icon name="delete" @click.native="deleteNote(note)" v-if="!note.id || note.can_modify"/> <q-icon v-if="note.id" name="reply" @click.native="reply(note)"/></span></div>
           <div class="text-subtitle3"><span v-if="note.user"><b>{{ note.user }}</b> wrote:</span> <span class="float-right" v-if="note.created">{{note.created | formatDate}}</span></div>
        </q-card-section>
        <q-card-section v-if="!note.edit" class="q-pt-xs">
          <div class="note-content" v-html="convertUrlsToLinks(removeHTMLTags(note.text))"></div>
        </q-card-section>
        <q-card-section v-if="note.edit">
          <form>
            <p><textarea v-model="note.text"></textarea></p>
          </form>
        </q-card-section>
        <q-card-actions v-if="note.edit">
          <div class="float-left controls" v-if="$perms.hasSubmissionPerms(submission, ['ADMIN','STAFF'], 'ANY')">
            <q-checkbox v-model="note.public" label="Private" :true-value="false" :false-value="true"/> <q-checkbox v-model="note.send_email" label="Email submitter" v-if="note.public && !note.id" title="Select if you want to email the submitter."/> <q-checkbox v-model="note.email_participants" label="Email participants" v-if="!note.id" title="Select if you want to email core participants."/>
          </div>
          <div class="float-right controls"><q-btn @click="save(note)" label="Save" color="primary"/></div>
        </q-card-actions>
      </q-card>
      <notes :notes="getResponses(note)" :noteHash="noteHash" :addNote="addNote" :deleteNote="deleteNote" :submission="submission"/>
    </div>
  </div>
</template>

<script>

export default {
  name: 'notes',
  props: ['submission', 'notes', 'noteHash', 'addNote', 'deleteNote'],
  methods: {
    getResponses (note) {
      if (note) {
        return this.noteHash[note.id]
      } else {
        return this.noteHash[null]
      }
    },
    save (note) {
      // console.log('save', note.submission, note)
      var self = this
      var method = note.id ? 'put' : 'post'
      var url = note.id ? `/api/notes/${note.id}/?submission=${note.submission}` : '/api/notes/'
      if (!note.id && !note.public) {
        note.send_email = false
      }
      this.$axios[method](url, note)
        .then(function (response) {
          // console.log(response, self.noteHash[note.parent].indexOf(note))
          var index = self.noteHash[note.parent].indexOf(note)
          self.noteHash[note.parent].splice(index, 1, response.data)
          self.$q.notify({message: 'Note saved', type: 'positive'})
        })
        .catch(function (error) {
          console.log('error', error)
          self.$q.notify({message: 'Error saving note', type: 'negative'})
        })
    },
    reply (parent) {
      var note = {
        type: 'NOTE',
        submission: parent.submission,
        send_email: true,
        email_participants: true,
        public: true,
        edit: true,
        parent: parent.id
      }
      // this.$emit('addNote', note)
      this.addNote(note)
    },
    getClasses (note) {
      if (!note.public) {
        return 'bg-red-2 lighten-4 q-ma-sm'
      }
      if (note.type === 'NOTE') {
        return 'bg-light-green-3 lighten-4 q-ma-sm'
      }
      if (note.type === 'LOG') {
        return 'bg-yellow-2 q-ma-sm'
      }
    },
    getTypeText (note) {
      if (!note.public) {
        return 'Note (private)'
      }
      if (note.type === 'NOTE') {
        return 'Note'
      }
      if (note.type === 'LOG') {
        return 'Log'
      }
    },
    getEmailsText (note) {
      if (note.emails) {
        return '- Emailed to: ' + note.emails.join(', ')
      }
    },
    convertUrlsToLinks (text) {
      const urlPattern = /(https?:\/\/[^\s]+)/g // Match http or https URLs
      return text.replace(urlPattern, (url) => {
        return `<a href="${url}" target="_blank">${url}</a>`
      })
    },
    removeHTMLTags (htmlString) {
      const parser = new DOMParser()
      const doc = parser.parseFromString(htmlString, 'text/html')
      return doc.body.textContent.trim()
    }
  }
}
</script>

<style scoped>
  .notes .q-card {
    width: 100%;
  }
  .notes .q-card-main {
    white-space: pre-wrap;
  }
  .notes .notes {
    margin-left: 15px;
  }
  .notes form textarea {
    width: 100%;
  }
  .notes .note-content {
    white-space: pre-wrap;
  }
</style>
