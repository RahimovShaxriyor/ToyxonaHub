import React from 'react';
import { Calendar, Calculator, ShieldCheck, CreditCard } from 'lucide-react';

const TRUST_POINTS = [
  {
    title: "Jonli oylik kalendar",
    description: "To'yxonaning band va bo'sh kunlari to'g'ridan-to'g'ri tizim bazasidan olinadi va ko'rsatiladi.",
    icon: Calendar,
  },
  {
    title: "Server hisoblagan shaffof narx",
    description: "Mehmonlar soni va tanlangan xizmatlar narxi serverda aniq hisoblanadi, yashirin komissiyalarsiz.",
    icon: Calculator,
  },
  {
    title: "20% qulay avans to'lovi",
    description: "To'liq summani oldindan to'lash talab etilmaydi, 20% avans to'lovi orqali buyurtma qat'iy tasdiqlanadi.",
    icon: CreditCard,
  },
  {
    title: "Admin tasdiqlagan to'yxonalar",
    description: "Katalogdagi barcha to'yxonalar va ularning ma'lumotlari moderatorlar tomonidan tekshiriladi.",
    icon: ShieldCheck,
  },
];

export function TrustGuarantee() {
  return (
    <section className="bg-canvas border-y border-border/80 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-bronze">
            Ishonch va qulaylik
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-ink mt-1">
            Nima uchun ToyxonaHub?
          </h2>
          <p className="text-sm text-muted mt-2">
            To'y tantanasini tashkil etishda shaffoflik va zamonaviy raqamli qulayliklar
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {TRUST_POINTS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="p-6 rounded-2xl bg-white border border-border/80 shadow-2xs hover:border-bronze transition-colors duration-ui"
              >
                <div className="w-12 h-12 rounded-xl bg-bronze-50 text-bronze flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-serif font-bold text-base text-ink mb-1.5">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TrustGuarantee;
