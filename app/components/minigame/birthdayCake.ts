// Realistic birthday cake with tiers, frosting, sprinkles, and lit candles

export function createRealisticCake(
  THREE: any,
  scene: any,
  position: { x: number; y: number; z: number }
): {
  cakeGroup: any;
  candles: any[];
  flames: any[];
  blowOut: () => void;
  lightUp: () => void;
} {
  const cakeGroup = new THREE.Group();
  const candles: any[] = [];
  const flames: any[] = [];
  let candlesLit = true;

  // Base tier (largest)
  const baseTierGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.15, 32);
  const frostingMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFF8E1, // Cream/white frosting
    roughness: 0.3,
    metalness: 0.0
  });
  const baseTier = new THREE.Mesh(baseTierGeometry, frostingMaterial);
  baseTier.position.set(0, 0.075, 0);
  baseTier.castShadow = true;
  baseTier.receiveShadow = true;
  cakeGroup.add(baseTier);

  // Middle tier
  const middleTierGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.12, 32);
  const middleTier = new THREE.Mesh(middleTierGeometry, frostingMaterial);
  middleTier.position.set(0, 0.21, 0);
  middleTier.castShadow = true;
  middleTier.receiveShadow = true;
  cakeGroup.add(middleTier);

  // Top tier (smallest)
  const topTierGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
  const topTier = new THREE.Mesh(topTierGeometry, frostingMaterial);
  topTier.position.set(0, 0.35, 0);
  topTier.castShadow = true;
  topTier.receiveShadow = true;
  cakeGroup.add(topTier);

  // Sprinkles on each tier (small colorful spheres)
  const sprinkleColors = [0xFF0000, 0x00FF00, 0x0000FF, 0xFFFF00, 0xFF00FF, 0x00FFFF];
  const sprinkleGeometry = new THREE.SphereGeometry(0.008, 8, 8);
  
  // Sprinkles on base tier
  for (let i = 0; i < 15; i++) {
    const angle = (i / 15) * Math.PI * 2;
    const radius = 0.35 + Math.random() * 0.05;
    const sprinkle = new THREE.Mesh(
      sprinkleGeometry,
      new THREE.MeshStandardMaterial({
        color: sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)]
      })
    );
    sprinkle.position.set(
      Math.cos(angle) * radius,
      0.15 + Math.random() * 0.02,
      Math.sin(angle) * radius
    );
    cakeGroup.add(sprinkle);
  }

  // Sprinkles on middle tier
  for (let i = 0; i < 10; i++) {
    const angle = (i / 10) * Math.PI * 2;
    const radius = 0.25 + Math.random() * 0.05;
    const sprinkle = new THREE.Mesh(
      sprinkleGeometry,
      new THREE.MeshStandardMaterial({
        color: sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)]
      })
    );
    sprinkle.position.set(
      Math.cos(angle) * radius,
      0.27 + Math.random() * 0.02,
      Math.sin(angle) * radius
    );
    cakeGroup.add(sprinkle);
  }

  // Sprinkles on top tier
  for (let i = 0; i < 6; i++) {
    const angle = (i / 6) * Math.PI * 2;
    const radius = 0.15 + Math.random() * 0.05;
    const sprinkle = new THREE.Mesh(
      sprinkleGeometry,
      new THREE.MeshStandardMaterial({
        color: sprinkleColors[Math.floor(Math.random() * sprinkleColors.length)]
      })
    );
    sprinkle.position.set(
      Math.cos(angle) * radius,
      0.4 + Math.random() * 0.02,
      Math.sin(angle) * radius
    );
    cakeGroup.add(sprinkle);
  }

  // Candles (5 candles on top tier)
  const candlePositions = [
    { x: 0, y: 0, z: 0 },
    { x: 0.08, y: 0, z: 0 },
    { x: -0.08, y: 0, z: 0 },
    { x: 0, y: 0, z: 0.08 },
    { x: 0, y: 0, z: -0.08 },
  ];

  candlePositions.forEach((pos, index) => {
    // Candle body
    const candleGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.08, 8);
    const candleMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF // White candle
    });
    const candle = new THREE.Mesh(candleGeometry, candleMaterial);
    candle.position.set(pos.x, 0.44, pos.z);
    candle.castShadow = true;
    cakeGroup.add(candle);
    candles.push(candle);

    // Flame (emissive particle)
    const flameGeometry = new THREE.ConeGeometry(0.008, 0.02, 6);
    const flameMaterial = new THREE.MeshStandardMaterial({
      color: 0xFF6600, // Orange flame
      emissive: 0xFF6600,
      emissiveIntensity: 2.0,
      transparent: true,
      opacity: 0.9
    });
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.set(pos.x, 0.52, pos.z);
    flame.rotation.z = Math.random() * 0.2 - 0.1; // Slight random rotation
    flame.userData.baseY = 0.52;
    flame.userData.phase = Math.random() * Math.PI * 2;
    flames.push(flame);
    cakeGroup.add(flame);
  });

  // Position cake group
  cakeGroup.position.set(position.x, position.y, position.z);
  cakeGroup.userData.type = 'cake';
  cakeGroup.userData.interactive = true;
  cakeGroup.userData.interior = true;

  scene.add(cakeGroup);

  // Blow out candles function
  const blowOut = () => {
    if (!candlesLit) return;
    candlesLit = false;
    flames.forEach(flame => {
      flame.visible = false;
    });
    // Trigger confetti effect (can be added later)
  };

  // Light up candles function
  const lightUp = () => {
    if (candlesLit) return;
    candlesLit = true;
    flames.forEach(flame => {
      flame.visible = true;
    });
  };

  // Update function for flame animation
  const updateFlames = (time: number) => {
    if (!candlesLit) return;
    flames.forEach((flame, index) => {
      // Flickering effect
      const flicker = Math.sin(time * 10 + flame.userData.phase) * 0.01;
      flame.position.y = flame.userData.baseY + flicker;
      
      // Slight rotation wobble
      flame.rotation.z = Math.sin(time * 8 + flame.userData.phase) * 0.1;
      
      // Intensity variation
      const intensity = 1.5 + Math.sin(time * 12 + flame.userData.phase) * 0.5;
      flame.material.emissiveIntensity = intensity;
    });
  };

  // Store update function
  cakeGroup.userData.updateFlames = updateFlames;

  return { cakeGroup, candles, flames, blowOut, lightUp };
}



