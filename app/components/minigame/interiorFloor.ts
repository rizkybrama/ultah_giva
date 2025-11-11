// Interior floor with ceramic tiles - realistic texture with grout lines

export function createCeramicTileFloor(scene: any, THREE: any, houseBounds: { xMin: number; xMax: number; zMin: number; zMax: number }): any {
  // Create ceramic tile texture using canvas
  const tileSize = 256; // Canvas size
  const tileUnitSize = 0.5; // Size of each tile in 3D units
  const groutWidth = 0.02; // Width of grout lines in 3D units
  
  const canvas = document.createElement('canvas');
  canvas.width = tileSize;
  canvas.height = tileSize;
  const context = canvas.getContext('2d');
  
  if (context) {
    // Marble pattern with black, orange, and white combination
    // Base: white background
    context.fillStyle = '#FFFFFF'; // White base
    context.fillRect(0, 0, tileSize, tileSize);
    
    // Create marble veiny pattern using gradients and noise
    // Orange veins
    const orangeGradient = context.createLinearGradient(0, 0, tileSize, tileSize);
    orangeGradient.addColorStop(0, 'rgba(255, 140, 0, 0.3)'); // Orange
    orangeGradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.5)'); // Bright orange
    orangeGradient.addColorStop(1, 'rgba(255, 140, 0, 0.2)'); // Orange
    
    // Black veins
    const blackGradient = context.createLinearGradient(tileSize, 0, 0, tileSize);
    blackGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)'); // Black
    blackGradient.addColorStop(0.5, 'rgba(20, 20, 20, 0.6)'); // Dark grey-black
    blackGradient.addColorStop(1, 'rgba(0, 0, 0, 0.3)'); // Black
    
    // Draw marble veins - create flowing, organic patterns
    context.globalCompositeOperation = 'multiply';
    
    // Orange veins - flowing patterns
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const centerX = tileSize / 2 + Math.cos(angle) * (tileSize / 3);
      const centerY = tileSize / 2 + Math.sin(angle) * (tileSize / 3);
      
      const gradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, tileSize / 2);
      gradient.addColorStop(0, 'rgba(255, 140, 0, 0.6)'); // Orange
      gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.4)');
      gradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
      
      context.fillStyle = gradient;
      context.beginPath();
      context.arc(centerX, centerY, tileSize / 2.5, 0, Math.PI * 2);
      context.fill();
    }
    
    // Black veins - more prominent, flowing lines
    context.strokeStyle = 'rgba(0, 0, 0, 0.5)';
    context.lineWidth = 3;
    for (let i = 0; i < 6; i++) {
      context.beginPath();
      const startX = Math.random() * tileSize;
      const startY = Math.random() * tileSize;
      context.moveTo(startX, startY);
      
      // Create flowing curve
      for (let j = 0; j < 5; j++) {
        const controlX = startX + (Math.random() - 0.5) * tileSize * 0.8;
        const controlY = startY + (Math.random() - 0.5) * tileSize * 0.8;
        const endX = startX + (Math.random() - 0.5) * tileSize;
        const endY = startY + (Math.random() - 0.5) * tileSize;
        context.quadraticCurveTo(controlX, controlY, endX, endY);
      }
      context.stroke();
    }
    
    // Add more orange swirls
    context.fillStyle = 'rgba(255, 140, 0, 0.3)';
    for (let i = 0; i < 5; i++) {
      const x = Math.random() * tileSize;
      const y = Math.random() * tileSize;
      const radius = 20 + Math.random() * 30;
      
      const swirlGradient = context.createRadialGradient(x, y, 0, x, y, radius);
      swirlGradient.addColorStop(0, 'rgba(255, 165, 0, 0.5)');
      swirlGradient.addColorStop(1, 'rgba(255, 140, 0, 0)');
      
      context.fillStyle = swirlGradient;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }
    
    // Add black spots/patches
    context.fillStyle = 'rgba(0, 0, 0, 0.4)';
    for (let i = 0; i < 4; i++) {
      const x = Math.random() * tileSize;
      const y = Math.random() * tileSize;
      const size = 15 + Math.random() * 20;
      
      context.beginPath();
      context.ellipse(x, y, size, size * 0.7, Math.random() * Math.PI, 0, Math.PI * 2);
      context.fill();
    }
    
    context.globalCompositeOperation = 'source-over';
    
    // Add subtle noise for marble texture
    const imageData = context.getImageData(0, 0, tileSize, tileSize);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
      // Add subtle marble-like noise
      const noise = (Math.random() - 0.5) * 15;
      data[i] = Math.max(0, Math.min(255, data[i] + noise)); // R
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise * 0.8)); // G
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.6)); // B
    }
    
    context.putImageData(imageData, 0, 0);
  }
  
  // Calculate floor dimensions from house bounds
  const floorWidth = houseBounds.xMax - houseBounds.xMin;
  const floorLength = houseBounds.zMax - houseBounds.zMin;
  const floorCenterX = (houseBounds.xMin + houseBounds.xMax) / 2;
  const floorCenterZ = (houseBounds.zMin + houseBounds.zMax) / 2;
  
  // Create texture from canvas
  const texture = new THREE.CanvasTexture(canvas);
  texture.flipY = false; // Fix WebGL error for 3D textures
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  // Calculate repeat based on floor size and tile size
  const repeatX = floorWidth / tileUnitSize;
  const repeatY = floorLength / tileUnitSize;
  texture.repeat.set(repeatX, repeatY); // Repeat texture to match floor size
  texture.needsUpdate = true;
  
  // Create floor geometry
  const floorGeometry = new THREE.PlaneGeometry(floorWidth, floorLength);
  
  // Marble tile material - reflective, glossy
  const floorMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    color: 0xFFFFFF, // White base for marble
    roughness: 0.1, // Very smooth/glossy like polished marble
    metalness: 0.0, // Not metallic, but reflective
    envMapIntensity: 1.2, // Strong reflections for marble
    side: THREE.DoubleSide
  });
  
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.rotation.x = -Math.PI / 2; // Lay flat
  floor.position.set(floorCenterX, 0.001, floorCenterZ); // Slightly above ground to avoid z-fighting
  floor.receiveShadow = true;
  floor.renderOrder = -1; // Render first
  
  return floor;
}

// Create rug/carpet for contrast
export function createRug(scene: any, THREE: any, position: { x: number; y: number; z: number }): any {
  const rugGeometry = new THREE.PlaneGeometry(3, 2);
  const rugMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B7355, // Warm brown/beige rug
    roughness: 0.8,
    metalness: 0.0
  });
  
  const rug = new THREE.Mesh(rugGeometry, rugMaterial);
  rug.rotation.x = -Math.PI / 2;
  rug.position.set(position.x, 0.002, position.z); // Slightly above floor
  rug.receiveShadow = true;
  
  return rug;
}

