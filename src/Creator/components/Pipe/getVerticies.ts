import Path from "Creator/components/Path/Path";
import vec3 from "utils/vec3";

const RADIUS_PRECISION = 18 // bigger is more precise, integers
const LENGTH_PRECISION = 0.05 // smaller is more precise, floats
const INNER_PIPE_RADIUS = 3
const OUTER_PIPE_RADIUS = 4.2
const VALS_PER_VERTEX = 6

function addPipeCircleVertices(
  path: Path,
  t: number,
  radius: number,
  precisionRadius: number,
  vertices: number[],
  indices: number[],
  isConnectedWithPrev: boolean,
  shiftDistance = 0,
  normAngleShift: number | null = null,
) {
  const startIndex = Math.round(vertices.length / VALS_PER_VERTEX)

  for (let p = 0; p < precisionRadius; p++) { 
    const angle = p * 2 * Math.PI / precisionRadius
    const [pointOnCurve, curveTan] = path.getPosAndTan(t)
    const angleZaxis = Math.atan2(curveTan.x, curveTan.y)

    {
      // calculate position
      const x2d = Math.cos(angle) * radius
      const z2d = -Math.sin(angle) * radius
      const y2d = -shiftDistance

      const x3d = x2d * Math.cos(angleZaxis) - y2d * Math.sin(angleZaxis)
      const y3d = x2d * Math.sin(angleZaxis) + y2d * Math.cos(angleZaxis)
      const z3d = z2d

      vertices.push(
        x3d + pointOnCurve.x,
        y3d - pointOnCurve.y,
        z3d
      )
    }
    {
      // TODO: recude code, we use very similar values here
      // calculate normals
      const shiftNormDistance = normAngleShift === null
        ? 0
        : radius * Math.cos(normAngleShift)

      const x2d = Math.cos(angle) * radius
      const z2d = -Math.sin(angle) * radius
      const y2d = -shiftNormDistance

      const x3d = x2d * Math.cos(angleZaxis) - y2d * Math.sin(angleZaxis)
      const y3d = x2d * Math.sin(angleZaxis) + y2d * Math.cos(angleZaxis)
      const z3d = z2d

      const norm = vec3.normalize([x3d, y3d, z3d])
  
      vertices.push(norm[0], norm[1], norm[2])
    }
  }
  // on the start should be just +54 verticles and zeor incides
  // but indices are added, same nubmer as current one
  if (isConnectedWithPrev) {
    // it's not the first circle
    const currCircleIndex = startIndex
    const prevCircleIndex = startIndex - precisionRadius
    for (let p = 0; p < precisionRadius; p++) {
      indices.push(
        currCircleIndex + p,
        prevCircleIndex + ((p + 1) % precisionRadius),
        prevCircleIndex + p,
      )
      indices.push(
        currCircleIndex + p,
        currCircleIndex + ((p + 1) % precisionRadius),
        prevCircleIndex + ((p + 1) % precisionRadius),
      )
    }
  }
}

function addPipeVertices(
  path: Path,
  maxT: number,
  innerRadius: number,
  outerRadius: number,
  precisionRadius: number,
  vertices: number[],
  indices: number[],
) {
  for (let t = 0; t < maxT; t += LENGTH_PRECISION) {
    const roundedT = t > maxT - LENGTH_PRECISION ? maxT : t
    // just to make sure we always round up very last circle to very last POSSIBLE circle
    // we can do better btu addign one mroe, isntead of doing "math.floor"
    
    addPipeCircleVertices(
      path,
      roundedT,
      outerRadius,
      precisionRadius,
      vertices,
      indices,
      t > 0,
    )
  }

  addPipeCircleVertices(
    path,
    maxT,
    outerRadius - .2,
    precisionRadius,
    vertices,
    indices,
    true,
    .5,
    (Math.PI/2) * 0.5
  )

  addPipeCircleVertices(
    path,
    maxT,
    outerRadius - .3,
    precisionRadius,
    vertices,
    indices,
    true,
    .7,
    0,
  )

  addPipeCircleVertices(
    path,
    maxT,
    outerRadius - 1,
    precisionRadius,
    vertices,
    indices,
    true,
    .7,
    0,
  )

  addPipeCircleVertices(
    path,
    maxT,
    outerRadius - 1.2,
    precisionRadius,
    vertices,
    indices,
    true,
    .5,
    -Math.PI * 1/4
  )

  // addPipeCircleVertices(
  //   path,
  //   maxT,
  //   outerRadius - 0.5,
  //   precisionRadius,
  //   vertices,
  //   indices,
  //   true,
  //   -1
  // )

  return [vertices, indices] 
}
export default function getVerticies(path: Path, progress: number) {
  const vertices: number[] = []
  const indices: number[] = []

  if (progress > 0.05) {
    addPipeVertices(
      path,
      Math.max(0, path.getRelativeT(progress - 0.02)),
      INNER_PIPE_RADIUS,
      OUTER_PIPE_RADIUS,
      RADIUS_PRECISION - 1,
      vertices,
      indices
    )
  }
  addPipeVertices(
    path,
    path.getRelativeT(progress),
    INNER_PIPE_RADIUS - 1,
    INNER_PIPE_RADIUS,
    RADIUS_PRECISION,
    vertices,
    indices
  )
  return [vertices, indices]
}
