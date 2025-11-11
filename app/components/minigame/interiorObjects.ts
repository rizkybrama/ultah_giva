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

export function addInteriorObjects(
  scene: any, 
  THREE: any, 
  collisionObjects: any[],
  selectedCoupons: Array<{ id: number; title: string; emoji: string }>
) {
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

  // Coffee table in front of sofa - Light brown wood, centered with legs
  const coffeeTableTopGeometry = new THREE.BoxGeometry(2.2, 0.1, 1.2);
  const coffeeTableTop = new THREE.Mesh(coffeeTableTopGeometry, woodMaterial);
  coffeeTableTop.position.set(0, 0.45, 2); // Top at y = 0.45 (legs height 0.4)
  coffeeTableTop.castShadow = true;
  coffeeTableTop.receiveShadow = true;
  scene.add(coffeeTableTop);
  addToCollision(coffeeTableTop, collisionObjects, interiorRules);
  
  // Coffee table legs
  const coffeeLegPositions = [
    [-1, 0.2, -0.5],
    [1, 0.2, -0.5],
    [-1, 0.2, 0.5],
    [1, 0.2, 0.5],
  ];
  coffeeLegPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(tableLegGeometry, woodMaterial);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    scene.add(leg);
    addToCollision(leg, collisionObjects, interiorRules);
  });

  // Birthday Cake on coffee table
  const cake = createRealisticCake(THREE, scene, { x: 0, y: 0.45, z: 2 });
  cake.cakeGroup.userData.interactive = true;
  cake.cakeGroup.userData.interior = true;
  
  // Add collision detection for cake (prevent player from walking through it)
  // Create a collision box around the cake (radius ~0.4, height ~0.5)
  const cakeCollisionBox = new THREE.BoxGeometry(0.8, 0.5, 0.8);
  const cakeCollisionMesh = new THREE.Mesh(cakeCollisionBox, new THREE.MeshBasicMaterial({ visible: false }));
  cakeCollisionMesh.position.set(0, 0.25, 2); // Center of cake
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
  // Placeholder media items (replace with actual URLs later)
  const mediaItems: MediaItem[] = [
    { type: 'image', url: 'url-photo1.jpg' },
    { type: 'image', url: 'url-photo2.jpg' },
    { type: 'video', url: 'url-video1.mp4' }
  ];
  
  const tvSlideshow = createTVSlideshow(
    THREE,
    scene,
    { x: 0, y: 1.3, z: 20.1 },
    { width: 2.2, height: 1.5 },
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
  
  // Bookshelf (left side, back) - Light brown wood, on floor
  const leftBookshelfGeometry = new THREE.BoxGeometry(1.5, 3, 0.5);
  const leftBookshelf = new THREE.Mesh(leftBookshelfGeometry, woodMaterial);
  leftBookshelf.position.set(-10, 1.5, 4); // Y = 1.5 (setengah tinggi 3), bottom at y = 0
  leftBookshelf.castShadow = true;
  leftBookshelf.receiveShadow = true;
  scene.add(leftBookshelf);
  addToCollision(leftBookshelf, collisionObjects, interiorRules);
  
  // Cabinet/Wardrobe (right side, middle) - on floor
  const cabinetGeometry = new THREE.BoxGeometry(2, 2.5, 1);
  const cabinet = new THREE.Mesh(cabinetGeometry, woodMaterial);
  cabinet.position.set(10, 1.25, 0); // Y = 1.25 (setengah tinggi 2.5), bottom at y = 0
  cabinet.castShadow = true;
  cabinet.receiveShadow = true;
  scene.add(cabinet);
  addToCollision(cabinet, collisionObjects, interiorRules);
  
  // Small side table (center-right, middle) with legs
  const sideTableTopGeometry = new THREE.BoxGeometry(1, 0.1, 1);
  const sideTableTop = new THREE.Mesh(sideTableTopGeometry, woodMaterial);
  sideTableTop.position.set(3, 0.55, 8); // Top at y = 0.55 (legs height 0.5)
  sideTableTop.castShadow = true;
  sideTableTop.receiveShadow = true;
  scene.add(sideTableTop);
  addToCollision(sideTableTop, collisionObjects, interiorRules);
  
  // Side table legs
  const sideLegPositions = [
    [2.5, 0.25, 7.5],
    [3.5, 0.25, 7.5],
    [2.5, 0.25, 8.5],
    [3.5, 0.25, 8.5],
  ];
  sideLegPositions.forEach(([x, y, z]) => {
    const leg = new THREE.Mesh(tableLegGeometry, woodMaterial);
    leg.position.set(x, y, z);
    leg.castShadow = true;
    scene.add(leg);
    addToCollision(leg, collisionObjects, interiorRules);
  });
  
  // Plant pot on side table
  const potGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.4, 16);
  const potMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 }); // Brown pot
  const pot = new THREE.Mesh(potGeometry, potMaterial);
  pot.position.set(3, 0.75, 8); // On side table (table top at 0.55, pot center at 0.75)
  pot.castShadow = true;
  scene.add(pot);
  
  // Plant leaves
  const plantGeometry = new THREE.ConeGeometry(0.3, 0.6, 8);
  const plantMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 }); // Green
  const plant = new THREE.Mesh(plantGeometry, plantMaterial);
  plant.position.set(3, 1.15, 8); // On top of pot
  plant.castShadow = true;
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
  
  // Wall decorations - More paintings
  const paintingGeometry = new THREE.BoxGeometry(1.2, 0.8, 0.1);
  const paintingMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }); // White frames
  
  // Paintings on side walls
  const painting1 = new THREE.Mesh(paintingGeometry, paintingMaterial);
  painting1.position.set(-10, 2, 8);
  painting1.castShadow = true;
  scene.add(painting1);
  
  const painting2 = new THREE.Mesh(paintingGeometry, paintingMaterial);
  painting2.position.set(10, 2, 8);
  painting2.castShadow = true;
  scene.add(painting2);
  
  const painting3 = new THREE.Mesh(paintingGeometry, paintingMaterial);
  painting3.position.set(-10, 2, 12);
  painting3.castShadow = true;
  scene.add(painting3);
  
  const painting4 = new THREE.Mesh(paintingGeometry, paintingMaterial);
  painting4.position.set(10, 2, 12);
  painting4.castShadow = true;
  scene.add(painting4);
  
  // Floor lamp (near sofa) - on floor
  const lampBaseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
  const lampBaseMaterial = new THREE.MeshStandardMaterial({ color: 0x2C2C2C }); // Dark grey
  const lampBase = new THREE.Mesh(lampBaseGeometry, lampBaseMaterial);
  lampBase.position.set(-3, 0.75, 4); // Y = 0.75 (setengah tinggi 1.5), bottom at y = 0
  lampBase.castShadow = true;
  scene.add(lampBase);
  
  const lampShadeGeometry = new THREE.ConeGeometry(0.4, 0.5, 8);
  const lampShadeMaterial = new THREE.MeshStandardMaterial({ color: 0xFFFFFF }); // White shade
  const lampShade = new THREE.Mesh(lampShadeGeometry, lampShadeMaterial);
  lampShade.position.set(-3, 2.0, 4); // On top of lamp base (base top at 1.5, shade center at 2.0)
  lampShade.castShadow = true;
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
  
  // Create 3-4 gift boxes in a row on coffee table
  const boxCount = 4;
  const boxSize = 0.3;
  const boxSpacing = 0.35;
  const startX = -(boxCount - 1) * boxSpacing / 2;
  
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
  
  // Position gift boxes group on coffee table
  giftBoxesGroup.position.set(0, 0.85, 2); // On coffee table (table top at 0.45, gift center at 0.85)
  scene.add(giftBoxesGroup);
  
  // Add collision detection for gift boxes
  const giftCollisionBox = new THREE.BoxGeometry(boxCount * boxSpacing, boxSize, boxSize);
  const giftCollisionMesh = new THREE.Mesh(giftCollisionBox, new THREE.MeshBasicMaterial({ visible: false }));
  giftCollisionMesh.position.set(0, 0.85, 2);
  giftCollisionMesh.userData.isCollision = true;
  scene.add(giftCollisionMesh);
  addToCollision(giftCollisionMesh, collisionObjects, interiorRules);

  // Doormat near entrance
  const doormatGeometry = new THREE.PlaneGeometry(1.5, 0.8);
  const doormatMaterial = new THREE.MeshStandardMaterial({
    color: 0x8B4513, // Brown doormat
    roughness: 0.9
  });
  const doormat = new THREE.Mesh(doormatGeometry, doormatMaterial);
  doormat.rotation.x = -Math.PI / 2;
  doormat.position.set(-1, 0.01, -4); // Near door entrance
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
  scene.add(bedCollisionMesh);
  addToCollision(bedCollisionMesh, collisionObjects, interiorRules);

  // Add warm interior lighting
  setupInteriorLighting(scene, THREE);

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
  // Remove existing lights (keep only ambient from scene setup)
  const lightsToRemove: any[] = [];
  scene.traverse((child: any) => {
    if (child instanceof THREE.Light && child.type !== 'AmbientLight') {
      lightsToRemove.push(child);
    }
  });
  lightsToRemove.forEach(light => scene.remove(light));
  
  // Warm ambient light for interior
  const ambientLight = new THREE.AmbientLight(0xFFF8E1, 0.8); // Warm white
  scene.add(ambientLight);
  
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

