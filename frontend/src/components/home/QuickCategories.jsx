import React from 'react';
import { Link } from 'react-router-dom';
import { Users, DollarSign, Sparkles, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  {
    label: "Kichik to'ylar (200 gacha)",
    path: '/catalog?maxCapacity=200',
    icon: Users,
  },
  {
    label: "O'rtacha to'ylar (200 – 400)",
    path: '/catalog?minCapacity=200&maxCapacity=400',
    icon: Users,
  },
  {
    label: "Katta tantanalar (400+)",
    path: '/catalog?minCapacity=400',
    icon: Sparkles,
  },
  {
    label: 'Hamyonbop (300 000 gacha)',
    path: '/catalog?maxPrice=300000',
    icon: DollarSign,
  },
  {
    label: 'Katta saroylar (500+)',
    path: '/catalog?minCapacity=500',
    icon: Users,
  },
  {
    label: 'Narx bo\'yicha saralash',
    path: '/catalog?sort=pricePerSeat:asc',
    icon: ArrowRight,
  },
];

export function QuickCategories() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider shrink-0 mr-1 hidden sm:inline">
          Tezkor filtrlar:
        </span>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <Link
              key={cat.label}
              to={cat.path}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-border/90 text-ink hover:border-bronze hover:bg-bronze-50/50 hover:text-bronze text-xs font-medium shrink-0 shadow-2xs transition-all duration-ui group"
            >
              <Icon className="w-3.5 h-3.5 text-muted group-hover:text-bronze transition-colors" />
              <span>{cat.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default QuickCategories;
