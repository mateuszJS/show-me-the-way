import State from "State";
import { drawTriangle } from "WebGPU/programs/initPrograms";
import attachListeners from "./attachListeners";

export default class Interactivity {
  private pointerIsDown: boolean

  constructor(
    canvas: HTMLCanvasElement,
    private stateRef: State
  ) {
    this.pointerIsDown = false

    attachListeners(
        canvas,
        this.onPointerDown,
        this.onPointerMove,
        this.onPointerUp,
    )
  }

  private onPointerDown = (pointer: Point) => {
    this.pointerIsDown = true
  }

  private onPointerMove = (pointer: Point) => {
    if (this.pointerIsDown) {
      this.stateRef.buildPath(pointer)
    }
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
    drawTriangle(pass, matrix, 100)
    drawTriangle(pass, matrix, 200)
    drawTriangle(pass, matrix, 300)
    drawTriangle(pass, matrix, 400)
  }
}
