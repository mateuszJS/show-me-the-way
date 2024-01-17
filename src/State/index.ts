import Path from "Path/Path"

export default class State {
  public needRefresh: boolean
  public path: Path
  public view: "creator" | "preview"
  public creatorMapOffset: Point
  public zoom: number

  constructor() {
    this.needRefresh = false
    this.path = new Path()
    this.view = "preview"
    this.creatorMapOffset = { x: 0, y: 0 }
    this.zoom = 1
  }

  public buildPath(pointer: Point) {
    this.path.addControlPoint(pointer, false)
    this.needRefresh = true
  }

  public endPath(pointer: Point) {
    this.path.addControlPoint(pointer, true)
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