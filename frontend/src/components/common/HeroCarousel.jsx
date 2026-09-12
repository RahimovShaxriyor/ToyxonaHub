import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, CalendarCheck, CreditCard, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import SearchFilterBar from './SearchFilterBar';

const SLIDES = [
  {
    id: 1,
    image: '/images/hero/hero-1.webp',
    tag: "Toshkent to'yxonalarining yagona onlayn tizimi",
    title: "To'yingiz uchun eng go'zal to'yxonani",
    highlight: "onlayn bron qiling",
    description: "Toshkent shahridagi eng nufuzli to'yxonalar, shaffof narxlar, jonli bo'sh kunlar kalendari va kafolatlangan xizmatlar yagona platformada.",
  },
  {
    id: 2,
    image: '/images/hero/hero-2.webp',
    tag: "Sara tantanalar saroylari",
    title: "Bayramingiz mukammal makondan",
    highlight: "boshlanadi",
    description: "Katta tantanalar saroylaridan shinam zallargacha — har qanday to'y uchun munosib va hashamatli maskanlar.",
  },
  {
    id: 3,
    image: '/images/hero/hero-3.webp',
    tag: "To'liq xizmatlar integratsiyasi",
    title: "Barcha to'y xizmatlari",
    highlight: "yagona tizimda",
    description: "Zal bandligi bilan birga mashhur xonandalar, kortej va maxsus taomnomalarni rasmiy bron qiling.",
  },
  {
    id: 4,
    image: '/images/hero/hero-4.webp',
    tag: "Kafolatlangan xavfsiz bron",
    title: "Shaffof narxlar va qulay",
    highlight: "20% avans",
    description: "Hech qanday yashirin to'lovlarsiz, to'yxona ma'muriyati bilan to'g'ridan-to'g'ri aloqa va onlayn buyurtma boshqaruvi.",
  },
];

const AUTOPLAY_INTERVAL = 5000;

export function HeroCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timerRef = useRef(null);

  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (!isPaused) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
      }, AUTOPLAY_INTERVAL);
    }
  }, [isPaused]);

  useEffect(() => {
    resetTimer();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [resetTimer]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
    resetTimer();
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    resetTimer();
  };

  const handleSelectSlide = (index) => {
    setCurrentSlide(index);
    resetTimer();
  };

  const current = SLIDES[currentSlide];

  return (
    <section
      className="relative min-h-[620px] sm:min-h-[680px] lg:min-h-[760px] flex items-center justify-center overflow-hidden bg-ink"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
      aria-roledescription="carousel"
      aria-label="ToyxonaHub bosh sahifa slayderi"
    >
      {/* Background Slides with Crossfade & Ambient Zoom */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none select-none">
        {SLIDES.map((slide, index) => {
          const isActive = index === currentSlide;
          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-800 ease-fade-smooth ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
              }`}
              aria-hidden={!isActive}
            >
              <img
                src={slide.image}
                alt=""
                className={`w-full h-full object-cover object-center transform-gpu ${
                  isActive ? 'animate-hero-zoom' : 'scale-100'
                }`}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding="async"
              />
            </div>
          );
        })}

        {/* Dual Gradient Overlays for High Contrast & Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink/90 via-ink/65 to-ink/95 z-20" />
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-ink/30 to-ink/80 z-20" />
      </div>

      {/* Main Content Container (Static Search Bar + Dynamic Slide Text) */}
      <div className="relative z-30 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 lg:pt-28 lg:pb-20 flex flex-col items-center text-center">
        {/* Animated Slide Copy: Changes smoothly on slide switch */}
        <div
          key={currentSlide}
          className="max-w-4xl mx-auto animate-fade-slide-up"
          aria-live="polite"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-bronze-200 text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <Sparkles className="w-4 h-4 text-bronze-300 shrink-0" />
            <span>{current.tag}</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15] text-balance drop-shadow-md">
            {current.title}{' '}
            <span className="text-bronze-300 italic font-medium drop-shadow-sm">
              {current.highlight}
            </span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed text-balance drop-shadow-xs">
            {current.description}
          </p>
        </div>

        {/* 4-Field Search Bar: Decoupled & Statically Mounted to prevent re-render or input loss */}
        <div className="mt-8 lg:mt-10 w-full max-w-4xl relative z-40">
          <SearchFilterBar variant="hero" />
        </div>

        {/* Trust Badges / Value Proposition */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs font-medium text-white/80">
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>100% rasmiy va tasdiqlangan</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
            <CalendarCheck className="w-4 h-4 text-bronze-300 shrink-0" />
            <span>Jonli bo'sh sanalar kalendari</span>
          </div>
          <div className="flex items-center gap-2 bg-white/5 backdrop-blur-xs px-3 py-1.5 rounded-full border border-white/10">
            <CreditCard className="w-4 h-4 text-blue-300 shrink-0" />
            <span>Shaffof narxlar va qulay 20% avans</span>
          </div>
        </div>

        {/* Carousel Indicators & Controls */}
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={handlePrev}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/15 backdrop-blur-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze"
            aria-label="Oldingi slayd"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2" role="tablist" aria-label="Slaydlar ko'rsatkichi">
            {SLIDES.map((slide, index) => {
              const isActive = index === currentSlide;
              return (
                <button
                  key={slide.id}
                  type="button"
                  onClick={() => handleSelectSlide(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze ${
                    isActive
                      ? 'w-8 bg-bronze-400'
                      : 'w-2.5 bg-white/40 hover:bg-white/70'
                  }`}
                  aria-label={`Slayd ${index + 1}`}
                  aria-current={isActive ? 'true' : undefined}
                />
              );
            })}
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/15 backdrop-blur-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-bronze"
            aria-label="Keyingi slayd"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

export default HeroCarousel;
