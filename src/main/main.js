import * as THREE from 'three';
// 导入轨道控制器
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
// 导入物理引擎
import * as CANNON from 'cannon-es';
import * as dat from 'dat.gui';
const gui = new dat.GUI();
// console.log(CANNON);
const scene = new THREE.Scene();

// 角度，宽高比 最近可视距离  最远
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(0, 0, 10);
scene.add(camera);

const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const sphereMaterial = new THREE.MeshStandardMaterial();
const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere.castShadow = true;
scene.add(sphere);
const plane = new THREE.Mesh(new THREE.PlaneGeometry(50, 50), new THREE.MeshStandardMaterial());
plane.position.set(0, -5, 0);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

/* 使用cannon创建物理世界 */
// const world = new CANNON.World({gravity: 9.8});
const world = new CANNON.World();
// 因为 Y 向下是 负
world.gravity.set(0, -9.8, 0);
// 创建物理世界的小球
const shpereShape = new CANNON.Sphere(1);
// 设置物体材质
const shpereWorldMaterial = new CANNON.Material();
const sphereBody = new CANNON.Body({
  shape: shpereShape,
  position: new CANNON.Vec3(0, 0, 0), // 因为threejs中小球位置是0，0，0
  mass: 1, // 小球的质量
  material: shpereWorldMaterial
});
world.addBody(sphereBody);

/* 添加环境光 */
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
/* 添加平行光 */
const directLight = new THREE.DirectionalLight(0xffffff, 0.5);
directLight.castShadow = true;
scene.add(directLight);

// 渲染器
const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.physicallyCorrectLights = true; // 使用物理上正确的光照模式
renderer.shadowMap.enabled = true;

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
  let deltaTime = clock.getDelta();

  /* 更新物理世界里的物体 60 为电脑刷新率，deltaTime为两帧之间的差值 */
  world.step(1 / 60, deltaTime);
  // 将three中的小球与物理世界的小球关联起来，其实就是将 物理世界中小球的位置赋值为three中的
  sphere.position.copy(sphereBody.position);

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
