<template>
  <div v-if="submission">
    <q-btn @click="newNote" color="primary">Add note</q-btn>
    <notes :notes="getNotes" :noteHash="noteHash" :addNote="addNote" :deleteNote="deleteNote" :submission="submission"/>
  </div>
</template>

<script>
import Notes from '../components/notes.vue'
export default {
  props: ['submission'],
  data () {
    return {
      initialized: false,
      noteHash: {}
      // notes: [{created: new Date(), user: 'Anonymous'}]
    }
  },
  mounted: function () {
    console.log('mounted')
    var self = this
    console.log('hash', this.noteHash)

    // this.note = null
    // var self = this
    this.$axios
      .get('/api/notes/', {params: {submission: this.submission.id, page_size: 100}})
      .then(function (response) {
        // self.notes = response.data.results
        response.data.results.map(function (value, key) {
          self.addNote(value)
        })
        // self.addNote({id: 1, created: new Date(), user: 'Anonymous', text: 'This is the content of the note.', parent: null, type: 'NOTE'})
        // self.addNote({id: 2, created: new Date(), user: 'Foo', text: 'This is the content of the note 2.', parent: null, public: true, type: 'NOTE'})
        // self.addNote({id: 3, created: new Date(), user: 'Foo 2', text: 'This is the content of the note 2-1.', parent: 2, type: 'NOTE'})
        // self.addNote({id: 4, created: new Date(), user: 'Foo 3', text: 'This is the content of the note 2-2.', parent: 2, public: true, type: 'LOG'})
        // self.addNote({id: 5, created: new Date(), user: 'Foo 4', text: 'This is the content of the note 2-1-1.', parent: 3, type: 'NOTE'})
        // self.initialized = true
      })
  },
  created () {
    var self = this
    this.$on('addNote', function (note) {
      console.log('catch addNote', note)
      self.addNote(note)
    })
  },
  methods: {
    // formatDate (value) {
    //   return moment(String(value)).format('MM/DD/YYYY hh:mm')
    // },
    // save (note) {
    //   console.log('save', note.submission, note)
    //   // var method = note.id ? '$save' : '$create'
    //   if (!note.id && !note.public) {
    //     note.send_email = false
    //   }
    //   // @todo: implement following in axios
    //   // note[method](function() { Materialize.toast('Note saved',5000)}, function(){ Materialize.toast('Error saving note',5000)})
    // },
    newNote () {
      var note = {
        type: 'NOTE',
        submission: this.submission.id,
        // created_by:{{request.user.id}},
        send_email: true,
        public: true,
        edit: true,
        parent: null
      }
      this.addNote(note)
    },
    deleteNote (note) {
      if (note.id && !confirm('Are you sure you want to delete this note and all responses?')) {
        return
      }
      var self = this
      var parent = note.parent
      var id = note.id
      var removeFunc = function () {
        for (var i in self.noteHash[parent]) {
          if (self.noteHash[parent][i].id === id) {
            self.noteHash[parent].splice(i, 1)
          }
        }
        self.$q.notify({message: 'Note deleted', type: 'positive'})
      }
      if (!id) {
        removeFunc()
        return
      }
      // @todo: implement this in axios
      // note.remove()
      // For some reason this does not use the $axios.baseURL in quasar dev mode, but works once built and in production???
      this.$axios.delete(`/api/notes/${note.id}/?submission=${this.submission.id}`)
        .then(removeFunc)
        .catch(function (error) {
          console.log('error', error)
          self.$q.notify({message: 'Error deleting note', type: 'negative'})
        })
      // note.$remove(removeFunc,function(){Materialize.toast('Error deleting note',5000);});
    },
    // reply (parent) {
    //   var note = {
    //     type: 'NOTE',
    //     submission: this.submission.id,
    //     send_email: true,
    //     public: true,
    //     editing: true,
    //     parent: parent.id
    //   }
    //   this.addNote(note)
    // },
    addNote (note) {
      console.log('addNote', note)
      if (!this.noteHash[note.parent]) {
        this.$set(this.noteHash, note.parent, [])
        // this.noteHash[note.parent] = []
      }
      this.noteHash[note.parent].push(note)
    }// ,
    // getClasses (note) {
    //   if (!note.public) {
    //     return 'red lighten-4'
    //   }
    //   if (note.type === 'NOTE') {
    //     return 'green lighten-4'
    //   }
    //   if (note.type === 'LOG') {
    //     return 'orange lighten-5'
    //   }
    // },
    // getTypeText (note) {
    //   if (!note.public) {
    //     return 'Note (private)'
    //   }
    //   if (note.type === 'NOTE') {
    //     return 'Note'
    //   }
    //   if (note.type === 'LOG') {
    //     return 'Log'
    //   }
    // },
    // getEmailsText (note) {
    //   if (note.emails) {
    //     return '- Emailed to: ' + note.emails.join(', ')
    //   }
    // }
  },
  computed: {
    getNotes: function () {
      return this.noteHash[null]
    }
  },
  components: {
    Notes
  }
}
</script>

<style scoped>
  .q-card {
    min-width: 600px;
    max-width: 800px;
  }
</style>
