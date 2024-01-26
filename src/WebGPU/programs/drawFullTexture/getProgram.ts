import mat3 from "WebGPU/m3";
import shaderCode from "./shader.wgsl"

export default function getProgram(device: GPUDevice, presentationFormat: GPUTextureFormat) {
  
  const fullscreenQuadPipeline = device.createRenderPipeline({
    layout: 'auto',
    vertex: {
      module: device.createShaderModule({
        code: shaderCode,
      }),
      entryPoint: 'vert_main',
    },
    fragment: {
      module: device.createShaderModule({
        code: shaderCode,
      }),
      entryPoint: 'frag_main',
      targets: [
        {
          format: presentationFormat,
        },
      ],
    },
    primitive: {
      topology: 'triangle-list',
    },
  });


  return function renderDrawFullTexture(
    pass: GPURenderPassEncoder,
    texture: GPUTexture
  ) {
    const sampler = device.createSampler({
      magFilter: 'linear',
      minFilter: 'linear',
    });
    const showResultBindGroup = device.createBindGroup({
      layout: fullscreenQuadPipeline.getBindGroupLayout(0),
      entries: [
        {
          binding: 0,
          resource: sampler,
        },
        {
          binding: 1,
          resource: texture.createView(),
        },
      ],
    });

    pass.setPipeline(fullscreenQuadPipeline);
    pass.setBindGroup(0, showResultBindGroup);
    pass.draw(6);
    pass.end();
  }
}
