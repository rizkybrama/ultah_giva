// Lily bouquet with meaning tooltip

export function createLilyBouquet(
  THREE: any,
  scene: any,
  position: { x: number; y: number; z: number }
): {
  bouquetGroup: any;
  showMeaning: (onClose?: () => void) => void;
  hideMeaning: () => void;
} {
  const bouquetGroup = new THREE.Group();

  // Vase
  const vaseGeometry = new THREE.CylinderGeometry(0.12, 0.1, 0.3, 16);
  const vaseMaterial = new THREE.MeshStandardMaterial({
    color: 0xFFFFFF, // White ceramic vase
    roughness: 0.2,
    metalness: 0.1
  });
  const vase = new THREE.Mesh(vaseGeometry, vaseMaterial);
  // Vase height is 0.3, center is at 0.15 from bottom
  // Group is positioned at table top (y: 0.55), so vase center relative to group should be 0.15
  // This places vase bottom at table top (0.55) and center at 0.7 in world space
  vase.position.set(0, 0.15, 0);
  vase.castShadow = true;
  vase.receiveShadow = true;
  bouquetGroup.add(vase);

  // Lily flowers (3-4 flowers)
  const lilyCount = 4;
  const lilyPositions = [
    { x: -0.03, angle: -0.3 },
    { x: 0.03, angle: 0.3 },
    { x: 0, angle: 0 },
    { x: -0.02, angle: -0.15 },
  ];

  lilyPositions.forEach((pos, index) => {
    if (index >= lilyCount) return;

    // Stem
    const stemGeometry = new THREE.CylinderGeometry(0.005, 0.005, 0.4, 8);
    const stemMaterial = new THREE.MeshStandardMaterial({
      color: 0x228B22 // Green stem
    });
    const stem = new THREE.Mesh(stemGeometry, stemMaterial);
    stem.position.set(pos.x, 0.5, 0);
    stem.rotation.z = pos.angle;
    bouquetGroup.add(stem);

    // Petals (6 petals per flower, white)
    const petalGeometry = new THREE.SphereGeometry(0.04, 8, 8);
    petalGeometry.scale(1, 0.3, 1); // Flatten to petal shape
    const petalMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF, // White petals
      roughness: 0.4,
      transparent: true,
      opacity: 0.95
    });

    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const petal = new THREE.Mesh(petalGeometry, petalMaterial);
      
      // Position petals in a circle
      const radius = 0.05;
      petal.position.set(
        pos.x + Math.cos(angle) * radius,
        0.7 + Math.sin(angle) * radius * 0.3,
        Math.sin(angle) * radius
      );
      
      // Rotate to face outward
      petal.rotation.y = angle;
      petal.rotation.x = Math.PI / 2;
      
      bouquetGroup.add(petal);
    }

    // Center (stamen) - yellow/orange
    const centerGeometry = new THREE.SphereGeometry(0.015, 8, 8);
    const centerMaterial = new THREE.MeshStandardMaterial({
      color: 0xFFD700 // Gold/yellow center
    });
    const center = new THREE.Mesh(centerGeometry, centerMaterial);
    center.position.set(pos.x, 0.7, 0);
    bouquetGroup.add(center);
  });

  // Leaves (2-3 leaves)
  const leafGeometry = new THREE.PlaneGeometry(0.08, 0.15);
  const leafMaterial = new THREE.MeshStandardMaterial({
    color: 0x228B22,
    side: THREE.DoubleSide
  });

  for (let i = 0; i < 3; i++) {
    const leaf = new THREE.Mesh(leafGeometry, leafMaterial);
    const angle = (i / 3) * Math.PI * 2;
    leaf.position.set(
      Math.cos(angle) * 0.05,
      0.35 + Math.sin(angle) * 0.1,
      Math.sin(angle) * 0.05
    );
    leaf.rotation.y = angle;
    leaf.rotation.z = Math.PI / 4;
    bouquetGroup.add(leaf);
  }

  // Position bouquet
  bouquetGroup.position.set(position.x, position.y, position.z);
  bouquetGroup.userData.type = 'lily';
  bouquetGroup.userData.interactive = true;
  bouquetGroup.userData.interior = true;

  scene.add(bouquetGroup);

  // Meaning tooltip
  let tooltipElement: HTMLDivElement | null = null;
  let onCloseCallback: (() => void) | null = null;

  const showMeaning = (onClose?: () => void) => {
    if (tooltipElement) return; // Already showing
    
    onCloseCallback = onClose || null;

    tooltipElement = document.createElement('div');
    tooltipElement.setAttribute('data-lily-overlay', 'true');
    tooltipElement.style.position = 'fixed';
    tooltipElement.style.top = '50%';
    tooltipElement.style.left = '50%';
    tooltipElement.style.transform = 'translate(-50%, -50%)';
    tooltipElement.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    tooltipElement.style.border = '2px solid #8B7355';
    tooltipElement.style.borderRadius = '10px';
    tooltipElement.style.padding = '20px';
    tooltipElement.style.fontFamily = 'Arial, sans-serif';
    tooltipElement.style.fontSize = '16px';
    tooltipElement.style.color = '#333';
    tooltipElement.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    tooltipElement.style.zIndex = '3000'; // Higher z-index than dialog (which is 1000)
    tooltipElement.style.maxWidth = '400px';
    tooltipElement.style.width = '90%';
    tooltipElement.style.minWidth = '280px'; // Minimum width to prevent too small
    tooltipElement.style.textAlign = 'center';
    tooltipElement.style.display = 'flex';
    tooltipElement.style.flexDirection = 'column';
    tooltipElement.style.alignItems = 'center';
    tooltipElement.style.justifyContent = 'center';
    tooltipElement.style.boxSizing = 'border-box'; // Ensure padding is included in width
    tooltipElement.style.overflow = 'visible'; // Ensure content is not clipped
    tooltipElement.style.pointerEvents = 'auto'; // Make sure it's clickable
    
    // Hide joystick/controls when overlay is active
    const joystickElements = document.querySelectorAll('[data-joystick], .analog-stick-container, [class*="joystick"]');
    joystickElements.forEach((el: any) => {
      if (el) {
        el.style.display = 'none';
        el.setAttribute('data-hidden-by-overlay', 'true');
      }
    });
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.width = '30px';
    closeButton.style.height = '30px';
    closeButton.style.borderRadius = '50%';
    closeButton.style.border = 'none';
    closeButton.style.backgroundColor = '#ff4444';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '18px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    closeButton.style.transition = 'background-color 0.2s';
    closeButton.onmouseover = () => { closeButton.style.backgroundColor = '#cc0000'; };
    closeButton.onmouseout = () => { closeButton.style.backgroundColor = '#ff4444'; };
    closeButton.onclick = () => {
      hideMeaning();
    };
    
    // Create lily flower icon/image
    const lilyIcon = document.createElement('img');
    lilyIcon.src = '/images/lily.jpeg';
    lilyIcon.alt = 'Lily Flower';
    // lilyIcon.style.width = '80px';
    // lilyIcon.style.height = '80px';
    lilyIcon.style.margin = '0 auto 15px auto';
    lilyIcon.style.display = 'block';
    lilyIcon.style.objectFit = 'cover';
    lilyIcon.style.borderRadius = '8px';
    lilyIcon.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
    
    tooltipElement.innerHTML = `
      <div style="font-weight: bold; font-size: 18px; color: #8B7355; margin-bottom: 10px;">
        Lily (Lilium)
      </div>
      <div style="margin-bottom: 10px;">
        Symbolizes purity, sincerity, devotion, and beautiful hope.
      </div>
    `;
    
    // Insert lily icon before the title
    const titleDiv = tooltipElement.querySelector('div');
    if (titleDiv) {
      tooltipElement.insertBefore(lilyIcon, titleDiv);
    } else {
      tooltipElement.insertBefore(lilyIcon, tooltipElement.firstChild);
    }
    
    tooltipElement.appendChild(closeButton);
    document.body.appendChild(tooltipElement);
  };

  const hideMeaning = () => {
    if (tooltipElement) {
      document.body.removeChild(tooltipElement);
      tooltipElement = null;
      
      // Show joystick/controls again
      const joystickElements = document.querySelectorAll('[data-hidden-by-overlay="true"]');
      joystickElements.forEach((el: any) => {
        if (el) {
          el.style.display = '';
          el.removeAttribute('data-hidden-by-overlay');
        }
      });
      
      // Call callback if in story mode
      if (onCloseCallback) {
        onCloseCallback();
        onCloseCallback = null;
      }
    }
  };

  bouquetGroup.userData.showMeaning = showMeaning;
  bouquetGroup.userData.hideMeaning = hideMeaning;

  return { bouquetGroup, showMeaning, hideMeaning };
}



