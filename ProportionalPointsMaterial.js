const Shader = {}

Shader.vertexShader = `
uniform vec3 cursorPosition;
uniform float cursorSize;
uniform vec3 cursorTransform;

varying float strength;
varying float N;
varying vec4 modelViewPosition;
void main() {
  vec3 transformedNormal = normalMatrix * normal;
  vec3 light = vec3(100.0, 100.0, 100.0);
  float diffuseCoefficient = max(0.0, dot(normalize(transformedNormal), normalize(light)));
  N = diffuseCoefficient;
  
  gl_PointSize = 5.0;
  strength = max(0.0, 1.0 - distance(position, cursorPosition) / cursorSize);
  modelViewPosition = modelViewMatrix * vec4(position + cursorTransform * strength, 1.0);
	gl_Position = projectionMatrix * modelViewPosition;
  gl_PointSize = 2.0 + strength * 3.0;
}
`

Shader.pointsFragmentShader = `
varying float strength;
void main() {
  vec4 inactiveColor = vec4(1.0, 0.0, 0.0, 0.0);
  vec4 activeColor = vec4(1.0, 0.0, 0.0, 1.0);
  gl_FragColor = mix(inactiveColor, activeColor, strength);
}
`

Shader.meshFragmentShader = `
#extension GL_OES_standard_derivatives : enable
varying float strength;
varying vec4 modelViewPosition;

vec3 normals(vec3 pos) {
  vec3 fdx = dFdx(pos);
  vec3 fdy = dFdy(pos);
  return normalize(cross(fdx, fdy));
}

void main() {
  vec3 normal = normals(-modelViewPosition.xyz);
  float ambient = 0.1;
  float lit = dot(normal, vec3(1.0, 1.0, 1.0));
  gl_FragColor = vec4(max(ambient, lit));
}
`


module.exports = Shader