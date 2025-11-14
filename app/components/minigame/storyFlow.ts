// Story flow system for birthday celebration - Cutscene Mode

import { DialogSystem, type DialogMessage } from './dialogSystem';
import type { MediaItem } from './tvSlideshow';
import { config } from '../../config';
import { tvSlideshowConfig } from './tvSlideshowConfig';

export enum StoryState {
  CUTSCENE = 'cutscene',
  EXTERIOR_WELCOME = 'exterior_welcome',
  EXTERIOR_APPROACH = 'exterior_approach',
  TRANSITION = 'transition',
  INTERIOR_ENTRY = 'interior_entry',
  INTERIOR_LETTER = 'interior_letter',
  INTERIOR_TV = 'interior_tv',
  INTERIOR_LILY = 'interior_lily',
  INTERIOR_CAKE = 'interior_cake',
  INTERIOR_BED = 'interior_bed',
  INTERIOR_GIFTS = 'interior_gifts',
  CELEBRATION = 'celebration',
  FREE_EXPLORE = 'free_explore'
}

export class StoryFlow {
  private currentState: StoryState = StoryState.CUTSCENE;
  private dialogSystem: DialogSystem;
  private onStateChange?: (state: StoryState) => void;
  private isCutsceneMode: boolean = true;
  private currentSequenceIndex: number = 0;
  private autoAdvanceTimer: number | null = null;
  private tvSlideDialogs: DialogMessage[][] = []; // Dialog untuk setiap slide TV
  private currentTVSlideDialog: number | null = null; // Index slide yang sedang menampilkan dialog
  private tvSlideDialogSkippable: boolean = true; // Dialog bisa di-skip
  private tvSlideDialogJustCompleted: boolean = false; // Flag untuk menandai dialog TV slide baru saja selesai

  constructor(dialogSystem: DialogSystem, onStateChange?: (state: StoryState) => void) {
    this.dialogSystem = dialogSystem;
    this.onStateChange = onStateChange;
    this.setupTVSlideDialogs(); // Setup dialog untuk setiap slide
  }

  // Start the story - Cutscene mode by default
  start() {
    this.isCutsceneMode = true;
    this.currentSequenceIndex = 0;
    this.setState(StoryState.CUTSCENE);
    this.startExteriorScene();
  }

  // Skip cutscene - jump to free roam
  skipCutscene() {
    this.isCutsceneMode = false;
    this.setState(StoryState.FREE_EXPLORE);
    if (this.autoAdvanceTimer) {
      clearTimeout(this.autoAdvanceTimer);
      this.autoAdvanceTimer = null;
    }
    // Mark all interactions as completed
    if ((window as any).onCutsceneSkip) {
      (window as any).onCutsceneSkip();
    }
  }

  // Check if in cutscene mode
  isInCutsceneMode(): boolean {
    return this.isCutsceneMode;
  }

  // Scene 1: Exterior - Giva arrives
  private startExteriorScene() {
    this.setState(StoryState.EXTERIOR_WELCOME);
    
    // Dialog pertama: Monolog Giva (dari jauh)
    const firstMessage: DialogMessage[] = [
      {
        speaker: 'Giva',
        text: 'Hari ini Erbe mengundangku ke rumahnya, aku akan datang ke rumahnya.'
      }
    ];
    
    this.startDialogWithAutoAdvance(firstMessage, () => {
      console.log('[StoryFlow] First dialog completed, starting auto-walk to Erbe...');
      // Setelah dialog pertama, auto-walk ke Erbe
      this.autoWalkToErbe();
    });
  }

  // Auto-walk Giva ke Erbe (yang ada di posisi -2, 0.5, -9)
  private autoWalkToErbe() {
    const playerRef = (window as any).playerRef;
    const player = playerRef?.current || playerRef;
    const setup = (window as any).setupRef;
    
    if (player && setup && setup.guide) {
      // Erbe ada di posisi (-2, 0.5, -9)
      // Giva akan berjalan ke posisi di samping Erbe (misalnya -1.5, 0.5, -9)
      const erbePos = setup.guide.position;
      const targetPos = {
        x: erbePos.x + 0.5, // Di samping kanan Erbe
        y: erbePos.y,
        z: erbePos.z
      };
      
      console.log('[StoryFlow] Auto-walking Giva to Erbe, target:', targetPos);
      
      (window as any).autoWalkTarget = targetPos;
      (window as any).autoWalkActive = true;
      (window as any).autoWalkSpeed = 0.15;
      
      // Wait for arrival, then continue dialog
      let checkCount = 0;
      const maxChecks = 300; // Max 30 seconds
      const checkInterval = setInterval(() => {
        checkCount++;
        const autoWalkActive = (window as any).autoWalkActive;
        const playerPos = player.position;
        const distance = Math.sqrt(
          Math.pow(playerPos.x - targetPos.x, 2) + 
          Math.pow(playerPos.z - targetPos.z, 2)
        );
        
        if (!autoWalkActive || distance < 0.5) {
          console.log('[StoryFlow] Reached Erbe, continuing dialog...');
          clearInterval(checkInterval);
          // Lanjutkan dialog setelah sampai ke Erbe
          this.continueExteriorDialog();
        } else if (checkCount >= maxChecks) {
          console.warn('[StoryFlow] Auto-walk to Erbe timeout, forcing continuation');
          clearInterval(checkInterval);
          (window as any).autoWalkActive = false;
          this.continueExteriorDialog();
        }
      }, 100);
    } else {
      console.warn('[StoryFlow] Auto-walk to Erbe failed: missing playerRef or setupRef');
      // Skip auto-walk, langsung lanjut dialog
      this.continueExteriorDialog();
    }
  }

  // Lanjutkan dialog setelah Giva sampai ke Erbe
  private continueExteriorDialog() {
    const messages: DialogMessage[] = [
      {
        speaker: 'Erbe',
        text: 'Heh, akhirnya sampai juga... Ayo sini masuk ke rumah dulu ...'
      },
      {
        speaker: 'Giva',
        text: 'Hehe, makasih, Erbe~ Tapi... kamu nyiapin apa lagi sih, tiba-tiba ngajak ke rumah ini?'
      },
      {
        speaker: 'Erbe',
        text: 'Rahasia 😏 tapi semua ini... aku siapkan buat kamu. Ayo, kita masuk ke dalam, aku mau tunjukin sesuatu.'
      }
    ];
    
    this.startDialogWithAutoAdvance(messages, () => {
      // Auto-walk to door
      this.startAutoWalkToDoor();
    });
  }

  // Auto-walk to door (Erbe leads, Giva follows)
  private startAutoWalkToDoor() {
    const doorRef = (window as any).doorRef;
    const playerRef = (window as any).playerRef;
    const setup = (window as any).setupRef;
    
    const door = doorRef?.current || doorRef;
    const player = playerRef?.current || playerRef;
    
    if (player && door && door.position && setup) {
      const doorPos = door.position;
      
      // Erbe's target (leads, stops closer to door)
      if (setup.guide) {
        (window as any).erbeAutoWalkTarget = {
          x: doorPos.x,
          y: doorPos.y,
          z: doorPos.z - 1.0
        };
        (window as any).erbeAutoWalkActive = true;
        (window as any).erbeAutoWalkSpeed = 0.15;
      }
      
      // Giva's target (follows, stops behind Erbe)
      (window as any).autoWalkTarget = {
        x: doorPos.x,
        y: doorPos.y,
        z: doorPos.z - 1.8
      };
      (window as any).autoWalkActive = true;
      (window as any).autoWalkSpeed = 0.15;
      
      // Wait for auto-walk to complete, then auto-enter
      this.waitForAutoWalkComplete(() => {
        this.autoEnterHouse();
      });
    } else {
      console.warn('Auto-walk to door failed: missing doorRef, playerRef, or setupRef');
    }
  }

  // Wait for auto-walk to complete
  private waitForAutoWalkComplete(onComplete: () => void) {
    console.log('[StoryFlow] waitForAutoWalkComplete: waiting for auto-walk to finish...');
    let checkCount = 0;
    const maxChecks = 300; // Max 30 seconds (300 * 100ms)
    const checkInterval = setInterval(() => {
      checkCount++;
      const autoWalkActive = (window as any).autoWalkActive;
      const erbeAutoWalkActive = (window as any).erbeAutoWalkActive;
      
      if (!autoWalkActive && !erbeAutoWalkActive) {
        console.log('[StoryFlow] Auto-walk completed, entering house...');
        clearInterval(checkInterval);
        setTimeout(onComplete, 500); // Small delay before entering
      } else if (checkCount >= maxChecks) {
        console.warn('[StoryFlow] Auto-walk timeout, forcing entry...');
        clearInterval(checkInterval);
        setTimeout(onComplete, 500);
      }
    }, 100);
  }

  // Auto-enter house
  private autoEnterHouse() {
    console.log('[StoryFlow] autoEnterHouse called');
    const setup = (window as any).setupRef;
    const playerRef = (window as any).playerRef;
    const cameraRef = (window as any).cameraRef;
    
    console.log('[StoryFlow] setup:', setup, 'playerRef:', playerRef, 'cameraRef:', cameraRef);
    
    if (setup && playerRef && cameraRef) {
      const player = playerRef.current || playerRef;
      const camera = cameraRef.current || cameraRef;
      
      console.log('[StoryFlow] Moving characters inside...');
      
      // Move inside
      // Erbe: posisi di samping kiri Giva, tidak di tempat kue
      if (setup.guide) {
        console.log('[StoryFlow] Setting Erbe position to (-1.5, 0.5, 0)');
        setup.guide.position.set(-1.5, 0.5, 0); // Di samping kiri Giva, tidak di tempat kue (z=2)
      }
      // Giva: di tengah ruangan
      if (player) {
        console.log('[StoryFlow] Setting Giva position to (0, 0.5, 0)');
        player.position.set(0, 0.5, 0);
      }
      if (camera) {
        console.log('[StoryFlow] Setting camera position');
        camera.position.set(0, 2.5, 0);
        camera.lookAt(0, 1.5, 0);
      }
      
      // Stop any auto-walk
      (window as any).autoWalkActive = false;
      (window as any).autoWalkTarget = null;
      (window as any).erbeAutoWalkActive = false;
      (window as any).erbeAutoWalkTarget = null;
      
      // Trigger interior entry
      if ((window as any).setIsInside) {
        console.log('[StoryFlow] Calling setIsInside(true)');
        (window as any).setIsInside(true);
      }
      
      this.setState(StoryState.INTERIOR_ENTRY);
      console.log('[StoryFlow] Starting interior scene in 1 second...');
      setTimeout(() => {
        this.startInteriorScene();
      }, 1000);
    } else {
      console.error('[StoryFlow] autoEnterHouse failed: missing setup, playerRef, or cameraRef');
    }
  }

  // Scene 2: Interior Entry
  private startInteriorScene() {
    console.log('[StoryFlow] startInteriorScene called');
    const messages: DialogMessage[] = [
      {
        speaker: 'Giva',
        text: 'Waaah... lucunyaa 🥺'
      },
      {
        speaker: 'Erbe',
        text: 'Hehehe, lucu kan, ayo ayang, aku pengen kamu lihat satu-satu.'
      },
      {
        speaker: 'Giva',
        text: 'Wah... ini semua buat aku? 😳'
      },
      {
        speaker: 'Erbe',
        text: 'Iya sayanggg puhahahahah'
      }
    ];
    
    this.startDialogWithAutoAdvance(messages, () => {
      console.log('[StoryFlow] Interior scene dialog completed, starting interaction sequence...');
      // Start interaction sequence: Letter → TV → Lily → Cake → Bed → Gifts
      this.currentSequenceIndex = 0;
      this.startInteractionSequence();
    });
  }

  // Interaction sequence: Letter → TV → Lily → Cake → Gifts → Bed
  private startInteractionSequence() {
    console.log('[StoryFlow] startInteractionSequence called, currentSequenceIndex:', this.currentSequenceIndex);
    const sequence = [
      { state: StoryState.INTERIOR_LETTER, target: 'letter', position: { x: -5, y: 0.5, z: 0 } }, // Di depan meja surat, bukan di tengah
      { state: StoryState.INTERIOR_TV, target: 'tv', position: { x: 0, y: 0.5, z: 17 } }, // Di depan TV (TV ada di z: 20.1, jadi posisi z: 17 = 3 unit di depan TV)
      { state: StoryState.INTERIOR_LILY, target: 'lily', position: { x: 6, y: 0.5, z: -1.2 } }, // Di depan meja vas bunga, tidak menembus meja
      { state: StoryState.INTERIOR_CAKE, target: 'cake', position: { x: 0, y: 0.5, z: 0.5 } }, // Di depan kue, bukan di tengah kue
      { state: StoryState.INTERIOR_GIFTS, target: 'gifts', position: { x: 0, y: 0.5, z: 0.5 } }, // Di depan kue juga, bukan di tengah kue
      { state: StoryState.INTERIOR_BED, target: 'bed', position: { x: -2.5, y: 0.5, z: 4.5 } } // Dari sisi KIRI kasur (x negatif), JAUH dari meja kue yang ada di sisi kanan
    ];

    if (this.currentSequenceIndex >= sequence.length) {
      // Sequence complete, go to free roam
      console.log('[StoryFlow] Interaction sequence complete, going to free roam');
      this.isCutsceneMode = false;
      this.setState(StoryState.FREE_EXPLORE);
      return;
    }

    const current = sequence[this.currentSequenceIndex];
    console.log('[StoryFlow] Starting interaction:', current.target, 'at position:', current.position);
    this.setState(current.state);
    
    // Check if player is already close enough to skip auto-walk
    const playerRef = (window as any).playerRef;
    const player = playerRef?.current || playerRef;
    if (player) {
      const playerPos = player.position;
      let distance = Math.sqrt(
        Math.pow(playerPos.x - current.position.x, 2) + 
        Math.pow(playerPos.z - current.position.z, 2)
      );
      
      // For lily, also check distance to actual lily position
      if (current.target === 'lily') {
        const lilyPosition = { x: 6, y: 0.55, z: 0 }; // Actual lily bouquet position
        const distanceToLily = Math.sqrt(
          Math.pow(playerPos.x - lilyPosition.x, 2) + 
          Math.pow(playerPos.z - lilyPosition.z, 2)
        );
        // Use the closer distance (either to target or to lily)
        distance = Math.min(distance, distanceToLily);
        console.log('[StoryFlow] Distance to lily target:', distance, 'distance to lily bouquet:', distanceToLily);
      }
      
      // For bed, also check distance to actual bed position
      // But only skip auto-walk if player is on the LEFT side of bed (x < -1.0, away from cake table)
      if (current.target === 'bed') {
        const bedPosition = { x: 0, y: 0.4, z: 4 }; // Actual bed center position
        const distanceToBed = Math.sqrt(
          Math.pow(playerPos.x - bedPosition.x, 2) + 
          Math.pow(playerPos.z - bedPosition.z, 2)
        );
        // Use the closer distance (either to target or to bed)
        distance = Math.min(distance, distanceToBed);
        // x < -1.0 ensures player is clearly on left side, away from cake table at x: 0
        const isOnLeftSide = playerPos.x < -1.0; // Left side of bed (away from cake table)
        console.log('[StoryFlow] Distance to bed target:', distance, 'distance to bed center:', distanceToBed, 'isOnLeftSide:', isOnLeftSide, 'player x:', playerPos.x);
        
        // Only skip auto-walk if close enough AND on left side
        if (distance < 2.0 && isOnLeftSide) {
          console.log('[StoryFlow] Player already close to bed on LEFT side (distance:', distance, '), skipping auto-walk');
          setTimeout(() => {
            this.triggerInteraction(current.target);
          }, 300);
          return;
        }
        // If on right side (where cake table is) or not close enough, continue with auto-walk
        console.log('[StoryFlow] Player NOT on left side or not close enough, continuing auto-walk to LEFT side of bed');
      }
      
      // If already close enough (within 1.5 units for target, or 2.5 units for lily), skip auto-walk
      const closeEnough = current.target === 'lily' ? distance < 2.5 : distance < 1.5;
      if (closeEnough) {
        console.log('[StoryFlow] Player already close to target (distance:', distance, '), skipping auto-walk');
        setTimeout(() => {
          this.triggerInteraction(current.target);
        }, 300);
        return;
      }
    }
    
    // Auto-walk to target
    this.autoWalkToTarget(current.position, () => {
      console.log('[StoryFlow] Reached target, triggering interaction:', current.target);
      
      // For bed, verify player is actually on LEFT side before triggering
      if (current.target === 'bed') {
        const playerRef = (window as any).playerRef;
        const player = playerRef?.current || playerRef;
        if (player) {
          const playerPos = player.position;
          const isOnLeftSide = playerPos.x < -1.0; // Left side of bed (away from cake table)
          console.log('[StoryFlow] Before triggering bed interaction, checking position. Player x:', playerPos.x, 'isOnLeftSide:', isOnLeftSide);
          
          if (!isOnLeftSide) {
            console.warn('[StoryFlow] Player NOT on left side yet (x:', playerPos.x, '), continuing auto-walk...');
            // Continue auto-walk until player reaches left side
            this.autoWalkToTarget(current.position, () => {
              // Check again
              const newPlayerPos = player.position;
              const newIsOnLeftSide = newPlayerPos.x < -1.0;
              if (newIsOnLeftSide) {
                console.log('[StoryFlow] Player now on left side (x:', newPlayerPos.x, '), triggering interaction');
                this.triggerInteraction(current.target);
              } else {
                console.warn('[StoryFlow] Player still not on left side (x:', newPlayerPos.x, '), forcing interaction anyway');
                this.triggerInteraction(current.target);
              }
            }, current.target);
            return;
          }
        }
      }
      
      // Trigger interaction - distance check already done in autoWalkToTarget for lily
      this.triggerInteraction(current.target);
    }, current.target);
  }

  // Auto-walk to target position
  private autoWalkToTarget(target: { x: number; y: number; z: number }, onComplete: () => void, targetType?: string) {
    console.log('[StoryFlow] autoWalkToTarget called, target:', target, 'targetType:', targetType);
    const playerRef = (window as any).playerRef;
    const player = playerRef?.current || playerRef;
    
    if (player) {
      console.log('[StoryFlow] Setting auto-walk target, player position:', player.position);
      (window as any).autoWalkTarget = target;
      (window as any).autoWalkActive = true;
      (window as any).autoWalkSpeed = 0.15;
      
      // For lily, also track distance to actual lily bouquet position
      const lilyPosition = targetType === 'lily' ? { x: 6, y: 0.55, z: 0 } : null;
      
      // For bed, also track distance to actual bed position
      const bedPosition = targetType === 'bed' ? { x: 0, y: 0.4, z: 4 } : null;
      
      // Wait for arrival with timeout
      let checkCount = 0;
      const maxChecks = 300; // Max 30 seconds
      let lastDistance = Infinity;
      let stuckCount = 0; // Count how many times player is stuck at same distance
      const checkInterval = setInterval(() => {
        checkCount++;
        const autoWalkActive = (window as any).autoWalkActive;
        const playerPos = player.position;
        const distance = Math.sqrt(
          Math.pow(playerPos.x - target.x, 2) + 
          Math.pow(playerPos.z - target.z, 2)
        );
        
        // For lily, also check distance to actual lily bouquet
        let distanceToObject = distance;
        if (lilyPosition) {
          const distanceToLily = Math.sqrt(
            Math.pow(playerPos.x - lilyPosition.x, 2) + 
            Math.pow(playerPos.z - lilyPosition.z, 2)
          );
          distanceToObject = Math.min(distance, distanceToLily);
          // If close enough to lily bouquet (within 1.5 units), trigger immediately
          if (distanceToLily < 1.5) {
            console.log('[StoryFlow] Close enough to lily bouquet (distance:', distanceToLily, '), triggering interaction immediately');
            clearInterval(checkInterval);
            (window as any).autoWalkActive = false;
            setTimeout(onComplete, 300);
            return;
          }
        }
        
        // For bed, also check distance to actual bed position
        // But only trigger if player is on the LEFT side of bed (x < -1.0) to avoid triggering from right side where cake table is
        if (bedPosition) {
          const distanceToBed = Math.sqrt(
            Math.pow(playerPos.x - bedPosition.x, 2) + 
            Math.pow(playerPos.z - bedPosition.z, 2)
          );
          distanceToObject = Math.min(distance, distanceToBed);
          // If close enough to bed (within 1.8 units) AND on the LEFT side (x < -1.0), trigger immediately
          // x < -1.0 ensures player is clearly on left side, away from cake table at x: 0
          const isOnLeftSide = playerPos.x < -1.0; // Left side of bed (away from cake table)
          if (distanceToBed < 1.8 && isOnLeftSide) {
            console.log('[StoryFlow] Close enough to bed on LEFT side (distance:', distanceToBed, ', x:', playerPos.x, '), triggering interaction immediately');
            clearInterval(checkInterval);
            (window as any).autoWalkActive = false;
            setTimeout(onComplete, 300);
            return;
          }
        }
        
        // Check if player is stuck (not moving closer)
        if (Math.abs(distanceToObject - lastDistance) < 0.05) {
          stuckCount++;
        } else {
          stuckCount = 0;
        }
        lastDistance = distanceToObject;
        
        // If close enough (within 1.2 units) or stuck close enough, trigger interaction
        // For bed, also check if player is on LEFT side
        let closeEnough = targetType === 'lily' ? distanceToObject < 2.0 : 
                           targetType === 'bed' ? distanceToObject < 2.0 : 
                           distanceToObject < 1.2;
        
        // For bed, must be on LEFT side (x < -1.0) to be considered "close enough"
        if (targetType === 'bed' && closeEnough) {
          const isOnLeftSide = playerPos.x < -1.0;
          if (!isOnLeftSide) {
            closeEnough = false; // Not close enough if not on left side
            console.log('[StoryFlow] Player close to bed but NOT on left side (x:', playerPos.x, '), continuing auto-walk...');
          }
        }
        
        if (!autoWalkActive || closeEnough || (stuckCount > 10 && distanceToObject < 2.0 && (targetType !== 'bed' || playerPos.x < -1.0))) {
          console.log('[StoryFlow] Auto-walk completed, distance:', distanceToObject, 'stuckCount:', stuckCount, 'targetType:', targetType, 'player x:', playerPos.x);
          clearInterval(checkInterval);
          (window as any).autoWalkActive = false; // Ensure auto-walk is stopped
          setTimeout(onComplete, 300);
        } else if (checkCount >= maxChecks) {
          console.warn('[StoryFlow] Auto-walk timeout, forcing completion. Final distance:', distanceToObject, 'Player pos:', playerPos, 'Target:', target);
          clearInterval(checkInterval);
          (window as any).autoWalkActive = false;
          
          // For bed, must be on LEFT side even if timeout
          if (targetType === 'bed') {
            const isOnLeftSide = playerPos.x < -1.0;
            if (isOnLeftSide && distanceToObject < 2.0) {
              console.log('[StoryFlow] Close enough to bed on LEFT side despite timeout, proceeding with interaction');
              setTimeout(onComplete, 300);
            } else {
              console.warn('[StoryFlow] Timeout but player NOT on left side (x:', playerPos.x, '), forcing interaction anyway');
              setTimeout(onComplete, 300);
            }
          } else {
            // If stuck but close enough (within 2.0 units), proceed anyway
            if (distanceToObject < 2.0) {
              console.log('[StoryFlow] Close enough despite timeout, proceeding with interaction');
              setTimeout(onComplete, 300);
            } else {
              // Too far, but proceed anyway to avoid getting stuck
              console.warn('[StoryFlow] Too far from target, proceeding anyway to avoid stuck');
              setTimeout(onComplete, 300);
            }
          }
        }
      }, 100);
    } else {
      console.warn('[StoryFlow] Player not found, skipping auto-walk');
      setTimeout(onComplete, 1000);
    }
  }

  // Trigger interaction based on target type
  private triggerInteraction(targetType: string) {
    switch (targetType) {
      case 'letter':
        this.interactLetter();
        break;
      case 'tv':
        this.interactTV();
        break;
      case 'lily':
        this.interactLily();
        break;
      case 'cake':
        this.interactCake();
        break;
      case 'bed':
        this.interactBed();
        break;
      case 'gifts':
        this.interactGifts();
        break;
    }
  }

  // Interaction 1: Letter
  private interactLetter() {
    console.log('[StoryFlow] interactLetter called');
    
    // Dialog pertama: Giva melihat surat
    const firstMessages: DialogMessage[] = [
      {
        speaker: 'Giva',
        text: 'Hmm... surat ini buat aku ya?'
      },
      {
        speaker: 'Erbe',
        text: 'Buka aja~'
      }
    ];
    
    this.startDialogWithAutoAdvance(firstMessages, () => {
      console.log('[StoryFlow] First letter dialog completed, showing letter content...');
      
      // Show letter content with handwriting animation
      // Callback akan dipanggil ketika surat diclose (baik manual atau auto-close)
      this.showLetterContent(() => {
        console.log('[StoryFlow] Letter closed, showing afterMessages immediately...');
        
        // Langsung tampilkan dialog selanjutnya setelah surat diclose
        const afterMessages: DialogMessage[] = [
          {
            speaker: 'Giva',
            text: '...aku... speechless 😭💕'
          },
          {
            speaker: 'Erbe',
            text: 'Hehe, baru mulai aja udah nangis, nanti kamu belum lihat TV-nya lho~'
          }
        ];
        
        this.startDialogWithAutoAdvance(afterMessages, () => {
          console.log('[StoryFlow] After letter dialog completed, moving to next interaction...');
          this.currentSequenceIndex++;
          this.startInteractionSequence();
        });
      });
    });
  }

  // Show letter content with handwriting animation
  private showLetterContent(onClose?: () => void) {
    console.log('[StoryFlow] showLetterContent called');
    
    // Set isReadingLetter to true when letter opens
    if ((window as any).setIsReadingLetter) {
      (window as any).setIsReadingLetter(true);
    }
    
    // Create letter content modal/overlay with NewGamePage style background
    const letterOverlay = document.createElement('div');
    letterOverlay.setAttribute('data-letter-overlay', 'true');
    letterOverlay.style.position = 'fixed';
    letterOverlay.style.top = '0';
    letterOverlay.style.left = '0';
    letterOverlay.style.width = '100%';
    letterOverlay.style.height = '100%';
    letterOverlay.style.background = 'linear-gradient(to bottom, #FFE5E5, #FFD6E5)';
    letterOverlay.style.zIndex = '3000';
    letterOverlay.style.display = 'flex';
    letterOverlay.style.alignItems = 'center';
    letterOverlay.style.justifyContent = 'center';
    letterOverlay.style.pointerEvents = 'auto';
    letterOverlay.style.overflow = 'hidden';
    
    // Add decorative elements like NewGamePage
    const decorativeContainer = document.createElement('div');
    decorativeContainer.style.position = 'absolute';
    decorativeContainer.style.inset = '0';
    decorativeContainer.style.pointerEvents = 'none';
    decorativeContainer.style.overflow = 'hidden';
    
    // Shooting star - top left
    const shootingStar = document.createElement('div');
    shootingStar.style.position = 'absolute';
    shootingStar.style.top = '40px';
    shootingStar.style.left = '40px';
    shootingStar.style.transform = 'rotate(-45deg)';
    shootingStar.innerHTML = `
      <div style="color: white; font-size: 24px;">⭐</div>
      <div style="position: absolute; top: 8px; left: 8px; width: 32px; height: 2px; background: white; opacity: 0.6; transform: rotate(45deg);"></div>
      <div style="position: absolute; top: 4px; left: 4px; width: 8px; height: 8px; background: white; border-radius: 50%; opacity: 0.4;"></div>
      <div style="position: absolute; top: 12px; left: 12px; width: 4px; height: 4px; background: white; border-radius: 50%; opacity: 0.5;"></div>
    `;
    decorativeContainer.appendChild(shootingStar);
    
    // Heart - top right
    const heartTopRight = document.createElement('div');
    heartTopRight.style.position = 'absolute';
    heartTopRight.style.top = '48px';
    heartTopRight.style.right = '64px';
    heartTopRight.style.fontSize = '20px';
    heartTopRight.textContent = '💖';
    heartTopRight.style.color = 'rgba(255, 192, 203, 0.8)';
    decorativeContainer.appendChild(heartTopRight);
    
    // Sparkle - mid left
    const sparkle = document.createElement('div');
    sparkle.style.position = 'absolute';
    sparkle.style.top = '33%';
    sparkle.style.left = '48px';
    sparkle.style.fontSize = '14px';
    sparkle.textContent = '✨';
    sparkle.style.color = 'white';
    sparkle.style.opacity = '0.7';
    decorativeContainer.appendChild(sparkle);
    
    // Glowing heart - mid right
    const glowingHeart = document.createElement('div');
    glowingHeart.style.position = 'absolute';
    glowingHeart.style.top = '50%';
    glowingHeart.style.right = '80px';
    glowingHeart.style.fontSize = '18px';
    glowingHeart.textContent = '💕';
    glowingHeart.style.color = 'rgba(255, 182, 193, 0.8)';
    glowingHeart.style.filter = 'drop-shadow(0 0 4px rgba(255, 182, 193, 0.6))';
    decorativeContainer.appendChild(glowingHeart);
    
    // Petals scattered
    for (let i = 0; i < 8; i++) {
      const petal = document.createElement('div');
      petal.style.position = 'absolute';
      petal.style.left = `${10 + Math.random() * 80}%`;
      petal.style.top = `${10 + Math.random() * 80}%`;
      petal.style.width = `${8 + Math.random() * 12}px`;
      petal.style.height = `${8 + Math.random() * 12}px`;
      petal.style.borderRadius = '50%';
      petal.style.opacity = '0.4';
      petal.style.background = 'linear-gradient(135deg, #FFF5E6, #FFE5E5)';
      petal.style.animation = `float ${15 + Math.random() * 10}s infinite ease-in-out`;
      petal.style.animationDelay = `${Math.random() * 5}s`;
      decorativeContainer.appendChild(petal);
    }
    
    // Small dots
    for (let i = 0; i < 5; i++) {
      const dot = document.createElement('div');
      dot.style.position = 'absolute';
      dot.style.left = `${Math.random() * 100}%`;
      dot.style.top = `${Math.random() * 100}%`;
      dot.style.width = '4px';
      dot.style.height = '4px';
      dot.style.background = 'white';
      dot.style.borderRadius = '50%';
      dot.style.opacity = '0.3';
      decorativeContainer.appendChild(dot);
    }
    
    // Add float animation style
    const style = document.createElement('style');
    style.textContent = `
      @keyframes float {
        0%, 100% {
          transform: translateY(0) rotate(0deg);
        }
        50% {
          transform: translateY(-20px) rotate(180deg);
        }
      }
    `;
    decorativeContainer.appendChild(style);
    
    letterOverlay.appendChild(decorativeContainer);
    
    // Letter paper - with better contrast for NewGamePage style background
    const letterPaper = document.createElement('div');
    letterPaper.style.backgroundColor = '#FFFFFF';
    letterPaper.style.padding = '40px';
    letterPaper.style.borderRadius = '15px';
    letterPaper.style.maxWidth = '500px';
    letterPaper.style.width = '90%';
    letterPaper.style.maxHeight = '80vh'; // Batas tinggi seperti dialog
    letterPaper.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(255, 182, 193, 0.1)';
    letterPaper.style.position = 'relative';
    letterPaper.style.display = 'flex';
    letterPaper.style.flexDirection = 'column';
    letterPaper.style.overflow = 'hidden'; // Prevent letterPaper itself from scrolling
    letterPaper.style.zIndex = '1'; // Ensure it's above decorative elements
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.textContent = '✕';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.width = '35px';
    closeButton.style.height = '35px';
    closeButton.style.borderRadius = '50%';
    closeButton.style.border = 'none';
    closeButton.style.backgroundColor = '#ff4444';
    closeButton.style.color = 'white';
    closeButton.style.fontSize = '20px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.display = 'flex';
    closeButton.style.alignItems = 'center';
    closeButton.style.justifyContent = 'center';
    closeButton.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
    closeButton.style.transition = 'background-color 0.2s';
    closeButton.onmouseover = () => { closeButton.style.backgroundColor = '#cc0000'; };
    closeButton.onmouseout = () => { closeButton.style.backgroundColor = '#ff4444'; };
    closeButton.onclick = () => {
      letterOverlay.style.opacity = '0';
      letterOverlay.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        if (letterOverlay.parentNode) {
          document.body.removeChild(letterOverlay);
        }
      }, 300);
    };
    letterPaper.appendChild(closeButton);
    
    // Letter text container (scrollable, seperti dialog)
    const letterTextContainer = document.createElement('div');
    letterTextContainer.style.flex = '1';
    letterTextContainer.style.overflowY = 'auto';
    letterTextContainer.style.overflowX = 'hidden';
    letterTextContainer.style.minHeight = '200px';
    letterTextContainer.style.maxHeight = 'calc(80vh - 100px)'; // Max height dengan padding untuk close button
    letterTextContainer.style.paddingTop = '40px';
    letterTextContainer.style.paddingBottom = '20px';
    letterTextContainer.style.scrollBehavior = 'auto';
    (letterTextContainer.style as any).webkitOverflowScrolling = 'touch'; // iOS smooth scroll
    letterTextContainer.style.touchAction = 'pan-y';
    letterTextContainer.style.willChange = 'scroll-position';
    letterTextContainer.style.transform = 'translateZ(0)';
    letterPaper.appendChild(letterTextContainer);
    
    // Letter text (with typewriter effect)
    const letterText = document.createElement('div');
    letterText.style.fontSize = '18px';
    letterText.style.lineHeight = '1.8';
    letterText.style.color = '#333';
    letterText.style.fontFamily = 'serif';
    letterText.style.whiteSpace = 'pre-wrap'; // CRITICAL: preserve newlines and wrap text
    letterTextContainer.appendChild(letterText);
    
    const fullLetterText = `Alo ayanggg,
Kamu lagi sakit yah? Lagi sariawan ya, maaf ya kalo aku malah ga memperbaiki suasana, tapi malah bikin kamu tambah badmood, aku beliin degirol karena itu yang paling aman
Berharap kamu lekas sembuh ayang biar kita bisa happy bareng, get well soon :)
Btw, selamat ulang tahun ayangggkuuu, ini aku buat dengan keisengan dan waktu yang sangat minim, jadi maapin ya kalo grafiknya kek one for all wkwk
Dannn...
Selamat bertambah level dalam kehidupan kamu, semoga tambah dewasa dalam mengelola semuanya
Semoga semua yang kamu harapkan dapat segera terkabul, semoga panjang umur bareng aku dan kuat dalam menjalani hari-hari entah apapun yang terjadi
Luvyuu ayang, tetap hidup dan sehat terus sama aku selamanya, semoga kita bisa menikah di tahun depan, luvyuuuu ayang, muah muah :3

— Erbe 💖`;
    
    // Auto-scroll management - aktif saat typing, mati setelah selesai (seperti dialog)
    let letterAutoScrollInterval: number | null = null;
    
    // Typewriter effect
    let currentIndex = 0;
    let typeInterval: number | null = null;
    const startTypewriter = () => {
      // Start auto-scroll saat typing dimulai
      if (letterAutoScrollInterval === null) {
        letterAutoScrollInterval = window.setInterval(() => {
          // Auto-scroll ke bottom saat typing
          const maxScrollTop = letterTextContainer.scrollHeight - letterTextContainer.clientHeight;
          if (maxScrollTop > 0) {
            letterTextContainer.scrollTop = letterTextContainer.scrollHeight;
          }
        }, 50); // Update setiap 50ms untuk smooth auto-scroll
      }
      
      typeInterval = window.setInterval(() => {
        if (currentIndex < fullLetterText.length) {
          letterText.textContent = fullLetterText.slice(0, currentIndex + 1);
          currentIndex++;
        } else {
          // Text selesai - matikan auto-scroll
          if (typeInterval) clearInterval(typeInterval);
          if (letterAutoScrollInterval !== null) {
            clearInterval(letterAutoScrollInterval);
            letterAutoScrollInterval = null;
          }
        }
      }, 50); // 50ms per character
    };
    
    startTypewriter();
    
    letterOverlay.appendChild(letterPaper);
    document.body.appendChild(letterOverlay);
    
    // Function to close letter and call callback
    const closeLetter = () => {
      if (typeInterval) clearInterval(typeInterval);
      letterOverlay.style.opacity = '0';
      letterOverlay.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        if (letterOverlay.parentNode) {
          document.body.removeChild(letterOverlay);
        }
        // Set isReadingLetter to false when letter closes
        if ((window as any).setIsReadingLetter) {
          (window as any).setIsReadingLetter(false);
        }
        // IMPORTANT: Call onClose callback immediately after closing
        if (onClose) {
          console.log('[StoryFlow] Letter closed, calling onClose callback');
          onClose();
        }
      }, 300);
    };
    
    // Surat hanya bisa di-close dengan tombol close, tidak ada auto-close
    closeButton.onclick = () => {
      closeLetter();
    };
  }

  // Setup dialog untuk setiap slide TV
  // Menggunakan konfigurasi dari tvSlideshowConfig.ts
  private setupTVSlideDialogs() {
    this.tvSlideDialogs = tvSlideshowConfig.map(item => item.dialogs);
  }

  // Setup callback untuk TV slide change
  public setupTVSlideChangeCallback() {
    const setup = (window as any).setupRef;
    if (setup && setup.scene) {
      const tv = setup.scene.children.find((child: any) => child.userData && child.userData.type === 'tv');
      if (tv && tv.userData.slideshow && tv.userData.slideshow.setOnSlideChange) {
        // Setup callback untuk setiap perubahan slide
        tv.userData.slideshow.setOnSlideChange((index: number, item: MediaItem) => {
          console.log('[StoryFlow] TV slide changed to index:', index);
          this.showTVSlideDialog(index);
        });
        
        // IMPORTANT: Trigger dialog for first slide (index 0) immediately after setting up callback
        // This ensures dialog appears when slideshow first opens
        const currentIndex = tv.userData.slideshow.getCurrentIndex();
        console.log('[StoryFlow] Setup callback complete, current slide index:', currentIndex);
        // Don't trigger here - will be triggered when slideshow opens
      }
    }
  }

  // Tampilkan dialog untuk slide tertentu (public untuk dipanggil dari luar)
  public showTVSlideDialog(slideIndex: number) {
    // Skip jika dialog sedang ditampilkan untuk slide lain
    if (this.currentTVSlideDialog !== null && this.currentTVSlideDialog === slideIndex) {
      return; // Dialog sudah ditampilkan untuk slide ini
    }

    // Clear pending advance dan reset flag ketika dialog baru dimulai
    (window as any).pendingTVSlideAdvance = null;
    this.tvSlideDialogJustCompleted = false;

    // Hapus dialog sebelumnya jika ada
    if (this.currentTVSlideDialog !== null) {
      // Dialog akan di-skip otomatis ketika slide berubah
      if ((window as any).dialogUIRef) {
        (window as any).dialogUIRef.hide();
      }
    }

    // Cek apakah ada dialog untuk slide ini
    if (slideIndex >= 0 && slideIndex < this.tvSlideDialogs.length) {
      const dialogs = this.tvSlideDialogs[slideIndex];
      if (dialogs && dialogs.length > 0) {
        this.currentTVSlideDialog = slideIndex;
        
        // Tampilkan dialog (bisa di-skip)
        // Store the slideIndex in a variable that won't change in the closure
        const currentSlideIndex = slideIndex;
        this.dialogSystem.startDialog(dialogs, () => {
          // Dialog selesai, set flag bahwa TV slide dialog baru saja selesai
          this.tvSlideDialogJustCompleted = true;
          this.currentTVSlideDialog = null;
          
          // IMPORTANT: Set pending advance untuk next slide, akan dipanggil ketika user tap lagi
          // Only if slideshow is still open and there are more slides
          const isTVOpen = (window as any).isTVInteractionOpen;
          if (isTVOpen) {
            // Get current slide index from slideshow (most reliable)
            const setup = (window as any).setupRef;
            let actualCurrentIndex = currentSlideIndex;
            if (setup && setup.scene) {
              const tv = setup.scene.children.find((child: any) => child.userData && child.userData.type === 'tv');
              if (tv && tv.userData.slideshow) {
                actualCurrentIndex = tv.userData.slideshow.getCurrentIndex();
              }
            }
            
            // Check if there are more slides
            const totalSlides = this.tvSlideDialogs.length;
            if (actualCurrentIndex < totalSlides - 1) {
              const nextSlideIndex = actualCurrentIndex + 1;
              console.log('[StoryFlow] Dialog completed for slide', actualCurrentIndex, ', will advance to next slide (', nextSlideIndex, ') on next tap...');
              
              // Set pending advance - akan dipanggil ketika user tap lagi di dialog system
              // IMPORTANT: Set this even if dialog is still "active" (showing last message)
              // The advance() method will check if dialog is not active before processing
              (window as any).pendingTVSlideAdvance = nextSlideIndex;
            } else {
              console.log('[StoryFlow] Dialog completed for last slide (', actualCurrentIndex, '), no more slides - dialog will close on next tap');
              this.tvSlideDialogJustCompleted = false; // Reset flag if no more slides
              (window as any).pendingTVSlideAdvance = null; // Clear pending advance
              // IMPORTANT: Don't trigger afterMessages here - it will only be triggered when slideshow is closed
            }
          } else {
            // TV is closed, reset flag
            this.tvSlideDialogJustCompleted = false;
            (window as any).pendingTVSlideAdvance = null; // Clear pending advance
          }
        });
      }
    }
  }

  // Interaction 2: TV
  private interactTV() {
    // Dialog pertama sebelum slideshow
    const firstMessages: DialogMessage[] = [
      {
        speaker: 'Erbe',
        text: 'Di layar ini bakal ada sedikit lalala lilili dari kita, kamu bakal liat kesan kesan aku selama ini sayang wkwk, meskipun hal ini harusnya adanya di anniv, cuman gapapa masukin sini aja yah wkwk'
      }
    ];
    
    this.startDialogWithAutoAdvance(firstMessages, () => {
      // Setup callback untuk slide change sebelum membuka slideshow
      this.setupTVSlideChangeCallback();
      
      // Auto-open TV slideshow setelah dialog pertama
      console.log('[StoryFlow] Opening TV slideshow automatically...');
      
      // Wait for slideshow to close, then continue with remaining dialogs
      // IMPORTANT: Setup wait BEFORE opening slideshow to ensure callback is ready
      this.waitForTVSlideshowClose(() => {
        console.log('[StoryFlow] TV slideshow closed, showing afterMessages...');
        // Reset current slide dialog
        this.currentTVSlideDialog = null;
        
        const afterMessages: DialogMessage[] = [
          {
            speaker: 'Giva',
            text: 'Haha, apa apaan ini 😂'
          },
          {
            speaker: 'Erbe',
            text: 'Absurd dan cringe sih, tapi yang penting, mari tambah memori kita di tv plasma 99 inch ini ayang 😆'
          },
          
        ];
        
        this.startDialogWithAutoAdvance(afterMessages, () => {
          this.currentSequenceIndex++;
          this.startInteractionSequence();
        });
      });
      
      // Open slideshow AFTER setting up wait callback
      if ((window as any).setTVInteraction) {
        (window as any).setTVInteraction(true);
        
        // IMPORTANT: Trigger dialog for first slide (index 0) after slideshow opens
        // Use setTimeout to ensure slideshow is fully opened
        setTimeout(() => {
          console.log('[StoryFlow] Triggering dialog for first slide (index 0)...');
          this.showTVSlideDialog(0);
        }, 500); // Delay to ensure slideshow modal is fully rendered
      } else {
        // Fallback: try to trigger TV interaction
        const setup = (window as any).setupRef;
        if (setup && setup.scene) {
          const tv = setup.scene.children.find((child: any) => child.userData && child.userData.type === 'tv');
          if (tv && tv.userData.slideshow) {
            tv.userData.slideshow.play();
            // Also trigger dialog for first slide
            setTimeout(() => {
              this.showTVSlideDialog(0);
            }, 500);
          }
        }
      }
    });
  }

  // Wait for TV slideshow to close
  private waitForTVSlideshowClose(onClose: () => void) {
    console.log('[StoryFlow] Waiting for TV slideshow to close...');
    
    // Store callback on window for MiniGamePage to call when slideshow closes
    // IMPORTANT: Clear any existing callback first to prevent double calls
    if ((window as any).onTVSlideshowClose) {
      console.warn('[StoryFlow] Previous onTVSlideshowClose callback exists, replacing it');
    }
    (window as any).onTVSlideshowClose = onClose;
    
    // REMOVED: Check interval fallback that was causing false positives
    // The callback will be called directly from MiniGamePage when user closes slideshow
    // This prevents afterMessages from appearing during prev/next navigation
  }

  // Interaction 3: Lily
  private interactLily() {
    // Adjust camera to focus on lily (so it's visible, not blocked by Giva's back or objects)
    this.focusCameraOnLily();
    
    // Trigger lily petals effect
    if ((window as any).triggerLilyPetals) {
      (window as any).triggerLilyPetals();
    }
    
    const messages: DialogMessage[] = [
      {
        speaker: 'Giva',
        text: 'Cantiknya bunga lily-nya...'
      },
      {
        speaker: 'Erbe',
        text: 'Tahu gak kenapa aku pilih lily? Karena artinya ketulusan, kemurnian dan ketenangan. Aku berharap kisah kita seperti lily, yang melambangkan ketulusan dan ketenangan tanpa drama. Artinya: Bersama kamu, aku merasa aman dan tenang.'

      }
    ];
    
    this.startDialogWithAutoAdvance(messages, () => {
      // Show lily meaning overlay
      const interiorObjectsResult = (window as any).interiorObjectsResult;
      if (interiorObjectsResult && interiorObjectsResult.lilyBouquet && interiorObjectsResult.lilyBouquet.showMeaning) {
        // Pass callback to continue flow after close
        interiorObjectsResult.lilyBouquet.showMeaning(() => {
          // After overlay closed, continue with next dialog
          const afterMessages: DialogMessage[] = [
            {
              speaker: 'Giva',
              text: '🥺 ...ih, bisa aja kamu...'
            }
          ];
          
          this.startDialogWithAutoAdvance(afterMessages, () => {
            this.currentSequenceIndex++;
            this.startInteractionSequence();
          });
        });
      } else {
        // Fallback: continue without overlay
        const afterMessages: DialogMessage[] = [
          {
            speaker: 'Giva',
            text: '🥺 ...ih, bisa aja kamu...'
          }
        ];
        
        this.startDialogWithAutoAdvance(afterMessages, () => {
          this.currentSequenceIndex++;
          this.startInteractionSequence();
        });
      }
    });
  }

  // Focus camera on lily so it's clearly visible
  private focusCameraOnLily() {
    const cameraRef = (window as any).cameraRef;
    const camera = cameraRef?.current || cameraRef;
    const playerRef = (window as any).playerRef;
    const player = playerRef?.current || playerRef;
    
    if (!camera) return;
    
    // Lily position: { x: 6, y: 0.55, z: 0 }
    const lilyPosition = { x: 6, y: 0.55, z: 0 };
    
    // Position camera to the left and slightly in front of lily
    // This ensures lily is visible and not blocked by Giva (who is in front of lily)
    // Camera will be at an angle from the left side, looking at lily
    const cameraOffsetX = -2.5; // To the left of lily
    const cameraOffsetY = 1.0;  // Slightly above lily
    const cameraOffsetZ = 1.5;  // In front of lily (so we see it from front-left angle)
    
    const cameraX = lilyPosition.x + cameraOffsetX;
    const cameraY = lilyPosition.y + cameraOffsetY;
    const cameraZ = lilyPosition.z + cameraOffsetZ;
    
    // Set camera position
    camera.position.set(cameraX, cameraY, cameraZ);
    
    // Look at lily (slightly above center to see the flowers better)
    camera.lookAt(lilyPosition.x, lilyPosition.y + 0.3, lilyPosition.z);
    
    // Update camera angle ref to match this view (so camera doesn't jump back)
    const cameraAngleRef = (window as any).cameraAngleRef;
    if (cameraAngleRef && player) {
      // Calculate angles from player to camera
      const dx = cameraX - player.position.x;
      const dz = cameraZ - player.position.z;
      const dy = cameraY - player.position.y;
      
      const horizontalAngle = Math.atan2(dx, dz);
      const distance = Math.sqrt(dx * dx + dz * dz);
      const verticalAngle = Math.asin(dy / Math.sqrt(dx * dx + dy * dy + dz * dz));
      
      cameraAngleRef.current.horizontal = horizontalAngle;
      cameraAngleRef.current.vertical = verticalAngle;
      cameraAngleRef.current.distance = distance;
    }
    
    console.log('[StoryFlow] Camera focused on lily at', lilyPosition);
  }

  // Make player face the cake
  private facePlayerToCake() {
    const playerRef = (window as any).playerRef;
    const player = playerRef?.current || playerRef;
    
    if (!player) return;
    
    // Cake position: { x: -0.8, y: 0.45, z: 2 }
    const cakePosition = { x: -0.8, y: 0.45, z: 2 };
    
    // Calculate angle from player to cake
    const dx = cakePosition.x - player.position.x;
    const dz = cakePosition.z - player.position.z;
    const angle = Math.atan2(dx, dz);
    
    // Rotate player to face cake
    player.rotation.y = angle;
    
    console.log('[StoryFlow] Player rotated to face cake, angle:', angle);
  }

  // Focus camera on cake so it's clearly visible
  private focusCameraOnCake() {
    const cameraRef = (window as any).cameraRef;
    const camera = cameraRef?.current || cameraRef;
    const playerRef = (window as any).playerRef;
    const player = playerRef?.current || playerRef;
    
    if (!camera) return;
    
    // Cake position: { x: -0.8, y: 0.45, z: 2 } (moved to left side of table)
    const cakePosition = { x: -0.8, y: 0.45, z: 2 };
    
    // Position camera to the front-left of cake, looking at cake
    // This ensures cake is visible and Giva (who is in front of cake) doesn't block it
    const cameraOffsetX = -2.3; // To the left of cake (cake is now at x: -0.8)
    const cameraOffsetY = 1.2;  // Above cake to see it clearly
    const cameraOffsetZ = -1.0;  // In front of cake (negative z = closer to camera)
    
    const cameraX = cakePosition.x + cameraOffsetX;
    const cameraY = cakePosition.y + cameraOffsetY;
    const cameraZ = cakePosition.z + cameraOffsetZ;
    
    // Set camera position
    camera.position.set(cameraX, cameraY, cameraZ);
    
    // Look at cake (slightly above center to see candles better)
    camera.lookAt(cakePosition.x, cakePosition.y + 0.2, cakePosition.z);
    
    // Update camera angle ref to match this view (so camera doesn't jump back)
    const cameraAngleRef = (window as any).cameraAngleRef;
    if (cameraAngleRef && player) {
      // Calculate angles from player to camera
      const dx = cameraX - player.position.x;
      const dz = cameraZ - player.position.z;
      const dy = cameraY - player.position.y;
      
      const horizontalAngle = Math.atan2(dx, dz);
      const distance = Math.sqrt(dx * dx + dz * dz);
      const verticalAngle = Math.asin(dy / Math.sqrt(dx * dx + dy * dy + dz * dz));
      
      cameraAngleRef.current.horizontal = horizontalAngle;
      cameraAngleRef.current.vertical = verticalAngle;
      cameraAngleRef.current.distance = distance;
    }
    
    console.log('[StoryFlow] Camera focused on cake at', cakePosition);
  }

  // Interaction 4: Cake
  private interactCake() {
    // Make Giva face the cake before dialog
    this.facePlayerToCake();
    
    // Adjust camera to focus on cake (so it's visible, not blocked by Giva)
    this.focusCameraOnCake();
    
    const messages: DialogMessage[] = [
      {
        speaker: 'Erbe',
        text: 'Oke, sekarang... saatnya tiup lilinnya 🎂'
      }
    ];
    
    this.startDialogWithAutoAdvance(messages, () => {
      // Show blow candle button/UI
      this.showBlowCandleUI(() => {
        // After candle blown
        const afterMessages: DialogMessage[] = [
          {
            speaker: 'Giva',
            text: 'Hehehe lucu banget efeknya 😍'
          },
          {
            speaker: 'Erbe',
            text: 'Coba deh... ucapin harapanmu dalam hati. Aku gak mau tahu, tapi aku janji bakal bantu kamu wujudin.'
          },
          {
            speaker: 'Giva',
            text: '…Udah. Tapi boleh aku bilang satu hal aja?'
          },
          {
            speaker: 'Erbe',
            text: 'Apa tuh?'
          },
          {
            speaker: 'Giva',
            text: 'Aku harap… kita gak berubah, ya. Kayak sekarang ini.'
          },
          {
            speaker: 'Erbe',
            text: 'Deal. Gak bakal berubah. Kalau berubah pun, semoga berubah ke arah yang lebih baik dan tambah deket 💖'
          }
        ];
        
        this.startDialogWithAutoAdvance(afterMessages, () => {
          this.currentSequenceIndex++;
          this.startInteractionSequence();
        });
      });
    });
  }

  // Show UI for blowing candles
  private showBlowCandleUI(onBlown: () => void) {
    // Create overlay with blow button
    const overlay = document.createElement('div');
    overlay.setAttribute('data-cake-overlay', 'true');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.3)';
    overlay.style.zIndex = '2000';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.pointerEvents = 'auto';
    
    // Blow button
    const blowButton = document.createElement('button');
    blowButton.textContent = '🎂 Tiup Lilin';
    blowButton.style.padding = '20px 40px';
    blowButton.style.fontSize = '24px';
    blowButton.style.fontWeight = 'bold';
    blowButton.style.color = '#FFFFFF';
    blowButton.style.backgroundColor = '#FF6B9D';
    blowButton.style.border = 'none';
    blowButton.style.borderRadius = '50px';
    blowButton.style.cursor = 'pointer';
    blowButton.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    blowButton.style.transition = 'transform 0.2s, background-color 0.2s';
    blowButton.style.fontFamily = 'Arial, sans-serif';
    
    blowButton.onmouseover = () => {
      blowButton.style.transform = 'scale(1.1)';
      blowButton.style.backgroundColor = '#FF4D7A';
    };
    blowButton.onmouseout = () => {
      blowButton.style.transform = 'scale(1)';
      blowButton.style.backgroundColor = '#FF6B9D';
    };
    
    blowButton.onclick = () => {
      // Blow out candles
      if ((window as any).blowOutCandles) {
        (window as any).blowOutCandles();
      }
      
      // Add confetti/hearts effect (screen overlay)
      this.createCandleBlowEffect();
      
      // Add 3D love effect on cake
      this.createCakeLoveEffect();
      
      // IMPORTANT: Make overlay non-interactive and lower z-index immediately so dialog can appear on top
      overlay.style.pointerEvents = 'none';
      overlay.style.zIndex = '500'; // Lower than dialog (1000) so dialog appears on top
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.2s';
      
      // IMPORTANT: Call onBlown immediately to show dialog without delay
      // Don't wait for overlay fade out animation
      onBlown();
      
      // Remove overlay after fade out (in background, doesn't block dialog)
      setTimeout(() => {
        if (overlay.parentNode) {
          document.body.removeChild(overlay);
        }
        // Restore joystick/controls
        const joystickElements = document.querySelectorAll('[data-hidden-by-overlay="true"]');
        joystickElements.forEach((el: any) => {
          if (el) {
            el.style.display = '';
            el.removeAttribute('data-hidden-by-overlay');
          }
        });
      }, 200);
    };
    
    overlay.appendChild(blowButton);
    document.body.appendChild(overlay);
    
    // Hide joystick/controls when overlay is active
    const joystickElements = document.querySelectorAll('[data-joystick], .analog-stick-container, [class*="joystick"]');
    joystickElements.forEach((el: any) => {
      if (el) {
        el.style.display = 'none';
        el.setAttribute('data-hidden-by-overlay', 'true');
      }
    });
  }

  // Create visual effect when candles are blown (screen overlay)
  private createCandleBlowEffect() {
    // Create floating hearts/confetti
    const heartCount = 15;
    const hearts: HTMLElement[] = [];
    
    for (let i = 0; i < heartCount; i++) {
      const heart = document.createElement('div');
      heart.textContent = '💕';
      heart.style.position = 'fixed';
      heart.style.fontSize = '30px';
      heart.style.pointerEvents = 'none';
      heart.style.zIndex = '2500';
      heart.style.left = `${50 + (Math.random() - 0.5) * 20}%`;
      heart.style.top = `${50 + (Math.random() - 0.5) * 20}%`;
      heart.style.opacity = '0';
      heart.style.transition = 'opacity 0.3s, transform 2s ease-out';
      
      document.body.appendChild(heart);
      hearts.push(heart);
      
      // Animate heart
      setTimeout(() => {
        heart.style.opacity = '1';
        const angle = (Math.random() - 0.5) * Math.PI * 2;
        const distance = 100 + Math.random() * 100;
        heart.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance - 150}px) scale(0)`;
      }, i * 50);
      
      // Remove heart after animation
      setTimeout(() => {
        if (heart.parentNode) {
          document.body.removeChild(heart);
        }
      }, 2000 + i * 50);
    }
  }

  // Create 3D love effect on cake (hearts spreading from cake)
  private createCakeLoveEffect() {
    const setup = (window as any).setupRef;
    const THREE = (window as any).THREE;
    
    if (!setup || !setup.scene || !THREE) {
      console.warn('[StoryFlow] Cannot create cake love effect: missing scene or THREE');
      return;
    }
    
    // Get cake position
    const cakePosition = { x: -0.8, y: 0.45, z: 2 };
    
    // Create heart particles that spread from cake
    const heartCount = 20;
    const hearts: any[] = [];
    
    // Create canvas texture for heart emoji (reusable)
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const context = canvas.getContext('2d');
    if (context) {
      context.font = '96px Arial';
      context.textAlign = 'center';
      context.textBaseline = 'middle';
      context.fillText('💕', 64, 64);
    }
    const heartTexture = new THREE.CanvasTexture(canvas);
    heartTexture.needsUpdate = true;
    
    for (let i = 0; i < heartCount; i++) {
      // Create sprite that always faces camera
      const heartMaterial = new THREE.SpriteMaterial({
        map: heartTexture,
        transparent: true,
        opacity: 0.9,
        color: 0xFFFFFF
      });
      
      const heart = new THREE.Sprite(heartMaterial);
      heart.scale.set(0.15, 0.15, 1); // Size of heart sprite
      
      // Start position: slightly above cake
      const startX = cakePosition.x + (Math.random() - 0.5) * 0.3;
      const startY = cakePosition.y + 0.5 + Math.random() * 0.2;
      const startZ = cakePosition.z + (Math.random() - 0.5) * 0.3;
      
      heart.position.set(startX, startY, startZ);
      heart.userData.startTime = Date.now();
      heart.userData.duration = 2000 + Math.random() * 1000; // 2-3 seconds
      heart.userData.angle = Math.random() * Math.PI * 2;
      heart.userData.distance = 0.5 + Math.random() * 0.8;
      heart.userData.verticalSpeed = 0.1 + Math.random() * 0.15;
      heart.userData.rotationSpeed = (Math.random() - 0.5) * 0.1;
      
      setup.scene.add(heart);
      hearts.push(heart);
    }
    
    // Store hearts for animation loop
    if (!setup.scene.userData.cakeHearts) {
      setup.scene.userData.cakeHearts = [];
    }
    setup.scene.userData.cakeHearts.push(...hearts);
    
    // Animate hearts in the main animation loop
    // The animation will be handled by checking scene.userData.cakeHearts in the main loop
    // For now, use a setTimeout-based animation
    const animateHearts = () => {
      const currentTime = Date.now();
      const heartsToRemove: number[] = [];
      
      hearts.forEach((heart, index) => {
        if (!heart.parent) {
          heartsToRemove.push(index);
          return; // Already removed
        }
        
        const elapsed = currentTime - heart.userData.startTime;
        const progress = elapsed / heart.userData.duration;
        
        if (progress >= 1) {
          // Remove heart
          setup.scene.remove(heart);
          heart.material.dispose();
          if (setup.scene.userData.cakeHearts) {
            const idx = setup.scene.userData.cakeHearts.indexOf(heart);
            if (idx > -1) {
              setup.scene.userData.cakeHearts.splice(idx, 1);
            }
          }
          heartsToRemove.push(index);
          return;
        }
        
        // Spread outward from cake
        const spreadX = Math.cos(heart.userData.angle) * heart.userData.distance * progress;
        const spreadZ = Math.sin(heart.userData.angle) * heart.userData.distance * progress;
        const spreadY = heart.userData.verticalSpeed * progress;
        
        heart.position.x = cakePosition.x + spreadX;
        heart.position.y = cakePosition.y + 0.5 + spreadY;
        heart.position.z = cakePosition.z + spreadZ;
        
        // Fade out
        heart.material.opacity = 0.9 * (1 - progress);
        
        // Rotate sprite
        heart.rotation.z += heart.userData.rotationSpeed;
      });
      
      // Remove hearts that are done (in reverse order to maintain indices)
      heartsToRemove.reverse().forEach(idx => {
        hearts.splice(idx, 1);
      });
      
      if (hearts.length > 0) {
        requestAnimationFrame(animateHearts);
      }
    };
    
    animateHearts();
  }

  // Interaction 5: Bed
  private interactBed() {
    const messages: DialogMessage[] = [
      {
        speaker: 'Giva',
        text: 'Hmm, boleh gak aku rebahan sebentar? Capek banget bahagia hari ini 😴'
      },
      {
        speaker: 'Erbe',
        text: 'Hahaha boleh~ Tapi jangan tidur beneran, nanti kelewat makan kuenya 😆'
      }
    ];
    
    this.startDialogWithAutoAdvance(messages, () => {
      // Start sleep animation
      this.playSleepAnimation(() => {
        // After sleep animation and character exited bed, show final dialog from Erbe
        const finalMessages: DialogMessage[] = [
          {
            speaker: 'Erbe',
            text: 'Selamat pagi~ Mulai sekarang kamu dapat bergerak bebas hehe 😊'
          }
        ];
        
        this.startDialogWithAutoAdvance(finalMessages, () => {
          console.log('[StoryFlow] Final dialog completed, going to free roam...');
          // End cutscene, go to free roam
          this.isCutsceneMode = false;
          this.setState(StoryState.FREE_EXPLORE);
        });
      });
    });
  }

  // Play sleep animation: character walks to bed, lies down on it, screen fades to black, then fades back
  private playSleepAnimation(onComplete: () => void) {
    const playerRef = (window as any).playerRef;
    const player = playerRef?.current || playerRef;
    const cameraRef = (window as any).cameraRef;
    const camera = cameraRef?.current || cameraRef;
    
    if (!player || !camera) {
      console.warn('[StoryFlow] Missing player or camera for sleep animation');
      onComplete();
      return;
    }
    
    // Bed position: center of bed is at x: 0, z: 4, height: 0.4 (mattress top)
    // Step 1: Walk to side of bed (from current position, approach from left side)
    const approachPosition = { x: -1.2, y: 0.5, z: 4 }; // Left side of bed
    const bedCenter = { x: 0, y: 0.5, z: 4 };
    const bedTopHeight = 0.5; // Height of mattress top (0.4 + some margin)
    
    let animationFrameId: number | null = null;
    
    // Phase 1: Walk to approach position (side of bed)
    const walkToBed = () => {
      const currentX = player.position.x;
      const currentZ = player.position.z;
      const dx = approachPosition.x - currentX;
      const dz = approachPosition.z - currentZ;
      const distance = Math.sqrt(dx * dx + dz * dz);
      
      if (distance > 0.15) {
        const speed = 0.12;
        const moveX = (dx / distance) * speed;
        const moveZ = (dz / distance) * speed;
        
        // Check collision before moving
        const playerControlsRef = (window as any).playerControlsRef;
        if (playerControlsRef && playerControlsRef.current) {
          const newPos = {
            x: player.position.x + moveX,
            y: player.position.y,
            z: player.position.z + moveZ
          };
          
          if (!playerControlsRef.current.checkCollision(newPos)) {
            player.position.x = newPos.x;
            player.position.z = newPos.z;
            player.rotation.y = Math.atan2(dx, dz);
          }
        } else {
          player.position.x += moveX;
          player.position.z += moveZ;
          player.rotation.y = Math.atan2(dx, dz);
        }
        
        animationFrameId = requestAnimationFrame(walkToBed);
      } else {
        // Reached approach position, now move to bed center
        player.position.x = approachPosition.x;
        player.position.z = approachPosition.z;
        
        // Phase 2: Move to bed center (on top of mattress)
        setTimeout(() => {
          const moveToCenter = () => {
            const currentX = player.position.x;
            const currentZ = player.position.z;
            const dx = bedCenter.x - currentX;
            const dz = bedCenter.z - currentZ;
            const distance = Math.sqrt(dx * dx + dz * dz);
            
            if (distance > 0.1) {
              const speed = 0.08;
              player.position.x += (dx / distance) * speed;
              player.position.z += (dz / distance) * speed;
              animationFrameId = requestAnimationFrame(moveToCenter);
            } else {
              // Reached bed center, now lie down
              player.position.x = bedCenter.x;
              player.position.z = bedCenter.z;
              player.position.y = bedTopHeight; // Move to bed height
              
              // Rotate to lying position: rotate around X axis to lie on back
              // Use a smooth rotation animation
              let rotationProgress = 0;
              const targetRotationX = Math.PI / 2; // 90 degrees
              const initialRotationX = player.rotation.x;
              
              const lieDown = () => {
                rotationProgress += 0.05;
                if (rotationProgress < 1) {
                  player.rotation.x = initialRotationX + (targetRotationX - initialRotationX) * rotationProgress;
                  animationFrameId = requestAnimationFrame(lieDown);
                } else {
                  // Fully lying down
                  player.rotation.x = targetRotationX;
                  player.rotation.y = Math.PI; // Face away from camera
                  
                  // Step 3: Fade to black
                  setTimeout(() => {
                    this.fadeToBlack(() => {
                      // Step 4: Wait a bit (sleeping)
                      setTimeout(() => {
                        // Step 5: Fade back in
                        this.fadeIn(() => {
                          // Step 6: Stand up (reverse animation)
                          let standUpProgress = 0;
                          const initialY = player.position.y;
                          const targetY = 0.5;
                          const initialRotX = player.rotation.x;
                          
                          const standUp = () => {
                            standUpProgress += 0.05;
                            if (standUpProgress < 1) {
                              player.rotation.x = initialRotX - (initialRotX * standUpProgress);
                              player.position.y = initialY - ((initialY - targetY) * standUpProgress);
                              animationFrameId = requestAnimationFrame(standUp);
                            } else {
                              // Fully standing
                              player.rotation.x = 0;
                              player.position.y = targetY;
                              
                              // Step 7: Walk away from bed - move to position OUTSIDE bed collision box
                              // Bed collision: x: -1.25 to 1.25, z: 3 to 5 (size 2.5 x 2, center at x:0, z:4)
                              // Exit position should be well outside this area
                              const exitPosition = { x: -2.5, y: 0.5, z: 5.5 }; // Far enough from bed to avoid collision
                              const walkAway = () => {
                                const currentX = player.position.x;
                                const currentZ = player.position.z;
                                const dx = exitPosition.x - currentX;
                                const dz = exitPosition.z - currentZ;
                                const distance = Math.sqrt(dx * dx + dz * dz);
                                
                                if (distance > 0.15) {
                                  const speed = 0.12;
                                  // Check collision before moving
                                  const playerControlsRef = (window as any).playerControlsRef;
                                  if (playerControlsRef && playerControlsRef.current) {
                                    const newPos = {
                                      x: player.position.x + (dx / distance) * speed,
                                      y: player.position.y,
                                      z: player.position.z + (dz / distance) * speed
                                    };
                                    
                                    if (!playerControlsRef.current.checkCollision(newPos)) {
                                      player.position.x = newPos.x;
                                      player.position.z = newPos.z;
                                      player.rotation.y = Math.atan2(dx, dz);
                                    }
                                  } else {
                                    player.position.x += (dx / distance) * speed;
                                    player.position.z += (dz / distance) * speed;
                                    player.rotation.y = Math.atan2(dx, dz);
                                  }
                                  animationFrameId = requestAnimationFrame(walkAway);
                                } else {
                                  // Reached exit position - ensure we're outside bed collision
                                  player.position.x = exitPosition.x;
                                  player.position.z = exitPosition.z;
                                  console.log('[StoryFlow] Character exited bed, position:', player.position);
                                  onComplete();
                                }
                              };
                              
                              setTimeout(() => {
                                walkAway();
                              }, 300);
                            }
                          };
                          
                          standUp();
                        });
                      }, 2000); // Sleep for 2 seconds
                    });
                  }, 500); // Wait 0.5s before fading
                }
              };
              
              lieDown();
            }
          };
          
          moveToCenter();
        }, 300);
      }
    };
    
    walkToBed();
  }

  // Fade screen to black
  private fadeToBlack(onComplete: () => void) {
    const fadeOverlay = document.createElement('div');
    fadeOverlay.setAttribute('data-sleep-fade', 'true');
    fadeOverlay.style.position = 'fixed';
    fadeOverlay.style.top = '0';
    fadeOverlay.style.left = '0';
    fadeOverlay.style.width = '100%';
    fadeOverlay.style.height = '100%';
    fadeOverlay.style.backgroundColor = '#000000';
    fadeOverlay.style.zIndex = '5000';
    fadeOverlay.style.opacity = '0';
    fadeOverlay.style.transition = 'opacity 1s ease-in';
    fadeOverlay.style.pointerEvents = 'none';
    document.body.appendChild(fadeOverlay);
    
    // Store reference for later removal
    (window as any).sleepFadeOverlay = fadeOverlay;
    
    // Fade in
    setTimeout(() => {
      fadeOverlay.style.opacity = '1';
    }, 10);
    
    // Call onComplete after fade completes
    setTimeout(() => {
      onComplete();
    }, 1000);
  }

  // Fade screen back in
  private fadeIn(onComplete: () => void) {
    const fadeOverlay = (window as any).sleepFadeOverlay;
    
    if (fadeOverlay) {
      fadeOverlay.style.transition = 'opacity 1s ease-out';
      fadeOverlay.style.opacity = '0';
      
      setTimeout(() => {
        if (fadeOverlay.parentNode) {
          document.body.removeChild(fadeOverlay);
        }
        (window as any).sleepFadeOverlay = null;
        onComplete();
      }, 1000);
    } else {
      // Fallback: try to find by attribute
      const overlays = document.querySelectorAll('[data-sleep-fade="true"]');
      overlays.forEach((overlay: any) => {
        overlay.style.transition = 'opacity 1s ease-out';
        overlay.style.opacity = '0';
        
        setTimeout(() => {
          if (overlay.parentNode) {
            document.body.removeChild(overlay);
          }
        }, 1000);
      });
      
      setTimeout(() => {
        onComplete();
      }, 1000);
    }
  }

  // Interaction 6: Gifts (Coupons)
  private interactGifts() {
    const messages: DialogMessage[] = [
      {
        speaker: 'Giva',
        text: 'Eh... kotak-kotak apa ini, Erbe? 🎁'
      },
      {
        speaker: 'Erbe',
        text: 'Hehe~ itu hadiah terakhir buatmu. Tapi bukan hadiah biasa — di dalamnya ada kupon-kupon kegiatan yang bisa kamu pilih sendiri.'
      },
      {
        speaker: 'Giva',
        text: 'Hah? Kupon? kayak voucher date gitu? 😆'
      },
      {
        speaker: 'Erbe',
        text: 'Kurang lebih~ aku udah pilih satu buat kita, tapi sisanya kamu yang tentuin. Totalnya ada 6 pilihan, dan kamu bisa pilih 3 dari 6 ya. Tapi yang pertama — AYCE Date 🍽️ — udah otomatis aku pilih, gak bisa kamu hapus 😏'
      },
      {
        speaker: 'Giva',
        text: 'Hehe oke deh~ berarti aku tinggal pilih dua lagi dong?'
      },
      {
        speaker: 'Erbe',
        text: 'Yap~ pilih dua yang paling kamu mau lakukan bareng aku 💕'
      }
    ];
    
    this.startDialogWithAutoAdvance(messages, () => {
      // Show coupons UI
      if ((window as any).showCouponsUI) {
        (window as any).showCouponsUI((selectedCoupons: string[]) => {
          // Coupons selected, send WhatsApp
          this.sendCouponsToWhatsApp(selectedCoupons);
        });
      } else {
        // Fallback: continue to free roam
        this.isCutsceneMode = false;
        this.setState(StoryState.FREE_EXPLORE);
      }
    });
  }

  // Send coupons to WhatsApp
  private sendCouponsToWhatsApp(selectedCoupons: string[]) {
    // Import generateWhatsAppMessage dynamically
    import('./couponsUI').then(({ generateWhatsAppMessage }) => {
      const message = generateWhatsAppMessage(selectedCoupons);
      const phoneNumber = config.whatsappNumber; // Ambil dari config
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
      
      // Show completion message
      const messages: DialogMessage[] = [
        {
          speaker: 'Giva',
          text: 'Aku kirim ya hasil pilihanku, biar kamu tahu apa yang harus disiapin 😝'
        }
      ];
      
      this.startDialogWithAutoAdvance(messages, () => {
        // Show sent message
        if ((window as any).showMessageSent) {
          (window as any).showMessageSent('Pesan terkirim 💌\nErbe lagi senyum-senyum sendiri ngebaca pesannya~ 😆');
        }
        
        // IMPORTANT: Continue to next interaction (Bed) instead of going to free roam
        setTimeout(() => {
          console.log('[StoryFlow] Coupons completed, moving to next interaction (Bed)...');
          this.currentSequenceIndex++;
          this.startInteractionSequence();
        }, 2000); // Reduced delay from 3000 to 2000
      });
    });
  }

  // Start dialog with manual advance (user must tap to continue)
  private startDialogWithAutoAdvance(messages: DialogMessage[], onComplete?: () => void) {
    console.log('[StoryFlow] startDialogWithAutoAdvance called with', messages.length, 'messages');
    
    // Start dialog with all messages - user taps to advance through them
    // onComplete will be called when user taps through the last message
    this.dialogSystem.startDialog(messages, () => {
      console.log('[StoryFlow] All dialog messages completed, calling onComplete callback');
      // User tapped through all messages, call onComplete
      if (onComplete) {
        onComplete();
      } else {
        console.warn('[StoryFlow] No onComplete callback provided');
      }
    });
  }

  // Get current state
  getCurrentState(): StoryState {
    return this.currentState;
  }

  // Set state
  private setState(state: StoryState) {
    this.currentState = state;
    if (this.onStateChange) {
      this.onStateChange(state);
    }
  }

  // Legacy methods for backward compatibility
  onEnterInterior() {
    // This is now handled automatically in cutscene mode
    // But keep for backward compatibility
    if (!this.isCutsceneMode) {
      this.setState(StoryState.INTERIOR_ENTRY);
      this.startInteriorScene();
    }
  }

  onCakeInteract() {
    // This is now handled automatically in cutscene mode
    // But keep for backward compatibility
    if (!this.isCutsceneMode && this.currentState === StoryState.INTERIOR_CAKE) {
      // Trigger candle blow out animation
      if ((window as any).blowOutCandles) {
        (window as any).blowOutCandles();
      }
    }
  }
}
