// Birthday entrance decorations - Red carpet, balloon arches, and festive decorations

export interface BalloonAnimation {
  balloon: any;
  baseY: number;
  phase: number;
  speed: number;
}

export function createBirthdayEntrance(scene: any, THREE: any): { 
  carpet: any; 
  balloonAnimations: BalloonAnimation[];
  updateAnimations: (time: number) => void;
} {
  const balloonAnimations: BalloonAnimation[] = [];
  
  // 1. RED CARPET - extending from door to cover the entire path
  // Path bounds: xMin: -2.5, xMax: 0.5, zMin: -18, zMax: 2
  // Door is at (-1, 1.5, -5.85)
  // Carpet should cover from door (z = -5.85) to path end (z = -18)
  const carpetLength = 13; // From -5.85 to -18.85 (long enough to cover path)
  const carpetWidth = 3.2; // Slightly wider than path (path is 3 units: -2.5 to 0.5)
  const carpetGeometry = new THREE.PlaneGeometry(carpetWidth, carpetLength);
  
  // Red velvet material with slight reflection
  const carpetMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xCC0000, // Deep red
    roughness: 0.3, // Slightly shiny for velvet effect
    metalness: 0.1,
    emissive: 0x330000, // Slight glow
    emissiveIntensity: 0.2
  });
  
  const carpet = new THREE.Mesh(carpetGeometry, carpetMaterial);
  carpet.rotation.x = -Math.PI / 2; // Lay flat on ground
  // Position: center at x = -1 (door center), z = -12.35 (center of length from -5.85 to -18.85)
  carpet.position.set(-1, 0.02, -12.35); // Y = 0.02 to avoid z-fighting with ground
  carpet.receiveShadow = true;
  carpet.renderOrder = 1; // Render after ground to avoid z-fighting
  scene.add(carpet);
  
  // 3. BALLOON ARCH at the start of the carpet (near camera/far end)
  // Carpet now extends from z = -5.85 to z = -18.85
  // Arch position: at z = -18 (far end of carpet, near camera)
  const archCenterZ = -18;
  const archHeight = 3.5;
  const archWidth = 4;
  const balloonColors = [
    0xFF0000, // Red
    0xFF6600, // Orange
    0xFFFF00, // Yellow
    0x00FF00, // Green
    0x0000FF, // Blue
    0x8000FF, // Purple
  ];
  
  // Create arch with balloons on both sides and over the top
  // Left side of arch
  for (let i = 0; i < 8; i++) {
    const height = (i / 7) * archHeight; // From 0 to archHeight
    const x = -archWidth / 2 + (i / 7) * (archWidth / 4); // Curved position
    const z = archCenterZ;
    const y = 0.3 + height;
    
    const balloonGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const balloonMaterial = new THREE.MeshStandardMaterial({ 
      color: balloonColors[i % balloonColors.length],
      roughness: 0.3,
      metalness: 0.2
    });
    const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
    balloon.position.set(x, y, z);
    balloon.castShadow = true;
    scene.add(balloon);
    
    // Tali balon
    const stringLength = 0.3;
    const stringGeometry = new THREE.CylinderGeometry(0.005, 0.005, stringLength, 8);
    const stringMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const string = new THREE.Mesh(stringGeometry, stringMaterial);
    string.position.set(x, y - stringLength / 2, z);
    string.rotation.z = Math.PI / 2;
    scene.add(string);
    
    // Add to animation list
    balloonAnimations.push({
      balloon,
      baseY: y,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5
    });
  }
  
  // Right side of arch
  for (let i = 0; i < 8; i++) {
    const height = (i / 7) * archHeight;
    const x = archWidth / 2 - (i / 7) * (archWidth / 4); // Curved position (mirrored)
    const z = archCenterZ;
    const y = 0.3 + height;
    
    const balloonGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const balloonMaterial = new THREE.MeshStandardMaterial({ 
      color: balloonColors[(i + 3) % balloonColors.length],
      roughness: 0.3,
      metalness: 0.2
    });
    const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
    balloon.position.set(x, y, z);
    balloon.castShadow = true;
    scene.add(balloon);
    
    // Tali balon
    const stringLength = 0.3;
    const stringGeometry = new THREE.CylinderGeometry(0.005, 0.005, stringLength, 8);
    const stringMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const string = new THREE.Mesh(stringGeometry, stringMaterial);
    string.position.set(x, y - stringLength / 2, z);
    string.rotation.z = Math.PI / 2;
    scene.add(string);
    
    balloonAnimations.push({
      balloon,
      baseY: y,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5
    });
  }
  
  // Top of arch (connecting both sides)
  for (let i = 0; i < 6; i++) {
    const progress = i / 5; // 0 to 1
    const x = -archWidth / 2 + progress * archWidth;
    const z = archCenterZ;
    const y = 0.3 + archHeight;
    
    const balloonGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const balloonMaterial = new THREE.MeshStandardMaterial({ 
      color: balloonColors[i % balloonColors.length],
      roughness: 0.3,
      metalness: 0.2
    });
    const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
    balloon.position.set(x, y, z);
    balloon.castShadow = true;
    scene.add(balloon);
    
    // Tali balon
    const stringLength = 0.3;
    const stringGeometry = new THREE.CylinderGeometry(0.005, 0.005, stringLength, 8);
    const stringMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const string = new THREE.Mesh(stringGeometry, stringMaterial);
    string.position.set(x, y - stringLength / 2, z);
    string.rotation.z = Math.PI / 2;
    scene.add(string);
    
    balloonAnimations.push({
      balloon,
      baseY: y,
      phase: Math.random() * Math.PI * 2,
      speed: 0.5 + Math.random() * 0.5
    });
  }
  
  // 4. BALLOON DECORATIONS around doorframe
  // Door is at (-1, 1.5, -5.85), width 2 units, height 3 units
  const doorFrameBalloons = [
    // Left side of door
    { x: -2.3, y: 0.5, z: -5.85 },
    { x: -2.3, y: 1.5, z: -5.85 },
    { x: -2.3, y: 2.5, z: -5.85 },
    // Right side of door
    { x: 0.3, y: 0.5, z: -5.85 },
    { x: 0.3, y: 1.5, z: -5.85 },
    { x: 0.3, y: 2.5, z: -5.85 },
    // Top of door
    { x: -1.5, y: 3.3, z: -5.85 },
    { x: -1, y: 3.5, z: -5.85 },
    { x: -0.5, y: 3.3, z: -5.85 },
  ];
  
  doorFrameBalloons.forEach((pos, index) => {
    const balloonGeometry = new THREE.SphereGeometry(0.12, 16, 16);
    const balloonMaterial = new THREE.MeshStandardMaterial({ 
      color: balloonColors[index % balloonColors.length],
      roughness: 0.3,
      metalness: 0.2
    });
    const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
    balloon.position.set(pos.x, pos.y, pos.z);
    balloon.castShadow = true;
    scene.add(balloon);
    
    // Tali balon
    const stringLength = 0.25;
    const stringGeometry = new THREE.CylinderGeometry(0.005, 0.005, stringLength, 8);
    const stringMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const string = new THREE.Mesh(stringGeometry, stringMaterial);
    string.position.set(pos.x, pos.y - stringLength / 2, pos.z);
    string.rotation.z = Math.PI / 2;
    scene.add(string);
    
    balloonAnimations.push({
      balloon,
      baseY: pos.y,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.4
    });
  });
  
  // 5. FLOWER-SHAPED BALLOON CLUSTERS near door
  // Create clusters of 3-4 small balloons together
  const clusterPositions = [
    { x: -2.8, y: 1.5, z: -5.85 },
    { x: 0.8, y: 1.5, z: -5.85 },
    { x: -1, y: 0.3, z: -5.85 },
  ];
  
  clusterPositions.forEach((clusterPos, clusterIndex) => {
    const clusterSize = 3 + Math.floor(Math.random() * 2); // 3 or 4 balloons
    for (let i = 0; i < clusterSize; i++) {
      const angle = (i / clusterSize) * Math.PI * 2;
      const radius = 0.08;
      const x = clusterPos.x + Math.cos(angle) * radius;
      const y = clusterPos.y + Math.sin(angle) * radius;
      const z = clusterPos.z;
      
      const balloonGeometry = new THREE.SphereGeometry(0.08, 12, 12);
      const balloonMaterial = new THREE.MeshStandardMaterial({ 
        color: balloonColors[(clusterIndex * 2 + i) % balloonColors.length],
        roughness: 0.3,
        metalness: 0.2
      });
      const balloon = new THREE.Mesh(balloonGeometry, balloonMaterial);
      balloon.position.set(x, y, z);
      balloon.castShadow = true;
      scene.add(balloon);
      
      balloonAnimations.push({
        balloon,
        baseY: y,
        phase: Math.random() * Math.PI * 2,
        speed: 0.3 + Math.random() * 0.3
      });
    }
  });
  
  // Store base positions for animation
  const basePositions = balloonAnimations.map(anim => ({
    x: anim.balloon.position.x,
    z: anim.balloon.position.z
  }));
  
  // Animation update function
  const updateAnimations = (time: number) => {
    balloonAnimations.forEach((anim, index) => {
      // Gentle floating/bounce animation
      const floatAmount = 0.05; // Small vertical movement
      const bounceAmount = 0.02; // Small horizontal sway
      anim.balloon.position.y = anim.baseY + Math.sin(time * anim.speed + anim.phase) * floatAmount;
      anim.balloon.position.x = basePositions[index].x + Math.sin(time * anim.speed * 0.7 + anim.phase) * bounceAmount;
      anim.balloon.position.z = basePositions[index].z + Math.cos(time * anim.speed * 0.7 + anim.phase) * bounceAmount;
      
      // Slight rotation for more natural look
      anim.balloon.rotation.y += 0.01;
    });
  };
  
  return {
    carpet,
    balloonAnimations,
    updateAnimations
  };
}

// Update lighting for warm, sunset-like tones
export function updateWarmLighting(scene: any, THREE: any) {
  // Remove existing lights (we'll add new ones)
  const lightsToRemove: any[] = [];
  scene.traverse((child: any) => {
    if (child instanceof THREE.Light) {
      lightsToRemove.push(child);
    }
  });
  lightsToRemove.forEach(light => scene.remove(light));
  
  // Warm ambient light (yellowish/sunset tones)
  const ambientLight = new THREE.AmbientLight(0xFFE5B4, 0.7); // Warm white/yellow
  scene.add(ambientLight);
  
  // Warm directional light (sunset direction)
  const directionalLight = new THREE.DirectionalLight(0xFFB347, 1.0); // Orange/yellow
  directionalLight.position.set(-5, 8, 5); // From left-top, simulating sunset
  directionalLight.castShadow = true;
  directionalLight.shadow.mapSize.width = 2048;
  directionalLight.shadow.mapSize.height = 2048;
  directionalLight.shadow.camera.near = 0.5;
  directionalLight.shadow.camera.far = 50;
  directionalLight.shadow.camera.left = -20;
  directionalLight.shadow.camera.right = 20;
  directionalLight.shadow.camera.top = 20;
  directionalLight.shadow.camera.bottom = -20;
  scene.add(directionalLight);
  
  // Additional warm point light near door for welcoming feel
  const pointLight = new THREE.PointLight(0xFFD700, 0.8, 15); // Golden
  pointLight.position.set(-1, 2, -5.85); // Near door
  scene.add(pointLight);
  
  // Update background to warm outdoor environment
  scene.background = new THREE.Color(0xFFE4B5); // Warm beige/sky
  scene.fog = new THREE.Fog(0xFFE4B5, 15, 100); // Warm fog
}

