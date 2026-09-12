import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles, Heart, DollarSign } from 'lucide-react';

const COLLECTIONS = [
  {
    title: 'Katta tantanalar va saroylar',
    description: "400 kishidan ortiq keng va hashamatli tantanalar saroylari",
    image: '/images/halls/hall-mumtoz.webp',
    link: '/catalog?minCapacity=400',
    tag: "400+ kishi",
    icon: Sparkles,
  },
  {
    title: 'Ixcham va shinam to\'yxonalar',
    description: "200 kishigacha bo'lgan yaqinlar davrasi va qulay muhit",
    image: '/images/halls/hall-sultonsaroy.webp',
    link: '/catalog?maxCapacity=200',
    tag: "200 gacha",
    icon: Heart,
  },
  {
    title: 'Hamyonbop va qulay narxlar',
    description: "300 000 so'mgacha qulay narxdagi to'yxonalar to'plami",
    image: '/images/halls/hall-charxpalak.webp',
    link: '/catalog?maxPrice=300000',
    tag: "Qulay byudjet",
    icon: DollarSign,
  },
];

export function CuratedCollections() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-bronze">
          Maxsus to'plamlar
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink mt-1">
          Har qanday orzu va byudjet uchun
        </h2>
        <p className="text-sm text-muted mt-1 max-w-xl">
          To'y marosimingiz ko'lamiga mos to'yxonalar to'plami bilan tanishing
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {COLLECTIONS.map((col) => {
          const Icon = col.icon;
          return (
            <Link
              key={col.title}
              to={col.link}
              className="group relative h-80 rounded-3xl overflow-hidden border border-border/80 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 flex flex-col justify-end p-6"
            >
              {/* Background Image with Overlay */}
              <img
                src={col.image}
                alt={col.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/40 to-transparent" />

              {/* Content */}
              <div className="relative z-10 space-y-2 text-white">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs text-[11px] font-semibold tracking-wide">
                  <Icon className="w-3.5 h-3.5 text-bronze-200" />
                  <span>{col.tag}</span>
                </div>
                <h3 className="font-serif font-bold text-xl leading-snug group-hover:text-bronze-200 transition-colors">
                  {col.title}
                </h3>
                <p className="text-xs text-white/80 line-clamp-2 leading-relaxed">
                  {col.description}
                </p>
                <div className="pt-2 flex items-center gap-1.5 text-xs font-semibold text-bronze-300 group-hover:text-white transition-colors">
                  <span>To'yxonalarni ko'rish</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default CuratedCollections;
