import GUI from "GUI";
import State from "State";
import mat3 from "WebGPU/m3";
import mat4 from "utils/mat4";
import vec3 from "utils/vec3";

const degToRad = (d: number) => d * Math.PI / 180;
export const cameraSettings = {
  cameraAngle: degToRad(58),
  fieldOfView: degToRad(18.15),
  zNear: 1,
  zFar: 2000,
  translation: [0, 0, 167],
  rotation: [degToRad(0), degToRad(0), degToRad(0)],
  scale: [1, 1, 1],
  scaleFactor: 1,
  light: [.31, .46, -.16]
  // light: [-0.5, -0.7, -1]
}; // to add more perspective, increase fieldofView and decrease translation.z
const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };

let gui: GUI | undefined;

export default function getMatrixPreview(canvas: HTMLCanvasElement, state: State) {
  if (!gui) {
    gui = new GUI();
    gui.onChange(() => state.needRefresh = true);
    gui.add(cameraSettings, 'cameraAngle', radToDegOptions);
    gui.add(cameraSettings, 'fieldOfView', {min: 1, max: 179, converters: GUI.converters.radToDeg});
    gui.add(cameraSettings, 'zNear', 1, 2000).name('zNear');
    gui.add(cameraSettings, 'zFar', 1, 2000).name('zFar');
    gui.add(cameraSettings.translation, '0', -1000, 1000).name('translation.x');
    gui.add(cameraSettings.translation, '1', -1000, 1000).name('translation.y');
    gui.add(cameraSettings.translation, '2', -1400, 1000).name('translation.z');
    gui.add(cameraSettings.rotation, '0', radToDegOptions).name('rotation.x');
    gui.add(cameraSettings.rotation, '1', radToDegOptions).name('rotation.y');
    gui.add(cameraSettings.rotation, '2', radToDegOptions).name('rotation.z');
    // gui.add(cameraSettings.scale, '0', -5, 5).name('scale.x');
    // gui.add(cameraSettings.scale, '1', -5, 5).name('scale.y');
    // gui.add(cameraSettings.scale, '2', -5, 5).name('scale.z');
    gui.add(cameraSettings, 'scaleFactor', -5, 5).name('scaleFactor');
    gui.add(cameraSettings.light, '0', -Math.PI, Math.PI).name('light.x');
    gui.add(cameraSettings.light, '1', -Math.PI, Math.PI).name('light.y');
    gui.add(cameraSettings.light, '2', -Math.PI, Math.PI).name('light.z');
  }
  
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const projection = mat4.perspective(
      cameraSettings.fieldOfView,
      aspect,
      cameraSettings.zNear,      // zNear
      cameraSettings.zFar,   // zFar
  );
  const relativeT = state.path.getRelativeT(state.time)
  const [pointOnCurve] = state.path.getPosAndTan(relativeT)
  const target = [pointOnCurve.x, -pointOnCurve.y, 0];

  // Use matrix math to compute a position on a circle where
  // the camera is
  const cameraPos = mat4.translation(target)
  const tempMatrix = mat4.rotateX(cameraPos, cameraSettings.cameraAngle);
  // const tempMatrix = mat4.rotationX(cameraSettings.cameraAngle);
  mat4.translate(tempMatrix, cameraSettings.translation, tempMatrix);

  // Get the camera's position from the matrix we computed
  const eye = tempMatrix.slice(12, 15);

  const up = [0, 1, 0];

  const viewMatrix = mat4.lookAt(eye, target, up);

  // combine the view and projection matrixes
  const scaling = mat4.scaling([cameraSettings.scaleFactor, cameraSettings.scaleFactor,cameraSettings.scaleFactor])
  const viewProjectionMatrix = mat4.multiply(projection, viewMatrix);
  // const scaledViewProjectionMatrix = mat4.multiply(scaling, viewProjectionMatrix);

  const world = mat4.identity();

  // Combine the viewProjection and world matrices
  const worldViewProjection = mat4.multiply(viewProjectionMatrix, world);

      // Inverse and transpose it into the normalMatrix value
  const normalMatrix = mat3.fromMat4(mat4.transpose(mat4.inverse(world)));

  const lightDirection = vec3.normalize(cameraSettings.light);
  return {
    worldViewProjection,
    normalMatrix,
    lightDirection
  }
}