export default async function getDevice() {
  if (!navigator.gpu) {
    throw Error("this browser does not support WebGPU");
  }

  const adapter = await navigator.gpu.requestAdapter();
  

  if (!adapter) {
    throw Error("this browser supports webgpu but it appears disabled");
  }

  const device = await adapter.requestDevice();
  device.lost.then((info) => {
    console.error(`WebGPU device was lost: ${info.message}`);

    if (info.reason !== "destroyed") {
      // reprot issue to the tracking system
      // getDevice(callback);
    }
  });

  return device
}