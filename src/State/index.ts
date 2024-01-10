import Path from "Path/Path"

export default class State {
  public needRefresh: boolean
  public path: Path
  public view: "creator" | "preview"

  constructor() {
    this.needRefresh = false
    this.path = new Path()
    this.view = "creator"
  }

  public buildPath(pointer: Point) {
    this.path.addControlPoint(pointer, false)
    this.needRefresh = true
  }

  public endPath(pointer: Point) {
    this.path.addControlPoint(pointer, true)
    this.needRefresh = true
  }
}