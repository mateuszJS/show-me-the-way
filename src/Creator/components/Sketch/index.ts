import State from "State";
import { drawBezier } from "WebGPU/programs/initPrograms";
import getTrianglesNumber from "./getTrianglesNumber";
import { Segment } from "Creator/components/Path/Path";

export default class Sketch {
  constructor() {
  }

  private drawSegment = (
    segment: Segment,
    segmentIndex: number,
    collectedTStart: number[],
    collectedTEnd: number[],
    collectedDirStart: number[],
    collectedDirEnd: number[],
    collectedSegmentIndexStart: number[],
    collectedSegmentIndexEnd: number[],
    collectedPoints: number[],
  ) => {
      const { controlPoints, lengths } = segment;

      const iter = getTrianglesNumber(segment);
        
      // iter needs to be even
      const halfIter = iter / 2;

      const t = Array.from({ length: halfIter }, (_, i) => i / (halfIter - 1));
      t[1] = 0; // two points of first triangle needs to be at 0, otherwise line instead looking like this  □=======□ looks like <========>
      t[t.length - 2] = 1; // same here, two last point of last triangle needs to be 1
      collectedTStart.push(...t)
      collectedTEnd.push(...t)

      const dir1 = Array.from({ length: halfIter }, (_, i) => (i % 2 ? 1 : 0));
      const dir2 = Array.from({ length: halfIter }, (_, i) => (i % 2 ? -1 : 0));
      collectedDirStart.push(...dir1);
      collectedDirEnd.push(...dir2);
      collectedSegmentIndexStart.push(...Array(halfIter).fill(segmentIndex))
      collectedSegmentIndexEnd.push(...Array(halfIter).fill(segmentIndex))

      collectedPoints.push(...controlPoints.flatMap(p => [p.x, p.y]))
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
        new Uint32Array(collectedSegmentIndexStart.concat(collectedSegmentIndexEnd.reverse())),
        state.zoom
      )
    }
  }
}
