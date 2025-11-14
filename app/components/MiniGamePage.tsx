'use client';

import { useEffect, useRef, useState } from 'react';
import DoorButton from './minigame/DoorButton';
import { InteractionModal } from './minigame/GameUI';
import CouponsUI from './minigame/couponsUI';
// Helper modules will be imported dynamically to ensure hot reload works

interface MiniGamePageProps {
  onExit: () => void;
  selectedCoupons?: Array<{ id: number; title: string; emoji: string }>;
}

export default function MiniGamePage({ onExit, selectedCoupons = [] }: MiniGamePageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isInside, setIsInside] = useState(false);
  const [reloadKey, setReloadKey] = useState(0); // Key untuk force reload scene
  const [isCutsceneMode, setIsCutsceneMode] = useState(true); // Cutscene mode by default
  const [showCouponsUI, setShowCouponsUI] = useState(false);
  
  // Keep ref in sync with state
  useEffect(() => {
    isInsideRef.current = isInside;
  }, [isInside]);
  const [threeLoaded, setThreeLoaded] = useState(false);
  const [threeError, setThreeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showEnterPrompt, setShowEnterPrompt] = useState(false);
  const [nearDoor, setNearDoor] = useState(false);
  const doorRef = useRef<any>(null);
  const raycasterRef = useRef<any>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  const cameraAngleRef = useRef<{ horizontal: number; vertical: number; distance: number }>({ horizontal: 0, vertical: Math.PI / 6, distance: 10 });
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const [interaction, setInteraction] = useState<{
    type: 'bed' | 'tv' | 'letter' | 'flower' | 'cake' | 'gift' | 'sofa' | 'bookshelf' | 'chair' | null;
    show: boolean;
  }>({ type: null, show: false });
  const [tvSlideIndex, setTvSlideIndex] = useState(0);
  const [tvMediaItems, setTvMediaItems] = useState<Array<{ type: 'image' | 'video'; url: string }>>([]);
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({});
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const [analogStick, setAnalogStick] = useState({ x: 0, y: 0, active: false });
  const analogStickRef = useRef<HTMLDivElement>(null);
  const analogStickStateRef = useRef({ x: 0, y: 0, active: false });
  const playerPosRef = useRef({ x: 0, y: 0, z: 0 });
  const sceneRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const playerRef = useRef<any>(null);
  const collisionObjectsRef = useRef<any[]>([]);
  const houseGroupRef = useRef<any>(null);
  const playerControlsRef = useRef<any>(null);
  const initialCameraSetRef = useRef(false);
  const isInsideRef = useRef(false); // Initialize to false (outside house)
  const walkAnimationTimeRef = useRef(0); // Time untuk animasi jalan

  // Initialize Three.js scene
  useEffect(() => {
    if (!canvasRef.current) return;
    
    // Reset states when reload is triggered
    setIsLoading(true);
    setThreeLoaded(false);
    setThreeError(false);
    setIsInside(false);

    // Cleanup existing resources first
    if (rendererRef.current) {
      rendererRef.current.dispose();
      rendererRef.current = null;
    }
    if (sceneRef.current) {
      // Clear scene children
      while(sceneRef.current.children.length > 0) {
        sceneRef.current.remove(sceneRef.current.children[0]);
      }
      sceneRef.current = null;
    }
    // Clear all refs
    cameraRef.current = null;
    playerRef.current = null;
    doorRef.current = null;
    houseGroupRef.current = null;
    raycasterRef.current = null;
    playerControlsRef.current = null;
    collisionObjectsRef.current = [];
    initialCameraSetRef.current = false;

    let isMounted = true;
    let animationFrameId: number | null = null;
    let THREE: any = null;
    let cleanupInput: (() => void) | null = null;
    
    // Use dynamic import for Three.js and helper modules to ensure hot reload works
    Promise.all([
      import('three'),
      import('./minigame/sceneSetup'),
      import('./minigame/outdoorScenery'),
      import('./minigame/playerControls'),
      import('./minigame/cameraControls'),
      import('./minigame/inputHandlers'),
      import('./minigame/interiorObjects'),
      import('./minigame/dialogSystem'),
      import('./minigame/storyFlow'),
      import('./minigame/interactionSystem')
    ]).then(([ThreeModule, sceneSetupModule, outdoorSceneryModule, playerControlsModule, cameraControlsModule, inputHandlersModule, interiorObjectsModule, dialogSystemModule, storyFlowModule, interactionSystemModule]) => {
      // Store THREE on window to share instance across components
      (window as any).THREE = ThreeModule;
      if (!isMounted) return;
      
      THREE = ThreeModule;
      
      // Get latest versions of helper functions
      const createSceneSetupLatest = sceneSetupModule.createSceneSetup;
      const createOutdoorSceneryLatest = outdoorSceneryModule.createOutdoorScenery;
      const createPlayerControlsLatest = playerControlsModule.createPlayerControls;
      const updateCameraPositionLatest = cameraControlsModule.updateCameraPosition;
      const setupInputHandlersLatest = inputHandlersModule.setupInputHandlers;
      
      setThreeLoaded(true);
      setIsLoading(false);
      
      // Setup scene with latest version
      const setup = createSceneSetupLatest(canvasRef.current!, THREE);
      sceneRef.current = setup.scene;
      cameraRef.current = setup.camera;
      rendererRef.current = setup.renderer;
      playerRef.current = setup.player;
      doorRef.current = setup.door;
      houseGroupRef.current = setup.houseGroup;
      collisionObjectsRef.current = setup.collisionObjects;
      
      // Store setup in window for access in handlers (IMPORTANT: must be set before storyFlow.start())
      (window as any).setupRef = setup;
      (window as any).playerRef = playerRef; // Store playerRef
      (window as any).cameraRef = cameraRef; // Store cameraRef
      
      // Store birthday entrance for animation updates
      if (setup.birthdayEntrance) {
        (window as any).birthdayEntranceRef = setup.birthdayEntrance;
      }
      
      // Set initial camera angle to match starting view (camera in front of door, looking at door)
      // Camera position: (-1, 3.5, -12), Door position: (-1, 1.5, -5.85)
      // Camera is looking straight at door, so horizontal angle should be 0 (facing forward)
      // Vertical angle should be slightly down to look at door
      cameraAngleRef.current.horizontal = 0; // Facing forward (toward door)
      cameraAngleRef.current.vertical = Math.PI / 12; // Slight downward angle to look at door
      cameraAngleRef.current.distance = 6.5; // Distance from camera to door (approximately - zoomed out)
      
      // Ensure camera is set to initial position BEFORE marking as set
      setup.camera.position.set(-1, 3.5, -12);
      setup.camera.lookAt(-1, 1.5, -5.85);
      
      initialCameraSetRef.current = true; // Mark that initial camera position is set
      
      // Render once immediately to show initial view
      setup.renderer.render(setup.scene, setup.camera);

      // Add outdoor scenery with latest version
      createOutdoorSceneryLatest(setup.scene, THREE, collisionObjectsRef.current);

      // Setup raycaster
      const raycaster = new THREE.Raycaster();
      raycasterRef.current = raycaster;

      // Create player controls with latest version
      playerControlsRef.current = createPlayerControlsLatest(THREE, collisionObjectsRef.current);

      // Add interior objects (furniture, TV, cake, lily, etc.)
      const addInteriorObjectsLatest = interiorObjectsModule.addInteriorObjects;
      const interiorObjectsResult = addInteriorObjectsLatest(
        setup.scene,
        THREE,
        collisionObjectsRef.current,
        selectedCoupons
      );

      // Setup dialog system
      const { DialogSystem, createDialogUI } = dialogSystemModule;
      const dialogSystem = new DialogSystem();
      const dialogUI = createDialogUI(setup.guide, setup.camera, setup.player);
      
      // Store dialog system references (IMPORTANT: must be set before storyFlow.start())
      (window as any).dialogSystemRef = dialogSystem;
      (window as any).dialogUIRef = dialogUI;
      
      // Setup story flow
      const { StoryFlow, StoryState } = storyFlowModule;
      const storyFlow = new StoryFlow(dialogSystem, (state) => {
        console.log('Story state changed:', state);
        // Update cutscene mode based on state
        if (state === StoryState.FREE_EXPLORE) {
          setIsCutsceneMode(false);
        }
      });
      
      // Store references for cutscene callbacks
      (window as any).setIsInside = setIsInside;
      (window as any).storyFlowRef = storyFlow; // Store storyFlow reference
      (window as any).showCouponsUI = (onComplete: (selectedCoupons: string[]) => void) => {
        setShowCouponsUI(true);
        (window as any).couponsOnComplete = onComplete;
      };
      
      console.log('[MiniGamePage] Setup complete, starting cutscene...');
      console.log('[MiniGamePage] setupRef:', (window as any).setupRef);
      console.log('[MiniGamePage] playerRef:', (window as any).playerRef);
      console.log('[MiniGamePage] cameraRef:', (window as any).cameraRef);
      // Start cutscene (setupRef, playerRef, cameraRef already set above)
      storyFlow.start();

      // Setup interaction system
      const { InteractionSystem, createInteractionPrompt } = interactionSystemModule;
      const interactionPrompt = createInteractionPrompt();
      const interactionSystem = new InteractionSystem(
        raycaster,
        setup.camera,
        setup.scene,
        setup.player,
        (object) => {
          // Don't show interaction prompt during cutscene mode
          const isCutsceneMode = (window as any).storyFlowRef && (window as any).storyFlowRef.isInCutsceneMode();
          if (isCutsceneMode) {
            interactionPrompt.hide();
          } else {
            interactionPrompt.show(object);
          }
        }
      );

      // Register interactive objects
      if (setup.door) {
        interactionSystem.registerObject({
          object: setup.door,
          type: 'door',
          position: { x: -1, y: 1.5, z: -5.85 },
          interactionRange: 3,
          onInteract: () => {
            if (!isInsideRef.current) {
              setIsInside(true);
              // Move Erbe inside house when Giva enters
              // Erbe: posisi di samping kiri Giva, tidak di tempat kue
              if (setup.guide) {
                setup.guide.position.set(-1.5, 0.5, 0); // Di samping kiri Giva, tidak di tempat kue
              }
              storyFlow.onEnterInterior();
            }
          }
        });
      }

      // Register TV and store media items
      if (interiorObjectsResult && interiorObjectsResult.tvSlideshow) {
        const tv = setup.scene.children.find((child: any) => child.userData && child.userData.type === 'tv');
        if (tv) {
          // Store media items for modal
          const mediaItems = [
            { type: 'image' as const, url: '/images/giva-1.jpeg' },
            { type: 'image' as const, url: '/images/giva-2.jpeg' },
            { type: 'image' as const, url: '/images/giva-3.jpeg' },
            { type: 'image' as const, url: '/images/giva-4.jpeg' },
            { type: 'image' as const, url: '/images/giva-5.jpeg' },
            { type: 'image' as const, url: '/images/giva-6.jpeg' },
            { type: 'image' as const, url: '/images/giva-7.jpeg' },
            { type: 'image' as const, url: '/images/giva-8.jpeg' },
            { type: 'image' as const, url: '/images/giva-9.jpeg' },
            { type: 'image' as const, url: '/images/giva-10.jpeg' },
            { type: 'image' as const, url: '/images/giva-11.jpeg' }
          ];
          setTvMediaItems(mediaItems);
          // Store media items on window for access from other modules
          (window as any).tvMediaItems = mediaItems;
          
          // Sync tvSlideIndex with slideshow current index
          if (tv.userData.slideshow) {
            const updateSlideIndex = () => {
              const currentIndex = tv.userData.slideshow.getCurrentIndex();
              setTvSlideIndex(currentIndex);
            };
            // Update on slide change
            if (tv.userData.slideshow.setOnSlideChange) {
              const originalCallback = tv.userData.slideshow.setOnSlideChange;
              tv.userData.slideshow.setOnSlideChange((index: number, item: any) => {
                setTvSlideIndex(index);
                if (originalCallback) {
                  originalCallback(index, item);
                }
              });
            }
          }
          
          interactionSystem.registerObject({
            object: tv,
            type: 'tv',
            position: { x: 0, y: 1.3, z: 20 },
            interactionRange: 4,
            onInteract: () => {
              // Only interact in free roam mode (not cutscene)
              if (!storyFlow.isInCutsceneMode()) {
                console.log('[MiniGamePage] TV interaction in free roam');
                setInteraction({ type: 'tv', show: true });
                (window as any).isTVInteractionOpen = true;
                // Sync tvSlideIndex with slideshow current index
                if (tv.userData.slideshow) {
                  const currentIndex = tv.userData.slideshow.getCurrentIndex();
                  setTvSlideIndex(currentIndex);
                }
              } else {
                // In cutscene mode, let story flow handle it
                // But also allow basic controls
                if (tv.userData.controlsUI) {
                  tv.userData.controlsUI.show();
                }
                if (tv.userData.slideshow) {
                  if (tv.userData.slideshow.isPlaying()) {
                    tv.userData.slideshow.pause();
                  } else {
                    tv.userData.slideshow.play();
                  }
                }
              }
            }
          });
        }
      }

      // Register cake
      if (interiorObjectsResult && interiorObjectsResult.cake) {
        interactionSystem.registerObject({
          object: interiorObjectsResult.cake.cakeGroup,
          type: 'cake',
          position: { x: -0.8, y: 0.45, z: 2 }, // Updated position to match new cake position
          interactionRange: 2,
          onInteract: () => {
            // Only interact in free roam mode (not cutscene)
            if (!storyFlow.isInCutsceneMode()) {
              console.log('[MiniGamePage] Cake interaction in free roam');
              interiorObjectsResult.cake.blowOut();
              setInteraction({ type: 'cake', show: true });
            } else {
              // In cutscene mode, let story flow handle it
              interiorObjectsResult.cake.blowOut();
              storyFlow.onCakeInteract();
            }
          }
        });
      }

      // Register lily
      if (interiorObjectsResult && interiorObjectsResult.lilyBouquet) {
        interactionSystem.registerObject({
          object: interiorObjectsResult.lilyBouquet.bouquetGroup,
          type: 'lily',
          position: { x: 6, y: 0.55, z: 0 },
          interactionRange: 2,
          onInteract: () => {
            interiorObjectsResult.lilyBouquet.showMeaning();
          }
        });
      }

      // Register gift boxes
      if (interiorObjectsResult && interiorObjectsResult.giftBoxes) {
        interactionSystem.registerObject({
          object: interiorObjectsResult.giftBoxes,
          type: 'gift',
          position: { x: 0, y: 0.85, z: 2 },
          interactionRange: 2,
          onInteract: () => {
            // This will be handled by story flow in cutscene mode
            // In free roam mode, can trigger coupons UI
            if (storyFlow && storyFlow.isInCutsceneMode && storyFlow.isInCutsceneMode()) {
              // Story flow will handle this automatically
            } else if ((window as any).showCouponsUI) {
              (window as any).showCouponsUI((selectedCoupons: string[]) => {
                // Handle coupon selection in free roam
                console.log('[MiniGamePage] Coupons selected in free roam:', selectedCoupons);
              });
            }
          }
        });
      }

      // Register letter (for free roam interaction)
      if (setup.scene) {
        const letter = setup.scene.children.find((child: any) => 
          child.userData && child.userData.type === 'letter' && child.userData.interior
        );
        if (letter) {
          interactionSystem.registerObject({
            object: letter,
            type: 'letter',
            position: { x: -6, y: 0.6, z: 0 },
            interactionRange: 2,
            onInteract: () => {
              // Only interact in free roam mode (not cutscene)
              if (!storyFlow.isInCutsceneMode()) {
                console.log('[MiniGamePage] Letter interaction in free roam');
                setInteraction({ type: 'letter', show: true });
              }
            }
          });
        }
      }

      // Register bed (for free roam interaction)
      if (interiorObjectsResult && interiorObjectsResult.bed) {
        interactionSystem.registerObject({
          object: interiorObjectsResult.bed,
          type: 'bed',
          position: { x: 0, y: 0.5, z: 4 },
          interactionRange: 2,
          onInteract: () => {
            // Only interact in free roam mode (not cutscene)
            if (!storyFlow.isInCutsceneMode()) {
              console.log('[MiniGamePage] Bed interaction in free roam');
              setInteraction({ type: 'bed', show: true });
            }
          }
        });
      }

      // Store refs for animation loop
      (window as any).interactionSystemRef = interactionSystem;
      (window as any).dialogSystemRef = dialogSystem;
      (window as any).dialogUIRef = dialogUI;
      (window as any).storyFlowRef = storyFlow;
      (window as any).interiorObjectsRef = interiorObjectsResult;
      
      // Store blowOutCandles function for story flow
      if (interiorObjectsResult && interiorObjectsResult.cake) {
        (window as any).blowOutCandles = () => {
          interiorObjectsResult.cake.blowOut();
        };
      }
      (window as any).interiorObjectsResult = interiorObjectsResult; // Also store as interiorObjectsResult for storyFlow
      (window as any).cameraAngleRef = cameraAngleRef; // Store cameraAngleRef for camera adjustments
      // Store function to open TV interaction
      (window as any).setTVInteraction = (show: boolean) => {
        if (show) {
          console.log('[MiniGamePage] Opening TV slideshow...');
          setInteraction({ type: 'tv', show: true });
          (window as any).isTVInteractionOpen = true;
          
          // Note: Dialog for first slide will be triggered by storyFlow after slideshow opens
          // This ensures proper timing and prevents duplicate dialogs
          const setup = (window as any).setupRef;
          if (setup && setup.scene) {
            const tv = setup.scene.children.find((child: any) => child.userData && child.userData.type === 'tv');
            if (tv && tv.userData.slideshow) {
              const currentIndex = tv.userData.slideshow.getCurrentIndex();
              setTvSlideIndex(currentIndex);
            }
          }
        } else {
          console.log('[MiniGamePage] Closing TV slideshow...');
          setInteraction({ type: null, show: false });
          (window as any).isTVInteractionOpen = false;
        }
      };
      
      // Store function to advance to next slide (for auto-advance when dialog completes)
      // Use a function that always gets the latest values from the slideshow
      (window as any).tvNextSlide = () => {
        // Always get current values from slideshow and state, not from closure
        const setup = (window as any).setupRef;
        if (!setup || !setup.scene) {
          console.warn('[MiniGamePage] tvNextSlide: setup or scene not available');
          return;
        }
        
        const tv = setup.scene.children.find((child: any) => child.userData && child.userData.type === 'tv');
        if (!tv || !tv.userData.slideshow) {
          console.warn('[MiniGamePage] tvNextSlide: TV or slideshow not found');
          return;
        }
        
        // Get current index from slideshow (most reliable source)
        const currentIndex = tv.userData.slideshow.getCurrentIndex();
        
        // Get total slides from media items (stored on window or from slideshow)
        const mediaItems = (window as any).tvMediaItems || tvMediaItems;
        const totalSlides = mediaItems.length;
        
        // Calculate next index
        const newIndex = Math.min(totalSlides - 1, currentIndex + 1);
        
        // Only advance if not already at last slide
        if (newIndex > currentIndex) {
          console.log('[MiniGamePage] Auto-advancing from slide', currentIndex, 'to', newIndex);
          
          // Update state (this will trigger re-render)
          setTvSlideIndex(newIndex);
          
          // Update slideshow
          if (tv.userData.slideshow.next) {
            tv.userData.slideshow.next();
          }
          
          // Show dialog for new slide (with small delay to ensure slideshow updated)
          setTimeout(() => {
            const storyFlow = (window as any).storyFlowRef;
            if (storyFlow && storyFlow.showTVSlideDialog) {
              storyFlow.showTVSlideDialog(newIndex);
            }
          }, 100);
        } else {
          console.log('[MiniGamePage] Already at last slide, cannot advance');
        }
      };
      (window as any).exteriorStringLightsRef = setup.exteriorStringLights;
      (window as any).interiorStringLightsRef = setup.interiorStringLights;
      (window as any).playerRef = playerRef;
      (window as any).doorRef = doorRef;
      (window as any).autoWalkActive = false;
      (window as any).autoWalkTarget = null;
      (window as any).erbeAutoWalkActive = false;
      (window as any).erbeAutoWalkTarget = null;

      // Start story
      storyFlow.start();

      // Setup input handlers with latest version
      cleanupInput = setupInputHandlersLatest(
        canvasRef.current!,
        cameraAngleRef,
        isDraggingRef,
        lastMouseRef,
        raycaster,
        setup.camera,
        setup.player,
        doorRef,
        houseGroupRef,
        isInside,
        setup.scene,
        (type: string) => {
          if (!isMounted) return;
          setInteraction({ type: type as any, show: true });
        },
        analogStickRef
      );

      // Animation loop
      const animate = () => {
        if (!isMounted) return;
        
        animationFrameId = requestAnimationFrame(animate);

        if (!playerRef.current || !cameraRef.current || !rendererRef.current || !sceneRef.current) return;

        // Get current isInside state from ref (always up-to-date)
        const currentIsInside = isInsideRef.current;

        // Auto-walk Erbe to door if active (Erbe leads)
        const setupRef = (window as any).setupRef;
        if ((window as any).erbeAutoWalkActive && (window as any).erbeAutoWalkTarget && !currentIsInside && setupRef && setupRef.guide) {
          const target = (window as any).erbeAutoWalkTarget;
          const erbePos = setupRef.guide.position;
          const distance = Math.sqrt(
            Math.pow(erbePos.x - target.x, 2) + 
            Math.pow(erbePos.z - target.z, 2)
          );
          
          if (distance > 0.3) {
            // Move Erbe towards target
            const dx = target.x - erbePos.x;
            const dz = target.z - erbePos.z;
            const angle = Math.atan2(dx, dz);
            
            const speed = (window as any).erbeAutoWalkSpeed || 0.15;
            const moveX = Math.sin(angle) * speed;
            const moveZ = Math.cos(angle) * speed;
            
            setupRef.guide.position.x += moveX;
            setupRef.guide.position.z += moveZ;
            setupRef.guide.rotation.y = angle;
          } else {
            // Erbe reached target, stop
            (window as any).erbeAutoWalkActive = false;
          }
        }

        // Auto-walk Giva to target (works both outside and inside during cutscene)
        // Check if in cutscene mode - if yes, allow auto-walk even inside
        const isCutsceneMode = (window as any).storyFlowRef && (window as any).storyFlowRef.isInCutsceneMode();
        if ((window as any).autoWalkActive && (window as any).autoWalkTarget && (!currentIsInside || isCutsceneMode)) {
          const playerPos = playerRef.current.position;
          const setupRef = (window as any).setupRef;
          
          // If Erbe is still walking, Giva follows Erbe (maintain distance)
          if ((window as any).erbeAutoWalkActive && setupRef && setupRef.guide) {
            const erbePos = setupRef.guide.position;
            const followDistance = 1.5; // Distance Giva should maintain behind Erbe
            
            // Calculate direction from Giva to Erbe
            const dx = erbePos.x - playerPos.x;
            const dz = erbePos.z - playerPos.z;
            const distanceToErbe = Math.sqrt(dx * dx + dz * dz);
            
            // If too far from Erbe, move closer
            if (distanceToErbe > followDistance + 0.2) {
              const angle = Math.atan2(dx, dz);
              const speed = (window as any).autoWalkSpeed || 0.15;
              const moveX = Math.sin(angle) * speed;
              const moveZ = Math.cos(angle) * speed;
              
              const newPos = {
                x: playerPos.x + moveX,
                y: playerPos.y,
                z: playerPos.z + moveZ
              };
              
              if (!playerControlsRef.current.checkCollision(newPos)) {
                playerRef.current.position.x = newPos.x;
                playerRef.current.position.z = newPos.z;
                playerRef.current.rotation.y = angle;
                
                // Animate legs
                walkAnimationTimeRef.current += 0.2;
                const legSwingAngle = Math.sin(walkAnimationTimeRef.current) * 0.3;
                const legLift = Math.abs(Math.sin(walkAnimationTimeRef.current)) * 0.08;
                
                playerRef.current.children.forEach((child: any) => {
                  if (child.userData.isLeftLeg) {
                    const base = child.userData.basePosition;
                    child.rotation.x = legSwingAngle;
                    child.position.y = base.y + legLift;
                  }
                  if (child.userData.isRightLeg) {
                    const base = child.userData.basePosition;
                    const offsetTime = walkAnimationTimeRef.current + Math.PI;
                    child.rotation.x = Math.sin(offsetTime) * 0.3;
                    child.position.y = base.y + Math.abs(Math.sin(offsetTime)) * 0.08;
                  }
                });
              }
            }
          } else {
            // Erbe has stopped, Giva moves to final target
            const target = (window as any).autoWalkTarget;
            const distance = Math.sqrt(
              Math.pow(playerPos.x - target.x, 2) + 
              Math.pow(playerPos.z - target.z, 2)
            );
            
            if (distance > 0.3) {
              // Move towards target
              const dx = target.x - playerPos.x;
              const dz = target.z - playerPos.z;
              const angle = Math.atan2(dx, dz);
              
              // Calculate movement
              const speed = (window as any).autoWalkSpeed || 0.15;
              const moveX = Math.sin(angle) * speed;
              const moveZ = Math.cos(angle) * speed;
              
              // Check collision before moving
              const newPos = {
                x: playerPos.x + moveX,
                y: playerPos.y,
                z: playerPos.z + moveZ
              };
              
              if (!playerControlsRef.current.checkCollision(newPos)) {
                playerRef.current.position.x = newPos.x;
                playerRef.current.position.z = newPos.z;
                playerRef.current.rotation.y = angle;
                
                // Animate legs
                walkAnimationTimeRef.current += 0.2;
                const legSwingAngle = Math.sin(walkAnimationTimeRef.current) * 0.3;
                const legLift = Math.abs(Math.sin(walkAnimationTimeRef.current)) * 0.08;
                
                playerRef.current.children.forEach((child: any) => {
                  if (child.userData.isLeftLeg) {
                    const base = child.userData.basePosition;
                    child.rotation.x = legSwingAngle;
                    child.position.y = base.y + legLift;
                  }
                  if (child.userData.isRightLeg) {
                    const base = child.userData.basePosition;
                    const offsetTime = walkAnimationTimeRef.current + Math.PI;
                    child.rotation.x = Math.sin(offsetTime) * 0.3;
                    child.position.y = base.y + Math.abs(Math.sin(offsetTime)) * 0.08;
                  }
                });
              }
            } else {
              // Reached target
              (window as any).autoWalkActive = false;
              (window as any).autoWalkTarget = null;
              
              // Auto-enter house after short delay (only if outside and not in cutscene mode)
              // Note: In cutscene mode, autoEnterHouse() is called from storyFlow
              // In cutscene mode inside, auto-walk completion is handled by storyFlow
              if (!currentIsInside && (!(window as any).storyFlowRef || !(window as any).storyFlowRef.isInCutsceneMode())) {
                setTimeout(() => {
                  const setupRef = (window as any).setupRef;
                  if (!isInsideRef.current && setupRef && setupRef.guide) {
                    setIsInside(true);
                    // Erbe: posisi di samping kiri Giva, tidak di tempat kue
                    setupRef.guide.position.set(-1.5, 0.5, 0); // Di samping kiri Giva
                    playerRef.current.position.set(0, 0.5, 0);
                    cameraRef.current.position.set(0, 2.5, 0);
                    cameraRef.current.lookAt(0, 1.5, 0);
                    cameraAngleRef.current.horizontal = 0;
                    cameraAngleRef.current.vertical = Math.PI / 6;
                    cameraAngleRef.current.distance = 4;
                    storyFlow.onEnterInterior();
                  }
                }, 500); // Wait 500ms before entering
              }
            }
          }
        } else {
          // Normal player movement - DISABLED during cutscene
          if (isCutsceneMode) {
            // Skip player movement during cutscene
          } else {
        const speed = 0.1;
        const currentKeys = keysRef.current;
        const cameraAngle = cameraAngleRef.current.horizontal;
        
        // Move player
            const { moved, direction, movementAngle } = playerControlsRef.current.movePlayer(
          playerRef.current,
          cameraAngle,
          currentKeys,
          analogStickStateRef.current,
          speed
        );

          // Rotate player to face movement direction - gunakan sudut pergerakan aktual untuk semua 8 arah
          // Skip if auto-walk is active (rotation already handled)
          if (!(window as any).autoWalkActive && moved && movementAngle !== undefined) {
            // Gunakan movementAngle langsung untuk rotasi yang akurat untuk semua 8 arah
            // movementAngle sudah termasuk cameraAngle, jadi langsung gunakan untuk rotasi
            playerRef.current.rotation.y = movementAngle;
            
            // Update walk animation time
            walkAnimationTimeRef.current += 0.2; // Speed animasi
            
            // Animate legs - bergerak mengikuti arah pergerakan
            const walkSpeed = 0.3; // Kecepatan animasi kaki
            const legSwingAngle = Math.sin(walkAnimationTimeRef.current) * 0.3; // Rotasi kaki (30 derajat)
            const legLift = Math.abs(Math.sin(walkAnimationTimeRef.current)) * 0.08; // Kaki naik turun
            
            // Hitung arah pergerakan untuk animasi kaki
            // movementAngle adalah sudut rotasi karakter, jadi kaki bergerak sesuai arah ini
            const forwardX = Math.sin(movementAngle);
            const forwardZ = Math.cos(movementAngle);
            
            // Animate left leg (kaki kiri)
            playerRef.current.children.forEach((child: any) => {
              if (child.userData.isLeftLeg) {
                const base = child.userData.basePosition;
                // Rotasi kaki mengikuti arah pergerakan
                child.rotation.x = legSwingAngle;
                child.rotation.z = Math.sin(walkAnimationTimeRef.current) * 0.1;
                // Posisi kaki naik turun dan bergerak maju/mundur mengikuti arah
                child.position.x = base.x + Math.sin(walkAnimationTimeRef.current) * forwardX * 0.05;
                child.position.y = base.y + legLift;
                child.position.z = base.z + Math.sin(walkAnimationTimeRef.current) * forwardZ * 0.05;
              }
              // Animate right leg (kaki kanan) - offset 180 derajat dari kiri
              if (child.userData.isRightLeg) {
                const base = child.userData.basePosition;
                const offsetTime = walkAnimationTimeRef.current + Math.PI; // Offset 180 derajat
                const legSwingAngleRight = Math.sin(offsetTime) * 0.3;
                const legLiftRight = Math.abs(Math.sin(offsetTime)) * 0.08;
                child.rotation.x = legSwingAngleRight;
                child.rotation.z = Math.sin(offsetTime) * 0.1;
                child.position.x = base.x + Math.sin(offsetTime) * forwardX * 0.05;
                child.position.y = base.y + legLiftRight;
                child.position.z = base.z + Math.sin(offsetTime) * forwardZ * 0.05;
              }
              // Animate shoes mengikuti kaki
              if (child.userData.isLeftShoe) {
                const base = child.userData.basePosition;
                const legLiftShoe = Math.abs(Math.sin(walkAnimationTimeRef.current)) * 0.08;
                child.position.x = base.x + Math.sin(walkAnimationTimeRef.current) * forwardX * 0.05;
                child.position.y = base.y + legLiftShoe;
                child.position.z = base.z + Math.sin(walkAnimationTimeRef.current) * forwardZ * 0.05;
              }
              if (child.userData.isRightShoe) {
                const base = child.userData.basePosition;
                const offsetTime = walkAnimationTimeRef.current + Math.PI;
                const legLiftShoeRight = Math.abs(Math.sin(offsetTime)) * 0.08;
                child.position.x = base.x + Math.sin(offsetTime) * forwardX * 0.05;
                child.position.y = base.y + legLiftShoeRight;
                child.position.z = base.z + Math.sin(offsetTime) * forwardZ * 0.05;
              }
            });
            
            // Jika player bergerak dan masih dalam initial view, disable initial view
            // agar kamera langsung mengikuti pergerakan player
        if (initialCameraSetRef.current && !currentIsInside) {
              // Hitung sudut horizontal yang benar dari posisi camera saat ini
              const playerToCamera = new THREE.Vector3().subVectors(
                new THREE.Vector3(cameraRef.current.position.x, 0, cameraRef.current.position.z),
                new THREE.Vector3(playerRef.current.position.x, 0, playerRef.current.position.z)
              );
              const correctHorizontalAngle = Math.atan2(playerToCamera.x, playerToCamera.z);
              
              // Set sudut horizontal ke nilai yang benar sebagai base
              cameraAngleRef.current.horizontal = correctHorizontalAngle;
              
            // Disable initial view agar kamera mengikuti player
            initialCameraSetRef.current = false;
          }
        } else {
          // Reset leg animation ketika tidak bergerak
          playerRef.current.children.forEach((child: any) => {
            if (child.userData.isLeftLeg || child.userData.isRightLeg) {
              const base = child.userData.basePosition;
              child.position.set(base.x, base.y, base.z);
              child.rotation.set(0, 0, 0);
            }
            if (child.userData.isLeftShoe || child.userData.isRightShoe) {
              const base = child.userData.basePosition;
              child.position.set(base.x, base.y, base.z);
            }
          });
          walkAnimationTimeRef.current = 0; // Reset waktu animasi
        }
      }
    }

        // IMPORTANT: If we're outside, camera should NEVER go inside
        // Pastikan isInside selalu false ketika player di luar rumah
        if (!currentIsInside) {
          // Jika masih initial view dan user mulai drag, hitung sudut yang benar dari posisi camera saat ini
          if (initialCameraSetRef.current && isDraggingRef.current) {
            // User mulai drag pertama kali - hitung sudut horizontal yang benar dari posisi camera saat ini
            const playerToCamera = new THREE.Vector3().subVectors(
              new THREE.Vector3(cameraRef.current.position.x, 0, cameraRef.current.position.z),
              new THREE.Vector3(playerRef.current.position.x, 0, playerRef.current.position.z)
            );
            const correctHorizontalAngle = Math.atan2(playerToCamera.x, playerToCamera.z);
            
            // Set sudut horizontal ke nilai yang benar sebagai base
            // Ini memastikan transisi smooth dari initial view ke orbit mode
            cameraAngleRef.current.horizontal = correctHorizontalAngle;
            
            // Disable initial view
            initialCameraSetRef.current = false;
          }
          
          // Jika masih initial view dan belum di-drag, lock camera ke posisi initial
          if (initialCameraSetRef.current) {
            // Masih dalam initial view, lock camera ke posisi door
            cameraRef.current.position.set(-1, 3.5, -12);
            cameraRef.current.lookAt(-1, 1.5, -5.85);
            // Tidak perlu update camera position, langsung lanjut ke render
          } else {
            // User sudah drag atau initial view disabled, update camera dengan orbit mode
            // PASTIKAN isInside = false agar kamera tidak masuk ke dalam rumah
          updateCameraPositionLatest(
            cameraRef.current,
            playerRef.current,
              false, // Force isInside to false - HANYA orbit di luar rumah
            cameraAngleRef.current,
            THREE,
              false // initialCameraSet = false karena sudah di-drag
            );
          }
        } else {
          // Inside house - normal camera behavior
          updateCameraPositionLatest(
            cameraRef.current,
            playerRef.current,
            currentIsInside,
            cameraAngleRef.current,
            THREE,
            false // initialCameraSet tidak relevan di dalam rumah
          );
        }

        // Check if player is near door
        if (doorRef.current && playerRef.current) {
          const doorDistance = playerRef.current.position.distanceTo(doorRef.current.position);
          setNearDoor(doorDistance < 3);
        }

        // Update animated mountains (lava mountains)
        if (sceneRef.current && sceneRef.current.userData && sceneRef.current.userData.animatedMountains) {
          const time = Date.now() * 0.001; // Convert to seconds
          sceneRef.current.userData.animatedMountains.forEach((mountain: any) => {
            if (mountain.update) {
              mountain.update(time);
            }
          });
        }
        
        // Update animated fishes
        if (sceneRef.current && sceneRef.current.userData && sceneRef.current.userData.animatedFishes) {
          const time = Date.now() * 0.001; // Convert to seconds
          sceneRef.current.userData.animatedFishes.forEach((fish: any) => {
            if (fish.update) {
              fish.update(time);
            }
          });
        }

        // Update string lights (exterior)
        if ((window as any).exteriorStringLightsRef && (window as any).exteriorStringLightsRef.update) {
          const time = Date.now() * 0.001;
          (window as any).exteriorStringLightsRef.update(time);
        }

        // Update string lights (interior)
        if ((window as any).interiorStringLightsRef && (window as any).interiorStringLightsRef.update) {
          const time = Date.now() * 0.001;
          (window as any).interiorStringLightsRef.update(time);
        }

        // Update cake flames
        if ((window as any).interiorObjectsRef && (window as any).interiorObjectsRef.cake) {
          const cake = (window as any).interiorObjectsRef.cake;
          if (cake.cakeGroup && cake.cakeGroup.userData && cake.cakeGroup.userData.updateFlames) {
            const time = Date.now() * 0.001;
            cake.cakeGroup.userData.updateFlames(time);
          }
        }

        // Update dialog system
        if ((window as any).dialogSystemRef && (window as any).dialogUIRef) {
          const dialogSystem = (window as any).dialogSystemRef;
          const dialogUI = (window as any).dialogUIRef;
          if (dialogSystem.isActive()) {
            dialogUI.update(dialogSystem);
            dialogUI.show();
          } else {
            dialogUI.hide();
          }
        }

        // Update interaction system
        if ((window as any).interactionSystemRef) {
          (window as any).interactionSystemRef.update();
        }
        
        // Update balloon animations
        if ((window as any).birthdayEntranceRef) {
          const time = Date.now() * 0.001; // Convert to seconds
          (window as any).birthdayEntranceRef.updateAnimations(time);
        }

        rendererRef.current.render(sceneRef.current, cameraRef.current);
      };

      animate();

      // Handle window resize
      const handleResize = () => {
        if (!isMounted || !setup.camera || !setup.renderer) return;
        setup.camera.aspect = window.innerWidth / window.innerHeight;
        setup.camera.updateProjectionMatrix();
        setup.renderer.setSize(window.innerWidth, window.innerHeight);
      };
      window.addEventListener('resize', handleResize);
      
      // Store cleanup function that will be called on unmount
      // This is returned from the promise, not from useEffect
      // We need to store it in a variable that can be accessed in the cleanup
    }).catch((err) => {
      if (!isMounted) return;
      console.error('Failed to load modules:', err);
      setThreeLoaded(false);
      setThreeError(true);
      setIsLoading(false);
    });
      
    // Cleanup on unmount (this runs before Three.js loads or after component unmounts)
    return () => {
      isMounted = false;
      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      if (cleanupInput) {
        cleanupInput();
        cleanupInput = null;
      }
      // Cleanup Three.js resources if they exist
      if (rendererRef.current) {
        rendererRef.current.dispose();
        rendererRef.current = null;
      }
      if (sceneRef.current) {
        // Clear scene
        sceneRef.current = null;
      }
      // Clear all refs
      cameraRef.current = null;
      playerRef.current = null;
      doorRef.current = null;
      houseGroupRef.current = null;
      raycasterRef.current = null;
      playerControlsRef.current = null;
      collisionObjectsRef.current = [];
    };
  }, [reloadKey]); // Re-run when reloadKey changes

  // Interior objects are now added during scene setup, no need for separate useEffect

  // Hide/show interaction prompt based on interaction state
  useEffect(() => {
    // Set global flag for interaction system to check
    (window as any).isInteractionActive = interaction.show;
    
    // Directly hide/show prompt if reference exists
    const interactionPrompt = (window as any).interactionPromptRef;
    if (interactionPrompt) {
      if (interaction.show) {
        // Hide prompt when interaction is active
        interactionPrompt.hide();
      } else {
        // Show prompt again when interaction is closed
        // The interaction system's update() will handle showing the prompt for nearby objects
        // We just need to ensure the flag is cleared
      }
    }
  }, [interaction.show]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys((prev) => ({ ...prev, [key]: true }));
      keysRef.current[key] = true;
      keysRef.current[e.key] = true;

      // Handle interaction keys (E, Space, Enter)
      if ((window as any).interactionSystemRef) {
        (window as any).interactionSystemRef.onKeyDown(key);
      }

      // Handle dialog advance (Space when dialog is active)
      if ((window as any).dialogSystemRef && (window as any).dialogSystemRef.isActive()) {
        if (key === ' ' || key === 'enter') {
          (window as any).dialogSystemRef.advance();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      setKeys((prev) => ({ ...prev, [key]: false }));
      keysRef.current[key] = false;
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const handleEnterHouse = () => {
    setIsInside(true);
    // Move Erbe inside house when Giva enters
    if ((window as any).setupRef && (window as any).setupRef.guide) {
      (window as any).setupRef.guide.position.set(-1.5, 0.5, 0); // Di samping kiri Giva, tidak di tempat kue
    }
    if (playerRef.current) {
      playerRef.current.position.set(0, 0.5, 0);
    }
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 2.5, 0);
      cameraRef.current.lookAt(0, 1.5, 0);
      cameraAngleRef.current.horizontal = 0;
      cameraAngleRef.current.vertical = Math.PI / 6;
      cameraAngleRef.current.distance = 4;
    }
  };

  const handleExitHouse = () => {
    setIsInside(false);
    if (playerRef.current) {
      // Move player OUTSIDE house, positioned behind camera so door is visible
      playerRef.current.position.set(-1, 0.5, -9);
    }
    if (cameraRef.current) {
      // Reset camera to initial position: outside, looking at door (zoomed out)
      cameraRef.current.position.set(-1, 3.5, -12);
      cameraRef.current.lookAt(-1, 1.5, -5.85);
      cameraAngleRef.current.horizontal = 0;
      cameraAngleRef.current.vertical = Math.PI / 12;
      cameraAngleRef.current.distance = 6.5;
      initialCameraSetRef.current = true; // Re-enable initial camera view
    }
  };

  // Handle dev reload - hanya muncul di development
  const handleDevReload = () => {
    // Clean up all overlays before reload
    cleanupAllOverlays();
    
    // Force reload dengan mengubah key
    setReloadKey(prev => prev + 1);
  }

  // Clean up all overlays (dialog, letter, lily, cake, sleep fade, etc.)
  const cleanupAllOverlays = () => {
    // Remove dialog UI
    if ((window as any).dialogUIRef) {
      (window as any).dialogUIRef.hide();
    }
    
    // Remove letter overlay
    const letterOverlays = document.querySelectorAll('[data-letter-overlay="true"]');
    letterOverlays.forEach((overlay: any) => {
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
      }
    });
    
    // Remove lily overlay
    const lilyOverlays = document.querySelectorAll('[data-lily-overlay="true"]');
    lilyOverlays.forEach((overlay: any) => {
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
      }
    });
    
    // Remove cake blow overlay
    const cakeOverlays = document.querySelectorAll('[data-cake-overlay="true"]');
    cakeOverlays.forEach((overlay: any) => {
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
      }
    });
    
    // Remove sleep fade overlay
    const sleepFadeOverlays = document.querySelectorAll('[data-sleep-fade="true"]');
    sleepFadeOverlays.forEach((overlay: any) => {
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
      }
    });
    (window as any).sleepFadeOverlay = null;
    
    // Remove TV interaction overlay
    if ((window as any).isTVInteractionOpen) {
      setInteraction({ type: null, show: false });
      (window as any).isTVInteractionOpen = false;
    }
    
    // Remove coupons UI
    setShowCouponsUI(false);
    
    // Remove rest text overlay
    const restTextOverlays = document.querySelectorAll('[data-rest-text="true"]');
    restTextOverlays.forEach((overlay: any) => {
      if (overlay.parentNode) {
        document.body.removeChild(overlay);
      }
    });
    
    // Remove any other overlays with high z-index
    const allOverlays = Array.from(document.querySelectorAll('div')).filter((el: any) => {
      const zIndex = parseInt(window.getComputedStyle(el).zIndex) || 0;
      return zIndex >= 2000 && el.style.position === 'fixed';
    });
    
    allOverlays.forEach((overlay: any) => {
      // Don't remove reload button or exit button
      if (!overlay.closest('.absolute.top-4.right-4')) {
        if (overlay.parentNode && overlay !== document.body) {
          try {
            document.body.removeChild(overlay);
          } catch (e) {
            // Ignore errors if already removed
          }
        }
      }
    });
    
    // Restore joystick/controls if hidden
    const joystickElements = document.querySelectorAll('[data-hidden-by-overlay="true"]');
    joystickElements.forEach((el: any) => {
      if (el) {
        el.style.display = '';
        el.removeAttribute('data-hidden-by-overlay');
      }
    });
  };

  // Check if in development mode
  // Di Next.js, process.env.NODE_ENV akan di-replace pada build time
  // Untuk safety, kita juga cek apakah ada query parameter ?dev=true
  const isDevelopment = 
    (typeof window !== 'undefined' && window.location.search.includes('dev=true')) ||
    (typeof process !== 'undefined' && process.env.NODE_ENV === 'development');

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-pastel-mint to-pastel-lavender" style={{ touchAction: 'none' }}>
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
        style={{ touchAction: 'none' }}
        onPointerDown={(e) => {
          // Handle click interaction (only if dialog is not active)
          if ((window as any).dialogSystemRef && (window as any).dialogSystemRef.isActive()) {
            // Dialog is active, advance dialog instead of interaction
            // Note: Dialog box itself handles the click, but we can also handle it here as fallback
            e.stopPropagation();
            // Don't call advance here - let dialog box handle it
          } else if ((window as any).interactionSystemRef && canvasRef.current && !isCutsceneMode) {
            // No dialog active and not in cutscene mode, handle normal interaction
            (window as any).interactionSystemRef.onClick(e.nativeEvent, canvasRef.current);
          } else if (isCutsceneMode) {
            // In cutscene mode, disable canvas interactions (dialog will handle its own clicks)
            e.stopPropagation();
          }
        }}
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="glass-effect rounded-3xl p-8 md:p-12 shadow-2xl text-center max-w-md mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 font-serif">
              Loading 3D World...
            </h2>
            <div className="flex justify-center mb-4">
              <div className="w-8 h-8 border-4 border-pastel-lavender border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-gray-600">
              Memuat dunia 3D...
            </p>
          </div>
        </div>
      )}

      {threeError && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="glass-effect rounded-3xl p-8 md:p-12 shadow-2xl text-center max-w-md mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4 font-serif">
              Failed to Load 3D World
            </h2>
            <p className="text-gray-600 mb-4">
              Please install Three.js to enable the 3D mini game:
            </p>
            <code className="block bg-gray-100 p-3 rounded-lg text-sm mb-4">
              yarn add three @types/three
            </code>
            <button
              onClick={onExit}
              className="bg-gradient-to-r from-pastel-lavender to-pastel-pink text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      )}

      <div className="absolute inset-0 z-10 pointer-events-none">
        {/* <div className="absolute top-4 left-4 glass-effect rounded-2xl p-4 pointer-events-auto">
          <p className="text-sm text-gray-700 mb-2">Controls:</p>
          <p className="text-xs text-gray-600">WASD / Arrow Keys to move</p>
          <p className="text-xs text-gray-600 mt-1">Drag mouse to rotate camera</p>
          <p className="text-xs text-gray-600">Scroll to zoom</p>
        </div> */}

        <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto" style={{ zIndex: 2000 }}>
          {isDevelopment && (
            <button
              onClick={handleDevReload}
              className="glass-effect rounded-full px-4 py-2 text-xs font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-gray-700"
              style={{ background: 'rgba(255, 255, 255, 0.9)' }}
              title="Reload Scene (Dev Only)"
            >
              🔄 Reload
            </button>
          )}
          <button
            onClick={onExit}
            className="glass-effect rounded-full px-6 py-3 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            style={{ background: 'rgba(251, 234, 236, 0.9)' }}
          >
            Exit Game
          </button>
        </div>

        {!isInside && nearDoor && (
          <DoorButton
            label="Masuk Rumah"
            onClick={handleEnterHouse}
            doorRef={doorRef}
            cameraRef={cameraRef}
          />
        )}

        {isInside && nearDoor && (
          <DoorButton
            label="Keluar Rumah"
            onClick={handleExitHouse}
            doorRef={doorRef}
            cameraRef={cameraRef}
          />
        )}

        <InteractionModal
          interaction={interaction}
          tvSlideIndex={tvSlideIndex}
          tvMediaItems={tvMediaItems}
          selectedCoupons={selectedCoupons}
          onClose={() => {
            console.log('[MiniGamePage] TV slideshow closing, isTVInteractionOpen:', (window as any).isTVInteractionOpen);
            
            // Set state to closed
            setInteraction({ type: null, show: false });
            (window as any).isTVInteractionOpen = false;
            
            // IMPORTANT: Only call callback after slideshow is COMPLETELY closed
            // Use verification loop to ensure state is truly updated and slideshow is closed
            let checkCount = 0;
            const maxChecks = 20; // Check 20 times over 1 second
            const checkInterval = setInterval(() => {
              checkCount++;
              const isTVOpen = (window as any).isTVInteractionOpen;
              
              // Verify slideshow is truly closed: flag must be false
              // Also check if interaction modal is actually closed by checking DOM
              const modalElement = document.querySelector('[data-tv-modal]') || 
                                   document.querySelector('.fixed.inset-0.bg-black');
              const isModalVisible = modalElement && 
                                   window.getComputedStyle(modalElement as HTMLElement).display !== 'none';
              
              const isTrulyClosed = !isTVOpen && !isModalVisible;
              
              if (isTrulyClosed || checkCount >= maxChecks) {
                clearInterval(checkInterval);
                
                // Final verification before calling callback
                if (!(window as any).isTVInteractionOpen) {
                  console.log('[MiniGamePage] TV slideshow confirmed closed after', checkCount * 50, 'ms, calling callback');
                  // Call callback if waiting for slideshow close (story mode)
                  if ((window as any).onTVSlideshowClose) {
                    const callback = (window as any).onTVSlideshowClose;
                    (window as any).onTVSlideshowClose = null;
                    // Additional small delay to ensure everything is settled
                    setTimeout(() => {
                      callback();
                    }, 100);
                  }
                } else {
                  console.warn('[MiniGamePage] TV slideshow still open after checks, not calling callback');
                }
              }
            }, 50); // Check every 50ms
          }}
          onPrevSlide={() => {
            const newIndex = Math.max(0, tvSlideIndex - 1);
            setTvSlideIndex(newIndex);
            // Update slideshow
            const setup = (window as any).setupRef;
            if (setup && setup.scene) {
              const tv = setup.scene.children.find((child: any) => child.userData && child.userData.type === 'tv');
              if (tv && tv.userData.slideshow && tv.userData.slideshow.prev) {
                tv.userData.slideshow.prev();
              }
            }
            // Show dialog for new slide
            const storyFlow = (window as any).storyFlowRef;
            if (storyFlow && storyFlow.showTVSlideDialog) {
              storyFlow.showTVSlideDialog(newIndex);
            }
          }}
          onNextSlide={() => {
            const newIndex = Math.min(tvMediaItems.length - 1, tvSlideIndex + 1);
            setTvSlideIndex(newIndex);
            // Update slideshow
            const setup = (window as any).setupRef;
            if (setup && setup.scene) {
              const tv = setup.scene.children.find((child: any) => child.userData && child.userData.type === 'tv');
              if (tv && tv.userData.slideshow && tv.userData.slideshow.next) {
                tv.userData.slideshow.next();
              }
            }
            // Show dialog for new slide
            const storyFlow = (window as any).storyFlowRef;
            if (storyFlow && storyFlow.showTVSlideDialog) {
              storyFlow.showTVSlideDialog(newIndex);
            }
          }}
        />

        <div 
          className="absolute bottom-6 left-6 pointer-events-auto md:hidden z-20"
          ref={analogStickRef}
          data-joystick="true"
          style={{ touchAction: 'none' }}
          onTouchStart={(e) => {
            const touch = e.touches[0];
            const rect = analogStickRef.current?.getBoundingClientRect();
            if (rect) {
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const deltaX = touch.clientX - centerX;
              const deltaY = touch.clientY - centerY;
              const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 36);
              const angle = Math.atan2(deltaY, deltaX);
              const x = Math.cos(angle) * (distance / 36);
              const y = Math.sin(angle) * (distance / 36);
              const stickState = { x, y, active: true };
              setAnalogStick(stickState);
              analogStickStateRef.current = stickState;
            }
          }}
          onTouchMove={(e) => {
            const touch = e.touches[0];
            const rect = analogStickRef.current?.getBoundingClientRect();
            if (rect) {
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              const deltaX = touch.clientX - centerX;
              const deltaY = touch.clientY - centerY;
              const distance = Math.min(Math.sqrt(deltaX * deltaX + deltaY * deltaY), 36);
              const angle = Math.atan2(deltaY, deltaX);
              const x = Math.cos(angle) * (distance / 36);
              const y = Math.sin(angle) * (distance / 36);
              const stickState = { x, y, active: true };
              setAnalogStick(stickState);
              analogStickStateRef.current = stickState;
            }
          }}
          onTouchEnd={() => {
            const stickState = { x: 0, y: 0, active: false };
            setAnalogStick(stickState);
            analogStickStateRef.current = stickState;
          }}
          onTouchCancel={() => {
            const stickState = { x: 0, y: 0, active: false };
            setAnalogStick(stickState);
            analogStickStateRef.current = stickState;
          }}
        >
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/60 border-2 border-white/80 shadow-lg flex items-center justify-center">
              <div
                className="absolute w-10 h-10 rounded-full bg-white/90 border-2 border-pastel-lavender shadow-md transition-transform duration-75"
                style={{
                  transform: `translate(${analogStick.x * 20}px, ${analogStick.y * 20}px)`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Coupons UI */}
      {showCouponsUI && (
        <CouponsUI
          onComplete={(selectedCoupons) => {
            setShowCouponsUI(false);
            if ((window as any).couponsOnComplete) {
              (window as any).couponsOnComplete(selectedCoupons);
            }
          }}
          onSkip={() => {
            setShowCouponsUI(false);
            setIsCutsceneMode(false);
          }}
        />
      )}
    </div>
  );
}
