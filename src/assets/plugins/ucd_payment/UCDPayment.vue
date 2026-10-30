<template>
  <div class="row">
    <div class="col-sm-12 col-md-6 q-pa-sm">
      <q-select
        outlined
        emit-value map-options
        :model-value="modelValue.payment_type"
        @update:model-value="setPaymentType"
        :options="paymentTypes"
        stack-label label="* Payment Type"
        :error="hasError('payment_type')"
        bottom-slots :error-message="errorMessage('payment_type')"
      />
    </div>
    <div class="col-sm-12 col-md-6 q-pa-sm" v-if="modelValue.payment_type">
      <q-input
        v-model="modelValue.payment_info" type="text"
        stack-label :label="isChartstring ? '* Chartstring' : '* PO Number'"
        :error="hasError('payment_info')"
        bottom-slots :error-message="errorMessage('payment_info')"
      >
        <template v-slot:after v-if="isChartstring && finjector !== 'unavailable'">
          <q-btn flat no-caps color="primary" icon="search" label="Finjector"
            :loading="finjector === 'loading'" @click="findChartstring">
            <q-tooltip>Look up or build a chartstring with UC Davis Finjector</q-tooltip>
          </q-btn>
        </template>
      </q-input>
    </div>
    <div class="col-12 q-pa-sm" v-if="isChartstring">
      <q-banner dense rounded class="bg-grey-3">
        <template v-slot:avatar><q-icon name="info" color="primary"/></template>
        Use <b>Finjector</b> to look up or build your chartstring, or enter it in one of these formats (the order of the segments matters):
        <ul class="q-my-xs">
          <li>
            <b>GL</b>: Entity-Fund-Financial Department-Account, optionally followed by Purpose-Program-Project-Activity.
            See the <a target="_blank" rel="noopener noreferrer" href="https://financeandbusiness.ucdavis.edu/finance/chart-of-accounts/redesign">Chart of Accounts</a>.
          </li>
          <li>
            <b>PPM</b>: Project-Task-Organization-Expenditure Type, optionally followed by Award-Funding Source.
            POET order (Project-Organization-Expenditure Type-Task) is also accepted.
            See <a target="_blank" rel="noopener noreferrer" href="https://aggieenterprise.ucdavis.edu/poetaf">POETAF</a>.
          </li>
        </ul>
      </q-banner>
    </div>
    <div class="col-sm-12 col-md-6 q-pa-sm">
      <q-input
        v-model="modelValue.financial_contact_name" type="text"
        stack-label label="* Financial Contact Name"
        hint="Who to contact about billing, such as a department account manager or purchasing agent"
        :error="hasError('financial_contact_name')"
        bottom-slots :error-message="errorMessage('financial_contact_name')"
      />
    </div>
    <div class="col-sm-12 col-md-6 q-pa-sm">
      <q-input
        v-model="modelValue.financial_contact_email" type="email"
        stack-label label="* Financial Contact Email"
        :error="hasError('financial_contact_email')"
        bottom-slots :error-message="errorMessage('financial_contact_email')"
      />
    </div>
  </div>
</template>

<script>
import { loadFinjector } from './finjector'

const CHARTSTRING = 'DaFIS'

export default {
  props: {
    modelValue: {type: Object, default: function () { return {} }},
    editable: Boolean,
    errors: Object,
    modify: Boolean
  },
  data () {
    return {
      paymentTypes: [
        {label: 'UC Davis chartstring (Aggie Enterprise)', value: CHARTSTRING},
        {label: 'Purchase Order', value: 'Purchase Order'}
      ],
      finjector: 'loading' // then 'ready', or 'unavailable' if its script can't be loaded
    }
  },
  mounted () {
    // Loaded up front: Finjector opens a popup, which browsers only allow straight from a click.
    loadFinjector()
      .then(() => { this.finjector = 'ready' })
      .catch(() => { this.finjector = 'unavailable' })
  },
  computed: {
    isChartstring () {
      return this.modelValue.payment_type === CHARTSTRING
    }
  },
  methods: {
    setPaymentType (value) {
      if (value !== this.modelValue.payment_type) {
        this.modelValue.payment_type = value
        this.modelValue.payment_info = '' // a chartstring is no PO number, and vice versa
      }
    },
    findChartstring () {
      window.Finjector.findChartSegmentString()
        .then(response => {
          if (response.status === 'success') {
            this.modelValue.payment_info = response.data
          }
        })
        .catch(() => {}) // closed without choosing one
    },
    errorMessage (field) {
      if (this.errors && this.errors[field]) {
        return this.errors[field].join ? this.errors[field].join(', ') : this.errors[field]
      }
      return ''
    },
    hasError (field) {
      return this.errors && this.errors[field] !== undefined
    }
  }
}
</script>
