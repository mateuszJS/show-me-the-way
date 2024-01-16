import State from "State";
import { drawBezier, drawPlane } from "WebGPU/programs/initPrograms";
import MapEuropeJpg from "./map-europe.jpg"
import FtexPng from "./f-texture.png"
import FtexJpg from "./f-texture.jpg"
import PoliticalMap from "./political-map-of-europe.jpg"
import { createTextureFromImage } from "WebGPU/getTexture";
import mat4 from "utils/mat4";

// const posAndTexCoord = [
//   0, 0, 0,      0, 0,
//   1, 0, 0,       1, 0,
//   0, 1, 0,     0, 1,
//   1, 1, 0,      1, 1,
// ];
// const posAndTexCoord = [
//   0, 0, 5,      0, 0,
//   100, 0, 5,       1, 0,
//   0, 100, 5,     0, 1,
//   100, 100, 5,      1, 1,
// ];
const posAndTexCoord = [
  -50, -50, 0,      0, 0,
  50, -50, 0,       1, 0,
  -50, 50, 0,     0, 1,
  50, 50, 0,      1, 1,
];
// const posAndTexCoord = [
//   -200, 0, 10,      0, 0,
//   200, 0, 10,       1, 0,
//   200, 0, 200,      1, 1,
//   -200, 0, 200,     0, 1,
// ];

// const indices = [
//  0,  1,  2,    2,  3,  1,
// ];



const indices = [
 0,  1,  2,    2,  3,  1,   // left column
];


export default class Background {
  private texture: GPUTexture | null

  constructor(device: GPUDevice, state: State) {
    this.texture = null
    createTextureFromImage(device, MapEuropeJpg, {mips: false, flipY: true}).then(tex => {
      this.texture = tex
      state.needRefresh = true
      console.log("loaded tex")
    })
    // I canno generate mips, maybe it's jsut too big
  }

  public render(
    state: State,
    pass: GPURenderPassEncoder,
    projectionMatrix: Float32Array
  ) {
    if (this.texture === null) return

    /*
    THIS CODE RORATTES "F" BY THEIR CENTER
        const translationMatrix = mat3.translation(settings.translation);
    const rotationMatrix = mat3.rotation(settings.rotation);
    const scaleMatrix = mat3.scaling(settings.scale);
    // make a matrix that will move the origin of the 'F' to its center.
    const moveOriginMatrix = mat3.translation([-50, -75]);
 
    let matrix = mat3.multiply(translationMatrix, rotationMatrix);
    matrix = mat3.multiply(matrix, scaleMatrix);
    matrix = mat3.multiply(matrix, moveOriginMatrix);
    */

    /*this is our attempt
       const rotationMatrix = mat4.rotationX(Math.PI / 1.2)
   const translationMatrix = mat4.translation([0, 0, -95])
   const scalingMatrix = mat4.scaling([3, 3, 3])

  //  let matrix = mat4.multiply(projectionMatrix, scalingMatrix)
  let matrix = mat4.multiply(scalingMatrix, rotationMatrix)
   matrix = mat4.multiply(matrix, translationMatrix)
   matrix = mat4.multiply(matrix, projectionMatrix)
    */

    let matrix = mat4.translate(projectionMatrix, [0, 0, 0])
    // const matrix = mat4.translate(projectionMatrix, [-50, 50, -75])
    // matrix = mat4.rotateX(matrix, -0.4)
    // matrix = mat4.rotateX(matrix, Math.PI / 1.2)
    // const scaledMatrix = mat4.scale(roattedMatrix, [3, 3, 3])

    const vertexData = new Float32Array(posAndTexCoord)
    const indexData = new Uint32Array(indices)
    drawPlane(pass, matrix, this.texture, vertexData, indexData)
  }
}
