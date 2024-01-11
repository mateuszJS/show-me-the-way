import getDrawTriangle from "./drawTriangle/getProgram"
import getDrawBezier from "./drawBezier/getProgram"
import getDrawPlane from "./drawPlane/getProgram"

export let drawTriangle: ReturnType<typeof getDrawTriangle>
export let drawBezier: ReturnType<typeof getDrawBezier>
export let drawPlane: ReturnType<typeof getDrawPlane>

export default function initPrograms(
  device: GPUDevice,
  presentationFormat: GPUTextureFormat
) {
  drawTriangle = getDrawTriangle(device, presentationFormat)
  drawBezier = getDrawBezier(device, presentationFormat)
  drawPlane = getDrawPlane(device, presentationFormat)
}