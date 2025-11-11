// Input handlers for mouse, keyboard, touch

export function setupInputHandlers(
  canvas: HTMLCanvasElement,
  cameraAngleRef: { current: { horizontal: number; vertical: number; distance: number } },
  isDraggingRef: { current: boolean },
  lastMouseRef: { current: { x: number; y: number } },
  raycaster: any,
  camera: any,
  player: any,
  doorRef: { current: any },
  houseGroupRef: { current: any },
  isInside: boolean,
  scene: any,
  handleInteriorInteraction: (type: string) => void,
  analogStickRef: { current: HTMLDivElement | null }
) {
  // Mouse drag handler for camera rotation
  const handleMouseDown = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target === canvas || target.closest('canvas')) {
      if (event.button === 0) {
        event.preventDefault();
        isDraggingRef.current = true;
        lastMouseRef.current.x = event.clientX;
        lastMouseRef.current.y = event.clientY;
      }
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    const deltaX = Math.abs(event.clientX - lastMouseRef.current.x);
    const deltaY = Math.abs(event.clientY - lastMouseRef.current.y);
    
    if (deltaX > 3 || deltaY > 3) {
      isDraggingRef.current = true;
    }
    
    if (isDraggingRef.current) {
      const moveDeltaX = event.clientX - lastMouseRef.current.x;
      const moveDeltaY = event.clientY - lastMouseRef.current.y;
      
      cameraAngleRef.current.horizontal -= moveDeltaX * 0.01;
      cameraAngleRef.current.vertical = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, cameraAngleRef.current.vertical - moveDeltaY * 0.01)
      );
      
      lastMouseRef.current.x = event.clientX;
      lastMouseRef.current.y = event.clientY;
    }
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleWheel = (event: WheelEvent) => {
    event.preventDefault();
    cameraAngleRef.current.distance = Math.max(
      5,
      Math.min(20, cameraAngleRef.current.distance + event.deltaY * 0.01)
    );
  };

  // Touch handlers for mobile
  const handleTouchStart = (event: TouchEvent) => {
    const target = event.target as HTMLElement;
    if (target === canvas || target.closest('canvas')) {
      if (event.touches.length === 1) {
        const touch = event.touches[0];
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const touchX = touch.clientX - rect.left;
          const touchY = touch.clientY - rect.top;
          const analogStickArea = {
            left: 0,
            right: window.innerWidth * 0.3,
            top: window.innerHeight * 0.7,
            bottom: window.innerHeight
          };
          
          if (!(touchX < analogStickArea.right && touchY > analogStickArea.top)) {
            event.preventDefault();
            isDraggingRef.current = true;
            lastMouseRef.current.x = touch.clientX;
            lastMouseRef.current.y = touch.clientY;
          }
        }
      }
    }
  };

  const handleTouchMove = (event: TouchEvent) => {
    if (isDraggingRef.current && event.touches.length === 1) {
      const deltaX = event.touches[0].clientX - lastMouseRef.current.x;
      const deltaY = event.touches[0].clientY - lastMouseRef.current.y;
      
      cameraAngleRef.current.horizontal -= deltaX * 0.01;
      cameraAngleRef.current.vertical = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, cameraAngleRef.current.vertical - deltaY * 0.01)
      );
      
      lastMouseRef.current.x = event.touches[0].clientX;
      lastMouseRef.current.y = event.touches[0].clientY;
    }
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Interaction handler
  const handleInteraction = (clientX: number, clientY: number, isTouch: boolean = false) => {
    if (!raycaster || !camera || !player) return;

    const target = document.elementFromPoint(clientX, clientY) as HTMLElement;
    if (target && target.closest && target.closest('.pointer-events-auto') && !target.closest('canvas')) {
      return;
    }

    const mouseX = (clientX / window.innerWidth) * 2 - 1;
    const mouseY = -(clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera({ x: mouseX, y: mouseY }, camera);

    // Check interior object clicks
    if (isInside && scene) {
      const interactableObjects: any[] = [];
      scene.traverse((child: any) => {
        if (child.userData && child.userData.interactive && child.userData.interior) {
          interactableObjects.push(child);
        }
      });

      const intersects = raycaster.intersectObjects(interactableObjects);
      if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const distance = player.position.distanceTo(clickedObject.position);
        if (distance < 3) {
          handleInteriorInteraction(clickedObject.userData.type);
        }
      }
    }
  };

  // Mouse click handler
  const handleClick = (event: MouseEvent) => {
    // Check if dialog is active - if so, don't handle click here
    if ((window as any).dialogSystemRef && (window as any).dialogSystemRef.isActive()) {
      return; // Let dialog handle the click
    }
    const dragThreshold = 5;
    if (isDraggingRef.current) {
      const dragDistance = Math.sqrt(
        Math.pow(event.clientX - lastMouseRef.current.x, 2) + 
        Math.pow(event.clientY - lastMouseRef.current.y, 2)
      );
      if (dragDistance > dragThreshold) {
        isDraggingRef.current = false;
        return;
      }
    }
    handleInteraction(event.clientX, event.clientY, false);
  };

  // Touch handler for mobile interactions
  const handleTouchInteraction = (event: TouchEvent) => {
    if (isDraggingRef.current) {
      return;
    }

    if (event.changedTouches && event.changedTouches.length === 1) {
      const touch = event.changedTouches[0];
      if (!touch) return;
      
      const analogStickArea = analogStickRef.current;
      if (analogStickArea) {
        const rect = analogStickArea.getBoundingClientRect();
        if (
          touch.clientX >= rect.left &&
          touch.clientX <= rect.right &&
          touch.clientY >= rect.top &&
          touch.clientY <= rect.bottom
        ) {
          return;
        }
      }
      
      handleInteraction(touch.clientX, touch.clientY, true);
    }
  };

  // Attach event listeners
  canvas.addEventListener('mousedown', handleMouseDown);
  canvas.addEventListener('mousemove', handleMouseMove);
  canvas.addEventListener('mouseup', handleMouseUp);
  canvas.addEventListener('wheel', handleWheel, { passive: false });
  canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
  canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
  canvas.addEventListener('touchend', handleTouchEnd);
  window.addEventListener('click', handleClick);
  window.addEventListener('touchend', handleTouchInteraction);

  // Return cleanup function
  return () => {
    canvas.removeEventListener('mousedown', handleMouseDown);
    canvas.removeEventListener('mousemove', handleMouseMove);
    canvas.removeEventListener('mouseup', handleMouseUp);
    canvas.removeEventListener('wheel', handleWheel);
    canvas.removeEventListener('touchstart', handleTouchStart);
    canvas.removeEventListener('touchmove', handleTouchMove);
    canvas.removeEventListener('touchend', handleTouchEnd);
    window.removeEventListener('click', handleClick);
    window.removeEventListener('touchend', handleTouchInteraction);
  };
}

