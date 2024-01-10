import getDrawTriangle from "./drawTriangle/getProgram"

export let drawTriangle: ReturnType<typeof getDrawTriangle>

export default function initPrograms(
  device: GPUDevice,
  presentationFormat: GPUTextureFormat
) {
  drawTriangle = getDrawTriangle(device, presentationFormat)
}