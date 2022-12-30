precision lowp float;
varying vec2 vUv;  // 二维向量

uniform float utime;

// 随机函数( 参考 thebookofshaders )
float random (vec2 st) {
  return fract(sin(dot(st.xy,vec2(12.9898,78.233)))*43758.5453123);
}

void main() {
  // 例如uv坐标1为 0.0,0.0 ===> rbga(0.0,0.0,0.0,1.0)即呈现黑色 其他顶点类推
  // gl_FragColor = vec4(vUv,1.0,1.0);

  // float strength = 1.0 - vUv.y;  // 从上到下 从黑到白
  // gl_FragColor = vec4(strength,strength,strength,1.0);


  // float strength = mod(vUv.x*10.0,1.0);  // 取模 重复条纹状
  // strength = step(0.8,strength);  // step 大于0.8为1 小于0.8为0
  // gl_FragColor = vec4(strength,strength,strength,1.0);

  // float strength = step(0.8,mod((vUv.x+utime*0.1)*10.0,1.0));  
  // strength -= step(0.8,mod(vUv.y*10.0,1.0));  
  // gl_FragColor = vec4(strength,strength,strength,1.0);

  // 绝对值 
  // float strength = abs(vUv.x - 0.5);
  // strength += abs(vUv.y - 0.5);

  // float strength = min(abs(vUv.x - 0.5),abs(vUv.y - 0.5)); 
  // float strength = max(abs(vUv.x - 0.5),abs(vUv.y - 0.5)); 
  // gl_FragColor = vec4(strength,strength,strength,1.0);

  // 随机
  // float strength = random(vUv);
  // float strength = ceil(vUv.x*10.0)/10.0*ceil(vUv.y*10.0)/10.0;
  // strength = random(vec2(strength,strength));
  // gl_FragColor = vec4(strength,strength,strength,1.0);

  // float strength = length(vUv); // 向量的长度
  // float strength = step(0.5,distance(vUv,vec2(0.5,0.5))+0.35);
  // strength *= (1.0 - step(0.5,distance(vUv,vec2(0.5,0.5))+0.25));
  // gl_FragColor = vec4(strength,strength,strength,1.0);

  // float strength = abs(distance(vUv,vec2(0.5,0.5)) - 0.25);
  float strength = step(0.1,abs(distance(vUv,vec2(0.5,0.5)) - 0.25));
  gl_FragColor = vec4(strength,strength,strength,1.0);

}