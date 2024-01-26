import shaderCode from "./shader.wgsl"

interface Uniforms {
  worldViewProjection: Float32Array,
  normalMatrix: Float32Array,
  lightColor: Float32Array,
  lightDirection: Float32Array
}

export default function getProgram(device: GPUDevice, presentationFormat: GPUTextureFormat) {
  const module = device.createShaderModule({
    label: "3d model light shader module",
    code: shaderCode,
  });

  const pipeline = device.createRenderPipeline({
    label: '3d model light pipline',
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vs',
      buffers: [
        {
          // position + texture coords
          // arrayStride: (3) * 4, // (3) floats, 4 bytes each
          arrayStride: (3 + 3) * 4, // (3) floats, 4 bytes each
          attributes: [
            {shaderLocation: 0, offset: 0, format: 'float32x3'},  // position
            {shaderLocation: 1, offset: 12, format: 'float32x3'},  // normal
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




  return function renderDraw3dModelLight(
    pass: GPURenderPassEncoder,
    uniform: Uniforms,
    vertexData: Float32Array,
    indexData: Uint32Array,
  ) {
    const {
      worldViewProjection,
      normalMatrix,
      lightColor,
      lightDirection,
    } = uniform
  // matrix
  const uniformBufferSize = (12 + 16 + 4 + 4) * 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
  const kNormalMatrixOffset = 0;
  const kWorldViewProjectionOffset = 12;
  const kColorOffset = 28;
  const kLightDirectionOffset = 32;

  const normalMatrixValue = uniformValues.subarray(kNormalMatrixOffset, kNormalMatrixOffset + 12);
  const worldViewProjectionValue = uniformValues.subarray(
      kWorldViewProjectionOffset, kWorldViewProjectionOffset + 16);
  const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);
  const lightDirectionValue =
      uniformValues.subarray(kLightDirectionOffset, kLightDirectionOffset + 3);

  const bindGroup = device.createBindGroup({
    label: 'bind group for object',
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      { binding: 0, resource: { buffer: uniformBuffer }},
    ],
  });

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



    pass.setPipeline(pipeline);
    pass.setVertexBuffer(0, vertexBuffer);
    pass.setIndexBuffer(indexBuffer, 'uint32');


    normalMatrixValue.set(normalMatrix)
    worldViewProjectionValue.set(worldViewProjection)
    colorValue.set(lightColor)
    lightDirectionValue.set(lightDirection)

    // upload the uniform values to the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

    pass.setBindGroup(0, bindGroup);
    pass.drawIndexed(numVertices);
  }
}
