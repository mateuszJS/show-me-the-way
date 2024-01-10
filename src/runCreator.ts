import Sketch from "Sketch";
import State from "State";
import { canvasMatrix } from "WebGPU/canvasSizeObserver";

export default function runCreator(state: State, context: GPUCanvasContext) {
  const sketch = new Sketch();

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
            clearValue: [0.3, 0.3, 0.3, 1],
            loadOp: "clear", // before rendering clear the texture to value "clear". Other option is "load" to load existing content of the texture into GPU so we can draw over it
            storeOp: "store", // to store the result of what we draw, other option is "discard"
          } as const,
        ],
      };

      sketch.render(state, renderPassDescriptor, canvasMatrix);
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}
