import { select } from 'd3-selection'
import { path, Path } from 'd3-path'

export interface Node {
  name: string
  center: [number, number]
  width: number
  height: number
  text: string[]
  style: { [index: string]: any }
}
export type NodeName = string
export type EdgeDirection = 'top' | 'right' | 'bottom' | 'left'
export interface EdgeOption {
  name: NodeName
  direction: EdgeDirection
}
export interface Edge {
  source: EdgeOption
  target: EdgeOption
}
interface FlowChartConfig {
  nodes: Node[]
  edges: Edge[]
}
interface Dictionary<T = any> {
  [index: string]: T
}

interface LinkNode extends Dictionary {
  source: Node
  target: Node
  outDir: EdgeDirection
  inDir: EdgeDirection
}
type Coordinate = [number, number]

const map: any = {
  '1000100001000000': 'yx', // top-top-rt
  '1000100000010000': 'xy', // top-top-rb
  '1000100000000100': 'xy', // top-top-lb
  '1000100000000001': 'yx', // top-top-lt
  '1000010001000000': 'xy', // top-right-rt
  '1000010000010000': 'xyx', // top-right-rb
  '1000010000000100': 'xyx', // top-right-lb
  '1000010000000001': 'yx', // top-right-lt
  '1000001001000000': 'xy', // top-bottom-rt
  '1000001000010000': 'xyx', // top-bottom-rb
  '1000001000000100': 'xyx', // top-bottom-lb
  '1000001000000001': 'xy', // top-bottom-lt
  '1000000101000000': 'xy', // top-left-rt
  '1000000100010000': 'xy', // top-left-rb
  '1000000100000100': 'xy', // top-left-lb
  '1000000100000001': 'xy', // top-left-lt

  '0100100001000000': 'yx', // right-top-rt
  '0100100000010000': 'xy', // right-top-rb
  '0100100000000100': 'yx', // right-top-lb
  '0100100000000001': 'yx', // right-top-lt
  '0100010001000000': 'xy', // right-right-rt
  '0100010000010000': 'xy', // right-right-rb
  '0100010000000100': 'yx', // right-right-lb
  '0100010000000001': 'yx', // right-right-lt
  '0100001001000000': 'xy', // right-bottom-rt
  '0100001000010000': 'yx', // right-bottom-rb
  '0100001000000100': 'yx', // right-bottom-lb
  '0100001000000001': 'yx', // right-bottom-lt
  '0100000101000000': 'yx', // right-left-rt
  '0100000100010000': 'yx', // right-left-rb
  '0100000100000100': 'yxy', // right-left-lb
  '0100000100000001': 'yxy', // right-left-lt

  '0010100001000000': 'xyx', // bottom-top-rt
  '0010100000010000': 'xy', // bottom-top-rb
  '0010100000000100': 'xy', // bottom-top-lb
  '0010100000000001': 'xyx', // bottom-top-lt
  '0010010001000000': 'xy', // bottom-right-rt
  '0010010000010000': 'xy', // bottom-right-rb
  '0010010000000100': 'yx', // bottom-right-lb
  '0010010000000001': 'xy', // bottom-right-lt
  '0010001001000000': 'xy', // bottom-bottom-rt
  '0010001000010000': 'yx', // bottom-bottom-rb
  '0010001000000100': 'yx', // bottom-bottom-lb
  '0010001000000001': 'xy', // bottom-bottom-lt
  '0010000101000000': 'xy', // bottom-left-rt
  '0010000100010000': 'xy', // bottom-left-rb
  '0010000100000100': 'xy', // bottom-left-lb
  '0010000100000001': 'xy', // bottom-left-lt

  '0001100001000000': 'xy', // left-top-rt
  '0001100000010000': 'xy', // left-top-rb
  '0001100000000100': 'yx', // left-top-lb
  '0001100000000001': 'xy', // left-top-lt
  '0001010001000000': 'yxy', // left-right-rt
  '0001010000010000': 'yxy', // left-right-rb
  '0001010000000100': 'yx', // left-right-lb
  '0001010000000001': 'yx', // left-right-lt
  '0001001001000000': 'yx', // left-bottom-rt
  '0001001000010000': 'yx', // left-bottom-rb
  '0001001000000100': 'yx', // left-bottom-lb
  '0001001000000001': 'yx', // left-bottom-lt
  '0001000101000000': 'yx', // left-left-rt
  '0001000100010000': 'yx', // left-left-rb
  '0001000100000100': 'xy', // left-left-lb
  '0001000100000001': 'xy' // left-left-lt
}

/**
 *  left/l  right/r
 *     ↓       ↓
 *   [[ ],[ ],[ ]]  <- top/t
 *   [[ ],[ ],[ ]]
 *   [[ ],[ ],[ ]]  <- bottom/b
 *   by - ay >= 0 ? b : t
 *   bx - ax >= 0 ? r : l
 */
const DIR_MATRIX = [
  ['lt', 't', 'rt'],
  ['l', '', 'r'],
  ['lb', 'b', 'rb']
]

class FlowChart {
  private _svg?: any
  private nodes: Node[] = []
  private edges: Edge[] = []
  private LINE_COLOR = '#47b785'
  constructor(el: string, width = 800, height = 600) {
    const attr = { width, height }
    this._svg = select(el)
    Object.entries(attr).forEach(([k, v]) => this._svg.attr(k, v))
  }
  private getBoundPoint(
    node: Node,
    dir: EdgeDirection,
    extend: boolean,
    length = 12
  ) {
    const {
      center: [x, y],
      width,
      height
    } = node
    let dx = 0,
      dy = 0
    const extendLength = extend ? length : 0
    if (dir === 'top') {
      dy = -0.5 * height - extendLength
    } else if (dir === 'right') {
      dx = 0.5 * width + extendLength
    } else if (dir === 'bottom') {
      dy = 0.5 * height + extendLength
    } else {
      dx = -0.5 * width - extendLength
    }
    return [x + dx, y + dy] as Coordinate
  }
  private getDirection(a: Coordinate, b: Coordinate) {
    const [ax, ay] = a
    const [bx, by] = b
    const ver = bx - ax >= 0 ? 2 : 0
    const hor = by - ay >= 0 ? 2 : 0
    return DIR_MATRIX[hor][ver]
  }
  private getTextLength(text: string): number {
    let len = 0,
      i = 0

    while (i < text.length) {
      if (text.charCodeAt(i) > 127 || text.charCodeAt(i) == 94) {
        len += 2
      } else {
        len++
      }
      i++
    }
    return len
  }
  private getArrowTypeSign(
    outDir: EdgeDirection,
    inDir: EdgeDirection,
    dir: string
  ) {
    let sign = 0
    switch (outDir) {
      case 'top':
        sign += 1 << 15
        break
      case 'right':
        sign += 1 << 14
        break
      case 'bottom':
        sign += 1 << 13
        break
      case 'left':
        sign += 1 << 12
        break
    }
    switch (inDir) {
      case 'top':
        sign += 1 << 11
        break
      case 'right':
        sign += 1 << 10
        break
      case 'bottom':
        sign += 1 << 9
        break
      case 'left':
        sign += 1 << 8
        break
    }
    switch (dir) {
      case 'rt':
        sign += 1 << 6
        break
      case 'rb':
        sign += 1 << 4
        break
      case 'lb':
        sign += 1 << 2
        break
      case 'lt':
        sign += 1 << 0
        break
    }
    return sign.toString(2).padStart(16, '0')
  }
  private drawArrow(p: Path, ep: Coordinate, inDir: EdgeDirection, size = 6) {
    let [x1, y1] = ep,
      [x2, y2] = ep
    switch (inDir) {
      case 'top':
        x1 -= size
        y1 -= size
        x2 += size
        y2 -= size
        break
      case 'right':
        x1 += size
        y1 -= size
        x2 += size
        y2 += size
        break
      case 'bottom':
        x1 -= size
        y1 += size
        x2 += size
        y2 += size
        break
      case 'left':
        x1 -= size
        y1 -= size
        x2 -= size
        y2 += size
        break
    }
    p.moveTo(x1, y1)
    p.lineTo(...ep)
    p.lineTo(x2, y2)
  }
  private draw(p: Path, linkNode: any) {
    const { source, target, outDir, inDir } = linkNode
    // 1. get point coordinates at extend line
    const startPoint = this.getBoundPoint(source, outDir, false)
    const endPoint = this.getBoundPoint(target, inDir, false)
    const startExtendPoint = this.getBoundPoint(source, outDir, true)
    const endExtendPoint = this.getBoundPoint(target, inDir, true)
    // 2. compute target node direction: lt/rt/lb/rb. TODO: t/b/l/r
    const arrowDir = this.getDirection(startExtendPoint, endExtendPoint)
    // 3. define line path to match od-id-direction and run
    const typeSign = this.getArrowTypeSign(outDir, inDir, arrowDir)

    const [x1, y1] = startPoint
    const [x2, y2] = endPoint
    const [sx, sy] = startExtendPoint
    const [tx, ty] = endExtendPoint
    p.moveTo(x1, y1)
    p.lineTo(sx, sy)
    const drawPattern = map[typeSign]
    switch (drawPattern) {
      case 'xy':
        p.lineTo(tx, sy)
        p.lineTo(tx, ty)
        break
      case 'yx':
        p.lineTo(sx, ty)
        p.lineTo(tx, ty)
        break
      case 'yxy':
        p.lineTo(sx, sy + (ty - sy) / 2)
        p.lineTo(tx, sy + (ty - sy) / 2)
        p.lineTo(tx, ty)
        break
      case 'xyx':
        p.lineTo(sx + (tx - sx) / 2, sy)
        p.lineTo(sx + (tx - sx) / 2, ty)
        p.lineTo(tx, ty)
    }
    p.lineTo(x2, y2)
    this.drawArrow(p, endPoint, inDir)
  }
  public addNode(
    name: string,
    x: number,
    y: number,
    text: string | string[],
    options: any = {}
  ): this {
    const { padding = [10, 20], textSize = 14, lineHeight = 18 } = options
    const MIN_HEIGHT = 50
    const MIN_WIDTH = 60
    let lines = 0,
      maxTextLength = 0,
      textSpl
    if (typeof text === 'string') {
      textSpl = text.split('\n')
      lines = textSpl.length
      maxTextLength = Math.max(...textSpl.map(str => this.getTextLength(str)))
    } else {
      textSpl = text
      lines = text.length
      maxTextLength = Math.max(...text.map(str => this.getTextLength(str)))
    }
    const width = Math.max(
      (textSize / 2) * maxTextLength + padding[1] * 2,
      MIN_WIDTH
    )
    const height = Math.max(lines * lineHeight + padding[0] * 2, MIN_HEIGHT)
    this.nodes.push({
      name,
      center: [x, y],
      width,
      height,
      text: textSpl,
      style: {
        textSize: textSize + 'px',
        lineHeight: lineHeight + 'px'
      }
    })
    return this
  }
  public addEdge(source: string, target: string, direction = 'right-left') {
    const [outDir, inDir] = direction.split('-')
    const from: EdgeOption = {
      name: source,
      direction: outDir as EdgeDirection
    }
    const to = {
      name: target,
      direction: inDir as EdgeDirection
    }
    this.edges.push({
      source: from,
      target: to
    })
    return this
  }
  public render() {
    const nodeMap: LinkNode = Array.from(this.nodes).reduce(
      (map, node) =>
        Object.assign(map, { [node.name]: { ...node, linkNodes: [] } }),
      {} as LinkNode
    )
    this.edges.forEach(edge => {
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
    const g = this._svg
      .selectAll('g')
      .data(Object.values(nodeMap))
      .enter()
      .append('g')
    g.append('rect')
      .attr('class', 'node-rect')
      .attr('x', (d: Node) => d.center[0] - d.width / 2)
      .attr('y', (d: Node) => d.center[1] - d.height / 2)
      .attr('width', (d: Node) => d.width)
      .attr('height', (d: Node) => d.height)
      .attr('stroke', this.LINE_COLOR)
      .attr('fill', 'transparent')
      .attr('stroke-width', '2')
      .attr('rx', '4')
      .attr('ry', '4')
    g.append('text')
      .attr('x', (d: Node) => d.center[0])
      .attr('y', (d: Node) => d.center[1])
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text((d: Node) => d.text || '')
    g.append('path')
      .attr('stroke', this.LINE_COLOR)
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
          linkNodes.forEach(n => this.draw(p, n))
        )
        return p.toString()
      })
  }
}

export default FlowChart
