import React from 'react';
import { Mic2, Car, UtensilsCrossed, Music } from 'lucide-react';

const SERVICES = [
  {
    title: 'Xonanda va Boshlovchilar',
    description: "Sevimli san'atkorlar va tajribali boshlovchilarni to'yxona bilan birgalikda onlayn bron qiling.",
    icon: Mic2,
    badge: "Jonli ijro",
  },
  {
    title: 'Kortej Avtomobillari',
    description: "Kelin-kuyov va mehmonlar uchun hashamatli premium kortej mashinalari xizmati.",
    icon: Car,
    badge: "Premium kortej",
  },
  {
    title: 'Maxsus Taomnomalar',
    description: "To'yxonaning milliy va yevropacha taomlar to'plami hamda maxsus menyu variantlari.",
    icon: UtensilsCrossed,
    badge: "Mazali taomlar",
  },
  {
    title: 'Karnay-Surnay Ansambli',
    description: "Mehmonlarni va tantana egalarini tantanali kutib olish uchun an'anaviy milliy ansambl.",
    icon: Music,
    badge: "Milliy an'ana",
  },
];

export function WeddingServicesOverview() {
  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-10">
        <span className="text-xs font-bold uppercase tracking-wider text-bronze">
          Barchasi bitta joyda
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink mt-1">
          To'yxona bilan birga tantana xizmatlari
        </h2>
        <p className="text-sm text-muted mt-2">
          Ortiqcha vaqt sarflamasdan, to'y uchun zarur barcha asosiy xizmatlarni bitta
          bron orqali qo'shing va umumiy narxni hisoblang
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {SERVICES.map((srv) => {
          const Icon = srv.icon;
          return (
            <div
              key={srv.title}
              className="p-6 rounded-3xl bg-white border border-border/80 shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-ui flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-bronze-50 text-bronze flex items-center justify-center shadow-xs">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-semibold text-bronze bg-bronze-50/70 border border-bronze-200/50 px-2.5 py-0.5 rounded-full">
                    {srv.badge}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-lg text-ink mb-2">
                  {srv.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  {srv.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-border/70 text-xs font-medium text-ink flex items-center justify-between">
                <span className="text-muted">Bron vaqtida qo'shish:</span>
                <span className="font-semibold text-bronze">Mavjud</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default WeddingServicesOverview;
