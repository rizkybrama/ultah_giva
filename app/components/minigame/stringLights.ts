// String/fairy lights system with twinkle animation

export interface StringLightConfig {
  pathPoints: { x: number; y: number; z: number }[];
  bulbCount: number;
  bulbSpacing: number;
  bulbSize: number;
  cableColor: number;
  bulbColor: number;
  warmWhite: boolean;
}

export function createStringLights(
  THREE: any,
  scene: any,
  config: StringLightConfig
): {
  bulbs: any[];
  cables: any[];
  update: (time: number) => void;
} {
  const { pathPoints, bulbCount, bulbSpacing, bulbSize, cableColor, bulbColor, warmWhite } = config;
  
  const bulbs: any[] = [];
  const cables: any[] = [];
  const bulbIntensities: number[] = [];
  const bulbPhases: number[] = [];

  // Create cable along path
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const start = pathPoints[i];
    const end = pathPoints[i + 1];
    
    const distance = Math.sqrt(
      Math.pow(end.x - start.x, 2) +
      Math.pow(end.y - start.y, 2) +
      Math.pow(end.z - start.z, 2)
    );
    
    const cableGeometry = new THREE.CylinderGeometry(0.005, 0.005, distance, 8);
    const cableMaterial = new THREE.MeshStandardMaterial({ 
      color: cableColor,
      emissive: warmWhite ? 0x444444 : 0x000000,
      emissiveIntensity: 0.1
    });
    const cable = new THREE.Mesh(cableGeometry, cableMaterial);
    
    // Position and rotate cable
    const midX = (start.x + end.x) / 2;
    const midY = (start.y + end.y) / 2;
    const midZ = (start.z + end.z) / 2;
    cable.position.set(midX, midY, midZ);
    
    // Calculate rotation to align with path
    const dx = end.x - start.x;
    const dy = end.y - start.y;
    const dz = end.z - start.z;
    const length = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    if (length > 0) {
      const angleY = Math.atan2(dx, dz);
      const angleX = -Math.asin(dy / length);
      cable.rotation.y = angleY;
      cable.rotation.x = angleX;
    }
    
    cables.push(cable);
    scene.add(cable);
  }

  // Create bulbs along path
  let totalDistance = 0;
  const segmentDistances: number[] = [];
  for (let i = 0; i < pathPoints.length - 1; i++) {
    const start = pathPoints[i];
    const end = pathPoints[i + 1];
    const dist = Math.sqrt(
      Math.pow(end.x - start.x, 2) +
      Math.pow(end.y - start.y, 2) +
      Math.pow(end.z - start.z, 2)
    );
    segmentDistances.push(dist);
    totalDistance += dist;
  }

  // Distribute bulbs along path
  for (let i = 0; i < bulbCount; i++) {
    const position = (i * bulbSpacing) % totalDistance;
    
    // Find which segment this position falls in
    let accumulatedDist = 0;
    let segmentIndex = 0;
    for (let j = 0; j < segmentDistances.length; j++) {
      if (accumulatedDist + segmentDistances[j] >= position) {
        segmentIndex = j;
        break;
      }
      accumulatedDist += segmentDistances[j];
    }
    
    const segmentStart = pathPoints[segmentIndex];
    const segmentEnd = pathPoints[segmentIndex + 1];
    const segmentProgress = (position - accumulatedDist) / segmentDistances[segmentIndex];
    
    const bulbX = segmentStart.x + (segmentEnd.x - segmentStart.x) * segmentProgress;
    const bulbY = segmentStart.y + (segmentEnd.y - segmentStart.y) * segmentProgress;
    const bulbZ = segmentStart.z + (segmentEnd.z - segmentStart.z) * segmentProgress;
    
    // Create bulb
    const bulbGeometry = new THREE.SphereGeometry(bulbSize, 8, 8);
    const bulbMaterial = new THREE.MeshStandardMaterial({
      color: warmWhite ? 0xFFF8E1 : bulbColor,
      emissive: warmWhite ? 0xFFF8E1 : bulbColor,
      emissiveIntensity: 1.0
    });
    const bulb = new THREE.Mesh(bulbGeometry, bulbMaterial);
    bulb.position.set(bulbX, bulbY, bulbZ);
    
    bulbs.push(bulb);
    bulbIntensities.push(1.0);
    bulbPhases.push(Math.random() * Math.PI * 2); // Random phase for twinkle
    
    scene.add(bulb);
  }

  // Update function for twinkle animation
  const update = (time: number) => {
    bulbs.forEach((bulb, index) => {
      // Twinkle effect: intensity varies with sine wave + random phase
      const baseIntensity = 0.7;
      const variation = 0.3;
      const twinkleSpeed = 2.0 + Math.sin(bulbPhases[index]) * 0.5; // Varying speed per bulb
      const intensity = baseIntensity + variation * Math.sin(time * twinkleSpeed + bulbPhases[index]);
      
      bulbIntensities[index] = intensity;
      bulb.material.emissiveIntensity = intensity;
      
      // Slight scale variation for extra twinkle
      const scale = 1.0 + (intensity - baseIntensity) * 0.2;
      bulb.scale.set(scale, scale, scale);
    });
  };

  return { bulbs, cables, update };
}

// Create exterior string lights (door frame)
export function createExteriorStringLights(
  THREE: any,
  scene: any,
  doorPosition: { x: number; y: number; z: number },
  doorWidth: number = 2,
  doorHeight: number = 3
): { bulbs: any[]; cables: any[]; update: (time: number) => void } {
  // Path around door frame: top-left -> top-right -> bottom-right -> bottom-left -> top-left
  const pathPoints = [
    { x: doorPosition.x - doorWidth / 2, y: doorPosition.y + doorHeight / 2, z: doorPosition.z }, // Top-left
    { x: doorPosition.x + doorWidth / 2, y: doorPosition.y + doorHeight / 2, z: doorPosition.z }, // Top-right
    { x: doorPosition.x + doorWidth / 2, y: doorPosition.y - doorHeight / 2, z: doorPosition.z }, // Bottom-right
    { x: doorPosition.x - doorWidth / 2, y: doorPosition.y - doorHeight / 2, z: doorPosition.z }, // Bottom-left
    { x: doorPosition.x - doorWidth / 2, y: doorPosition.y + doorHeight / 2, z: doorPosition.z }, // Back to top-left
  ];
  
  return createStringLights(THREE, scene, {
    pathPoints,
    bulbCount: 20,
    bulbSpacing: 0.4,
    bulbSize: 0.03,
    cableColor: 0x2C2C2C,
    bulbColor: 0xFFF8E1,
    warmWhite: true
  });
}

// Create interior string lights (ceiling perimeter)
export function createInteriorStringLights(
  THREE: any,
  scene: any,
  roomBounds: { xMin: number; xMax: number; zMin: number; zMax: number },
  ceilingHeight: number = 2.8
): { bulbs: any[]; cables: any[]; update: (time: number) => void } {
  const { xMin, xMax, zMin, zMax } = roomBounds;
  
  // Path along ceiling perimeter: front-left -> front-right -> back-right -> back-left -> front-left
  const pathPoints = [
    { x: xMin, y: ceilingHeight, z: zMin }, // Front-left
    { x: xMax, y: ceilingHeight, z: zMin }, // Front-right
    { x: xMax, y: ceilingHeight, z: zMax }, // Back-right
    { x: xMin, y: ceilingHeight, z: zMax }, // Back-left
    { x: xMin, y: ceilingHeight, z: zMin }, // Back to front-left
  ];
  
  return createStringLights(THREE, scene, {
    pathPoints,
    bulbCount: 40,
    bulbSpacing: 0.5,
    bulbSize: 0.025,
    cableColor: 0x2C2C2C,
    bulbColor: 0xFFF8E1,
    warmWhite: true
  });
}



