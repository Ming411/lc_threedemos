import * as THREE from 'three';
// 导入轨道控制器
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import * as dat from 'dat.gui';
const gui = new dat.GUI();

const scene = new THREE.Scene();

// 角度，宽高比 最近可视距离  最远
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.set(0, 0, 20);
scene.add(camera);

const geometry = new THREE.BoxGeometry(2, 2, 2);
const material = new THREE.MeshBasicMaterial({
  wireframe: true,
  color: '#ffffff'
});
const redMaterial = new THREE.MeshBasicMaterial({
  color: '#ff0000'
});
let cubeArr = [];
// 通过组的方式来添加物体
let cubeGroup = new THREE.Group();
for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    for (let z = 0; z < 5; z++) {
      const box = new THREE.Mesh(geometry, material);
      box.position.set(i * 2 - 4, j * 2 - 4, z * 2 - 4);
      // scene.add(box);
      cubeGroup.add(box);
      cubeArr.push(box);
    }
  }
}
scene.add(cubeGroup);
gsap.to(cubeGroup.rotation, {
  x: '+=' + Math.PI,
  duration: 5,
  ease: 'power2.inOut',
  repeat: -1
});
/* 创建投射光线对象 */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
window.addEventListener('click', ev => {
  // 将鼠标位置转为  -1 ~ 1
  mouse.x = (ev.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -((ev.clientY / window.innerHeight) * 2 - 1); // 三维坐标系Y向上为正
  // mouse X分量与Y分量应当在-1到1之间
  raycaster.setFromCamera(mouse, camera);
  // intersectObjects 带s检测多个
  let result = raycaster.intersectObjects(cubeArr);
  // console.log(result);
  result.forEach(item => {
    item.object.material = redMaterial;
  });
});
/* 酷炫三角形 */
let sjGroup = new THREE.Group();
for (let i = 0; i < 50; i++) {
  const geometry = new THREE.BufferGeometry();
  const vertices = new Float32Array(9);
  for (let j = 0; j < 9; j++) {
    // 每个面需要3个点9个坐标
    vertices[j] = Math.random() * 10 - 5;
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  const color = new THREE.Color(Math.random(), Math.random(), Math.random());
  const material = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    side: THREE.DoubleSide,
    opacity: Math.random()
  });
  // transparent 必须为true opacity才生效
  const mesh = new THREE.Mesh(geometry, material);
  // scene.add(mesh);
  sjGroup.add(mesh);
}
sjGroup.position.set(0, -30, 0);
scene.add(sjGroup);
gsap.to(sjGroup.rotation, {
  x: '+=' + Math.PI,
  duration: 5,
  ease: 'power2.inOut',
  repeat: -1
});
/* 弹跳小球 */
const sphereGroup = new THREE.Group();
const sphereGeometry = new THREE.SphereGeometry(1, 20, 20);
const material1 = new THREE.MeshStandardMaterial({});
const sphere = new THREE.Mesh(sphereGeometry, material1);
sphere.castShadow = true; // 球投射阴影
sphereGroup.add(sphere);
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const material2 = new THREE.MeshStandardMaterial();
const plane = new THREE.Mesh(planeGeometry, material2);
plane.position.set(0, -1, 0);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
sphereGroup.add(plane);
const pointLight = new THREE.PointLight(0xff0000, 1);
pointLight.castShadow = true;
const lightBall = new THREE.Mesh(
  new THREE.SphereGeometry(0.1, 20, 20),
  new THREE.MeshBasicMaterial({color: 0xff0000})
);
lightBall.position.set(2, 2, 2);
lightBall.add(pointLight); // 将灯光绑定到物体上
sphereGroup.add(lightBall);
sphereGroup.position.set(0, -60, 0);
scene.add(sphereGroup);
/* 滚动事件 */
let arrGroup = [cubeGroup, sjGroup, sphereGroup];
let currentPage = 0;
window.addEventListener('scroll', ev => {
  const newPage = Math.round(window.scrollY / window.innerHeight);
  if (newPage !== currentPage) {
    currentPage = newPage;
    gsap.to(arrGroup[currentPage].rotation, {
      z: '+=' + Math.PI,
      duration: 1
    });
    // document.documentElement.scrollTop = window.innerHeight * currentPage;
    /*  document.documentElement.scrollTo({
      top: window.innerHeight * currentPage,
      behavior: 'smooth'   // 带动画效果
    }); */
  }
});
// 渲染器
/* alpha 设置渲染器透明，便于看到后面的文字 */
const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.physicallyCorrectLights = true; // 使用物理上正确的光照模式
// renderer.shadowMap.enabled = true;

// 将元素添加至 body
document.body.appendChild(renderer.domElement);
// renderer.render(scene, camera);
// 创建控制器(当需要操控其他dom时，不能开启)
// const controls = new OrbitControls(camera, renderer.domElement);
// 设置阻尼
// controls.enableDamping = true;
// 坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);
// 设置时钟
const clock = new THREE.Clock();

function render() {
  let time = clock.getElapsedTime();
  // cubeGroup.rotation.x = time * 0.5;
  // cubeGroup.rotation.y = time * 0.5;
  // sjGroup.rotation.x = time * 0.3;
  // sjGroup.rotation.y = time * 0.3;
  // sphereGroup.rotation.x = Math.sin(time) * 0.05;
  // sphereGroup.rotation.z = Math.sin(time) * 0.05;
  lightBall.position.x = Math.cos(time);
  lightBall.position.z = Math.sin(time);
  lightBall.position.y = Math.sin(time * 10) / 2 + 2;

  // 滚动时变换相机位置
  camera.position.y = -(window.scrollY / window.innerHeight) * 30;
  // controls.update();
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
