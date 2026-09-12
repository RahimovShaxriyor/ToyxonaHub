import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { formatPrice } from '../../utils/formatters';
import { ChevronLeft, ChevronRight, MapPin, Users, ArrowRight, Building2 } from 'lucide-react';

export function RecentlyAddedHalls() {
  const scrollRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['recently-added-halls'],
    queryFn: () => hallsApi.getHalls({ limit: 8, sort: 'createdAt:desc' }),
  });

  const halls = data?.data?.items || data?.data || [];

  const handleScroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  if (!isLoading && halls.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-bronze">
            Yangi qo'shilganlar
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink mt-1">
            Yaqinda tizimga ulangan to'yxonalar
          </h2>
        </div>

        {/* Scroll Controls (Desktop & Tablet) */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleScroll('left')}
            className="w-9 h-9 rounded-xl border border-border bg-white flex items-center justify-center text-ink hover:border-bronze hover:text-bronze transition-colors shadow-2xs"
            aria-label="Oldingi to'yxonalar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => handleScroll('right')}
            className="w-9 h-9 rounded-xl border border-border bg-white flex items-center justify-center text-ink hover:border-bronze hover:text-bronze transition-colors shadow-2xs"
            aria-label="Keyingi to'yxonalar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Snap Scroll Row */}
      <div
        ref={scrollRef}
        className="flex items-stretch gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none"
      >
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="w-72 sm:w-80 shrink-0 h-64 rounded-2xl bg-zinc-100 animate-pulse"
              />
            ))
          : halls.map((hall) => {
              const primaryImage =
                hall.images?.find((img) => img.isPrimary) || hall.images?.[0];
              const imageUrl = primaryImage?.url;

              return (
                <div
                  key={hall.id}
                  className="w-72 sm:w-80 shrink-0 snap-start bg-white rounded-2xl border border-border overflow-hidden shadow-2xs hover:shadow-card hover:border-border-dark transition-all duration-ui flex flex-col justify-between group"
                >
                  <div className="relative h-44 bg-zinc-100 overflow-hidden">
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={hall.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400 ease-out"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 text-muted">
                        <Building2 className="w-8 h-8 stroke-1 mb-1" />
                        <span className="text-[11px]">Surat yo'q</span>
                      </div>
                    )}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-semibold text-bronze shadow-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-bronze" />
                      <span>{hall.district}</span>
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif font-bold text-base text-ink group-hover:text-bronze transition-colors line-clamp-1">
                        {hall.name}
                      </h3>
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                        <Users className="w-3.5 h-3.5 text-bronze shrink-0" />
                        <span>{hall.capacity} kishilik</span>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-muted block">O'rindiq narxi:</span>
                        <span className="text-sm font-bold text-ink">
                          {formatPrice(hall.pricePerSeat)}
                        </span>
                      </div>
                      <Link
                        to={`/halls/${hall.id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-bronze group-hover:text-bronze-hover group-hover:translate-x-0.5 transition-all"
                      >
                        Batafsil
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </section>
  );
}

export default RecentlyAddedHalls;
