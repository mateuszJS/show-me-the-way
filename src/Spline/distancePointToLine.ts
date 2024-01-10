export default function distancePointToLine(p: Point, l1: Point, l2: Point) {
  let A = l2.y - l1.y;
  let B = l1.x - l2.x;
  let C = l1.y * (l2.x - l1.x) - l1.x * (l2.y - l1.y);
  return Math.abs(A * p.x + B * p.y + C) / Math.sqrt(A * A + B * B);
}
