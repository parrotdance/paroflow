import { event, select } from 'd3-selection'
import { drag } from 'd3-drag'
import { path } from 'd3-path'
const getTextLength = text => {
  let len = 0
  let i = 0
  while (i < text.length) {
    if (text.charCodeAt(i) > 127 || text.charCodeAt(i) === 94) {
      len += 2
    } else {
      len++
    }
    i++
  }
  return len
}
class Node {
  constructor(nodeArg) {
    this.center = [0, 0]
    this.text = ['']
    this.coordinateXY = {}
    this.style = {}
    this.links = []
    this.targetLinks = []
    this.name = nodeArg.name
    this.center = nodeArg.center
    this.width = nodeArg.width || 0
    this.height = nodeArg.height || 0
    this.text = nodeArg.text || ['']
    this.extendLength = nodeArg.extendLength || 0
    this.coordinateXY.top = this.getBoundPoint(this, 'top', false)
    this.coordinateXY.left = this.getBoundPoint(this, 'left', false)
    this.coordinateXY.bottom = this.getBoundPoint(this, 'bottom', false)
    this.coordinateXY.right = this.getBoundPoint(this, 'right', false)
    this.coordinateXY.extop = this.getBoundPoint(this, 'top', true)
    this.coordinateXY.exleft = this.getBoundPoint(this, 'left', true)
    this.coordinateXY.exbottom = this.getBoundPoint(this, 'bottom', true)
    this.coordinateXY.exright = this.getBoundPoint(this, 'right', true)
    this.style = nodeArg.style || {}
  }
  getBoundPoint(node, dir, extend) {
    const {
      center: [x, y],
      width,
      height,
      extendLength
    } = node
    let dx = 0,
      dy = 0
    const finalExtendLength = extend ? extendLength || this.extendLength : 0
    if (dir === 'top') {
      dy = -0.5 * height - finalExtendLength
    } else if (dir === 'right') {
      dx = 0.5 * width + finalExtendLength
    } else if (dir === 'bottom') {
      dy = 0.5 * height + finalExtendLength
    } else {
      dx = -0.5 * width - finalExtendLength
    }
    return [x + dx, y + dy]
  }
  drawNode(_svg, boxId) {
    this.nodeId = boxId
    this.svgEl = _svg
    this.svgNode = _svg
      .append('g')
      .attr('class', 'paro-node' + boxId)
      .attr('nodeId', boxId)
    const { width, height } = this
    const [cx, cy] = this.center
    const { borderColor, backgroundColor, borderRadius } = this.style
    // render rect
    this.svgNode
      .append('rect')
      .attr('rectId', boxId)
      .attr('class', 'paro-node-rect')
      .attr('x', cx - width / 2)
      .attr('y', cy - height / 2)
      .attr('width', width)
      .attr('height', height)
      .attr('stroke', borderColor)
      .attr('fill', backgroundColor)
      .attr('stroke-width', '2')
      .attr('rx', borderRadius)
      .attr('ry', borderRadius)
    // render text
    this.drawTexts()
  }
  drawTexts() {
    const { fontColor, lineHeight, fontSize } = this.style
    this.svgNode.selectAll('text').remove()
    const t = this.svgNode
      .append('text')
      .attr('textId', this.nodeId)
      .attr('class', 'paro-node-text' + this.nodeId)
      .attr('text-anchor', 'middle')
      .attr('font-size', fontSize)
      .attr('fill', fontColor)
    let textPosYOffset = 0
    const textLines = this.text.length
    if (textLines === 1) {
      textPosYOffset = 0
    } else if (textLines % 2 !== 0) {
      textPosYOffset = ((1 - textLines) / 2) * lineHeight
    } else {
      textPosYOffset = (0.5 - textLines / 2) * lineHeight
    }
    const STATIC_OFFSET = 5 // I don't know why
    this.text.forEach((str, i) => {
      const y = this.center[1] + textPosYOffset + i * lineHeight + STATIC_OFFSET
      t.append('tspan')
        .attr('class', 'paro-node-tspan' + this.nodeId)
        .attr('x', this.center[0])
        .attr('y', y)
        .text(str)
    })
  }
  drawLinks() {
    this.links.forEach(link => {
      link.drawLinkLine(this.nodeId, this.svgEl)
    })
  }
  drawTargetLinks() {
    this.targetLinks.forEach(link => {
      link.drawLinkLine()
    })
  }
  changeXY(resetXY) {
    const [x1, y1] = resetXY
    this.center = [x1 + this.width / 2, y1 + this.height / 2]
    this.coordinateXY.top = this.getBoundPoint(this, 'top', false)
    this.coordinateXY.left = this.getBoundPoint(this, 'left', false)
    this.coordinateXY.bottom = this.getBoundPoint(this, 'bottom', false)
    this.coordinateXY.right = this.getBoundPoint(this, 'right', false)
    this.coordinateXY.extop = this.getBoundPoint(this, 'top', true)
    this.coordinateXY.exleft = this.getBoundPoint(this, 'left', true)
    this.coordinateXY.exbottom = this.getBoundPoint(this, 'bottom', true)
    this.coordinateXY.exright = this.getBoundPoint(this, 'right', true)
    this.links.forEach(link => {
      link.changeLink()
    })
    this.targetLinks.forEach(link => {
      link.changeLink()
    })
  }
}
class DirectionPoint {
  constructor(option) {
    this.point = [0, 0]
    this.otherPoint = [0, 0]
    this.posTrunXY = option.posTrunXY
    this.negTrunXY = option.negTrunXY
    this.point = option.point
    this.otherPoint = option.otherPoint
    this.direction = option.direction
  }
}
class Link {
  constructor(linkArg) {
    this.sourceXY = [0, 0]
    this.sourceOriginXY = [0, 0]
    this.targetXY = [0, 0]
    this.targetOriginXY = [0, 0]
    this.centerPoint = [0, 0]
    this.outDir = 'right'
    this.inDir = 'left'
    this.style = {}
    this.sourceNode = linkArg.sourceNode
    this.targetNode = linkArg.targetNode
    this.sourceXY = linkArg.sourceXY
    this.sourceOriginXY = linkArg.sourceOriginXY
    this.targetXY = linkArg.targetXY
    this.targetOriginXY = linkArg.targetOriginXY
    this.centerPoint = this.getCentrePoint(this.sourceXY, this.targetXY)
    this.InflectionPoint = linkArg.InflectionPoint
    this.outDir = linkArg.outDir
    this.inDir = linkArg.inDir
    this.style = linkArg.style
  }
  // Is the line formed by two points parallel to the coordinate axis
  isParallelAxis(a, b) {
    const [x1, y1] = a
    const [x2, y2] = b
    return x1 === x2 || y1 === y2
  }
  isSamePoint(p1, p2) {
    return p1.toString() === p2.toString()
  }
  getCentrePoint(a, b) {
    const [x1, y1] = a
    const [x2, y2] = b
    return [(x1 + x2) / 2, (y1 + y2) / 2]
  }
  getDirectionPoint(mainPoint, point, edgeDirection) {
    const [x1, y1] = mainPoint
    const [x2, y2] = point
    let pointDirection = 'positive'
    let pointXY = [0, 0]
    let otherPointXY = [0, 0]
    let posTrunXY = ''
    let negTrunXY = ''
    switch (edgeDirection) {
      case 'top':
        if (y1 - y2 > 0) {
          pointDirection = 'positive'
          posTrunXY = 'y'
        } else {
          pointDirection = 'negative'
          negTrunXY = 'x'
        }
        pointXY = [x1, y2]
        otherPointXY = [x2, y1]
        break
      case 'bottom':
        if (y1 - y2 > 0) {
          pointDirection = 'negative'
          negTrunXY = 'x'
        } else {
          pointDirection = 'positive'
          posTrunXY = 'y'
        }
        pointXY = [x1, y2]
        otherPointXY = [x2, y1]
        break
      case 'left':
        if (x1 - x2 > 0) {
          pointDirection = 'positive'
          posTrunXY = 'x'
        } else {
          pointDirection = 'negative'
          negTrunXY = 'y'
        }
        pointXY = [x2, y1]
        otherPointXY = [x1, y2]
        break
      case 'right':
        if (x1 - x2 > 0) {
          pointDirection = 'negative'
          negTrunXY = 'y'
        } else {
          pointDirection = 'positive'
          posTrunXY = 'x'
        }
        pointXY = [x2, y1]
        otherPointXY = [x1, y2]
        break
    }
    return new DirectionPoint({
      posTrunXY,
      negTrunXY,
      point: pointXY,
      otherPoint: otherPointXY,
      direction: pointDirection
    })
  }
  drawNeatLine(sourceDirPoint, targetDirPoint) {
    const [x1, y1] = this.sourceXY
    const [x2, y2] = this.targetXY
    let neatPoint = []
    if (
      sourceDirPoint.direction !== targetDirPoint.direction &&
      this.isSamePoint(sourceDirPoint.point, targetDirPoint.point)
    ) {
      neatPoint = sourceDirPoint.otherPoint
    } else {
      if (targetDirPoint.direction === 'positive') {
        neatPoint = targetDirPoint.point
      } else if (sourceDirPoint.direction === 'positive') {
        neatPoint = sourceDirPoint.point
      } else {
        neatPoint = sourceDirPoint.otherPoint
      }
    }
    const [xn, yn] = neatPoint
    this.p.moveTo(x1, y1)
    this.p.lineTo(xn, yn)
    this.p.lineTo(x2, y2)
  }
  drawNeatLineType2(sourceDirPoint, targetDirPoint) {
    const [x1, y1] = this.sourceXY
    const [x2, y2] = this.targetXY
    let neatPoint = []
    if (sourceDirPoint.direction === 'positive') {
      neatPoint = sourceDirPoint.point
    } else if (targetDirPoint.direction === 'positive') {
      neatPoint = targetDirPoint.point
    } else {
      neatPoint = sourceDirPoint.otherPoint
    }
    const [xn, yn] = neatPoint
    this.p.moveTo(x1, y1)
    this.p.lineTo(xn, yn)
    this.p.lineTo(x2, y2)
  }
  drawTurnLine(sourceDirPoint, targetDirPoint, turnPoint) {
    const [xt, yt] = turnPoint
    const [x1, y1] = this.sourceXY
    const [x2, y2] = this.targetXY
    let startMoveXY = ''
    if (
      sourceDirPoint.direction === 'negative' &&
      sourceDirPoint.direction === targetDirPoint.direction
    ) {
      startMoveXY = sourceDirPoint.negTrunXY
    } else {
      if (sourceDirPoint.direction === 'positive') {
        startMoveXY = sourceDirPoint.posTrunXY
      } else if (targetDirPoint.direction === 'positive') {
        startMoveXY = targetDirPoint.posTrunXY
      }
    }
    if (!startMoveXY) {
      throw new Error('not startMoveXY')
    }
    this.p.moveTo(x1, y1)
    switch (startMoveXY) {
      case 'x':
        this.p.lineTo(xt, y1)
        this.p.lineTo(xt, y2)
        break
      case 'y':
        this.p.lineTo(x1, yt)
        this.p.lineTo(x2, yt)
        break
    }
    this.p.lineTo(x2, y2)
  }
  drawLinkLine(nodeId, _svg) {
    this.p = path()
    if (!this.svgEl) {
      this.svgEl = _svg
    }
    if (!this.lineId) {
      this.lineId = nodeId
    }
    if (this.pathEl) {
      this.pathEl.remove()
    }
    this.pathEl = this.svgEl.append('path').attr('lineId', this.lineId)
    const { color, width } = this.style
    this.pathEl
      .attr('class', 'paro-edge' + nodeId)
      .attr('stroke', color)
      .attr('fill', 'transparent')
      .attr('stroke-width', width)
    if (this.isParallelAxis(this.sourceXY, this.targetXY)) {
      this.p.moveTo(...this.sourceXY)
      this.p.lineTo(...this.targetXY)
    } else {
      const sourceDirPoint = this.getDirectionPoint(
        this.sourceXY,
        this.targetXY,
        this.outDir
      )
      const targetDirPoint = this.getDirectionPoint(
        this.targetXY,
        this.sourceXY,
        this.inDir
      )
      //连线规则1
      // 一正点一反点----------------------------
      // if (sourceDirPoint.direction !== targetDirPoint.direction) {
      //   // 一正一反是同一点(拐弯连接)
      //   if (this.isSamePoint(sourceDirPoint.point, targetDirPoint.point)) {
      //     this.drawTurnLine(
      //       sourceDirPoint,
      //       targetDirPoint,
      //       this.InflectionPoint ? this.InflectionPoint : this.centerPoint
      //     )
      //   } else {
      //     // 一正一反是不同点(整齐连接)
      //     this.drawNeatLine(sourceDirPoint, targetDirPoint)
      //   }
      // } else {
      //   //两个有相同方位（正 | 反）点----------------------------
      //   // 同一点(整齐连接)
      //   if (this.isSamePoint(sourceDirPoint.point, targetDirPoint.point)) {
      //     this.drawNeatLine(sourceDirPoint, targetDirPoint)
      //   } else {
      //     // 不同点(拐弯连接)
      //     this.drawTurnLine(
      //       sourceDirPoint,
      //       targetDirPoint,
      //       this.InflectionPoint ? this.InflectionPoint : this.centerPoint
      //     )
      //   }
      // }
      //连线规则1 end
      // 连线规则2
      if (
        sourceDirPoint.direction === targetDirPoint.direction &&
        sourceDirPoint.direction === 'negative'
      ) {
        this.drawTurnLine(
          sourceDirPoint,
          targetDirPoint,
          this.InflectionPoint ? this.InflectionPoint : this.centerPoint
        )
      } else {
        this.drawNeatLine(sourceDirPoint, targetDirPoint)
      }
      // 连线规则2 end
    }
    this.drawExtendLinkArrow(this.p)
    this.pathEl.attr('d', this.p.toString())
  }
  drawExtendLinkArrow(p) {
    // draw extendLine
    p.moveTo(...this.sourceXY)
    p.lineTo(...this.sourceOriginXY)
    p.moveTo(...this.targetXY)
    p.lineTo(...this.targetOriginXY)
    // draw arrow
    const endPoint = this.targetOriginXY
    let [x1, y1] = endPoint
    let [x2, y2] = endPoint
    const se = 5 // short edge
    const le = 7 // long edge
    switch (this.inDir) {
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
  changeLink() {
    this.sourceXY = this.sourceNode.coordinateXY['ex' + this.outDir]
    this.sourceOriginXY = this.sourceNode.coordinateXY[this.outDir]
    this.targetXY = this.targetNode.coordinateXY['ex' + this.inDir]
    this.targetOriginXY = this.targetNode.coordinateXY[this.inDir]
    this.centerPoint = this.getCentrePoint(this.sourceXY, this.targetXY)
  }
}
class FlowChart {
  constructor(selector, options = {}) {
    this.nodes = []
    this.links = []
    this.options = {
      width: 800,
      height: 600,
      fontSize: 14,
      fontColor: '#000000',
      lineHeight: 24,
      edgeColor: '#47b785',
      edgeWidth: 1.5,
      nodeBorderColor: '#47b785',
      nodeBackgroundColor: 'transparent',
      nodeMinWidth: 60,
      nodeMinHeight: 50,
      extendLength: 12
    }
    let k
    for (k in options) {
      if (this.options[k]) {
        this.options[k] = options[k]
      }
    }
    const { width, height } = this.options
    this._svg = select(selector)
    this._svg.attr('width', width)
    this._svg.attr('height', height)
  }
  addNode(name, x, y, text, options = {}) {
    const {
      padding = [10, 20],
      fontSize = this.options.fontSize,
      borderColor = this.options.nodeBorderColor,
      fontColor = this.options.fontColor,
      backgroundColor = this.options.nodeBackgroundColor,
      minWidth = this.options.nodeMinWidth,
      minHeight = this.options.nodeMinHeight,
      extendLength = this.options.extendLength,
      borderRadius = this.options.borderRadius || 8
    } = options
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
      (fontSize / 2) * maxTextLength + padding[1] * 2,
      minWidth
    )
    const height = Math.max(
      lines * this.options.lineHeight + padding[0] * 2,
      minHeight
    )
    this.nodes.push(
      new Node({
        name,
        center: [x, y],
        width,
        height,
        text: textSpl,
        style: {
          padding,
          fontSize,
          fontColor,
          borderColor,
          backgroundColor,
          lineHeight: this.options.lineHeight,
          borderRadius
        },
        extendLength
      })
    )
    return this
  }
  addEdge(source, target, options = {}) {
    const {
      direction,
      color = this.options.edgeColor,
      width = this.options.edgeWidth
    } = options
    const defaultDir = 'right-left'
    if (direction && !direction.includes('-')) {
      console.warn(
        `invalid direction: ${direction}, use default direction instead.`
      )
    }
    const sourceExist = this.nodes.find(node => node.name === source)
    const targetExist = this.nodes.find(node => node.name === target)
    if (!sourceExist) {
      console.error(
        `[P-Flow warn]: Can't find source node: ${source}.\n\nPlease check if add node correctly before or add it before call render().`
      )
      return this
    }
    if (!targetExist) {
      console.error(
        `[P-Flow warn]: Can't find target node: ${target}.\n\nPlease check if add node correctly before or add it before call render().`
      )
      return this
    }
    const [outDir, inDir] = direction
      ? direction.split('-')
      : defaultDir.split('-')
    const link = new Link({
      sourceNode: sourceExist,
      targetNode: targetExist,
      outDir: outDir,
      inDir: inDir,
      sourceXY: sourceExist.coordinateXY['ex' + outDir],
      sourceOriginXY: sourceExist.coordinateXY[outDir],
      targetXY: targetExist.coordinateXY['ex' + inDir],
      targetOriginXY: targetExist.coordinateXY[inDir],
      style: {
        color,
        width
      }
    })
    this.links.push(link)
    sourceExist.links.push(link)
    targetExist.targetLinks.push(link)
    return this
  }
  render() {
    this._svg.html('') // clear svg content for rerender
    this.nodes.forEach((d, ind) => {
      const nodeAndLinksSVG = this._svg
        .append('g')
        .attr('class', 'paro-box' + ind)
        .attr('boxId', ind)
      d.drawNode(nodeAndLinksSVG, ind)
      d.drawLinks()
    })
  }
  drag() {
    //rect间隔差值 防止拖动原点发生变化
    let xd
    let yd
    const _nodes = this.nodes
    const currentSvg = this._svg
    const dragEvent = drag()
      .on('drag', function() {
        const id = select(this).attr('rectId')
        //拖动过程中补充差值
        select(this)
          .attr('x', event.x - xd)
          .attr('y', event.y - yd)
        //重绘此id下的line(需要先改变Node的xy等属性)
        _nodes.forEach(d => {
          if (d.nodeId !== undefined && d.nodeId.toString() === id) {
            d.changeXY([event.x - xd, event.y - yd])
            d.drawTexts()
            d.drawLinks()
            d.drawTargetLinks()
          }
        })
      })
      .on('start', function() {
        // 设置rect的间隔差值
        xd = event.x - parseFloat(select(this).attr('x'))
        yd = event.y - parseFloat(select(this).attr('y'))
      })
    currentSvg.selectAll('.paro-node-rect').call(dragEvent)
  }
}
export default FlowChart
