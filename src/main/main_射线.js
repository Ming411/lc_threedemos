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

const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshBasicMaterial({
  wireframe: true,
  color: '#ffffff'
});
const redMaterial = new THREE.MeshBasicMaterial({
  color: '#ff0000'
});
let cubeArr = [];
for (let i = -5; i < 5; i++) {
  for (let j = -5; j < 5; j++) {
    for (let z = -5; z < 5; z++) {
      const box = new THREE.Mesh(geometry, material);
      box.position.set(i, j, z);
      scene.add(box);
      cubeArr.push(box);
    }
  }
}
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
