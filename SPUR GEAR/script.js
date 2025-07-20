let scene, camera, renderer, controls, model;
let isRotating = true;
let facePlane, faceTextMesh, pitchCircle, addendumCircle;
let pitchTextMesh, addendumTextMesh;
let dedendumCircle, rootCircle;
let originalRotationY = 0;

// Additional elements for new views
let toothThicknessLines = [];
let pressureAngleLines = [];
let faceWidthPlanes = [];
let clearanceCircle;
let toothThicknessTextMesh, pressureAngleTextMesh, faceWidthTextMesh, clearanceTextMesh;

// Educational content for each component
const componentInfo = {
  topLand: {
    title: "Top Land",
    description: "The top surface of a gear tooth that connects the two flanks.",
    details: {
      definition: "The narrow flat surface at the top of each gear tooth",
      purpose: [
        "Provides clearance between mating gears",
        "Prevents interference during gear meshing",
        "Reduces stress concentration at tooth tip"
      ],
      formula: "Top Land Width = 0.25 × Module (approximately)",
      realWorld: "In automotive transmissions, proper top land design prevents gear jamming and ensures smooth operation."
    },
    color: "#ff0000"
  },
  pitchCircle: {
    title: "Pitch Circle & Addendum Circle",
    description: "The fundamental circles that define gear size and tooth dimensions.",
    details: {
      definition: "Pitch Circle: Theoretical circle where gear teeth effectively mesh. Addendum Circle: Outer circle defining tooth height.",
      purpose: [
        "Pitch Circle determines gear ratio and center distance",
        "Addendum Circle defines the outer diameter",
        "Critical for proper gear meshing and power transmission"
      ],
      formula: "Pitch Diameter = Module × Number of Teeth",
      realWorld: "Used in calculating gear ratios in car transmissions and industrial machinery."
    },
    color: "#007BFF"
  },
  allCircles: {
    title: "Complete Circle System",
    description: "All the critical circles that define a gear's geometry and function.",
    details: {
      definition: "The complete set of reference circles including pitch, addendum, dedendum, and root circles.",
      purpose: [
        "Defines complete tooth profile",
        "Ensures proper clearance and meshing",
        "Critical for manufacturing accuracy"
      ],
      formula: "Total Depth = Addendum + Dedendum = 2.25 × Module",
      realWorld: "Essential for precision manufacturing in aerospace and automotive industries."
    },
    color: "#00994d"
  },
  toothThickness: {
    title: "Tooth Thickness",
    description: "The width of a gear tooth measured at the pitch circle.",
    details: {
      definition: "The arc length of a tooth measured at the pitch circle, typically half the circular pitch.",
      purpose: [
        "Determines strength of individual teeth",
        "Affects load-carrying capacity",
        "Critical for preventing tooth breakage"
      ],
      formula: "Tooth Thickness = π × Module / 2",
      realWorld: "Heavy machinery gears require thicker teeth to handle higher torques and loads."
    },
    color: "#ff4444"
  },
  pressureAngle: {
    title: "Pressure Angle",
    description: "The angle between the line of action and the tangent to the pitch circle.",
    details: {
      definition: "Standard pressure angles are 14.5°, 20°, and 25°. Most modern gears use 20°.",
      purpose: [
        "Determines force transmission direction",
        "Affects gear strength and efficiency",
        "Influences bearing loads and gear life"
      ],
      formula: "Standard Pressure Angle = 20° (most common)",
      realWorld: "20° pressure angle gears are standard in automotive and industrial applications for optimal strength."
    },
    color: "#00ffff"
  },
  faceWidth: {
    title: "Face Width",
    description: "The length of gear teeth parallel to the axis of rotation.",
    details: {
      definition: "The width of the gear measured parallel to its axis, determining contact area.",
      purpose: [
        "Determines load distribution across tooth width",
        "Affects gear strength and load capacity",
        "Influences manufacturing and assembly requirements"
      ],
      formula: "Face Width = 8 to 12 × Module (typical range)",
      realWorld: "Wider face widths in heavy machinery distribute loads better but require more precise manufacturing."
    },
    color: "#ffaa00"
  },
  clearance: {
    title: "Clearance Circle",
    description: "The circle that provides clearance between the root of one gear and the tip of the mating gear.",
    details: {
      definition: "Located below the root circle, ensures proper clearance during gear operation.",
      purpose: [
        "Prevents interference between mating gears",
        "Allows for manufacturing tolerances",
        "Provides space for lubricant flow"
      ],
      formula: "Clearance = 0.25 × Module (standard)",
      realWorld: "Essential in precision gearboxes to prevent jamming and ensure smooth operation."
    },
    color: "#9900ff"
  }
};

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

// Show educational information panel
function showInfoPanel(componentKey) {
  const info = componentInfo[componentKey];
  if (!info) return;

  document.getElementById('infoTitle').textContent = info.title;
  document.getElementById('infoDescription').textContent = info.description;
  
  const detailsHTML = `
    <h4>📚 Definition:</h4>
    <p>${info.details.definition}</p>
    
    <h4>🎯 Purpose:</h4>
    <ul>
      ${info.details.purpose.map(purpose => `<li>${purpose}</li>`).join('')}
    </ul>
    
    <h4>📐 Formula/Standard:</h4>
    <p><strong>${info.details.formula}</strong></p>
    
    <h4>🔧 Real-World Application:</h4>
    <p>${info.details.realWorld}</p>
    
    <div style="margin-top: 15px; padding: 10px; background: ${info.color}; color: white; border-radius: 5px; text-align: center;">
      <strong>Component Color: <span class="color-indicator" style="background-color: ${info.color};"></span></strong>
    </div>
  `;
  
  document.getElementById('infoDetails').innerHTML = detailsHTML;
  document.getElementById('infoPanel').style.display = 'block';
}

// Hide information panel
function hideInfoPanel() {
  document.getElementById('infoPanel').style.display = 'none';
}

// Add enhanced visual feedback
function addGlowEffect(object, color) {
  if (!object) return;
  
  // Create glow effect
  const glowMaterial = new THREE.MeshBasicMaterial({
    color: color,
    transparent: true,
    opacity: 0.3,
    side: THREE.BackSide
  });
  
  if (object.geometry) {
    const glowGeometry = object.geometry.clone();
    glowGeometry.scale(1.05, 1.05, 1.05);
    const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
    glowMesh.position.copy(object.position);
    glowMesh.rotation.copy(object.rotation);
    scene.add(glowMesh);
    
    // Remove glow after animation
    setTimeout(() => {
      scene.remove(glowMesh);
    }, 2000);
  }
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

  // Tooth Thickness Text
  const toothThicknessTextGeo = new THREE.TextGeometry('TOOTH THICKNESS', {
    font: font, size: 0.04, height: 0.01
  });
  const toothThicknessTextMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
  toothThicknessTextMesh = new THREE.Mesh(toothThicknessTextGeo, toothThicknessTextMat);
  toothThicknessTextMesh.position.set(-0.8, 0.25, 1.4);
  toothThicknessTextMesh.rotation.x = -Math.PI / 2;
  toothThicknessTextMesh.visible = false;
  scene.add(toothThicknessTextMesh);

  // Pressure Angle Text
  const pressureAngleTextGeo = new THREE.TextGeometry('PRESSURE ANGLE', {
    font: font, size: 0.04, height: 0.01
  });
  const pressureAngleTextMat = new THREE.MeshStandardMaterial({ color: 0x00ffff });
  pressureAngleTextMesh = new THREE.Mesh(pressureAngleTextGeo, pressureAngleTextMat);
  pressureAngleTextMesh.position.set(-0.8, 0.25, 1.2);
  pressureAngleTextMesh.rotation.x = -Math.PI / 2;
  pressureAngleTextMesh.visible = false;
  scene.add(pressureAngleTextMesh);

  // Face Width Text
  const faceWidthTextGeo = new THREE.TextGeometry('FACE WIDTH', {
    font: font, size: 0.04, height: 0.01
  });
  const faceWidthTextMat = new THREE.MeshStandardMaterial({ color: 0xffaa00 });
  faceWidthTextMesh = new THREE.Mesh(faceWidthTextGeo, faceWidthTextMat);
  faceWidthTextMesh.position.set(-0.5, 0.5, 0);
  faceWidthTextMesh.visible = false;
  scene.add(faceWidthTextMesh);

  // Clearance Text
  const clearanceTextGeo = new THREE.TextGeometry('CLEARANCE CIRCLE', {
    font: font, size: 0.05, height: 0.01
  });
  const clearanceTextMat = new THREE.MeshStandardMaterial({ color: 0x9900ff });
  clearanceTextMesh = new THREE.Mesh(clearanceTextGeo, clearanceTextMat);
  clearanceTextMesh.position.set(-1.2, 0.22, -0.8);
  clearanceTextMesh.rotation.x = -Math.PI / 2;
  clearanceTextMesh.visible = false;
  scene.add(clearanceTextMesh);
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

// NEW: Clearance Circle
clearanceCircle = new THREE.Mesh(
  new THREE.RingGeometry(0.99, 0.95, 64),
  new THREE.MeshBasicMaterial({ color: 0x9900ff, side: THREE.DoubleSide, transparent: true, opacity: 0.6 })
);
clearanceCircle.rotation.x = -Math.PI / 2;
clearanceCircle.visible = false;
clearanceCircle.position.set(0, 0.20, 0);
scene.add(clearanceCircle);

// Tooth Thickness Lines
const toothThicknessGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, 0.2, 1.14),
  new THREE.Vector3(0, 0.2, -1.14)
]);
const toothThicknessMaterial = new THREE.LineBasicMaterial({ color: 0xff4444, linewidth: 3 });
for (let i = 0; i < 8; i++) {
  const line = new THREE.Line(toothThicknessGeometry, toothThicknessMaterial);
  line.rotation.y = (i * Math.PI) / 4;
  line.visible = false;
  toothThicknessLines.push(line);
  scene.add(line);
}

// Pressure Angle Lines
const pressureAngleGeometry = new THREE.BufferGeometry().setFromPoints([
  new THREE.Vector3(0, 0.2, 0),
  new THREE.Vector3(0.8, 0.2, 0.6)
]);
const pressureAngleMaterial = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 4 });
for (let i = 0; i < 12; i++) {
  const line = new THREE.Line(pressureAngleGeometry, pressureAngleMaterial);
  line.rotation.y = (i * Math.PI) / 6;
  line.visible = false;
  pressureAngleLines.push(line);
  scene.add(line);
}

// Face Width Planes
const faceWidthMaterial = new THREE.MeshStandardMaterial({
  color: 0xffaa00,
  opacity: 0.4,
  transparent: true,
  side: THREE.DoubleSide
});
const faceWidthGeometry = new THREE.PlaneGeometry(2.8, 2.8);

const leftFacePlane = new THREE.Mesh(faceWidthGeometry, faceWidthMaterial);
leftFacePlane.position.set(0, 0, -0.19);
leftFacePlane.visible = false;
faceWidthPlanes.push(leftFacePlane);
scene.add(leftFacePlane);

const rightFacePlane = new THREE.Mesh(faceWidthGeometry, faceWidthMaterial);
rightFacePlane.position.set(0, 0, 0.19);
rightFacePlane.visible = false;
faceWidthPlanes.push(rightFacePlane);
scene.add(rightFacePlane);

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
      document.getElementById('toothThicknessBtn').style.display = 'inline-block';
      document.getElementById('pressureAngleBtn').style.display = 'inline-block';
      document.getElementById('faceWidthBtn').style.display = 'inline-block';
      document.getElementById('clearanceBtn').style.display = 'inline-block';
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

  // Hide other elements
  pitchCircle.visible = false;
  addendumCircle.visible = false;
  dedendumCircle.visible = false;
  rootCircle.visible = false;
  clearanceCircle.visible = false;
  faceWidthPlanes.forEach(plane => plane.visible = false);
  toothThicknessLines.forEach(line => line.visible = false);
  pressureAngleLines.forEach(line => line.visible = false);
  
  if (pitchTextMesh) pitchTextMesh.visible = false;
  if (addendumTextMesh) addendumTextMesh.visible = false;
  if (toothThicknessTextMesh) toothThicknessTextMesh.visible = false;
  if (pressureAngleTextMesh) pressureAngleTextMesh.visible = false;
  if (faceWidthTextMesh) faceWidthTextMesh.visible = false;
  if (clearanceTextMesh) clearanceTextMesh.visible = false;

  // Enhanced camera animation for top land view
  gsap.to(camera.position, {
    x: 0,
    y: 0.5,
    z: 2.5,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    },
    onComplete: () => {
      // Show top land elements with animation
      facePlane.visible = true;
      addGlowEffect(facePlane, 0xff0000);
      
      if (faceTextMesh) {
        faceTextMesh.visible = true;
        // Animate text appearance
        gsap.from(faceTextMesh.scale, {
          x: 0, y: 0, z: 0,
          duration: 0.5,
          ease: "back.out(1.7)"
        });
      }
      
      // Show educational information
      showInfoPanel('topLand');
      
      // Add pulsing effect to highlight the component
      gsap.to(facePlane.material, {
        opacity: 0.8,
        duration: 0.5,
        yoyo: true,
        repeat: 3
      });
    }
  });
});

// PITCH CIRCLE Button
document.getElementById('pitchCircleBtn').addEventListener('click', () => {
  if (!model) return;

  facePlane.visible = false;
  dedendumCircle.visible = false;
  rootCircle.visible = false;
  clearanceCircle.visible = false;
  faceWidthPlanes.forEach(plane => plane.visible = false);
  toothThicknessLines.forEach(line => line.visible = false);
  pressureAngleLines.forEach(line => line.visible = false);

  if (faceTextMesh) faceTextMesh.visible = false;
  if (toothThicknessTextMesh) toothThicknessTextMesh.visible = false;
  if (pressureAngleTextMesh) pressureAngleTextMesh.visible = false;
  if (faceWidthTextMesh) faceWidthTextMesh.visible = false;
  if (clearanceTextMesh) clearanceTextMesh.visible = false;

  // Enhanced camera animation for top-down view
  gsap.to(camera.position, {
    x: 0,
    y: 3,
    z: 0,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    },
    onComplete: () => {
      // Show circles with staggered animation
      setTimeout(() => {
        pitchCircle.visible = true;
        addGlowEffect(pitchCircle, 0x007BFF);
        if (pitchTextMesh) {
          pitchTextMesh.visible = true;
          gsap.from(pitchTextMesh.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.6,
            ease: "back.out(1.7)"
          });
        }
      }, 200);
      
      setTimeout(() => {
        addendumCircle.visible = true;
        addGlowEffect(addendumCircle, 0x00cc66);
        if (addendumTextMesh) {
          addendumTextMesh.visible = true;
          gsap.from(addendumTextMesh.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.6,
            ease: "back.out(1.7)"
          });
        }
      }, 600);
      
      // Show educational information
      showInfoPanel('pitchCircle');
      
      // Add subtle rotating animation to circles
      gsap.to([pitchCircle.rotation, addendumCircle.rotation], {
        z: Math.PI * 2,
        duration: 8,
        ease: "none",
        repeat: -1
      });
      
      document.getElementById('detailsBtn').style.display = 'inline-block';
    }
  });
});

// DETAILS Button
document.getElementById('detailsBtn').addEventListener('click', () => {
  if (!model) return;

  facePlane.visible = false;
  clearanceCircle.visible = false;
  faceWidthPlanes.forEach(plane => plane.visible = false);
  toothThicknessLines.forEach(line => line.visible = false);
  pressureAngleLines.forEach(line => line.visible = false);

  if (faceTextMesh) faceTextMesh.visible = false;
  if (toothThicknessTextMesh) toothThicknessTextMesh.visible = false;
  if (pressureAngleTextMesh) pressureAngleTextMesh.visible = false;
  if (faceWidthTextMesh) faceWidthTextMesh.visible = false;
  if (clearanceTextMesh) clearanceTextMesh.visible = false;

  const backFocus = model.position.clone().add(new THREE.Vector3(0, 0.01, -1));

  // Enhanced camera animation for angled view
  gsap.to(camera.position, {
    x: backFocus.x + 0.5,
    y: backFocus.y + 2,
    z: backFocus.z,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      camera.lookAt(backFocus);
      controls.target.copy(backFocus);
      controls.update();
    },
    onComplete: () => {
      // Show all circles with cascading animation
      const circles = [
        { obj: pitchCircle, delay: 0, color: 0x007BFF },
        { obj: addendumCircle, delay: 300, color: 0x00cc66 },
        { obj: dedendumCircle, delay: 600, color: 0xff6600 },
        { obj: rootCircle, delay: 900, color: 0xcc0000 }
      ];
      
      circles.forEach(({ obj, delay, color }) => {
        setTimeout(() => {
          obj.visible = true;
          addGlowEffect(obj, color);
          
          // Scale animation for each circle
          obj.scale.set(0, 0, 0);
          gsap.to(obj.scale, {
            x: 1, y: 1, z: 1,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)"
          });
        }, delay);
      });
      
      // Show educational information
      setTimeout(() => {
        showInfoPanel('allCircles');
      }, 1200);
      
      // Add gentle pulsing animation to all circles
      circles.forEach(({ obj }) => {
        gsap.to(obj.material, {
          opacity: 0.8,
          duration: 1.5,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut"
        });
      });
    }
  });
});

// TOOTH THICKNESS Button
document.getElementById('toothThicknessBtn').addEventListener('click', () => {
  if (!model) return;

  // Hide other elements
  facePlane.visible = false;
  pitchCircle.visible = false;
  addendumCircle.visible = false;
  dedendumCircle.visible = false;
  rootCircle.visible = false;
  clearanceCircle.visible = false;
  faceWidthPlanes.forEach(plane => plane.visible = false);
  pressureAngleLines.forEach(line => line.visible = false);

  if (faceTextMesh) faceTextMesh.visible = false;
  if (pitchTextMesh) pitchTextMesh.visible = false;
  if (addendumTextMesh) addendumTextMesh.visible = false;
  if (pressureAngleTextMesh) pressureAngleTextMesh.visible = false;
  if (faceWidthTextMesh) faceWidthTextMesh.visible = false;
  if (clearanceTextMesh) clearanceTextMesh.visible = false;

  // Enhanced camera animation for top view
  gsap.to(camera.position, {
    x: 0,
    y: 3.5,
    z: 0,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    },
    onComplete: () => {
      // Show tooth thickness lines with staggered animation
      toothThicknessLines.forEach((line, index) => {
        setTimeout(() => {
          line.visible = true;
          addGlowEffect(line, 0xff4444);
          
          // Scale animation for each line
          line.scale.set(0, 1, 0);
          gsap.to(line.scale, {
            x: 1, z: 1,
            duration: 0.6,
            ease: "back.out(1.7)"
          });
        }, index * 100);
      });
      
      setTimeout(() => {
        if (toothThicknessTextMesh) {
          toothThicknessTextMesh.visible = true;
          gsap.from(toothThicknessTextMesh.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)"
          });
        }
      }, 800);
      
      // Show educational information
      setTimeout(() => {
        showInfoPanel('toothThickness');
      }, 1000);
      
      // Add pulsing animation to lines
      gsap.to(toothThicknessLines.map(line => line.material), {
        opacity: 0.8,
        duration: 1,
        yoyo: true,
        repeat: -1,
        stagger: 0.1
      });
    }
  });
});

// PRESSURE ANGLE Button
document.getElementById('pressureAngleBtn').addEventListener('click', () => {
  if (!model) return;

  // Hide other elements
  facePlane.visible = false;
  pitchCircle.visible = false;
  addendumCircle.visible = false;
  dedendumCircle.visible = false;
  rootCircle.visible = false;
  clearanceCircle.visible = false;
  faceWidthPlanes.forEach(plane => plane.visible = false);
  toothThicknessLines.forEach(line => line.visible = false);

  if (faceTextMesh) faceTextMesh.visible = false;
  if (pitchTextMesh) pitchTextMesh.visible = false;
  if (addendumTextMesh) addendumTextMesh.visible = false;
  if (toothThicknessTextMesh) toothThicknessTextMesh.visible = false;
  if (faceWidthTextMesh) faceWidthTextMesh.visible = false;
  if (clearanceTextMesh) clearanceTextMesh.visible = false;

  // Enhanced camera animation for angled view
  gsap.to(camera.position, {
    x: 2,
    y: 2,
    z: 2,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    },
    onComplete: () => {
      // Show pressure angle lines with animated sequence
      pressureAngleLines.forEach((line, index) => {
        setTimeout(() => {
          line.visible = true;
          addGlowEffect(line, 0x00ffff);
          
          // Scale animation
          line.scale.set(0, 1, 0);
          gsap.to(line.scale, {
            x: 1, z: 1,
            duration: 0.5,
            ease: "power2.out"
          });
        }, index * 80);
      });
      
      setTimeout(() => {
        if (pressureAngleTextMesh) {
          pressureAngleTextMesh.visible = true;
          gsap.from(pressureAngleTextMesh.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.8,
            ease: "elastic.out(1, 0.5)"
          });
        }
      }, 1000);
      
      // Show educational information
      setTimeout(() => {
        showInfoPanel('pressureAngle');
      }, 1200);
      
      // Add flowing animation to pressure angle lines
      pressureAngleLines.forEach((line, index) => {
        gsap.to(line.material, {
          opacity: 0.9,
          duration: 0.8,
          delay: index * 0.1,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut"
        });
      });
    }
  });
});

// FACE WIDTH Button
document.getElementById('faceWidthBtn').addEventListener('click', () => {
  if (!model) return;

  // Hide other elements
  facePlane.visible = false;
  pitchCircle.visible = false;
  addendumCircle.visible = false;
  dedendumCircle.visible = false;
  rootCircle.visible = false;
  clearanceCircle.visible = false;
  toothThicknessLines.forEach(line => line.visible = false);
  pressureAngleLines.forEach(line => line.visible = false);

  if (faceTextMesh) faceTextMesh.visible = false;
  if (pitchTextMesh) pitchTextMesh.visible = false;
  if (addendumTextMesh) addendumTextMesh.visible = false;
  if (toothThicknessTextMesh) toothThicknessTextMesh.visible = false;
  if (pressureAngleTextMesh) pressureAngleTextMesh.visible = false;
  if (clearanceTextMesh) clearanceTextMesh.visible = false;

  // Enhanced camera animation for side view
  gsap.to(camera.position, {
    x: 3,
    y: 0.5,
    z: 0,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    },
    onComplete: () => {
      // Show face width planes with staggered animation
      faceWidthPlanes.forEach((plane, index) => {
        setTimeout(() => {
          plane.visible = true;
          addGlowEffect(plane, 0xffaa00);
          
          // Slide animation
          plane.position.z = index === 0 ? -0.5 : 0.5;
          gsap.to(plane.position, {
            z: index === 0 ? -0.19 : 0.19,
            duration: 1,
            ease: "elastic.out(1, 0.3)"
          });
        }, index * 400);
      });
      
      setTimeout(() => {
        if (faceWidthTextMesh) {
          faceWidthTextMesh.visible = true;
          gsap.from(faceWidthTextMesh.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.8,
            ease: "back.out(1.7)"
          });
        }
      }, 800);
      
      // Show educational information
      setTimeout(() => {
        showInfoPanel('faceWidth');
      }, 1000);
      
      // Add breathing animation to face width planes
      faceWidthPlanes.forEach(plane => {
        gsap.to(plane.material, {
          opacity: 0.6,
          duration: 2,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut"
        });
      });
    }
  });
});

// CLEARANCE CIRCLE Button
document.getElementById('clearanceBtn').addEventListener('click', () => {
  if (!model) return;

  // Hide other elements
  facePlane.visible = false;
  pitchCircle.visible = false;
  addendumCircle.visible = false;
  dedendumCircle.visible = false;
  faceWidthPlanes.forEach(plane => plane.visible = false);
  toothThicknessLines.forEach(line => line.visible = false);
  pressureAngleLines.forEach(line => line.visible = false);

  if (faceTextMesh) faceTextMesh.visible = false;
  if (pitchTextMesh) pitchTextMesh.visible = false;
  if (addendumTextMesh) addendumTextMesh.visible = false;
  if (toothThicknessTextMesh) toothThicknessTextMesh.visible = false;
  if (pressureAngleTextMesh) pressureAngleTextMesh.visible = false;
  if (faceWidthTextMesh) faceWidthTextMesh.visible = false;

  // Enhanced camera animation for top view
  gsap.to(camera.position, {
    x: 0,
    y: 3,
    z: 0,
    duration: 2,
    ease: "power2.inOut",
    onUpdate: () => {
      const center = new THREE.Box3().setFromObject(model).getCenter(new THREE.Vector3());
      camera.lookAt(center);
      controls.target.copy(center);
      controls.update();
    },
    onComplete: () => {
      // Show root circle first, then clearance circle
      setTimeout(() => {
        rootCircle.visible = true;
        addGlowEffect(rootCircle, 0xcc0000);
        
        rootCircle.scale.set(0, 0, 0);
        gsap.to(rootCircle.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)"
        });
      }, 200);
      
      setTimeout(() => {
        clearanceCircle.visible = true;
        addGlowEffect(clearanceCircle, 0x9900ff);
        
        clearanceCircle.scale.set(0, 0, 0);
        gsap.to(clearanceCircle.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)"
        });
      }, 600);
      
      setTimeout(() => {
        if (clearanceTextMesh) {
          clearanceTextMesh.visible = true;
          gsap.from(clearanceTextMesh.scale, {
            x: 0, y: 0, z: 0,
            duration: 0.8,
            ease: "back.out(1.7)"
          });
        }
      }, 1000);
      
      // Show educational information
      setTimeout(() => {
        showInfoPanel('clearance');
      }, 1200);
      
      // Add contrasting pulsing animation to show clearance
      gsap.to(rootCircle.material, {
        opacity: 0.8,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut"
      });
      
      gsap.to(clearanceCircle.material, {
        opacity: 0.9,
        duration: 1.5,
        yoyo: true,
        repeat: -1,
        ease: "sine.inOut",
        delay: 0.75
      });
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
  clearanceCircle.visible = false;
  faceWidthPlanes.forEach(plane => plane.visible = false);
  toothThicknessLines.forEach(line => line.visible = false);
  pressureAngleLines.forEach(line => line.visible = false);

  if (faceTextMesh) faceTextMesh.visible = false;
  if (pitchTextMesh) pitchTextMesh.visible = false;
  if (addendumTextMesh) addendumTextMesh.visible = false;
  if (toothThicknessTextMesh) toothThicknessTextMesh.visible = false;
  if (pressureAngleTextMesh) pressureAngleTextMesh.visible = false;
  if (faceWidthTextMesh) faceWidthTextMesh.visible = false;
  if (clearanceTextMesh) clearanceTextMesh.visible = false;

  // Hide info panel
  hideInfoPanel();

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
  document.getElementById('toothThicknessBtn').style.display = 'none';
  document.getElementById('pressureAngleBtn').style.display = 'none';
  document.getElementById('faceWidthBtn').style.display = 'none';
  document.getElementById('clearanceBtn').style.display = 'none';
  document.getElementById('backBtn').style.display = 'none';
  document.getElementById('detailsBtn').style.display = 'none';
});

// Info panel close button
document.getElementById('closeInfo').addEventListener('click', hideInfoPanel); 