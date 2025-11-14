// Coupons UI System - Birthday Coupons Selection

'use client';

import { useState } from 'react';

export interface CouponOption {
  id: string;
  title: string;
  emoji: string;
  description: string;
  locked?: boolean;
}

export const COUPON_OPTIONS: CouponOption[] = [
  {
    id: 'ayce',
    title: 'AYCE Date',
    emoji: '🍽️',
    description: 'Makan sepuasnya, aku traktir dan kamu bebas pilih restoran yang kamu mau 🍣🍰',
    locked: true // Chosen by Erbe, cannot be removed
  },
  {
    id: 'movie',
    title: 'Movie',
    emoji: '🎬',
    description: 'Nonton bareng film pilihanmu, lengkap sama popcorn dan pelukan hangat 🍿'
  },
  {
    id: 'massage',
    title: 'Massage Time',
    emoji: '💆‍♀️',
    description: 'Kita ke reflexology bareng, kamu dipijatin biar rileks dan bahagia~'
  },
  {
    id: 'karaoke',
    title: 'Karaoke',
    emoji: '🎤',
    description: 'Bernyanyi bareng lagu kesukaan, sampai serak pun gapapa 🎶'
  },
  {
    id: 'game',
    title: 'Game',
    emoji: '🎮',
    description: 'Main bareng, bisa di rumah atau online, yang penting seru bareng 💕'
  },
  {
    id: 'walk',
    title: 'Berjalan-jalan di taman',
    emoji: '🌳',
    description: 'Jalan sore sambil ngobrol santai dan menikmati udara segar bareng aku.'
  }
];

interface CouponsUIProps {
  onComplete: (selectedCoupons: string[]) => void;
  onSkip?: () => void;
}

export default function CouponsUI({ onComplete, onSkip }: CouponsUIProps) {
  const [selectedCoupons, setSelectedCoupons] = useState<string[]>(['ayce']); // AYCE is pre-selected
  const [showToast, setShowToast] = useState(false);

  const handleToggleCoupon = (couponId: string) => {
    // AYCE is locked, cannot be toggled
    if (couponId === 'ayce') return;

    const isSelected = selectedCoupons.includes(couponId);
    
    if (isSelected) {
      // Deselect
      setSelectedCoupons(selectedCoupons.filter(id => id !== couponId));
    } else {
      // Select - but max 3 total
      if (selectedCoupons.length >= 3) {
        // Show toast
        setShowToast(true);
        setTimeout(() => setShowToast(false), 2000);
        return;
      }
      setSelectedCoupons([...selectedCoupons, couponId]);
    }
  };

  const handleSend = () => {
    if (selectedCoupons.length === 3) {
      onComplete(selectedCoupons);
    }
  };

  const getCouponById = (id: string) => COUPON_OPTIONS.find(c => c.id === id);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        backgroundColor: '#FFF9F0',
        borderRadius: '20px',
        padding: '30px',
        maxWidth: '90%',
        maxHeight: '90%',
        overflowY: 'auto',
        boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        border: '3px solid #FFB6C1'
      }}>
        <h2 style={{
          textAlign: 'center',
          color: '#FF69B4',
          marginBottom: '10px',
          fontSize: '24px'
        }}>
          🎁 Birthday Coupons
        </h2>
        
        <p style={{
          textAlign: 'center',
          color: '#666',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          Pilih 2 kupon tambahan (AYCE Date sudah dipilih Erbe)
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '20px'
        }}>
          {COUPON_OPTIONS.map((coupon) => {
            const isSelected = selectedCoupons.includes(coupon.id);
            const isLocked = coupon.locked;

            return (
              <div
                key={coupon.id}
                onClick={() => !isLocked && handleToggleCoupon(coupon.id)}
                style={{
                  border: isSelected ? '3px solid #FF69B4' : '2px solid #DDD',
                  borderRadius: '15px',
                  padding: '15px',
                  backgroundColor: isSelected ? '#FFF0F5' : '#FFFFFF',
                  cursor: isLocked ? 'not-allowed' : 'pointer',
                  transition: 'all 0.3s',
                  position: 'relative',
                  opacity: isLocked ? 0.7 : 1
                }}
              >
                {isLocked && (
                  <div style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    backgroundColor: '#FF69B4',
                    color: 'white',
                    padding: '4px 8px',
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    Chosen by Erbe
                  </div>
                )}
                
                <div style={{
                  fontSize: '40px',
                  textAlign: 'center',
                  marginBottom: '10px'
                }}>
                  {coupon.emoji}
                </div>
                
                <div style={{
                  fontWeight: 'bold',
                  textAlign: 'center',
                  marginBottom: '5px',
                  color: '#333'
                }}>
                  {coupon.title}
                </div>
                
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  textAlign: 'center'
                }}>
                  {coupon.description}
                </div>

                {isSelected && !isLocked && (
                  <div style={{
                    position: 'absolute',
                    top: '5px',
                    left: '5px',
                    width: '25px',
                    height: '25px',
                    backgroundColor: '#FF69B4',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}>
                    ✓
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div style={{
          textAlign: 'center',
          marginBottom: '15px',
          fontSize: '16px',
          color: '#FF69B4',
          fontWeight: 'bold'
        }}>
          Selected: {selectedCoupons.length}/3
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          justifyContent: 'center'
        }}>
          <button
            onClick={handleSend}
            disabled={selectedCoupons.length !== 3}
            style={{
              padding: '12px 24px',
              backgroundColor: selectedCoupons.length === 3 ? '#FF69B4' : '#DDD',
              color: selectedCoupons.length === 3 ? 'white' : '#999',
              border: 'none',
              borderRadius: '25px',
              cursor: selectedCoupons.length === 3 ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            Kirim ke Erbe 🤍
          </button>
        </div>

        {showToast && (
          <div style={{
            position: 'fixed',
            top: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            backgroundColor: '#FF69B4',
            color: 'white',
            padding: '15px 25px',
            borderRadius: '25px',
            boxShadow: '0 5px 15px rgba(0, 0, 0, 0.3)',
            zIndex: 3000,
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            You can only add two more, love.
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to generate WhatsApp message
export function generateWhatsAppMessage(selectedCouponIds: string[]): string {
  const coupons = selectedCouponIds.map(id => {
    const coupon = COUPON_OPTIONS.find(c => c.id === id);
    return coupon ? `${coupon.emoji} ${coupon.title}` : id;
  });

  const ayceCoupon = COUPON_OPTIONS.find(c => c.id === 'ayce');
  const otherCoupons = selectedCouponIds
    .filter(id => id !== 'ayce')
    .map(id => {
      const coupon = COUPON_OPTIONS.find(c => c.id === id);
      return coupon ? `${coupon.emoji} ${coupon.title}` : id;
    });

  return `Hai ayang 💖

Aku udah pilih kupon ulang tahunku yaa~
- ${ayceCoupon?.emoji} ${ayceCoupon?.title} (chosen by you)
${otherCoupons.map(c => `- ${c}`).join('\n')}

Siap-siap ya, semua harus kamu tepati 😝
Luvyuuu 🤍`;
}

