'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { config } from '../config';

interface CountdownPageProps {
  onNext: () => void;
  onAudioEnable: () => void;
}

export default function CountdownPage({ onNext, onAudioEnable }: CountdownPageProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  } | null>(null);
  const [isTimeReached, setIsTimeReached] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [animatingValues, setAnimatingValues] = useState<{
    days: boolean;
    hours: boolean;
    minutes: boolean;
    seconds: boolean;
  }>({ days: false, hours: false, minutes: false, seconds: false });
  const [isSpinning, setIsSpinning] = useState(false);
  const [confetti, setConfetti] = useState<Array<{
    id: number;
    angle: number;
    distance: number;
    delay: number;
  }>>([]);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const confettiTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<'closing' | 'opening' | null>(null);

  // Error handling untuk invalid date
  const birthdayDate = useMemo(() => {
    try {
      const date = new Date(config.birthdayDate);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return date;
    } catch (error) {
      console.error('Invalid birthday date:', error);
      return new Date(); // fallback
    }
  }, [config.birthdayDate]);

  // Format tanggal Indonesia
  const formatBirthdayDate = useMemo(() => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${birthdayDate.getDate()} ${months[birthdayDate.getMonth()]}`;
  }, [birthdayDate]);

  // Generate petal positions only on client-side to avoid hydration mismatch
  const [petals, setPetals] = useState<Array<{
    id: number;
    left: number;
    delay: number;
    duration: number;
  }>>([]);

  useEffect(() => {
    // Only generate petals on client-side after hydration
    setPetals(Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      duration: 15 + Math.random() * 10,
    })));
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = birthdayDate.getTime() - now.getTime();

      if (difference <= 0) {
        setIsTimeReached(true);
        setIsLoading(false);
        return null;
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    };

    const initialTime = calculateTimeLeft();
    setTimeLeft(initialTime);
    setIsLoading(false);

    const interval = setInterval(() => {
      const result = calculateTimeLeft();
      if (result) {
        setTimeLeft((prev) => {
          if (!prev) return result;
          
          // Check if values changed and trigger animation
          if (prev.days !== result.days) {
            setAnimatingValues(prev => ({ ...prev, days: true }));
            setTimeout(() => setAnimatingValues(prev => ({ ...prev, days: false })), 600);
          }
          if (prev.hours !== result.hours) {
            setAnimatingValues(prev => ({ ...prev, hours: true }));
            setTimeout(() => setAnimatingValues(prev => ({ ...prev, hours: false })), 600);
          }
          if (prev.minutes !== result.minutes) {
            setAnimatingValues(prev => ({ ...prev, minutes: true }));
            setTimeout(() => setAnimatingValues(prev => ({ ...prev, minutes: false })), 600);
          }
          if (prev.seconds !== result.seconds) {
            setAnimatingValues(prev => ({ ...prev, seconds: true }));
            setTimeout(() => setAnimatingValues(prev => ({ ...prev, seconds: false })), 600);
          }
          
          return result;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [birthdayDate]); // Fix: Tambahkan dependency

  const handleStart = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Get click position untuk circle reveal effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    
    // Start transition - Fase 1: Menutup (circle kecil → besar)
    setIsTransitioning(true);
    setTransitionPhase('closing');
    onAudioEnable();
    
    // Request fullscreen mode
    const requestFullscreen = () => {
      const element = document.documentElement;
      if (element.requestFullscreen) {
        element.requestFullscreen().catch((err) => {
          console.log('Fullscreen request failed:', err);
        });
      } else if ((element as any).webkitRequestFullscreen) {
        // Safari
        (element as any).webkitRequestFullscreen();
      } else if ((element as any).mozRequestFullScreen) {
        // Firefox
        (element as any).mozRequestFullScreen();
      } else if ((element as any).msRequestFullscreen) {
        // IE/Edge
        (element as any).msRequestFullscreen();
      }
    };
    
    // Request fullscreen after a short delay to ensure transition starts
    setTimeout(() => {
      requestFullscreen();
    }, 100);
    
    // Setelah menutup, navigate ke halaman baru
    // Fase 2: Membuka (circle besar → kecil) akan terjadi di halaman baru via parent component
    setTimeout(() => {
      onNext();
    }, 400); // Durasi fase menutup
  };

  const handleEmojiClick = () => {
    // Prevent multiple clicks saat animasi masih berjalan
    if (isAnimatingRef.current) return;
    
    if (!isTimeReached) {
      // Hanya spin kalau masih countdown (waiting emoji)
      // Clear timeout yang ada jika ada
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
      
      isAnimatingRef.current = true;
      setIsSpinning(true);
      
      spinTimeoutRef.current = setTimeout(() => {
        setIsSpinning(false);
        isAnimatingRef.current = false;
        spinTimeoutRef.current = null;
      }, 1000); // Durasi spin 1 detik
    } else {
      // Saat sudah hari H, klik terompet → confetti keluar
      // Clear timeout yang ada jika ada
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
      
      isAnimatingRef.current = true;
      
      const confettiCount = 9 + Math.floor(Math.random() * 4); // 9-12 confetti
      // Fokus ke atas (0°), atas kanan (30-60°), dan kanan (90°)
      const angles = [
        0, 0, 0, // 3x atas (prioritas)
        30, 45, 60, // Atas kanan
        90, 90, // 2x kanan (prioritas)
        15, 75, // Variasi antara atas dan kanan
        105, 120, // Sedikit ke kanan bawah untuk variasi
      ];
      
      const newConfetti = Array.from({ length: confettiCount }, (_, i) => {
        const angle = angles[Math.floor(Math.random() * angles.length)] || (i * 30); // Random dari angles atau fallback
        return {
          id: Date.now() + i, // Unique ID dengan timestamp
          angle: angle,
          distance: 100 + Math.random() * 50, // 100-150px
          delay: Math.random() * 0.2, // Random delay 0-0.2s
        };
      });
      
      setConfetti(newConfetti);
      
      // Clear confetti setelah animasi selesai
      confettiTimeoutRef.current = setTimeout(() => {
        setConfetti([]);
        isAnimatingRef.current = false;
        confettiTimeoutRef.current = null;
      }, 1500);
    }
  };
  
  // Cleanup timeouts saat component unmount
  useEffect(() => {
    return () => {
      if (spinTimeoutRef.current) {
        clearTimeout(spinTimeoutRef.current);
      }
      if (confettiTimeoutRef.current) {
        clearTimeout(confettiTimeoutRef.current);
      }
    };
  }, []);

  // Generate aria-label untuk accessibility
  const countdownAriaLabel = timeLeft 
    ? `Countdown menuju ulang tahun: ${timeLeft.days} hari, ${timeLeft.hours} jam, ${timeLeft.minutes} menit, ${timeLeft.seconds} detik`
    : 'Countdown ulang tahun';

  // Get dynamic description based on days left
  const getCountdownDescription = () => {
    if (!timeLeft) return config.countdownDescriptions.default;
    
    const days = timeLeft.days;
    
    if (days === 1) {
      return config.countdownDescriptions.h1; // H-1
    } else if (days === 2) {
      return config.countdownDescriptions.h2; // H-2
    } else if (days === 3) {
      return config.countdownDescriptions.h3; // H-3
    } else {
      return config.countdownDescriptions.default; // Lebih dari 3 hari
    }
  };

  return (
    <div className="min-h-screen gradient-pastel flex flex-col items-center justify-center relative page-transition" style={{ paddingBottom: '2rem' }}>
      {/* Petal Animation - Memoized */}
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute top-0 petal"
          style={{
            left: `${petal.left}%`,
            animationDelay: `${petal.delay}s`,
            animationDuration: `${petal.duration}s`,
          }}
        >
          <div className="w-3 h-3 bg-pastel-pink rounded-full opacity-60 animate-petal-fall"></div>
        </div>
      ))}

      <div className="z-10 text-center px-4 animate-fade-in w-full max-w-4xl mx-auto">
        {/* Avatar Circle - Sticker WA Animasi */}
        <div className="mb-6 md:mb-8 flex justify-center">
          <div className="relative">
            {/* Circle Avatar Container */}
            <div 
              className={`w-24 h-24 md:w-32 md:h-32 lg:w-40 lg:h-40 rounded-full bg-white/80 shadow-xl border-4 border-pastel-lavender flex items-center justify-center overflow-hidden ${
                'cursor-pointer'
              } animate-bounce-gentle`}
              onClick={handleEmojiClick}
            >
              {/* Sticker/Emoji Animasi atau Gambar */}
              {config.countdownAvatar.useEmoji ? (
                <div 
                  className={`text-5xl md:text-6xl lg:text-7xl ${
                    !isTimeReached ? 'animate-bounce-gentle' : ''
                  } ${isSpinning ? 'animate-spin-fast' : ''}`}
                  style={{ animationDuration: isSpinning ? '1s' : '2s' }}
                >
                  {isTimeReached ? config.countdownAvatar.emojiCelebration : config.countdownAvatar.emojiWaiting}
                </div>
              ) : (
                <img 
                  src={config.countdownAvatar.imagePath} 
                  alt="Sticker animasi" 
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-full bg-pastel-lavender opacity-20 blur-xl -z-10 animate-pulse"></div>
            
            {/* Confetti dari terompet saat diklik (hari H) */}
            {isTimeReached && confetti.map((conf) => {
              const radian = (conf.angle * Math.PI) / 180;
              const x = Math.cos(radian) * conf.distance;
              const y = -Math.sin(radian) * conf.distance; // Negative karena Y ke atas
              
              return (
                <div
                  key={conf.id}
                  className="absolute top-1/2 left-1/2 text-xl md:text-2xl animate-confetti-burst"
                  style={{
                    transform: `translate(-50%, -50%)`,
                    animationDelay: `${conf.delay}s`,
                    '--confetti-x': `${x}px`,
                    '--confetti-y': `${y}px`,
                  } as React.CSSProperties & { '--confetti-x': string; '--confetti-y': string }}
                >
                  🎊
                </div>
              );
            })}
            
            {/* Text splash effect dari arah jam (4 posisi) */}
            {isSpinning && (
              <>
                {/* 12 jam (atas) */}
                <div className="absolute top-1/2 left-1/2 animate-splash-out-12" style={{ transformOrigin: 'center center' }}>
                  <div className="bg-white/90 rounded-full px-3 py-1.5 shadow-lg border-2 border-pastel-lavender">
                    <span className="text-base md:text-lg font-bold text-pastel-lavender">
                      lalalala~
                    </span>
                  </div>
                </div>
                {/* 3 jam (kanan ~90°) */}
                <div className="absolute top-1/2 left-1/2 animate-splash-out-3" style={{ transformOrigin: 'center center' }}>
                  <div className="bg-white/90 rounded-full px-3 py-1.5 shadow-lg border-2 border-pastel-lavender">
                    <span className="text-base md:text-lg font-bold text-pastel-lavender">
                      Ayaanggg~
                    </span>
                  </div>
                </div>
                {/* 6 jam (bawah ~180°) */}
                <div className="absolute top-1/2 left-1/2 animate-splash-out-6" style={{ transformOrigin: 'center center' }}>
                  <div className="bg-white/90 rounded-full px-3 py-1.5 shadow-lg border-2 border-pastel-lavender">
                    <span className="text-base md:text-lg font-bold text-pastel-lavender">
                      Muah~
                    </span>
                  </div>
                </div>
                {/* 9 jam (kiri ~270°) */}
                <div className="absolute top-1/2 left-1/2 animate-splash-out-9" style={{ transformOrigin: 'center center' }}>
                  <div className="bg-white/90 rounded-full px-3 py-1.5 shadow-lg border-2 border-pastel-lavender">
                    <span className="text-base md:text-lg font-bold text-pastel-lavender">
                      Luvyuuuuu~
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Improved responsive title */}
        <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 mb-4 md:mb-6 font-serif leading-tight px-2">
          Hewooo ayangg :3
        </h1>

        {/* Description Text - Dinamis berdasarkan hari tersisa */}
        {timeLeft && !isLoading && (
          <p className="text-base md:text-lg lg:text-xl text-gray-600 mb-6 md:mb-8 px-4 max-w-2xl mx-auto animate-fade-in">
            {getCountdownDescription()}
          </p>
        )}

        {/* Loading State */}
        {isLoading && !isTimeReached && (
          <div className="glass-effect rounded-3xl p-8 md:p-12 shadow-2xl animate-pulse">
            <div className="text-gray-600">Memuat countdown...</div>
          </div>
        )}

        {/* Countdown Display */}
        {!isTimeReached && timeLeft && !isLoading && (
          <div 
            className="glass-effect rounded-3xl p-6 md:p-12 shadow-2xl"
            role="timer"
            aria-live="polite"
            aria-label={countdownAriaLabel}
          >
            {/* Improved mobile layout: 2 cols di mobile, 4 cols di desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
              <div className="text-center">
                <div 
                  key={timeLeft.days}
                  className={`text-3xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-2 transition-all duration-300 ${
                    animatingValues.days ? 'animate-beat' : ''
                  }`}
                >
                  {timeLeft.days.toString().padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm lg:text-lg text-gray-600 flex items-center justify-center gap-1">
                  <span>📅</span>
                  <span>Hari</span>
                </div>
              </div>
              <div className="text-center">
                <div 
                  key={timeLeft.hours}
                  className={`text-3xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-2 transition-all duration-300 ${
                    animatingValues.hours ? 'animate-beat' : ''
                  }`}
                >
                  {timeLeft.hours.toString().padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm lg:text-lg text-gray-600 flex items-center justify-center gap-1">
                  <span>⏰</span>
                  <span>Jam</span>
                </div>
              </div>
              <div className="text-center">
                <div 
                  key={timeLeft.minutes}
                  className={`text-3xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-2 transition-all duration-300 ${
                    animatingValues.minutes ? 'animate-beat' : ''
                  }`}
                >
                  {timeLeft.minutes.toString().padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm lg:text-lg text-gray-600 flex items-center justify-center gap-1">
                  <span>⏱️</span>
                  <span>Menit</span>
                </div>
              </div>
              <div className="text-center">
                <div 
                  key={timeLeft.seconds}
                  className={`text-3xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-2 transition-all duration-300 ${
                    animatingValues.seconds ? 'animate-beat' : ''
                  }`}
                >
                  {timeLeft.seconds.toString().padStart(2, '0')}
                </div>
                <div className="text-xs md:text-sm lg:text-lg text-gray-600 flex items-center justify-center gap-1">
                  <span>⏳</span>
                  <span>Detik</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time Reached State */}
        {isTimeReached && (
          <div className="glass-effect rounded-3xl p-8 md:p-12 shadow-2xl animate-fade-in">
            <p className="text-2xl md:text-3xl text-gray-800 mb-6">
              Waktunya tiba! 🎉
            </p>
            
            {/* Description Text saat waktu tiba */}
            <div className="mb-8 space-y-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <p className="text-base md:text-lg lg:text-xl text-gray-700 font-medium">
                Cett cett, cet cet cett, cet cet ceet~
              </p>
              <p className="text-base md:text-lg lg:text-xl text-gray-700 font-medium">
                Hari iniiiii~
              </p>
              <p className="text-base md:text-lg lg:text-xl text-gray-700 font-medium">
                Hari yang kau tungguuu~
              </p>
              <p className="text-base md:text-lg lg:text-xl text-gray-700 font-medium">
                Bertambah 1 tahuunnn~
              </p>
              <p className="text-base md:text-lg lg:text-xl text-gray-700 font-medium">
                Usiamuuu~
              </p>
            </div>
            
            <button
              onClick={handleStart}
              aria-label="Mulai perayaan dan musik"
              className="bg-gradient-to-r from-pastel-pink to-pastel-lavender text-white px-8 py-4 rounded-full text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 animate-bounce-gentle focus:outline-none focus:ring-2 focus:ring-pastel-lavender focus:ring-offset-2"
            >
              Mulai Perayaan
            </button>
          </div>
        )}
        
        {/* Netflix-style Transition Overlay - Fase Closing (circle kecil → besar) */}
        {isTransitioning && (
          <div 
            className="fixed inset-0 z-[9999] bg-black"
            style={{
              clipPath: 'circle(0% at 50% 50%)',
              animation: 'netflixClosing 0.4s cubic-bezier(0.4, 0, 0.2, 1) forwards',
            }}
          />
        )}
      </div>

      <style jsx>{`
        .petal {
          pointer-events: none;
        }
        @keyframes beat {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        .animate-beat {
          animation: beat 0.6s ease-in-out;
        }
        @keyframes spin-fast {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-fast {
          animation: spin-fast 1s linear;
        }
        @keyframes splash-out-12 {
          0% {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.3) rotate(0deg);
          }
          30% {
            opacity: 1;
            transform: translate(-50%, -80px) scale(1) rotate(5deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -120px) scale(0.7) rotate(10deg);
          }
        }
        @keyframes splash-out-3 {
          0% {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.3) rotate(0deg);
          }
          30% {
            opacity: 1;
            transform: translate(calc(-50% + 80px), 0) scale(1) rotate(-5deg);
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% + 120px), 0) scale(0.7) rotate(-10deg);
          }
        }
        @keyframes splash-out-6 {
          0% {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.3) rotate(0deg);
          }
          30% {
            opacity: 1;
            transform: translate(-50%, 80px) scale(1) rotate(0deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, 120px) scale(0.7) rotate(0deg);
          }
        }
        @keyframes splash-out-9 {
          0% {
            opacity: 0;
            transform: translate(-50%, 0) scale(0.3) rotate(0deg);
          }
          30% {
            opacity: 1;
            transform: translate(calc(-50% - 80px), 0) scale(1) rotate(5deg);
          }
          100% {
            opacity: 0;
            transform: translate(calc(-50% - 120px), 0) scale(0.7) rotate(10deg);
          }
        }
        .animate-splash-out-12 {
          animation: splash-out-12 1s ease-out forwards;
        }
        .animate-splash-out-3 {
          animation: splash-out-3 1s ease-out forwards;
        }
        .animate-splash-out-6 {
          animation: splash-out-6 1s ease-out forwards;
        }
        .animate-splash-out-9 {
          animation: splash-out-9 1s ease-out forwards;
        }
        @keyframes confetti-burst {
          0% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(0, 0) scale(0.5) rotate(0deg);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) translate(var(--confetti-x), var(--confetti-y)) scale(1.2) rotate(180deg);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -50%) translate(calc(var(--confetti-x) * 1.3), calc(var(--confetti-y) * 1.3)) scale(0.8) rotate(360deg);
          }
        }
        .animate-confetti-burst {
          animation: confetti-burst 1.5s ease-out forwards;
        }
        @keyframes netflixClosing {
          0% {
            clip-path: circle(0% at 50% 50%);
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          100% {
            clip-path: circle(150% at 50% 50%);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
