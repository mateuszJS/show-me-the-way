import State from "State";
import { drawTriangle } from "WebGPU/programs/initPrograms";

export default class Sketch {
  constructor() {

  }

  public render(
    state: State,
    renderPassDescriptor: GPURenderPassDescriptor,
    matrix: Float32Array
  ) {
    drawTriangle(renderPassDescriptor, matrix)
  }
}
