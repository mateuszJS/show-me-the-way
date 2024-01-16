import getDrawTriangle from "./drawTriangle/getProgram"
import getDrawBezier from "./drawBezier/getProgram"
import getDrawPlane from "./drawPlane/getProgram"
import getDraw3dModel from "./draw3dModel/getProgram"

export let drawTriangle: ReturnType<typeof getDrawTriangle>
export let drawBezier: ReturnType<typeof getDrawBezier>
export let drawPlane: ReturnType<typeof getDrawPlane>
export let draw3dModel: ReturnType<typeof getDraw3dModel>

export default function initPrograms(
  device: GPUDevice,
  presentationFormat: GPUTextureFormat
) {
  drawTriangle = getDrawTriangle(device, presentationFormat)
  drawBezier = getDrawBezier(device, presentationFormat)
  drawPlane = getDrawPlane(device, presentationFormat)
  draw3dModel = getDraw3dModel(device, presentationFormat)
}