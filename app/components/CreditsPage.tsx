'use client';

import { useEffect, useRef } from 'react';

interface CreditsPageProps {
  onBack: () => void;
  musicEnabled?: boolean;
}

export default function CreditsPage({ onBack, musicEnabled = true }: CreditsPageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Play bg-sound.mp3 when component mounts (same as NewGamePage)
  // Use shared audio element to avoid restarting music
  useEffect(() => {
    // Get shared audio element from window
    let sharedAudio = (window as any).bgSoundAudio;
    
    if (!sharedAudio) {
      // Create shared audio element if it doesn't exist
      sharedAudio = document.createElement('audio');
      sharedAudio.src = '/audio/bg-sound.mp3';
      sharedAudio.loop = true;
      sharedAudio.volume = 0.5;
      (window as any).bgSoundAudio = sharedAudio;
    }
    
    // Use shared audio element - don't create new one
    if (musicEnabled) {
      // Only set src if it's different to avoid restarting
      if (!sharedAudio.src || !sharedAudio.src.includes('bg-sound.mp3')) {
        sharedAudio.src = '/audio/bg-sound.mp3';
        sharedAudio.loop = true;
        sharedAudio.volume = 0.5;
      }
      // IMPORTANT: Only play if paused - this way music continues from where it was
      // If already playing, don't do anything - music continues
      if (sharedAudio.paused) {
        sharedAudio.play().catch((err: any) => {
          console.log('Audio play prevented:', err);
        });
      }
    } else {
      sharedAudio.pause();
    }
  }, [musicEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);
  return (
    <div 
      className="min-h-screen relative overflow-hidden flex items-center justify-center px-4"
      style={{ 
        background: 'linear-gradient(to bottom, #FFE5D9, #FFD6E5)',
      }}
    >
      {/* Hidden audio element */}
      <audio ref={audioRef} loop />
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Heart - top left */}
        <div className="absolute top-8 left-8 text-pink-200 text-lg">💖</div>

        {/* Petals scattered */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-30"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              width: `${10 + Math.random() * 15}px`,
              height: `${10 + Math.random() * 15}px`,
              background: 'linear-gradient(135deg, #FFF5E6, #FFE5E5)',
              animation: `float ${15 + Math.random() * 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}

        {/* Small dots */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute w-1 h-1 bg-pink-200 rounded-full opacity-40"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center max-w-md">
        {/* First text block */}
        <div className="mb-12">
          <p className="text-2xl md:text-3xl font-serif text-purple-300 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
            Created with<br />
            love by Erbe,<br />
            for Giva.
          </p>
        </div>

        {/* Second text block */}
        <div>
          <p className="text-2xl md:text-3xl font-serif text-purple-300 leading-relaxed" style={{ fontFamily: 'Georgia, serif' }}>
            Thanks for<br />
            being born.
          </p>
        </div>

        {/* Back button */}
        <button
          onClick={onBack}
          className="mt-12 px-6 py-3 rounded-full text-pink-50 font-semibold transition-all duration-300 hover:scale-105"
          style={{
            background: 'linear-gradient(to bottom, #E8D5E3, #D4C4D9)',
            border: '2px solid #F5E6D3',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          BACK
        </button>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
      `}</style>
    </div>
  );
}

