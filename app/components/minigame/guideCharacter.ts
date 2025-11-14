// Guide character creation - creates a male character with glasses to guide Giva

export function createGuideCharacter(THREE: any, scene: any): any {
  // Detect mobile for performance optimization
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (typeof window !== 'undefined' && window.innerWidth <= 768);
  
  const guideGroup = new THREE.Group();

  // Body (torso) - Kemeja untuk cowo
  // Bagian belakang body
  const bodyBackGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
  const bodyBackMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x4A90E2, // Biru untuk baju (belakang)
    fog: false
  });
  const bodyBack = new THREE.Mesh(bodyBackGeometry, bodyBackMaterial);
  bodyBack.position.set(0, 0.4, -0.1); // Di belakang (z negatif)
  guideGroup.add(bodyBack);
  
  // Bagian depan body - Kemeja biru
  const bodyFrontGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
  const bodyFrontMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x4A90E2, // Biru untuk kemeja (depan)
    fog: false
  });
  const bodyFront = new THREE.Mesh(bodyFrontGeometry, bodyFrontMaterial);
  bodyFront.position.set(0, 0.4, 0.1); // Di depan (z positif)
  guideGroup.add(bodyFront);
  
  // Kerah kemeja di bagian depan
  // Kerah kiri
  const collarLeftGeometry = new THREE.BoxGeometry(0.12, 0.1, 0.06);
  const collarMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x4A90E2, // Biru untuk kerah
    fog: false
  });
  const collarLeft = new THREE.Mesh(collarLeftGeometry, collarMaterial);
  collarLeft.position.set(-0.15, 0.78, 0.13); // Di kiri atas dada
  collarLeft.rotation.z = 0.2; // Sedikit miring untuk efek kerah
  guideGroup.add(collarLeft);
  
  // Kerah kanan
  const collarRightGeometry = new THREE.BoxGeometry(0.12, 0.1, 0.06);
  const collarRight = new THREE.Mesh(collarRightGeometry, collarMaterial);
  collarRight.position.set(0.15, 0.78, 0.13); // Di kanan atas dada
  collarRight.rotation.z = -0.2; // Sedikit miring untuk efek kerah
  guideGroup.add(collarRight);
  
  // Kancing putih (4 buah) di bagian depan kemeja
  const buttonGeometry = new THREE.SphereGeometry(0.03, isMobile ? 8 : 16, isMobile ? 8 : 16);
  const buttonMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xFFFFFF, // Putih untuk kancing
    fog: false
  });
  const buttonPositions = [
    [0, 0.65, 0.15], // Kancing atas
    [0, 0.5, 0.15],  // Kancing tengah atas
    [0, 0.35, 0.15], // Kancing tengah bawah
    [0, 0.2, 0.15],  // Kancing bawah
  ];
  buttonPositions.forEach(([x, y, z]) => {
    const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
    button.position.set(x, y, z);
    guideGroup.add(button);
  });

  // Head - Bulat untuk cowo
  const headGeometry = new THREE.SphereGeometry(0.2, isMobile ? 8 : 16, isMobile ? 8 : 16);
  const headMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xD4A574, // Tan skin untuk cowo
    fog: false
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.set(0, 1.0, 0); // Di atas body
  guideGroup.add(head);

  // KACAMATA - Frame kacamata
  // Frame kiri (lensa kiri)
  const glassesFrameLeftGeometry = new THREE.RingGeometry(0.05, 0.07, 16);
  const glassesFrameMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x2C2C2C, // Hitam untuk frame
    fog: false,
    side: THREE.DoubleSide
  });
  const glassesFrameLeft = new THREE.Mesh(glassesFrameLeftGeometry, glassesFrameMaterial);
  glassesFrameLeft.position.set(-0.06, 1.0, 0.21); // Di mata kiri, di permukaan kepala
  glassesFrameLeft.rotation.x = Math.PI / 2; // Horizontal
  guideGroup.add(glassesFrameLeft);

  // Frame kanan (lensa kanan)
  const glassesFrameRight = new THREE.Mesh(glassesFrameLeftGeometry, glassesFrameMaterial);
  glassesFrameRight.position.set(0.06, 1.0, 0.21); // Di mata kanan, di permukaan kepala
  glassesFrameRight.rotation.x = Math.PI / 2; // Horizontal
  guideGroup.add(glassesFrameRight);

  // Bridge kacamata (penghubung antara dua lensa)
  const bridgeGeometry = new THREE.BoxGeometry(0.04, 0.02, 0.01);
  const bridge = new THREE.Mesh(bridgeGeometry, glassesFrameMaterial);
  bridge.position.set(0, 1.0, 0.21); // Di tengah, di permukaan kepala
  guideGroup.add(bridge);

  // Temples (kaki kacamata) - kiri
  const templeLeftGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.01);
  const templeLeft = new THREE.Mesh(templeLeftGeometry, glassesFrameMaterial);
  templeLeft.position.set(-0.12, 1.0, 0.21); // Di samping kiri frame
  templeLeft.rotation.y = -0.3; // Sedikit miring ke belakang
  guideGroup.add(templeLeft);

  // Temples (kaki kacamata) - kanan
  const templeRightGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.01);
  const templeRight = new THREE.Mesh(templeRightGeometry, glassesFrameMaterial);
  templeRight.position.set(0.12, 1.0, 0.21); // Di samping kanan frame
  templeRight.rotation.y = 0.3; // Sedikit miring ke belakang
  guideGroup.add(templeRight);

  // Lensa kacamata (transparan dengan sedikit warna)
  const lensGeometry = new THREE.CircleGeometry(0.05, 16);
  const lensMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xE0E0E0, // Abu-abu terang untuk lensa
    fog: false,
    transparent: true,
    opacity: 0.3,
    side: THREE.DoubleSide
  });
  const lensLeft = new THREE.Mesh(lensGeometry, lensMaterial);
  lensLeft.position.set(-0.06, 1.0, 0.22); // Sedikit lebih ke depan dari frame
  lensLeft.rotation.x = Math.PI / 2; // Horizontal
  guideGroup.add(lensLeft);

  const lensRight = new THREE.Mesh(lensGeometry, lensMaterial);
  lensRight.position.set(0.06, 1.0, 0.22); // Sedikit lebih ke depan dari frame
  lensRight.rotation.x = Math.PI / 2; // Horizontal
  guideGroup.add(lensRight);

  // Eyes - Mata di bawah kacamata
  // Mata kiri
  const leftEyeGeometry = new THREE.SphereGeometry(0.02, 8, 8);
  const eyeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000, // Hitam untuk mata
    fog: false
  });
  const leftEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
  leftEye.position.set(-0.06, 1.0, 0.21); // Di permukaan kepala, di belakang lensa
  guideGroup.add(leftEye);

  // Mata kanan
  const rightEye = new THREE.Mesh(leftEyeGeometry, eyeMaterial);
  rightEye.position.set(0.06, 1.0, 0.21); // Di permukaan kepala, di belakang lensa
  guideGroup.add(rightEye);

  // Eyebrows - Alis
  const eyebrowGeometry = new THREE.BoxGeometry(0.08, 0.02, 0.01);
  const eyebrowMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x3D2817, // Coklat gelap untuk alis
    fog: false
  });
  const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
  leftEyebrow.position.set(-0.06, 1.08, 0.21); // Di atas mata kiri
  guideGroup.add(leftEyebrow);

  const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
  rightEyebrow.position.set(0.06, 1.08, 0.21); // Di atas mata kanan
  guideGroup.add(rightEyebrow);

  // Nose - Hidung kecil
  const noseGeometry = new THREE.SphereGeometry(0.015, 8, 8);
  const noseMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xD4A574, // Tan skin untuk hidung
    fog: false
  });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.set(0, 0.98, 0.21); // Di tengah, di permukaan kepala
  guideGroup.add(nose);

  // Mouth - Senyuman
  const mouthGeometry = new THREE.TorusGeometry(0.05, 0.01, 12, 24, Math.PI);
  const mouthMaterial = new THREE.MeshBasicMaterial({
    color: 0xFF0000, // Merah untuk mulut senyuman
    fog: false
  });
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  mouth.rotation.x = Math.PI / 2; // Rotasi agar torus horizontal (melengkung ke atas)
  mouth.position.set(0, 0.92, 0.193); // Di permukaan kepala
  guideGroup.add(mouth);

  // Hair - Rambut pendek untuk cowo
  const hairGeometry = new THREE.BoxGeometry(0.45, 0.15, 0.25);
  const hairMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x2C2C2C, // Hitam untuk rambut
    fog: false
  });
  const hair = new THREE.Mesh(hairGeometry, hairMaterial);
  hair.position.set(0, 1.15, 0.05); // Di atas kepala, sedikit ke belakang
  guideGroup.add(hair);

  // Sleeves - Lengan kiri
  const leftSleeveGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);
  const sleeveMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x4A90E2, // Biru untuk lengan
    fog: false
  });
  const leftSleeve = new THREE.Mesh(leftSleeveGeometry, sleeveMaterial);
  leftSleeve.position.set(-0.3, 0.2, 0);
  guideGroup.add(leftSleeve);

  // Sleeves - Lengan kanan
  const rightSleeve = new THREE.Mesh(leftSleeveGeometry, sleeveMaterial);
  rightSleeve.position.set(0.3, 0.2, 0);
  guideGroup.add(rightSleeve);

  // Fists - Tangan kiri (kepalan)
  const fistSize = 0.12;
  const fistGeometry = new THREE.BoxGeometry(fistSize, fistSize, fistSize);
  const fistMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xD4A574, // Tan skin untuk tangan
    fog: false
  });
  const leftFist = new THREE.Mesh(fistGeometry, fistMaterial);
  // Posisi: sleeve bottom di y = 0.2 - 0.3 = -0.1, fist center harus di y = -0.1 + fistSize/2 = -0.04
  // Tapi kita ingin sedikit overlap, jadi y = -0.06
  const fistCenterY = -0.06;
  leftFist.position.set(-0.3, fistCenterY, 0);
  guideGroup.add(leftFist);

  // Fists - Tangan kanan
  const rightFist = new THREE.Mesh(fistGeometry, fistMaterial);
  rightFist.position.set(0.3, fistCenterY, 0);
  guideGroup.add(rightFist);

  // Legs - Kaki kiri
  const legGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);
  const legMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x8B7355, // Coklat untuk celana
    fog: false
  });
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.15, -0.2, 0);
  leftLeg.userData.isLeftLeg = true;
  leftLeg.userData.basePosition = { x: -0.15, y: -0.2, z: 0 };
  guideGroup.add(leftLeg);

  // Legs - Kaki kanan
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.15, -0.2, 0);
  rightLeg.userData.isRightLeg = true;
  rightLeg.userData.basePosition = { x: 0.15, y: -0.2, z: 0 };
  guideGroup.add(rightLeg);

  // Shoes - Sepatu kiri (HITAM)
  const shoeHeight = 0.12;
  const shoeCenterY = -0.5 + shoeHeight / 2; // Bottom of leg at -0.5, shoe center at -0.5 + height/2
  const leftShoeFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, shoeHeight, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }) // HITAM untuk sepatu depan
  );
  leftShoeFront.position.set(-0.15, shoeCenterY, 0.08);
  leftShoeFront.userData.isLeftShoe = true;
  leftShoeFront.userData.basePosition = { x: -0.15, y: shoeCenterY, z: 0.08 };
  guideGroup.add(leftShoeFront);
  
  const leftShoeBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, shoeHeight, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }) // HITAM untuk sepatu belakang
  );
  leftShoeBack.position.set(-0.15, shoeCenterY, -0.08);
  leftShoeBack.userData.isLeftShoe = true;
  leftShoeBack.userData.basePosition = { x: -0.15, y: shoeCenterY, z: -0.08 };
  guideGroup.add(leftShoeBack);
  
  // Sepatu kanan - HITAM
  const rightShoeFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, shoeHeight, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }) // HITAM untuk sepatu depan
  );
  rightShoeFront.position.set(0.15, shoeCenterY, 0.08);
  rightShoeFront.userData.isRightShoe = true;
  rightShoeFront.userData.basePosition = { x: 0.15, y: shoeCenterY, z: 0.08 };
  guideGroup.add(rightShoeFront);
  
  const rightShoeBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, shoeHeight, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }) // HITAM untuk sepatu belakang
  );
  rightShoeBack.position.set(0.15, shoeCenterY, -0.08);
  rightShoeBack.userData.isRightShoe = true;
  rightShoeBack.userData.basePosition = { x: 0.15, y: shoeCenterY, z: -0.08 };
  guideGroup.add(rightShoeBack);

  // Enable shadows
  guideGroup.castShadow = !isMobile; // Disable shadows on mobile
  guideGroup.receiveShadow = !isMobile;

  // Set initial position - Di luar rumah, bersampingan dengan Giva
  // Giva berada di (-1, 0.5, -9), Erbe akan berada di samping kiri Giva
  guideGroup.position.set(-2, 0.5, -9); // Di luar rumah, di samping kiri Giva

  // Add to scene
  scene.add(guideGroup);

  return guideGroup;
}

