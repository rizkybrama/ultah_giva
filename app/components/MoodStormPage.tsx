'use client';

import { useState, useEffect } from 'react';

interface MoodStormPageProps {
  onTryAgain: () => void;
}

export default function MoodStormPage({ onTryAgain }: MoodStormPageProps) {
  const [currentEmoji, setCurrentEmoji] = useState(0);
  const emojis = ['😠', '😢', '🔥'];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentEmoji((prev) => (prev + 1) % emojis.length);
    }, 1500);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // emojis is a constant array, no need to include in deps

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-300 via-purple-300 to-pink-400 flex flex-col items-center justify-center relative page-transition" style={{ paddingBottom: '2rem' }}>
      {/* Animated Emojis */}
      {emojis.map((emoji, index) => (
        <div
          key={index}
          className={`absolute text-6xl md:text-8xl transition-all duration-1000 ${
            currentEmoji === index
              ? 'opacity-100 scale-100'
              : 'opacity-0 scale-75'
          }`}
          style={{
            top: `${20 + index * 25}%`,
            left: `${30 + index * 20}%`,
            transform: `rotate(${index * 15}deg)`,
          }}
        >
          {emoji}
        </div>
      ))}

      <div className="z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="glass-effect rounded-3xl p-8 md:p-16 shadow-2xl animate-fade-in">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8 font-serif">
            Hmm… try again, please?
          </h2>
          <button
            onClick={onTryAgain}
            aria-label="Try again"
            className="bg-gradient-to-r from-pastel-lavender to-pastel-pink text-white px-8 py-4 rounded-full text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pastel-lavender focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}

