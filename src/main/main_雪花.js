import * as THREE from 'three';
// 导入轨道控制器
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import * as dat from 'dat.gui';
const gui = new dat.GUI();

const scene = new THREE.Scene();

// 角度，宽高比 最近可视距离  最远
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 40);
camera.position.set(0, 0, 40);
scene.add(camera);

/* 星空 */
const particlesGeometry = new THREE.BufferGeometry();
const count = 10000;
const positions = new Float32Array(count * 3);
// 设置粒子顶点颜色
const colors = new Float32Array(count * 3);
for (let i = 0; i < count * 3; i++) {
  positions[i] = (Math.random() - 0.5) * 100;
  colors[i] = Math.random(); // rbg 都是 0~1
}
particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
// 必须配合材质开启顶点着色才行
particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

/* 创建物体 */
const sphereGeometry = new THREE.SphereGeometry(3, 20, 20);
// const material = new THREE.MeshBasicMaterial({color: 0xff0000});
// const mesh = new THREE.Mesh(sphereGeometry, material);
// scene.add(mesh);
/* 设置点材质大小 */
const material = new THREE.PointsMaterial();
// material.size = 0.1; // 默认是1 比较大
material.color.set(0xfff000);
// material.sizeAttenuation = false; // 关闭近大远小
// 载入纹理
const textureLoader = new THREE.TextureLoader();
const texture = textureLoader.load('./textures/particles/11.png');
material.map = texture;
material.alphaMap = texture; // 透明度贴图，解决贴图黑边带来的问题
material.transparent = true;
material.depthWrite = false; // 否对深度缓冲区有影响，即物体不遮挡
material.blending = THREE.AdditiveBlending; // 叠加材质混合效果

material.vertexColors = true; // 启用顶点着色

// const points = new THREE.Points(sphereGeometry, material);
const points = new THREE.Points(particlesGeometry, material);
scene.add(points);

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
  let time = clock.getElapsedTime();
  points.rotation.x = time * 0.3;
  points.rotation.y = time * 0.1;
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
