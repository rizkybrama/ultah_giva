'use client';

import { useEffect, useState, useRef } from 'react';
import { config } from '../config';

interface FinalPageProps {
  selectedCoupons?: Array<{ id: number; title: string; emoji: string }>;
  onEnterMiniGame?: () => void;
}

const DINNER_DATE_ID = 1;

export default function FinalPage({ selectedCoupons = [], onEnterMiniGame }: FinalPageProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; color: string }>>([]);
  const [displayedText, setDisplayedText] = useState('');
  const [isAnimating, setIsAnimating] = useState(true);
  const [showSkip, setShowSkip] = useState(true);
  const fullText = `${config.finalMessage.line1} ${config.finalMessage.line2}`;
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Generate confetti
    const colors = ['#FBEAEC', '#F6E7D8', '#D8C4E8', '#DCEFE7', '#E7C873'];
    const confettiArray = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));
    setConfetti(confettiArray);
  }, []);

  useEffect(() => {
    if (!isAnimating) return;

    let currentIndex = 0;
    const typeSpeed = 80; // milliseconds per character

    const typeInterval = setInterval(() => {
      if (currentIndex < fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(typeInterval);
        setIsAnimating(false);
        setShowSkip(false);
      }
    }, typeSpeed);

    return () => clearInterval(typeInterval);
  }, [isAnimating, fullText]);

  const handleSkip = () => {
    setIsAnimating(false);
    setDisplayedText(fullText);
    setShowSkip(false);
  };

  const handleHug = () => {
    // Generate WhatsApp message
    const dinnerDateCoupon = selectedCoupons.find((c) => c.id === DINNER_DATE_ID);
    const userCoupons = selectedCoupons.filter((c) => c.id !== DINNER_DATE_ID);

    // Try using emoji love with proper encoding
    // Using simpler heart emoji that works better with WhatsApp
    let message = 'Hai sayang ♥︎ kiw kiw\n\nAku sudah pilih kupon ulang tahun:\n';
    
    if (dinnerDateCoupon) {
      message += `- ${dinnerDateCoupon.title} (chosen by you)\n`;
    }
    
    userCoupons.forEach((coupon) => {
      message += `- ${coupon.title}\n`;
    });
    
    message += '\nPelukku untukmu ♥︎';

    // Try multiple encoding approaches for better emoji support
    // WhatsApp mobile app handles emoji better than WhatsApp Web
    // Note: WhatsApp Web may show emoji as question marks, but mobile app should display correctly
    let whatsappUrl: string;
    
    try {
      // Method 1: Use URLSearchParams (most compatible with UTF-8)
      const params = new URLSearchParams();
      params.set('text', message);
      whatsappUrl = `https://wa.me/${config.whatsappNumber}?${params.toString()}`;
    } catch (error) {
      // Fallback: Use encodeURIComponent directly
      const encodedMessage = encodeURIComponent(message);
      whatsappUrl = `https://wa.me/${config.whatsappNumber}?text=${encodedMessage}`;
    }

    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  // Separate dinner date and user selections for display
  const dinnerDateCoupon = selectedCoupons.find((c) => c.id === DINNER_DATE_ID);
  const userCoupons = selectedCoupons.filter((c) => c.id !== DINNER_DATE_ID);

  return (
    <div className="min-h-screen gradient-pastel flex flex-col items-center justify-center relative page-transition px-4 py-20" style={{ paddingBottom: '2rem' }}>
      {/* Confetti Animation */}
      {confetti.map((item) => (
        <div
          key={item.id}
          className="absolute top-0 w-3 h-3 rounded-full"
          style={{
            left: `${item.left}%`,
            backgroundColor: item.color,
            animationDelay: `${item.delay}s`,
            animation: 'confettiFall 8s linear infinite',
          }}
        ></div>
      ))}

      <div className="z-10 text-center max-w-4xl mx-auto w-full">
        <div className="glass-effect rounded-3xl p-8 md:p-16 shadow-2xl animate-fade-in relative">
          <h2 className="text-4xl md:text-6xl font-bold text-gray-800 mb-8 font-serif">
            Pesan Terakhir 💖
          </h2>

          {/* Typewriter Text with Hand Icon */}
          <div className="relative mb-8 min-h-[120px]">
            {/* Hand Writing Icon */}
            {isAnimating && (
              <div
                className="absolute -left-8 md:-left-12 top-0 text-4xl md:text-5xl animate-bounce-gentle"
                style={{
                  animationDuration: '2s',
                }}
              >
                ✍️
              </div>
            )}

            <div
              ref={textRef}
              className="text-xl md:text-3xl text-gray-700 leading-relaxed font-serif italic"
            >
              {displayedText}
              {isAnimating && (
                <span className="inline-block w-1 h-8 md:h-12 bg-gray-700 ml-1 animate-pulse"></span>
              )}
            </div>
          </div>

          {/* Skip Button */}
          {showSkip && (
            <button
              onClick={handleSkip}
              className="text-sm text-gray-500 hover:text-gray-700 mb-4 underline focus:outline-none focus:ring-2 focus:ring-pastel-lavender rounded"
            >
              Skip animation
            </button>
          )}

          <p className="text-lg md:text-xl text-gray-600 mb-8">
            {config.finalMessage.closing}
          </p>

          {/* Selected Coupons Summary */}
          {selectedCoupons.length > 0 && (
            <div className="mb-8 p-6 bg-white/30 rounded-2xl text-left">
              <p className="text-lg font-semibold text-gray-800 mb-4 text-center">
                Kupon Ulang Tahun yang Kamu Pilih:
              </p>
              <div className="space-y-3">
                {dinnerDateCoupon && (
                  <div className="bg-white/50 rounded-xl px-4 py-3 flex items-center gap-3">
                    <span className="text-2xl">{dinnerDateCoupon.emoji}</span>
                    <div className="flex-1">
                      <span className="text-base font-semibold text-gray-800">
                        {dinnerDateCoupon.title}
                      </span>
                      <span className="text-sm text-gray-600 ml-2">(chosen by you)</span>
                    </div>
                  </div>
                )}
                {userCoupons.map((coupon) => (
                  <div
                    key={coupon.id}
                    className="bg-white/50 rounded-xl px-4 py-3 flex items-center gap-3"
                  >
                    <span className="text-2xl">{coupon.emoji}</span>
                    <span className="text-base font-semibold text-gray-800">
                      {coupon.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 items-center">
            <button
              id="hug-button"
              onClick={handleHug}
              className="bg-gradient-to-r from-pastel-lavender to-pastel-pink text-white px-8 py-4 rounded-full text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
            >
              Kirim Peluk 🤍
            </button>
            
            {onEnterMiniGame && (
              <button
                onClick={onEnterMiniGame}
                className="bg-gradient-to-r from-pastel-mint to-pastel-beige text-white px-8 py-4 rounded-full text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Masuk ke Rumah Kenangan 🏠
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
