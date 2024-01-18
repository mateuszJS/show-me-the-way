import Path from "Creator/components/Path/Path"
import { MAP_BACKGROUND_SCALE, transformMatrix } from "Creator/run"
import mat4 from "utils/mat4"

export default class State {
  public needRefresh: boolean
  public path: Path
  public view: "creator" | "preview"
  public creatorMapOffset: Point
  public zoom: number

  constructor() {
    this.needRefresh = false
    this.path = new Path()
    this.view = "creator"
    this.zoom = 1
    this.creatorMapOffset = {
      x: 0,
      y: 0
    }
  }

  private convertPoint(point: Point): Point {
    const inversMatrix = mat4.inverse(transformMatrix)
    
    return {
      x: inversMatrix[0] * point.x + inversMatrix[4] * point.y + inversMatrix[8] * 0 +  + inversMatrix[12] * 1,
      y: inversMatrix[1] * point.x + inversMatrix[5] * point.y + inversMatrix[9] * 0 +  + inversMatrix[13] * 1,
    }
  }

  public buildPath(pointer: Point) {
    this.path.addControlPoint(this.convertPoint(pointer), false)
    this.needRefresh = true
  }

  public endPath(pointer: Point) {
    this.path.addControlPoint(this.convertPoint(pointer), true)
    this.needRefresh = true
  }

  public moveMap(offset: Point) {
    this.creatorMapOffset.x += offset.x
    this.creatorMapOffset.y += offset.y
    this.needRefresh = true
  }

  public zoomMap(factor: number) {
    this.zoom += factor
    this.needRefresh = true
  }
}