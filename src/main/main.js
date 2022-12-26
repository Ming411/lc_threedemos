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

/**
 * 点击添加物体
 */
const cubeArr = [];
// 设置物体材质
const shpereWorldMaterial = new CANNON.Material('sphere');
function createCube() {
  const cubeGeometry = new THREE.BoxGeometry(1, 1, 1);
  const sphereMaterial = new THREE.MeshStandardMaterial();
  const sphere = new THREE.Mesh(cubeGeometry, sphereMaterial);
  sphere.castShadow = true;
  scene.add(sphere);
  // ========================
  // 创建物理世界的小球, 长宽高均为 three 中的 一半
  const shpereShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 0.5));
  const sphereBody = new CANNON.Body({
    shape: shpereShape,
    position: new CANNON.Vec3(0, 0, 0), // 因为threejs中小球位置是0，0，0
    mass: 1, // 小球的质量
    material: shpereWorldMaterial
  });
  sphereBody.applyLocalForce(
    new CANNON.Vec3(180, 0, 0), // 额外添加的力
    new CANNON.Vec3(0, 0, 0) // 施加力所在位置
  );
  world.addBody(sphereBody);
  function HitEvent(e) {
    // 获取碰撞的强度
    const impactStrength = e.contact.getImpactVelocityAlongNormal();
    hitSound.volume = impactStrength / 15; // 根据碰撞强度调节音量[0,1]
    hitSound.play();
    // if (impactStrength > 5) {
    //   hitSound.currentTime = 0; // 每次重新开始播放
    //   hitSound.volume = impactStrength / 15;
    //   hitSound.play();
    // }
  }
  sphereBody.addEventListener('collide', HitEvent);
  cubeArr.push({
    mesh: sphere,
    body: sphereBody
  });
}
window.addEventListener('click', createCube);

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

// 创建物理世界的地面
const floorPlane = new CANNON.Plane();
const floorBody = new CANNON.Body();
const floorMaterial = new CANNON.Material('floor');
floorBody.material = floorMaterial;
floorBody.mass = 0; // 质量为0 可以使得物体保持不动
floorBody.addShape(floorPlane);
floorBody.position.set(0, -5, 0);
// 因为需要和three中的位置保持一致，所以需要旋转
//  new CANNON.Vec3(1, 0, 0)  表示绕 X 轴旋转
floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
world.addBody(floorBody);

// 设置两种材质之间碰撞参数
const defaultContactMaterial = new CANNON.ContactMaterial(shpereWorldMaterial, floorMaterial, {
  friction: 0.1, // 摩擦力
  restitution: 0.7 // 弹性
});
world.addContactMaterial(defaultContactMaterial);
// 设置默认碰撞材料
world.defaultContactMaterial = defaultContactMaterial;

/**
 * 添加监听碰撞事件
 */
// 创建碰撞声音
const hitSound = new Audio('assets/peng.mp3');

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
  cubeArr.forEach(item => {
    // sphere.position.copy(sphereBody.position);
    item.mesh.position.copy(item.body.position);
    // 设置渲染物体跟随物理得物体旋转
    item.mesh.quaternion.copy(item.body.quaternion);
  });

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
