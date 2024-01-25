import getBezierPos from "./getBezierPos";
import getBezierTan from "./getBezierTan";
import distancePointToLine from "./distancePointToLine";
import getDistance from "./getDistance";
import fitCurve from "./fitCurve";
import getCurveLength from "./getCurveLength";
import atNormIndex from "utils/atNormIndex";
import resizeArray from "utils/resizeArray";

export interface WidthPoint {
  progress: number;
  offset: number;
}

export const DEFAULT_OFFSET = 80;
const TEX_COORD_PRECISION = 10;
const SIMPLIFICATION_FACTOR = 400;

export interface Segment {
  controlPoints: [Point, Point, Point, Point]; // knot, control point, control point, knot
  // all of the them be called control points, knot is a special type because curve go though that point
  lengths: number[]; // progressive lengths
  totalLength: number
}





export default class Path {
  private inputPoints: Point[]; // this is exactly path from user input
  public segments: Segment[];
  private draftPoint: Point | null;
  private withinDirection: null | ((p: Point) => boolean);
  public segmentsUpdate: number; // helper flag, so we don't need to deeply compare segments to know if rerender is needed
  public constTs: number[];

  constructor() {
    this.inputPoints = [];
    this.segments = [];
    this.draftPoint = null; // maybe it can be connected with preview point?
    this.withinDirection = null;
    this.segmentsUpdate = 0;
    this.constTs = []
  }

  public getPosAndTan(progress: number): [Point, Point] {
    // progress measured in segments

    const segmentIndex = Math.floor(progress);
    const [safeSegmentIndex, t] =
      segmentIndex === this.segments.length // progress at the very end of the path is equal this.segments.length
        ? [this.segments.length - 1, 1]
        : [segmentIndex, progress % 1];
    const { controlPoints } = this.segments[safeSegmentIndex];
    const pointOnCurve = getBezierPos(...controlPoints, t);
    const curveTan = getBezierTan(...controlPoints, t);

    return [pointOnCurve, curveTan];
  }

  public addControlPoint(pointer: Point, last = false) {
    const { inputPoints, draftPoint, withinDirection } = this;

    if (inputPoints.length === 0 || last) {
      inputPoints.push(pointer);
      this.draftPoint = null;
      if (last) {
        this.updateControlPoints();
      }
      return; // no rerender, no draftPoint update
    }

    const lastInput = inputPoints[inputPoints.length - 1];
    if (
      getDistance(lastInput, pointer) > 10 &&
      (withinDirection === null || !withinDirection(pointer))
    ) {
      if (withinDirection && draftPoint) {
        // draftPoint should be ALWAYS provided here, so it's just added because of TS
        inputPoints.push(draftPoint);
      }
      this.withinDirection = (p: Point) =>
        distancePointToLine(p, lastInput, pointer) < 5;
    }

    this.draftPoint = pointer;
    this.updateControlPoints();
  }

  private updateControlPoints() {
    const pointsAsArray = this.inputPoints.map((p) => [p.x, p.y]);

    if (
      this.draftPoint &&
      this.draftPoint.x !== pointsAsArray[pointsAsArray.length - 1][0] &&
      this.draftPoint.y !== pointsAsArray[pointsAsArray.length - 1][1]
    ) {
      pointsAsArray.push([this.draftPoint.x, this.draftPoint.y]);
    }

    const fitted = fitCurve(
      pointsAsArray,
      10, // this.draftPoint ? 10 : SIMPLIFICATION_FACTOR
    );
    if (fitted.length === 0) return;

    this.segments = fitted.map<Segment>((bezierCurve) => {
      const controlPoints = bezierCurve.map(([x, y]) => {
        if (Number.isNaN(x) || Number.isNaN(y)) {
          console.log(fitted, pointsAsArray, this.draftPoint)
          debugger
        }
        return {
          x,
         y,
        }
      }) as Segment["controlPoints"];
      const lengths = getCurveLength(...controlPoints, TEX_COORD_PRECISION);
      const totalLength = lengths.reduce((acc, length) => acc + length, 0)

      return {
        controlPoints,
        lengths,
        totalLength,
      };
    });

    const PRECISION = 0.75 // smaller means less "t" samples
    const constTs: number[] = [0]
    let visitedTotalT = 0


    this.segments.forEach(segment => {
      
      if (segment.totalLength * PRECISION < segment.lengths.length * 1.5) {
        // we dont have enough slots for t sampels to interpolate lengths one by one
        // means, there is too much lengths for such a small total distance of this segment
        constTs.push(
          ...resizeArray(
            [visitedTotalT, visitedTotalT + 1.0],
            Math.round(segment.totalLength * PRECISION)
          ).slice(1)
        )
  
        visitedTotalT += 1.0
        return
      }

      const eachSegmentStepT = 1 / segment.lengths.length

      segment.lengths.forEach(length => {
        constTs.push(
          ...resizeArray(
            [visitedTotalT, visitedTotalT + eachSegmentStepT],
            Math.max(2, Math.round(length * PRECISION)) // length needs to be at least 2!
          ).slice(1)
        )

        visitedTotalT += eachSegmentStepT
      })
    })

    this.constTs = constTs
  }

  public getRelativeT(progress: number/*<0, 1>*/) {
    if (progress >= 1) return this.segments.length

    return atNormIndex(this.constTs, progress)
  }
}
