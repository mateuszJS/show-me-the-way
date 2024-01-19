import Background from "Creator/components/Background";
import Interactivity from "Creator/components/Interactivity";
import Pipe from "Creator/components/Pipe";
import Sketch from "Creator/components/Sketch";
import State from "State";
import getRenderDescriptor from "./getRenderDescriptor";
import getMatrixPreview, { cameraSettings } from "./getMatrixPreview";
import getMatrixSketch from "./getMatrixSketch";
import mat4 from "utils/mat4";
import captureStreamFromCanvas from "utils/captureCanvasStream";
import captureStreamFromCanvasWasm from "utils/captureCanvasStreamWasm";

export let transformMatrix = new Float32Array()
export const MAP_BACKGROUND_SCALE = 1000

let stopRecording: VoidFunction | null = null

export default function runCreator(
  state: State,
  canvas: HTMLCanvasElement,
  context: GPUCanvasContext,
  device: GPUDevice,
) {
  const sketch = new Sketch();
  const interactivity = new Interactivity(canvas, state);
  const background = new Background(device, state);
  const pipe = new Pipe()

  state.creatorMapOffset = { x: canvas.clientWidth / 2, y: canvas.clientHeight / 2}
  state.zoom = 4

  function draw(now: DOMHighResTimeStamp) {
    const { needRefresh } = state; // make save copy of needsRefresh value
    state.needRefresh = false; // set next needsRefresh to false by default

    if (needRefresh) {
      const renderPassDescriptor = getRenderDescriptor(context, device)
      const encoder = device.createCommandEncoder()
      const pass = encoder.beginRenderPass(renderPassDescriptor)

      if (state.view === "creator") {
        let matrix = getMatrixSketch(canvas)

        transformMatrix = mat4.translate(
            mat4.scale(
              mat4.translation(
                [canvas.clientWidth * .5, canvas.clientHeight * .5, 0] // IMO it should be times state.zoom
              ),
              [state.zoom, state.zoom, 1]
            ),
            [
              state.creatorMapOffset.x - canvas.clientWidth  * .5, 
              state.creatorMapOffset.y - canvas.clientHeight * .5,
              0,
            ]
          )
        matrix = mat4.multiply(matrix, transformMatrix)

        background.render(
          state,
          pass,
          mat4.scale(
            // mat4.translate(
              mat4.scale(
                matrix,
                [MAP_BACKGROUND_SCALE, MAP_BACKGROUND_SCALE, 1]
              ),
              // [.5, .5, 0]
            // ),
            [1, -1, 1]
          )
        )
        // background.render(
        //   state,
        //   pass,
        //   mat4.scale(
        //     mat4.translate(
        //       mat4.scale(
        //         mat4.translate(matrix, [state.creatorMapOffset.x, state.creatorMapOffset.y, 0]),
        //         [500, 500, 1]
        //       ),
        //       [-.5, -.5, 0]
        //     ),
        //     [1, -1, 1]
        //   )
        // )
        sketch.render(state, pass, matrix);

        interactivity.render(state, pass, matrix)
      } else {

        if (state.play && stopRecording === null && state.record) {
          stopRecording = captureStreamFromCanvasWasm(canvas)
        } else if (!state.play && stopRecording) {
          stopRecording()
        }

        const matrix = getMatrixPreview(canvas, state)
        background.render(
          state,
          pass,
          mat4.scale(matrix, [MAP_BACKGROUND_SCALE, MAP_BACKGROUND_SCALE, 1]),
        )
        pipe.render(state, pass, matrix)
      }

      pass.end()
      const commandBuffer = encoder.finish();
      device.queue.submit([commandBuffer]);
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}
