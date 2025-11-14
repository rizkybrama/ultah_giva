'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import CountdownPage from './components/CountdownPage';
import NewGamePage from './components/NewGamePage';
import CreditsPage from './components/CreditsPage';
import HeroPage from './components/HeroPage';
import MoodStormPage from './components/MoodStormPage';
import TimelinePage from './components/TimelinePage';
import CouponsPage from './components/CouponsPage';
import CakePage from './components/CakePage';
import FlowersPage from './components/FlowersPage';
import FinalPage from './components/FinalPage';
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
// import MusicControl from './components/MusicControl'; // Disabled - tombol play/pause dihilangkan

type PageType =
  | 'countdown'
  | 'new-game'
  | 'credits'
  | 'hero'
  | 'mood-storm'
  | 'timeline'
  | 'coupons'
  | 'cake'
  | 'flowers'
  | 'final'
  | 'mini-game';

export default function Home() {
  const [currentPage, setCurrentPage] = useState<PageType>('countdown');
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [newGameMusicEnabled, setNewGameMusicEnabled] = useState(true);
  const [selectedCoupons, setSelectedCoupons] = useState<Array<{ id: number; title: string; emoji: string }>>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [showOpeningTransition, setShowOpeningTransition] = useState(false);

  // Music control disabled - tombol play/pause dihilangkan
  // const showMusicControl = audioEnabled && currentPage !== 'countdown';

  // Handle music change based on current page (except mood-storm which is handled in onNoClick)
  useEffect(() => {
    if (audioRef.current && audioEnabled && currentPage !== 'mood-storm') {
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

  // Handle opening transition saat halaman baru dimuat
  useEffect(() => {
    if (currentPage === 'hero' && showOpeningTransition) {
      // Trigger opening transition setelah component mount
      const timer = setTimeout(() => {
        setShowOpeningTransition(false);
      }, 400); // Durasi opening transition
      return () => clearTimeout(timer);
    }
  }, [currentPage, showOpeningTransition]);

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

      {/* Music Control - Disabled */}
      {/* {showMusicControl && (
        <MusicControl audioRef={audioRef} />
      )} */}

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

      {currentPage === 'hero' && (
        <HeroPage
          onNext={() => setCurrentPage('timeline')}
          onNoClick={() => {
            // Change music to ayaya.mp3 when clicking No
            if (audioRef.current && audioEnabled) {
              const audio = audioRef.current;
              audio.pause();
              audio.src = '/audio/ayaya.mp3';
              audio.load();
              audio.play().catch((err) => {
                console.log('Audio play prevented:', err);
              });
            }
            setCurrentPage('mood-storm');
          }}
          audioEnabled={audioEnabled}
          audioRef={audioRef}
        />
      )}

      {currentPage === 'mood-storm' && (
        <MoodStormPage
          onTryAgain={() => {
            // Change music back to romantic-music.mp3 when trying again
            if (audioRef.current && audioEnabled) {
              const audio = audioRef.current;
              audio.pause();
              audio.src = '/audio/romantic-music.mp3';
              audio.load();
              audio.play().catch((err) => {
                console.log('Audio play prevented:', err);
              });
            }
            setCurrentPage('hero');
            // Focus back to Yes button after a short delay
            setTimeout(() => {
              const yesButton = document.querySelector('[aria-label="Yes, I love you"]');
              if (yesButton instanceof HTMLElement) {
                yesButton.focus();
              }
            }, 500);
          }}
        />
      )}

      {currentPage === 'timeline' && (
        <TimelinePage
          onNext={() => setCurrentPage('cake')}
        />
      )}

      {currentPage === 'cake' && (
        <CakePage
          onNext={() => setCurrentPage('coupons')}
        />
      )}

      {currentPage === 'coupons' && (
        <CouponsPage
          onNext={(coupons) => {
            setSelectedCoupons(coupons);
            setCurrentPage('flowers');
          }}
        />
      )}

      {currentPage === 'flowers' && (
        <FlowersPage
          onNext={() => setCurrentPage('final')}
        />
      )}

      {currentPage === 'final' && (
        <FinalPage 
          selectedCoupons={selectedCoupons}
          onEnterMiniGame={() => setCurrentPage('mini-game')}
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

      {/* Opening Transition (Netflix-style) - muncul saat halaman baru dimuat */}
      {showOpeningTransition && (
        <div 
          className="fixed inset-0 z-[9999] bg-black"
          style={{
            clipPath: 'circle(150% at 50% 50%)',
            animation: 'netflixOpening 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
          }}
        />
      )}

      <style jsx global>{`
        @keyframes netflixOpening {
          0% {
            clip-path: circle(150% at 50% 50%);
            opacity: 1;
          }
          100% {
            clip-path: circle(0% at 50% 50%);
            opacity: 0;
          }
        }
      `}</style>
    </main>
  );
}
