struct Uniforms {
  normalMatrix: mat3x3f,
  worldViewProjection: mat4x4f,
  lightColor: vec4f,
  lightDirection: vec3f,
};

struct Vertex {
  @location(0) position: vec4f,
  @location(1) normal: vec3f,
};

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
  @location(1) normal: vec3f,
};

@group(0) @binding(0) var<uniform> uni: Uniforms;

@vertex fn vs(
  vert: Vertex,
  @builtin(vertex_index) vertexIndex : u32,
  // @builtin(instance_index) instanceIndex: u32
  ) -> VSOutput {
    var vsOut: VSOutput;
    vsOut.position = uni.worldViewProjection * vert.position;
    vsOut.normal = uni.normalMatrix * vert.normal;
    vsOut.color = vec4f(f32(vertexIndex) % 3, (f32(vertexIndex) + 1) % 3, (f32(vertexIndex) + 2) % 3, 1);

    return vsOut;
}


@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
  // Because vsOut.normal is an inter-stage variable 
  // it's interpolated so it will not be a unit vector.
  // Normalizing it will make it a unit vector again
  let normal = normalize(vsOut.normal);
  
  // Compute the light by taking the dot product
  // of the normal to the light's reverse direction
  let light = dot(normal, -uni.lightDirection);
  
  // Lets multiply just the color portion (not the alpha)
  // by the light
  let color = vec3f(0.23) + uni.lightColor.rgb * light;
  // let color = vsOut.color.rgb * 0.5 + uni.lightColor.rgb * light;
  return vec4f(color, vsOut.color.a);
}
