// TV slideshow system with media playback and controls

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

export function createTVSlideshow(
  THREE: any,
  scene: any,
  tvPosition: { x: number; y: number; z: number },
  tvSize: { width: number; height: number },
  mediaItems: MediaItem[]
): {
  tvScreen: any;
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  isPlaying: () => boolean;
  getCurrentIndex: () => number;
} {
  let currentIndex = 0;
  let isPlaying = false;
  let playTimer: number | null = null;
  const playDuration = 3000; // 3 seconds per slide
  let currentTexture: any = null;
  let currentVideo: HTMLVideoElement | null = null;

  // Create TV screen
  const screenGeometry = new THREE.PlaneGeometry(tvSize.width, tvSize.height);
  const screenMaterial = new THREE.MeshStandardMaterial({
    color: 0x000000,
    emissive: 0x000000,
    emissiveIntensity: 0.5
  });
  const tvScreen = new THREE.Mesh(screenGeometry, screenMaterial);
  tvScreen.position.set(tvPosition.x, tvPosition.y, tvPosition.z);
  tvScreen.userData.type = 'tv';
  tvScreen.userData.interactive = true;
  tvScreen.userData.interior = true;
  scene.add(tvScreen);

  // Create placeholder texture with dummy image
  const createPlaceholderTexture = (text: string, color: string = '#1a1a1a', index: number = 0) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 384;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Background gradient untuk lebih menarik
      const gradient = ctx.createLinearGradient(0, 0, 512, 384);
      const colors = [
        ['#FF6B9D', '#C44569'], // Pink
        ['#4ECDC4', '#44A08D'], // Teal
        ['#FFE66D', '#FF6B6B'], // Yellow to Red
        ['#A8E6CF', '#88D8A3'], // Green
        ['#FFD3A5', '#FD9853'], // Orange
      ];
      const colorPair = colors[index % colors.length];
      gradient.addColorStop(0, colorPair[0]);
      gradient.addColorStop(1, colorPair[1]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 512, 384);
      
      // Decorative circles/patterns
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.arc(
          Math.random() * 512,
          Math.random() * 384,
          Math.random() * 50 + 20,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      
      // Border
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 6;
      ctx.strokeRect(15, 15, 482, 354);
      
      // Icon/Emoji untuk visual
      ctx.font = '80px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const emojis = ['📸', '🎬', '💕', '📷', '🎥'];
      ctx.fillText(emojis[index % emojis.length], 256, 150);
      
      // Text
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 28px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 256, 220);
      
      // Subtitle
      ctx.font = '16px Arial';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.fillText(`Photo ${index + 1} - Placeholder`, 256, 250);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.flipY = false; // Fix WebGL error for 3D textures
    return texture;
  };

  // Check if URL is a placeholder
  const isPlaceholder = (url: string) => {
    return url.startsWith('url-') || url.includes('placeholder') || !url.includes('.');
  };

  // Load initial media
  const loadMedia = (index: number) => {
    if (index < 0 || index >= mediaItems.length) return;
    
    const item = mediaItems[index];
    
    // Clean up previous media
    if (currentVideo) {
      currentVideo.pause();
      currentVideo = null;
    }
    if (currentTexture) {
      currentTexture.dispose();
      currentTexture = null;
    }

    // If placeholder URL, use placeholder texture immediately
    if (isPlaceholder(item.url)) {
      const placeholderText = item.type === 'image' ? `Photo ${index + 1}` : `Video ${index + 1}`;
      const placeholderTexture = createPlaceholderTexture(placeholderText, '#1a1a1a', index);
      currentTexture = placeholderTexture;
      screenMaterial.map = placeholderTexture;
      screenMaterial.needsUpdate = true;
      return;
    }

    if (item.type === 'image') {
      // Load image
      const textureLoader = new THREE.TextureLoader();
      textureLoader.load(
        item.url,
        (texture: any) => {
          texture.flipY = false; // Fix WebGL error for 3D textures
          texture.minFilter = THREE.LinearFilter;
          texture.magFilter = THREE.LinearFilter;
          currentTexture = texture;
          screenMaterial.map = texture;
          screenMaterial.needsUpdate = true;
        },
        undefined,
        (error: any) => {
          console.warn('Failed to load image:', item.url, error);
          // Use placeholder
          const placeholderTexture = createPlaceholderTexture(`Photo ${index + 1}`, '#1a1a1a', index);
          currentTexture = placeholderTexture;
          screenMaterial.map = placeholderTexture;
          screenMaterial.needsUpdate = true;
        }
      );
    } else if (item.type === 'video') {
      // Load video
      const video = document.createElement('video');
      video.src = item.url;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      
      video.addEventListener('loadeddata', () => {
        video.play();
        const videoTexture = new THREE.VideoTexture(video);
        videoTexture.flipY = false; // Fix WebGL error for 3D textures
        videoTexture.minFilter = THREE.LinearFilter;
        videoTexture.magFilter = THREE.LinearFilter;
        currentTexture = videoTexture;
        currentVideo = video;
        screenMaterial.map = videoTexture;
        screenMaterial.needsUpdate = true;
      });
      
      video.addEventListener('error', () => {
        console.warn('Failed to load video:', item.url);
        // Use placeholder
        const placeholderTexture = createPlaceholderTexture(`Video ${index + 1}`, '#1a1a1a', index);
        currentTexture = placeholderTexture;
        screenMaterial.map = placeholderTexture;
        screenMaterial.needsUpdate = true;
      });
      
      video.load();
    }
  };

  // Play function
  const play = () => {
    if (isPlaying) return;
    isPlaying = true;
    
    if (playTimer !== null) {
      clearInterval(playTimer);
    }
    
    playTimer = window.setInterval(() => {
      next();
    }, playDuration);
  };

  // Pause function
  const pause = () => {
    isPlaying = false;
    if (playTimer !== null) {
      clearInterval(playTimer);
      playTimer = null;
    }
    if (currentVideo) {
      currentVideo.pause();
    }
  };

  // Next function
  const next = () => {
    currentIndex = (currentIndex + 1) % mediaItems.length;
    loadMedia(currentIndex);
  };

  // Previous function
  const prev = () => {
    currentIndex = (currentIndex - 1 + mediaItems.length) % mediaItems.length;
    loadMedia(currentIndex);
  };

  // Get current playing state
  const getIsPlaying = () => isPlaying;

  // Get current index
  const getCurrentIndex = () => currentIndex;

  // Load initial media
  if (mediaItems.length > 0) {
    loadMedia(0);
  }

  // Store functions in userData
  tvScreen.userData.play = play;
  tvScreen.userData.pause = pause;
  tvScreen.userData.next = next;
  tvScreen.userData.prev = prev;
  tvScreen.userData.isPlaying = getIsPlaying;
  tvScreen.userData.getCurrentIndex = getCurrentIndex;

  return {
    tvScreen,
    play,
    pause,
    next,
    prev,
    isPlaying: getIsPlaying,
    getCurrentIndex
  };
}

// Create on-screen controls UI
export function createTVControlsUI(): {
  container: HTMLDivElement;
  show: () => void;
  hide: () => void;
  update: (isPlaying: boolean, currentIndex: number, totalItems: number) => void;
} {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.bottom = '100px';
  container.style.left = '50%';
  container.style.transform = 'translateX(-50%)';
  container.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
  container.style.borderRadius = '10px';
  container.style.padding = '15px';
  container.style.fontFamily = 'Arial, sans-serif';
  container.style.color = '#fff';
  container.style.display = 'none';
  container.style.zIndex = '1000';
  container.style.textAlign = 'center';
  
  container.innerHTML = `
    <div style="margin-bottom: 10px;">
      <button id="tv-play-pause" style="padding: 8px 15px; margin: 0 5px; cursor: pointer; border: none; border-radius: 5px; background: #4A90E2; color: white;">Play/Pause</button>
      <button id="tv-prev" style="padding: 8px 15px; margin: 0 5px; cursor: pointer; border: none; border-radius: 5px; background: #4A90E2; color: white;">← Prev</button>
      <button id="tv-next" style="padding: 8px 15px; margin: 0 5px; cursor: pointer; border: none; border-radius: 5px; background: #4A90E2; color: white;">Next →</button>
    </div>
    <div id="tv-info" style="font-size: 14px; color: #ccc;">1 / 1</div>
    <div style="font-size: 12px; color: #999; margin-top: 5px;">[E] Play/Pause | [←/→] Navigate</div>
  `;
  
  document.body.appendChild(container);

  const show = () => {
    container.style.display = 'block';
  };

  const hide = () => {
    container.style.display = 'none';
  };

  const update = (isPlaying: boolean, currentIndex: number, totalItems: number) => {
    const playPauseBtn = document.getElementById('tv-play-pause');
    const infoDiv = document.getElementById('tv-info');
    
    if (playPauseBtn) {
      playPauseBtn.textContent = isPlaying ? 'Pause' : 'Play';
    }
    if (infoDiv) {
      infoDiv.textContent = `${currentIndex + 1} / ${totalItems}`;
    }
  };

  return { container, show, hide, update };
}

