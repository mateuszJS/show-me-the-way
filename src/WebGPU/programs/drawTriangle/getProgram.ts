import mat3 from "WebGPU/m3";
import shaderCode from "./shader.wgsl"

export default function getProgram(device: GPUDevice, presentationFormat: GPUTextureFormat) {
  const module = device.createShaderModule({
    label: "triangle shader module",
    code: shaderCode,
  });

  const pipeline = device.createRenderPipeline({
    label: 'triangle pipline',
    layout: 'auto',
    vertex: {
      module,
      entryPoint: 'vs',
      buffers: [
        {
          arrayStride: (2) * 4, // (2) floats, 4 bytes each
          attributes: [
            {shaderLocation: 0, offset: 0, format: 'float32x2'},  // position
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


  // const renderPassDescriptor: GPURenderPassDescriptor = {
  //   label: 'our basic canvas renderPass',
  //   colorAttachments: [
  //     {
  //       view: context.getCurrentTexture().createView(),
  //       loadOp: 'clear',
  //       storeOp: 'store',
  //     } as const,
  //   ],
  // };

  return function renderDrawTriangle(
    pass: GPURenderPassEncoder,
    matrix: Float32Array,
    x: number,
  ) {

  // color, matrix
  const uniformBufferSize = (4 + 12) * 4;
  const uniformBuffer = device.createBuffer({
    label: 'uniforms',
    size: uniformBufferSize,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformValues = new Float32Array(uniformBufferSize / 4);

  // offsets to the various uniform values in float32 indices
  const kColorOffset = 0;
  const kMatrixOffset = 4;

  const colorValue = uniformValues.subarray(kColorOffset, kColorOffset + 4);
  const matrixValue = uniformValues.subarray(kMatrixOffset, kMatrixOffset + 12);

  // The color will not change so let's set it once at init time
  colorValue.set([Math.random(), Math.random(), Math.random(), 1]);

  const vertexData = new Float32Array([500, 100, 800, 400, 200, 400])
  const indexData = new Uint32Array([0, 1, 2])
  const numVertices = 3
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
    mat3.translate(matrixValue, [x, 0], matrixValue);
    // mat3.scale(matrixValue, [1.1, 1.1], matrixValue);

    // upload the uniform values to the uniform buffer
    device.queue.writeBuffer(uniformBuffer, 0, uniformValues);

    pass.setBindGroup(0, bindGroup);
    pass.drawIndexed(numVertices);

    // pass.end();

    // const commandBuffer = encoder.finish();
    // device.queue.submit([commandBuffer]);
  }
}
