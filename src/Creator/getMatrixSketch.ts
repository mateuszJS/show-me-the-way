import mat4 from "utils/mat4";

export default function getMatrixPreview(canvas: HTMLCanvasElement) {
  const projection = mat4.ortho(
    0,                   // left
    canvas.clientWidth,  // right
    canvas.clientHeight, // bottom
    0,                   // top
    400,                 // near
    -400,                // far
  );  

  return projection
}