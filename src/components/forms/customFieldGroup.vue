<template>
  <slot v-if="!group"></slot>
  <div v-else class="custom-field-group q-mb-md" :class="{'custom-field-group--box': box}" role="group" :aria-label="group.title">
    <q-expansion-item v-if="group.collapsible" v-model="opened" header-class="q-px-sm">
      <template v-slot:header>
        <q-item-section>
          <div class="text-subtitle1 text-weight-medium">{{group.title}}<span v-if="group.description" class="q-ml-xs" tabindex="0" role="img" :aria-label="group.description"><q-icon name="info" size="xs" color="grey-7"/><q-tooltip>{{group.description}}</q-tooltip></span></div>
        </q-item-section>
      </template>
      <q-separator v-if="!box"/>
      <div class="q-pt-sm"><slot></slot></div>
    </q-expansion-item>
    <template v-else>
      <div class="q-px-sm q-pt-sm text-subtitle1 text-weight-medium">{{group.title}}<span v-if="group.description" class="q-ml-xs" tabindex="0" role="img" :aria-label="group.description"><q-icon name="info" size="xs" color="grey-7"/><q-tooltip>{{group.description}}</q-tooltip></span></div>
      <q-separator v-if="!box" class="q-mt-xs"/>
      <div class="q-pt-sm"><slot></slot></div>
    </template>
  </div>
</template>

<script>
// Wraps a group of custom fields in a box or under a header (optionally
// collapsible).  Without a group the content is rendered as is.
export default {
  props: ['group', 'hasErrors'],
  data () {
    return {
      opened: !(this.group && this.group.collapsed)
    }
  },
  watch: {
    // A collapsed group would hide its fields' errors and warnings
    hasErrors: {
      handler (val) {
        if (val) {
          this.opened = true
        }
      },
      immediate: true
    }
  },
  computed: {
    box () {
      return this.group.display !== 'header'
    }
  }
}
</script>

<style scoped>
.custom-field-group--box {
  border: 1px solid rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}
</style>
