<template>
  <div>
    <h1>DEMO2</h1>
    <svg id="demo2" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import FlowChart from '@/lib/chart'

@Component
export default class Demo2 extends Vue {
  mounted() {
    this.renderChart()
  }

  private renderChart(): void {
    const flowChart = new FlowChart('#demo2', {
      edgeColor: '#000000',
      nodeBorderColor: '#000000',
      height: 300,
      linkType: 'normal'
    })
    flowChart
      // .addNode('a', 400, 60, 'A', { backgroundColor: '#409EFF' })
      // .addNode('b', 200, 150, 'B', { backgroundColor: '#67C23A' })
      // .addNode('c', 600, 150, 'C', { backgroundColor: '#E6A23C' })
      // .addNode('d', 400, 240, 'D', { backgroundColor: '#F56C6C' })
      // .addNode('e', 400, 150, 'E', { backgroundColor: '#909399' })
      // .addEdge('a', 'b', { direction: 'left-top' })
      // .addEdge('a', 'c', { direction: 'right-top' })
      // .addEdge('a', 'b', { direction: 'top-left' })
      // .addEdge('a', 'c', { direction: 'top-right' })
      // .addEdge('b', 'd', { direction: 'bottom-left' })
      // .addEdge('c', 'd', { direction: 'bottom-right' })
      // .addEdge('d', 'b', { direction: 'bottom-left' })
      // .addEdge('d', 'c', { direction: 'bottom-right' })
      // .addEdge('e', 'a', { direction: 'top-bottom' })
      // .addEdge('e', 'b', { direction: 'left-right' })
      // .addEdge('e', 'c', { direction: 'right-left' })
      // .addEdge('e', 'd', { direction: 'bottom-top' })

      .addNode('a', 300, 60, 'A', { backgroundColor: '#409EFF' })
      .addNode('b', 200, 150, 'B', { backgroundColor: '#67C23A' })
      .addNode('c', 600, 150, 'C', { backgroundColor: '#E6A23C' })
      .addNode('d', 400, 240, 'D', { backgroundColor: '#F56C6C' })
      .addNode('e', 400, 150, 'E', { backgroundColor: '#909399' })
      .addEdge('b', 'a', { direction: 'right-left', linkType: 'default' })
      .addEdge('b', 'd', { direction: 'right-left' })

    flowChart.render()
    flowChart.drag()
  }
}
</script>
