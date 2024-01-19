import State from "State";
import { draw3dModel } from "WebGPU/programs/initPrograms";
import getVerticies from "./getVerticies";

const SPEED = 0.01
export default class Pipe {
  constructor() {
  }

  public render(
    state: State,
    pass: GPURenderPassEncoder,
    projectionMatrix: Float32Array
  ) {
    if (!state.play) {
      const [vertex, indices] = getVerticies(state.path, state.path.segments.length)
      const vertexData = new Float32Array(vertex)
      const indexData = new Uint32Array(indices)
      draw3dModel(pass, projectionMatrix, vertexData, indexData)
      return
    }

    const currProgress = state.time / state.path.segments.length
    const indexFloat = currProgress * (state.path.percentageDist.length - 1)
    const bottomIndex = Math.floor(indexFloat);
    const topIndex = Math.ceil(indexFloat);

    const diff = indexFloat - bottomIndex; // <0, 1>
    const distanceAvg =
      (1 - diff) * state.path.percentageDist[bottomIndex] + diff * state.path.percentageDist[topIndex];


    const [vertex, indices] = getVerticies(state.path, state.time)
    state.time += distanceAvg * SPEED
    if (state.play && state.time >= state.path.segments.length) {
      state.play = false
      state.time = 0
      state.needRefresh = true
    } else {
      state.needRefresh = true
    }
    const vertexData = new Float32Array(vertex)
    const indexData = new Uint32Array(indices)
    draw3dModel(pass, projectionMatrix, vertexData, indexData)
  }
}
