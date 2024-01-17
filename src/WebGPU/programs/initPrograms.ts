import getDrawTriangle from "./drawTriangle/getProgram"
import getDrawBezier from "./drawBezier/getProgram"
import getDraw3dModelTexture from "./draw3dModelTexture/getProgram"
import getDraw3dModel from "./draw3dModel/getProgram"

export let drawTriangle: ReturnType<typeof getDrawTriangle>
export let drawBezier: ReturnType<typeof getDrawBezier>
export let draw3dModel: ReturnType<typeof getDraw3dModel>
export let draw3dModelTexture: ReturnType<typeof getDraw3dModelTexture>

export default function initPrograms(
  device: GPUDevice,
  presentationFormat: GPUTextureFormat
) {
  drawTriangle = getDrawTriangle(device, presentationFormat)
  drawBezier = getDrawBezier(device, presentationFormat)
  draw3dModelTexture = getDraw3dModelTexture(device, presentationFormat)
  draw3dModel = getDraw3dModel(device, presentationFormat)
}