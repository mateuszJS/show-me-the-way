import State from "State";
import { drawBezier } from "WebGPU/programs/initPrograms";

export default class Background {
  constructor() {
    
  }

  public render(
    state: State,
    pass: GPURenderPassEncoder,
    matrix: Float32Array
  ) {
    if (state.path.segments.length > 0) {
      const collectedTStart: number[] = []
      const collectedTEnd: number[] = []
      const collectedDirStart: number[] = []
      const collectedDirEnd: number[] = []
      const collectedSegmentIndexStart: number[] = []
      const collectedSegmentIndexEnd: number[] = []
      const collectedPoints: number[] = []

      state.path.segments.forEach((segment, index) => (
        this.drawSegment(
          segment,
          index,
          collectedTStart,
          collectedTEnd,
          collectedDirStart,
          collectedDirEnd,
          collectedSegmentIndexStart,
          collectedSegmentIndexEnd,
          collectedPoints
        )
      ))

      drawBezier(
        pass,
        matrix,
        new Float32Array(collectedPoints),
        new Float32Array(collectedTStart.concat(collectedTEnd.reverse())),
        new Float32Array(collectedDirStart.concat(collectedDirEnd.reverse())),
        new Uint32Array(collectedSegmentIndexStart.concat(collectedSegmentIndexEnd.reverse()))
      )
    }
  }
}
