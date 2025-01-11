<template>
  <div>
    <div v-for="note in notes" :key="note.id" class="notes">
      <q-card :class="getClasses(note)">
        <q-card-section>
           <div class="text-h7">{{getTypeText(note)}} {{getEmailsText(note)}} <span class="float-right"><q-icon name="edit" @click.native="$set(note, 'edit', true)" v-if="note.can_modify"/> <q-icon name="delete" @click.native="deleteNote(note)" v-if="!note.id || note.can_modify"/> <q-icon v-if="note.id" name="reply" @click.native="reply(note)"/></span></div>
           <div class="text-subtitle3"><span v-if="note.user"><b>{{ note.user }}</b> wrote:</span> <span class="float-right" v-if="note.created">{{ $filters.formatDate(note.created) }}</span></div>
        </q-card-section>
        <q-card-section v-if="!note.edit">
        {{note.text}}
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
  data () {
    return {
      // note: {}
      // notes: [{created: new Date(), user: 'Anonymous'}]
    }
  },
  mounted: function () {
    console.log('notes:notes', this.notes)
    console.log('notes:noteHash', this.noteHash)
    // this.addNote({id: 1, created: new Date(), user: 'Anonymous', text: 'This is the content of the note.'})
    // this.note = null
    // var self = this
    // this.$axios
    //   .get('/api/notes/', {params: {submission: this.submission.id, page_size: 100}})
    //   .then(function (response) {
    //     self.notes = response.data.results
    //   })
  },
  methods: {
    getResponses (note) {
      if (note) {
        return this.noteHash[note.id]
      } else {
        return this.noteHash[null]
      }
    },
    save (note) {
      console.log('save', note.submission, note)
      const self = this
      const method = note.id ? 'put' : 'post'
      const url = note.id ? `/api/notes/${note.id}/?submission=${note.submission}` : '/api/notes/'
      if (!note.id && !note.public) {
        note.send_email = false
      }
      this.$axios[method](url, note)
        .then(function (response) {
          console.log(response, self.noteHash[note.parent].indexOf(note))
          const index = self.noteHash[note.parent].indexOf(note)
          self.noteHash[note.parent].splice(index, 1, response.data)
          self.$q.notify({message: 'Note saved', type: 'positive'})
        })
        .catch(function (error) {
          console.log('error', error)
          self.$q.notify({message: 'Error saving note', type: 'negative'})
        })
      // @todo: implement following in axios
      // note[method](function() { Materialize.toast('Note saved',5000)}, function(){ Materialize.toast('Error saving note',5000)})
    },
    // newNote () {
    //   var note = {
    //     type: 'NOTE',
    //     submission: this.submission.id,
    //     // created_by:{{request.user.id}},
    //     send_email: true,
    //     public: true,
    //     editing: true,
    //     parent: null
    //   }
    //   this.addNote(note)
    // },
    // deleteNote (note) {
    // if (note.id && !confirm('Are you sure you want to delete this note and all responses?')) {
    //   return
    // }
    // var parent = note.parent
    // var id = note.id
    // var removeFunc = function () {
    //   for (var i in this.noteHash[parent]) {
    //     if (this.noteHash[parent][i].id === id) {
    //       this.noteHash[parent].splice(i, 1)
    //     }
    //   }
    //   this.$q.notify('Note deleted')
    // }
    // if (!id) {
    //   removeFunc()
    //   return
    // }
    // // @todo: implement this in axios
    // note.remove()
    // // note.$remove(removeFunc,function(){Materialize.toast('Error deleting note',5000);});
    // },
    reply (parent) {
      console.log('reply', parent)
      const note = {
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
    // addNote (note) {
    //   console.log('addNote', note)
    //   if (!this.noteHash[note.parent]) {
    //     this.noteHash[note.parent] = []
    //   }
    //   this.noteHash[note.parent].push(note)
    // },
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
    }
  }
}
</script>

<style scoped>
  .q-card {
    /* min-width: 600px;
    max-width: 800px; */
  }
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
</style>
