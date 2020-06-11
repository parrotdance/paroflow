import { Path } from 'd3-path'
import { Node, EdgeOption, EdgeDirection } from './chartConfig'

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
const getDirection = (a: Coordinate, b: Coordinate) => {
  const [ax, ay] = a
  const [bx, by] = b
  const ver = bx - ax >= 0 ? 2 : 0
  const hor = by - ay >= 0 ? 2 : 0
  return DIR_MATRIX[hor][ver]
}
/**
 * typeSign:
 * 15-12 bit: outDirection   |t|r|b|l|
 * 11-8  bit: inDirection    |t|r|b|l|
 * 7-0   bit: arrowDirection |t|rt|r|rb|b|lb|l|lt|
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
const drawArrow = (p: Path, ep: Coordinate, inDir: EdgeDirection, size = 6) => {
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
export default function draw(p: Path, linkNode: any) {
  const { source, target, outDir, inDir } = linkNode
  // 1. get point coordinates at extend line
  const startPoint = getBoundPoint(source, outDir, false)
  const endPoint = getBoundPoint(target, inDir, false)
  const startExtendPoint = getBoundPoint(source, outDir, true)
  const endExtendPoint = getBoundPoint(target, inDir, true)
  // 2. compute target node direction: lt/rt/lb/rb. TODO: t/b/l/r
  const arrowDir = getDirection(startExtendPoint, endExtendPoint)
  // 3. define line path to match od-id-direction and run
  const typeSign = getArrowTypeSign(outDir, inDir, arrowDir)

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
  drawArrow(p, endPoint, inDir)
}
