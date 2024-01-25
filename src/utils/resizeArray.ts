import atNormIndex from "./atNormIndex"

// new length needs to be at least 2
// arr.length needs to be at least 2
export default function resizeArray(arr: number[], newLength: number) {
  const newArr = [] // copy first element

  for (let i = 0; i < newLength; i++) {
    const normIndex = i / (newLength - 1)
    newArr.push(atNormIndex(arr, normIndex))
  }

  return newArr
}