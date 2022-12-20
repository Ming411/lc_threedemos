import * as THREE from 'three';
// 导入轨道控制器
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls';
import gsap from 'gsap';
import * as dat from 'dat.gui';
const gui = new dat.GUI();
/* import {RGBELoader} from 'three/examples/jsm/loaders/RGBELoader';
const rbgeLoader = new RGBELoader();
rbgeLoader.loadAsync('textures/hdr/002.hdr').then(texture => {
  texture.mapping = THREE.EquirectangularReflectionMapping; // 一张HDR
  scene.background = texture;
  scene.environment = texture;
}); */

const scene = new THREE.Scene();

// 角度，宽高比 最近可视距离  最远
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.set(0, 0, 3);
scene.add(camera);

/* 统一管理资源加载 */
const loadingManager = new THREE.LoadingManager(
  () => {
    console.log('all-loaded~');
  },
  (url, loaded, total) => {
    // 当前资源地址，已加载，总数
    console.log(url, loaded, total, 'all-加载中~' + ((loaded / total) * 100).toFixed(2));
  },
  ev => {
    console.log(ev, 'all-error~');
  }
);

const textureLoader = new THREE.TextureLoader(loadingManager);
// 注意这里的路径是打包完成之后相对index.html的
const doorColorTexture = textureLoader.load('./textures/door/color.jpg');
const doorAlphaTexture = textureLoader.load('./textures/door/alpha.jpg');
const doorAoTexture = textureLoader.load('./textures/door/ambientOcclusion.jpg');
//导入置换贴图
const doorHeightTexture = textureLoader.load('./textures/door/height.jpg');
const roughnessTexture = textureLoader.load('./textures/door/roughness.jpg');
const metalnessTexture = textureLoader.load('./textures/door/metalness.jpg');
// 导入法线贴图
const normalTexture = textureLoader.load(
  './textures/door/normal.jpg'
  // () => {
  //   console.log('loaded~');
  // },
  // ev => {
  //   console.log(ev, '加载中~');
  // },
  // ev => {
  //   console.log(ev, 'error~');
  // }
);

/* 环境纹理贴图  也需要灯光*/
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMapTexture = cubeTextureLoader.load([
  'textures/environmentMaps/1/px.jpg',
  'textures/environmentMaps/1/nx.jpg',
  'textures/environmentMaps/1/py.jpg',
  'textures/environmentMaps/1/ny.jpg',
  'textures/environmentMaps/1/pz.jpg',
  'textures/environmentMaps/1/nz.jpg'
]);

const sphereGeometry = new THREE.SphereBufferGeometry(1, 20, 20);
const material1 = new THREE.MeshStandardMaterial({
  // metalness: 0.7,
  // roughness: 0.1
  // envMap: envMapTexture
});
const sphere = new THREE.Mesh(sphereGeometry, material1);
// sphere.position.set(2, 0, 0);
sphere.castShadow = true; // 球投射阴影
scene.add(sphere);
gui.add(sphere.position, 'x').max(5).min(0).step(0.1).name('sphereX');

/* scene.background = envMapTexture; // 直接给场景添加背景
scene.environment = envMapTexture; // 给所有的物体添加默认的环境贴图 */

const geometry = new THREE.PlaneBufferGeometry(50, 50);
const material2 = new THREE.MeshStandardMaterial();
const plane = new THREE.Mesh(geometry, material2);
plane.position.set(0, -1, 0);
plane.rotation.x = -Math.PI / 2;
plane.receiveShadow = true;
scene.add(plane);

// const texture = textureLoader.load('./textures/minecraft.png');
// 默认是three内部线性计算了的
// texture.minFilter = THREE.NearestFilter; // 原始像素
// texture.magFilter = THREE.NearestFilter;
// 以下为默认配置
// texture.minFilter = THREE.LinearFilter;
// texture.magFilter = THREE.LinearFilter;

// 设置纹理偏移量
// doorColorTexture.offset.x = 0.5; // 二维向量
// doorColorTexture.offset.set(0.5, 0.5);

// 默认旋转原点是左下角
// doorColorTexture.center.set(0.5, 0.5);
// doorColorTexture.rotation = Math.PI / 4;

/* // 默认纹理重复模式为拉伸
doorColorTexture.repeat.set(2, 3);
doorColorTexture.wrapS = THREE.MirroredRepeatWrapping; // 水平镜像重复
doorColorTexture.wrapT = THREE.RepeatWrapping; // 垂直无限重复 */

const cubeGeometry = new THREE.BoxBufferGeometry(1, 1, 1, 100, 100, 100);
// 基础材质
const cubeMaterial = new THREE.MeshBasicMaterial({
  map: doorColorTexture,
  // 透明贴图
  alphaMap: doorAlphaTexture, // 必须配置transparent:true
  transparent: true,
  aoMap: doorAoTexture, // 必须设置第二组uv
  aoMapIntensity: 1, // 阴影强度，默认为1
  side: THREE.DoubleSide // 默认只渲染前面，这里设置为双面渲染
});

/**
 * 使用standermaterial,无光则全黑
 */
const material = new THREE.MeshStandardMaterial({
  map: doorColorTexture,
  alphaMap: doorAlphaTexture, // 透明贴图
  transparent: true,
  aoMap: doorAoTexture, // 环境遮挡贴图
  aoMapIntensity: 1,
  side: THREE.DoubleSide,
  displacementMap: doorHeightTexture, //置换贴图 让贴图产生层次感（需要多个顶点）
  displacementScale: 0.1, // 层次程度
  roughness: 0, // 粗糙程度 0光滑
  roughnessMap: roughnessTexture, // 会自动叠加设置的roughness
  metalness: 1, // 金属程度
  metalnessMap: metalnessTexture, // 金属贴图,区分不同材质的金属度
  normalMap: normalTexture // 法线贴图 痕迹轮廓更加清晰
});
// 环境光会均匀的照亮场景中的所有物体
const light = new THREE.AmbientLight(0xffffff, 0.5); // 强度默认为 1
scene.add(light);
// 平行光
const directionLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionLight.position.set(10, 10, 10); // 从该位置射向圆心
directionLight.castShadow = true; // 开始阴影渲染
directionLight.shadow.radius = 20; // 模糊程度
directionLight.shadow.mapSize.set(2048, 2048); // 解决重影（值必须是2的幂）
// scene.add(directionLight);

directionLight.shadow.camera.near = 0.5; // 距离相机最近的那个面
// 当物体不在相机的near~far之间就不会产生阴影
gui
  .add(directionLight.shadow.camera, 'near')
  .min(0)
  .max(20)
  .step(0.1)
  .onChange(() => {
    // 更新相机必须调用更新相机矩阵方法
    directionLight.shadow.camera.updateProjectionMatrix();
  });
const helper = new THREE.DirectionalLightHelper(directionLight, 2);
// scene.add(helper);

/* 聚光灯 */
const spotLight = new THREE.SpotLight(0xffffff, 0.5);
spotLight.intensity = 2; // 光照强度
spotLight.position.set(5, 5, 5);
spotLight.angle = Math.PI / 6; // 聚光灯角度
spotLight.distance = 0;
spotLight.penumbra = 0;
spotLight.decay = 0;
spotLight.castShadow = true;
spotLight.target = sphere; // 设置目标
// scene.add(spotLight);
gui.add(spotLight, 'distance').min(0).max(10).step(0.1); //
gui.add(spotLight, 'penumbra').min(0).max(1).step(0.1); // 半影衰减百分比
gui.add(spotLight, 'decay').min(0).max(5).step(0.1); // 光照距离衰减（需配合物理渲染）
// renderer.physicallyCorrectLights = true; // 使用物理上正确的光照模式
const spotLightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(spotLightHelper);

const pointLight = new THREE.PointLight(0xff0000, 1);
pointLight.castShadow = true;
const lightBall = new THREE.Mesh(
  new THREE.SphereBufferGeometry(0.1, 20, 20),
  new THREE.MeshBasicMaterial({color: 0xff0000})
);
lightBall.position.set(2, 2, 2);
lightBall.add(pointLight); // 将灯光绑定到物体上
scene.add(lightBall);

// const cubeMaterial = new THREE.MeshBasicMaterial({map: texture});
// const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
const cube = new THREE.Mesh(cubeGeometry, material);
// cube.position.set(5, 0, 0);
// cube.scale.set(3, 1, 1);
// cube.rotation.set(Math.PI / 4, 0, 0, 'XYZ'); // 旋转角度 xyz

// scene.add(cube);
cubeGeometry.setAttribute('uv2', new THREE.BufferAttribute(cubeGeometry.attributes.uv.array, 2));

/* // 使用缓冲区创建几何体
const geometry = new THREE.BufferGeometry();
// 创建顶点
const vertices = new Float32Array([
  1.0, 1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0,
  // 逆时针画
  1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
const material = new THREE.MeshBasicMaterial({color: '#f1da4a'});
const mesh = new THREE.Mesh(geometry, material);
console.log(mesh);
scene.add(mesh); */

/* for (let i = 0; i < 50; i++) {
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
    opacity: Math.random()
  });
  // transparent 必须为true opacity才生效
  const mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
} */

gui
  .add(cube.position, 'x')
  .min(0)
  .max(5)
  .step(0.01)
  .name('移动x')
  .onChange(value => {
    console.log('值被修改了', value);
  })
  .onFinishChange(value => {
    console.log('停止操作事件', value);
  });
const params = {
  color: '#f14a61',
  fn() {
    gsap.to(cube.position, {x: 5, duration: 5});
  }
};
// 设置 颜色
gui.addColor(params, 'color').onChange(value => {
  cube.material.color.set(value);
});
// 设置 选项框
gui.add(cube, 'visible').name('是否显示');
// 设置按钮事件
gui.add(params, 'fn').name('让立方体运动');

// 文件夹折叠操作
const folder = gui.addFolder('设置立方体');
folder.add(cube.material, 'wireframe');
// 渲染器
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.physicallyCorrectLights = true; // 使用物理上正确的光照模式

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

/* const animate = gsap.to(cube.position, {
  x: 5,
  duration: 5,
  ease: 'power1.inOut',
  repeat: 2, // 重复次数，无限次为-1
  yoyo: true, // 往返运动
  delay: 2, // 设置延迟时间
  onStart: () => {
    console.log('动画开始的cb');
  },
  onComplete: () => {
    console.log('动画完成的cb');
  }
}); */
window.addEventListener('dblclick', () => {
  /*  if (animate.isActive()) {
    animate.pause(); // 暂停动画
  } else {
    animate.resume(); // 恢复动画
  } */
  const fullScreenElement = document.fullscreenElement;
  if (!fullScreenElement) {
    // 让画布对象全屏
    renderer.domElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
});

function render() {
  let time = clock.getElapsedTime();
  lightBall.position.x = Math.sin(time); // -1 ~  1
  lightBall.position.z = Math.cos(time); // -1 ~  1
  // console.log('x:', lightBall.position.x, 'z:', lightBall.position.z);
  controls.update();
  // console.log(time);  // 自带一个time参数
  /*   cube.position.x = time / 1000;
  if (cube.position.x >= 5) {
    cube.position.x = 0;
  } */

  // let time = clock.getElapsedTime(); // 时钟运行总时长
  let deltaTime = clock.getDelta(); // 两次时钟间隔事件，即动画帧间隔时间（不能与getElapsedTime同时出现）

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
