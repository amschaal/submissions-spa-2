<template>
  <div>
    <div v-if="renderedDiff">
      <q-checkbox v-model="showUnchanged" label="Show Unchanged"/>
      <div v-html="renderedDiff" :class="showUnchanged ? 'show-unchanged' : 'hide-unchanged'"></div>
    </div>
    <div v-else>No changes have been detected</div>
  </div>
</template>

<script>
import * as jsondiffpatch from 'jsondiffpatch'
import * as htmlFormatter from 'jsondiffpatch/lib/formatters/html'
const JD = jsondiffpatch.create({})
export default {
  props: ['left', 'right', 'diff'],
  data () {
    return {
      renderedDiff: '',
      showUnchanged: false
    }
  },
  methods: {
    updateDiff (left, right) {
      const diff = JD.diff(left || this.left, right || this.right)
      this.renderedDiff = htmlFormatter.format(diff, left || this.left)
    }
  },
  mounted () {
    const diff = this.diff || JD.diff(this.left, this.right)
    this.renderedDiff = htmlFormatter.format(diff, this.left)
  },
  watch: { // This could be inefficient if many diffs, or diffs of large objects are active.  Perhaps it would be better to require the parent to explicitly call the updateDiff method.
    left: {
      handler () {
        this.updateDiff()
      },
      deep: true
    },
    right: {
      handler () {
        this.updateDiff()
      },
      deep: true
    }
  }
}
</script>

<style src="jsondiffpatch/lib/formatters/styles/html.css"></style>
<style>
.jsondiffpatch-unchanged {
  display: none;
}
.show-unchanged .jsondiffpatch-unchanged {
  display: block;
}
</style>
