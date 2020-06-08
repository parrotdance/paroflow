export interface Node {
  name: string
  center: [number, number],
  width: number,
  height: number,
  text: string
}
export type NodeName = string
type EdgeDirection = 'top' | 'right' | 'bottom' | 'left'
export interface EdgeOption {
  name: NodeName
  direction: EdgeDirection
}
export interface Edge {
  source: NodeName | EdgeOption
  target: NodeName | EdgeOption
}

export default {
  nodes: [
    {
      name: 'a',
      center: [50, 120],
      width: 80,
      height: 60,
      text: 'a'
    },
    {
      name: 'b',
      center: [150, 120],
      width: 80,
      height: 60,
      text: 'b'
    },
    {
      name: 'c',
      center: [290, 50],
      width: 80,
      height: 60,
      text: 'c'
    },
    {
      name: 'd',
      center: [270, 190],
      width: 80,
      height: 60,
      text: 'd'
    },
    {
      name: 'e',
      center: [410, 30],
      width: 80,
      height: 60,
      text: 'e'
    },
    {
      name: 'f',
      center: [540, 50],
      width: 80,
      height: 60,
      text: 'f'
    }
  ],
  edges: [
    {
      source: 'a',
      target: 'b'
    },
    {
      source: 'b',
      target: 'c'
    },
    {
      source: 'b',
      target: 'd'
    },
    {
      source: 'c',
      target: 'e'
    },
    {
      source: 'e',
      target: 'f'
    }
  ]
} as {
  nodes: Node[]
  edges: Edge[]
}