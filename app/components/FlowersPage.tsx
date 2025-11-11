'use client';

import { useState, useEffect } from 'react';

interface FlowerMeaning {
  id: number;
  text: string;
  position: { x: number; y: number };
}

interface FlowersPageProps {
  onNext: () => void;
}

const flowerMeanings: FlowerMeaning[] = [
  {
    id: 1,
    text: 'Kamu menerangi hari seperti bunga yang mekar',
    position: { x: 15, y: 25 },
  },
  {
    id: 2,
    text: 'Kebaikanmu menyebar seperti aroma bunga di musim semi',
    position: { x: 85, y: 20 },
  },
  {
    id: 3,
    text: 'Kamu secantik taman penuh bunga setelah hujan',
    position: { x: 10, y: 60 },
  },
  {
    id: 4,
    text: 'Bersamamu seperti menerima buket bunga kejutan',
    position: { x: 90, y: 55 },
  },
  {
    id: 5,
    text: 'Seperti bunga, kamu membuat segalanya lebih hidup',
    position: { x: 20, y: 85 },
  },
  {
    id: 6,
    text: 'Kehadiranmu sehangat memeluk buket bunga',
    position: { x: 80, y: 80 },
  },
  {
    id: 7,
    text: 'Kamu selembut kelopak bunga yang jatuh tertiup angin',
    position: { x: 5, y: 40 },
  },
  {
    id: 8,
    text: 'Setiap momen bersamamu seperti bunga yang mekar',
    position: { x: 95, y: 45 },
  },
];

export default function FlowersPage({ onNext }: FlowersPageProps) {
  const [visibleBubbles, setVisibleBubbles] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Animate bubbles appearing one by one
    flowerMeanings.forEach((meaning, index) => {
      setTimeout(() => {
        setVisibleBubbles((prev) => new Set([...prev, meaning.id]));
      }, index * 200);
    });
  }, []);

  const centerX = 50;
  const centerY = 50;

  return (
    <div className="min-h-screen gradient-pastel flex flex-col items-center justify-center relative page-transition py-12 md:py-20 px-4" style={{ paddingBottom: '2rem' }}>
      <h2 className="text-3xl md:text-6xl font-bold text-gray-800 mb-6 md:mb-8 font-serif text-center animate-fade-in">
        Bunga & Makna 🌸
      </h2>

      <div className="relative w-full max-w-5xl mx-auto mb-8 md:mb-12" style={{ minHeight: '500px' }}>
        {/* Scrapbook Background */}
        <div className="relative bg-white/90 rounded-3xl shadow-2xl p-4 md:p-12 overflow-hidden" style={{ minHeight: '500px' }}>
          {/* SVG Container for All Connecting Lines */}
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: 1 }}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {flowerMeanings.map((meaning) => {
              const isVisible = visibleBubbles.has(meaning.id);
              if (!isVisible) return null;

              return (
                <line
                  key={`line-${meaning.id}`}
                  x1={centerX}
                  y1={centerY}
                  x2={meaning.position.x}
                  y2={meaning.position.y}
                  stroke="#D8C4E8"
                  strokeWidth="0.3"
                  strokeDasharray="2,2"
                  opacity="0.5"
                />
              );
            })}
          </svg>

          {/* Central Flower - Large Lily */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="relative">
              {/* Flower Emoji */}
              <div className="text-5xl md:text-[160px] text-center filter drop-shadow-lg">
                🌺
              </div>
              
              {/* Flower Label */}
              <div className="absolute -bottom-4 md:-bottom-8 left-1/2 transform -translate-x-1/2 text-center whitespace-nowrap">
                <h3 className="text-lg md:text-3xl font-bold text-gray-800 font-serif">
                  LILY
                </h3>
                <p className="text-[10px] md:text-sm text-gray-600 italic mt-1">
                  bunga favoritmu
                </p>
              </div>
            </div>
          </div>

          {/* Meaning Bubbles */}
          {flowerMeanings.map((meaning) => {
            const isVisible = visibleBubbles.has(meaning.id);
            
            // Calculate max width to prevent text overflow
            const isLeft = meaning.position.x < 50;
            const distanceFromEdge = isLeft ? meaning.position.x : (100 - meaning.position.x);
            const maxWidthValue = Math.min(distanceFromEdge * 0.8, 22); // Max 220px on desktop
            
            return (
              <div
                key={meaning.id}
                className={`absolute transition-all duration-700 ease-out ${
                  isVisible
                    ? 'opacity-100 scale-100'
                    : 'opacity-0 scale-75'
                }`}
                style={{
                  left: `${meaning.position.x}%`,
                  top: `${meaning.position.y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 2,
                }}
              >
                <div 
                  className="bg-white rounded-2xl px-3 py-2 md:px-5 md:py-3 shadow-md border border-pastel-lavender/40 hover:shadow-lg transition-shadow duration-300"
                  style={{
                    maxWidth: `${Math.min(distanceFromEdge * 0.6, 16)}rem`,
                    width: 'max-content',
                  }}
                >
                  <p 
                    className="text-[11px] md:text-sm text-gray-700 text-center leading-relaxed font-medium"
                    style={{
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      hyphens: 'auto',
                      maxWidth: '100%',
                    }}
                  >
                    {meaning.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center animate-fade-in">
        <button
          onClick={onNext}
          className="bg-gradient-to-r from-pastel-lavender to-pastel-pink text-white px-8 py-4 rounded-full text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
        >
          Buka pesan terakhir 💌
        </button>
      </div>
    </div>
  );
}
