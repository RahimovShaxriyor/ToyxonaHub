import React, { useState } from 'react';
import { Building2 } from 'lucide-react';

export function ImageGallery({ images = [], hallName = "To'yxona" }) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [failedImages, setFailedImages] = useState({});

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-80 sm:h-96 rounded-2xl bg-zinc-100 border border-border flex flex-col items-center justify-center text-muted">
        <Building2 className="w-16 h-16 text-bronze/40 mb-3" />
        <p className="text-sm font-medium">Ushbu to'yxona uchun hozircha suratlar yuklanmagan</p>
      </div>
    );
  }

  // Determine active image
  const activeImage = images[selectedIdx] || images[0];
  const isFailed = failedImages[activeImage.id || selectedIdx];

  const handleImageError = (id) => {
    setFailedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <div className="space-y-3">
      {/* Hero Display */}
      <div className="relative h-80 sm:h-[420px] rounded-2xl overflow-hidden border border-border bg-zinc-100">
        {!isFailed ? (
          <img
            src={activeImage.url}
            alt={`${hallName} - ${selectedIdx + 1}`}
            onError={() => handleImageError(activeImage.id || selectedIdx)}
            className="w-full h-full object-cover transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted">
            <Building2 className="w-12 h-12 text-bronze/40 mb-2" />
            <p className="text-xs">Suratni yuklab bo'lmadi</p>
          </div>
        )}

        <div className="absolute bottom-3 right-3 bg-ink/70 backdrop-blur-xs text-white text-xs font-medium px-3 py-1 rounded-full">
          {selectedIdx + 1} / {images.length}
        </div>
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3 overflow-x-auto pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id || idx}
              type="button"
              onClick={() => setSelectedIdx(idx)}
              className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                selectedIdx === idx
                  ? 'border-bronze ring-2 ring-bronze/20 shadow-sm'
                  : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img
                src={img.url}
                alt={`${hallName} kichik rasm ${idx + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ImageGallery;
