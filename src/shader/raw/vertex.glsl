precision lowp float;
// 原生raw不会自动将 position 等这些值自动传入
attribute vec3 position;
attribute vec2 uv;

uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat4 modelMatrix;

uniform float utime;  // 获取传递进来的时间

varying vec2 vUv;  // 用于将uv传递给片元着色器
//  必须给浮点数设置精度 (一般在代码顶部设置)
// highp -2^16  ~ 2^16
// mediump -2^10  ~ 2^10
// lowp -2^8  ~ 2^8

varying float vElevation; // 用于传递Z轴数据

void main() {
  vUv = uv;
  vec4 modelPosition = modelMatrix * vec4(position,1); // 模型位置
  // modelPosition.x += 1.0;  // 将模型向右移动一个单位
  // modelPosition.z += modelPosition.x; // 每个顶点都进行操作
  modelPosition.z = sin(modelPosition.x*10.0+utime)*0.1; // 经度和分号都不可少，而且需要够足多个顶点
  modelPosition.z += sin(modelPosition.y*10.0+utime)*0.1;

  vElevation = modelPosition.z;
  gl_Position = projectionMatrix * viewMatrix * modelPosition;
}