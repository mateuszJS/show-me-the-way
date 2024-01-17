import GUI from "GUI";
import State from "State";
import mat4 from "utils/mat4";

const degToRad = (d: number) => d * Math.PI / 180;
const settings = {
  cameraAngle: degToRad(58),
  fieldOfView: degToRad(18.15),
  zNear: 1,
  zFar: 2000,
  translation: [0, 0, 36.81],
  rotation: [degToRad(0), degToRad(0), degToRad(0)],
  scale: [1, 1, 1],
  scaleFactor: 1,
}; // to add more perspective, increase fieldofView and decrease translation.z
const radToDegOptions = { min: -360, max: 360, step: 1, converters: GUI.converters.radToDeg };

let gui: GUI | undefined;

export default function getMatrixPreview(canvas: HTMLCanvasElement, state: State) {
  if (!gui) {
    gui = new GUI();
    gui.onChange(() => state.needRefresh = true);
    gui.add(settings, 'cameraAngle', radToDegOptions);
    gui.add(settings, 'fieldOfView', {min: 1, max: 179, converters: GUI.converters.radToDeg});
    gui.add(settings, 'zNear', 1, 2000).name('zNear');
    gui.add(settings, 'zFar', 1, 2000).name('zFar');
    gui.add(settings.translation, '0', -1000, 1000).name('translation.x');
    gui.add(settings.translation, '1', -1000, 1000).name('translation.y');
    gui.add(settings.translation, '2', -1400, 1000).name('translation.z');
    gui.add(settings.rotation, '0', radToDegOptions).name('rotation.x');
    gui.add(settings.rotation, '1', radToDegOptions).name('rotation.y');
    gui.add(settings.rotation, '2', radToDegOptions).name('rotation.z');
    // gui.add(settings.scale, '0', -5, 5).name('scale.x');
    // gui.add(settings.scale, '1', -5, 5).name('scale.y');
    // gui.add(settings.scale, '2', -5, 5).name('scale.z');
    gui.add(settings, 'scaleFactor', -5, 5).name('scaleFactor');
  }
  
  const aspect = canvas.clientWidth / canvas.clientHeight;
  const projection = mat4.perspective(
      settings.fieldOfView,
      aspect,
      settings.zNear,      // zNear
      settings.zFar,   // zFar
  );

  const target = [0, 0, 0];

  // Use matrix math to compute a position on a circle where
  // the camera is
  const tempMatrix = mat4.rotationX(settings.cameraAngle);
  mat4.translate(tempMatrix, settings.translation, tempMatrix);

  // Get the camera's position from the matrix we computed
  const eye = tempMatrix.slice(12, 15);

  const up = [0, 1, 0];

  const viewMatrix = mat4.lookAt(eye, target, up);

  // combine the view and projection matrixes
  const scaling = mat4.scaling([settings.scaleFactor, settings.scaleFactor,settings.scaleFactor])
  const viewProjectionMatrix = mat4.multiply(projection, viewMatrix);
  const scaledViewProjectionMatrix = mat4.multiply(scaling, viewProjectionMatrix);

  return scaledViewProjectionMatrix
}