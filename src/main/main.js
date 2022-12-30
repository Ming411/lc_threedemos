import * as THREE from 'three';
// 导入轨道控制器
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import * as dat from 'dat.gui';
import {CSS2DRenderer, CSS2DObject} from 'three/examples/jsm/renderers/CSS2DRenderer';

const gui = new dat.GUI();
const textureLoader = new THREE.TextureLoader();
const scene = new THREE.Scene();

// 角度，宽高比 最近可视距离  最远
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 200);

camera.position.set(0, 5, -10);
scene.add(camera);

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(1, 16, 16),
  new THREE.MeshBasicMaterial({
    map: textureLoader.load('textures/planets/earth_atmos_2048.jpg'),
    normalScale: new THREE.Vector2(0.85, 0.85)
  })
);
scene.add(earth);

const moon = new THREE.Mesh(
  new THREE.SphereGeometry(0.27, 16, 16),
  new THREE.MeshBasicMaterial({
    map: textureLoader.load('textures/planets/moon_1024.jpg')
  })
);
scene.add(moon);

// 创建曲线对象
const curve = new THREE.CatmullRomCurve3(
  [
    new THREE.Vector3(-10, 0, 10),
    new THREE.Vector3(-5, 5, 5),
    new THREE.Vector3(-0, 0, 5),
    new THREE.Vector3(5, -5, 5),
    new THREE.Vector3(10, 0, 10)
  ],
  true // 表示起始点位闭合
);
// 从曲线中取出51个点， 50表示分割
const points = curve.getPoints(50);
const geometry = new THREE.BufferGeometry().setFromPoints(points);
const material = new THREE.LineBasicMaterial({color: 'aqua'});
const curveObject = new THREE.Line(geometry, material);
scene.add(curveObject);

/* 创建 提示标签 */
const earthDiv = document.createElement('div');
earthDiv.className = 'label';
earthDiv.innerHTML = '地球';
// css2D 需要专门的渲染器
const earthLabel = new CSS2DObject(earthDiv);
earthLabel.position.set(0, 1, 0);
earth.add(earthLabel); // 往地球上添加标签

// 中国地区
const chinaDiv = document.createElement('div');
chinaDiv.className = 'label1';
chinaDiv.innerHTML = '中国';
const chinaLabel = new CSS2DObject(chinaDiv);
chinaLabel.position.set(-0.3, 0.5, -0.9);
earth.add(chinaLabel);
// 中国地区

const moonDiv = document.createElement('div');
moonDiv.className = 'label';
moonDiv.innerHTML = '月球';
// css2D 需要专门的渲染器
const moonLabel = new CSS2DObject(moonDiv);
moonLabel.position.set(0, 0.3, 0);
moon.add(moonLabel);

// 实例化css2D渲染器
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(labelRenderer.domElement);
labelRenderer.domElement.style.position = 'fixed';
labelRenderer.domElement.style.top = '0px';
labelRenderer.domElement.style.left = '0px';
labelRenderer.domElement.style.zIndex = '10';

// 实例化射线
const raycaster = new THREE.Raycaster();

// 渲染器
const renderer = new THREE.WebGLRenderer({alpha: true});
renderer.setSize(window.innerWidth, window.innerHeight);

// 将元素添加至 body
document.body.appendChild(renderer.domElement);
// 创建控制器
const controls = new OrbitControls(camera, labelRenderer.domElement);
// const controls = new OrbitControls(camera, renderer.domElement);
// 设置阻尼
controls.enableDamping = true;
// 坐标轴辅助器
const axesHelper = new THREE.AxesHelper(5);
// scene.add(axesHelper);
// 设置时钟
const clock = new THREE.Clock();

function render() {
  const elapsedTime = clock.getElapsedTime();
  // moon.position.x = Math.cos(elapsedTime) * 5;
  // moon.position.z = Math.sin(elapsedTime) * 5;

  /* 获取曲线上的点 */
  const time = (elapsedTime * 0.1) % 1; // 将时间转为 [0,1]
  // 就好比 1s 内走完这条曲线，通过时间来确定具体点的位置
  const point = curve.getPoint(time); //曲线上的位置。必须在[0,1]范围内
  // 注意set之接接收xyz分量，copy可以直接接收vec3
  moon.position.copy(point); // position是只读属性,所以不能直接赋值
  // camera.position.copy(point); // 设置相机位置
  // camera.lookAt(earth.position); // 设置相机位置朝向
  /* 检测射线碰撞 */
  // 将此向量(坐标)从世界空间投影到相机的标准化设备坐标 (NDC) 空间
  const chinaPosition = chinaLabel.position.clone();
  chinaPosition.project(camera); // chinaPosition位置转为 -1 ~ 1 坐标系中的点
  raycaster.setFromCamera(chinaPosition, camera); // 生成线段
  // // 检测是否存在碰撞
  const intersects = raycaster.intersectObjects(scene.children, true);

  // 相机到label的距离
  const cameraToLabel = chinaLabel.position.distanceTo(camera.position);

  if (intersects.length == 0) {
    // 如果没有碰撞到任何物体,就表示物体没有被遮挡，展示Label
    chinaLabel.element.classList.add('visible');
  } else {
    const minDistance = intersects[0].distance;
    if (minDistance < cameraToLabel) {
      // label 被遮挡
      chinaLabel.element.classList.remove('visible');
    } else {
      chinaLabel.element.classList.add('visible');
    }
  }

  labelRenderer.render(scene, camera); // css渲染器
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
  // 更新CSS渲染器
  labelRenderer.setSize(window.innerWidth, window.innerHeight);
});
