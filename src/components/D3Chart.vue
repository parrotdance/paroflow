<template>
  <svg id="d3chart" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import FlowChart from './FlowChart'

@Component
export default class D3Chart extends Vue {
  mounted() {
    this.renderChart()
  }

  private renderChart(): void {
    const flowChart = new FlowChart('#d3chart')
    flowChart
      .addNode('a', 50, 130, '测试')
      .addNode('b', 150, 130, '测试2ab')
      .addEdge('a', 'b', 'right-top')
      .addNode('c', 350, 50, '测试测试测试测试试')
      .addNode('d', 350, 270, '测试测试测试测试测试测试')
      .addEdge('b', 'c')
      .addEdge('b', 'd')
      .addNode('e', 550, 130, '测试测试试')
      .addEdge('c', 'e', 'right-top')
      .addEdge('d', 'e', 'right-bottom')
    flowChart.render()
  }
}
</script>
