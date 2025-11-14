// Dialog system - Harvest Moon style with typewriter effect

export interface DialogMessage {
  speaker: string; // "Erbe" or "Giva"
  text: string;
}

export class DialogSystem {
  private messages: DialogMessage[] = [];
  private currentMessageIndex: number = 0;
  private currentTextIndex: number = 0;
  private isTyping: boolean = false;
  private typewriterSpeed: number = 30; // milliseconds per character
  private typewriterTimer: number | null = null;
  private onComplete: (() => void) | null = null;
  private skipHeld: boolean = false;

  constructor() {
    this.messages = [];
    this.currentMessageIndex = 0;
    this.currentTextIndex = 0;
    this.isTyping = false;
  }

  // Set messages and start dialog
  startDialog(messages: DialogMessage[], onComplete?: () => void) {
    this.messages = messages;
    this.currentMessageIndex = 0;
    this.currentTextIndex = 0;
    this.isTyping = true;
    this.onComplete = onComplete || null;
    this.skipHeld = false;
    this.startTypewriter();
  }

  // Advance to next message or skip typewriter
  advance() {
    // Check if TV slide dialog just completed and user is tapping to advance to next slide
    // This check must be done BEFORE processing normal dialog advance
    // IMPORTANT: Only check if dialog is NOT active (already completed) to avoid interfering with normal dialog flow
    if (!this.isActive() && (window as any).pendingTVSlideAdvance !== undefined && (window as any).pendingTVSlideAdvance !== null) {
      const nextSlideIndex = (window as any).pendingTVSlideAdvance;
      console.log('[DialogSystem] TV slide dialog completed, advancing to next slide:', nextSlideIndex);
      
      // Clear pending advance
      (window as any).pendingTVSlideAdvance = null;
      
      // Clear current dialog state
      this.messages = [];
      this.currentMessageIndex = 0;
      this.currentTextIndex = 0;
      this.isTyping = false;
      
      // Trigger next slide
      if ((window as any).tvNextSlide) {
        (window as any).tvNextSlide();
      } else {
        // Fallback: directly call slideshow next
        const setup = (window as any).setupRef;
        if (setup && setup.scene) {
          const tv = setup.scene.children.find((child: any) => child.userData && child.userData.type === 'tv');
          if (tv && tv.userData.slideshow && tv.userData.slideshow.next) {
            tv.userData.slideshow.next();
            // Also trigger dialog for next slide
            const storyFlow = (window as any).storyFlowRef;
            if (storyFlow && storyFlow.showTVSlideDialog) {
              setTimeout(() => {
                storyFlow.showTVSlideDialog(nextSlideIndex);
              }, 100);
            }
          }
        }
      }
      return false; // Dialog is closed, no more messages
    }
    
    if (this.isTyping) {
      // Skip typewriter, show full text
      this.skipTypewriter();
    } else {
      // Move to next message
      this.currentMessageIndex++;
      if (this.currentMessageIndex >= this.messages.length) {
        // Dialog complete - all messages shown
        console.log('[DialogSystem] All messages completed, calling onComplete');
        this.isTyping = false;
        if (this.onComplete) {
          const callback = this.onComplete;
          this.onComplete = null; // Clear callback to prevent double call
          callback();
        }
        return false; // No more messages
      } else {
        // Start next message
        this.currentTextIndex = 0;
        this.isTyping = true;
        this.startTypewriter();
        return true; // More messages
      }
    }
    return true;
  }

  private startTypewriter() {
    if (this.typewriterTimer !== null) {
      clearInterval(this.typewriterTimer);
    }
    const currentMessage = this.messages[this.currentMessageIndex];
    if (!currentMessage) return;

    this.typewriterTimer = window.setInterval(() => {
      if (this.skipHeld) {
        // Skip if space/click held
        this.skipTypewriter();
        return;
      }

      this.currentTextIndex++;
      if (this.currentTextIndex >= currentMessage.text.length) {
        this.isTyping = false;
        if (this.typewriterTimer !== null) {
          clearInterval(this.typewriterTimer);
          this.typewriterTimer = null;
        }
        // Don't call onComplete here - it will be called when user taps to advance past the last message
        // This prevents double-calling onComplete
      }
    }, this.typewriterSpeed);
  }

  private skipTypewriter() {
    if (this.typewriterTimer !== null) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    const currentMessage = this.messages[this.currentMessageIndex];
    if (currentMessage) {
      this.currentTextIndex = currentMessage.text.length;
    }
    this.isTyping = false;
  }

  // Get current displayed text
  getCurrentText(): string {
    const currentMessage = this.messages[this.currentMessageIndex];
    if (!currentMessage) return "";
    return currentMessage.text.substring(0, this.currentTextIndex);
  }

  // Get current speaker
  getCurrentSpeaker(): string {
    const currentMessage = this.messages[this.currentMessageIndex];
    if (!currentMessage) return "";
    return currentMessage.speaker;
  }

  // Get current message index
  getCurrentMessageIndex(): number {
    return this.currentMessageIndex;
  }

  // Get total messages count
  getMessagesCount(): number {
    return this.messages.length;
  }

  // Check if there are more messages
  hasMoreMessages(): boolean {
    return this.currentMessageIndex < this.messages.length - 1;
  }

  // Check if dialog is active
  isActive(): boolean {
    return this.messages.length > 0 && this.currentMessageIndex < this.messages.length;
  }

  // Check if currently typing
  isCurrentlyTyping(): boolean {
    return this.isTyping;
  }

  // Check if current message text is fully displayed (typing finished for current message)
  isCurrentMessageComplete(): boolean {
    const currentMessage = this.messages[this.currentMessageIndex];
    if (!currentMessage) return true;
    return this.currentTextIndex >= currentMessage.text.length;
  }

  // Set skip held state (for held input)
  setSkipHeld(held: boolean) {
    this.skipHeld = held;
  }

  // Cleanup
  cleanup() {
    if (this.typewriterTimer !== null) {
      clearInterval(this.typewriterTimer);
      this.typewriterTimer = null;
    }
    this.messages = [];
    this.currentMessageIndex = 0;
    this.currentTextIndex = 0;
    this.isTyping = false;
  }
}

// Helper function to render character head to canvas
function renderCharacterHeadToCanvas(characterGroup: any, THREE: any, size: number = 256): string | null {
  if (!characterGroup || !THREE) return null;
  
  try {
    // Create offscreen canvas - render dengan resolusi tinggi untuk kualitas
    const renderSize = 256; // Render resolution (higher for quality)
    const canvas = document.createElement('canvas');
    canvas.width = renderSize;
    canvas.height = renderSize;
    
    // Create renderer for offscreen canvas
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvas,
      alpha: true,
      antialias: true 
    });
    renderer.setSize(renderSize, renderSize);
    renderer.setClearColor(0x000000, 0); // Transparent background
    
    // Create scene for head rendering
    const scene = new THREE.Scene();
    scene.background = null;
    
    // Clone entire character group to get all parts (head + facial features + hijab/glasses)
    const clonedGroup = characterGroup.clone();
    
    // Reset position and rotation to center
    clonedGroup.position.set(0, 0, 0);
    clonedGroup.rotation.set(0, 0, 0);
    
    // Head is typically at y=1.0 in character models
    const headCenterY = 1.0;
    
    // Scale entire character to fit head in circle 90px
    // Head radius is ~0.2-0.25, we want it to fit nicely in circle without exceeding
    // Camera FOV 40 degrees, distance 1.2, visible area ~0.8 units
    // Head (0.25 radius) should fill ~70% of visible area to leave margin
    // Scale calculation: visible radius at distance 1.2 with FOV 40 = ~0.4
    // We want head (0.25) * scale to be ~0.28 (70% of 0.4), so scale = 1.12
    // But we also need to account for hijab/glasses, so use slightly larger scale
    const headScale = 1.3; // Scale to make head fill ~70% of circle (leaving margin)
    clonedGroup.scale.set(headScale, headScale, headScale);
    
    // Position so head center is at origin (head is at y=1.0 in original, scale it)
    clonedGroup.position.y = -headCenterY * headScale; // Move down so head center is at y=0
    
    scene.add(clonedGroup);
    
    // Add lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(2, 2, 2);
    scene.add(directionalLight);
    
    // Create camera focused on head (front view, centered)
    // FOV 40 degrees, distance 1.2 gives good head framing
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 10);
    // Position camera to look at head from front, centered
    camera.position.set(0, 0, 1.2); // Front view, centered
    camera.lookAt(0, 0, 0); // Look at center (where head center is)
    
    // Render
    renderer.render(scene, camera);
    
    // Convert to data URL
    const dataURL = canvas.toDataURL('image/png');
    
    // Cleanup
    renderer.dispose();
    
    return dataURL;
  } catch (error) {
    console.warn('Failed to render character head:', error);
    return null;
  }
}

// Create dialog UI element (HTML overlay) - Style seperti game mobile dengan karakter
export function createDialogUI(guideCharacter?: any, camera?: any, playerCharacter?: any): {
  container: HTMLDivElement;
  nameBubble: HTMLDivElement;
  textLabel: HTMLDivElement;
  characterContainer: HTMLDivElement;
  update: (dialogSystem: DialogSystem) => void;
  show: () => void;
  hide: () => void;
} {
  // Main container untuk seluruh dialog
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '0';
  container.style.left = '0';
  container.style.width = '100%';
  container.style.height = '100%';
  container.style.pointerEvents = 'none'; // Container tidak clickable, hanya child elements
  container.style.display = 'none';
  container.style.zIndex = '1000';
  document.body.appendChild(container);

  // Character container (untuk menampilkan karakter di kiri atas dialog box)
  const characterContainer = document.createElement('div');
  characterContainer.style.position = 'absolute';
  characterContainer.style.zIndex = '998';
  characterContainer.style.bottom = '75px'; // Di atas dialog box
  characterContainer.style.left = '27px'; // Di kiri, menempel di tengah kiri atas bubble
  characterContainer.style.width = '100px';
  characterContainer.style.height = '100px';
  characterContainer.style.pointerEvents = 'none';
  characterContainer.style.display = 'flex';
  characterContainer.style.alignItems = 'center';
  characterContainer.style.justifyContent = 'center';
  
  // Avatar untuk karakter (render kepala 3D)
  const characterAvatar = document.createElement('div');
  characterAvatar.style.zIndex = '998';
  characterAvatar.style.width = '90px'; // Ukuran circle avatar (TIDAK DIUBAH)
  characterAvatar.style.height = '90px'; // Ukuran circle avatar (TIDAK DIUBAH)
  characterAvatar.style.borderRadius = '50%';
  characterAvatar.style.backgroundColor = '#4A90E2'; // Default color
  characterAvatar.style.backgroundSize = 'contain'; // Gunakan 'contain' agar tidak melebihi batas circle
  characterAvatar.style.backgroundPosition = 'center';
  characterAvatar.style.backgroundRepeat = 'no-repeat';
  characterAvatar.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.2)';
  characterAvatar.style.overflow = 'hidden'; // Pastikan tidak melebihi batas circle
  characterContainer.appendChild(characterAvatar);
  container.appendChild(characterContainer);
  
  // Store character references for rendering
  let erbeHeadImage: string | null = null;
  let givaHeadImage: string | null = null;
  
  // Render character heads to images (once, on initialization)
  const THREE = (window as any).THREE;
  if (THREE && guideCharacter) {
    // Render Erbe's head
    setTimeout(() => {
      const erbeImage = renderCharacterHeadToCanvas(guideCharacter, THREE, 256);
      if (erbeImage) {
        erbeHeadImage = erbeImage;
        // Update if Erbe is current speaker
        if (characterAvatar.style.backgroundImage === '' || 
            !characterAvatar.style.backgroundImage.includes('data:image')) {
          characterAvatar.style.backgroundImage = `url(${erbeImage})`;
        }
      }
    }, 100);
  }
  
  if (THREE && playerCharacter) {
    // Render Giva's head
    setTimeout(() => {
      const givaImage = renderCharacterHeadToCanvas(playerCharacter, THREE, 256);
      if (givaImage) {
        givaHeadImage = givaImage;
      }
    }, 100);
  }

  // Name bubble (oval biru di kiri atas, menempel di tengah kiri atas bubble)
  const nameBubble = document.createElement('div');
  nameBubble.style.position = 'absolute';
  nameBubble.style.zIndex = '999';
  nameBubble.style.bottom = '44px'; // Di atas karakter, menempel di tengah kiri atas bubble
  nameBubble.style.left = '45px'; // Di kiri, sejajar dengan karakter
  nameBubble.style.backgroundColor = '#4A90E2'; // Biru seperti baju Erbe
  nameBubble.style.color = '#FFFFFF';
  nameBubble.style.padding = '6px 16px';
  nameBubble.style.borderRadius = '18px';
  nameBubble.style.fontSize = '14px';
  nameBubble.style.fontWeight = 'bold';
  nameBubble.style.fontFamily = 'Arial, sans-serif';
  nameBubble.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.2)';
  nameBubble.style.whiteSpace = 'nowrap';
  nameBubble.textContent = '';
  container.appendChild(nameBubble);

  // Dialog box (white rounded rectangle di bawah) - DIKECILKAN height-nya
  const dialogBox = document.createElement('div');
  dialogBox.style.position = 'absolute';
  dialogBox.style.bottom = '0';
  dialogBox.style.left = '0';
  dialogBox.style.width = '100%';
  dialogBox.style.minHeight = '120px';
  dialogBox.style.maxHeight = '250px'; // Increased max height untuk text panjang
  dialogBox.style.backgroundColor = '#FFFFFF';
  dialogBox.style.borderTopLeftRadius = '25px';
  dialogBox.style.borderTopRightRadius = '25px';
  dialogBox.style.padding = '20px 20px 50px 20px'; // Padding bottom 50px untuk space "Tap untuk melanjutkan"
  dialogBox.style.boxShadow = '0 -4px 20px rgba(0, 0, 0, 0.15)';
  dialogBox.style.pointerEvents = 'auto';
  dialogBox.style.cursor = 'pointer';
  dialogBox.style.userSelect = 'none'; // Prevent text selection
  dialogBox.style.display = 'flex';
  dialogBox.style.flexDirection = 'column';
  dialogBox.style.overflow = 'hidden'; // Prevent dialog box itself from scrolling
  container.appendChild(dialogBox);

  // Text container (scrollable wrapper untuk text) - dibuat dulu sebelum event listener
  const textContainer = document.createElement('div');
  textContainer.style.flex = '1';
  textContainer.style.overflowY = 'auto';
  textContainer.style.overflowX = 'hidden';
  textContainer.style.minHeight = '50px';
  textContainer.style.maxHeight = '180px'; // Max height untuk scroll (250px dialog - 50px padding bottom - 20px margin)
  textContainer.style.paddingLeft = '120px'; // Padding kiri untuk spacing dari karakter
  textContainer.style.paddingRight = '20px';
  textContainer.style.paddingTop = '5px';
  textContainer.style.paddingBottom = '5px';
  // Smooth scrolling - DISABLED untuk instant scroll (tidak smooth untuk better performance)
  textContainer.style.scrollBehavior = 'auto'; // Changed from 'smooth' to 'auto' for instant scroll
  // Custom scrollbar styling (optional, untuk better UX)
  textContainer.style.scrollbarWidth = 'thin';
  textContainer.style.scrollbarColor = '#999999 #f0f0f0';
  // Prevent text selection during scroll
  textContainer.style.userSelect = 'none';
  // Pastikan text container bisa scroll dengan baik - OPTIMIZED untuk instant scroll
  (textContainer.style as any).webkitOverflowScrolling = 'touch'; // Smooth scroll di iOS
  textContainer.style.touchAction = 'pan-y'; // Allow vertical scroll - CRITICAL untuk instant scroll
  textContainer.style.willChange = 'scroll-position'; // Optimize for scrolling
  textContainer.style.transform = 'translateZ(0)'; // Force hardware acceleration
  
  dialogBox.appendChild(textContainer);

  // Store reference to dialog system for click handler
  let dialogSystemRef: DialogSystem | null = null;
  
  // Track touch events untuk membedakan scroll dan tap
  let touchStartX = 0;
  let touchStartY = 0;
  let touchMoved = false;
  let touchStartTime = 0;
  const TAP_THRESHOLD = 10; // pixels - jika movement < 10px, dianggap tap
  const TAP_TIME_THRESHOLD = 300; // ms - jika waktu < 300ms dan tidak ada movement, dianggap tap
  
  // Touch start handler - track initial position dan waktu
  const handleDialogTouchStart = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchMoved = false;
      touchStartTime = Date.now();
      // Tidak perlu store scroll position karena browser akan handle scroll natural
    }
  };
  
  // Touch move handler - detect scroll (biarkan browser handle scroll natural)
  const handleDialogTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 0) {
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);
      
      // Jika movement > threshold, berarti user sedang scroll/drag
      if (absDeltaX > TAP_THRESHOLD || absDeltaY > TAP_THRESHOLD) {
        touchMoved = true;
        // Biarkan browser handle scroll natural - jangan preventDefault
        // Text container akan scroll secara natural karena overflowY: auto
      }
    }
  };
  
  // Click handler untuk dialog box - hanya trigger jika benar-benar tap (bukan scroll)
  const handleDialogClick = (e: Event) => {
    // Untuk mouse click (desktop), langsung trigger
    if (e.type === 'click') {
      e.stopPropagation();
      e.preventDefault();
      console.log('Dialog clicked! dialogSystemRef:', dialogSystemRef, 'isActive:', dialogSystemRef?.isActive());
      
      if (dialogSystemRef) {
        // Check if TV slide dialog just completed and we should advance to next slide
        // This check is done BEFORE calling advance() to ensure we handle it correctly
        if (!dialogSystemRef.isActive() && (window as any).pendingTVSlideAdvance !== undefined && (window as any).pendingTVSlideAdvance !== null) {
          const nextSlideIndex = (window as any).pendingTVSlideAdvance;
          console.log('[DialogSystem] TV slide dialog completed (dialog not active), advancing to next slide:', nextSlideIndex);
          
          // Clear pending advance
          (window as any).pendingTVSlideAdvance = null;
          
          // Trigger next slide
          if ((window as any).tvNextSlide) {
            (window as any).tvNextSlide();
          } else {
            // Fallback: directly call slideshow next
            const setup = (window as any).setupRef;
            if (setup && setup.scene) {
              const tv = setup.scene.children.find((child: any) => child.userData && child.userData.type === 'tv');
              if (tv && tv.userData.slideshow && tv.userData.slideshow.next) {
                tv.userData.slideshow.next();
                // Also trigger dialog for next slide
                const storyFlow = (window as any).storyFlowRef;
                if (storyFlow && storyFlow.showTVSlideDialog) {
                  setTimeout(() => {
                    storyFlow.showTVSlideDialog(nextSlideIndex);
                  }, 100);
                }
              }
            }
          }
          return; // Don't process as normal dialog advance
        }
        
        console.log('Calling advance()...');
        const result = dialogSystemRef.advance();
        console.log('Advance result:', result);
      }
    }
  };
  
  // Touch end handler - hanya trigger jika bukan scroll
  const handleDialogTouchEnd = (e: TouchEvent) => {
    const touchEndTime = Date.now();
    const touchDuration = touchEndTime - touchStartTime;
    
    // Hanya trigger tap jika:
    // 1. Tidak ada movement yang signifikan (touchMoved = false)
    // 2. Waktu touch cukup singkat (< 300ms) - untuk membedakan dari long press
    if (!touchMoved && touchDuration < TAP_TIME_THRESHOLD) {
      e.stopPropagation();
      e.preventDefault();
      console.log('Dialog tapped (not scrolled)! dialogSystemRef:', dialogSystemRef, 'isActive:', dialogSystemRef?.isActive());
      
      if (dialogSystemRef) {
        // Check if TV slide dialog just completed and we should advance to next slide
        // This check is done BEFORE calling advance() to ensure we handle it correctly
        if (!dialogSystemRef.isActive() && (window as any).pendingTVSlideAdvance !== undefined && (window as any).pendingTVSlideAdvance !== null) {
          const nextSlideIndex = (window as any).pendingTVSlideAdvance;
          console.log('[DialogSystem] TV slide dialog completed (dialog not active), advancing to next slide:', nextSlideIndex);
          
          // Clear pending advance
          (window as any).pendingTVSlideAdvance = null;
          
          // Trigger next slide
          if ((window as any).tvNextSlide) {
            (window as any).tvNextSlide();
          } else {
            // Fallback: directly call slideshow next
            const setup = (window as any).setupRef;
            if (setup && setup.scene) {
              const tv = setup.scene.children.find((child: any) => child.userData && child.userData.type === 'tv');
              if (tv && tv.userData.slideshow && tv.userData.slideshow.next) {
                tv.userData.slideshow.next();
                // Also trigger dialog for next slide
                const storyFlow = (window as any).storyFlowRef;
                if (storyFlow && storyFlow.showTVSlideDialog) {
                  setTimeout(() => {
                    storyFlow.showTVSlideDialog(nextSlideIndex);
                  }, 100);
                }
              }
            }
          }
          // Reset touch state
          touchMoved = false;
          touchStartTime = 0;
          return; // Don't process as normal dialog advance
        }
        
        console.log('Calling advance()...');
        const result = dialogSystemRef.advance();
        console.log('Advance result:', result);
      }
    } else {
      // Ini adalah scroll, jangan trigger tap
      console.log('Touch was scroll/drag, not triggering tap. Moved:', touchMoved, 'Duration:', touchDuration);
    }
    
    // Reset untuk next touch
    touchMoved = false;
    touchStartTime = 0;
  };
  
  // Mouse click handler (desktop) - langsung trigger
  dialogBox.addEventListener('click', handleDialogClick);
  
  // Touch handlers untuk text container - biarkan scroll bekerja natural
  textContainer.addEventListener('touchstart', handleDialogTouchStart, { passive: true });
  textContainer.addEventListener('touchmove', handleDialogTouchMove, { passive: true }); // passive: true untuk allow natural scroll
  textContainer.addEventListener('touchend', handleDialogTouchEnd);
  
  // Touch handlers untuk dialog box (area di luar text container) - untuk tap
  dialogBox.addEventListener('touchstart', (e: TouchEvent) => {
    // Hanya handle jika bukan di text container
    const target = e.target as HTMLElement;
    if (!textContainer.contains(target)) {
      handleDialogTouchStart(e);
    }
  }, { passive: true });
  dialogBox.addEventListener('touchend', (e: TouchEvent) => {
    // Hanya handle jika bukan di text container
    const target = e.target as HTMLElement;
    if (!textContainer.contains(target)) {
      handleDialogTouchEnd(e);
    }
  });

  // Text label (di dalam text container)
  const textLabel = document.createElement('div');
  textLabel.style.fontSize = '16px';
  textLabel.style.color = '#333333';
  textLabel.style.lineHeight = '1.5';
  textLabel.style.fontFamily = 'Arial, sans-serif';
  textLabel.style.textAlign = 'left';
  textLabel.style.wordWrap = 'break-word';
  textLabel.style.whiteSpace = 'pre-wrap'; // Preserve line breaks
  textLabel.textContent = '';
  textContainer.appendChild(textLabel);

  // Tap to continue hint (di pojok kanan bawah)
  const continueHint = document.createElement('div');
  continueHint.style.position = 'absolute';
  continueHint.style.bottom = '15px';
  continueHint.style.right = '20px';
  continueHint.style.fontSize = '12px';
  continueHint.style.color = '#999999';
  continueHint.style.fontFamily = 'Arial, sans-serif';
  continueHint.textContent = 'Tap untuk melanjutkan';
  dialogBox.appendChild(continueHint);

  // Auto-scroll management - simple logic: aktif saat typing, mati setelah selesai
  let autoScrollInterval: number | null = null;
  
  // Update function
  const update = (dialogSystem: DialogSystem) => {
    dialogSystemRef = dialogSystem; // Store reference for click handler
    if (dialogSystem.isActive()) {
      const speaker = dialogSystem.getCurrentSpeaker();
      nameBubble.textContent = speaker;
      textLabel.textContent = dialogSystem.getCurrentText();
      
      // Update character avatar based on speaker
      if (speaker === 'Giva' && givaHeadImage) {
        characterAvatar.style.backgroundImage = `url(${givaHeadImage})`;
        characterAvatar.style.backgroundColor = '#000000'; // Fallback color
      } else if (speaker === 'Erbe' && erbeHeadImage) {
        characterAvatar.style.backgroundImage = `url(${erbeHeadImage})`;
        characterAvatar.style.backgroundColor = '#4A90E2'; // Fallback color
      } else {
        // Fallback to emoji if image not ready
        characterAvatar.style.backgroundImage = '';
        if (speaker === 'Giva') {
          characterAvatar.textContent = '👩';
          characterAvatar.style.backgroundColor = '#000000';
        } else {
          characterAvatar.textContent = '👓';
          characterAvatar.style.backgroundColor = '#4A90E2';
        }
      }
      
      // Update name bubble color based on speaker
      if (speaker === 'Giva') {
        nameBubble.style.backgroundColor = '#000000'; // Hitam untuk Giva
      } else {
        nameBubble.style.backgroundColor = '#4A90E2'; // Biru untuk Erbe
      }
      
      // Add blinking cursor if typing
      if (dialogSystem.isCurrentlyTyping()) {
        textLabel.textContent += '|';
      }
      
      // Auto-scroll logic: aktif saat typing, mati setelah text selesai
      // Sesuai requirement: awal dialog muncul autoscroll aktif, sampe text keluar semua autoscroll mati
      // Setelah itu user bebas scroll manual atau tap, tidak ada intervensi
      const isTyping = dialogSystem.isCurrentlyTyping();
      const isTextComplete = dialogSystem.isCurrentMessageComplete();
      
      if (isTyping && !isTextComplete) {
        // Typewriter sedang berjalan dan text belum selesai - aktifkan auto-scroll
        continueHint.style.display = 'none';
        
        // Start auto-scroll interval jika belum ada
        if (autoScrollInterval === null) {
          autoScrollInterval = window.setInterval(() => {
            // Auto-scroll ke bottom saat typing (hanya jika masih typing dan belum selesai)
            if (dialogSystemRef && dialogSystemRef.isCurrentlyTyping() && !dialogSystemRef.isCurrentMessageComplete()) {
              const maxScrollTop = textContainer.scrollHeight - textContainer.clientHeight;
              if (maxScrollTop > 0) {
                textContainer.scrollTop = textContainer.scrollHeight;
              }
            } else {
              // Text sudah selesai, stop interval (auto-stop)
              if (autoScrollInterval !== null) {
                clearInterval(autoScrollInterval);
                autoScrollInterval = null;
              }
            }
          }, 50); // Update setiap 50ms untuk smooth auto-scroll
        }
      } else {
        // Typewriter selesai atau text sudah lengkap - matikan auto-scroll
        // Tidak ada final scroll, user bebas scroll atau tap
        continueHint.style.display = 'block';
        
        // Stop auto-scroll interval (pastikan benar-benar di-clear)
        if (autoScrollInterval !== null) {
          clearInterval(autoScrollInterval);
          autoScrollInterval = null;
        }
        // Tidak ada final scroll - user bebas setelah text selesai
      }
    }
  };

  // Hapus container click handler - hanya dialog box yang clickable
  // Ini mencegah dialog container menutupi tombol reload

  const show = () => {
    container.style.display = 'block';
    // Container tetap pointer-events: none, hanya child elements yang clickable
    // Ini memastikan tombol reload tidak tertutupi
  };

  const hide = () => {
    container.style.display = 'none';
  };

  return { container, nameBubble, textLabel, characterContainer, update, show, hide };
}

