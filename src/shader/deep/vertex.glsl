precision lowp float;
// 原生raw不会自动将 position 等这些值自动传入
attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

varying vec2 vUv;  // 用于将uv传递给片元着色器

void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position,1); 
  gl_Position = projectionMatrix * viewMatrix * modelPosition;
}