<template>
  <div class="row">
    <div class="col-sm-12 col-md-12" v-if="this.$store.getters.isStaff">
      <q-input
        :error="hasError('ppms_order_id')"
        bottom-slots :error-message="errorMessage('ppms_order_id')"
        helper="To be assigned by the core."
        v-model="value.ppms_order_id"
        type="text"
        stack-label label="PPMS Order Ref #"
        />
    </div>
    <div class="col-sm-12 col-md-6">
      <q-select
        outlined
        emit-value map-options
        v-model="value.payment_type"
        :options="[
          {label: 'UCD KFS Account', value: 'DaFIS'},
          {label: 'UC Chart String', value: 'UC Chart String'},
          {label: 'Credit Card (Non UC only)', value: 'Credit Card'},
          {label: 'Purchase Order', value: 'Purchase Order'}
        ]"
        stack-label label="* Payment Type"
        :error="hasError('payment_type')"
        bottom-slots :error-message="errorMessage('payment_type')"
        :helper="type_help"
      />
    </div>
    <div class="col-sm-12 col-md-6">
      <q-input
        :error="hasError('payment_info')"
        bottom-slots :error-message="errorMessage('payment_info')"
        v-model="value.payment_info" type="text"
        stack-label label="Payment Info"
        />
    </div>
  </div>
</template>

<script>
import { QSelect } from 'quasar'
// import _ from 'lodash'

export default {
  props: {
    value: {type: Object, default: function () { return {} }},
    editable: Boolean,
    errors: Object,
    modify: Boolean
  }, // ['value', 'editable', 'errors', 'modify'],
  data () {
    return {
      payment: this.value
    }
  },
  methods: {
    errorMessage (field) {
      if (this.errors && this.errors[field] && this.errors[field]) {
        return this.errors[field].join ? this.errors[field].join(', ') : this.errors[field]
      }
      return ''
    },
    hasError (field) {
      return this.errors && this.errors[field] !== undefined
    }
  },
  computed: {
    type_help () {
      var paymentType = this.value ? this.value.payment_type : null
      console.log('type_help', paymentType)
      switch (paymentType) {
        case 'DaFIS':
          return 'Enter payment info in the form CHART-ACCOUNT, e.g. 3-MYACCNT'
        case 'Credit Card':
          return 'Details required after invoicing (leave payment info blank)'
        default:
          return ''
      }
    }
  },
  components: {
    QSelect
  },
  watch: {
    // payment: function (newValue, oldValue) {
    //   this.$emit('input', this.payment)
    // }
  }
}
</script>
<style>
.q-field {
  padding: 3px !important;
}
</style>
