interface FlowChartInitialOptions {
    width?: number;
    height?: number;
    lineColor?: string;
    fontSize?: number;
    lineHeight?: number;
}
interface FlowChartNodeOptions {
    padding?: [number, number];
    textSize?: number;
    borderColor?: string;
    backgroundColor?: string;
}
interface FlowChartEdgeOptions {
    direction?: string;
    color?: string;
}
declare class FlowChart {
    private _svg;
    private nodes;
    private edges;
    private options;
    constructor(selector: string, options?: FlowChartInitialOptions);
    private drawLinkLine;
    addNode(name: string, x: number, y: number, text: string | string[], options?: FlowChartNodeOptions): this;
    addEdge(source: string, target: string, options?: FlowChartEdgeOptions): this;
    render(): void;
}
export default FlowChart;
