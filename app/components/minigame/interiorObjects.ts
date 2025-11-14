// Interior objects helper - creates furniture and interactive objects inside house
import { 
  validatePosition,
  setValidatedPosition,
  addToCollision,
  type ValidationRules,
  HOUSE_BOUNDS
} from './validationHelpers';
import { createCeramicTileFloor, createRug } from './interiorFloor';
import { createTVSlideshow, createTVControlsUI, type MediaItem } from './tvSlideshow';
import { createRealisticCake } from './birthdayCake';
import { createLilyBouquet } from './lilyBouquet';
import { tvSlideshowConfig } from './tvSlideshowConfig';

export function addInteriorObjects(
  scene: any, 
  THREE: any, 
  collisionObjects: any[],
  selectedCoupons: Array<{ id: number; title: string; emoji: string }>
) {
  // Detect mobile for performance optimization
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (typeof window !== 'undefined' && window.innerWidth <= 768);
  
  // Create ceramic tile floor
  const floor = createCeramicTileFloor(scene, THREE, HOUSE_BOUNDS);
  scene.add(floor);
  
  // Create rug in front of sofa for contrast
  const rug = createRug(scene, THREE, { x: 0, y: 0, z: 2 });
  scene.add(rug);
  // Rules untuk interior objects: harus di dalam rumah, dengan collision
  const interiorRules: ValidationRules = {
    avoidPath: false, // Tidak relevan untuk interior
    avoidHouse: false,
    insideHouse: true, // HARUS di dalam rumah
    collision: true // Default: interior objects have collision
  };
  // Clear existing interior objects first
  const objectsToRemove: any[] = [];
  scene.traverse((child: any) => {
    if (child.userData && child.userData.interactive && child.userData.interior) {
      const index = collisionObjects.indexOf(child);
      if (index > -1) {
        collisionObjects.splice(index, 1);
      }
      objectsToRemove.push(child);
    }
  });
  objectsToRemove.forEach(obj => {
    try {
      scene.remove(obj);
      if (obj.parent) {
        obj.parent.remove(obj);
      }
    } catch (e) {
      console.warn('Error removing object:', e);
    }
  });

  // Neutral color palette: light brown wood, white, grey
  const woodMaterial = new THREE.MeshStandardMaterial({ color: 0xD2B48C }); // Light brown wood
  const whiteMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }); // White
  const greyMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 }); // Light grey

  // === LEFT SIDE OF ROOM - Symmetrical arrangement ===
  
  // Sofa set (left side) - Neutral colors, symmetrical, on floor
  const leftSofaGeometry = new THREE.BoxGeometry(2.5, 0.8, 1.8);
  const leftSofaMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 }); // Light grey
  const leftSofa = new THREE.Mesh(leftSofaGeometry, leftSofaMaterial);
  leftSofa.position.set(-6, 0.4, 4); // Y = 0.4 (setengah tinggi 0.8), bottom at y = 0
  leftSofa.userData = { type: 'sofa', interactive: true, interior: true };
  leftSofa.castShadow = true;
  leftSofa.receiveShadow = true;
  scene.add(leftSofa);
  addToCollision(leftSofa, collisionObjects, interiorRules);

  // Side table (left, front) - Light brown wood with legs
  const leftTableTopGeometry = new THREE.BoxGeometry(1.2, 0.1, 1.2);
  const leftTableTop = new THREE.Mesh(leftTableTopGeometry, woodMaterial);
  leftTableTop.position.set(-6, 0.55, 0); // Top at y = 0.55 (legs height 0.5)
  leftTableTop.castShadow = true;
  leftTableTop.receiveShadow = true;
  scene.add(leftTableTop);
  addToCollision(leftTableTop, collisionObjects, interiorRules);

  // Table legs
  const tableLegGeometry = new THREE.BoxGeometry(0.08, 0.5, 0.08);
  const legPositions = [
    [-6.5, 0.25, -0.5],
    [-5.5, 0.25, -0.5],
    [-6.5, 0.25, 0.5],
    [-5.5, 0.25, 0.5],
  ];
  legPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(tableLegGeometry, woodMaterial);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    scene.add(leg);
    addToCollision(leg, collisionObjects, interiorRules);
  });

  // Letter on table
  const letterGeometry = new THREE.BoxGeometry(0.5, 0.01, 0.7);
  const letterMaterial = new THREE.MeshStandardMaterial({ color: 0xF5F5F5 }); // Off-white
  const letter = new THREE.Mesh(letterGeometry, letterMaterial);
  letter.position.set(-6, 0.6, 0);
  letter.userData = { type: 'letter', interactive: true, interior: true };
  letter.castShadow = true;
  scene.add(letter);

  // Add collision detection for letter table (prevent player from walking through it)
  // Letter is on a table at x: -6, z: 0, so we need collision for the table area
  const letterTableCollisionBox = new THREE.BoxGeometry(1.2, 0.6, 1.2);
  const letterTableCollisionMesh = new THREE.Mesh(letterTableCollisionBox, new THREE.MeshBasicMaterial({ visible: false }));
  letterTableCollisionMesh.position.set(-6, 0.3, 0); // Table center
  letterTableCollisionMesh.userData.isCollision = true;
  scene.add(letterTableCollisionMesh);
  addToCollision(letterTableCollisionMesh, collisionObjects, interiorRules);

  // === CENTER AREA - Main living room, symmetrical ===

  // Main sofa (center, back) - Light grey, larger, on floor
  const sofaGeometry = new THREE.BoxGeometry(4.5, 0.8, 2);
  const sofaMaterial = new THREE.MeshStandardMaterial({ color: 0xC0C0C0 }); // Light grey
  const sofa = new THREE.Mesh(sofaGeometry, sofaMaterial);
  sofa.position.set(0, 0.4, 4); // Y = 0.4 (setengah tinggi 0.8), bottom at y = 0
  sofa.userData = { type: 'sofa', interactive: true, interior: true };
  sofa.castShadow = true;
  sofa.receiveShadow = true;
  scene.add(sofa);
  addToCollision(sofa, collisionObjects, interiorRules);

  // Coffee table in front of sofa - Light brown wood, centered with legs (LARGER SIZE)
  const coffeeTableTopGeometry = new THREE.BoxGeometry(3.5, 0.1, 2.0); // Increased from 2.2 x 1.2 to 3.5 x 2.0
  const coffeeTableTop = new THREE.Mesh(coffeeTableTopGeometry, woodMaterial);
  // Table top center at y = 0.45, so bottom of table = 0.45 - 0.05 = 0.4
  coffeeTableTop.position.set(0, 0.45, 2);
  coffeeTableTop.castShadow = true;
  coffeeTableTop.receiveShadow = true;
  coffeeTableTop.userData.type = 'table'; // Mark as table for collision detection
  scene.add(coffeeTableTop);
  addToCollision(coffeeTableTop, collisionObjects, interiorRules);
  
  // Coffee table legs - positioned directly under table corners
  // Table top spans: x from -1.75 to 1.75, z from 1.0 to 3.0
  // Legs should be at corners: x = ±1.5, z = 1.2 and 2.8 (slightly inset from edge)
  const coffeeLegGeometry = new THREE.BoxGeometry(0.08, 0.4, 0.08);
  const coffeeLegPositions = [
    [-1.5, 0.2, 1.2],  // Front-left: y = 0.2 (center of 0.4 height leg, bottom at 0, top at 0.4 = table bottom)
    [1.5, 0.2, 1.2],   // Front-right
    [-1.5, 0.2, 2.8],  // Back-left
    [1.5, 0.2, 2.8],   // Back-right
  ];
  coffeeLegPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(coffeeLegGeometry, woodMaterial);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    leg.userData.type = 'table'; // Mark as table for collision detection
    scene.add(leg);
    addToCollision(leg, collisionObjects, interiorRules);
  });

  // Birthday Cake on coffee table - positioned on LEFT side of table
  const cake = createRealisticCake(THREE, scene, { x: -0.8, y: 0.45, z: 2 });
  cake.cakeGroup.userData.interactive = true;
  cake.cakeGroup.userData.interior = true;
  
  // Add collision detection for cake (prevent player from walking through it)
  // Create a collision box around the cake (radius ~0.4, height ~0.5)
  const cakeCollisionBox = new THREE.BoxGeometry(0.8, 0.5, 0.8);
  const cakeCollisionMesh = new THREE.Mesh(cakeCollisionBox, new THREE.MeshBasicMaterial({ visible: false }));
  cakeCollisionMesh.position.set(-0.8, 0.25, 2); // Center of cake (moved to left side)
  cakeCollisionMesh.userData.isCollision = true;
  scene.add(cakeCollisionMesh);
  addToCollision(cakeCollisionMesh, collisionObjects, interiorRules);

  // TV Stand (center, back wall) - Light brown wood, JAUH dari pintu
  const tvStandGeometry = new THREE.BoxGeometry(3, 0.4, 1.2);
  const tvStand = new THREE.Mesh(tvStandGeometry, woodMaterial);
  tvStand.position.set(0, 0.2, 20); // Di dinding belakang, Y = 0.2 (setengah tinggi 0.4)
  tvStand.castShadow = true;
  tvStand.receiveShadow = true;
  scene.add(tvStand);
  addToCollision(tvStand, collisionObjects, interiorRules);

  // TV - Black frame
  const tvGeometry = new THREE.BoxGeometry(2.5, 1.8, 0.2);
  const tvMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a }); // Black
  const tv = new THREE.Mesh(tvGeometry, tvMaterial);
  tv.position.set(0, 1.3, 20); // Di dinding belakang
  tv.castShadow = true;
  tv.receiveShadow = true;
  scene.add(tv);
  addToCollision(tv, collisionObjects, interiorRules);

  // TV Slideshow - Replace old screen with slideshow system
  // Menggunakan konfigurasi dari tvSlideshowConfig.ts
  const mediaItems: MediaItem[] = tvSlideshowConfig.map(item => ({
    type: item.type,
    url: item.url
  }));
  
  const tvSlideshow = createTVSlideshow(
    THREE,
    scene,
    { x: 0, y: 1.5, z: 20.1 }, // Adjusted Y position untuk TV lebih besar
    { width: 4.5, height: 3.2 }, // TV lebih besar: dari 2.2x1.5 menjadi 4.5x3.2
    mediaItems
  );
  
  // Store TV controls for interaction
  const tvControlsUI = createTVControlsUI();
  tv.userData.slideshow = tvSlideshow;
  tv.userData.controlsUI = tvControlsUI;

  // === RIGHT SIDE OF ROOM - Symmetrical to left ===

  // Sofa set (right side) - Mirror of left side, on floor
  const rightSofaGeometry = new THREE.BoxGeometry(2.5, 0.8, 1.8);
  const rightSofa = new THREE.Mesh(rightSofaGeometry, sofaMaterial); // Same grey material
  rightSofa.position.set(6, 0.4, 4); // Y = 0.4 (setengah tinggi 0.8), bottom at y = 0
  rightSofa.userData = { type: 'sofa', interactive: true, interior: true };
  rightSofa.castShadow = true;
  rightSofa.receiveShadow = true;
  scene.add(rightSofa);
  addToCollision(rightSofa, collisionObjects, interiorRules);

  // Side table (right, front) - Light brown wood, symmetrical with legs
  const rightTableTopGeometry = new THREE.BoxGeometry(1.2, 0.1, 1.2);
  const rightTableTop = new THREE.Mesh(rightTableTopGeometry, woodMaterial);
  rightTableTop.position.set(6, 0.55, 0); // Top at y = 0.55 (legs height 0.5)
  rightTableTop.castShadow = true;
  rightTableTop.receiveShadow = true;
  scene.add(rightTableTop);
  addToCollision(rightTableTop, collisionObjects, interiorRules);
  
  // Right table legs
  const rightLegPositions = [
    [5.5, 0.25, -0.5],
    [6.5, 0.25, -0.5],
    [5.5, 0.25, 0.5],
    [6.5, 0.25, 0.5],
  ];
  rightLegPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(tableLegGeometry, woodMaterial);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    scene.add(leg);
    addToCollision(leg, collisionObjects, interiorRules);
  });

  // Wall decorations - Symmetrical wall art
  const wallArtGeometry = new THREE.BoxGeometry(1.5, 1, 0.1);
  const wallArtMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }); // White frames
  const wallArtLeft = new THREE.Mesh(wallArtGeometry, wallArtMaterial);
  wallArtLeft.position.set(-6, 2.5, 4.5);
  wallArtLeft.castShadow = true;
  scene.add(wallArtLeft);
  
  const wallArtRight = new THREE.Mesh(wallArtGeometry, wallArtMaterial);
  wallArtRight.position.set(6, 2.5, 4.5);
  wallArtRight.castShadow = true;
  scene.add(wallArtRight);

  // Bookshelf (right side, back) - Light brown wood, on floor
  const bookshelfGeometry = new THREE.BoxGeometry(1.5, 3, 0.5);
  const bookshelf = new THREE.Mesh(bookshelfGeometry, woodMaterial);
  bookshelf.position.set(6, 1.5, 4); // Y = 1.5 (setengah tinggi 3), bottom at y = 0
  bookshelf.userData = { type: 'bookshelf', interactive: true, interior: true };
  bookshelf.castShadow = true;
  bookshelf.receiveShadow = true;
  scene.add(bookshelf);
  addToCollision(bookshelf, collisionObjects, interiorRules);

  // Sideboard/Console table (right side, center) - for lily bouquet
  const sideboardTopGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.8);
  const sideboardTop = new THREE.Mesh(sideboardTopGeometry, woodMaterial);
  sideboardTop.position.set(6, 0.55, 0); // Top at y = 0.55 (legs height 0.5)
  sideboardTop.castShadow = true;
  sideboardTop.receiveShadow = true;
  sideboardTop.userData.type = 'table'; // Mark as table for collision detection
  scene.add(sideboardTop);
  addToCollision(sideboardTop, collisionObjects, interiorRules);
  
  // Sideboard legs
  const sideboardLegPositions = [
    [5.25, 0.25, -0.3],
    [6.75, 0.25, -0.3],
    [5.25, 0.25, 0.3],
    [6.75, 0.25, 0.3],
  ];
  sideboardLegPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(tableLegGeometry, woodMaterial);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    scene.add(leg);
    addToCollision(leg, collisionObjects, interiorRules);
  });

  // Add collision detection for sideboard table (prevent player from walking through it)
  // Table size: 1.5 x 0.8, position: x: 6, z: 0, height: 0.55
  const sideboardCollisionBox = new THREE.BoxGeometry(1.5, 0.6, 0.8);
  const sideboardCollisionMesh = new THREE.Mesh(sideboardCollisionBox, new THREE.MeshBasicMaterial({ visible: false }));
  sideboardCollisionMesh.position.set(6, 0.3, 0); // Center of collision box
  sideboardCollisionMesh.userData.isCollision = true;
  sideboardCollisionMesh.userData.type = 'table'; // Mark as table for collision detection
  scene.add(sideboardCollisionMesh);
  addToCollision(sideboardCollisionMesh, collisionObjects, interiorRules);

  // Lily Bouquet on sideboard
  const lilyBouquet = createLilyBouquet(THREE, scene, { x: 6, y: 0.55, z: 0 });
  lilyBouquet.bouquetGroup.userData.interactive = true;
  lilyBouquet.bouquetGroup.userData.interior = true;

  // (Cake is now on coffee table, removed old cake table)

  // === ADDITIONAL FURNITURE - Fill empty spaces ===
  
  // Dining table (center-left area) with legs
  const diningTableTopGeometry = new THREE.BoxGeometry(2.5, 0.1, 1.5);
  const diningTableTop = new THREE.Mesh(diningTableTopGeometry, woodMaterial);
  diningTableTop.position.set(-8, 0.7, 8); // Top at y = 0.7 (legs height 0.6)
  diningTableTop.castShadow = true;
  diningTableTop.receiveShadow = true;
  scene.add(diningTableTop);
  addToCollision(diningTableTop, collisionObjects, interiorRules);
  
  // Dining table legs (thicker)
  const diningLegGeometry = new THREE.BoxGeometry(0.1, 0.6, 0.1);
  const diningLegPositions = [
    [-9, 0.3, 7.5],
    [-7, 0.3, 7.5],
    [-9, 0.3, 8.5],
    [-7, 0.3, 8.5],
  ];
  diningLegPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(diningLegGeometry, woodMaterial);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    scene.add(leg);
    addToCollision(leg, collisionObjects, interiorRules);
  });
  
  // Dining chairs around table - on floor
  const chairGeometry = new THREE.BoxGeometry(0.6, 1, 0.6);
  const chairPositions = [
    [-8, 0.5, 9], // Front - Y = 0.5 (setengah tinggi 1), bottom at y = 0
    [-8, 0.5, 7], // Back - Y = 0.5, bottom at y = 0
    [-9.5, 0.5, 8], // Left - Y = 0.5, bottom at y = 0
    [-6.5, 0.5, 8], // Right - Y = 0.5, bottom at y = 0
  ];
  chairPositions.forEach(([x, y, z]) => {
    const chair = new THREE.Mesh(chairGeometry, greyMaterial);
    chair.position.set(x, y, z); // Y = 0.5 ensures bottom touches floor
  chair.castShadow = true;
    chair.receiveShadow = true;
  scene.add(chair);
  addToCollision(chair, collisionObjects, interiorRules);
  });
  
  // Desk/Work table (left side, middle) with legs
  const deskTopGeometry = new THREE.BoxGeometry(2, 0.1, 1);
  const deskTop = new THREE.Mesh(deskTopGeometry, woodMaterial);
  deskTop.position.set(-10, 0.7, 0); // Top at y = 0.7 (legs height 0.6)
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  scene.add(deskTop);
  addToCollision(deskTop, collisionObjects, interiorRules);
  
  // Desk legs
  const deskLegPositions = [
    [-10.8, 0.3, -0.4],
    [-9.2, 0.3, -0.4],
    [-10.8, 0.3, 0.4],
    [-9.2, 0.3, 0.4],
  ];
  deskLegPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(diningLegGeometry, woodMaterial);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    scene.add(leg);
    addToCollision(leg, collisionObjects, interiorRules);
  });
  
  // Desk chair - on floor
  const deskChair = new THREE.Mesh(chairGeometry, greyMaterial);
  deskChair.position.set(-10, 0.5, 1.2); // Y = 0.5 (setengah tinggi 1), bottom at y = 0
  deskChair.castShadow = true;
  deskChair.receiveShadow = true;
  scene.add(deskChair);
  addToCollision(deskChair, collisionObjects, interiorRules);
  
  // Bookshelf (left side, back) - Light brown wood, MENEMPEL DI TEMBOK KIRI
  const leftBookshelfGeometry = new THREE.BoxGeometry(1.5, 3, 0.5);
  const leftBookshelf = new THREE.Mesh(leftBookshelfGeometry, woodMaterial);
  // Tembok kiri di x = -20, bookshelf menempel di x = -19.75 (sedikit di dalam dari tembok)
  // Posisi z: 4 (sama dengan sofa kiri, tapi tidak overlap karena sofa di x: -6)
  leftBookshelf.position.set(-19.75, 1.5, 4); // Y = 1.5 (setengah tinggi 3), bottom at y = 0
  leftBookshelf.castShadow = true;
  leftBookshelf.receiveShadow = true;
  scene.add(leftBookshelf);
  addToCollision(leftBookshelf, collisionObjects, interiorRules);
  
  // Cabinet/Wardrobe - MENEMPEL DI TEMBOK KIRI
  const cabinetGeometry = new THREE.BoxGeometry(2, 2.5, 1);
  const cabinet = new THREE.Mesh(cabinetGeometry, woodMaterial);
  // Tembok kiri di x = -20, lemari menempel di x = -19.75 (sedikit di dalam dari tembok)
  // Posisi z: 0 (jauh dari meja surat di x: -6, z: 0 dan bookshelf di z: 4)
  cabinet.position.set(-19.75, 1.25, 0); // Y = 1.25 (setengah tinggi 2.5), bottom at y = 0
  cabinet.castShadow = true;
  cabinet.receiveShadow = true;
  scene.add(cabinet);
  addToCollision(cabinet, collisionObjects, interiorRules);
  
  // Small side table with plant - DI KIRI TV (TV di x: 0, z: 20)
  const sideTableTopGeometry = new THREE.BoxGeometry(1, 0.1, 1);
  const sideTableTop = new THREE.Mesh(sideTableTopGeometry, woodMaterial);
  sideTableTop.position.set(-3, 0.55, 20); // Di kiri TV (TV di x: 0, z: 20)
  sideTableTop.castShadow = true;
  sideTableTop.receiveShadow = true;
  scene.add(sideTableTop);
  addToCollision(sideTableTop, collisionObjects, interiorRules);
  
  // Side table legs
  const sideLegPositions = [
    [-3.5, 0.25, 19.5],
    [-2.5, 0.25, 19.5],
    [-3.5, 0.25, 20.5],
    [-2.5, 0.25, 20.5],
  ];
  sideLegPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(tableLegGeometry, woodMaterial);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    scene.add(leg);
    addToCollision(leg, collisionObjects, interiorRules);
  });
  
  // Plant pot on side table - Optimize geometry for mobile
  const potGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.4, isMobile ? 8 : 16);
  const potMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown pot
  const pot = new THREE.Mesh(potGeometry, potMaterial);
  pot.position.set(-3, 0.75, 20); // On side table (table top at 0.55, pot center at 0.75)
  pot.castShadow = !isMobile; // Disable shadows on mobile
  scene.add(pot);
  
  // Plant leaves
  const plantGeometry = new THREE.ConeGeometry(0.3, 0.6, isMobile ? 6 : 8);
  const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Green
  const plant = new THREE.Mesh(plantGeometry, plantMaterial);
  plant.position.set(-3, 1.15, 20); // On top of pot
  plant.castShadow = !isMobile; // Disable shadows on mobile
  scene.add(plant);
  
  // Additional chairs (scattered) - on floor
  const chair1 = new THREE.Mesh(chairGeometry, greyMaterial);
  chair1.position.set(-3, 0.5, 8); // Y = 0.5 (setengah tinggi 1), bottom at y = 0
  chair1.castShadow = true;
  chair1.receiveShadow = true;
  scene.add(chair1);
  addToCollision(chair1, collisionObjects, interiorRules);
  
  const chair2 = new THREE.Mesh(chairGeometry, greyMaterial);
  chair2.position.set(3, 0.5, 12); // Y = 0.5 (setengah tinggi 1), bottom at y = 0
  chair2.castShadow = true;
  chair2.receiveShadow = true;
  scene.add(chair2);
  addToCollision(chair2, collisionObjects, interiorRules);
  
  // Coffee table accessories (books, decorative items) - on coffee table
  const bookGeometry = new THREE.BoxGeometry(0.3, 0.05, 0.4);
  const bookMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown books
  for (let i = 0; i < 3; i++) {
    const book = new THREE.Mesh(bookGeometry, bookMaterial);
    book.position.set(-0.3 + i * 0.3, 0.5, 2); // On coffee table (table top at 0.45, book center at 0.5)
    book.rotation.y = Math.random() * 0.2;
    book.castShadow = true;
    scene.add(book);
  }
  
  // Wall decorations - Paintings with Giva images, TEMPEL KE DINDING
  // Dinding kiri: x = -20, dinding kanan: x = 20, dinding belakang: z = 24
  // Lukisan harus sedikit di dalam dari dinding (z atau x offset kecil)
  
  // Helper function to create painting with image texture
  const createPainting = (imagePath: string, position: { x: number; y: number; z: number }, rotation: number = 0) => {
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(imagePath, 
      () => console.log('Painting texture loaded:', imagePath),
      undefined,
      (err: any) => console.warn('Error loading painting texture:', imagePath, err)
    );
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    
    // Frame geometry (slightly thicker for depth)
    const frameGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.05);
    const frameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown wood frame
    
    // Picture geometry (inside frame)
    const pictureGeometry = new THREE.PlaneGeometry(1.0, 0.7);
    const pictureMaterial = new THREE.MeshStandardMaterial({ 
      map: texture,
      side: THREE.DoubleSide
    });
    
    const paintingGroup = new THREE.Group();
    
    // Frame
    const frame = new THREE.Mesh(frameGeometry, frameMaterial);
    frame.position.set(0, 0, 0);
    paintingGroup.add(frame);
    
    // Picture (slightly in front of frame)
    const picture = new THREE.Mesh(pictureGeometry, pictureMaterial);
    picture.position.set(0, 0, 0.03); // Slightly in front
    paintingGroup.add(picture);
    
    paintingGroup.position.set(position.x, position.y, position.z);
    if (rotation !== 0) {
      paintingGroup.rotation.y = rotation;
    }
    paintingGroup.castShadow = true;
    
    return paintingGroup;
  };
  
  // Paintings on LEFT wall (x = -20, so position at x = -19.9 to be inside)
  // Dinding kiri menghadap ke arah positif x, jadi lukisan menghadap ke arah positif x (rotasi Math.PI/2)
  const painting1 = createPainting('/images/giva-1.jpeg', { x: -19.9, y: 2, z: 8 }, Math.PI / 2);
  scene.add(painting1);
  
  const painting3 = createPainting('/images/giva-3.jpeg', { x: -19.9, y: 2, z: 12 }, Math.PI / 2);
  scene.add(painting3);
  
  // Paintings on RIGHT wall (x = 20, so position at x: 19.9 to be inside)
  // Dinding kanan menghadap ke arah negatif x, jadi lukisan menghadap ke arah negatif x (rotasi -Math.PI/2)
  const painting2 = createPainting('/images/giva-2.jpeg', { x: 19.9, y: 2, z: 8 }, -Math.PI / 2);
  scene.add(painting2);
  
  const painting4 = createPainting('/images/giva-4.jpeg', { x: 19.9, y: 2, z: 12 }, -Math.PI / 2);
  scene.add(painting4);
  
  // Paintings on BACK wall (z = 24, so position at z = 23.9 to be inside)
  // Dinding belakang menghadap ke arah negatif z, jadi lukisan perlu rotasi Math.PI (180 derajat)
  const painting5 = createPainting('/images/giva-5.jpeg', { x: -8, y: 2, z: 23.9 }, Math.PI);
  scene.add(painting5);
  
  const painting6 = createPainting('/images/giva-6.jpeg', { x: 8, y: 2, z: 23.9 }, Math.PI);
  scene.add(painting6);
  
  // Floor lamp - DI KANAN TV (TV di x: 0, z: 20) - Optimize for mobile
  const lampBaseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, isMobile ? 6 : 8);
  const lampBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x2C2C2C }); // Dark grey
  const lampBase = new THREE.Mesh(lampBaseGeometry, lampBaseMaterial);
  lampBase.position.set(3, 0.75, 20); // Di kanan TV (TV di x: 0, z: 20), Y = 0.75 (setengah tinggi 1.5), bottom at y = 0
  lampBase.castShadow = !isMobile; // Disable shadows on mobile
  scene.add(lampBase);
  
  const lampShadeGeometry = new THREE.ConeGeometry(0.4, 0.5, isMobile ? 6 : 8);
  const lampShadeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }); // White shade
  const lampShade = new THREE.Mesh(lampShadeGeometry, lampShadeMaterial);
  lampShade.position.set(3, 2.0, 20); // On top of lamp base (base top at 1.5, shade center at 2.0)
  lampShade.castShadow = !isMobile; // Disable shadows on mobile
  scene.add(lampShade);
  
  // Gift boxes (Birthday Coupons) - Multiple pastel boxes on coffee table
  // Create a group for all gift boxes
  const giftBoxesGroup = new THREE.Group();
  giftBoxesGroup.userData.type = 'gifts';
  giftBoxesGroup.userData.interactive = true;
  giftBoxesGroup.userData.interior = true;
  
  // Pastel colors for gift boxes
  const giftColors = [
    0xFFB6C1, // Light pink
    0xFFE4E1, // Misty rose
    0xE0BBE4, // Lavender
    0xB4E0FF, // Sky blue
    0xFFF8DC, // Cornsilk
    0xDDA0DD  // Plum
  ];
  
  // Create 3-4 gift boxes in a row on coffee table - positioned on RIGHT side of table
  const boxCount = 4;
  const boxSize = 0.3;
  const boxSpacing = 0.35;
  const startX = -(boxCount - 1) * boxSpacing / 2;
  // Offset to right side of table (cake is at x: -0.8, so place gifts at x: 0.8+)
  const giftBoxOffsetX = 0.8; // Right side of table, away from cake
  
  for (let i = 0; i < boxCount; i++) {
    const giftGeometry = new THREE.BoxGeometry(boxSize, boxSize, boxSize);
    const giftMaterial = new THREE.MeshStandardMaterial({ 
      color: giftColors[i % giftColors.length],
      roughness: 0.6,
      metalness: 0.1
    });
    const gift = new THREE.Mesh(giftGeometry, giftMaterial);
    gift.position.set(startX + i * boxSpacing, 0, 0);
    gift.castShadow = true;
    gift.receiveShadow = true;

    // Add ribbon to each box
    const ribbonGeometry = new THREE.BoxGeometry(0.03, boxSize, 0.03);
    const ribbonMaterial = new THREE.MeshStandardMaterial({ color: 0xFF69B4 });
    
    // Vertical ribbon
    const ribbon1 = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    ribbon1.position.set(startX + i * boxSpacing, 0, 0);
    giftBoxesGroup.add(ribbon1);
    
    // Horizontal ribbon
    const ribbon2 = new THREE.Mesh(ribbonGeometry, ribbonMaterial);
    ribbon2.rotation.z = Math.PI / 2;
    ribbon2.position.set(startX + i * boxSpacing, 0, 0);
    giftBoxesGroup.add(ribbon2);
    
    giftBoxesGroup.add(gift);
  }
  
  // Position gift boxes group on coffee table - RIGHT side (away from cake on left)
  giftBoxesGroup.position.set(giftBoxOffsetX, 0.85, 2); // On coffee table (table top at 0.45, gift center at 0.85)
  scene.add(giftBoxesGroup);
  
  // Add collision detection for gift boxes
  const giftCollisionBox = new THREE.BoxGeometry(boxCount * boxSpacing, boxSize, boxSize);
  const giftCollisionMesh = new THREE.Mesh(giftCollisionBox, new THREE.MeshBasicMaterial({ visible: false }));
  giftCollisionMesh.position.set(giftBoxOffsetX, 0.85, 2); // Updated position to match gift boxes
  giftCollisionMesh.userData.isCollision = true;
  scene.add(giftCollisionMesh);
  addToCollision(giftCollisionMesh, collisionObjects, interiorRules);

  // Doormat near entrance - dengan jarak dari pintu
  const doormatGeometry = new THREE.PlaneGeometry(1.5, 0.8);
  const doormatMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513, // Brown doormat
    roughness: 0.9
  });
  const doormat = new THREE.Mesh(doormatGeometry, doormatMaterial);
  doormat.rotation.x = -Math.PI / 2;
  doormat.position.set(-1, 0.01, -2.5); // Dengan jarak dari pintu (pintu di z: -5.85, keset di z: -2.5)
  doormat.receiveShadow = true;
  scene.add(doormat);

  // Shoe rack near entrance
  const shoeRackGeometry = new THREE.BoxGeometry(1, 0.3, 0.4);
  const shoeRack = new THREE.Mesh(shoeRackGeometry, woodMaterial);
  shoeRack.position.set(-2.5, 0.15, -4);
  shoeRack.castShadow = true;
  shoeRack.receiveShadow = true;
  scene.add(shoeRack);
  addToCollision(shoeRack, collisionObjects, interiorRules);
  
  // Bed (kasur) - for resting interaction
  const bedGroup = new THREE.Group();
  bedGroup.userData.type = 'bed';
  bedGroup.userData.interactive = true;
  bedGroup.userData.interior = true;
  
  // Bed frame (mattress base)
  const bedFrameGeometry = new THREE.BoxGeometry(2.5, 0.3, 2);
  const bedFrameMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown wood
  const bedFrame = new THREE.Mesh(bedFrameGeometry, bedFrameMaterial);
  bedFrame.position.set(0, 0.15, 4); // Y = 0.15 (setengah tinggi 0.3), bottom at y = 0
  bedFrame.castShadow = true;
  bedFrame.receiveShadow = true;
  bedGroup.add(bedFrame);
  
  // Mattress
  const mattressGeometry = new THREE.BoxGeometry(2.3, 0.2, 1.9);
  const mattressMaterial = new THREE.MeshStandardMaterial({ color: 0xF5F5DC }); // Beige
  const mattress = new THREE.Mesh(mattressGeometry, mattressMaterial);
  mattress.position.set(0, 0.4, 4); // On top of bed frame
  mattress.castShadow = true;
  mattress.receiveShadow = true;
  bedGroup.add(mattress);
  
  // Pillow
  const pillowGeometry = new THREE.BoxGeometry(0.6, 0.15, 0.5);
  const pillowMaterial = new THREE.MeshStandardMaterial({ color: 0xFFF8DC }); // Cream
  const pillow = new THREE.Mesh(pillowGeometry, pillowMaterial);
  pillow.position.set(0, 0.575, 4.7); // On top of mattress, at head of bed
  pillow.castShadow = true;
  bedGroup.add(pillow);
  
  scene.add(bedGroup);
  
  // Add collision detection for bed (prevent player from walking through it)
  const bedCollisionBox = new THREE.BoxGeometry(2.5, 0.5, 2);
  const bedCollisionMesh = new THREE.Mesh(bedCollisionBox, new THREE.MeshBasicMaterial({ visible: false }));
  bedCollisionMesh.position.set(0, 0.25, 4);
  bedCollisionMesh.userData.isCollision = true;
  bedCollisionMesh.userData.type = 'bed'; // Mark as bed for collision detection
  scene.add(bedCollisionMesh);
  addToCollision(bedCollisionMesh, collisionObjects, interiorRules);

  // Add warm interior lighting
  setupInteriorLighting(scene, THREE);

  // Disable shadows on all objects for mobile performance
  if (isMobile) {
    scene.traverse((child: any) => {
      if (child instanceof THREE.Mesh || child instanceof THREE.Group) {
        child.castShadow = false;
        child.receiveShadow = false;
      }
    });
  }

  console.log('Interior objects added successfully. Total collision objects:', collisionObjects.length);

  return {
    tvSlideshow,
    cake,
    lilyBouquet,
    tvControlsUI,
    giftBoxes: giftBoxesGroup, // Return gift boxes group for interaction
    bed: bedGroup // Return bed group for interaction
  };
}

// Setup warm interior lighting with point lights
export function setupInteriorLighting(scene: any, THREE: any) {
  // Detect mobile for performance optimization
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                   (window.innerWidth <= 768);
  
  // Remove existing lights (keep only ambient from scene setup)
  const lightsToRemove: any[] = [];
  scene.traverse((child: any) => {
    if (child instanceof THREE.Light && child.type !== 'AmbientLight') {
      lightsToRemove.push(child);
    }
  });
  lightsToRemove.forEach(light => scene.remove(light));
  
  // Warm ambient light for interior - brighter on mobile to compensate for fewer lights
  const ambientLight = new THREE.AmbientLight(0xFFF8E1, isMobile ? 1.0 : 0.8); // Warm white
  scene.add(ambientLight);
  
  // On mobile, use fewer lights for better performance
  if (isMobile) {
    // Only essential lights on mobile
    const centerLight = new THREE.PointLight(0xFFE5B4, 1.5, 20); // Brighter, larger range
    centerLight.position.set(0, 3, 2);
    centerLight.castShadow = false; // No shadows on mobile
    scene.add(centerLight);
    
    const tvLight = new THREE.PointLight(0xFFE5B4, 1.2, 18);
    tvLight.position.set(0, 3, 20);
    tvLight.castShadow = false;
    scene.add(tvLight);
  } else {
    // Full lighting setup for desktop
    // Soft warm point lights to highlight floor reflections
    // Center light above coffee table
    const centerLight = new THREE.PointLight(0xFFE5B4, 1.2, 15); // Warm yellow
    centerLight.position.set(0, 3, 2);
    centerLight.castShadow = true;
    centerLight.shadow.mapSize.width = 1024;
    centerLight.shadow.mapSize.height = 1024;
    scene.add(centerLight);
    
    // Light above TV area (back wall)
    const tvLight = new THREE.PointLight(0xFFE5B4, 1.0, 12);
    tvLight.position.set(0, 3, 20);
    tvLight.castShadow = true;
    scene.add(tvLight);
    
    // Left side light
    const leftLight = new THREE.PointLight(0xFFE5B4, 0.8, 12);
    leftLight.position.set(-6, 3, 0);
    leftLight.castShadow = true;
    scene.add(leftLight);
    
    // Right side light
    const rightLight = new THREE.PointLight(0xFFE5B4, 0.8, 12);
    rightLight.position.set(6, 3, 0);
    rightLight.castShadow = true;
    scene.add(rightLight);
    
    // Light above dining area
    const diningLight = new THREE.PointLight(0xFFE5B4, 0.9, 12);
    diningLight.position.set(-8, 3, 8);
    diningLight.castShadow = true;
    scene.add(diningLight);
    
    // Light from window/doorway (natural light)
    const windowLight = new THREE.DirectionalLight(0xFFF8E1, 0.6);
    windowLight.position.set(-1, 2, -5); // From doorway
    windowLight.castShadow = true;
    windowLight.shadow.mapSize.width = 1024;
    windowLight.shadow.mapSize.height = 1024;
    scene.add(windowLight);
  }
}

