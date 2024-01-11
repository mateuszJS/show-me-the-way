import Background from "Background";
import Interactivity from "Interactivity";
import Sketch from "Sketch";
import State from "State";
import { canvasMatrix } from "WebGPU/canvasSizeObserver";

export default function runCreator(
  state: State,
  canvas: HTMLCanvasElement,
  context: GPUCanvasContext,
  device: GPUDevice,
) {
  const sketch = new Sketch();
  const interactivity = new Interactivity(canvas, state);
  const background = new Background(device);

  function draw(now: DOMHighResTimeStamp) {
    const { needRefresh } = state; // make save copy of needsRefresh value
    state.needRefresh = false; // set next needsRefresh to false by default

    if (needRefresh) {
      const renderPassDescriptor: GPURenderPassDescriptor = {
        // describe which textures we want to raw to and how use them
        label: "our basic canvas renderPass",
        colorAttachments: [
          {
            view: context.getCurrentTexture().createView(),
            // clearValue: [0, 0, 0, 1],
            loadOp: "clear", // before rendering clear the texture to value "clear". Other option is "load" to load existing content of the texture into GPU so we can draw over it
            storeOp: "store", // to store the result of what we draw, other option is "discard"
          } as const,
        ],
      };
      const encoder = device.createCommandEncoder()
      const pass = encoder.beginRenderPass(renderPassDescriptor)

      if (state.view === "creator") {
        sketch.render(state, pass, canvasMatrix);
        // interactivity.render(state, pass, canvasMatrix)
      } else {
        background.render(state, pass, canvasMatrix)
      }

      pass.end()
      const commandBuffer = encoder.finish();
      device.queue.submit([commandBuffer]);
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}
