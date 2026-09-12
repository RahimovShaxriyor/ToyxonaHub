import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import HeroCarousel from '../../components/common/HeroCarousel';
import HallCard from '../../components/common/HallCard';
import { HallCardSkeleton } from '../../components/ui/Skeleton';
import QuickCategories from '../../components/home/QuickCategories';
import CuratedCollections from '../../components/home/CuratedCollections';
import PopularDistricts from '../../components/home/PopularDistricts';
import WeddingServicesOverview from '../../components/home/WeddingServicesOverview';
import HowItWorks from '../../components/home/HowItWorks';
import RecentlyAddedHalls from '../../components/home/RecentlyAddedHalls';
import TrustGuarantee from '../../components/home/TrustGuarantee';
import OwnerCtaBanner from '../../components/home/OwnerCtaBanner';
import { Building2, ArrowRight } from 'lucide-react';

export function HomePage() {
  // Load 8 recommended halls
  const { data, isLoading } = useQuery({
    queryKey: ['recommended-halls'],
    queryFn: () => hallsApi.getHalls({ limit: 8, sort: 'createdAt:desc' }),
  });

  const halls = data?.data?.items || data?.data || [];

  return (
    <div className="space-y-16 lg:space-y-24 pb-20">
      {/* 1. Hero Showcase Carousel with integrated search */}
      <HeroCarousel />

      {/* 2. Quick Category Chips */}
      <QuickCategories />

      {/* 3. Recommended Halls Section (4x2 grid on desktop) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-bronze">
              Tavsiya etilgan to'yxonalar
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink mt-1">
              Saralangan tantanalar saroylari
            </h2>
            <p className="text-xs sm:text-sm text-muted mt-1">
              Admin tekshiruvidan o'tgan va jonli bandlik kalendariga ega to'yxonalar
            </p>
          </div>
          <Link
            to="/catalog"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-bronze hover:text-bronze-hover group shrink-0"
          >
            Barcha to'yxonalarni ko'rish
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <HallCardSkeleton key={i} />
            ))}
          </div>
        ) : halls.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {halls.map((hall) => (
              <HallCard key={hall.id} hall={hall} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-border p-8">
            <Building2 className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-sm font-medium text-ink">
              Hozircha tasdiqlangan to'yxonalar ro'yxati yangilanmoqda.
            </p>
          </div>
        )}
      </section>

      {/* 4. Curated Collections */}
      <CuratedCollections />

      {/* 5. Popular Districts */}
      <PopularDistricts />

      {/* 6. Wedding Services Overview */}
      <WeddingServicesOverview />

      {/* 7. How It Works (4 numbered steps) */}
      <HowItWorks />

      {/* 8. Recently Added Halls (Horizontal Snap Row) */}
      <RecentlyAddedHalls />

      {/* 9. Trust & Guarantee */}
      <TrustGuarantee />

      {/* 10. Owner Partnership CTA Banner */}
      <OwnerCtaBanner />
    </div>
  );
}

export default HomePage;
