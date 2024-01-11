struct Uniforms {
  matrix: mat3x3f,
};

struct Vertex {
  @location(0) position: vec2f,
  @location(1) texcoord: vec2f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) texcoord: vec2f,
};

@group(0) @binding(2) var<uniform> uni: Uniforms;

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;

  let clipSpace = (uni.matrix * vec3f(vert.position, 1)).xy;
  vsOut.position = vec4f(clipSpace, 0.0, 1.0);
  vsOut.texcoord = vert.texcoord;
  return vsOut;
}

@group(0) @binding(0) var ourSampler: sampler;
@group(0) @binding(1) var ourTexture: texture_2d<f32>;

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  return textureSample(ourTexture, ourSampler, vsOut.texcoord);
}
