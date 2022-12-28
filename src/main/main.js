import * as THREE from 'three';
// 导入轨道控制器
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import * as dat from 'dat.gui';

import basicVertexShader from '../shader/raw/vertex.glsl';
import basicFragmentShader from '../shader/raw/fragment.glsl';

const gui = new dat.GUI();

const scene = new THREE.Scene();

// 角度，宽高比 最近可视距离  最远
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(0, 0, 3);
scene.add(camera);

const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./textures/ca.jpg');

// 创建材质
const material = new THREE.MeshBasicMaterial({
  color: '#ff0000'
});
// 使用着色器定义材质
// const shaderMaterial = new THREE.ShaderMaterial({
// RawShaderMaterial 原始shader 需要提供更多的参数
const rawShaderMaterial = new THREE.RawShaderMaterial({
  // 顶点着色器
  // gl_Position 四维向量
  // <投影矩阵>·<视图矩裤>·<模型矩阵>·<顶点坐标>
  /*   vertexShader: `
  void main() {
    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position,1);
  }
` */
  vertexShader: basicVertexShader,
  // 片元着色器
  /* fragmentShader: `
    void main() {
      gl_FragColor = vec4(1.0,0.0,0.0,1.0);
    }
  ` */
  fragmentShader: basicFragmentShader,
  // wireframe: true // 显示为线框
  side: THREE.DoubleSide,
  // uniforms 可以直接在顶点着色器和片元着色器中使用
  uniforms: {
    utime: {
      value: 0
    },
    uTexture: {
      // 通过着色器设置纹理
      value: texture
    }
  }
});
const plane = new THREE.Mesh(
  new THREE.PlaneGeometry(1, 1, 64, 64),
  // material
  rawShaderMaterial
);
console.log(plane);
scene.add(plane);

// 渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.physicallyCorrectLights = true; // 使用物理上正确的光照模式
// renderer.shadowMap.enabled = true;

// 将元素添加至 body
document.body.appendChild(renderer.domElement);
// renderer.render(scene, camera);
// 创建控制器
const controls = new OrbitControls(camera, renderer.domElement);
// 设置阻尼
controls.enableDamping = true;
// 坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
// 设置时钟
const clock = new THREE.Clock();

function render() {
  const elapsedTime = clock.getElapsedTime();
  rawShaderMaterial.uniforms.utime.value = elapsedTime;

  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();

window.addEventListener('resize', () => {
  // 更新摄像头
  camera.aspect = window.innerWidth / window.innerHeight;
  // 更新投影矩阵
  camera.updateProjectionMatrix();
  // 更新渲染器
  renderer.setSize(window.innerWidth, window.innerHeight);
  // 设置渲染器像素比
  renderer.setPixelRatio(window.devicePixelRatio);
});
