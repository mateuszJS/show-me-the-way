import State from "State";
import { drawTriangle } from "WebGPU/programs/initPrograms";
import attachListeners from "./attachListeners";

export default class Interactivity {
  private pointerIsDown: boolean
  private offset: Point | null

  constructor(
    canvas: HTMLCanvasElement,
    private stateRef: State
  ) {
    this.pointerIsDown = false
    this.offset = null

    attachListeners(
        canvas,
        this.onPointerDown,
        this.onPointerMove,
        this.onPointerUp,
        this.onPointerLeave,
        this.onZoom,
    )
  }

  private onPointerDown = (pointer: Point) => {
    this.pointerIsDown = true
  }

  private onPointerMove = (pointer: Point) => {
    if (this.pointerIsDown) {
      this.stateRef.buildPath(pointer)
    } else {
      if (this.stateRef.view === "creator") {
        this.handleCameraMovement(pointer)
      }
    }
  }

  private handleCameraMovement(pointer: Point) {
    const offset: Point = { x: 0, y: 0 }
    const BOUNDARY = 75

    if (pointer.x < BOUNDARY) {
      offset.x = (BOUNDARY - pointer.x) * 0.05
    } else if (pointer.x > window.innerWidth - BOUNDARY) {
      offset.x = (window.innerWidth - BOUNDARY - pointer.x) * 0.05
    }

    if (pointer.y < BOUNDARY) {
      offset.y = (BOUNDARY - pointer.y) * 0.05
    } else if (pointer.y > window.innerHeight - BOUNDARY) {
      offset.y = (window.innerHeight - BOUNDARY - pointer.y) * 0.05
    }

    if (offset.x === 0 && offset.y === 0) {
      if (this.offset !== null) {
        this.offset = null
        this.stateRef.needRefresh = true
      }
    } else {
      this.offset = offset
      this.stateRef.needRefresh = true
    }
  }

  private onPointerLeave = () => {
    this.offset = null
  }

  private onZoom = (factor: number) => {
    const safeFactor = Math.min(Math.max(-0.1, factor * 0.01), 0.1)
    this.stateRef.zoomMap(safeFactor)
  }

  private onPointerUp = (pointer: Point) => {
    if (this.pointerIsDown) {
      //
      this.stateRef.endPath(pointer)
      this.pointerIsDown = false
    }
  }

  public render(
    state: State,
    pass: GPURenderPassEncoder,
    matrix: Float32Array
  ) {
    if (this.offset) {
      this.stateRef.moveMap(this.offset)
      this.stateRef.needRefresh = true
    }
    // drawTriangle(pass, matrix, 100)
    // drawTriangle(pass, matrix, 200)
    // drawTriangle(pass, matrix, 300)
    // drawTriangle(pass, matrix, 400)
  }
}
