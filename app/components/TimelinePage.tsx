'use client';

import { useEffect, useRef, useState } from 'react';

interface TimelinePageProps {
  onNext: () => void;
}

interface Memory {
  id: number;
  title: string;
  date: string;
  description: string;
  image: string;
}

// Ganti dengan foto dan kenangan Anda sendiri
const memories: Memory[] = [
  {
    id: 1,
    title: 'Pertama Kali Bertemu',
    date: '2020-01-15',
    description: 'Hari pertama kita bertemu, aku tahu ini akan istimewa.',
    image: '/images/memory1.jpg',
  },
  {
    id: 2,
    title: 'Pertama Kali Jalan',
    date: '2020-03-20',
    description: 'Pertama kali kita jalan bareng, semua terasa sempurna.',
    image: '/images/memory2.jpg',
  },
  {
    id: 3,
    title: 'Liburan Pertama',
    date: '2021-07-10',
    description: 'Liburan pertama kita bersama, penuh tawa dan bahagia.',
    image: '/images/memory3.jpg',
  },
  {
    id: 4,
    title: 'Tahun Kedua',
    date: '2022-01-15',
    description: 'Masih sama seperti dulu, bahkan lebih dalam lagi.',
    image: '/images/memory4.jpg',
  },
];

export default function TimelinePage({ onNext }: TimelinePageProps) {
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = parseInt(entry.target.getAttribute('data-id') || '0');
            setVisibleCards((prev) => new Set([...prev, id]));
          }
        });
      },
      { threshold: 0.3 }
    );

    cardRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen gradient-mint-lavender py-20 px-4 page-transition">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-center text-gray-800 mb-16 font-serif animate-fade-in">
          Timeline Kenangan 💕
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {memories.map((memory, index) => (
            <div
              key={memory.id}
              ref={(el) => {
                if (el) cardRefs.current[index] = el;
              }}
              data-id={memory.id}
              className={`glass-effect rounded-3xl p-6 shadow-xl transition-all duration-1000 ${
                visibleCards.has(memory.id)
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-10'
              }`}
            >
              <div className="relative h-64 mb-4 rounded-2xl overflow-hidden bg-gradient-to-br from-pastel-pink to-pastel-lavender">
                {/* Placeholder untuk foto - ganti dengan foto asli */}
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  <span className="text-4xl">📸</span>
                </div>
                {/* Jika ada foto, uncomment ini:
                <img
                  src={memory.image}
                  alt={memory.title}
                  className="w-full h-full object-cover"
                />
                */}
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2 font-serif">
                {memory.title}
              </h3>
              <p className="text-gray-600 mb-2 text-sm">{memory.date}</p>
              <p className="text-gray-700">{memory.description}</p>
            </div>
          ))}
        </div>

        <div className="text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <button
            onClick={onNext}
            className="bg-gradient-to-r from-pastel-lavender to-pastel-pink text-white px-8 py-4 rounded-full text-lg md:text-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
          >
            Lanjut ke Kue 🎂
          </button>
        </div>
      </div>
    </div>
  );
}

