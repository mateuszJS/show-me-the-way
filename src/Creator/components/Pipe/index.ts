import State from "State";
import { draw3dModel, draw3dModelLight } from "WebGPU/programs/initPrograms";
import getVerticies from "./getVerticies";

export default class Pipe {
  constructor() {}

  public render(
    state: State,
    pass: GPURenderPassEncoder,
    worldViewProjection: Float32Array,
    normalMatrix: Float32Array,
    lightColor: Float32Array,
    lightDirection: Float32Array
  ) {
    const uniforms = {
      worldViewProjection,
      normalMatrix,
      lightColor,
      lightDirection
    }
    // if (!state.play) {
    //   const [vertex, indices] = getVerticies(state.path, 1)
    //   const vertexData = new Float32Array(vertex)
    //   const indexData = new Uint32Array(indices)
    //   draw3dModelLight(pass, uniforms, vertexData, indexData)
    //   return
    // }

    const [vertex, indices] = getVerticies(state.path, state.time)
    const vertexData = new Float32Array(vertex)
    const indexData = new Uint32Array(indices)
    draw3dModelLight(pass, uniforms, vertexData, indexData)
  }
}
