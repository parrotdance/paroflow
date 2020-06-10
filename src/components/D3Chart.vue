<template>
  <svg id="d3chart" />
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { select } from 'd3-selection'
import { path } from 'd3-path'
import config from './chartConfig'
import { Node, EdgeOption, EdgeDirection } from './chartConfig'

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
type Coordinate = [number, number]

const LINE_COLOR = '#47b785'

const getLinkPoint: (n: Node, dir: string) => Coordinate = (
  n: Node,
  dir: string
) => {
  const [x, y] = n.center
  const { width, height } = n
  const dx = width / 2
  const dy = height / 2
  switch (dir) {
    case 'top':
      return [x, y - dy]
    case 'right':
      return [x + dx, y]
    case 'bottom':
      return [x, y + dy]
    case 'left':
      return [x - dx, y]
    default:
      console.warn('invalid node: ', n)
      return [x, y]
  }
}
const getDistance = (p1: number[], p2: number[]) => {
  const a = Math.abs(p2[0] - p1[0])
  const b = Math.abs(p2[1] - p1[1])
  return Math.sqrt(a * a + b * b)
}

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
      .attr('stroke-width', '1')
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
        Object.values(groupedLinkNodes).forEach((linkNodes: LinkNode[]) => {
          /**
           * 1. group linkNodes by start direction
           * 2. computed nearest node and divide by 2 for turning point coordinates
           * 3. line the path for this direction
           * 4. loop 1-3
           */
          const minDistance = linkNodes
            .map<[Coordinate, Coordinate]>(linkNode => [
              getLinkPoint(linkNode.source, linkNode.outDir),
              getLinkPoint(linkNode.target, linkNode.inDir)
            ])
            .reduce<number>(
              (min, p: [Coordinate, Coordinate]) =>
                Math.min(Math.abs(p[0][0] - p[1][0]), min),
              Number.MAX_SAFE_INTEGER
            )
          const td = minDistance / 2 // turning distance
          linkNodes.forEach(linkNode => {
            const { source, target } = linkNode
            const [x1, y1] = getLinkPoint(source, linkNode.outDir)
            const [x2, y2] = getLinkPoint(target, linkNode.inDir)
            p.moveTo(x1, y1)
            switch (linkNode.outDir) {
              case 'top':
                p.lineTo(x1, y1 - td)
                p.lineTo(x2, y1 - td)
                p.lineTo(x2, y2)
                break
              case 'bottom':
                p.lineTo(x1, y1 + td)
                p.lineTo(x2, y1 + td)
                p.lineTo(x2, y2)
                break
              default:
                // right
                p.lineTo(x1 + td, y1)
                p.lineTo(x1 + td, y2)
                p.lineTo(x2, y2)
            }
          })
        })
        return p.toString()
      })
  }
}
</script>
