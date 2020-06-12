import { select } from 'd3-selection'
import { path } from 'd3-path'

interface FlowChartInitialOptions {
  width?: number
  height?: number
  lineColor?: string
  fontSize?: number
  lineHeight?: number
}
interface FlowChartNodeOptions {
  padding?: [number, number]
  textSize?: number
  borderColor?: string
  backgroundColor?: string
}
interface FlowChartEdgeOptions {
  direction?: string
  color?: string
}
interface Node {
  name: string
  center: [number, number]
  width: number
  height: number
  text: string[]
  style: Dictionary
  links: Link[]
}
type EdgeDirection = 'top' | 'right' | 'bottom' | 'left'
interface EdgeOption {
  name: string
  direction: EdgeDirection
}
interface Edge {
  source: EdgeOption
  target: EdgeOption
  style: Dictionary
}
interface Dictionary<T = any> {
  [index: string]: T
}

interface Link extends Dictionary {
  source: Node
  target: Node
  outDir: EdgeDirection
  inDir: EdgeDirection
  style: Dictionary
}
type Coordinate = [number, number]
type GroupedLinks = { [index: string]: Link[] }

// Define od-id-direction pattern
const LINE_RENDER_PATTERN_MAP: any = {
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
 *   by - ay >= 0 ? bottom : top
 *   bx - ax >= 0 ? right : left
 */
const DIR_MATRIX = [
  ['lt', 't', 'rt'],
  ['l', '', 'r'],
  ['lb', 'b', 'rb']
]
const getDirection = (a: Coordinate, b: Coordinate) => {
  const [ax, ay] = a
  const [bx, by] = b
  const ver = bx - ax >= 0 ? 2 : 0
  const hor = by - ay >= 0 ? 2 : 0
  return DIR_MATRIX[hor][ver]
}
const getBoundPoint = (
  node: Node,
  dir: EdgeDirection,
  extend: boolean,
  length = 12
) => {
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
const getTextLength = (text: string) => {
  let len = 0
  let i = 0
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
/**
 * Return a string of binary of u16 value.
 * to represent relationship of outdir-indir-relative_dir
 *
 * example:
 *   input: (right, left, rt)
 *   output:
 *  "0 1 0 0   0 0 0 1   0 1  0 0  0 0  0 0"
 * -------------------------------------------
 * | t r b l | t r b l | t rt r rb b lb l lt |
 * | - - - - | - - - - | - -  - -  - -  - -  |
 * |  outdir |  indir  |    relative_dir     |
 * -------------------------------------------
 */
const getArrowTypeSign = (
  outDir: EdgeDirection,
  inDir: EdgeDirection,
  dir: string
) => {
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
class FlowChart {
  private _svg?: any
  private nodes: Node[] = []
  private edges: Edge[] = []
  private options: any = {
    width: 800,
    height: 600,
    lineColor: '#47b785',
    fontSize: 14,
    lineHeight: 24
  }

  constructor(el: string, options: FlowChartInitialOptions = {}) {
    Object.entries(options).forEach(([k, v]) => {
      if (this.options[k]) {
        this.options[k] = v
      }
    })
    const { width, height } = this.options
    this._svg = select(el)
    this._svg.attr('width', width)
    this._svg.attr('height', height)
  }
  private drawLinkLine(group: any, link: any) {
    const p = path()
    const pathEl = group.append('path')
    const { style } = link
    pathEl.attr('stroke', style.color).attr('fill', 'transparent')
    const { source, target, outDir, inDir } = link
    // 1. get point coordinates at extend line
    const startPoint = getBoundPoint(source, outDir, false)
    const endPoint = getBoundPoint(target, inDir, false)
    const startExtendPoint = getBoundPoint(source, outDir, true)
    const endExtendPoint = getBoundPoint(target, inDir, true)
    // 2. compute target node direction: lt/rt/lb/rb. TODO: t/b/l/r
    const arrowDir = getDirection(startExtendPoint, endExtendPoint)
    // 3. define line path to match od-id-direction pattern and run
    const typeSign = getArrowTypeSign(outDir, inDir, arrowDir)

    const [x1, y1] = startPoint
    const [x2, y2] = endPoint
    const [sx, sy] = startExtendPoint
    const [tx, ty] = endExtendPoint
    p.moveTo(x1, y1)
    p.lineTo(sx, sy)
    const drawPattern = LINE_RENDER_PATTERN_MAP[typeSign]
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
    // draw arrow
    {
      let [x1, y1] = endPoint
      let [x2, y2] = endPoint
      const se = 5 // short edge
      const le = 7 // long edge
      switch (inDir) {
        case 'top':
          x1 -= se
          y1 -= le
          x2 += se
          y2 -= le
          break
        case 'right':
          x1 += le
          y1 -= se
          x2 += le
          y2 += se
          break
        case 'bottom':
          x1 -= se
          y1 += le
          x2 += se
          y2 += le
          break
        case 'left':
          x1 -= le
          y1 -= se
          x2 -= le
          y2 += se
          break
      }
      p.moveTo(x1, y1)
      p.lineTo(...endPoint)
      p.lineTo(x2, y2)
    }
    pathEl.attr('d', p.toString())
  }
  public addNode(
    name: string,
    x: number,
    y: number,
    text: string | string[],
    options: FlowChartNodeOptions = {}
  ): this {
    const {
      padding = [10, 20],
      textSize = this.options.fontSize,
      borderColor = this.options.lineColor,
      backgroundColor = 'transparent'
    } = options
    const MIN_HEIGHT = 50
    const MIN_WIDTH = 60
    let lines = 0
    let maxTextLength = 0
    let textSpl = null
    if (typeof text === 'string') {
      textSpl = text.split('\n')
      lines = textSpl.length
      maxTextLength = Math.max(...textSpl.map(str => getTextLength(str)))
    } else {
      textSpl = text
      lines = text.length
      maxTextLength = Math.max(...text.map(str => getTextLength(str)))
    }
    const width = Math.max(
      (textSize / 2) * maxTextLength + padding[1] * 2,
      MIN_WIDTH
    )
    const height = Math.max(
      lines * this.options.lineHeight + padding[0] * 2,
      MIN_HEIGHT
    )
    this.nodes.push({
      name,
      center: [x, y],
      width,
      height,
      text: textSpl,
      style: {
        padding,
        textSize,
        borderColor,
        backgroundColor
      },
      links: []
    })
    return this
  }
  public addEdge(
    source: string,
    target: string,
    options: FlowChartEdgeOptions = {}
  ) {
    const { direction, color = this.options.lineColor } = options
    const defaultDir = 'right-left'
    let outDir = ''
    let inDir = ''
    if (direction && !direction.includes('-')) {
      console.error(
        `invalid direction: ${direction}, use default direction instead.`
      )
    }
    ;[outDir, inDir] = direction ? direction.split('-') : defaultDir.split('-')
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
      target: to,
      style: {
        color
      }
    })
    return this
  }
  public render() {
    const nodeMap: Dictionary<Node> = this.nodes.reduce(
      (map, node) => Object.assign(map, { [node.name]: node }),
      {} as Dictionary<Node>
    )
    this.edges.forEach(edge => {
      const { source, target, style } = edge
      const sourceNode = nodeMap[source.name]
      const targetNode = nodeMap[target.name]
      if (sourceNode === undefined) {
        throw new Error(
          `Can not find Edge source node: ${(sourceNode as Node).name}.`
        )
      }
      if (targetNode === undefined) {
        throw new Error(
          `Can not find Edge source node: ${(targetNode as Node).name}.`
        )
      }
      sourceNode.links.push({
        target: targetNode,
        outDir: source.direction,
        inDir: target.direction,
        source: sourceNode,
        style
      })
    })
    Object.values(nodeMap).forEach(d => {
      const g = this._svg.append('g')
      const { style } = d
      // render rect
      g.append('rect')
        .attr('class', 'node-rect')
        .attr('x', d.center[0] - d.width / 2)
        .attr('y', d.center[1] - d.height / 2)
        .attr('width', d.width)
        .attr('height', d.height)
        .attr('stroke', style.borderColor)
        .attr('fill', style.backgroundColor)
        .attr('stroke-width', '2')
        .attr('rx', '4')
        .attr('ry', '4')
      // render text
      const t = g
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('font-size', 14)
      let textPosYOffset = 0
      const textLines = d.text.length
      if (textLines === 1) {
        textPosYOffset = 0
      } else if (textLines % 2 !== 0) {
        textPosYOffset = ((1 - textLines) / 2) * this.options.lineHeight
      } else {
        textPosYOffset = (0.5 - textLines / 2) * this.options.lineHeight
      }
      const STATIC_OFFSET = 5 // I don't know why
      d.text.forEach((str: string, i: number) => {
        const y =
          d.center[1] +
          textPosYOffset +
          i * this.options.lineHeight +
          STATIC_OFFSET
        t.append('tspan')
          .attr('x', d.center[0])
          .attr('y', y)
          .text(str)
      })
      // render link line
      const groupedLinks: GroupedLinks = d.links.reduce(
        (res: GroupedLinks, link: Link) => {
          if (res[link.outDir]) {
            res[link.outDir].push(link)
          } else {
            res[link.outDir] = [link]
          }
          return res
        },
        {} as GroupedLinks
      )
      Object.values(groupedLinks).forEach((links: Link[]) => {
        links.forEach(n => this.drawLinkLine(g, n))
      })
    })
  }
}

export default FlowChart
