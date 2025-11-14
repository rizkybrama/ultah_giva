// Player character creation - creates a blocky character with connected body parts

export function createPlayerCharacter(THREE: any, scene: any): any {
  // Detect mobile for performance optimization
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (typeof window !== 'undefined' && window.innerWidth <= 768);
  
  const playerGroup = new THREE.Group();

  // Body (torso) - Kemeja abu-abu gelap/hitam dengan kerah dan kancing
  // Bagian belakang body
  const bodyBackGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
  const bodyBackMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x333333, // Abu-abu gelap untuk baju (belakang)
    fog: false
  });
  const bodyBack = new THREE.Mesh(bodyBackGeometry, bodyBackMaterial);
  bodyBack.position.set(0, 0.4, -0.1); // Di belakang (z negatif)
  playerGroup.add(bodyBack);
  
  // Bagian depan body - Kemeja abu-abu gelap dengan kerah
  const bodyFrontGeometry = new THREE.BoxGeometry(0.6, 0.8, 0.2);
  const bodyFrontMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x333333, // Abu-abu gelap untuk kemeja (depan)
    fog: false
  });
  const bodyFront = new THREE.Mesh(bodyFrontGeometry, bodyFrontMaterial);
  bodyFront.position.set(0, 0.4, 0.1); // Di depan (z positif)
  playerGroup.add(bodyFront);
  
  // Kerah kemeja di bagian depan - LEBIH JELAS dan TERLIHAT
  // Kerah kiri
  const collarLeftGeometry = new THREE.BoxGeometry(0.12, 0.1, 0.06);
  const collarMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x333333, // Abu-abu gelap untuk kerah
    fog: false
  });
  const collarLeft = new THREE.Mesh(collarLeftGeometry, collarMaterial);
  collarLeft.position.set(-0.15, 0.78, 0.13); // Di kiri atas dada
  collarLeft.rotation.z = 0.2; // Sedikit miring untuk efek kerah
  playerGroup.add(collarLeft);
  
  // Kerah kanan
  const collarRightGeometry = new THREE.BoxGeometry(0.12, 0.1, 0.06);
  const collarRight = new THREE.Mesh(collarRightGeometry, collarMaterial);
  collarRight.position.set(0.15, 0.78, 0.13); // Di kanan atas dada
  collarRight.rotation.z = -0.2; // Sedikit miring untuk efek kerah
  playerGroup.add(collarRight);
  
  // Kancing putih (4 buah) di bagian depan kemeja - LEBIH BESAR dan LEBIH KE DEPAN agar JELAS TERLIHAT
  const buttonGeometry = new THREE.SphereGeometry(0.03, isMobile ? 8 : 16, isMobile ? 8 : 16); // PERBESAR dari 0.03 ke 0.05 agar lebih terlihat
  const buttonMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xFFFFFF, // Putih untuk kancing
    fog: false
  });
  
  // Kancing 1 (teratas) - di bawah kerah, LEBIH KE DEPAN dari body front
  const button1 = new THREE.Mesh(buttonGeometry, buttonMaterial);
  button1.position.set(0, 0.68, 0.2); // Lebih ke depan (z = 0.2, body front di z = 0.1) agar tidak tertutup
  playerGroup.add(button1);
  
  // Kancing 2 - LEBIH KE DEPAN
  const button2 = new THREE.Mesh(buttonGeometry, buttonMaterial);
  button2.position.set(0, 0.50, 0.2); // Lebih ke depan agar tidak tertutup body front
  playerGroup.add(button2);
  
  // Kancing 3 - LEBIH KE DEPAN
  const button3 = new THREE.Mesh(buttonGeometry, buttonMaterial);
  button3.position.set(0, 0.32, 0.2); // Lebih ke depan agar tidak tertutup body front
  playerGroup.add(button3);
  
  // Kancing 4 (terbawah) - LEBIH KE DEPAN
  const button4 = new THREE.Mesh(buttonGeometry, buttonMaterial);
  button4.position.set(0, 0.14, 0.2); // Lebih ke depan agar tidak tertutup body front
  playerGroup.add(button4);

  // Head - BULAT (bukan kotak) menggunakan SphereGeometry
  const headGeometry = new THREE.SphereGeometry(0.2, isMobile ? 8 : 16, isMobile ? 8 : 16); // Bulat dengan radius 0.2
  const headMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xFFDBB3, // Skin tone
    fog: false // Tidak terpengaruh fog
  });
  const head = new THREE.Mesh(headGeometry, headMaterial);
  head.position.y = 1.0;
  playerGroup.add(head);
  
  // Hijab - Hitam solid, SEDERHANA: menutupi kepala tapi BUKA wajah
  const hijabMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000, // Hitam solid
    fog: false
  });
  
  // Hijab utama: bola besar yang menutupi kepala, tapi dipotong bagian depan
  // Gunakan sphere yang lebih besar dari kepala, diposisikan sedikit di atas
  const hijabMainGeometry = new THREE.SphereGeometry(0.25, 16, 16);
  const hijabMain = new THREE.Mesh(hijabMainGeometry, hijabMaterial);
  hijabMain.position.set(0, 1.05, -0.05); // Sedikit di atas dan mundur
  // Potong bagian depan dengan scale atau clip
  hijabMain.scale.set(1, 0.9, 0.85); // Kurangi bagian depan
  playerGroup.add(hijabMain);
  
  // Hijab bagian belakang turun - NATURAL seperti rambut panjang yang jatuh
  // Gunakan beberapa bagian yang melengkung untuk efek natural
  // Bagian 1 (atas) - mulai dari belakang kepala
  const hijabBack1Geometry = new THREE.BoxGeometry(0.45, 0.15, 0.1);
  const hijabBack1 = new THREE.Mesh(hijabBack1Geometry, hijabMaterial);
  hijabBack1.position.set(0, 0.85, -0.2);
  hijabBack1.rotation.x = -0.1; // Sedikit melengkung
  playerGroup.add(hijabBack1);
  
  // Bagian 2 (tengah) - turun lebih panjang
  const hijabBack2Geometry = new THREE.BoxGeometry(0.4, 0.2, 0.1);
  const hijabBack2 = new THREE.Mesh(hijabBack2Geometry, hijabMaterial);
  hijabBack2.position.set(0, 0.65, -0.3);
  hijabBack2.rotation.x = -0.15; // Lebih melengkung
  playerGroup.add(hijabBack2);
  
  // Bagian 3 (bawah) - bagian paling panjang
  const hijabBack3Geometry = new THREE.BoxGeometry(0.35, 0.25, 0.1);
  const hijabBack3 = new THREE.Mesh(hijabBack3Geometry, hijabMaterial);
  hijabBack3.position.set(0, 0.45, -0.38);
  hijabBack3.rotation.x = -0.2; // Paling melengkung
  playerGroup.add(hijabBack3);
  
  // Bagian samping kiri belakang - untuk efek lebih natural
  const hijabBackLeftGeometry = new THREE.BoxGeometry(0.08, 0.4, 0.1);
  const hijabBackLeft = new THREE.Mesh(hijabBackLeftGeometry, hijabMaterial);
  hijabBackLeft.position.set(-0.18, 0.7, -0.25);
  hijabBackLeft.rotation.x = -0.1;
  playerGroup.add(hijabBackLeft);
  
  // Bagian samping kanan belakang - untuk efek lebih natural
  const hijabBackRightGeometry = new THREE.BoxGeometry(0.08, 0.4, 0.1);
  const hijabBackRight = new THREE.Mesh(hijabBackRightGeometry, hijabMaterial);
  hijabBackRight.position.set(0.18, 0.7, -0.25);
  hijabBackRight.rotation.x = -0.1;
  playerGroup.add(hijabBackRight);
  
  // Hijab bingkai leher - hanya di bawah, TIDAK menutupi wajah
  const hijabNeckGeometry = new THREE.BoxGeometry(0.48, 0.2, 0.06);
  const hijabNeck = new THREE.Mesh(hijabNeckGeometry, hijabMaterial);
  hijabNeck.position.set(0, 0.68, -0.05); // Mundur, hanya di leher
  playerGroup.add(hijabNeck);
  
  // Muka/Wajah di depan kepala - mata dan mulut untuk membedakan depan
  // Mata (dua titik kecil di depan)
  const eyeGeometry = new THREE.SphereGeometry(0.03, 8, 8);
  const eyeMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000, // Hitam untuk mata
    fog: false 
  });
  
  // Alis - di atas mata, bentuk melengkung
  const eyebrowGeometry = new THREE.BoxGeometry(0.06, 0.01, 0.01);
  const eyebrowMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x000000, // Hitam untuk alis
    fog: false 
  });
  
  // Alis kiri - di atas mata kiri
  const leftEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
  leftEyebrow.position.set(-0.08, 1.08, 0.19); // Di atas mata kiri
  leftEyebrow.rotation.z = 0.1; // Sedikit melengkung
  playerGroup.add(leftEyebrow);
  
  // Alis kanan - di atas mata kanan
  const rightEyebrow = new THREE.Mesh(eyebrowGeometry, eyebrowMaterial);
  rightEyebrow.position.set(0.08, 1.08, 0.19); // Di atas mata kanan
  rightEyebrow.rotation.z = -0.1; // Sedikit melengkung (mirror)
  playerGroup.add(rightEyebrow);
  
  // Mata kiri - posisi MENEMPEL di permukaan kepala bulat (radius 0.2)
  // Perhitungan: x² + (y-1.0)² + z² = 0.2²
  // Untuk x = 0.08, y = 1.05: z ≈ 0.19
  const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  leftEye.position.set(-0.08, 1.05, 0.19); // Menempel di permukaan kepala bulat
  playerGroup.add(leftEye);
  
  // Mata kanan - posisi MENEMPEL di permukaan kepala bulat
  const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
  rightEye.position.set(0.08, 1.05, 0.19); // Menempel di permukaan kepala bulat
  playerGroup.add(rightEye);
  
  // Hidung - kecil dan bulat, MENEMPEL di permukaan kepala bulat
  // Untuk x = 0, y = 0.98: z ≈ 0.2
  const noseGeometry = new THREE.SphereGeometry(0.015, 8, 8);
  const noseMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xFFDBB3, // Warna kulit
    fog: false 
  });
  const nose = new THREE.Mesh(noseGeometry, noseMaterial);
  nose.position.set(0, 0.98, 0.2); // Menempel di permukaan kepala bulat
  playerGroup.add(nose);
  
  // Mulut - Senyuman melengkung merah ke atas, MENEMPEL di permukaan kepala bulat
  // Perhitungan: Head center di (0, 1.0, 0), radius = 0.2
  // Untuk y = 0.92, x = 0: z = sqrt(0.2² - (0.92-1.0)² - 0²) = sqrt(0.04 - 0.0064) = sqrt(0.0336) ≈ 0.183
  // Torus dengan radius 0.05 dan tube 0.01, center harus di z = 0.183 + 0.01 = 0.193 untuk menempel
  const mouthGeometry = new THREE.TorusGeometry(0.05, 0.01, 12, 24, Math.PI); // Tube lebih tipis (0.01)
  const mouthMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xFF0000, // Merah untuk mulut senyuman
    fog: false 
  });
  const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
  // Rotasi untuk membuat senyuman melengkung ke atas (U shape)
  mouth.rotation.x = Math.PI / 2; // Rotasi agar torus horizontal (melengkung ke atas)
  // Posisi: center torus di z = 0.193 (permukaan kepala 0.183 + tube radius 0.01)
  mouth.position.set(0, 0.92, 0.193); // BENAR-BENAR menempel di permukaan kepala
  playerGroup.add(mouth);

  // Arms (sleeves) - Lengan panjang kemeja abu-abu gelap
  const sleeveGeometry = new THREE.BoxGeometry(0.15, 0.6, 0.15);
  const sleeveMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x333333, // Abu-abu gelap untuk lengan (match dengan kemeja)
    fog: false // Tidak terpengaruh fog
  });
  
  // Left arm (sleeve)
  const leftSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
  leftSleeve.position.set(-0.35, 0.5, 0);
  playerGroup.add(leftSleeve);
  
  // Right arm (sleeve)
  const rightSleeve = new THREE.Mesh(sleeveGeometry, sleeveMaterial);
  rightSleeve.position.set(0.35, 0.5, 0);
  playerGroup.add(rightSleeve);

  // Hands - Tangan coklat muda berbentuk seperti "C" atau "U" tebal (bukan kepalan)
  // Gunakan bentuk yang lebih halus dan melengkung
  const handMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xD4A574, // Coklat muda/sawo matang untuk tangan (match dengan wajah)
    fog: false
  });
  
  // Sleeve center: y = 0.5, height = 0.6
  // Sleeve bottom = 0.5 - 0.3 = 0.2
  const sleeveCenterY = 0.5;
  const sleeveHeight = 0.6;
  const sleeveBottom = sleeveCenterY - sleeveHeight / 2; // = 0.2
  const handHeight = 0.2;
  const handHalfHeight = handHeight / 2; // = 0.1
  const handCenterY = sleeveBottom - handHalfHeight + 0.05; // = 0.2 - 0.1 + 0.05 = 0.15
  
  // Left hand - bentuk melengkung seperti "C" atau "U"
  // Gunakan beberapa box untuk membuat bentuk melengkung
  const leftHandPart1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.08), handMaterial);
  leftHandPart1.position.set(-0.35, handCenterY, 0.02);
  leftHandPart1.rotation.z = -0.3; // Rotasi untuk bentuk melengkung
  playerGroup.add(leftHandPart1);
  
  const leftHandPart2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.08), handMaterial);
  leftHandPart2.position.set(-0.35, handCenterY - 0.05, 0);
  playerGroup.add(leftHandPart2);
  
  // Right hand - bentuk melengkung seperti "C" atau "U"
  const rightHandPart1 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.08), handMaterial);
  rightHandPart1.position.set(0.35, handCenterY, 0.02);
  rightHandPart1.rotation.z = 0.3; // Rotasi untuk bentuk melengkung
  playerGroup.add(rightHandPart1);
  
  const rightHandPart2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.15, 0.08), handMaterial);
  rightHandPart2.position.set(0.35, handCenterY - 0.05, 0);
  playerGroup.add(rightHandPart2);

  // Legs - gunakan MeshBasicMaterial agar warna tidak berubah karena lighting
  // Bagian kaki (bawahan krem/coklat muda) - dikurangi sedikit untuk memberi ruang sepatu
  const legGeometry = new THREE.BoxGeometry(0.2, 0.5, 0.2);
  const legMaterial = new THREE.MeshBasicMaterial({ 
    color: 0xD2B48C, // Krem/coklat muda untuk bawahan
    fog: false
  });
  
  // Left leg (bagian pants) - sedikit lebih tinggi agar sepatu terlihat jelas di bawah
  const leftLeg = new THREE.Mesh(legGeometry, legMaterial);
  leftLeg.position.set(-0.15, -0.25, 0);
  leftLeg.userData.isLeftLeg = true; // Mark untuk animasi
  leftLeg.userData.basePosition = { x: -0.15, y: -0.25, z: 0 }; // Simpan posisi base
  playerGroup.add(leftLeg);
  
  // Right leg (bagian pants) - sedikit lebih tinggi agar sepatu terlihat jelas di bawah
  const rightLeg = new THREE.Mesh(legGeometry, legMaterial);
  rightLeg.position.set(0.15, -0.25, 0);
  rightLeg.userData.isRightLeg = true; // Mark untuk animasi
  rightLeg.userData.basePosition = { x: 0.15, y: -0.25, z: 0 }; // Simpan posisi base
  playerGroup.add(rightLeg);
  
  // Sepatu di bagian bawah kaki - LEBIH BESAR dan JELAS untuk membedakan depan dan belakang
  // PERBAIKAN: Sepatu harus tepat di ground level (y = -0.5 relatif ke playerGroup)
  // Ground di y=0, playerGroup di y=0.5, jadi ground relatif = -0.5
  // Sepatu tinggi 0.15, half = 0.075, jadi center sepatu = -0.5 + 0.075 = -0.425
  const shoeHeight = 0.15;
  const shoeCenterY = -0.425; // Tepat di ground level (bottom sepatu di y = -0.5)
  
  // Sepatu kiri - HITAM
  const leftShoeFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, shoeHeight, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }) // HITAM untuk sepatu depan
  );
  leftShoeFront.position.set(-0.15, shoeCenterY, 0.08);
  leftShoeFront.userData.isLeftShoe = true;
  leftShoeFront.userData.basePosition = { x: -0.15, y: shoeCenterY, z: 0.08 };
  playerGroup.add(leftShoeFront);
  
  const leftShoeBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, shoeHeight, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }) // HITAM untuk sepatu belakang
  );
  leftShoeBack.position.set(-0.15, shoeCenterY, -0.08);
  leftShoeBack.userData.isLeftShoe = true;
  leftShoeBack.userData.basePosition = { x: -0.15, y: shoeCenterY, z: -0.08 };
  playerGroup.add(leftShoeBack);
  
  // Sepatu kanan - HITAM
  const rightShoeFront = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, shoeHeight, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }) // HITAM untuk sepatu depan
  );
  rightShoeFront.position.set(0.15, shoeCenterY, 0.08);
  rightShoeFront.userData.isRightShoe = true;
  rightShoeFront.userData.basePosition = { x: 0.15, y: shoeCenterY, z: 0.08 };
  playerGroup.add(rightShoeFront);
  
  const rightShoeBack = new THREE.Mesh(
    new THREE.BoxGeometry(0.26, shoeHeight, 0.16),
    new THREE.MeshBasicMaterial({ color: 0x000000, fog: false }) // HITAM untuk sepatu belakang
  );
  rightShoeBack.position.set(0.15, shoeCenterY, -0.08);
  rightShoeBack.userData.isRightShoe = true;
  rightShoeBack.userData.basePosition = { x: 0.15, y: shoeCenterY, z: -0.08 };
  playerGroup.add(rightShoeBack);

  // Enable shadows (only on desktop)
  playerGroup.castShadow = !isMobile;
  playerGroup.receiveShadow = !isMobile;

  // Set initial position - OUTSIDE house, dari agak jauh
  // Camera di (-1, 3.5, -12), door di (-1, 1.5, -5.85)
  // Player mulai dari jauh (z = -15) agar terlihat dari kejauhan
  playerGroup.position.set(-1, 0.5, -15); // Di luar rumah, dari agak jauh
  playerGroup.userData.name = 'Giva'; // Set name for dialog system

  // Add to scene
  scene.add(playerGroup);

  return playerGroup;
}