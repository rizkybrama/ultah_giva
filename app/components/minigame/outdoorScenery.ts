// Outdoor scenery helper - creates garden, ocean, mountains, clouds, etc.
import { 
  generateValidPosition, 
  validatePosition,
  addToCollision,
  isInsideHouse,
  isOnPath,
  type ValidationRules 
} from './validationHelpers';

export function createOutdoorScenery(scene: any, THREE: any, collisionObjects: any[]) {
  // Detect mobile for performance optimization
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (typeof window !== 'undefined' && window.innerWidth <= 768);
  
  // Ground extension for garden - Diperbesar untuk area outdoor yang lebih luas
  // HAPUS gardenGround karena sudah ada main ground di sceneSetup
  // Tidak perlu duplicate ground yang bisa menyebabkan z-fighting/glitch

  // Beach sand in tree and mountain areas (far from house)
  // Create beach sand ground in areas where trees and mountains are (radius > 40 from center)
  const beachSandGeometry = new THREE.RingGeometry(40, 120, isMobile ? 32 : 64); // Reduce segments on mobile
  const beachSandMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xF4A460, // Sandy beige/beach sand color
    roughness: 0.9,
    metalness: 0.0
  });
  const beachSand = new THREE.Mesh(beachSandGeometry, beachSandMaterial);
  beachSand.rotation.x = -Math.PI / 2;
  beachSand.position.y = 0.005; // Slightly above main ground to avoid z-fighting
  beachSand.receiveShadow = !isMobile; // Disable shadows on mobile
  beachSand.renderOrder = 0.3; // Render between main ground and grass
  scene.add(beachSand);

  // Flowers akan dibuat SETELAH gunung, agar bisa exclude area di bawah gunung

  // Ocean akan dibuat SETELAH gunung, di area paling luar

  // Mountains (background, far away) - menggunakan validation helper
  // Rules: harus JAUH dari rumah (minDistance 20), JAUH dari path (minDistance 10), DENGAN collision (tidak bisa ditembus)
  const mountainRules: ValidationRules = {
    avoidPath: true, // Gunung HARUS jauh dari path/jalan
    avoidHouse: true,
    minDistanceFromPath: 10, // Jauh dari path/jalan minimal 10 unit
    minDistanceFromHouse: 20, // Jauh dari rumah minimal 20 unit
    collision: true // Gunung tidak bisa ditembus
  };
  
  // Store mountain positions untuk exclusion zones
  const mountainPositions: Array<{ x: number; z: number; radius: number }> = [];
  // Store animated mountains untuk update loop
  const animatedMountains: Array<{ 
    glow?: any; 
    particles?: any[];
    update: (time: number) => void;
  }> = [];
  
  // Helper function untuk membuat gunung dengan variasi
  const createMountain = (
    type: 'normal' | 'snow' | 'lava',
    height: number,
    radius: number
  ): { mountain: any; glow?: any; particles?: any[]; update?: (time: number) => void } => {
    const mountainGeometry = new THREE.ConeGeometry(radius, height, isMobile ? 6 : 8); // Reduce segments on mobile
    
    let mountainMaterial: any;
    let glow: any = null;
    let particles: any[] = [];
    let updateFn: ((time: number) => void) | undefined = undefined;
    
    if (type === 'snow') {
      // Gunung salju - berdasarkan referensi: puncak putih mencolok, bagian bawah abu-abu (batuan)
      // Base gunung: abu-abu untuk batuan yang terlihat di bawah salju
      mountainMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x778899, // Light slate gray - warna batuan gunung yang lebih terang
        roughness: 0.9,
        metalness: 0.1
      });
      
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      
      // Cap salju di puncak - menggunakan cone geometry yang lebih kecil dan menyatu dengan base
      // Cone salju yang lebih kecil menempel di atas gunung base
      const snowCapHeight = height * 0.3; // Tinggi cap salju 30% dari tinggi gunung
      const snowCapRadius = radius * 0.5; // Radius cap salju 50% dari radius base
      const snowCapGeometry = new THREE.ConeGeometry(snowCapRadius, snowCapHeight, isMobile ? 6 : 8);
      const snowCapMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF, // Pure white - warna salju terang mencolok
        roughness: 0.95,
        metalness: 0.15 // Sedikit metal untuk efek shimmer halus
      });
      const snowCap = new THREE.Mesh(snowCapGeometry, snowCapMaterial);
      // Posisi cap salju: di atas gunung base, menyatu dengan puncak
      // ConeGeometry centered, jadi Y = height/2 dari base gunung + snowCapHeight/2 untuk cap
      snowCap.position.set(0, height * 0.5 + snowCapHeight * 0.5, 0); // Menyatu dengan puncak gunung
      
      // Group: base gunung + cap salju (sederhana, menyatu)
      const mountainGroup = new THREE.Group();
      mountainGroup.add(mountain); // Base gunung (batuan abu-abu)
      mountainGroup.add(snowCap); // Cap salju putih di puncak (cone kecil)
      
      return { mountain: mountainGroup };
      
    } else if (type === 'lava') {
      // Gunung lava - MERAH/ORANGE TERANG dengan glow effect yang lebih jelas
      mountainMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x654321, // Dark brown base yang lebih gelap untuk kontras
        roughness: 0.9,
        emissive: 0x8B0000, // Dark red glow yang lebih terang
        emissiveIntensity: 0.5 // Lebih terang
      });
      
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      
      // Tambahkan lava streaks di sisi gunung untuk efek lebih jelas
      for (let i = 0; i < 3; i++) {
        const streakGeometry = new THREE.CylinderGeometry(0.1, 0.15, height * 0.6, 8);
        const streakMaterial = new THREE.MeshStandardMaterial({
          color: 0xFF4500,
          emissive: 0xFF4500,
          emissiveIntensity: 1.5,
          transparent: true,
          opacity: 0.7
        });
        const streak = new THREE.Mesh(streakGeometry, streakMaterial);
        const streakAngle = (i / 3) * Math.PI * 2;
        streak.position.set(
          Math.cos(streakAngle) * radius * 0.6,
          height * 0.3,
          Math.sin(streakAngle) * radius * 0.6
        );
        streak.rotation.z = Math.random() * 0.2;
        mountain.add(streak);
      }
      
      // Tambahkan glow effect di atas gunung - LEBIH BESAR DAN TERANG
      const glowGeometry = new THREE.SphereGeometry(radius * 0.5, 16, 16);
      const glowMaterial = new THREE.MeshStandardMaterial({
        color: 0xFF5500,
        emissive: 0xFF5500,
        emissiveIntensity: 2, // Lebih terang
        transparent: true,
        opacity: 0.8 // Lebih visible
      });
      glow = new THREE.Mesh(glowGeometry, glowMaterial);
      glow.position.set(0, height * 0.85, 0);
      glow.scale.set(1.2, 0.6, 1.2); // Lebih besar
      
      const mountainGroup = new THREE.Group();
      mountainGroup.add(mountain);
      mountainGroup.add(glow);
      
      // Tambahkan lebih banyak particle untuk efek lava - LEBIH BESAR DAN TERANG
      for (let i = 0; i < 8; i++) {
        const particleGeometry = new THREE.SphereGeometry(0.3, 8, 8); // Lebih besar
        const particleMaterial = new THREE.MeshStandardMaterial({
          color: 0xFF7700,
          emissive: 0xFF7700,
          emissiveIntensity: 3, // Lebih terang
          transparent: true,
          opacity: 0.9 // Lebih visible
        });
        const particle = new THREE.Mesh(particleGeometry, particleMaterial);
        const angle = (i / 8) * Math.PI * 2;
        const particleRadius = radius * 0.4;
        particle.position.set(
          Math.cos(angle) * particleRadius,
          height * 0.75 + Math.random() * 0.8,
          Math.sin(angle) * particleRadius
        );
        particles.push(particle);
        mountainGroup.add(particle);
      }
      
      // Animation function untuk lava - LEBIH CEPAT DAN JELAS
      updateFn = (time: number) => {
        if (glow) {
          // Pulsing glow effect - lebih cepat dan lebih jelas
          const pulse = Math.sin(time * 3) * 0.4 + 0.6; // Lebih cepat (3x)
          glow.material.emissiveIntensity = pulse * 2.5; // Lebih terang
          glow.material.opacity = pulse * 0.9; // Lebih visible
          glow.scale.set(
            1.2 + pulse * 0.3, 
            0.6 + pulse * 0.2, 
            1.2 + pulse * 0.3
          ); // Lebih besar variasi
        }
        
        // Animate particles - lebih cepat dan lebih jelas
        particles.forEach((particle, i) => {
          const angle = (i / 8) * Math.PI * 2;
          const particleRadius = radius * 0.4;
          const floatAmount = Math.sin(time * 2 + i) * 0.5; // Lebih cepat dan lebih besar
          particle.position.y = height * 0.75 + floatAmount;
          particle.position.x = Math.cos(angle + time * 0.8) * particleRadius; // Lebih cepat
          particle.position.z = Math.sin(angle + time * 0.8) * particleRadius; // Lebih cepat
          
          // Pulsing particle - lebih cepat
          const particlePulse = Math.sin(time * 4 + i) * 0.3 + 0.7; // Lebih cepat
          particle.material.emissiveIntensity = particlePulse * 3.5; // Lebih terang
          particle.material.opacity = particlePulse * 0.95; // Lebih visible
        });
      };
      
      return { mountain: mountainGroup, glow, particles, update: updateFn };
      
    } else {
      // Gunung biasa - ABU-ABU BIRU yang lebih jelas
      mountainMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x708090, // Slate gray - lebih jelas daripada blue-gray
        roughness: 0.9,
        metalness: 0.1
      });
      
      // Tambahkan beberapa detail rock untuk lebih jelas
      const mountain = new THREE.Mesh(mountainGeometry, mountainMaterial);
      
      // Tambahkan beberapa batu di sisi gunung untuk detail
      for (let i = 0; i < 4; i++) {
        const rockGeometry = new THREE.DodecahedronGeometry(radius * 0.15, 0);
        const rockMaterial = new THREE.MeshStandardMaterial({
          color: 0x556B2F, // Dark olive - kontras dengan gunung
          roughness: 0.9
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        const rockAngle = (i / 4) * Math.PI * 2;
        rock.position.set(
          Math.cos(rockAngle) * radius * 0.7,
          height * 0.3 + Math.random() * 0.2,
          Math.sin(rockAngle) * radius * 0.7
        );
        rock.rotation.set(
          Math.random() * Math.PI,
          Math.random() * Math.PI,
          Math.random() * Math.PI
        );
        mountain.add(rock);
      }
      
      return { mountain };
    }
  };
  
  for (let i = 0; i < 5; i++) {
    // Generate mountain height first
    const mountainHeight = 12 + Math.random() * 6; // 12-18 units tinggi
    const mountainBaseRadius = 8 + Math.random() * 4; // 8-12 units radius
    
    // Pilih tipe gunung secara random
    const mountainTypes: Array<'normal' | 'snow' | 'lava'> = ['normal', 'snow', 'lava'];
    const mountainType = mountainTypes[Math.floor(Math.random() * mountainTypes.length)];
    
    // Buat gunung sesuai tipe
    const { mountain, glow, particles, update } = createMountain(
      mountainType,
      mountainHeight,
      mountainBaseRadius
    );
    
    // Position mountains FAR from house and path, distributed around perimeter
    // Gunung harus sangat jauh dari rumah dan path
    let x, z;
    let attempts = 0;
    const maxAttempts = 100; // Increase attempts untuk mencari posisi yang lebih jauh
    
    do {
      // Gunakan radius yang lebih besar untuk memastikan jauh dari rumah dan path
      const angle = (i / 5) * Math.PI * 2;
      const baseRadius = 60; // Start dari radius yang lebih besar
      const radius = baseRadius + Math.random() * 30; // 60-90 units dari center
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius - 15;
      
      // Validate position
      const validation = validatePosition(x, z, mountainRules);
      if (validation.valid) break;
      
      attempts++;
      // Try different angle if too close
      if (attempts < maxAttempts) {
        const newAngle = angle + (Math.PI / 2) + (Math.random() - 0.5) * Math.PI / 4;
        x = Math.cos(newAngle) * radius;
        z = Math.sin(newAngle) * radius - 15;
      }
    } while (attempts < maxAttempts);
    
    // Final validation - jika masih tidak valid, coba lagi dengan radius lebih besar
    const finalValidation = validatePosition(x, z, mountainRules);
    if (!finalValidation.valid) {
      // Use validated position generator as fallback dengan attempts lebih banyak
      const validPos = generateValidPosition(mountainRules, 500); // Lebih banyak attempts
      if (validPos.success) {
        x = validPos.x;
        z = validPos.z;
      } else {
        // Fallback: posisi sangat jauh dari center
        const fallbackRadius = 80 + Math.random() * 20;
        const fallbackAngle = (i / 5) * Math.PI * 2;
        x = Math.cos(fallbackAngle) * fallbackRadius;
        z = Math.sin(fallbackAngle) * fallbackRadius - 15;
      }
    }
    
    // ConeGeometry is centered, so Y position = half height to make it sit on ground (Y=0)
    // Bottom of cone will be at Y=0, top at Y=mountainHeight
    const mountainYPosition = mountainHeight / 2;
    mountain.position.set(x, mountainYPosition, z);
    mountain.rotation.y = Math.random() * Math.PI;
    
    // Update matrix world untuk memastikan posisi child sudah benar
    mountain.updateMatrixWorld(true);
    
    // Tag gunung dengan userData untuk collision detection khusus
    mountain.userData = { type: 'mountain', mountainType: mountainType };
    // Juga tag semua child jika gunung adalah Group
    if (mountain.children && mountain.children.length > 0) {
      mountain.traverse((child: any) => {
        if (child.userData) {
          child.userData.type = 'mountain';
          child.userData.mountainType = mountainType;
        } else {
          child.userData = { type: 'mountain', mountainType: mountainType };
        }
      });
    }
    
    scene.add(mountain);
    
    // Add collision untuk gunung - PASTIKAN semua mesh ditambahkan
    // Untuk Group, kita perlu traverse dan tambahkan semua mesh child
    if (mountain.children && mountain.children.length > 0) {
      // Jika gunung adalah Group, tambahkan semua mesh child
      mountain.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.geometry) {
          // Pastikan child sudah punya userData untuk collision detection
          if (!child.userData || !child.userData.type) {
            child.userData = { type: 'mountain', mountainType: mountainType };
          }
          collisionObjects.push(child);
        }
      });
    } else if (mountain.geometry) {
      // Jika gunung adalah single Mesh
      collisionObjects.push(mountain);
    }
    
    // Store mountain position untuk exclusion zone
    // Radius exclusion = base radius gunung + margin
    mountainPositions.push({
      x,
      z,
      radius: mountainBaseRadius + 5 // Margin 5 unit di sekitar gunung untuk memastikan tidak ada objek di bawah
    });
    
    // Store animated mountains untuk update loop
    if (update) {
      animatedMountains.push({ glow, particles, update });
    }
  }
  
  // Store animated mountains untuk bisa diupdate di animation loop
  // Kita perlu return ini atau simpan di scene.userData
  scene.userData.animatedMountains = animatedMountains;
  
  // Garden patches (flowers and plants) - SETELAH gunung dibuat, dengan exclude zones
  // Rules: harus di luar path, di luar rumah, JAUH dari gunung (exclude zones)
  const flowerRules: ValidationRules = {
    avoidPath: true,
    avoidHouse: true,
    minDistanceFromPath: 3,
    minDistanceFromHouse: 2,
    collision: false, // Flowers too small for collision
    excludeZones: mountainPositions.map(m => ({ x: m.x, z: m.z, radius: m.radius })) // Exclude area di bawah gunung
  };
  
  for (let i = 0; i < 15; i++) {
    // Generate validated position (akan otomatis skip area di bawah gunung)
    const position = generateValidPosition(flowerRules);
    if (!position.success) continue; // Skip if can't find valid position
    const x = position.x;
    const z = position.z;
    
    // Small flower patch
    const flowerPatchGroup = new THREE.Group();
    
    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.3, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.y = 0.15;
    flowerPatchGroup.add(stem);
    
    // Flower petals
    const petalColors = [0xFFB6C1, 0xFF69B4, 0xFFD700, 0x87CEEB, 0xD8C4E8];
    const petalColor = petalColors[Math.floor(Math.random() * petalColors.length)];
    const petalGeometry = new THREE.ConeGeometry(0.15, 0.2, 6);
    const petalMaterial = new THREE.MeshStandardMaterial({ color: petalColor });
    
    for (let j = 0; j < 5; j++) {
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      const angle2 = (j / 5) * Math.PI * 2;
      petal.position.set(
        Math.cos(angle2) * 0.1,
        0.35,
        Math.sin(angle2) * 0.1
      );
      flowerPatchGroup.add(petal);
    }
    
    flowerPatchGroup.position.set(x, 0, z);
    scene.add(flowerPatchGroup);
    
    // Don't add flowers to collision - they're too small and decorative
  }

  // Clouds (floating in sky) - Diperbesar radius agar tidak overlap dengan rumah
  for (let i = 0; i < 10; i++) {
    const cloudGroup = new THREE.Group();
    
    // Create fluffy cloud with multiple spheres
    for (let j = 0; j < 5; j++) {
      const cloudPartGeometry = new THREE.SphereGeometry(
        1 + Math.random() * 0.5,
        16,
        16
      );
      const cloudMaterial = new THREE.MeshStandardMaterial({ 
        color: 0xFFFFFF,
        roughness: 0.8,
        opacity: 0.9,
        transparent: true
      });
      const cloudPart = new THREE.Mesh(cloudPartGeometry, cloudMaterial);
      cloudPart.position.set(
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 1,
        (Math.random() - 0.5) * 3
      );
      cloudGroup.add(cloudPart);
    }
    
    // Position clouds at different heights and positions - Diperbesar radius
    const angle = (i / 10) * Math.PI * 2;
    const radius = 40 + Math.random() * 25; // Diperbesar dari 20-35 menjadi 40-65 agar jauh dari rumah
    cloudGroup.position.set(
      Math.cos(angle) * radius,
      8 + Math.random() * 5,
      Math.sin(angle) * radius
    );
    scene.add(cloudGroup);
  }

  // Trees (enhanced - more variety) - menggunakan validation helper
  // Rules: harus di luar path, di luar rumah, JAUH dari gunung, dengan collision
  const treeRules: ValidationRules = {
    avoidPath: true,
    avoidHouse: true,
    minDistanceFromPath: 4, // Trees need more space
    minDistanceFromHouse: 2,
    collision: true, // Trees have collision
    excludeZones: mountainPositions.map(m => ({ x: m.x, z: m.z, radius: m.radius })) // Exclude area di bawah gunung
  };
  
  for (let i = 0; i < 8; i++) {
    const treeGroup = new THREE.Group();
    
    // Trunk
    const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.25, 2.5, 8);
    const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
    const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
    trunk.position.y = 1.25;
    trunk.castShadow = true;
    treeGroup.add(trunk);

    // Leaves (variety of sizes)
    const leafColors = [0x90EE90, 0x7CFC00, 0x9ACD32, 0x6B8E23];
    const leafColor = leafColors[Math.floor(Math.random() * leafColors.length)];
    const leavesGeometry = new THREE.ConeGeometry(1.2 + Math.random() * 0.5, 2.5 + Math.random() * 1, 8);
    const leavesMaterial = new THREE.MeshStandardMaterial({ color: leafColor });
    const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
    leaves.position.y = 3;
    leaves.castShadow = true;
    treeGroup.add(leaves);

    // Generate validated position
    const position = generateValidPosition(treeRules);
    if (!position.success) continue; // Skip if can't find valid position
    
    treeGroup.position.set(position.x, 0, position.z);
    scene.add(treeGroup);
    
    // Add to collision using helper
    addToCollision(treeGroup, collisionObjects, treeRules);
  }

  // Rocks/stones (small decorative elements) - menggunakan validation helper
  // Rules: harus di luar path, di luar rumah, JAUH dari gunung, dengan collision
  const rockRules: ValidationRules = {
    avoidPath: true,
    avoidHouse: true,
    minDistanceFromPath: 3,
    minDistanceFromHouse: 2,
    collision: true, // Rocks have collision
    excludeZones: mountainPositions.map(m => ({ x: m.x, z: m.z, radius: m.radius })) // Exclude area di bawah gunung
  };
  
  for (let i = 0; i < 10; i++) {
    const rockGeometry = new THREE.DodecahedronGeometry(0.3 + Math.random() * 0.2, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B8680,
      roughness: 0.9 
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    
    // Generate validated position
    const position = generateValidPosition(rockRules);
    if (!position.success) continue; // Skip if can't find valid position
    
    rock.position.set(position.x, 0.15, position.z);
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    rock.castShadow = true;
    scene.add(rock);
    
    // Add to collision using helper
    addToCollision(rock, collisionObjects, rockRules);
  }

  // Path/road leading to house - REMOVED because red carpet covers it
  // Path is now covered by red carpet from birthdayEntrance.ts

  // ============================================
  // OCEAN AREA - Area laut setelah area gunung
  // ============================================
  
  // Define ocean boundaries - area laut harus setelah area gunung
  // Gunung ada di radius ~60-90 unit, jadi laut harus di radius > 100 unit
  const OCEAN_START_RADIUS = 100; // Mulai dari radius 100 unit (setelah gunung)
  const OCEAN_END_RADIUS = 250; // Sampai radius 250 unit (pojok)
  
  // Helper function untuk memastikan posisi di area laut saja
  const isInOceanArea = (x: number, z: number): boolean => {
    const distance = Math.sqrt(x * x + z * z);
    return distance >= OCEAN_START_RADIUS && distance <= OCEAN_END_RADIUS;
  };
  
  // Helper function untuk generate posisi di area laut
  const generateOceanPosition = (): { x: number; z: number } => {
    let x, z;
    let attempts = 0;
    do {
      const angle = Math.random() * Math.PI * 2;
      const radius = OCEAN_START_RADIUS + Math.random() * (OCEAN_END_RADIUS - OCEAN_START_RADIUS);
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      
      // Pastikan tidak di area rumah, path, atau terlalu dekat gunung
      if (!isInsideHouse(x, z, 10) && !isOnPath(x, z, 10)) {
        // Cek apakah terlalu dekat dengan gunung
        let tooCloseToMountain = false;
        for (const mountain of mountainPositions) {
          const distanceToMountain = Math.sqrt(
            Math.pow(x - mountain.x, 2) + Math.pow(z - mountain.z, 2)
          );
          if (distanceToMountain < mountain.radius + 5) {
            tooCloseToMountain = true;
            break;
          }
        }
        if (!tooCloseToMountain) {
          return { x, z };
        }
      }
      attempts++;
    } while (attempts < 100);
    // Fallback: posisi di tengah ocean area
    const angle = Math.random() * Math.PI * 2;
    const radius = (OCEAN_START_RADIUS + OCEAN_END_RADIUS) / 2;
    return {
      x: Math.cos(angle) * radius,
      z: Math.sin(angle) * radius
    };
  };
  
  // Ocean basin - laut dengan kedalaman (cekungan ke dalam)
  const oceanSize = 500; // Sangat besar untuk mengisi sampai pojok
  const oceanDepth = 8; // Kedalaman laut 8 unit
  
  // Ocean floor (lantai dasar laut) - Warna pasir pantai, bukan biru
  // Gunakan PlaneGeometry yang lebih besar untuk memastikan menutupi seluruh area
  const oceanFloorSize = OCEAN_END_RADIUS * 2.5; // Lebih besar dari ocean area
  const oceanFloorGeometry = new THREE.PlaneGeometry(oceanFloorSize, oceanFloorSize);
  const oceanFloorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xF4A460, // Warna pasir pantai (sandy beach)
    roughness: 0.8,
    metalness: 0.1,
    side: THREE.DoubleSide
  });
  const oceanFloor = new THREE.Mesh(oceanFloorGeometry, oceanFloorMaterial);
  oceanFloor.rotation.x = -Math.PI / 2;
  oceanFloor.position.set(0, -oceanDepth, 0); // Di dasar laut
  oceanFloor.receiveShadow = !isMobile; // Disable shadows on mobile
  oceanFloor.renderOrder = 0; // Render di belakang
  scene.add(oceanFloor);
  
  // Water volume - tambahkan lebih banyak layer dengan opacity tinggi
  // HANYA di area ocean (menggunakan RingGeometry) untuk menghindari glitch di daratan
  // Untuk memastikan semua lingkungan di dalam laut biru ocean, tidak ada warna putih
  const numLayers = 4; // Lebih banyak layer untuk coverage yang lebih baik
  for (let i = 0; i < numLayers; i++) {
    const layerY = -i * (oceanDepth / numLayers);
    // Opacity lebih tinggi untuk menutupi semua warna putih
    const layerOpacity = 0.6 + (i * 0.1); // 0.6, 0.7, 0.8, 0.9
    
    // PENTING: Gunakan RingGeometry HANYA di area ocean, bukan PlaneGeometry yang besar
    // Ini mencegah water layer overlap dengan area daratan
    const waterLayerGeometry = new THREE.RingGeometry(OCEAN_START_RADIUS, OCEAN_END_RADIUS, isMobile ? 16 : 32);
    const waterLayerMaterial = new THREE.MeshStandardMaterial({
      color: 0x0099FF, // Biru ocean yang konsisten
      transparent: true,
      opacity: layerOpacity,
      roughness: 0.1,
      metalness: 0.5,
      side: THREE.DoubleSide,
      depthWrite: false
    });
    const waterLayer = new THREE.Mesh(waterLayerGeometry, waterLayerMaterial);
    waterLayer.rotation.x = -Math.PI / 2;
    waterLayer.position.set(0, layerY, 0);
    waterLayer.userData = { type: 'water', passable: true };
    waterLayer.renderOrder = 1; // Render setelah ground dan ocean floor
    scene.add(waterLayer);
  }
  
  // Water surface - HARUS di atas ground untuk menghindari z-fighting
  // Gunakan opacity lebih tinggi dan warna lebih biru agar benar-benar terlihat biru dari atas
  const waterSurfaceGeometry = new THREE.RingGeometry(OCEAN_START_RADIUS, OCEAN_END_RADIUS, isMobile ? 16 : 32);
  const waterSurfaceMaterial = new THREE.MeshStandardMaterial({
    color: 0x0099FF, // Biru ocean yang lebih kuat dan jelas
    transparent: true,
    opacity: 0.9, // Opacity tinggi agar benar-benar terlihat biru dari atas
    roughness: 0.05, // Lebih glossy untuk efek air
    metalness: 0.9,
    side: THREE.DoubleSide,
    depthWrite: false // Penting untuk menghindari z-fighting
  });
  const waterSurface = new THREE.Mesh(waterSurfaceGeometry, waterSurfaceMaterial);
  waterSurface.rotation.x = -Math.PI / 2;
  waterSurface.position.set(0, 0.01, 0); // SEDIKIT DI ATAS ground (Y=0) untuk menghindari z-fighting
  waterSurface.userData = { type: 'water', passable: true }; // Bisa ditembus
  waterSurface.renderOrder = 2; // Render setelah ground dan water volume
  scene.add(waterSurface);
  
  // Ocean waves - beberapa gelombang untuk efek visual (HANYA di area laut)
  for (let i = 0; i < 30; i++) {
    const waveGeometry = new THREE.PlaneGeometry(20 + Math.random() * 15, 1.5);
    const waveMaterial = new THREE.MeshStandardMaterial({
      color: 0x0099FF, // Biru yang konsisten dengan water surface
      transparent: true,
      opacity: 0.6,
      roughness: 0.3,
      metalness: 0.7
    });
    const wave = new THREE.Mesh(waveGeometry, waveMaterial);
    wave.rotation.x = -Math.PI / 2;
    wave.rotation.z = Math.random() * Math.PI * 2;
    
    // Place waves HANYA di area laut (radius 100-250 units) - di permukaan air
    const oceanPos = generateOceanPosition();
    wave.position.set(
      oceanPos.x,
      0.02, // Sedikit di atas water surface (0.01) untuk efek gelombang
      oceanPos.z
    );
    wave.renderOrder = 3; // Render setelah water surface
    scene.add(wave);
  }
  
  // Ships - beberapa kapal di laut (dipindahkan lebih dekat agar terlihat)
  for (let i = 0; i < 8; i++) {
    const shipGroup = new THREE.Group();
    
    // Ship hull (badan kapal) - lebih besar agar terlihat jelas
    const hullGeometry = new THREE.BoxGeometry(4, 0.6, 2);
    const hullMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x8B4513, // Brown wood
      roughness: 0.8
    });
    const hull = new THREE.Mesh(hullGeometry, hullMaterial);
    hull.position.y = 0.3;
    hull.castShadow = true;
    shipGroup.add(hull);
    
    // Ship deck
    const deckGeometry = new THREE.BoxGeometry(3.8, 0.1, 1.8);
    const deckMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xD2691E, // Chocolate brown
      roughness: 0.7
    });
    const deck = new THREE.Mesh(deckGeometry, deckMaterial);
    deck.position.y = 0.6;
    shipGroup.add(deck);
    
    // Mast (tiang kapal) - lebih tinggi
    const mastGeometry = new THREE.CylinderGeometry(0.08, 0.08, 3, 8);
    const mastMaterial = new THREE.MeshStandardMaterial({ color: 0x654321 });
    const mast = new THREE.Mesh(mastGeometry, mastMaterial);
    mast.position.set(0.8, 2, 0);
    shipGroup.add(mast);
    
    // Sail (layar) - lebih besar
    const sailGeometry = new THREE.PlaneGeometry(1.5, 2.5);
    const sailMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xFFFFFF,
      side: THREE.DoubleSide,
      roughness: 0.9
    });
    const sail = new THREE.Mesh(sailGeometry, sailMaterial);
    sail.position.set(0.8, 2, 0);
    sail.rotation.y = Math.PI / 4;
    shipGroup.add(sail);
    
    // Position ship HANYA di area laut (radius 100-250 units) - di permukaan air
    const oceanPos = generateOceanPosition();
    shipGroup.position.set(
      oceanPos.x,
      0.3, // Di permukaan air (sedikit di atas Y=0 agar kapal mengambang)
      oceanPos.z
    );
    // Rotate ship berdasarkan posisi
    const shipAngle = Math.atan2(oceanPos.x, oceanPos.z);
    shipGroup.rotation.y = shipAngle + Math.PI / 2;
    shipGroup.userData = { type: 'ship', collision: false };
    scene.add(shipGroup);
  }
  
  // Corals (karang) - beberapa karang di dasar laut (lebih dekat)
  for (let i = 0; i < 20; i++) {
    const coralGroup = new THREE.Group();
    
    // Main coral body - lebih besar
    const coralGeometry = new THREE.ConeGeometry(0.4 + Math.random() * 0.4, 1.2 + Math.random() * 0.6, 6);
    const coralColors = [0xFF6347, 0xFF69B4, 0xFFD700, 0xFFA500];
    const coralColor = coralColors[Math.floor(Math.random() * coralColors.length)];
    const coralMaterial = new THREE.MeshStandardMaterial({ 
      color: coralColor,
      roughness: 0.8
    });
    const coral = new THREE.Mesh(coralGeometry, coralMaterial);
    coralGroup.add(coral);
    
    // Add small branches
    for (let j = 0; j < 3; j++) {
      const branchGeometry = new THREE.CylinderGeometry(0.06, 0.12, 0.4, 6);
      const branch = new THREE.Mesh(branchGeometry, coralMaterial);
      branch.position.set(
        (Math.random() - 0.5) * 0.5,
        0.6 + Math.random() * 0.4,
        (Math.random() - 0.5) * 0.5
      );
      branch.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      coralGroup.add(branch);
    }
    
    // Position coral HANYA di area laut (radius 100-250 units) - di dalam laut
    const oceanPos = generateOceanPosition();
    const coralDepth = -2 - Math.random() * (oceanDepth - 2); // Di dalam laut, -2 sampai -oceanDepth
    coralGroup.position.set(
      oceanPos.x,
      coralDepth,
      oceanPos.z
    );
    coralGroup.rotation.y = Math.random() * Math.PI * 2;
    scene.add(coralGroup);
  }
  
  // Seaweed (rumput laut) - beberapa rumput laut (lebih dekat)
  for (let i = 0; i < 30; i++) {
    const seaweedGeometry = new THREE.CylinderGeometry(0.06, 0.12, 1 + Math.random() * 0.6, 6);
    const seaweedMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22, // Sea green
      roughness: 0.9
    });
    const seaweed = new THREE.Mesh(seaweedGeometry, seaweedMaterial);
    
    // Position seaweed HANYA di area laut (radius 100-250 units) - di dalam laut
    const oceanPos = generateOceanPosition();
    const seaweedDepth = -1.5 - Math.random() * (oceanDepth - 1.5); // Di dalam laut
    seaweed.position.set(
      oceanPos.x,
      seaweedDepth,
      oceanPos.z
    );
    seaweed.rotation.x = (Math.random() - 0.5) * 0.2;
    seaweed.rotation.z = (Math.random() - 0.5) * 0.2;
    scene.add(seaweed);
  }
  
  // Rocks in ocean (batu di laut) - beberapa batu (lebih dekat)
  for (let i = 0; i < 15; i++) {
    const rockGeometry = new THREE.DodecahedronGeometry(0.6 + Math.random() * 0.6, 0);
    const rockMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x696969, // Dim gray
      roughness: 0.9
    });
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    
    // Position rock HANYA di area laut (radius 100-250 units) - di dasar laut
    const oceanPos = generateOceanPosition();
    rock.position.set(
      oceanPos.x,
      -oceanDepth + 0.3, // Di dasar laut
      oceanPos.z
    );
    rock.rotation.set(
      Math.random() * Math.PI,
      Math.random() * Math.PI,
      Math.random() * Math.PI
    );
    scene.add(rock);
  }
  
  // Fish - ikan di dalam laut (di bawah permukaan air) dengan animasi
  const animatedFishes: Array<{ 
    fishGroup: any;
    initialPos: { x: number; y: number; z: number };
    direction: { x: number; y: number; z: number };
    speed: number;
    update: (time: number) => void;
  }> = [];
  
  for (let i = 0; i < 20; i++) {
    const fishGroup = new THREE.Group();
    
    // Fish body
    const fishBodyGeometry = new THREE.SphereGeometry(0.2, 8, 8);
    const fishColors = [0xFF6347, 0xFFD700, 0x00CED1, 0xFF69B4, 0x32CD32, 0xFF8C00];
    const fishColor = fishColors[Math.floor(Math.random() * fishColors.length)];
    const fishBodyMaterial = new THREE.MeshStandardMaterial({
      color: fishColor,
      roughness: 0.7,
      metalness: 0.3
    });
    const fishBody = new THREE.Mesh(fishBodyGeometry, fishBodyMaterial);
    fishGroup.add(fishBody);
    
    // Fish tail
    const tailGeometry = new THREE.ConeGeometry(0.12, 0.25, 4);
    const tailMaterial = new THREE.MeshStandardMaterial({ color: fishColor });
    const tail = new THREE.Mesh(tailGeometry, tailMaterial);
    tail.position.set(-0.18, 0, 0);
    tail.rotation.z = Math.PI / 2;
    fishGroup.add(tail);
    
    // Fish fins
    const finGeometry = new THREE.ConeGeometry(0.1, 0.18, 4);
    const finMaterial = new THREE.MeshStandardMaterial({ color: fishColor });
    
    // Top fin
    const topFin = new THREE.Mesh(finGeometry, finMaterial);
    topFin.position.set(0, 0.18, 0);
    topFin.rotation.x = Math.PI / 2;
    fishGroup.add(topFin);
    
    // Bottom fin
    const bottomFin = new THREE.Mesh(finGeometry, finMaterial);
    bottomFin.position.set(0, -0.18, 0);
    bottomFin.rotation.x = -Math.PI / 2;
    fishGroup.add(bottomFin);
    
    // Position fish di dalam laut (di bawah permukaan air)
    const oceanPos = generateOceanPosition();
    const fishDepth = -1 - Math.random() * (oceanDepth - 1); // -1 sampai -oceanDepth
    const initialPos = {
      x: oceanPos.x,
      y: fishDepth,
      z: oceanPos.z
    };
    fishGroup.position.set(initialPos.x, initialPos.y, initialPos.z);
    
    // Random direction untuk pergerakan ikan
    const direction = {
      x: (Math.random() - 0.5) * 0.02,
      y: (Math.random() - 0.5) * 0.01,
      z: (Math.random() - 0.5) * 0.02
    };
    const speed = 0.5 + Math.random() * 0.5; // Speed 0.5-1.0
    
    fishGroup.rotation.y = Math.random() * Math.PI * 2;
    fishGroup.userData = { type: 'fish', collision: false };
    scene.add(fishGroup);
    
    // Animation function untuk ikan
    const updateFn = (time: number) => {
      // Gerakan ikan (berenang dalam lingkaran kecil)
      const radius = 3; // Radius pergerakan ikan
      const angle = time * speed + (i * Math.PI / 10);
      
      fishGroup.position.x = initialPos.x + Math.cos(angle) * radius;
      fishGroup.position.y = initialPos.y + Math.sin(angle * 0.5) * 1; // Naik turun sedikit
      fishGroup.position.z = initialPos.z + Math.sin(angle) * radius;
      
      // Rotate ikan ke arah pergerakan
      fishGroup.rotation.y = angle + Math.PI / 2;
      
      // Tail animation (berayun)
      tail.rotation.z = Math.PI / 2 + Math.sin(time * 5 + i) * 0.3;
    };
    
    animatedFishes.push({
      fishGroup,
      initialPos,
      direction,
      speed,
      update: updateFn
    });
  }
  
  // Store animated fishes untuk update loop
  scene.userData.animatedFishes = animatedFishes;
  
  // Sea plants (tanaman laut) - lebih tinggi dari karang
  for (let i = 0; i < 15; i++) {
    const plantGroup = new THREE.Group();
    
    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.08, 0.12, 1.5 + Math.random() * 1, 6);
    const stemMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,
      roughness: 0.9
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    plantGroup.add(stem);
    
    // Leaves
    for (let j = 0; j < 4; j++) {
      const leafGeometry = new THREE.ConeGeometry(0.1, 0.3, 4);
      const leafMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x32CD32,
        roughness: 0.8
      });
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
      const leafAngle = (j / 4) * Math.PI * 2;
      leaf.position.set(
        Math.cos(leafAngle) * 0.2,
        0.5 + Math.random() * 0.5,
        Math.sin(leafAngle) * 0.2
      );
      leaf.rotation.set(
        Math.random() * Math.PI / 4,
        leafAngle,
        Math.random() * Math.PI / 4
      );
      plantGroup.add(leaf);
    }
    
    // Position di dasar laut
    const oceanPos = generateOceanPosition();
    plantGroup.position.set(
      oceanPos.x,
      -oceanDepth + 0.75, // Di atas dasar laut
      oceanPos.z
    );
    plantGroup.rotation.y = Math.random() * Math.PI * 2;
    scene.add(plantGroup);
  }
}

