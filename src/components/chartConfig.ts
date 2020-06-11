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

class FlowChart {
  public nodes: Node[] = []
  public edges: Edge[] = []
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
}
const flowChart = new FlowChart()
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

export default flowChart
