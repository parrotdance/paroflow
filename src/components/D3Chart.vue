<template>
  <svg id="d3chart" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { select } from 'd3-selection'
import { path, Path } from 'd3-path'
import config from './chartConfig'
import { Node, EdgeOption, EdgeDirection } from './chartConfig'
import drawArrow from './draw'

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
interface LinkNode extends Dictionary {
  source: Node
  target: Node
  outDir: EdgeDirection
  inDir: EdgeDirection
}
interface NodeMap extends Node {
  linkNodes: LinkNode
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
    const nodeMap: LinkNode = Array.from(config.nodes).reduce(
      (map, node) =>
        Object.assign(map, { [node.name]: { ...node, linkNodes: [] } }),
      {} as LinkNode
    )
    config.edges.forEach(edge => {
      const { source, target } = edge
      const sourceNode = nodeMap[source.name]
      const targetNode = nodeMap[target.name]
      if (sourceNode === undefined) {
        throw new Error(`Can not find Edge source node: ${sourceNode.name}.`)
      }
      if (targetNode === undefined) {
        throw new Error(`Can not find Edge source node: ${targetNode.name}.`)
      }
      sourceNode.linkNodes.push({
        target: targetNode,
        outDir: source.direction,
        inDir: target.direction,
        source: sourceNode
      })
    })
    const g = select('#d3chart')
      .selectAll('g')
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
      .attr('stroke-width', '2')
      .attr('rx', '4')
      .attr('ry', '4')
    g.append('text')
      .attr('x', d => d.center[0])
      .attr('y', d => d.center[1])
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text(d => d.text || '')

    // render arrows
    g.append('path')
      .attr('stroke', LINE_COLOR)
      .attr('fill', 'transparent')
      .attr('d', (source: any) => {
        const p = path()

        type GroupedLinkNodes = { [index: string]: LinkNode[] }
        const groupedLinkNodes: GroupedLinkNodes = source.linkNodes.reduce(
          (res: GroupedLinkNodes, linkNode: LinkNode) => {
            if (res[linkNode.outDir]) {
              res[linkNode.outDir].push(linkNode)
            } else {
              res[linkNode.outDir] = [linkNode]
            }
            return res
          },
          {} as GroupedLinkNodes
        )
        Object.values(groupedLinkNodes).forEach((linkNodes: LinkNode[]) =>
          linkNodes.forEach(n => drawArrow(p, n))
        )
        return p.toString()
      })
  }
}
</script>
