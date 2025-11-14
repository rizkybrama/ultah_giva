'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import CountdownPage from './components/CountdownPage';
import NewGamePage from './components/NewGamePage';
import CreditsPage from './components/CreditsPage';
// MiniGamePage will be loaded dynamically to avoid build errors if Three.js is not installed
const MiniGamePage = dynamic(
  () => import('./components/MiniGamePage').catch(() => {
    // Return a fallback component if MiniGamePage fails to load
    return { default: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-mint to-pastel-lavender">
        <div className="glass-effect rounded-3xl p-8 text-center max-w-md mx-auto">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Mini Game Unavailable</h2>
          <p className="text-gray-600 mb-4">
            Please install Three.js to enable the 3D mini game:
          </p>
          <code className="block bg-gray-100 p-3 rounded-lg text-sm mb-4">
            npm install three @types/three
          </code>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-pastel-lavender to-pastel-pink text-white px-6 py-3 rounded-full font-semibold"
          >
            Go Back
          </button>
        </div>
      </div>
    )};
  }),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pastel-mint to-pastel-lavender">
        <div className="glass-effect rounded-3xl p-8 text-center">
          <p className="text-xl text-gray-700">Loading 3D World...</p>
        </div>
      </div>
    ),
  }
);
type PageType =
  | 'countdown'
  | 'new-game'
  | 'credits'
  | 'mini-game';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>('countdown');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [newGameMusicEnabled, setNewGameMusicEnabled] = useState(true);
  const [selectedCoupons, setSelectedCoupons] = useState<Array<{ id: number; title: string; emoji: string }>>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Handle music change based on current page
  useEffect(() => {
    if (audioRef.current && audioEnabled) {
      const audio = audioRef.current;
      const currentSrc = audio.src;
      const targetSrc = '/audio/romantic-music.mp3';
      
      // Only change back to romantic if currently playing ayaya
      if (currentSrc.includes('ayaya.mp3')) {
        audio.pause();
        audio.src = targetSrc;
        audio.load();
        audio.play().catch((err) => {
          console.log('Audio play prevented:', err);
        });
      }
    }
  }, [currentPage, audioEnabled]);

  return (
    <main className="relative" style={{ minHeight: '100vh' }}>
      {/* Audio Element - Global */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        className="hidden"
      >
        <source src="/audio/romantic-music.mp3" type="audio/mpeg" />
        <source src="/audio/ayaya.mp3" type="audio/mpeg" />
      </audio>

      {/* Pages */}
      {currentPage === 'countdown' && (
        <CountdownPage
          onNext={() => {
            setCurrentPage('new-game');
          }}
          onAudioEnable={() => setAudioEnabled(true)}
        />
      )}

      {currentPage === 'new-game' && (
        <NewGamePage
          onNewGame={() => setCurrentPage('mini-game')}
          onCredits={() => setCurrentPage('credits')}
          onMusicToggle={(enabled) => setNewGameMusicEnabled(enabled)}
          musicEnabled={newGameMusicEnabled}
        />
      )}

      {currentPage === 'credits' && (
        <CreditsPage
          onBack={() => setCurrentPage('new-game')}
          musicEnabled={newGameMusicEnabled}
        />
      )}

      {currentPage === 'mini-game' && (
        <MiniGamePage 
          onExit={() => setCurrentPage('new-game')}
          selectedCoupons={selectedCoupons}
          musicEnabled={newGameMusicEnabled}
          onMusicToggle={(enabled) => setNewGameMusicEnabled(enabled)}
        />
      )}
    </main>
  );
}
