import State from "State";
import { draw3dModel } from "WebGPU/programs/initPrograms";
import getVerticies from "./getVerticies";

export default class Pipe {
  constructor() {
  }

  public render(
    state: State,
    pass: GPURenderPassEncoder,
    projectionMatrix: Float32Array
  ) {
    const [vertex, indices] = getVerticies(state.path)
    const vertexData = new Float32Array(vertex)
    const indexData = new Uint32Array(indices)
    draw3dModel(pass, projectionMatrix, vertexData, indexData)
  }
}
