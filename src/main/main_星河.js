import * as THREE from 'three';
// 导入轨道控制器
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import * as dat from 'dat.gui';
const gui = new dat.GUI();

const scene = new THREE.Scene();

// 角度，宽高比 最近可视距离  最远
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(0, 0, 3);
scene.add(camera);

const params = {
  count: 10000,
  size: 0.1,
  radius: 5,
  branch: 3,
  color: '#ff6030',
  endColor: '#1b3984',
  rotateScale: 0.2 // 直线弯曲程度
};

const textureLoader = new THREE.TextureLoader();
const particlesTexture = textureLoader.load('./textures/particles/1.png');

let geometry = null;
let material = null;
let points = null;
const generateGalaxy = () => {
  geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(params.count * 3);
  const colors = new Float32Array(params.count * 3);
  const centerColor = new THREE.Color(params.color);
  const endColor = new THREE.Color(params.endColor);
  for (let i = 0; i < params.count; i++) {
    // 判断当前点在那条分支上,即每条分支所在的角度 0 120 240
    const branchAngle = (i % params.branch) * ((Math.PI * 2) / params.branch);

    // 当前点距离圆心的距离
    // *Math.pow... 让粒子中心更加集中
    const distance = Math.random() * params.radius * Math.pow(Math.random(), 3);
    let current = i * 3;

    // 制造中间点多两边少的样子
    const randomX = (Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance)) / 5; // -1~1 三次方
    const randomY = (Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance)) / 5;
    const randomZ = (Math.pow(Math.random() * 2 - 1, 3) * (params.radius - distance)) / 5;

    // + distance 让直线变成曲线
    // * params.rotateScale 弯曲程度
    // randomX 扩散效果
    positions[current] = Math.cos(branchAngle + distance * params.rotateScale) * distance + randomX;
    positions[current + 1] = 0 + randomY;
    positions[current + 2] =
      Math.sin(branchAngle + distance * params.rotateScale) * distance + randomZ;

    /* 混合颜色形成渐变色 */
    const mixColor = centerColor.clone();
    mixColor.lerp(endColor, distance / params.radius);
    colors[current] = mixColor.r;
    colors[current + 1] = mixColor.g;
    colors[current + 2] = mixColor.b;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  material = new THREE.PointsMaterial({
    // color: new THREE.Color(params.color),
    size: params.size,
    sizeAttenuation: true, // 近大远小
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    map: particlesTexture,
    alphaMap: particlesTexture,
    vertexColors: true,
    transparent: true
  });
  points = new THREE.Points(geometry, material);
  scene.add(points);
};
generateGalaxy();

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
