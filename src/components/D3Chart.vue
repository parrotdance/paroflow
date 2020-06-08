<template>
  <svg id="d3chart"></svg>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { select } from 'd3-selection'
import { path } from 'd3-path'
import config from './chartConfig'
import { EdgeOption } from './chartConfig'

interface Dictionary<T = any> {
  [index: string]: T
}

interface RectOption extends Dictionary {
  svgId: string
  center: Array<number>
  width: number
  height: number
  radius?: number
}

interface NodeInfo extends Omit<RectOption, 'svgId'> {
  linkNodes: EdgeOption[]
}

const LINE_COLOR = '#47b785'

@Component
export default class D3Chart extends Vue {
  mounted() {
    this.renderChart()
  }
  private setViewport(): void {
    const attr = { width: 800, height: 600 }
    const svg = select('#d3chart')
    Object.entries(attr).forEach(([k, v]) => svg.attr(k, v))
  }
  private renderChart(): void {
    this.setViewport()
    // merge nodes and edges
    const nodeMap = Array.from(config.nodes).reduce<NodeInfo>(
      (map, node) =>
        Object.assign(map, { [node.name]: { ...node, linkNodes: [] } }),
      {} as any
    )
    config.edges.forEach(edge => {
      let { source, target } = edge
      source =
        typeof source === 'string'
          ? { name: source, direction: 'right' }
          : source
      target =
        typeof target === 'string'
          ? { name: target, direction: 'left' }
          : target
      const sourceNode = nodeMap[source.name]
      const targetNode = nodeMap[target.name]
      if (sourceNode === undefined) {
        throw new Error(`Can not find Edge source node: ${sourceNode.name}.`)
      }
      if (targetNode === undefined) {
        throw new Error(`Can not find Edge source node: ${targetNode.name}.`)
      }
      sourceNode.linkNodes.push(targetNode)
      // TODO: render edge by linkNodes info
    })
    // render rects
    const g = select('#d3chart')
      .selectAll('rect')
      .data(Object.values(nodeMap))
      .enter()
      .append('g')
    g.append('rect')
      .attr('class', 'node-rect')
      .attr('x', d => d.center[0] - d.width / 2)
      .attr('y', d => d.center[1] - d.height / 2)
      .attr('width', d => d.width)
      .attr('height', d => d.height)
      .attr('stroke', LINE_COLOR)
      .attr('fill', 'transparent')
      .attr('stroke-width', '1')
      .attr('rx', '4')
      .attr('ry', '4')
    g.append('text')
      .attr('x', d => d.center[0] - d.width / 4)
      .attr('y', d => d.center[1] - d.height / 4)
      .text(d => d.text || '')

    // render arrows
    g.append('path')
      .attr('stroke', LINE_COLOR)
      .attr('fill', 'transparent')
      .attr('d', source => {
        if (source.nextNodes) {
          const p = path()

          source.nextNodes.forEach((target: any) => {
            const [x1, y1] = [
              source.center[0] + source.width / 2,
              source.center[1]
            ]
            const [x2, y2] = [
              target.center[0] - source.width / 2,
              target.center[1]
            ]
            const r = Math.abs(x1 - x2) * 0.5
            const PI = Math.PI

            p.moveTo(x1, y1)
            if (y1 === y2) {
              // 平行点
              p.lineTo(x2, y2)
            } else if (y1 < y2) {
              // 低位目标点
              p.arc(x1, y1 + r, r, 1.5 * PI, 2 * PI)
              p.lineTo(x2 - r, y2 - r)
              p.arc(x2, y2 - r, r, -PI, 0.5 * PI, true)
            } else if (y1 > y2) {
              // 高位目标点
              p.arc(x1, y1 - r, r, 0.5 * PI, 0, true)
              p.lineTo(x2 - r, y2 + r)
              p.arc(x2, y2 + r, r, 1 * PI, 1.5 * PI)
            }
          })
          return p.toString()
        } else {
          return ''
        }
      })
  }
}
</script>
