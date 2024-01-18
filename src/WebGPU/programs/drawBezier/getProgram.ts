import shaderCode from "./shader.wgsl"

export default function getProgram(device: GPUDevice, presentationFormat: GPUTextureFormat) {
  const module = device.createShaderModule({
    label: "bezier shader module",
    code: shaderCode,
  });

  const pipeline = device.createRenderPipeline({
    label: 'bezier pipline',
    layout: 'auto',
    primitive: {
      topology: `triangle-strip`,
    },
    vertex: {
      module,
      entryPoint: 'vs',
      buffers: [
        {
          arrayStride: (1 /*t*/) * 4,
          attributes: [
            {shaderLocation: 0, offset: 0, format: 'float32'},
          ] as const,
        },
        {
          arrayStride: (1 /*dir*/) * 4,
          attributes: [
            {shaderLocation: 1, offset: 0, format: 'float32'},
          ] as const,
        },
        {
          arrayStride: (1 /*segmentIndex*/) * 4,
          attributes: [
            {shaderLocation: 2, offset: 0, format: 'uint32'},
          ] as const,
        },
      ],
    },
    fragment: {
      module,
      entryPoint: 'fs',
      targets: [{ format: presentationFormat }],
    },
    depthStencil: {
      depthWriteEnabled: false,
      depthCompare: 'always',
      format: 'depth24plus',
    },
  });

  return function renderBezierCurve(
    pass: GPURenderPassEncoder,
    matrix: Float32Array,
    pointsData: Float32Array,
    tData: Float32Array,
    dirData: Float32Array,
    segmentIndexData: Uint32Array,
    zoom: number,
  ) {
    // for each single segment we need to create a buffer OR more likely better is to combine
    // all of these data into one buffer!

  const storageBufferSize = (pointsData.length/*points*/) * 4;
  const storageBuffer = device.createBuffer({
    label: 'storage points',
    size: storageBufferSize,
    usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
  });


  const uniformBufferSize = (16/*matrix*/ + 4/*zoom*/) * 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
  const kMatrixOffset = 0;
  const kZoomOffset = 16;

  const matrixValue = uniformValues.subarray(kMatrixOffset, kMatrixOffset + 16);
  const zoomValue = uniformValues.subarray(kZoomOffset, kZoomOffset + 1);

  const bindGroup = device.createBindGroup({
    label: 'bezier bind group for object',
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer }},
      { binding: 1, resource: { buffer: storageBuffer }},
    ],
  });


    const tBuffer = device.createBuffer({
      label: 'bezier vertex buffer vertices',
      size: tData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(tBuffer, 0, tData);

    const dirBuffer = device.createBuffer({
      label: 'bezier vertex buffer vertices',
      size: dirData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(dirBuffer, 0, dirData);

    const segmentIndexBuffer = device.createBuffer({
      label: 'bezier vertex buffer vertices',
      size: segmentIndexData.byteLength,
      usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
    });
    device.queue.writeBuffer(segmentIndexBuffer, 0, segmentIndexData); // not sure if it should not be 1

    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, tBuffer); // index of the buffer in the pipline
    pass.setVertexBuffer(1, dirBuffer);
    pass.setVertexBuffer(2, segmentIndexBuffer);

    matrixValue.set(matrix)
    zoomValue.set(new Float32Array([zoom]))
    // p1, p2, p3, p4
    // t = 0, dir = 1
    // t = 0, dir = -1
    // t = 0.5, dir = 1
    // t = 0.5, dir = -1
    // t = 1, dir = 1
    // t = 1, dir = -1
    // change p1, p2, p3, p4

    // upload the uniform values to the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

    device.queue.writeBuffer(storageBuffer, 0, pointsData);

    pass.setBindGroup(0, bindGroup);
    pass.draw(tData.length);
  }
}
