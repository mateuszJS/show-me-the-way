import State from "State";
import { draw3dModel, drawBezier, drawPlane } from "WebGPU/programs/initPrograms";
import MapEuropeJpg from "./map-europe.jpg"
import FtexPng from "./f-texture.png"
import FtexJpg from "./f-texture.jpg"
import PoliticalMap from "./political-map-of-europe.jpg"
import { createTextureFromImage } from "WebGPU/getTexture";
import mat4 from "utils/mat4";
import Path, { Segment } from "Path/Path";

const PRECISION = 12


function getVertex(path: Path) {
  const vertex: number[] = []
  const indices: number[] = []
  let circleIndex = 0

  const maxT = path.segments.length - 1
  for (let t = 0; t < maxT; t += 0.3) {
    for (let p = 0; p < PRECISION; p++) {
      const angle = p * 2 * Math.PI / PRECISION
      const [pointOnCurve, curveTan] = path.getPosAndTan(t)
      const x2d = Math.cos(angle) * 0.7
      const z2d = -Math.sin(angle) * 0.7// -10 or +10
      const y2d = 0

      const angleZaxis = Math.atan2(curveTan.x, curveTan.y)

      const x3d = x2d * Math.cos(angleZaxis) - y2d * Math.sin(angleZaxis) + pointOnCurve.x / 100 
      const y3d = x2d * Math.sin(angleZaxis) + y2d * Math.cos(angleZaxis) - pointOnCurve.y / 100
      const z3d = z2d

      vertex.push(x3d, y3d, z3d)

    }
    if (circleIndex > 0) {
      // it's not the first circle
      for (let p = 0; p < PRECISION; p++) {
        // const vertexIndex = PRECISION * circleIndex + p
        indices.push(
          PRECISION * circleIndex + p,
          PRECISION * (circleIndex - 1) + ((p + 1) % PRECISION),
          PRECISION * (circleIndex - 1) + p,
        )
        indices.push(
          PRECISION * circleIndex + p,
          PRECISION * circleIndex + ((p + 1) % PRECISION),
          PRECISION * (circleIndex - 1) + ((p + 1) % PRECISION),
        )
      }
    }
    circleIndex++
  }
  console.log("indices", indices)
  return [vertex, indices]
}

export default class Pipe {
  constructor() {
  }

  public render(
    state: State,
    pass: GPURenderPassEncoder,
    projectionMatrix: Float32Array
  ) {
    let matrix = mat4.translate(projectionMatrix, [0, 0, 0])
    // const matrix = mat4.translate(projectionMatrix, [-50, 50, -75])

    // matrix = mat4.rotateX(matrix, -0.4)

    // matrix = mat4.rotateX(matrix, Math.PI / 1.2)
    // const scaledMatrix = mat4.scale(roattedMatrix, [3, 3, 3])
    const [vertex, indices] = getVertex(state.path)
    const vertexData = new Float32Array(vertex)
    const indexData = new Uint32Array(indices)
    draw3dModel(pass, matrix, vertexData, indexData)
  }
}
