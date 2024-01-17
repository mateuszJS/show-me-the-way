import m3 from './m3'

export default function canvasSizeObserver(
  canvas: HTMLCanvasElement,
  device: GPUDevice,
  callback: VoidFunction
) {
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const canvas = entry.target as HTMLCanvasElement;
      const width = entry.contentBoxSize[0].inlineSize | 0;
      const height = entry.contentBoxSize[0].blockSize | 0;
      canvas.width = Math.max(
        1,
        Math.min(width, device.limits.maxTextureDimension2D)
      );
      canvas.height = Math.max(
        1,
        Math.min(height, device.limits.maxTextureDimension2D)
      );
      callback()
    }
  });
  observer.observe(canvas);
}
