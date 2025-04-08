let scene, camera, renderer, controls, model;
let isRotating = true;
let facePlane, faceTextMesh;
let originalRotationY = 0;

// Scene
scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

// Camera
camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const originalCamPos = new THREE.Vector3(0, 1, 3);
camera.position.copy(originalCamPos);

// Renderer
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Controls
controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enablePan = false;
controls.minDistance = 1;
controls.maxDistance = 5;

// Lighting
const lightPositions = [
  [0, 5, 5], [0, -5, 5], [5, 0, 5], [-5, 0, 5],
  [0, 5, -5], [0, -5, -5], [5, 0, -5], [-5, 0, -5]
];
lightPositions.forEach(pos => {
  let light = new THREE.PointLight(0xffffff, 1);
  light.position.set(...pos);
  scene.add(light);
});

// Load GLB model
const loader = new THREE.GLTFLoader();
loader.load('spurgear.glb', function (gltf) {
  model = gltf.scene;
  scene.add(model);
  model.position.set(0, 0, 0);

  let box = new THREE.Box3().setFromObject(model);
  let center = box.getCenter(new THREE.Vector3());
  controls.target.copy(center);
  controls.update();

  originalRotationY = model.rotation.y;
});

// Translucent plane (hidden by default)
const planeMaterial = new THREE.MeshStandardMaterial({
  color: 0xff0000,
  opacity: 0.6,
  transparent: true,
  side: THREE.DoubleSide
});
const planeGeometry = new THREE.PlaneGeometry(0.1, 0.38);
facePlane = new THREE.Mesh(planeGeometry, planeMaterial);
facePlane.visible = false;
facePlane.position.set(-0.126, 0, 1.29);
facePlane.rotation.set(0, -0.1, 0);
scene.add(facePlane);

// Load and add 3D text "TOP LAND"
const fontLoader = new THREE.FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
  const textGeo = new THREE.TextGeometry('TOP LAND', {
    font: font,
    size: 0.03,
    height: 0.01,
  });
  const textMat = new THREE.MeshStandardMaterial({ color: 0x007744 });
  faceTextMesh = new THREE.Mesh(textGeo, textMat);
  faceTextMesh.position.set(-0.22, 0.15, 1.26);
  faceTextMesh.rotation.y = -0.1;
  faceTextMesh.visible = false;
  scene.add(faceTextMesh);
});

// Animate
function animate() {
  requestAnimationFrame(animate);
  if (isRotating && model) {
    model.rotation.y += 0.005;
  }
  controls.update();
  renderer.render(scene, camera);
}
animate();

// Resize
window.addEventListener('resize', () => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

// PARTS button
document.getElementById('partsBtn').addEventListener('click', () => {
  isRotating = false;
  gsap.to(camera.position, {
    x: originalCamPos.x,
    y: originalCamPos.y,
    z: originalCamPos.z,
    duration: 1.2,
    onUpdate: () => {
      camera.lookAt(model.position);
      controls.update();
    },
    onComplete: () => {
      document.getElementById('topLandBtn').style.display = 'inline-block';
      document.getElementById('backBtn').style.display = 'inline-block';
    }
  });

  if (model) {
    gsap.to(model.rotation, {
      y: originalRotationY,
      duration: 1.2
    });
  }
});

// TOP LAND button
document.getElementById('topLandBtn').addEventListener('click', () => {
  if (!model) return;
  gsap.to(camera.position, {
    x: 0,
    y: 0,
    z: 2,
    duration: 1.5,
    onUpdate: () => {
      camera.lookAt(model.position);
      controls.update();
    },
    onComplete: () => {
      facePlane.visible = true;
      if (faceTextMesh) faceTextMesh.visible = true;
    }
  });
});

// BACK button
document.getElementById('backBtn').addEventListener('click', () => {
  isRotating = true;
  facePlane.visible = false;
  if (faceTextMesh) faceTextMesh.visible = false;

  gsap.to(camera.position, {
    x: originalCamPos.x,
    y: originalCamPos.y,
    z: originalCamPos.z,
    duration: 1.5,
    onUpdate: () => {
      camera.lookAt(model.position);
      controls.update();
    }
  });

  document.getElementById('topLandBtn').style.display = 'none';
  document.getElementById('backBtn').style.display = 'none';
});
