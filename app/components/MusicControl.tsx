'use client';

import { useState, useEffect } from 'react';

interface MusicControlProps {
  audioRef: React.RefObject<HTMLAudioElement>;
  spotifyUrl?: string;
}

export default function MusicControl({ audioRef, spotifyUrl }: MusicControlProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updatePlayingState = () => setIsPlaying(!audio.paused);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handlePause);

    updatePlayingState();

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handlePause);
    };
  }, [audioRef]);

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.log('Play error:', err);
        });
      }
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex gap-3">
      <button
        onClick={togglePlayPause}
        aria-label={isPlaying ? 'Pause music' : 'Play music'}
        className="glass-effect rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pastel-lavender focus:ring-offset-2"
      >
        <span className="text-2xl">
          {isPlaying ? '⏸️' : '▶️'}
        </span>
        <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:inline">
          {isPlaying ? 'Pause' : 'Play'}
        </span>
      </button>
      {spotifyUrl && (
        <a
          href={spotifyUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Open in Spotify"
          className="glass-effect rounded-full p-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pastel-lavender focus:ring-offset-2"
        >
          <span className="text-2xl">🎵</span>
          <span className="ml-2 text-sm font-medium text-gray-700 hidden sm:inline">
            Spotify
          </span>
        </a>
      )}
    </div>
  );
}

