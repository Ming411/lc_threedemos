precision lowp float;
varying vec2 vUv;  // 二维向量
varying float vElevation;
uniform sampler2D uTexture;
// {
//     "0": 0,
//     "1": 1,
//     "2": 1,
//     "3": 1,
//     "4": 0,
//     "5": 0,
//     "6": 1,
//     "7": 0
// }
void main() {
  // gl_FragColor = vec4(vUv,0.0,1.0);
  float deep = vElevation + 0.1 * 10.0;  // 不能修改传递过来的值
  // gl_FragColor = vec4(1.0*deep,0.0,0.0,1.0);

  // 根据uv设置纹理贴图
  vec4 textureColor = texture2D(uTexture,vUv);
  gl_FragColor.rgb *= deep; // 附加动态层次效果
  gl_FragColor = textureColor;
}