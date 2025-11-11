// Game UI components

import { config } from '../../config';

interface InteractionProps {
  interaction: {
    type: 'bed' | 'tv' | 'letter' | 'flower' | 'cake' | 'gift' | 'sofa' | 'bookshelf' | 'chair' | null;
    show: boolean;
  };
  tvSlideIndex: number;
  selectedCoupons: Array<{ id: number; title: string; emoji: string }>;
  onClose: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
}

export function InteractionModal({
  interaction,
  tvSlideIndex,
  selectedCoupons,
  onClose,
  onPrevSlide,
  onNextSlide
}: InteractionProps) {
  if (!interaction.show) return null;

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 glass-effect rounded-2xl p-6 max-w-md pointer-events-auto">
      {interaction.type === 'bed' && (
        <div>
          <p className="text-xl font-bold text-gray-800 mb-2">Rest & Dream</p>
          <p className="text-gray-700">Semoga kamu bisa istirahat tenang hari ini ❤️</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-pastel-lavender text-white rounded-lg"
          >
            Close
          </button>
        </div>
      )}

      {interaction.type === 'tv' && (
        <div>
          <p className="text-xl font-bold text-gray-800 mb-2">Our Memories</p>
          <div className="bg-black rounded-lg p-4 mb-4" style={{ aspectRatio: '16/9' }}>
            <p className="text-white text-center">Memory Slideshow</p>
          </div>
          <div className="flex gap-2 justify-center">
            <button
              onClick={onPrevSlide}
              className="px-4 py-2 bg-pastel-lavender text-white rounded-lg"
            >
              Prev
            </button>
            <button
              onClick={onNextSlide}
              className="px-4 py-2 bg-pastel-lavender text-white rounded-lg"
            >
              Next
            </button>
          </div>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-pastel-pink text-white rounded-lg w-full"
          >
            Close
          </button>
        </div>
      )}

      {interaction.type === 'letter' && (
        <div>
          <p className="text-xl font-bold text-gray-800 mb-4">Letter</p>
          <div className="bg-white rounded-lg p-6 mb-4">
            <p className="text-gray-700 mb-2">{config.finalMessage.line1}</p>
            <p className="text-gray-700 mb-2">{config.finalMessage.line2}</p>
            <p className="text-gray-600 text-sm mt-4">{config.finalMessage.closing}</p>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-pastel-lavender text-white rounded-lg w-full"
          >
            Close
          </button>
        </div>
      )}

      {interaction.type === 'flower' && (
        <div>
          <p className="text-xl font-bold text-gray-800 mb-2">Lily Flower</p>
          <p className="text-gray-700 mb-4">Kemurnian & ketulusan perasaan.</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-pastel-lavender text-white rounded-lg w-full"
          >
            Close
          </button>
        </div>
      )}

      {interaction.type === 'cake' && (
        <div>
          <p className="text-xl font-bold text-gray-800 mb-2">Birthday Cake</p>
          <p className="text-gray-700 mb-4">Make a wish…</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-pastel-lavender text-white rounded-lg w-full"
          >
            Close
          </button>
        </div>
      )}

      {interaction.type === 'gift' && (
        <div>
          <p className="text-xl font-bold text-gray-800 mb-2">Your Birthday Gifts</p>
          <p className="text-gray-700 mb-4">Your birthday gifts are waiting for you 💝</p>
          {selectedCoupons.length > 0 && (
            <div className="space-y-2 mb-4">
              {selectedCoupons.map((coupon) => (
                <div key={coupon.id} className="flex items-center gap-2">
                  <span className="text-2xl">{coupon.emoji}</span>
                  <span className="text-gray-700">{coupon.title}</span>
                </div>
              ))}
            </div>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 bg-pastel-lavender text-white rounded-lg w-full"
          >
            Close
          </button>
        </div>
      )}

      {interaction.type === 'sofa' && (
        <div>
          <p className="text-xl font-bold text-gray-800 mb-2">Comfy Sofa 🛋️</p>
          <p className="text-gray-700">Duduklah dan nikmati momen bersama...</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-pastel-lavender text-white rounded-lg"
          >
            Close
          </button>
        </div>
      )}

      {interaction.type === 'bookshelf' && (
        <div>
          <p className="text-xl font-bold text-gray-800 mb-2">Bookshelf 📚</p>
          <p className="text-gray-700">Banyak kenangan tersimpan di sini...</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-pastel-lavender text-white rounded-lg"
          >
            Close
          </button>
        </div>
      )}

      {interaction.type === 'chair' && (
        <div>
          <p className="text-xl font-bold text-gray-800 mb-2">Comfortable Chair 💺</p>
          <p className="text-gray-700">Tempat duduk yang nyaman untuk beristirahat...</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-pastel-lavender text-white rounded-lg"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
}



