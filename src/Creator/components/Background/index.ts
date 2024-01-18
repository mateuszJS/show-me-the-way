import State from "State";
import { draw3dModelTexture } from "WebGPU/programs/initPrograms";
import MapEuropeJpg from "./map-europe.jpg"
import FtexPng from "./f-texture.png"
import FtexJpg from "./f-texture.jpg"
import PoliticalMap from "./political-map-of-europe.jpg"
import { createTextureFromImage } from "WebGPU/getTexture";
import mat4 from "utils/mat4";

const posAndTexCoord = [
  -0.5, -0.5, 0,     0, 0,
  +0.5, -0.5, 0,     1, 0,
  -0.5, +0.5, 0,     0, 1,
  +0.5, +0.5, 0,     1, 1,
];

const indices = [
 0,  1,  2,
 2,  3,  1,
];

export default class Background {
  private texture: GPUTexture | null

  constructor(device: GPUDevice, state: State) {
    this.texture = null
    createTextureFromImage(device, MapEuropeJpg, {mips: false, flipY: true}).then(tex => {
      this.texture = tex
      state.needRefresh = true
    })
    // I canno generate mips, maybe it's jsut too big PROBABLY, idk
  }

  public render(
    state: State,
    pass: GPURenderPassEncoder,
    projectionMatrix: Float32Array
  ) {
    if (this.texture === null) return
    const vertexData = new Float32Array(posAndTexCoord)
    const indexData = new Uint32Array(indices)
    draw3dModelTexture(pass, projectionMatrix, this.texture, vertexData, indexData)
  }
}
