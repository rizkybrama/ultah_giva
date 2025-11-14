// Interaction system - E/Space/Click with contextual prompts

export interface InteractiveObject {
  object: any;
  type: 'door' | 'tv' | 'cake' | 'lily' | 'sofa' | 'bookshelf' | 'gift' | 'letter' | 'chair' | 'bed';
  position: { x: number; y: number; z: number };
  interactionRange: number;
  onInteract?: () => void;
}

export class InteractionSystem {
  private interactiveObjects: InteractiveObject[] = [];
  private raycaster: any;
  private camera: any;
  private scene: any;
  private player: any;
  private onShowPrompt?: (object: InteractiveObject | null) => void;
  private currentNearbyObject: InteractiveObject | null = null;
  private interactionKeys: Set<string> = new Set();

  constructor(
    raycaster: any,
    camera: any,
    scene: any,
    player: any,
    onShowPrompt?: (object: InteractiveObject | null) => void
  ) {
    this.raycaster = raycaster;
    this.camera = camera;
    this.scene = scene;
    this.player = player;
    this.onShowPrompt = onShowPrompt;
  }

  // Register interactive object
  registerObject(object: InteractiveObject) {
    this.interactiveObjects.push(object);
  }

  // Update - check for nearby objects and show prompts
  update() {
    if (!this.player || !this.camera) return;

    // Check if in cutscene mode - if yes, don't show interaction prompts
    const isCutsceneMode = (window as any).storyFlowRef && (window as any).storyFlowRef.isInCutsceneMode();
    // Check if interaction is currently active (e.g., TV slideshow, letter modal, etc.)
    const isInteractionActive = (window as any).isInteractionActive || false;
    
    if (isCutsceneMode || isInteractionActive) {
      // Hide prompt if currently showing
      if (this.currentNearbyObject && this.onShowPrompt) {
        this.onShowPrompt(null);
        this.currentNearbyObject = null;
      }
      return; // Don't process interactions during cutscene or when interaction is active
    }

    const playerPos = this.player.position;
    let nearestObject: InteractiveObject | null = null;
    let nearestDistance = Infinity;

    // Find nearest interactive object
    this.interactiveObjects.forEach(obj => {
      const distance = playerPos.distanceTo(
        new (window as any).THREE.Vector3(obj.position.x, obj.position.y, obj.position.z)
      );
      
      if (distance < obj.interactionRange && distance < nearestDistance) {
        nearestDistance = distance;
        nearestObject = obj;
      }
    });

    // Update prompt if object changed
    if (nearestObject !== this.currentNearbyObject) {
      this.currentNearbyObject = nearestObject;
      if (this.onShowPrompt) {
        this.onShowPrompt(nearestObject);
      }
    }
  }

  // Check if interaction key is pressed
  checkInteraction(key: string): boolean {
    if (this.interactionKeys.has(key)) {
      this.interactionKeys.delete(key);
      return true;
    }
    return false;
  }

  // Handle interaction key press
  onKeyDown(key: string) {
    // Don't allow manual interactions during cutscene mode
    const isCutsceneMode = (window as any).storyFlowRef && (window as any).storyFlowRef.isInCutsceneMode();
    if (isCutsceneMode) {
      return false; // Disable manual interactions during cutscene
    }

    if (key === 'e' || key === 'E' || key === ' ' || key === 'Enter') {
      this.interactionKeys.add(key.toLowerCase());
      
      if (this.currentNearbyObject && this.currentNearbyObject.onInteract) {
        this.currentNearbyObject.onInteract();
        return true;
      }
    }
    return false;
  }

  // Handle click interaction
  onClick(event: MouseEvent, canvas: HTMLCanvasElement): boolean {
    // Don't allow manual interactions during cutscene mode
    const isCutsceneMode = (window as any).storyFlowRef && (window as any).storyFlowRef.isInCutsceneMode();
    if (isCutsceneMode) {
      return false; // Disable manual interactions during cutscene
    }

    if (!this.currentNearbyObject) return false;

    // Check if click is on canvas
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x >= 0 && x <= rect.width && y >= 0 && y <= rect.height) {
      if (this.currentNearbyObject.onInteract) {
        this.currentNearbyObject.onInteract();
        return true;
      }
    }
    return false;
  }

  // Get current nearby object
  getCurrentObject(): InteractiveObject | null {
    return this.currentNearbyObject;
  }
}

// Detect if device is mobile/touch
function isMobileDevice(): boolean {
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0 || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// Create interaction prompt UI
export function createInteractionPrompt(): {
  container: HTMLDivElement;
  button: HTMLButtonElement | null;
  show: (object: InteractiveObject | null) => void;
  hide: () => void;
} {
  const isMobile = isMobileDevice();
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '100px';
  container.style.left = '50%';
  container.style.transform = 'translateX(-50%)';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  container.style.color = '#FFFFFF';
  container.style.padding = '12px 24px';
  container.style.borderRadius = '25px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.fontSize = '16px';
  container.style.fontWeight = 'bold';
  container.style.display = 'none';
  container.style.zIndex = '1001';
  container.style.pointerEvents = 'none';
  container.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
  document.body.appendChild(container);

  // Create virtual button for mobile
  let button: HTMLButtonElement | null = null;
  if (isMobile) {
    button = document.createElement('button');
    button.style.position = 'fixed';
    button.style.bottom = '100px';
    button.style.left = '50%';
    button.style.transform = 'translateX(-50%)';
    button.style.backgroundColor = '#4A90E2';
    button.style.color = '#FFFFFF';
    button.style.padding = '14px 32px';
    button.style.borderRadius = '25px';
    button.style.fontFamily = 'Arial, sans-serif';
    button.style.fontSize = '18px';
    button.style.fontWeight = 'bold';
    button.style.border = 'none';
    button.style.cursor = 'pointer';
    button.style.display = 'none';
    button.style.zIndex = '1002';
    button.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.3)';
    button.style.pointerEvents = 'auto';
    button.style.userSelect = 'none';
    document.body.appendChild(button);
  }

  let currentObject: InteractiveObject | null = null;
  let buttonHandler: ((e: Event) => void) | null = null;

  const show = (object: InteractiveObject | null) => {
    currentObject = object;
    if (object) {
      const actionText = getActionText(object.type);
      
      if (isMobile && button) {
        // Mobile: Show button
        button.textContent = `Tap untuk ${actionText.toLowerCase()}`;
        button.style.display = 'block';
        container.style.display = 'none';
        
        // Remove old handler if exists
        if (buttonHandler) {
          button.removeEventListener('click', buttonHandler);
        }
        
        // Add new handler
        buttonHandler = (e: Event) => {
          e.stopPropagation();
          e.preventDefault();
          if (object.onInteract) {
            object.onInteract();
          }
        };
        button.addEventListener('click', buttonHandler);
      } else {
        // Desktop: Show text prompt
        const keyHint = '[E] atau [Space]';
        container.textContent = `${keyHint} ${actionText}`;
        container.style.display = 'block';
        if (button) button.style.display = 'none';
      }
    } else {
      container.style.display = 'none';
      if (button) {
        button.style.display = 'none';
        // Remove handler when hiding
        if (buttonHandler) {
          button.removeEventListener('click', buttonHandler);
          buttonHandler = null;
        }
      }
    }
  };

  const hide = () => {
    container.style.display = 'none';
    if (button) button.style.display = 'none';
    currentObject = null;
  };

  return { container, button, show, hide };
}

function getActionText(type: string): string {
  switch (type) {
    case 'door':
      return 'Masuk ke rumah';
    case 'tv':
      return 'Lihat slideshow';
    case 'cake':
      return 'Tiup lilin';
    case 'lily':
      return 'Lihat makna bunga';
    case 'sofa':
      return 'Duduk';
    case 'bookshelf':
      return 'Lihat buku';
    case 'gift':
      return 'Buka hadiah';
    case 'letter':
      return 'Baca surat';
    case 'bed':
      return 'Lihat kasur';
    case 'chair':
      return 'Duduk';
    default:
      return 'Berinteraksi';
  }
}

