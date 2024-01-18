struct Uniforms {
  matrix: mat4x4f,
  zoom: f32,
};

struct Vertex {
  @location(0) t: f32,
  @location(1) dir: f32,
  @location(2) segmentIndex: u32,
};

@group(0) @binding(0) var<uniform> u: Uniforms;

@group(0) @binding(1) var<storage> points: array<vec2f>;

struct VSOutput {
  @builtin(position) position: vec4f,
  @location(0) color: vec4f,
};

@vertex fn vs(vert: Vertex) -> VSOutput {
  var vsOut: VSOutput;
  
  let p1 = points[vert.segmentIndex * 4 + 0];
  let p2 = points[vert.segmentIndex * 4 + 1];
  let p3 = points[vert.segmentIndex * 4 + 2];
  let p4 = points[vert.segmentIndex * 4 + 3];

  let t2 = vert.t * vert.t;
  let one_minus_t = 1.0 - vert.t;
  let one_minus_t2 = one_minus_t * one_minus_t;
  let pos = p1 * one_minus_t2 * one_minus_t + p2 * 3.0 * vert.t * one_minus_t2 + p3 * 3.0 * t2 * one_minus_t + p4 * t2 * vert.t;

  let angle = one_minus_t2 * (p2 - p1) + 2.0 * vert.t * one_minus_t * (p3 - p2) + t2 * (p4 - p3);
  let angleNorm = normalize(angle) * 5 / u.zoom;
  let transPos = vec2(pos.x - angleNorm.y * vert.dir, pos.y + angleNorm.x * vert.dir);
  let clipSpace = (u.matrix * vec4f(transPos, 1, 1));
  vsOut.position = clipSpace;
  vsOut.color = vec4f(f32(vert.segmentIndex) % 3, (f32(vert.segmentIndex) + 1) % 3, (f32(vert.segmentIndex) + 2) % 3, 1);

  return vsOut;
}

@fragment fn fs(vsOut: VSOutput) -> @location(0) vec4f {
    return vsOut.color;
}
