import Path from "Creator/components/Path/Path";

const RADIUS_PRECISION = 18 // bigger is more precise, integers
const LENGTH_PRECISION = 0.05 // smaller is more precise, floats
const INNER_PIPE_RADIUS = 3
const OUTER_PIPE_RADIUS = 4.2

function addPipeVertices(
  path: Path,
  maxT: number,
  radius: number,
  precisionRadius: number,
  vertices: number[],
  indices: number[],
) {
  const indexStart = Math.round(vertices.length / 3)
  let circleIndex = 0

  for (let t = 0; t < maxT; t += LENGTH_PRECISION) {
    for (let p = 0; p < precisionRadius; p++) { 
      const angle = p * 2 * Math.PI / precisionRadius

      const roundedT = t > maxT - LENGTH_PRECISION ? maxT : t
      // just to make sure we always round up very last circle to very last POSSIBLE circle
      
      const [pointOnCurve, curveTan] = path.getPosAndTan(roundedT)
      const x2d = Math.cos(angle) * radius
      const z2d = -Math.sin(angle) * radius
      const y2d = 0

      const angleZaxis = Math.atan2(curveTan.x, curveTan.y)

      const x3d = x2d * Math.cos(angleZaxis) - y2d * Math.sin(angleZaxis) + pointOnCurve.x
      const y3d = x2d * Math.sin(angleZaxis) + y2d * Math.cos(angleZaxis) - pointOnCurve.y
      const z3d = z2d

      vertices.push(x3d, y3d, z3d)

    }
    // on the start should be just +54 verticles and zeor incides
    // but indices are added, same nubmer as current one
    if (circleIndex > 0) {
      // it's not the first circle
      for (let p = 0; p < precisionRadius; p++) {
        indices.push(
          indexStart + precisionRadius * circleIndex + p,
          indexStart + precisionRadius * (circleIndex - 1) + ((p + 1) % precisionRadius),
          indexStart + precisionRadius * (circleIndex - 1) + p,
        )
        indices.push(
          indexStart + precisionRadius * circleIndex + p,
          indexStart + precisionRadius * circleIndex + ((p + 1) % precisionRadius),
          indexStart + precisionRadius * (circleIndex - 1) + ((p + 1) % precisionRadius),
        )
      }
    }
    circleIndex++
  }
  return [vertices, indices] 
}
export default function getVerticies(path: Path, maxT: number) {
  const vertices: number[] = []
  const indices: number[] = []
  addPipeVertices(path, Math.max(0, maxT - 1), OUTER_PIPE_RADIUS, RADIUS_PRECISION - 1, vertices, indices)
  addPipeVertices(path, maxT, INNER_PIPE_RADIUS, RADIUS_PRECISION, vertices, indices)
  return [vertices, indices]
}
