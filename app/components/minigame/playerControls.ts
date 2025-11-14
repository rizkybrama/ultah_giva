// Player movement and controls helper

export interface PlayerControls {
  checkCollision: (newPos: { x: number; y: number; z: number }, radius?: number) => boolean;
  movePlayer: (player: any, cameraAngle: number, keys: { [key: string]: boolean }, analogStick: { x: number; y: number; active: boolean }, speed?: number) => { moved: boolean; direction: number; movementAngle?: number };
}

export function createPlayerControls(
  THREE: any,
  collisionObjects: any[]
): PlayerControls {
  const checkCollision = (newPos: { x: number; y: number; z: number }, radius: number = 0.35): boolean => {
    // Kurangi radius dari 0.6 menjadi 0.35 agar lebih toleran, tidak terlalu ketat
    // Player box height disesuaikan dengan posisi Y (bisa di dalam laut)
    const playerBox = new THREE.Box3(
      new THREE.Vector3(newPos.x - radius, newPos.y, newPos.z - radius),
      new THREE.Vector3(newPos.x + radius, newPos.y + 1, newPos.z + radius)
    );
    
    for (const obj of collisionObjects) {
      if (obj && obj.geometry && obj.position) {
        // Skip water objects (bisa ditembus)
        if (obj.userData && (obj.userData.type === 'water' || obj.userData.passable)) {
          continue;
        }
        
        // Cek apakah objek adalah tembok
        const isWall = obj.userData && obj.userData.type === 'wall';
        
        // Cek apakah objek adalah gunung
        const isMountain = obj.userData && obj.userData.type === 'mountain';
        
        // Cek apakah objek adalah meja
        const isTable = obj.userData && obj.userData.type === 'table';
        
        // Cek apakah objek adalah kasur
        const isBed = obj.userData && obj.userData.type === 'bed';
        
        // Tambahkan margin yang lebih besar untuk lebih toleran
        const objBox = new THREE.Box3().setFromObject(obj);
        
        if (isWall) {
          // Untuk tembok: TIDAK BISA DITEMBUS SAMA SEKALI
          // Jangan kurangi margin, atau kurangi sedikit saja untuk toleransi minimal
          objBox.expandByScalar(-0.1); // Hanya kurangi 0.1 unit untuk toleransi minimal, tetap solid
        } else if (isTable) {
          // Untuk meja: TIDAK BISA DITEMBUS, sama seperti tembok
          // Kurangi margin sedikit saja untuk toleransi minimal, tetap solid
          objBox.expandByScalar(-0.1); // Hanya kurangi 0.1 unit untuk toleransi minimal, tetap solid
        } else if (isBed) {
          // Untuk kasur: TIDAK BISA DITEMBUS, sama seperti tembok dan meja
          // Kurangi margin sedikit saja untuk toleransi minimal, tetap solid
          objBox.expandByScalar(-0.1); // Hanya kurangi 0.1 unit untuk toleransi minimal, tetap solid
        } else if (isMountain) {
          // Untuk gunung: bisa sangat dekat tapi TIDAK BISA MENEMBUS
          // Kurangi margin lebih banyak agar bisa sangat dekat
          objBox.expandByScalar(-1.2); // Kurangi 1.2 unit untuk gunung - bisa sangat dekat, hampir menempel
        } else {
          // Untuk objek lain: kurangi margin normal
          objBox.expandByScalar(-0.4); // Kurangi 0.4 unit dari semua sisi agar collision lebih toleran
        }
        
        if (playerBox.intersectsBox(objBox)) {
          return true; // Collision detected
        }
      }
    }
    return false;
  };

  const movePlayer = (
    player: any,
    cameraAngle: number,
    keys: { [key: string]: boolean },
    analogStick: { x: number; y: number; active: boolean },
    speed: number = 0.1
  ): { moved: boolean; direction: number; movementAngle?: number } => {
    let moved = false;
    let direction = 0; // 0 = forward, 1 = right, 2 = back, 3 = left
    let movementAngle: number | undefined = undefined; // Sudut pergerakan aktual untuk rotasi karakter
    
    // Check if player is in ocean area (bisa menyelam)
    const playerDistance = Math.sqrt(player.position.x * player.position.x + player.position.z * player.position.z);
    const isInOceanArea = playerDistance >= 100 && playerDistance <= 250;
    
    // Check analog stick first (mobile)
    if (analogStick.active && (Math.abs(analogStick.x) > 0.01 || Math.abs(analogStick.y) > 0.01)) {
      // PERBAIKAN: analogStick.y negatif = tarik ke atas = maju (seperti W)
      // Keyboard: moveForward negatif = maju
      // Jadi: moveForward = analogStick.y * speed (tanpa minus, karena y sudah negatif untuk maju)
      const moveForward = analogStick.y * speed * 2;
      const moveRight = analogStick.x * speed * 2;
      
      const moveX = Math.sin(cameraAngle) * moveForward + Math.cos(cameraAngle) * moveRight;
      const moveZ = Math.cos(cameraAngle) * moveForward - Math.sin(cameraAngle) * moveRight;
      
      // Untuk mobile: pastikan Y tetap stabil di ground level jika tidak di laut
      let newY = player.position.y;
      if (!isInOceanArea) {
        newY = 0.5; // Ground level
      }
      
      const newPos = {
        x: player.position.x + moveX,
        y: newY,
        z: player.position.z + moveZ
      };
      
      if (!checkCollision(newPos)) {
        player.position.x = newPos.x;
        player.position.z = newPos.z;
        player.position.y = newPos.y; // Update Y dengan value yang stabil
        moved = true;
        
        // PERBAIKAN: Perhitungan sudut harus konsisten dengan moveForward
        // moveForward = analogStick.y, jadi angle = atan2(moveRight, moveForward) = atan2(analogStick.x, analogStick.y)
        const stickAngle = Math.atan2(analogStick.x, analogStick.y) + cameraAngle;
        movementAngle = stickAngle; // Sudut pergerakan aktual untuk semua 8 arah
        direction = Math.round((stickAngle / (Math.PI / 2)) + 4) % 4;
      }
    } else {
      // Use keyboard controls (desktop)
      let moveForward = 0;
      let moveRight = 0;
      let moveUp = 0;
      
      if (keys['w'] || keys['ArrowUp']) {
        moveForward -= speed;
        moved = true;
      }
      if (keys['s'] || keys['ArrowDown']) {
        moveForward += speed;
        moved = true;
      }
      if (keys['a'] || keys['ArrowLeft']) {
        moveRight -= speed;
        moved = true;
      }
      if (keys['d'] || keys['ArrowRight']) {
        moveRight += speed;
        moved = true;
      }
      
      // Vertical movement (naik/turun) - HANYA di area laut
      if (isInOceanArea) {
        if (keys[' '] || keys['Space']) { // Space untuk naik
          moveUp += speed;
          moved = true;
        }
        if (keys['Shift'] || keys['shift']) { // Shift untuk turun
          moveUp -= speed;
          moved = true;
        }
      }
      
      if (moved) {
        const moveX = Math.sin(cameraAngle) * moveForward + Math.cos(cameraAngle) * moveRight;
        const moveZ = Math.cos(cameraAngle) * moveForward - Math.sin(cameraAngle) * moveRight;
        
        // Hanya update Y jika di laut atau ada input vertikal
        let newY = player.position.y;
        if (isInOceanArea && moveUp !== 0) {
          newY = player.position.y + moveUp;
        } else if (!isInOceanArea) {
          // Pastikan Y tetap di ground level jika tidak di laut
          newY = 0.5;
        }
        
        const newPos = {
          x: player.position.x + moveX,
          y: newY,
          z: player.position.z + moveZ
        };
        
        if (!checkCollision(newPos)) {
          player.position.x = newPos.x;
          player.position.z = newPos.z;
          player.position.y = newPos.y; // Update Y position hanya jika valid
          
          if (moveForward !== 0 || moveRight !== 0) {
            // PERBAIKAN: Gunakan perhitungan yang sama seperti analog stick
            // moveForward negatif = maju (seperti analogStick.y negatif)
            // moveRight positif = kanan (seperti analogStick.x positif)
            // Jadi: Math.atan2(moveRight, moveForward) sama seperti Math.atan2(analogStick.x, analogStick.y)
            const moveAngle = Math.atan2(moveRight, moveForward) + cameraAngle;
            movementAngle = moveAngle; // Sudut pergerakan aktual untuk semua 8 arah
            direction = Math.round((moveAngle / (Math.PI / 2)) + 4) % 4;
          }
        } else {
          moved = false;
        }
      }
    }
    
    // Enforce Y bounds based on location - HANYA update jika perlu
    if (isInOceanArea) {
      // Di laut: bisa menyelam sampai kedalaman -8, bisa naik sampai permukaan (0)
      if (player.position.y < -8) {
        player.position.y = -8;
      } else if (player.position.y > 0) {
        player.position.y = 0; // Tidak bisa naik di atas permukaan air
      }
    } else {
      // Di area lain: tetap di atas tanah (0.5) - HANYA update jika player Y tidak sesuai
      // Jangan update terus-menerus untuk menghindari glitch
      if (Math.abs(player.position.y - 0.5) > 0.1) {
        player.position.y = 0.5;
      }

    }
    
    return { moved, direction, movementAngle };
  };

  return { checkCollision, movePlayer };
}


