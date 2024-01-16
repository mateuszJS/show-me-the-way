import shaderCode from "./shader.wgsl"

export default function getProgram(device: GPUDevice, presentationFormat: GPUTextureFormat) {
  const module = device.createShaderModule({
    label: "3d model shader module",
    code: shaderCode,
  });

  const pipeline = device.createRenderPipeline({
    label: '3d model pipline',
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vs',
      buffers: [
        {
          // position + texture coords
          // arrayStride: (3) * 4, // (3) floats, 4 bytes each
          arrayStride: (3) * 4, // (3) floats, 4 bytes each
          attributes: [
            {shaderLocation: 0, offset: 0, format: 'float32x3'},  // position
          ] as const,
        },
      ],
    },
    fragment: {
      module,
      entryPoint: 'fs',
      targets: [{ format: presentationFormat }],
    },
    primitive: {
      cullMode: 'back',
    },
    depthStencil: {
      depthWriteEnabled: true,
      depthCompare: 'less',
      format: 'depth24plus',
    },
  });




  return function renderDraw3dModel(
    pass: GPURenderPassEncoder,
    matrix: Float32Array,
    vertexData: Float32Array,
    indexData: Uint32Array,
  ) {
    const sampler = device.createSampler({
      magFilter: "linear",
      minFilter: 'linear',
    }); // responsible for reading data from texture, blending them if you need bigger texture
  

    // device.queue.copyExternalImageToTexture(
    //   { source, flipY: true },
    //   { texture },
    //   { width: source.width, height: source.height },
    // );
  // matrix
  const uniformBufferSize = (16) * 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
  const kMatrixOffset = 0;

  const matrixValue = uniformValues.subarray(kMatrixOffset, kMatrixOffset + 16);

  const numVertices = indexData.length
  const vertexBuffer = device.createBuffer({
    label: 'vertex buffer vertices',
    size: vertexData.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(vertexBuffer, 0, vertexData);
  const indexBuffer = device.createBuffer({
    label: 'index buffer',
    size: indexData.byteLength,
    usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(indexBuffer, 0, indexData);

  const bindGroup = device.createBindGroup({
    label: 'bind group for object',
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer }},
    ],
  });

    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.setIndexBuffer(indexBuffer, 'uint32');

    matrixValue.set(matrix)

    // upload the uniform values to the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

    pass.setBindGroup(0, bindGroup);
    pass.drawIndexed(numVertices);
  }
}
