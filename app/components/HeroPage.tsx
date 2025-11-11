'use client';

import { useEffect, useRef, useState } from 'react';
import { config } from '../config';

interface HeroPageProps {
  onNext: () => void;
  onNoClick: () => void;
  audioEnabled: boolean;
  audioRef: React.RefObject<HTMLAudioElement>;
}

export default function HeroPage({ onNext, onNoClick, audioEnabled, audioRef }: HeroPageProps) {
  const [showQuestion, setShowQuestion] = useState(false);

  useEffect(() => {
    if (audioEnabled && audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.log('Audio autoplay prevented:', err);
      });
    }
  }, [audioEnabled, audioRef]);

  useEffect(() => {
    // Show question after initial greeting animation - tanpa delay animasi yang bikin glitch
    const timer = setTimeout(() => {
      setShowQuestion(true);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Format tanggal ulang tahun
  const formatBirthday = () => {
    const date = new Date(config.birthdayDate);
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleYes = () => {
    onNext();
  };

  const handleNo = () => {
    onNoClick();
  };

  return (
    <div className="min-h-screen gradient-pastel flex flex-col items-center justify-center relative page-transition" style={{ paddingBottom: '2rem' }}>
      {/* Petal Animation */}
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute top-0 petal"
          style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${15 + Math.random() * 10}s`,
          }}
        >
          <div className="w-4 h-4 bg-pastel-pink rounded-full opacity-50 animate-petal-fall-slow"></div>
        </div>
      ))}

      <div className="z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="glass-effect rounded-3xl p-8 md:p-16 shadow-2xl animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-4 font-serif animate-slide-up">
            Selamat Ulang Tahun, {config.girlfriendName}! 💖
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-4 mt-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            Perjalanan kita dalam warna pastel.
          </p>
          <p className="text-lg md:text-xl text-gray-600 mb-8 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            Birthday: {formatBirthday()}
          </p>

          {/* Question Section - Tanpa animasi yang bikin glitch, langsung muncul */}
          <div
            className={`mt-8 transition-opacity duration-500 ${
              showQuestion ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <p className="text-2xl md:text-3xl text-gray-800 mb-6 font-serif">
              Do you love me?
            </p>
            <div className="flex gap-4 justify-center">
              <button
                onClick={handleYes}
                aria-label="Yes, I love you"
                className="bg-gradient-to-r from-pastel-lavender to-pastel-mint text-white px-8 py-4 rounded-full text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pastel-lavender focus:ring-offset-2"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                aria-label="No, I don't love you"
                className="bg-gradient-to-r from-pastel-pink to-pastel-beige text-white px-8 py-4 rounded-full text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-pastel-pink focus:ring-offset-2"
              >
                No
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .petal {
          pointer-events: none;
        }
      `}</style>
    </div>
  );
}
