'use client';

import { useState, useEffect, useRef } from 'react';

interface NewGamePageProps {
  onNewGame: () => void;
  onCredits: () => void;
  onMusicToggle: (enabled: boolean) => void;
  musicEnabled: boolean;
}

export default function NewGamePage({ onNewGame, onCredits, onMusicToggle, musicEnabled }: NewGamePageProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  // Play bg-sound.mp3 when component mounts
  useEffect(() => {
    // Check if there's already a shared audio element
    let sharedAudio = (window as any).bgSoundAudio;
    
    if (!sharedAudio) {
      // Create shared audio element if it doesn't exist
      sharedAudio = document.createElement('audio');
      sharedAudio.src = '/audio/bg-sound.mp3';
      sharedAudio.loop = true;
      sharedAudio.volume = 0.5;
      (window as any).bgSoundAudio = sharedAudio;
    }
    
    // Use shared audio element
    if (audioRef.current) {
      // Store reference to shared audio
      (audioRef.current as any).__sharedAudio = sharedAudio;
    }
    
    if (musicEnabled) {
      // Only set src if it's different to avoid restarting
      // IMPORTANT: Don't change src if it's already bg-sound.mp3 to prevent restart
      if (!sharedAudio.src || !sharedAudio.src.includes('bg-sound.mp3')) {
        sharedAudio.src = '/audio/bg-sound.mp3';
        sharedAudio.loop = true;
        sharedAudio.volume = 0.5;
        // Only load if src was changed
        sharedAudio.load();
      }
      // IMPORTANT: Only play if paused
      // This prevents restarting when returning from mini game
      // If already playing, don't do anything - music continues from where it was
      if (sharedAudio.paused) {
        sharedAudio.play().catch((err: any) => {
          console.log('Audio play prevented:', err);
        });
      }
    } else {
      sharedAudio.pause();
    }
  }, [musicEnabled]);

  // Handle music toggle
  const handleMusicToggle = () => {
    const newState = !musicEnabled;
    onMusicToggle(newState);
    
    if (audioRef.current) {
      if (newState) {
        audioRef.current.play().catch((err) => {
          console.log('Audio play prevented:', err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'linear-gradient(to bottom, #FFE5E5, #FFD6E5)' }}>
      {/* Hidden audio element */}
      <audio ref={audioRef} loop />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Shooting star - top left */}
        <div className="absolute top-10 left-10" style={{ transform: 'rotate(-45deg)' }}>
          <div className="text-white text-2xl">⭐</div>
          <div className="absolute top-2 left-2 w-8 h-0.5 bg-white opacity-60" style={{ transform: 'rotate(45deg)' }}></div>
          <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full opacity-40"></div>
          <div className="absolute top-3 left-3 w-1 h-1 bg-white rounded-full opacity-50"></div>
        </div>

        {/* Heart - top right */}
        <div className="absolute top-12 right-16 text-pink-300 text-xl">💖</div>

        {/* Sparkle - mid left */}
        <div className="absolute top-1/3 left-12 text-white text-sm opacity-70">✨</div>

        {/* Glowing heart - mid right */}
        <div className="absolute top-1/2 right-20 text-pink-200 text-lg opacity-80" style={{ filter: 'drop-shadow(0 0 4px rgba(255, 182, 193, 0.6))' }}>💕</div>

        {/* Petals scattered */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-40"
            style={{
              left: `${10 + Math.random() * 80}%`,
              top: `${10 + Math.random() * 80}%`,
              width: `${8 + Math.random() * 12}px`,
              height: `${8 + Math.random() * 12}px`,
              background: 'linear-gradient(135deg, #FFF5E6, #FFE5E5)',
              animation: `float ${15 + Math.random() * 10}s infinite ease-in-out`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}

        {/* Small dots */}
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`dot-${i}`}
            className="absolute w-1 h-1 bg-white rounded-full opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Title */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-purple-300 mb-2" style={{ fontFamily: 'Georgia, serif' }}>
            Happy Birthday,
          </h1>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif text-purple-300" style={{ fontFamily: 'Georgia, serif' }}>
            Giva
          </h1>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4 w-full max-w-xs">
          {/* New Game Button */}
          <button
            onClick={onNewGame}
            className="relative rounded-2xl px-8 py-4 text-lg font-semibold text-pink-50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{
              background: 'linear-gradient(to bottom, #E8D5E3, #D4C4D9)',
              border: '2px solid #F5E6D3',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            NEW GAME
          </button>

          {/* Music Toggle Button */}
          <button
            onClick={handleMusicToggle}
            className="relative rounded-2xl px-8 py-4 text-lg font-semibold text-pink-50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{
              background: musicEnabled 
                ? 'linear-gradient(to bottom, #E8D5E3, #D4C4D9)'
                : 'linear-gradient(to bottom, #D4C4D9, #C4B4C9)',
              border: '2px solid #F5E6D3',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
              opacity: musicEnabled ? 1 : 0.7,
            }}
          >
            {musicEnabled ? 'MUSIC ON' : 'MUSIC OFF'}
          </button>

          {/* Credits Button */}
          <button
            onClick={onCredits}
            className="relative rounded-2xl px-8 py-4 text-lg font-semibold text-pink-50 transition-all duration-300 hover:scale-105 hover:shadow-xl"
            style={{
              background: 'linear-gradient(to bottom, #E8D5E3, #D4C4D9)',
              border: '2px solid #F5E6D3',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            }}
          >
            CREDITS
          </button>
        </div>
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

