let scene, camera, renderer, controls, model;
let isRotating = true;
let facePlane, faceTextMesh, pitchCircle, addendumCircle;
let pitchTextMesh, addendumTextMesh;
let dedendumCircle, rootCircle;
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
  const light = new THREE.PointLight(0xffffff, 1.5);
  light.position.set(...pos);
  scene.add(light);
});

// Load GLB Model
const loader = new THREE.GLTFLoader();
loader.load('spurgear.glb', function (gltf) {
  model = gltf.scene;
  model.position.set(0, 0, 0);
  scene.add(model);

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  controls.target.copy(center);
  controls.update();

  originalRotationY = model.rotation.y;
});

// Helper: Focus camera
function focusOnModel(duration = 1.5) {
  if (!model) return;
  const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
  gsap.to(camera.position, {
    x: camera.position.x,
    y: camera.position.y,
    z: camera.position.z,
    duration: 0.1,
    onUpdate: () => {
      controls.target.copy(center);
      camera.lookAt(center);
      controls.update();
    }
  });
}

// Top Land Plane
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

// Fonts and Text
const fontLoader = new THREE.FontLoader();
fontLoader.load('https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function (font) {
  const topTextGeo = new THREE.TextGeometry('TOP LAND', {
    font: font, size: 0.03, height: 0.01
  });
  const topTextMat = new THREE.MeshStandardMaterial({ color: 0x005533 });
  faceTextMesh = new THREE.Mesh(topTextGeo, topTextMat);
  faceTextMesh.position.set(-0.22, 0.25, 1.26);
  faceTextMesh.rotation.y = -0.1;
  faceTextMesh.visible = false;
  scene.add(faceTextMesh);

  const pitchTextGeo = new THREE.TextGeometry('PITCH CIRCLE', {
    font: font, size: 0.05, height: 0.01
  });
  const pitchTextMat = new THREE.MeshStandardMaterial({ color: 0x0056b3 });
  pitchTextMesh = new THREE.Mesh(pitchTextGeo, pitchTextMat);
  pitchTextMesh.position.set(-1.05, 0.22, -0.1);
  pitchTextMesh.rotation.x = -Math.PI / 2;
  pitchTextMesh.visible = false;
  scene.add(pitchTextMesh);

  const addendumTextGeo = new THREE.TextGeometry('ADDENDUM CIRCLE', {
    font: font, size: 0.05, height: 0.01
  });
  const addendumTextMat = new THREE.MeshStandardMaterial({ color: 0x00994d });
  addendumTextMesh = new THREE.Mesh(addendumTextGeo, addendumTextMat);
  addendumTextMesh.position.set(-1.9, 0.22, 0.3);
  addendumTextMesh.rotation.x = -Math.PI / 2;
  addendumTextMesh.visible = false;
  scene.add(addendumTextMesh);
});

// Pitch & Addendum Circles
pitchCircle = new THREE.Mesh(
  new THREE.RingGeometry(1.14, 1.13, 64),
  new THREE.MeshBasicMaterial({ color: 0x007BFF, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
);
pitchCircle.rotation.x = -Math.PI / 2;
pitchCircle.visible = false;
pitchCircle.position.set(0, 0.20, 0);
scene.add(pitchCircle);

addendumCircle = new THREE.Mesh(
  new THREE.RingGeometry(1.3, 1.29, 64),
  new THREE.MeshBasicMaterial({ color: 0x00cc66, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
);
addendumCircle.rotation.x = -Math.PI / 2;
addendumCircle.visible = false;
addendumCircle.position.set(0, 0.20, 0);
scene.add(addendumCircle);

// NEW: Dedendum & Root Circles
dedendumCircle = new THREE.Mesh(
  new THREE.RingGeometry(1.29, 1.14, 64),
  new THREE.MeshBasicMaterial({ color: 0xff6600, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
);
dedendumCircle.rotation.x = -Math.PI / 2;
dedendumCircle.visible = false;
dedendumCircle.position.set(0, 0.20, 0);
scene.add(dedendumCircle);

rootCircle = new THREE.Mesh(
  new THREE.RingGeometry(1.13, 0.99, 64),
  new THREE.MeshBasicMaterial({ color: 0xcc0000, side: THREE.DoubleSide, transparent: true, opacity: 0.5 })
);
rootCircle.rotation.x = -Math.PI / 2;
rootCircle.visible = false;
rootCircle.position.set(0, 0.20, 0);
scene.add(rootCircle);

// Animate
function animate() {
  requestAnimationFrame(animate);
  if (isRotating && model) model.rotation.y += 0.005;
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

// PARTS Button
document.getElementById('partsBtn').addEventListener('click', () => {
  isRotating = false;
  if (!model) return;

  const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
  gsap.to(camera.position, {
    x: originalCamPos.x,
    y: originalCamPos.y,
    z: originalCamPos.z,
    duration: 1.2,
    onUpdate: () => {
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    },
    onComplete: () => {
      document.getElementById('topLandBtn').style.display = 'inline-block';
      document.getElementById('pitchCircleBtn').style.display = 'inline-block';
      document.getElementById('backBtn').style.display = 'inline-block';
    }
  });

  gsap.to(model.rotation, {
    y: originalRotationY,
    duration: 1.2
  });
});

// TOP LAND Button
document.getElementById('topLandBtn').addEventListener('click', () => {
  if (!model) return;

  pitchCircle.visible = false;
  addendumCircle.visible = false;
  dedendumCircle.visible = false;
  rootCircle.visible = false;
  if (pitchTextMesh) pitchTextMesh.visible = false;
  if (addendumTextMesh) addendumTextMesh.visible = false;

  gsap.to(camera.position, {
    x: 0,
    y: 0,
    z: 2,
    duration: 1.5,
    onUpdate: () => {
      const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    },
    onComplete: () => {
      facePlane.visible = true;
      if (faceTextMesh) faceTextMesh.visible = true;
    }
  });
});

// PITCH CIRCLE Button
document.getElementById('pitchCircleBtn').addEventListener('click', () => {
  if (!model) return;

  facePlane.visible = false;
  if (faceTextMesh) faceTextMesh.visible = false;

  pitchCircle.visible = true;
  addendumCircle.visible = true;
  dedendumCircle.visible = false;
  rootCircle.visible = false;

  if (pitchTextMesh) pitchTextMesh.visible = true;
  if (addendumTextMesh) addendumTextMesh.visible = true;

  gsap.to(camera.position, {
    x: 0,
    y: 2,
    z: 0,
    duration: 1.5,
    onUpdate: () => {
      const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    },
    onComplete: () => {
      document.getElementById('detailsBtn').style.display = 'inline-block';
    }
  });
});

// DETAILS Button
document.getElementById('detailsBtn').addEventListener('click', () => {
  if (!model) return;

  facePlane.visible = false;
  if (faceTextMesh) faceTextMesh.visible = false;

  pitchCircle.visible = true;
  addendumCircle.visible = true;
  dedendumCircle.visible = true;
  rootCircle.visible = true;

  const backFocus = model.position.clone().add(new THREE.Vector3(0, 0.01, -1));

  gsap.to(camera.position, {
    x: backFocus.x,
    y: backFocus.y + .1,
    z: backFocus.z,
    duration: 1.5,
    onUpdate: () => {
      camera.lookAt(backFocus);
      controls.target.copy(backFocus);
      controls.update();
    }
  });
});

// BACK Button
document.getElementById('backBtn').addEventListener('click', () => {
  isRotating = true;
  facePlane.visible = false;
  pitchCircle.visible = false;
  addendumCircle.visible = false;
  dedendumCircle.visible = false;
  rootCircle.visible = false;

  if (faceTextMesh) faceTextMesh.visible = false;
  if (pitchTextMesh) pitchTextMesh.visible = false;
  if (addendumTextMesh) addendumTextMesh.visible = false;

  const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());

  gsap.to(camera.position, {
    x: originalCamPos.x,
    y: originalCamPos.y,
    z: originalCamPos.z,
    duration: 1.5,
    onUpdate: () => {
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    }
  });

  document.getElementById('topLandBtn').style.display = 'none';
  document.getElementById('pitchCircleBtn').style.display = 'none';
  document.getElementById('backBtn').style.display = 'none';
  document.getElementById('detailsBtn').style.display = 'none';
}); 