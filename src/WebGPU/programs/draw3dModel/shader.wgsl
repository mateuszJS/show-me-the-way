struct Uniforms {
  matrix: mat4x4f,
};

struct Vertex {
  @location(0) position: vec4f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;

@vertex fn vs(
  vert: Vertex,
  @builtin(vertex_index) vertexIndex : u32,
  // @builtin(instance_index) instanceIndex: u32
  ) -> VSOutput {
  var vsOut: VSOutput;
  vsOut.position = uni.matrix * vert.position;
  vsOut.color = vec4f(f32(vertexIndex) % 3, (f32(vertexIndex) + 1) % 3, (f32(vertexIndex) + 2) % 3, 1);
  return vsOut;
}


@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  return vsOut.color;
}
