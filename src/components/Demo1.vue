<template>
  <div>
    <h1>DEMO1</h1>
    <svg id="demo1" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import FlowChart from '@/lib/FlowChart'

@Component
export default class Demo1 extends Vue {
  mounted() {
    this.renderChart()
  }

  private renderChart(): void {
    const flowChart = new FlowChart('#demo1', { width: 720, height: 350 })
    flowChart
      .addNode('a', 70, 150, '节点A')
      .addNode('b', 200, 150, '粉色背景的节点B', { backgroundColor: '#eca290' })
      .addEdge('a', 'b')
      .addNode('c', 450, 80, '黄色边框的节点C', { borderColor: '#f3ff40' })
      .addNode(
        'd',
        420,
        250,
        '写了很多\n很多很多很多很多很多\n很多很多字的\n节点D'
      )
      .addEdge('b', 'c')
      .addEdge('b', 'd')
      .addNode('e', 550, 150, '很长很长很长很长很长很长很长的节点E')
      .addEdge('c', 'e', { direction: 'right-top' })
      .addEdge('d', 'e', { direction: 'right-bottom' })
    flowChart.render()
  }
}
</script>
