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
    const flowChart = new FlowChart('#d3chart', {
      lineColor: 'blue'
    })
    flowChart
      .addNode('a', 50, 130, '测试')
      .addNode('b', 150, 130, '测试2ab', { backgroundColor: 'grey' })
      .addEdge('a', 'b', { direction: 'right-top', color: 'red' })
      .addNode('c', 350, 50, ['测试测试测试测试试', '测试测试测试测试试'], {
        borderColor: 'yellow'
      })
      .addNode(
        'd',
        350,
        270,
        '测试测试测试\n测试测试测试测试\n测试测试测试测试\n测试测试测试测试'
      )
      .addEdge('b', 'c')
      .addEdge('b', 'd')
      .addNode('e', 550, 130, '测试测试试')
      .addEdge('c', 'e', { direction: 'right-top' })
      .addEdge('d', 'e', { direction: 'right-bottom' })
    flowChart.render()
  }
}
</script>
