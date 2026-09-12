import React from 'react';
import { Search, CalendarCheck, Sparkles, CreditCard } from 'lucide-react';

const STEPS = [
  {
    step: 1,
    title: "Qidiruv va saralash",
    description: "Tuman, mehmonlar sig'imi va byudjet bo'yicha to'yxonalarni saralang va taqqoslang.",
    icon: Search,
  },
  {
    step: 2,
    title: "Jonli bo'sh sanani tanlash",
    description: "To'yxonaning interaktiv oylik kalendaridan yashil rangdagi bo'sh kunni belgilang.",
    icon: CalendarCheck,
  },
  {
    step: 3,
    title: "Xizmatlarni moslashtirish",
    description: "Xonanda, kortej, maxsus menyu va karnay-surnay xizmatlarini bir bosishda qo'shing.",
    icon: Sparkles,
  },
  {
    step: 4,
    title: "20% avans va rasmiy bron",
    description: "Server tomonidan aniq hisoblangan narx bo'yicha 20% avans to'lab, sana kafolatiga ega bo'ling.",
    icon: CreditCard,
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-white border-y border-border py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold uppercase tracking-wider text-bronze">
            Oddiy va shaffof jarayon
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink mt-1">
            Qanday qilib to'yxona bron qilinadi?
          </h2>
          <p className="text-sm text-muted mt-2">
            Uydan chiqmasdan, ortiqcha ovoragarchiliklarsiz to'yingizni onlayn rejalashtiring
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="p-6 rounded-2xl bg-canvas border border-border/80 flex flex-col items-center text-center hover:border-border-dark transition-colors duration-ui"
              >
                <div className="relative mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-bronze text-white flex items-center justify-center shadow-sm">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-ink text-white font-serif font-bold text-xs flex items-center justify-center shadow-xs">
                    {s.step}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-base text-ink mb-2">
                  {s.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  {s.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
