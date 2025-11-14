// Story flow system for birthday celebration - Cutscene Mode

import { DialogSystem, type DialogMessage } from './dialogSystem';
import type { MediaItem } from './tvSlideshow';

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
        text: 'Waaah... lucunya rumahnya 🥺 pastel banget kayak warna kesukaanku~'
      },
      {
        speaker: 'Erbe',
        text: 'Hehehe, pantes kan? Ayo masuk, aku pengen kamu lihat satu-satu.'
      },
      {
        speaker: 'Giva',
        text: 'Wah... ini semua buat aku? 😳'
      },
      {
        speaker: 'Erbe',
        text: 'Selamat ulang tahun ayanggg, selamat bertambah level dalam kehidupan ini, semoga semua yang kamu harapkan dapat terwujud dan berjalan dengan baik, semoga panjang umur dan kuat dalam menjalani hari-hari, luvyuu ayang, tetap hidup dan sehat bersama ya sama aku selamanya, semoga kita bisa menikah di tahun depan, luvyuuuu ayang, muah muah :3'
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
      { state: StoryState.INTERIOR_LILY, target: 'lily', position: { x: 6, y: 0.5, z: 0 } },
      { state: StoryState.INTERIOR_CAKE, target: 'cake', position: { x: 0, y: 0.5, z: 0.5 } }, // Di depan kue, bukan di tengah kue
      { state: StoryState.INTERIOR_GIFTS, target: 'gifts', position: { x: 0, y: 0.5, z: 0.5 } }, // Di depan kue juga, bukan di tengah kue
      { state: StoryState.INTERIOR_BED, target: 'bed', position: { x: -2, y: 0.5, z: 4 } } // Dari sisi kiri kasur, menghindari meja di tengah
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
      const distance = Math.sqrt(
        Math.pow(playerPos.x - current.position.x, 2) + 
        Math.pow(playerPos.z - current.position.z, 2)
      );
      
      // If already close enough (within 1.5 units), skip auto-walk
      if (distance < 1.5) {
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
      // Trigger interaction based on type
      this.triggerInteraction(current.target);
    });
  }

  // Auto-walk to target position
  private autoWalkToTarget(target: { x: number; y: number; z: number }, onComplete: () => void) {
    console.log('[StoryFlow] autoWalkToTarget called, target:', target);
    const playerRef = (window as any).playerRef;
    const player = playerRef?.current || playerRef;
    
    if (player) {
      console.log('[StoryFlow] Setting auto-walk target, player position:', player.position);
      (window as any).autoWalkTarget = target;
      (window as any).autoWalkActive = true;
      (window as any).autoWalkSpeed = 0.15;
      
      // Wait for arrival with timeout
      let checkCount = 0;
      const maxChecks = 300; // Max 30 seconds
      const checkInterval = setInterval(() => {
        checkCount++;
        const autoWalkActive = (window as any).autoWalkActive;
        const playerPos = player.position;
        const distance = Math.sqrt(
          Math.pow(playerPos.x - target.x, 2) + 
          Math.pow(playerPos.z - target.z, 2)
        );
        
        if (!autoWalkActive || distance < 0.5) {
          console.log('[StoryFlow] Auto-walk completed, distance:', distance);
          clearInterval(checkInterval);
          (window as any).autoWalkActive = false; // Ensure auto-walk is stopped
          setTimeout(onComplete, 500);
        } else if (checkCount >= maxChecks) {
          console.warn('[StoryFlow] Auto-walk timeout, forcing completion. Final distance:', distance, 'Player pos:', playerPos, 'Target:', target);
          clearInterval(checkInterval);
          (window as any).autoWalkActive = false;
          // If stuck but close enough (within 1.5 units), proceed anyway
          if (distance < 1.5) {
            console.log('[StoryFlow] Close enough despite timeout, proceeding with interaction');
            setTimeout(onComplete, 500);
          } else {
            // Too far, but proceed anyway to avoid getting stuck
            console.warn('[StoryFlow] Too far from target, proceeding anyway to avoid stuck');
            setTimeout(onComplete, 500);
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
    
    // Create letter content modal/overlay
    const letterOverlay = document.createElement('div');
    letterOverlay.setAttribute('data-letter-overlay', 'true');
    letterOverlay.style.position = 'fixed';
    letterOverlay.style.top = '0';
    letterOverlay.style.left = '0';
    letterOverlay.style.width = '100%';
    letterOverlay.style.height = '100%';
    letterOverlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    letterOverlay.style.zIndex = '3000';
    letterOverlay.style.display = 'flex';
    letterOverlay.style.alignItems = 'center';
    letterOverlay.style.justifyContent = 'center';
    letterOverlay.style.pointerEvents = 'auto';
    
    // Letter paper
    const letterPaper = document.createElement('div');
    letterPaper.style.backgroundColor = '#F5F5F5';
    letterPaper.style.padding = '40px';
    letterPaper.style.borderRadius = '10px';
    letterPaper.style.maxWidth = '500px';
    letterPaper.style.width = '90%';
    letterPaper.style.boxShadow = '0 10px 40px rgba(0, 0, 0, 0.3)';
    letterPaper.style.position = 'relative';
    
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
    
    // Handwriting icon (animated)
    const handIcon = document.createElement('div');
    handIcon.textContent = '✍️';
    handIcon.style.position = 'absolute';
    handIcon.style.top = '20px';
    handIcon.style.left = '20px';
    handIcon.style.fontSize = '30px';
    handIcon.style.animation = 'bounce 1s infinite';
    letterPaper.appendChild(handIcon);
    
    // Letter text (with typewriter effect)
    const letterText = document.createElement('div');
    letterText.style.fontSize = '18px';
    letterText.style.lineHeight = '1.8';
    letterText.style.color = '#333';
    letterText.style.fontFamily = 'serif';
    letterText.style.minHeight = '200px';
    letterText.style.paddingTop = '40px';
    letterPaper.appendChild(letterText);
    
    const fullLetterText = `Untuk Giva,

Di setiap tawa kamu, aku nemuin alasan buat bertahan.

Selamat ulang tahun, ya.

— Erbe 💖`;
    
    // Typewriter effect
    let currentIndex = 0;
    let typeInterval: number | null = null;
    const startTypewriter = () => {
      typeInterval = window.setInterval(() => {
        if (currentIndex < fullLetterText.length) {
          letterText.textContent = fullLetterText.slice(0, currentIndex + 1);
          currentIndex++;
        } else {
          if (typeInterval) clearInterval(typeInterval);
          // Hide hand icon when done
          handIcon.style.display = 'none';
        }
      }, 50); // 50ms per character
    };
    
    startTypewriter();
    
    letterOverlay.appendChild(letterPaper);
    document.body.appendChild(letterOverlay);
    
    // Function to close letter and call callback
    const closeLetter = () => {
      if (typeInterval) clearInterval(typeInterval);
      if (autoCloseTimer) clearTimeout(autoCloseTimer);
      letterOverlay.style.opacity = '0';
      letterOverlay.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        if (letterOverlay.parentNode) {
          document.body.removeChild(letterOverlay);
        }
        // IMPORTANT: Call onClose callback immediately after closing
        if (onClose) {
          console.log('[StoryFlow] Letter closed, calling onClose callback');
          onClose();
        }
      }, 300);
    };
    
    // Auto-close after animation completes + display time (optional, user can close manually)
    const autoCloseTimer = window.setTimeout(() => {
      if (letterOverlay.parentNode) {
        closeLetter();
      }
    }, fullLetterText.length * 50 + 5000); // Animation time + 5 seconds display
    
    // Clear auto-close if user closes manually, and call callback
    closeButton.onclick = () => {
      closeLetter();
    };
  }

  // Setup dialog untuk setiap slide TV
  private setupTVSlideDialogs() {
    // Dialog untuk setiap slide (11 gambar: giva-1 sampai giva-11)
    this.tvSlideDialogs = [
      // Slide 0 (giva-1)
      [
        {
          speaker: 'Erbe',
          text: 'Ini waktu pertama kali kita ketemu, inget gak? 😊'
        }
      ],
      // Slide 1 (giva-2)
      [
        {
          speaker: 'Erbe',
          text: 'Dan ini waktu kita jalan-jalan ke taman, kamu seneng banget liat bunga-bunganya 🌸'
        }
      ],
      // Slide 2 (giva-3)
      [
        {
          speaker: 'Erbe',
          text: 'Ini waktu kita makan bareng, kamu ketawa terus karena aku salah pesen 😂'
        }
      ],
      // Slide 3 (giva-4)
      [
        {
          speaker: 'Erbe',
          text: 'Lihat tuh, kamu lagi senyum-senyum sendiri sambil liat foto kita 💕'
        }
      ],
      // Slide 4 (giva-5)
      [
        {
          speaker: 'Erbe',
          text: 'Ini waktu kita foto bareng pertama kali, kamu malu-malu tapi tetep mau 😄'
        }
      ],
      // Slide 5 (giva-6)
      [
        {
          speaker: 'Erbe',
          text: 'Dan ini waktu kita ke pantai, kamu seneng banget main air laut 🌊'
        }
      ],
      // Slide 6 (giva-7)
      [
        {
          speaker: 'Erbe',
          text: 'Ini waktu kita makan es krim, kamu pilih yang warna pink terus ketawa sendiri 🍦'
        }
      ],
      // Slide 7 (giva-8)
      [
        {
          speaker: 'Erbe',
          text: 'Lihat tuh, kamu lagi baca buku sambil duduk di taman, cantik banget 📖'
        }
      ],
      // Slide 8 (giva-9)
      [
        {
          speaker: 'Erbe',
          text: 'Ini waktu kita foto di sunset, kamu bilang "paling cantik ya sunset hari ini" 🌅'
        }
      ],
      // Slide 9 (giva-10)
      [
        {
          speaker: 'Erbe',
          text: 'Dan ini waktu kita ke kafe favorit kamu, kamu pesen yang sama terus 😆'
        }
      ],
      // Slide 10 (giva-11)
      [
        {
          speaker: 'Erbe',
          text: 'Ini kenangan terakhir kita sebelum ulang tahun kamu, semoga kamu suka semua foto-foto ini 🥰'
        }
      ]
    ];
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
          // Dialog selesai, reset current slide dialog
          this.currentTVSlideDialog = null;
          
          // IMPORTANT: Auto-advance to next slide when dialog is completed (user tapped through)
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
              console.log('[StoryFlow] Dialog completed for slide', actualCurrentIndex, ', auto-advancing to next slide...');
              
              // Call next slide function if available (stored on window by MiniGamePage)
              if ((window as any).tvNextSlide) {
                (window as any).tvNextSlide();
              } else {
                // Fallback: directly call slideshow next
                if (setup && setup.scene) {
                  const tv = setup.scene.children.find((child: any) => child.userData && child.userData.type === 'tv');
                  if (tv && tv.userData.slideshow && tv.userData.slideshow.next) {
                    tv.userData.slideshow.next();
                    // Also trigger dialog for next slide
                    setTimeout(() => {
                      this.showTVSlideDialog(actualCurrentIndex + 1);
                    }, 100);
                  }
                }
              }
            } else {
              console.log('[StoryFlow] Dialog completed for last slide (', actualCurrentIndex, '), no auto-advance');
            }
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
            text: 'Haha iyaaa! Aku masih inget, terus kamu malah mesen minuman yang gak kamu suka 😂'
          },
          {
            speaker: 'Erbe',
            text: 'Tapi yang penting, hari itu kamu ketawa paling keras sepanjang minggu itu 😆'
          },
          {
            speaker: 'Giva',
            text: 'Dan hari ini aku ketawa lebih keras lagi, gara-gara kamu 🥰'
          }
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
    
    // Also set up a check interval as fallback
    let checkCount = 0;
    const maxChecks = 600; // Max 60 seconds
    let callbackCalled = false;
    
    const checkInterval = setInterval(() => {
      checkCount++;
      const isTVOpen = (window as any).isTVInteractionOpen;
      
      // IMPORTANT: Only call callback if TV is closed AND callback hasn't been called yet
      // Also add a small delay after detecting closure to ensure it's truly closed
      if (!isTVOpen && !callbackCalled) {
        // Wait a bit more to ensure slideshow is truly closed (not just in transition)
        if (checkCount >= 3) { // Wait at least 3 checks (300ms) after detecting closure
          console.log('[StoryFlow] TV slideshow closed (detected by interval after verification), continuing flow...');
          clearInterval(checkInterval);
          callbackCalled = true;
          if ((window as any).onTVSlideshowClose) {
            const callback = (window as any).onTVSlideshowClose;
            (window as any).onTVSlideshowClose = null;
            callback();
          }
        }
      } else if (checkCount >= maxChecks && !callbackCalled) {
        console.warn('[StoryFlow] TV slideshow timeout, forcing continuation');
        clearInterval(checkInterval);
        callbackCalled = true;
        if ((window as any).onTVSlideshowClose) {
          const callback = (window as any).onTVSlideshowClose;
          (window as any).onTVSlideshowClose = null;
          callback();
        }
      }
    }, 100);
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
        text: 'Tahu gak kenapa aku pilih lily? Karena artinya ketulusan dan kemurnian. Kayak kamu — yang selalu tulus sama semua orang, termasuk aku.'
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
      
      // Add confetti/hearts effect
      this.createCandleBlowEffect();
      
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

  // Create visual effect when candles are blown
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
      const phoneNumber = '6281234567890'; // Replace with actual number
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
