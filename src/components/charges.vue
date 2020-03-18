<template>
  <div>
    <!--
    <p class="caption">Search for service to add</p>
    <q-input color="amber" v-model="terms" placeholder="Enter service name or ID">
      <q-autocomplete
        @search="search"
        :min-characters="3"
        @selected="selected"
        :value-field="v => `${ v.code } - ${ v.name }`"
      />
    </q-input>
  -->
    <q-select
        v-if="$store.getters.isLoggedIn && services"
        placeholder="Select a service to add"
        filter
        v-model="select"
        :options="service_options"
        @input="add_service"
      />
    <table class="q-table q-table-horizontal-separator">
      <thead><tr><th>Service</th><th>Quantity</th><th>Notes</th></tr></thead>
      <tbody v-if="$store.getters.isLoggedIn">
        <tr v-if="line_items.length == 0"><td colspan="3">No charges have been added.</td></tr>
        <tr v-for="item in line_items" :key="item.service.id">
          <td><q-btn round color="red" icon="delete" size="sm" @click="deleteItem(item)"/><q-btn round color="green" icon="save" size="sm" @click="saveItem(item)"/> {{item.service.code}} - {{item.service.name}}</td>
          <td><q-input v-model="item.quantity" type="number" style="width: 50px;" class="float-right"/></td>
          <td><q-input v-model="item.notes" type="textarea"/></td>
        </tr>
      </tbody>
      <tbody v-else>
        <tr v-if="line_items.length == 0"><td colspan="3">No charges have been added.</td></tr>
        <tr v-for="item in line_items" :key="item.service.id">
          <td>{{item.service.code}} - {{item.service.name}}</td>
          <td>{{item.quantity}}</td>
          <td>{{item.notes}}</td>
        </tr>
      </tbody>
    </table>

  </div>
</template>

<script>

export default {
  props: ['submission'],
  data () {
    return {
      'select': null,
      'services': null,
      'line_items': []
    }
  },
  mounted: function () {
    var self = this
    this.$axios
      .get(`/api/billing/services/?ordering=code,name&page=1&page_size=1000`)// ${pagination.descending}&filter=${filter}
      .then(({ data }) => {
        self.services = data.results
      })
      .catch(error => {
        // there's an error... do SOMETHING
        console.log(error)
        // we tell QTable to exit the "loading" state
        this.loading = false
      })
    this.$axios
      .get(`/api/billing/line_items/?ordering=code,name&submission=${this.submission.id}&page=1&page_size=1000`)// ${pagination.descending}&filter=${filter}
      .then(({ data }) => {
        self.line_items = data.results
      })
      .catch(error => {
        // there's an error... do SOMETHING
        console.log(error)
        // we tell QTable to exit the "loading" state
        this.loading = false
      })
  },
  methods: {
    request ({ pagination, filter }) {
      // we set QTable to "loading" state
      this.loading = true

      // we do the server data fetch, based on pagination and filter received
      // (using Axios here, but can be anything; parameters vary based on backend implementation)
      var sortBy = pagination.sortBy
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
    // add_line_item (service) {
    //   this.line_items.push({service: service, quantity: 0, notes: ''})
    // },
    search (terms, done) {
      console.log('search', terms)
      this.$axios
        .get(`/api/billing/services/?search=${terms}&ordering=code,name&page=1&page_size=15`)// ${pagination.descending}&filter=${filter}
        .then(({ data }) => {
          console.log(data.results)
          done(data.results)
        })
        .catch(error => {
          // there's an error... do SOMETHING
          console.log(error)
          // we tell QTable to exit the "loading" state
          this.loading = false
        })
      // setTimeout(() => {
      //   done([])
      // }, 1000)
    },
    deleteItem (item) {
      var index = this.line_items.indexOf(item)
      var self = this
      if (item.id) {
        this.$axios.delete(`/api/billing/line_items/${item.id}/`)
          .then(function (response) {
            self.line_items.splice(index, 1)
            self.$q.notify(`Charge for "${item.service.name}" deleted.`)
          })
          .catch(function (error) {
            console.log('error', error)
            self.$q.notify({message: `Error deleting charge, "${item.service.name}".`, type: 'negative'})
          })
      } else {
        self.line_items.splice(index, 1)
        self.$q.notify(`Charge for "${item.service.name}" deleted.`)
      }

      // this.line_items.splice(index, 1)
      // this.$q.notify(`Charge for "${item.service.name}" deleted.`)
    },
    saveItem (item) {
      var self = this
      var method = item.id ? 'put' : 'post'
      var url = item.id ? `/api/billing/line_items/${item.id}/` : '/api/billing/line_items/'
      this.$axios[method](url, item)
        .then(function (response) {
          var index = self.line_items.indexOf(item)
          self.line_items.splice(index, 1, response.data)
          self.$q.notify({message: `Charge for "${item.service.name}" saved.`, type: 'positive'})
        })
        .catch(function (error) {
          console.log('error', error)
          self.$q.notify({message: `Error saving charge, "${item.service.name}".`, type: 'negative'})
        })
    },
    selected (service) {
      console.log('selected', service)
    },
    add_service (service) {
      for (var i in this.line_items) {
        if (this.line_items[i].service.id === service.id) {
          this.$q.notify({message: `Service, "${service.name}" already listed.`, type: 'negative'})
          return
        }
      }
      this.line_items.push({service: service, quantity: 0, notes: '', submission: this.submission.id})
      this.select = null
    }
  },
  computed: {
    service_options () {
      return this.services.map(s => ({label: `${s.code} - ${s.name}`, value: s}))
    }
  }
}
</script>
