let depthTexture: GPUTexture | undefined;

export default function getRenderDescriptor(
  ctx: GPUCanvasContext,
  device: GPUDevice,
): GPURenderPassDescriptor {
  const canvasTexture = ctx.getCurrentTexture();

  if (!depthTexture ||
    depthTexture.width !== canvasTexture.width ||
    depthTexture.height !== canvasTexture.height
  ) {
    if (depthTexture) {
      depthTexture.destroy();
    }
    depthTexture = device.createTexture({
      size: [canvasTexture.width, canvasTexture.height],
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }
  
  return {
    // describe which textures we want to raw to and how use them
    label: "our basic canvas renderPass",
    colorAttachments: [
      {
        view: canvasTexture.createView(),
        // clearValue: [0, 0, 0, 1],
        loadOp: "clear", // before rendering clear the texture to value "clear". Other option is "load" to load existing content of the texture into GPU so we can draw over it
        storeOp: "store", // to store the result of what we draw, other option is "discard"
      } as const,
    ],
    depthStencilAttachment: {
      view: depthTexture.createView(), // placholder to calm down TS
      depthClearValue: 1.0,
      depthLoadOp: 'clear',
      depthStoreOp: 'store',
    } as const,
  };
}