import shaderCode from "./shader.wgsl"

export default function getProgram(device: GPUDevice, presentationFormat: GPUTextureFormat) {
  const module = device.createShaderModule({
    label: "plane shader module",
    code: shaderCode,
  });

  const pipeline = device.createRenderPipeline({
    label: 'plane pipline',
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vs',
      buffers: [
        {
          // position + texture coords
          arrayStride: (2 + 2) * 4, // (2) floats, 4 bytes each
          attributes: [
            {shaderLocation: 0, offset: 0, format: 'float32x2'},  // position
            {shaderLocation: 1, offset: 2 * 4, format: 'float32x2'},  // texture coord
          ] as const,
        },
      ],
    },
    fragment: {
      module,
      entryPoint: 'fs',
      targets: [{ format: presentationFormat }],
    },
  });




  return function renderDrawPlane(
    pass: GPURenderPassEncoder,
    matrix: Float32Array,
    texture: GPUTexture,
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
  const uniformBufferSize = (12) * 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
  const kMatrixOffset = 0;

  const matrixValue = uniformValues.subarray(kMatrixOffset, kMatrixOffset + 12);

  const vertexData = new Float32Array([
    100, 100,     0, 0,
    100, 500,     0, 1,
    500, 100,     1, 0,
    500, 500,     1, 1,
  ])
  const indexData = new Uint32Array([0, 1, 2, 1, 3, 2])
  const numVertices = 6
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
      { binding: 0, resource: sampler },
      { binding: 1, resource: texture.createView() },
      { binding: 2, resource: { buffer: uniformBuffer }},
    ],
  });

    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.setIndexBuffer(indexBuffer, 'uint32');

    matrixValue.set(matrix)
    // mat3.translate(matrixValue, [x, 0], matrixValue);
    // mat3.scale(matrixValue, [1.1, 1.1], matrixValue);

    // upload the uniform values to the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

    pass.setBindGroup(0, bindGroup);
    pass.drawIndexed(numVertices);
  }
}
