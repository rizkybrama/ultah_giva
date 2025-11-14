// Game UI components

import { config } from '../../config';

interface InteractionProps {
  interaction: {
    type: 'bed' | 'tv' | 'letter' | 'flower' | 'cake' | 'gift' | 'sofa' | 'bookshelf' | 'chair' | null;
    show: boolean;
  };
  tvSlideIndex: number;
  tvMediaItems?: Array<{ type: 'image' | 'video'; url: string }>;
  selectedCoupons: Array<{ id: number; title: string; emoji: string }>;
  onClose: () => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
}

export function InteractionModal({
  interaction,
  tvSlideIndex,
  tvMediaItems = [],
  selectedCoupons,
  onClose,
  onPrevSlide,
  onNextSlide
}: InteractionProps) {
  if (!interaction.show) return null;

  // Get current slide image URL
  const currentSlide = tvMediaItems[tvSlideIndex];
  const currentImageUrl = currentSlide && currentSlide.type === 'image' ? currentSlide.url : null;
  const totalSlides = tvMediaItems.length;
  const canGoPrev = tvSlideIndex > 0;
  const canGoNext = tvSlideIndex < totalSlides - 1;

  // TV modal needs special fullscreen treatment
  if (interaction.type === 'tv' && interaction.show) {
    return (
      <div 
        className="fixed inset-0 bg-black pointer-events-auto flex items-center justify-center"
        style={{ zIndex: 4000 }}
        data-tv-modal="true"
      >
        {/* Close button - top right */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-2xl font-bold z-50 transition-colors shadow-lg"
          aria-label="Close"
        >
          ×
        </button>
        
        {/* Image container with navigation buttons - fullscreen */}
        <div className="relative w-full h-full" style={{ paddingBottom: '220px' }}>
          {/* Image - full width, no blackspace on sides */}
          {currentImageUrl ? (
            <div className="relative w-full h-full" style={{ height: 'calc(100vh - 220px)', overflow: 'hidden' }}>
              <img 
                src={currentImageUrl} 
                alt={`Memory ${tvSlideIndex + 1}`}
                className="w-full h-full object-cover"
                style={{ width: '100%', height: '100%', objectPosition: 'center' }}
                onError={(e) => {
                  console.error('Failed to load image:', currentImageUrl);
                  (e.target as HTMLImageElement).style.display = 'none';
                  const parent = (e.target as HTMLImageElement).parentElement;
                  if (parent) {
                    const errorMsg = document.createElement('p');
                    errorMsg.className = 'text-white text-center text-lg';
                    errorMsg.textContent = `Failed to load image ${tvSlideIndex + 1}`;
                    parent.appendChild(errorMsg);
                  }
                }}
              />
              
              {/* Prev button - left side, vertically centered with image, close to image */}
              <button
                onClick={onPrevSlide}
                disabled={!canGoPrev}
                className={`absolute left-1 md:left-2 top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold z-20 transition-all ${
                  canGoPrev 
                    ? 'bg-white/90 hover:bg-white text-gray-800 cursor-pointer shadow-lg hover:scale-110' 
                    : 'bg-gray-300/50 text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Previous"
              >
                ←
              </button>
              
              {/* Next button - right side, vertically centered with image, close to image */}
              <button
                onClick={onNextSlide}
                disabled={!canGoNext}
                className={`absolute right-1 md:right-2 top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center text-3xl md:text-4xl font-bold z-20 transition-all ${
                  canGoNext 
                    ? 'bg-white/90 hover:bg-white text-gray-800 cursor-pointer shadow-lg hover:scale-110' 
                    : 'bg-gray-300/50 text-gray-400 cursor-not-allowed'
                }`}
                aria-label="Next"
              >
                →
              </button>
              
              {/* Slide counter - bottom center of image, with padding from image */}
              <div className="absolute bottom-4 md:bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                <span className="px-4 py-2 bg-black/70 text-white text-sm md:text-base rounded-full backdrop-blur-sm">
                  {totalSlides > 0 ? `${tvSlideIndex + 1} / ${totalSlides}` : '0 / 0'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-white text-center text-lg">
              {totalSlides > 0 ? `Loading slide ${tvSlideIndex + 1}...` : 'No images available'}
            </p>
          )}
        </div>
      </div>
    );
  }

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





