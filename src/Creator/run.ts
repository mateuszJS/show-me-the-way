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
import vec3 from "utils/vec3";
import { drawBlur, drawFullTexture } from "WebGPU/programs/initPrograms";

export let transformMatrix = new Float32Array()
export const MAP_BACKGROUND_SCALE = 1000

let stopRecording: VoidFunction | null = null

export default function runCreator(
  state: State,
  canvas: HTMLCanvasElement,
  context: GPUCanvasContext,
  device: GPUDevice,
  presentationFormat: GPUTextureFormat,
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
      const sceneTexture = device.createTexture({
        size: [canvas.width, canvas.height],
        format: presentationFormat,
        usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.RENDER_ATTACHMENT,
      });
      const renderPassDescriptor = getRenderDescriptor(sceneTexture, device)
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
            mat4.scale(
              matrix,
              [MAP_BACKGROUND_SCALE, MAP_BACKGROUND_SCALE, 1]
            ),
            [1, -1, 1]
          )
        )
        sketch.render(state, pass, matrix);
        interactivity.render(state, pass, matrix)
      } else {

      if (state.play) {
        state.time += 0.001
        state.needRefresh = true
      }

      if (state.play && state.time >= 1) {
        state.play = false
        state.time = 0
        state.needRefresh = true
      }

        if (state.play && stopRecording === null && state.record) {
          stopRecording = captureStreamFromCanvasWasm(canvas)
        } else if (!state.play && stopRecording) {
          stopRecording()
        }
        console.log(state.play, state.time)
        const lightColor = new Float32Array([0.2, 1, 0.2, 1])
        
        
        const {
          lightDirection,
          worldViewProjection,
          normalMatrix
        } = getMatrixPreview(canvas, state)
        background.render(
          state,
          pass,
          mat4.scale(worldViewProjection, [MAP_BACKGROUND_SCALE, MAP_BACKGROUND_SCALE, 1]),
        )
        pipe.render(state, pass, worldViewProjection, normalMatrix, lightColor, lightDirection)
      }

      pass.end()
      // here we need to render that texture into canvas
      const canvasTexture = context.getCurrentTexture();
      const renderToCanvasDescriptor = {
        // describe which textures we want to raw to and how use them
        label: "our render to canvas renderPass",
        colorAttachments: [
          {
            view: canvasTexture.createView(),
            clearValue: [0.3, 0, 0, 1],
            loadOp: "clear", // before rendering clear the texture to value "clear". Other option is "load" to load existing content of the texture into GPU so we can draw over it
            storeOp: "store", // to store the result of what we draw, other option is "discard"
          } as const,
        ],
      }
      const blurredTexture = drawBlur(sceneTexture, encoder)
      const renderToCanvasPass = encoder.beginRenderPass(renderToCanvasDescriptor)
      drawFullTexture(renderToCanvasPass, blurredTexture)
      renderToCanvasPass.end()
      const commandBuffer = encoder.finish();
      device.queue.submit([commandBuffer]);
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}
