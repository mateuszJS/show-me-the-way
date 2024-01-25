export default function atNormIndex(arr: number[], normIndex: number/*float <0,1>*/) {
  const indexFloat = normIndex * (arr.length - 1)
  const bottomIndex = Math.floor(indexFloat)
  const topIndex = Math.ceil(indexFloat)

  const diff = indexFloat - bottomIndex // <0, 1>
  const interpolatedValue =
    (1 - diff) * arr[bottomIndex] + diff * arr[topIndex]

  return interpolatedValue
}