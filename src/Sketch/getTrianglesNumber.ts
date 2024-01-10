import { Segment } from "Path/Path";
import getAngleDiff from "utils/getAngleDiff";
import getAngle from "utils/getAngle";

export default function getTrianglesNumber(
  { controlPoints, lengths }: Segment
) {
  const p1p2Angle = getAngle(controlPoints[0], controlPoints[1]);
  const p3p4Angle = getAngle(controlPoints[2], controlPoints[3]);
  const p1p4Angle = getAngle(controlPoints[0], controlPoints[3]);
  const angleDiffP1 = getAngleDiff(p1p2Angle, p1p4Angle); // 0 - 0.46
  const angleDiffP4 = getAngleDiff(p3p4Angle, p1p4Angle); // 0 - 0.46
  const biggerAngleDiff = Math.max(angleDiffP1, angleDiffP4);
  // also it's important how close are two width point to each other! Closer means we nee more triangles!
  // We should find the most extreme two width points within the segment
  const segmentLength = lengths[lengths.length - 1];
  const lengthFactor = Math.ceil(segmentLength / 300);
  const requiredTrianglesByAngle =
    4 + Math.round(biggerAngleDiff * 20 * lengthFactor); // at least half >= 4

  const triangles = requiredTrianglesByAngle;

  const halfIter = triangles + ((triangles + 1) % 2); // must be odd
  const iter = halfIter * 2; // must be even

  return iter;
}
