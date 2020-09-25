declare type LinkType = 'sourceBeam' | 'targetBeam' | 'normal'
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
  linkType?: LinkType
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
  borderRadius?: number
}
interface FlowChartEdgeOptions {
  direction?: string
  color?: string
  width?: number
  linkType?: LinkType
}
declare class FlowChart {
  private _svg
  private nodes
  private links
  linkType: LinkType
  private options
  constructor(selector: string, options?: FlowChartInitialOptions)
  addNode(
    name: string,
    x: number,
    y: number,
    text: string | string[],
    options?: FlowChartNodeOptions
  ): this
  addEdge(source: string, target: string, options?: FlowChartEdgeOptions): this
  render(): void
  drag(): void
}
export default FlowChart
