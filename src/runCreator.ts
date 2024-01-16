import Background from "Background";
import GUI from "GUI";
import Interactivity from "Interactivity";
import Pipe from "Pipe";
import Sketch from "Sketch";
import State from "State";
import { canvasMatrix } from "WebGPU/canvasSizeObserver";
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

  const degToRad = (d: number) => d * Math.PI / 180;
  const settings = {
    zNear: 1,
    zFar: 2000,
    fieldOfView: degToRad(100),
    translation: [-65, 0, -120],
    rotation: [degToRad(220), degToRad(25), degToRad(325)],
    scale: [1, 1, 1],
    cameraAngle: 0,
    scaleFactor: 1,
  };

  const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };

  const gui = new GUI();
  gui.onChange(() => state.needRefresh = true);
  gui.add(settings, 'cameraAngle', radToDegOptions);
  gui.add(settings, 'fieldOfView', {min: 1, max: 179, converters: GUI.converters.radToDeg});
  gui.add(settings, 'zNear', 1, 2000).name('zNear');
  gui.add(settings, 'zFar', 1, 2000).name('zFar');
  gui.add(settings.translation, '0', -1000, 1000).name('translation.x');
  gui.add(settings.translation, '1', -1000, 1000).name('translation.y');
  gui.add(settings.translation, '2', -1400, -100).name('translation.z');
  gui.add(settings.rotation, '0', radToDegOptions).name('rotation.x');
  gui.add(settings.rotation, '1', radToDegOptions).name('rotation.y');
  gui.add(settings.rotation, '2', radToDegOptions).name('rotation.z');
  // gui.add(settings.scale, '0', -5, 5).name('scale.x');
  // gui.add(settings.scale, '1', -5, 5).name('scale.y');
  // gui.add(settings.scale, '2', -5, 5).name('scale.z');
  gui.add(settings, 'scaleFactor', -5, 5).name('scaleFactor');

  let depthTexture: GPUTexture | undefined;

  function draw(now: DOMHighResTimeStamp) {
    const { needRefresh } = state; // make save copy of needsRefresh value
    state.needRefresh = false; // set next needsRefresh to false by default
    

    if (needRefresh) {
      const canvasTexture = context.getCurrentTexture();

      if (!depthTexture ||
        depthTexture.width !== canvasTexture.width ||
        depthTexture.height !== canvasTexture.height
      ) {
        if (depthTexture) {
          depthTexture.destroy();
        }
        depthTexture = device.createTexture({
          size: [canvasTexture.width, canvasTexture.height],
          format: 'depth24plus',
          usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
      }
      
      const renderPassDescriptor: GPURenderPassDescriptor = {
        // describe which textures we want to raw to and how use them
        label: "our basic canvas renderPass",
        colorAttachments: [
          {
            view: canvasTexture.createView(),
            // clearValue: [0, 0, 0, 1],
            loadOp: "clear", // before rendering clear the texture to value "clear". Other option is "load" to load existing content of the texture into GPU so we can draw over it
            storeOp: "store", // to store the result of what we draw, other option is "discard"
          } as const,
        ],
        depthStencilAttachment: {
          view: depthTexture.createView(), // placholder to calm down TS
          depthClearValue: 1.0,
          depthLoadOp: 'clear',
          depthStoreOp: 'store',
        } as const,
      };
      const encoder = device.createCommandEncoder()
      const pass = encoder.beginRenderPass(renderPassDescriptor)

      if (state.view === "creator") {
        sketch.render(state, pass, canvasMatrix);
        // interactivity.render(state, pass, canvasMatrix)
      } else {

        // const settings = {
        //   zNear: 1,
        //   zFar: 500,
        //   fieldOfView: 1.74,
        //   translation: [-65, 0, -120],
        //   rotation: [3.84, 0.44, 5.67],
        //   scale: [1, 1, 1],
        //   cameraAngle: 0,
        // };

        const aspect = canvas!.clientWidth / canvas!.clientHeight;
        const projection = mat4.perspective(
            settings.fieldOfView,
            aspect,
            settings.zNear,      // zNear
            settings.zFar,   // zFar
        );




    // const cameraMatrix = mat4.rotationY(settings.cameraAngle);
    // mat4.translate(cameraMatrix, [0, 0, radius * 1.5], cameraMatrix);

    // Compute the position of the first F
    const target = [0, 0, 0];

    // Use matrix math to compute a position on a circle where
    // the camera is
    const tempMatrix = mat4.rotationX(settings.cameraAngle);
    mat4.translate(tempMatrix, [0, 0, 12], tempMatrix);
  
    // Get the camera's position from the matrix we computed
    const eye = tempMatrix.slice(12, 15);
  
    const up = [0, 1, 0];
  
    const viewMatrix = mat4.lookAt(eye, target, up);

    // combine the view and projection matrixes
    const scaling = mat4.scaling([settings.scaleFactor, settings.scaleFactor,settings.scaleFactor])
    const viewProjectionMatrix = mat4.multiply(projection, viewMatrix);
    const scaledViewProjectionMatrix = mat4.multiply(scaling, viewProjectionMatrix);
    


        
        background.render(state, pass, scaledViewProjectionMatrix)
        pipe.render(state, pass, scaledViewProjectionMatrix)
      }

      pass.end()
      const commandBuffer = encoder.finish();
      device.queue.submit([commandBuffer]);
    }

    requestAnimationFrame(draw);
  }

  requestAnimationFrame(draw);
}
