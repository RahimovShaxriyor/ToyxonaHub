import React from 'react';
import { useNavigate } from 'react-router-dom';
import { HeartHandshake, Building2 } from 'lucide-react';
import Button from '../ui/Button';

export function OwnerCtaBanner() {
  const navigate = useNavigate();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-zinc-900 text-white p-8 sm:p-12 lg:p-14 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-xl relative overflow-hidden">
        {/* Background subtle decoration */}
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-bronze/10 blur-3xl pointer-events-none" />

        <div className="space-y-3 text-center lg:text-left max-w-xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-bronze-200 text-xs font-medium">
            <HeartHandshake className="w-4 h-4" />
            <span>Mulkdorlar bilan hamkorlik</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight">
            To'yxonangiz bormi? Buyurtmalarni biz bilan qabul qiling!
          </h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            ToyxonaHub orqali to'yxonangizni minglab yangi mijozlarga taqdim eting,
            bo'sh kunlar bandligini oshiring va bron buyurtmalarini raqamli boshqaring.
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row gap-3 relative z-10 w-full sm:w-auto">
          <Button
            variant="primary"
            size="lg"
            onClick={() =>
              navigate('/login?role=OWNER', {
                state: {
                  role: 'OWNER',
                  message: "To'yxona boshqaruv kabinetiga kirish — hisobingizga kiring",
                },
              })
            }
            className="shadow-md justify-center"
          >
            <Building2 className="w-4 h-4 mr-1.5" />
            Mulkdor kabinetiga kirish
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate('/catalog')}
            className="bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 justify-center"
          >
            Katalog bilan tanishish
          </Button>
        </div>
      </div>
    </section>
  );
}

export default OwnerCtaBanner;
