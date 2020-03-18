<template>
  <tbody>
    <tr v-for="(row, i) in arr" :key="i">
      <td v-for="(v, j) in row" :key="j" v-bind:class="{header:isHeader(i,j)}">{{v}}</td>
    </tr>
  </tbody>
</template>

<script>
export default {
  props: ['arr'],
  methods: {
    isHeader (i, j) {
      return j % 2 === 0
    }
  }
}
</script>
<style>
  td.header {
    font-weight: bold
  }
</style>
