import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { MapPin, ArrowRight } from 'lucide-react';
import { TASHKENT_DISTRICTS, getDistrictLabel } from '../../constants/districts';

export function PopularDistricts() {
  // Query all halls to compute real district counts accurately
  const { data } = useQuery({
    queryKey: ['all-halls-district-counts'],
    queryFn: () => hallsApi.getHalls({ limit: 100 }),
    staleTime: 1000 * 60 * 5,
  });

  // Compute actual counts per district
  const districtCounts = React.useMemo(() => {
    const items = data?.data?.items || data?.data;
    if (!Array.isArray(items) || items.length === 0) return null;
    const counts = {};
    for (const hall of items) {
      if (hall.district) {
        counts[hall.district] = (counts[hall.district] || 0) + 1;
      }
    }
    return counts;
  }, [data]);

  // Highlight the primary 8 districts
  const displayDistricts = TASHKENT_DISTRICTS.slice(0, 8);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-bronze">
            Hududlar bo'yicha qidiruv
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink mt-1">
            Toshkent tumanlari
          </h2>
          <p className="text-sm text-muted mt-1">
            O'zingizga qulay tumandagi to'yxonalarni tez va oson toping
          </p>
        </div>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-bronze hover:text-bronze-hover group"
        >
          Barcha tumanlar
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {displayDistricts.map((dist) => {
          const count = districtCounts ? districtCounts[dist] || 0 : null;

          return (
            <Link
              key={dist}
              to={`/catalog?district=${encodeURIComponent(dist)}`}
              className="p-4 rounded-2xl bg-white border border-border/80 hover:border-bronze hover:shadow-card hover:-translate-y-0.5 transition-all duration-ui group flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-bronze-50 text-bronze flex items-center justify-center group-hover:bg-bronze group-hover:text-white transition-colors duration-ui">
                  <MapPin className="w-4 h-4" />
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted group-hover:text-bronze group-hover:translate-x-0.5 transition-all" />
              </div>

              <div>
                <h3 className="font-serif font-bold text-sm sm:text-base text-ink group-hover:text-bronze transition-colors line-clamp-1">
                  {getDistrictLabel(dist)} tumani
                </h3>
                {count !== null ? (
                  <p className="text-xs text-muted mt-0.5">
                    {count > 0 ? `${count} ta to'yxona` : "Hozircha bo'sh"}
                  </p>
                ) : (
                  <p className="text-xs text-muted mt-0.5">To'yxonalarni ko'rish</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default PopularDistricts;
