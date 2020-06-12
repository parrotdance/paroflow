<template>
  <div id="app">
    <Demo1 />
    <Demo2 />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Demo1 from './components/Demo1.vue'
import Demo2 from './components/Demo2.vue'

@Component({
  components: {
    Demo1,
    Demo2
  }
})
export default class App extends Vue {}
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
