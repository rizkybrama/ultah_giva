// Camera controls helper

export interface CameraAngle {
  horizontal: number;
  vertical: number;
  distance: number;
}

export function updateCameraPosition(
  camera: any,
  player: any,
  isInside: boolean,
  cameraAngle: CameraAngle,
  THREE: any,
  initialCameraSet?: boolean
) {
  if (isInside) {
    // Inside house: camera can move freely like outside, but with room bounds
    // Room bounds sesuai ukuran rumah baru: 40 x 30 unit (x: -20 sampai 20, z: -6 sampai 24)
    const roomBounds = { 
      minX: -19.0, maxX: 19.0,  // Diperbesar dari -7/7 menjadi -19/19
      minZ: -5.5, maxZ: 23.5,   // Diperbesar dari -5.5/5.5 menjadi -5.5/23.5
      minY: 0.5, maxY: 5.5      // Y bounds lebih fleksibel
    };
    
    // Distance lebih fleksibel seperti di luar rumah
    const distance = Math.min(8, Math.max(2, cameraAngle.distance));
    
    // HILANGKAN BATASAN SUDUT HORIZONTAL - bebas seperti di luar rumah
    let horizontalAngle = cameraAngle.horizontal;
    // Tidak ada batasan horizontal, bisa rotate 360 derajat
    
    // Vertical angle lebih fleksibel
    const minVertical = -Math.PI / 3;  // Diperbesar dari -Math.PI / 12
    const maxVertical = Math.PI / 3;   // Diperbesar dari Math.PI / 8
    const verticalAngle = Math.max(minVertical, Math.min(maxVertical, cameraAngle.vertical));
    
    // Calculate camera position based on angle and distance
    const desiredX = player.position.x + Math.sin(horizontalAngle) * Math.cos(verticalAngle) * distance;
    const desiredY = player.position.y + Math.sin(verticalAngle) * distance + 1.5;
    const desiredZ = player.position.z + Math.cos(horizontalAngle) * Math.cos(verticalAngle) * distance;
    
    // Clamp to room bounds with safety margin
    const wallSafetyMargin = 0.5;
    let cameraX = Math.max(roomBounds.minX + wallSafetyMargin, Math.min(roomBounds.maxX - wallSafetyMargin, desiredX));
    let cameraY = Math.max(roomBounds.minY, Math.min(roomBounds.maxY, desiredY));
    let cameraZ = Math.max(roomBounds.minZ + wallSafetyMargin, Math.min(roomBounds.maxZ - wallSafetyMargin, desiredZ));
    
    camera.position.set(cameraX, cameraY, cameraZ);
    
    // LookAt mengikuti player position seperti di luar rumah, BUKAN dibatasi
    camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
  } else {
    // Outside: camera can orbit around player OR focus on door initially
    // Check if camera should maintain initial view (looking at door)
    // Door is at (-1, 1.5, -5.85)
    if (initialCameraSet) {
      const distance = cameraAngle.distance;
      const horizontalAngle = cameraAngle.horizontal;
      const verticalAngle = cameraAngle.vertical;
      
      // Check if camera is still in initial position (not moved by user)
      // Updated distance to 6.5 (zoomed out)
      const isInitialView = Math.abs(horizontalAngle) < 0.2 && 
                            Math.abs(distance - 6.5) < 2.0 && 
                            Math.abs(verticalAngle - Math.PI / 12) < 0.3;
      
      if (isInitialView) {
        // Keep camera looking at door (initial view) - DO NOT MOVE CAMERA
        // Camera position should stay in front of door (zoomed out)
        camera.position.set(-1, 3.5, -12);
        camera.lookAt(-1, 1.5, -5.85); // Look at door
        return; // Exit early, don't apply any other camera logic
      }
    }
    
    // User has moved camera or initial view disabled, use normal orbit around player
    const distance = cameraAngle.distance;
    const horizontalAngle = cameraAngle.horizontal;
    
    const minVertical = -Math.PI / 3;
    const maxVertical = Math.PI / 3;
    const verticalAngle = Math.max(minVertical, Math.min(maxVertical, cameraAngle.vertical));
    cameraAngle.vertical = verticalAngle;
    
    const cameraX = player.position.x + Math.sin(horizontalAngle) * Math.cos(verticalAngle) * distance;
    let cameraY = player.position.y + Math.sin(verticalAngle) * distance + 2;
    const cameraZ = player.position.z + Math.cos(horizontalAngle) * Math.cos(verticalAngle) * distance;
    
    // Check if player is in ocean area (bisa menyelam)
    const playerDistance = Math.sqrt(player.position.x * player.position.x + player.position.z * player.position.z);
    const isInOceanArea = playerDistance >= 100 && playerDistance <= 250;
    
    if (isInOceanArea) {
      // Di laut: camera bisa ikut menyelam (Y bisa negatif sampai -10)
      cameraY = Math.max(-10, cameraY); // Bisa lebih dalam dari player untuk melihat ikan
    } else {
      // Di area lain: camera tetap di atas tanah
      cameraY = Math.max(0.5, cameraY);
    }
    
    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(player.position.x, player.position.y + 1, player.position.z);
  }
  
  // Prevent camera from going through walls/objects (only if not in initial view)
  if (!isInside && !initialCameraSet) {
    const cameraToPlayer = new THREE.Vector3().subVectors(camera.position, player.position);
    const cameraDistance = cameraToPlayer.length();
    if (cameraDistance < 2) {
      const direction = cameraToPlayer.normalize();
      camera.position.copy(player.position.clone().add(direction.multiplyScalar(2)));
    }
  }
}

