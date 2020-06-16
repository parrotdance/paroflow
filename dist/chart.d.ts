declare type LinkPattern = 'xy' | 'yx' | 'xyx' | 'yxy'
interface FlowChartInitialOptions {
  width?: number
  height?: number
  fontSize?: number
  fontColor?: string
  lineHeight?: number
  edgeColor?: string
  edgeWidth?: number
  nodeBackgroundColor?: string
  nodeBorderColor?: string
  nodeMinWidth?: number
  nodeMinHeight?: number
  extendLength?: number
}
interface FlowChartNodeOptions {
  padding?: [number, number]
  fontSize?: number
  fontColor?: string
  borderColor?: string
  backgroundColor?: string
  minWidth?: number
  minHeight?: number
  extendLength?: number
}
interface FlowChartEdgeOptions {
  direction?: string
  color?: string
  width?: number
  pattern?: LinkPattern
}
declare class FlowChart {
  private _svg
  private nodes
  private edges
  private options
  constructor(selector: string, options?: FlowChartInitialOptions)
  private getBoundPoint
  private drawLinkLine
  addNode(
    name: string,
    x: number,
    y: number,
    text: string | string[],
    options?: FlowChartNodeOptions
  ): this
  addEdge(source: string, target: string, options?: FlowChartEdgeOptions): this
  render(): void
}
export default FlowChart
