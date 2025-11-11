'use client';

import { useState } from 'react';

interface Coupon {
  id: number;
  title: string;
  emoji: string;
}

interface CouponsPageProps {
  onNext: (selectedCoupons: Coupon[]) => void;
}

const coupons: Coupon[] = [
  { id: 1, title: 'Dinner date', emoji: '🍽️' },
  { id: 2, title: 'Movie night', emoji: '🎬' },
  { id: 3, title: 'Massage time', emoji: '💆‍♀️' },
  { id: 4, title: 'Long walk & talk', emoji: '🚶‍♂️' },
  { id: 5, title: 'Game night', emoji: '🎮' },
  { id: 6, title: 'Breakfast in bed', emoji: '🥐' },
];

const DINNER_DATE_ID = 1;

export default function CouponsPage({ onNext }: CouponsPageProps) {
  // Dinner date is pre-selected
  const [selectedCoupons, setSelectedCoupons] = useState<Coupon[]>([
    coupons.find((c) => c.id === DINNER_DATE_ID)!,
  ]);
  const [showToast, setShowToast] = useState(false);

  const handleCouponClick = (coupon: Coupon) => {
    // Dinner date is locked, cannot be deselected
    if (coupon.id === DINNER_DATE_ID) {
      return;
    }

    if (selectedCoupons.find((c) => c.id === coupon.id)) {
      // Deselect (only if not dinner date)
      setSelectedCoupons(selectedCoupons.filter((c) => c.id !== coupon.id));
    } else {
      // Select - can only add 2 more (total 3 including dinner date)
      const userSelectedCount = selectedCoupons.filter((c) => c.id !== DINNER_DATE_ID).length;
      if (userSelectedCount >= 2) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
      setSelectedCoupons([...selectedCoupons, coupon]);
    }
  };

  const handleContinue = () => {
    if (selectedCoupons.length === 3) {
      onNext(selectedCoupons);
    }
  };

  const totalSelected = selectedCoupons.length;

  return (
    <div className="min-h-screen gradient-mint-lavender py-20 px-4 page-transition">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl md:text-6xl font-bold text-center text-gray-800 mb-4 font-serif animate-fade-in">
          Choose Your Birthday Coupons 🎁🎉
        </h2>
        <p className="text-center text-base md:text-lg text-gray-700 mb-2 max-w-2xl mx-auto">
          Kamu bisa memilih 3 dari 6 hadiah berikut. &apos;Dinner date&apos; sudah aku pilih untuk kita—jadi kamu tinggal pilih 2 lagi ya. ✨
        </p>
        <p className="text-center text-lg text-gray-600 mb-8 font-semibold">
          Selected: {totalSelected} / 3
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {coupons.map((coupon) => {
            const isDinnerDate = coupon.id === DINNER_DATE_ID;
            const isSelected = selectedCoupons.some((c) => c.id === coupon.id);
            const isLocked = isDinnerDate && isSelected;

            return (
              <button
                key={coupon.id}
                onClick={() => handleCouponClick(coupon)}
                disabled={isLocked}
                className={`glass-effect rounded-3xl p-6 shadow-xl transition-all duration-300 text-left relative ${
                  isSelected
                    ? 'ring-4 ring-pastel-lavender scale-105'
                    : 'hover:scale-105'
                } ${
                  isLocked
                    ? 'opacity-90 cursor-not-allowed'
                    : 'focus:outline-none focus:ring-2 focus:ring-pastel-lavender focus:ring-offset-2'
                }`}
              >
                <div className="flex items-center gap-4">
                  <span className="text-4xl">{coupon.emoji}</span>
                  <span className="text-xl font-semibold text-gray-800">
                    {coupon.title}
                  </span>
                  {isSelected && (
                    <span className="ml-auto text-2xl">✓</span>
                  )}
                </div>
                {isLocked && (
                  <div className="absolute top-2 right-2 bg-pastel-lavender text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Chosen by me
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <div className="text-center">
          <button
            onClick={handleContinue}
            disabled={totalSelected !== 3}
            className={`px-8 py-4 rounded-full text-lg md:text-xl font-semibold shadow-lg transition-all duration-300 ${
              totalSelected === 3
                ? 'bg-gradient-to-r from-pastel-lavender to-pastel-pink text-white hover:shadow-xl transform hover:scale-105 cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            Continue
          </button>
        </div>

        {/* Toast Message */}
        {showToast && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 glass-effect rounded-2xl px-6 py-4 shadow-2xl animate-fade-in z-50">
            <p className="text-gray-800 font-medium">
              You can only add two more, love. 💕
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
