  import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users, MapPin, ArrowRight, Building2 } from 'lucide-react';
import { formatPrice } from '../../utils/formatters';
import Badge from '../ui/Badge';

export function HallCard({ hall }) {
  const [imgError, setImgError] = useState(false);

  // Find primary image or first available image
  const primaryImage = hall.images?.find((img) => img.isPrimary) || hall.images?.[0];
  const imageUrl = primaryImage?.url;

  return (
    <div className="group bg-white rounded-2xl border border-border overflow-hidden shadow-card hover:shadow-card-hover hover:-translate-y-1 hover:border-border-dark transition-all duration-250 ease-out flex flex-col">
      {/* Image container */}
      <div className="relative h-56 bg-zinc-100 overflow-hidden">
        {imageUrl && !imgError ? (
          <img
            src={imageUrl}
            alt={hall.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-400 ease-out"
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-bronze-100/60 to-zinc-100 text-bronze/60">
            <Building2 className="w-12 h-12 mb-2 stroke-1" />
            <span className="text-xs font-medium text-muted">Surat mavjud emas</span>
          </div>
        )}

        {/* District badge */}
        <div className="absolute top-3 left-3">
          <Badge variant="bronze" size="sm" className="bg-white/95 backdrop-blur-xs shadow-xs">
            <MapPin className="w-3 h-3 text-bronze" />
            {hall.district}
          </Badge>
        </div>
      </div>

      {/* Hall details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-serif font-bold text-lg text-ink group-hover:text-bronze transition-colors line-clamp-1">
            {hall.name}
          </h3>
          <p className="text-xs text-muted mt-1 line-clamp-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-muted" />
            {hall.address}
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs text-muted">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-bronze shrink-0" />
              <span>{hall.capacity} kishilik</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="mt-5 pt-4 border-t border-border/80 flex items-center justify-between">
          <div>
            <span className="text-[11px] text-muted block leading-none">O'rindiq narxi:</span>
            <span className="text-base font-bold text-ink block mt-1">
              {formatPrice(hall.pricePerSeat)}
            </span>
          </div>

          <Link
            to={`/halls/${hall.id}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-bronze group-hover:text-bronze-hover group-hover:translate-x-0.5 transition-all"
          >
            Ko'rish
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default HallCard;
