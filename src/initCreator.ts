import Sketch from "Sketch";
import State from "State";
import canvasSizeObserver from "WebGPU/canvasSizeObserver";
import getDevice from "WebGPU/getDevice";
import initPrograms from "WebGPU/programs/initPrograms";
import runCreator from "runCreator";

export default async function initCreator() {
  const state = new State()

  /* setup WebGPU stuff */
  const device = await getDevice()

  const canvas = document.querySelector<HTMLCanvasElement>("canvas")
  if (!canvas) throw Error("Canvas has to be always provided")

  const context = canvas.getContext("webgpu")
  if (!context) throw Error("WebGPU from canvas needs to be always provided")

  const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
  context.configure({
    device,
    format: presentationFormat,
  });

  canvasSizeObserver(canvas, device, () => {
    state.needRefresh = true
  });

  initPrograms(device, presentationFormat)

  runCreator(state, context)
  // initUI(state);
}


