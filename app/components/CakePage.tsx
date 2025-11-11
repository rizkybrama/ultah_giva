'use client';

import { useState } from 'react';

interface CakePageProps {
  onNext: () => void; // Navigate to Coupons
}

interface Heart {
  id: number;
  x: number;
  delay: number;
}

export default function CakePage({ onNext }: CakePageProps) {
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const [hearts, setHearts] = useState<Heart[]>([]);

  const handleBlowCandle = () => {
    if (!candlesBlown) {
      setCandlesBlown(true);
      
      // Generate hearts
      const heartCount = 8 + Math.floor(Math.random() * 6); // 8-14 hearts
      const newHearts = Array.from({ length: heartCount }, (_, i) => ({
        id: i,
        x: 40 + Math.random() * 20, // Random position around center
        delay: Math.random() * 0.3,
      }));
      setHearts(newHearts);

      setTimeout(() => {
        setShowMessage(true);
      }, 1600);
    }
  };

  return (
    <div className="min-h-screen gradient-pastel flex flex-col items-center justify-center relative page-transition" style={{ paddingBottom: '2rem' }}>
      <div className="z-10 text-center px-4 max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-12 font-serif animate-fade-in">
          Kue Ulang Tahun 🎂
        </h2>

        <div className="relative mb-8">
          {/* Cake SVG */}
          <svg
            width="400"
            height="350"
            viewBox="0 0 400 350"
            className="w-full max-w-md mx-auto"
          >
            {/* Cake Base */}
            <rect
              x="100"
              y="200"
              width="200"
              height="100"
              fill="#F6E7D8"
              rx="20"
            />
            <rect
              x="120"
              y="180"
              width="160"
              height="40"
              fill="#FBEAEC"
              rx="15"
            />
            <rect
              x="140"
              y="160"
              width="120"
              height="30"
              fill="#D8C4E8"
              rx="10"
            />

            {/* Decoration */}
            <circle cx="150" cy="175" r="8" fill="#E7C873" />
            <circle cx="200" cy="175" r="8" fill="#E7C873" />
            <circle cx="250" cy="175" r="8" fill="#E7C873" />

            {/* Candles */}
            {[170, 200, 230].map((x, i) => (
              <g key={i}>
                {/* Candle Stick */}
                <rect
                  x={x - 3}
                  y="140"
                  width="6"
                  height="25"
                  fill="#FFF"
                />
                {/* Flame */}
                {!candlesBlown ? (
                  <g className="animate-flame-flicker">
                    <ellipse
                      cx={x}
                      cy="135"
                      rx="4"
                      ry="8"
                      fill="#FFD700"
                      opacity="0.9"
                    />
                    <ellipse
                      cx={x}
                      cy="132"
                      rx="2"
                      ry="5"
                      fill="#FFA500"
                      opacity="0.8"
                    />
                  </g>
                ) : (
                  <g>
                    {/* Smoke */}
                    <circle
                      cx={x}
                      cy="130"
                      r="3"
                      fill="#D3D3D3"
                      opacity="0.6"
                      className="animate-petal-fall"
                    />
                    <circle
                      cx={x + 2}
                      cy="128"
                      r="2"
                      fill="#D3D3D3"
                      opacity="0.4"
                      className="animate-petal-fall"
                      style={{ animationDelay: '0.2s' }}
                    />
                  </g>
                )}
              </g>
            ))}
          </svg>

          {/* Love Hearts Animation */}
          {hearts.map((heart) => (
            <div
              key={heart.id}
              className="absolute text-2xl md:text-3xl"
              style={{
                left: `${heart.x}%`,
                top: '50%',
                marginTop: '-120px',
                animation: `heartFly 1.6s ease-out forwards`,
                animationDelay: `${heart.delay}s`,
                pointerEvents: 'none',
              }}
            >
              💖
            </div>
          ))}

          {/* Clickable Area */}
          {!candlesBlown && (
            <button
              onClick={handleBlowCandle}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-transparent border-2 border-dashed border-pastel-lavender rounded-full opacity-50 hover:opacity-100 transition-opacity cursor-pointer"
              style={{ marginTop: '-120px' }}
            >
              <span className="text-sm text-gray-600">Klik untuk meniup</span>
            </button>
          )}
        </div>

        {showMessage && (
          <div className="glass-effect rounded-3xl p-8 md:p-12 shadow-2xl animate-fade-in">
            <p className="text-2xl md:text-3xl text-gray-800 mb-8 font-serif">
              Make a wish…
            </p>
            <button
              onClick={onNext}
              className="bg-gradient-to-r from-pastel-lavender to-pastel-mint text-white px-8 py-4 rounded-full text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Pilih Kupon Hadiah 🎁
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes heartFly {
          0% {
            opacity: 1;
            transform: translateY(0) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translateY(-150px) rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
