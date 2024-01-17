import Background from "Background";
import Interactivity from "Interactivity";
import Pipe from "Pipe";
import Sketch from "Sketch";
import State from "State";
import getRenderDescriptor from "./getRenderDescriptor";
import getMatrixPreview from "./getMatrixPreview";
import getMatrixSketch from "./getMatrixSketch";
import mat4 from "utils/mat4";

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


  function draw(now: DOMHighResTimeStamp) {
    const { needRefresh } = state; // make save copy of needsRefresh value
    state.needRefresh = false; // set next needsRefresh to false by default

    if (needRefresh) {
      const renderPassDescriptor = getRenderDescriptor(context, device)
      const encoder = device.createCommandEncoder()
      const pass = encoder.beginRenderPass(renderPassDescriptor)

      if (state.view === "creator") {
        let matrix = getMatrixSketch(canvas)
        background.render(
          state,
          pass,
          mat4.scale(
            mat4.translate(
              mat4.scale(
                mat4.translate(matrix, [state.creatorMapOffset.x, state.creatorMapOffset.y, 0]),
                [500, 500, 1]
              ),
              [.5, .5, 0]
            ),
            [1 * state.zoom, -1 * state.zoom, 1]
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
        const matrix = getMatrixPreview(canvas, state)
        background.render(
          state,
          pass,
          mat4.scale(matrix, [100, 100, 1]),
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
