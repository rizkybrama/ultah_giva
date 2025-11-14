// Scene setup helper - creates basic scene, camera, renderer, lighting, ground
import { createPlayerCharacter } from './playerCharacter';
import { createGuideCharacter } from './guideCharacter';
import { createBirthdayEntrance, updateWarmLighting } from './birthdayEntrance';
import { createExteriorStringLights, createInteriorStringLights } from './stringLights';
import { HOUSE_BOUNDS } from './validationHelpers';

export interface SceneSetupResult {
  scene: any;
  camera: any;
  renderer: any;
  ground: any;
  houseGroup: any;
  door: any;
  player: any;
  guide: any;
  collisionObjects: any[];
  birthdayEntrance?: {
    carpet: any;
    balloonAnimations: any[];
    updateAnimations: (time: number) => void;
  };
  exteriorStringLights?: {
    bulbs: any[];
    cables: any[];
    update: (time: number) => void;
  };
  interiorStringLights?: {
    bulbs: any[];
    cables: any[];
    update: (time: number) => void;
  };
}

export function createSceneSetup(canvas: HTMLCanvasElement, THREE: any): SceneSetupResult {
  // Detect mobile device for performance optimization
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.innerWidth <= 768);
  
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xDCEFE7); // Mint pastel background
  scene.fog = new THREE.Fog(0xDCEFE7, 10, 150); // Perpanjang fog sampai 150 unit agar elemen laut terlihat

  // Camera - Start OUTSIDE house, looking at door from front
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  // Door is at (-1, 1.5, -5.85) (center position)
  // Position camera OUTSIDE, farther away to see the door and house better (zoom out)
  camera.position.set(-1, 3.5, -12); // Farther away, higher up, to see door and house clearly
  camera.lookAt(-1, 1.5, -5.85); // Look directly at door center

  // Renderer - Optimize for mobile
  const renderer = new THREE.WebGLRenderer({ 
    canvas: canvas,
    antialias: !isMobile, // Disable antialiasing on mobile for better performance
    powerPreference: 'high-performance' // Prefer performance over quality
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  // Lower pixel ratio on mobile for better performance
  renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = !isMobile; // Disable shadows on mobile for better performance
  if (!isMobile) {
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Use soft shadows only on desktop
  }

  // Lighting - Optimize for mobile
  const ambientLight = new THREE.AmbientLight(0xffffff, isMobile ? 0.8 : 0.6); // Brighter ambient on mobile to compensate for no shadows
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, isMobile ? 0.4 : 0.8);
  directionalLight.position.set(10, 10, 5);
  directionalLight.castShadow = !isMobile; // Disable shadow casting on mobile
  if (!isMobile) {
    directionalLight.shadow.mapSize.width = 1024;
    directionalLight.shadow.mapSize.height = 1024;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
  }
  scene.add(directionalLight);

  // Ground - Brown with green grass in garden area, beach sand in tree/mountain areas
  // Create multiple ground sections for different materials
  
  // Main ground - Brown soil for garden area (around house)
  const groundGeometry = new THREE.PlaneGeometry(500, 500);
  const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B4513, // Brown soil
    roughness: 0.9 
  });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = !isMobile; // Disable shadows on mobile
  ground.renderOrder = 0;
  scene.add(ground);

  // Green grass overlay in garden area (around house, excluding path)
  // Garden area: roughly within 30 units from house center
  const grassGeometry = new THREE.PlaneGeometry(60, 60);
  const grassMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x228B22, // Forest green
    roughness: 0.8,
    transparent: true,
    opacity: 0.6 // Semi-transparent to blend with brown
  });
  const grass = new THREE.Mesh(grassGeometry, grassMaterial);
  grass.rotation.x = -Math.PI / 2;
  grass.position.set(0, 0.01, 9); // Center at house center (z=9 is middle of house)
  grass.receiveShadow = true;
  grass.renderOrder = 0.5;
  scene.add(grass);

  // Player (Giva) - create character with connected body parts (no gap between sleeves and fists)
  const player = createPlayerCharacter(THREE, scene);

  // Guide character (Erbe - cowo berkacamata) - akan memandu Giva merayakan ulang tahun
  const guide = createGuideCharacter(THREE, scene);
  guide.userData.name = 'Erbe'; // Set name for dialog system

  // House (simple structure)
  const houseGroup = new THREE.Group();

  // House walls
  const wallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFBEAEC, // Pink pastel
    roughness: 0.6 
  });

  // Front wall - Create opening for door (2 units wide, 3 units tall)
  // Door center is at x = -1, so door spans from x = -2 to x = 0
  // Door bottom is at y = 0, top is at y = 3
  
  // Left part of wall (before door) - akan dibuat dengan space untuk jendela di bawah
  
  // Right part of wall (after door) - akan dibuat dengan space untuk jendela di bawah
  
  // Top part of wall (above door) - from y = 3.1 to y = 6, spans door width (x = -2 to x = 0)
  const topWallHeight = 2.9; // 6 - 3.1 = 2.9
  const topWallWidth = 2.2; // Slightly wider than door (0.1 margin on each side)
  const topWallPartGeometry = new THREE.BoxGeometry(topWallWidth, topWallHeight, 0.2);
  const topWallPart = new THREE.Mesh(topWallPartGeometry, wallMaterial);
  topWallPart.position.set(-1, 4.55, -6.1); // Center: (-1, (3.1 + 6) / 2 = 4.55)
  houseGroup.add(topWallPart);
  
  // Bottom part of wall (below door) - from y = 0 to y = -0.1 (ground level)
  const bottomWallHeight = 0.1;
  const bottomWallWidth = 2.2; // Same width as top
  const bottomWallPartGeometry = new THREE.BoxGeometry(bottomWallWidth, bottomWallHeight, 0.2);
  const bottomWallPart = new THREE.Mesh(bottomWallPartGeometry, wallMaterial);
  bottomWallPart.position.set(-1, -0.05, -6.1); // Center: (-1, -0.05)
  houseGroup.add(bottomWallPart);

  // Back wall - Diperbesar SIGNIFIKAN: dari 24 menjadi 40 unit lebar
  const backWallGeometry = new THREE.BoxGeometry(40, 6, 0.2);
  const backWall = new THREE.Mesh(backWallGeometry, wallMaterial);
  backWall.position.set(0, 3, 24); // Diperbesar dari z=14 menjadi z=24 (panjang total 30 unit)
  houseGroup.add(backWall);

  // Side walls - Diperbesar SIGNIFIKAN: panjang dari 20 menjadi 30 unit
  const sideWallGeometry = new THREE.BoxGeometry(0.2, 6, 30);
  const leftWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
  leftWall.position.set(-20, 3, 9); // Diperbesar dari x=-12 menjadi x=-20, z=4 menjadi z=9 (tengah 30 unit)
  houseGroup.add(leftWall);

  const rightWall = new THREE.Mesh(sideWallGeometry, wallMaterial);
  rightWall.position.set(20, 3, 9); // Diperbesar dari x=12 menjadi x=20, z=4 menjadi z=9 (tengah 30 unit)
  houseGroup.add(rightWall);

  // Windows - Jendela yang bisa melihat ke dalam
  // Window frame material (same as door frame)
  const windowFrameMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x6B4423, // Dark brown wood
    roughness: 0.7,
    metalness: 0.1
  });
  
  // Window glass material - HILANGKAN KACA SAMA SEKALI untuk menghilangkan refleksi
  // Kita akan buat kaca dengan opacity 0 (tidak terlihat) atau tidak pakai kaca sama sekali
  // Hanya frame jendela yang terlihat, tidak ada kaca yang memantulkan
  // const windowGlassMaterial = null; // Tidak pakai kaca sama sekali
  
  // Atau jika masih ingin ada kaca sebagai visual guide, gunakan opacity 0
  const windowGlassMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xffffff,
    transparent: true,
    opacity: 0, // SEPENUHNYA INVISIBLE - tidak ada refleksi sama sekali
    side: THREE.DoubleSide,
    depthWrite: false,
    fog: false,
    visible: false // Langsung hide agar tidak ada rendering
  });
  
  const windowFrameWidth = 0.1;
  const windowWidth = 2.0;
  const windowHeight = 2.0;
  
  // Window 1 - Di kanan pintu (right wall part)
  const window1Group = new THREE.Group();
  
  // Window frame (left, right, top, bottom)
  const window1LeftFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowFrameWidth, windowHeight + 0.2, 0.15),
    windowFrameMaterial
  );
  window1LeftFrame.position.set(2.5, 2.5, -6.05);
  window1Group.add(window1LeftFrame);
  
  const window1RightFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowFrameWidth, windowHeight + 0.2, 0.15),
    windowFrameMaterial
  );
  window1RightFrame.position.set(4.5, 2.5, -6.05);
  window1Group.add(window1RightFrame);
  
  const window1TopFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth + 0.2, windowFrameWidth, 0.15),
    windowFrameMaterial
  );
  window1TopFrame.position.set(3.5, 3.5, -6.05);
  window1Group.add(window1TopFrame);
  
  const window1BottomFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth + 0.2, windowFrameWidth, 0.15),
    windowFrameMaterial
  );
  window1BottomFrame.position.set(3.5, 1.5, -6.05);
  window1Group.add(window1BottomFrame);
  
  // Window glass - HILANGKAN KACA SAMA SEKALI untuk menghilangkan refleksi
  // Tidak ada mesh kaca, hanya frame jendela saja
  // Ini memungkinkan melihat interior tanpa refleksi dari luar
  // const window1Glass = null; // Tidak ada kaca sama sekali - hanya opening
  
  // Tambahkan window group ke scene (bukan houseGroup agar bisa melihat ke dalam)
  scene.add(window1Group);
  
  // Window 2 - Di kiri pintu (left wall part)
  const window2Group = new THREE.Group();
  
  // Window frame
  const window2LeftFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowFrameWidth, windowHeight + 0.2, 0.15),
    windowFrameMaterial
  );
  window2LeftFrame.position.set(-5.5, 2.5, -6.05);
  window2Group.add(window2LeftFrame);
  
  const window2RightFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowFrameWidth, windowHeight + 0.2, 0.15),
    windowFrameMaterial
  );
  window2RightFrame.position.set(-3.5, 2.5, -6.05);
  window2Group.add(window2RightFrame);
  
  const window2TopFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth + 0.2, windowFrameWidth, 0.15),
    windowFrameMaterial
  );
  window2TopFrame.position.set(-4.5, 3.5, -6.05);
  window2Group.add(window2TopFrame);
  
  const window2BottomFrame = new THREE.Mesh(
    new THREE.BoxGeometry(windowWidth + 0.2, windowFrameWidth, 0.15),
    windowFrameMaterial
  );
  window2BottomFrame.position.set(-4.5, 1.5, -6.05);
  window2Group.add(window2BottomFrame);
  
  // Window glass - HILANGKAN KACA SAMA SEKALI untuk menghilangkan refleksi
  // Tidak ada mesh kaca, hanya frame jendela saja
  // const window2Glass = null; // Tidak ada kaca sama sekali - hanya opening
  
  // Tambahkan window group ke scene
  scene.add(window2Group);
  
  // Buat opening di dinding untuk jendela agar bisa melihat ke dalam
  // Potong dinding di area jendela dengan membuat dinding menjadi beberapa bagian
  
  // Update right wall part untuk membuat space jendela
  // Right wall part: dari x = 0.1 sampai x = 8
  // Jendela di x = 2.5 sampai x = 4.5, jadi kita perlu memotong bagian ini
  
  // Right wall part sebelum jendela: dari x = 0.1 sampai x = 2.4
  // Rumah sekarang lebih besar: x = -12 sampai x = 12 (total 24 unit)
  const rightWallPart1Width = 2.3; // 2.4 - 0.1 = 2.3
  const rightWallPart1Geometry = new THREE.BoxGeometry(rightWallPart1Width, 6, 0.2);
  const rightWallPart1 = new THREE.Mesh(rightWallPart1Geometry, wallMaterial);
  rightWallPart1.position.set(1.25, 3, -6.1); // Center: (0.1 + 2.4) / 2 = 1.25
  houseGroup.add(rightWallPart1);
  
  // Right wall part setelah jendela: dari x = 4.6 sampai x = 20 (diperbesar dari 12 menjadi 20)
  const rightWallPart2Width = 15.4; // 20 - 4.6 = 15.4 (diperbesar SIGNIFIKAN)
  const rightWallPart2Geometry = new THREE.BoxGeometry(rightWallPart2Width, 6, 0.2);
  const rightWallPart2 = new THREE.Mesh(rightWallPart2Geometry, wallMaterial);
  rightWallPart2.position.set(12.3, 3, -6.1); // Center: (4.6 + 20) / 2 = 12.3
  houseGroup.add(rightWallPart2);
  
  // Right wall part di atas jendela: dari y = 3.6 sampai y = 6, lebar jendela + frame
  // Jendela: y = 1.5 sampai y = 3.5, jadi di atas jendela: y = 3.6 sampai y = 6
  const rightWallTopWidth = 2.2; // window width + frame
  const rightWallTopHeight = 2.4; // 6 - 3.6 = 2.4
  const rightWallTopGeometry = new THREE.BoxGeometry(rightWallTopWidth, rightWallTopHeight, 0.2);
  const rightWallTop = new THREE.Mesh(rightWallTopGeometry, wallMaterial);
  rightWallTop.position.set(3.5, 4.8, -6.1); // Center: (3.6 + 6) / 2 = 4.8
  houseGroup.add(rightWallTop);
  
  // Right wall part di bawah jendela: dari y = 0 sampai y = 1.4
  // Jendela: y = 1.5 sampai y = 3.5, jadi di bawah jendela: y = 0 sampai y = 1.4
  const rightWallBottomHeight = 1.4;
  const rightWallBottomGeometry = new THREE.BoxGeometry(rightWallTopWidth, rightWallBottomHeight, 0.2);
  const rightWallBottom = new THREE.Mesh(rightWallBottomGeometry, wallMaterial);
  rightWallBottom.position.set(3.5, 0.7, -6.1); // Center: (0 + 1.4) / 2 = 0.7
  houseGroup.add(rightWallBottom);
  
  // IMPORTANT: Area jendela (x = 2.5 sampai 4.5, y = 1.5 sampai 3.5) TIDAK ADA DINDING
  // Ini memungkinkan melihat ke dalam rumah melalui jendela
  
  // Hapus rightWallPart yang lama dan ganti dengan bagian-bagian baru
  // (rightWallPart sudah tidak digunakan, jadi kita sudah membuat penggantinya di atas)
  
  // Update left wall part untuk membuat space jendela 2
  // Left wall part: dari x = -8 sampai x = -2.1
  // Jendela di x = -5.5 sampai x = -3.5, jadi kita perlu memotong bagian ini
  
  // Left wall part sebelum jendela: dari x = -20 sampai x = -5.6 (diperbesar SIGNIFIKAN dari -12 menjadi -20)
  const leftWallPart1Width = 14.4; // -5.6 - (-20) = 14.4 (diperbesar SIGNIFIKAN)
  const leftWallPart1Geometry = new THREE.BoxGeometry(leftWallPart1Width, 6, 0.2);
  const leftWallPart1 = new THREE.Mesh(leftWallPart1Geometry, wallMaterial);
  leftWallPart1.position.set(-12.8, 3, -6.1); // Center: (-20 + -5.6) / 2 = -12.8
  houseGroup.add(leftWallPart1);
  
  // Left wall part setelah jendela: dari x = -3.4 sampai x = -2.1
  const leftWallPart2Width = 1.3; // -2.1 - (-3.4) = 1.3
  const leftWallPart2Geometry = new THREE.BoxGeometry(leftWallPart2Width, 6, 0.2);
  const leftWallPart2 = new THREE.Mesh(leftWallPart2Geometry, wallMaterial);
  leftWallPart2.position.set(-2.75, 3, -6.1); // Center: (-3.4 + -2.1) / 2 = -2.75
  houseGroup.add(leftWallPart2);
  
  // Left wall part di atas jendela: y = 3.6 sampai y = 6
  const leftWallTopWidth = 2.2;
  const leftWallTopHeight = 2.4;
  const leftWallTopGeometry = new THREE.BoxGeometry(leftWallTopWidth, leftWallTopHeight, 0.2);
  const leftWallTop = new THREE.Mesh(leftWallTopGeometry, wallMaterial);
  leftWallTop.position.set(-4.5, 4.8, -6.1);
  houseGroup.add(leftWallTop);
  
  // Left wall part di bawah jendela: y = 0 sampai y = 1.4
  const leftWallBottomHeight = 1.4;
  const leftWallBottomGeometry = new THREE.BoxGeometry(leftWallTopWidth, leftWallBottomHeight, 0.2);
  const leftWallBottom = new THREE.Mesh(leftWallBottomGeometry, wallMaterial);
  leftWallBottom.position.set(-4.5, 0.7, -6.1);
  houseGroup.add(leftWallBottom);
  
  // IMPORTANT: Area jendela 2 (x = -5.5 sampai -3.5, y = 1.5 sampai 3.5) TIDAK ADA DINDING
  // Ini memungkinkan melihat ke dalam rumah melalui jendela

  // Roof - Diperbesar SIGNIFIKAN sesuai ukuran rumah baru
  // Rumah sekarang: lebar 40 (x: -20 sampai 20), panjang 30 (z: -6 sampai 24)
  // Diagonal rumah: sqrt(40^2 + 30^2) = 50, jadi radius roof perlu sekitar 25-26
  const roofGeometry = new THREE.ConeGeometry(26, 2.5, 4);
  const roofMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xE7C873, // Gold accent
    roughness: 0.5 
  });
  const roof = new THREE.Mesh(roofGeometry, roofMaterial);
  roof.position.set(0, 7, 9); // Center di z=9 (tengah antara -6 dan 24)
  roof.rotation.y = Math.PI / 4;
  houseGroup.add(roof);

  // Door - STATIC, always closed
  // Create a textured door with frame and panels for realism
  const doorGroup = new THREE.Group();
  
  // Door frame (thick border around door)
  const frameMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x6B4423, // Dark brown wood
    roughness: 0.7,
    metalness: 0.1
  });
  
  // Vertical frame parts
  const frameThickness = 0.15;
  const frameWidth = 0.1;
  
  // Left frame
  const leftFrameGeometry = new THREE.BoxGeometry(frameWidth, 3.2, 0.2);
  const leftFrame = new THREE.Mesh(leftFrameGeometry, frameMaterial);
  leftFrame.position.set(-1.05, 1.5, -5.9);
  doorGroup.add(leftFrame);
  
  // Right frame
  const rightFrameGeometry = new THREE.BoxGeometry(frameWidth, 3.2, 0.2);
  const rightFrame = new THREE.Mesh(rightFrameGeometry, frameMaterial);
  rightFrame.position.set(0.05, 1.5, -5.9);
  doorGroup.add(rightFrame);
  
  // Top frame
  const topFrameGeometry = new THREE.BoxGeometry(2.2, frameWidth, 0.2);
  const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
  topFrame.position.set(-1, 3.05, -5.9);
  doorGroup.add(topFrame);
  
  // Bottom frame
  const bottomFrameGeometry = new THREE.BoxGeometry(2.2, frameWidth, 0.2);
  const bottomFrame = new THREE.Mesh(bottomFrameGeometry, frameMaterial);
  bottomFrame.position.set(-1, -0.05, -5.9);
  doorGroup.add(bottomFrame);
  
  // Main door panel (the actual door)
  const doorWidth = 2.1;
  const doorHeight = 3.0;
  const doorThickness = 0.35;
  const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorThickness);
  const doorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x8B6F47, // Brown door
    roughness: 0.8,
    metalness: 0.1
  });
  const door = new THREE.Mesh(doorGeometry, doorMaterial);
  door.position.set(-1.05, 1.5, -5.85);
  door.castShadow = true;
  door.receiveShadow = true;
  door.userData = { type: 'door', static: true, position: new THREE.Vector3(-1, 1.5, -5.85) };
  doorGroup.add(door);
  
  // Door panels (raised panels for texture)
  const panelMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x654321, // Darker brown for panels
    roughness: 0.9,
    metalness: 0.05
  });
  
  // Top panel
  const topPanelGeometry = new THREE.BoxGeometry(1.6, 0.8, 0.05);
  const topPanel = new THREE.Mesh(topPanelGeometry, panelMaterial);
  topPanel.position.set(-1, 2.3, -5.78);
  doorGroup.add(topPanel);
  
  // Middle panel
  const middlePanelGeometry = new THREE.BoxGeometry(1.6, 0.8, 0.05);
  const middlePanel = new THREE.Mesh(middlePanelGeometry, panelMaterial);
  middlePanel.position.set(-1, 1.5, -5.78);
  doorGroup.add(middlePanel);
  
  // Bottom panel
  const bottomPanelGeometry = new THREE.BoxGeometry(1.6, 0.8, 0.05);
  const bottomPanel = new THREE.Mesh(bottomPanelGeometry, panelMaterial);
  bottomPanel.position.set(-1, 0.7, -5.78);
  doorGroup.add(bottomPanel);
  
  // Door handle material (shared)
  const handleMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xFFD700, // Gold handle
    metalness: 0.9,
    roughness: 0.2,
    emissive: 0xFFD700,
    emissiveIntensity: 0.3
  });
  
  // Door handle geometry (shared)
  const handleGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.1, 16);
  
  // Door handle OUTSIDE (di luar rumah) - di sebelah kanan pintu
  // Pintu center di x = -1.05, lebar 2.1, jadi:
  // - Right edge: -1.05 + 1.05 = 0.0
  // - Gagang di pinggir kanan, sedikit masuk dari edge (sekitar 0.05-0.1 dari edge)
  // - z position: pintu di -5.85, thickness 0.35, front di -6.025, gagang protruding di -5.73
  const doorHandleOutside = new THREE.Mesh(handleGeometry, handleMaterial);
  doorHandleOutside.rotation.z = Math.PI / 2; // Rotate to horizontal
  doorHandleOutside.position.set(-0.05, 1.5, -6); // Di kanan pintu, tepat di pinggir kanan, protruding ke luar
  doorGroup.add(doorHandleOutside);
  
  // Door handle INSIDE (di dalam rumah) - di sebelah kiri pintu dari perspektif dalam
  // Dari perspektif dalam, gagang biasanya di sebelah kiri pintu
  // Pintu center di x = -1.05, lebar 2.1, jadi:
  // - Left edge: -1.05 - 1.05 = -2.1
  // - Gagang di pinggir kiri, sedikit masuk dari edge (sekitar 0.05-0.1 dari edge)
  // - z position: pintu di -5.85, thickness 0.35, back di -5.675, gagang di back surface
  const doorHandleInside = new THREE.Mesh(handleGeometry, handleMaterial);
  doorHandleInside.rotation.z = Math.PI / 2; // Rotate to horizontal
  doorHandleInside.position.set(-0.05, 1.5, -5.675); // Di kiri pintu, tepat di pinggir kiri, di sisi dalam pintu
  doorGroup.add(doorHandleInside);
  
  // Keyhole decoration (di tengah pintu, di luar)
  const keyholeGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16);
  const keyholeMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333333, // Dark metal
    metalness: 0.8,
    roughness: 0.3
  });
  const keyhole = new THREE.Mesh(keyholeGeometry, keyholeMaterial);
  keyhole.position.set(-0.5, 1.5, -5.73); // Di tengah-tengah area gagang luar
  doorGroup.add(keyhole);
  
  // Position door group
  doorGroup.position.set(0, 0, 0);
  doorGroup.castShadow = true;
  doorGroup.receiveShadow = true;
  
  // Add door group to scene directly, NOT to houseGroup, so it's always visible from outside
  scene.add(doorGroup);
  
  // Store the main door mesh for collision detection
  const doorMesh = door;

  scene.add(houseGroup);

  // Store all collidable objects
  const collisionObjects: any[] = [];
  
  // Add house walls to collision
  houseGroup.traverse((child: any) => {
    if (child instanceof THREE.Mesh) {
      // Mark walls as non-passable collision objects
      if (!child.userData) {
        child.userData = {};
      }
      child.userData.type = 'wall';
      child.userData.passable = false; // Tembok tidak bisa ditembus
      collisionObjects.push(child);
    }
  });
  
  // Add door to collision objects separately
  collisionObjects.push(doorMesh);

  // Create birthday entrance decorations (red carpet, balloon arches, etc.)
  const birthdayEntrance = createBirthdayEntrance(scene, THREE);
  
  // Create exterior string lights (door frame)
  const exteriorStringLights = createExteriorStringLights(
    THREE,
    scene,
    { x: -1, y: 1.5, z: -5.85 }, // Door position
    2, // Door width
    3  // Door height
  );
  
  // Create interior string lights (ceiling perimeter)
  const interiorStringLights = createInteriorStringLights(
    THREE,
    scene,
    HOUSE_BOUNDS, // Room bounds
    2.8 // Ceiling height
  );
  
  // Update lighting to warm, sunset-like tones
  updateWarmLighting(scene, THREE);

  return {
    scene,
    camera,
    renderer,
    ground,
    houseGroup,
    door: doorMesh, // Return the main door mesh for reference
    player,
    guide,
    collisionObjects,
    birthdayEntrance, // Return for animation updates
    exteriorStringLights,
    interiorStringLights
  };
}

