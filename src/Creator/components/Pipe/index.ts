import State from "State";
import { draw3dModel } from "WebGPU/programs/initPrograms";
import mat4 from "utils/mat4";
import Path from "Creator/components/Path/Path";

const RADIUS_PRECISION = 12 // bigger is more precise, integers
const LENGTH_PRECISION = 0.3 // smaller is more precise, floats
const PIPE_RADIUS = 5

function getVertex(path: Path) {
  const vertex: number[] = []
  const indices: number[] = []
  let circleIndex = 0

  const maxT = path.segments.length
  for (let t = 0; t < maxT; t += LENGTH_PRECISION) {
    for (let p = 0; p < RADIUS_PRECISION; p++) {
      const angle = p * 2 * Math.PI / RADIUS_PRECISION

      const roundedT = t > maxT - LENGTH_PRECISION ? maxT : t
      // just to make sure we always round up very last circle to very last POSSIBLE circle
      
      const [pointOnCurve, curveTan] = path.getPosAndTan(roundedT)
      const x2d = Math.cos(angle) * PIPE_RADIUS
      const z2d = -Math.sin(angle) * PIPE_RADIUS
      const y2d = 0

      const angleZaxis = Math.atan2(curveTan.x, curveTan.y)

      const x3d = x2d * Math.cos(angleZaxis) - y2d * Math.sin(angleZaxis) + pointOnCurve.x
      const y3d = x2d * Math.sin(angleZaxis) + y2d * Math.cos(angleZaxis) - pointOnCurve.y
      const z3d = z2d

      vertex.push(x3d, y3d, z3d)

    }
    if (circleIndex > 0) {
      // it's not the first circle
      for (let p = 0; p < RADIUS_PRECISION; p++) {
        indices.push(
          RADIUS_PRECISION * circleIndex + p,
          RADIUS_PRECISION * (circleIndex - 1) + ((p + 1) % RADIUS_PRECISION),
          RADIUS_PRECISION * (circleIndex - 1) + p,
        )
        indices.push(
          RADIUS_PRECISION * circleIndex + p,
          RADIUS_PRECISION * circleIndex + ((p + 1) % RADIUS_PRECISION),
          RADIUS_PRECISION * (circleIndex - 1) + ((p + 1) % RADIUS_PRECISION),
        )
      }
    }
    circleIndex++
  }
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
