<template>
  <div>
    <h1>DEMO3</h1>
    <svg id="demo3" />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import FlowChart from '@/lib/chart'

@Component
export default class Demo3 extends Vue {
  mounted() {
    this.renderChart()
  }

  private renderChart(): void {
    const flowChart = new FlowChart('#demo3', {
      edgeColor: '#000000',
      nodeBorderColor: '#000000',
      height: 300
    })
    flowChart
      .addNode('a', 300, 60, 'A', { backgroundColor: '#409EFF' })
      .addNode('b', 200, 150, 'B', { backgroundColor: '#67C23A' })
      .addNode('c', 600, 150, 'C', {
        backgroundColor: '#E6A23C',
        extendLength: 40
      })
      .addNode('d', 400, 240, 'D', { backgroundColor: '#F56C6C' })
      .addNode('e', 400, 150, 'E', { backgroundColor: '#909399' })
      .addEdge('b', 'a', { direction: 'right-left', linkType: 'sourceBeam' })
      .addEdge('b', 'd', { direction: 'right-left', linkType: 'sourceBeam' })
      .addEdge('b', 'e', { direction: 'right-left', linkType: 'sourceBeam' })
      .addEdge('a', 'c', { direction: 'right-left', linkType: 'targetBeam' })
      .addEdge('d', 'c', { direction: 'right-left', linkType: 'targetBeam' })
      .addEdge('e', 'c', { direction: 'right-left', linkType: 'targetBeam' })

    flowChart.render()
    flowChart.drag()
  }
}
</script>
