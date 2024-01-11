import State from "State";
import { drawBezier, drawPlane } from "WebGPU/programs/initPrograms";
import MapEuropeJpg from "./map-europe.jpg"
import FtexPng from "./f-texture.png"
import { createTextureFromImage } from "WebGPU/getTexture";

export default class Background {
  private texture: GPUTexture | null

  constructor(device: GPUDevice) {
    this.texture = null
    createTextureFromImage(device, FtexPng, {mips: true, flipY: false}).then(tex => this.texture = tex)
  }

  public render(
    state: State,
    pass: GPURenderPassEncoder,
    matrix: Float32Array
  ) {
    if (this.texture === null) return
    drawPlane(pass, matrix, this.texture)
  }
}
