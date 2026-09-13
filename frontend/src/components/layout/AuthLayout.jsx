import React, { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Calendar, Sparkles } from 'lucide-react';
import { hallsApi } from '../../api/halls.api';
import { formatDate } from '../../utils/formatters';

export function AuthLayout({ children }) {
  const location = useLocation();
  const [pendingDraft, setPendingDraft] = useState(null);
  const [fetchedHallName, setFetchedHallName] = useState('');

  // Detect active pending booking in sessionStorage
  useEffect(() => {
    try {
      let foundDraft = null;
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.startsWith('toyxonahub_pending_booking_')) {
          const raw = sessionStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw);
            const hallId = key.replace('toyxonahub_pending_booking_', '');
            foundDraft = { hallId, ...parsed };
            break;
          }
        }
      }
      setPendingDraft(foundDraft);

      // If draft has hallId but no hallName, fetch name from API
      if (foundDraft && foundDraft.hallId && !foundDraft.hallName) {
        hallsApi
          .getHallById(foundDraft.hallId)
          .then((res) => {
            const h = res.data || res;
            if (h?.name) setFetchedHallName(h.name);
          })
          .catch(() => {});
      }
    } catch {
      setPendingDraft(null);
    }
  }, [location.pathname]);

  const displayHallName = pendingDraft?.hallName || fetchedHallName;

  return (
    <div className="min-h-[calc(100vh-5rem)] flex flex-col lg:flex-row bg-canvas">
      {/* Desktop Left Brand Showcase Column */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-ink select-none">
        <img
          src="/images/auth/auth-wedding-hall.webp"
          alt="ToyxonaHub Tantanalar Saroyi"
          className="absolute inset-0 w-full h-full object-cover object-center"
          loading="eager"
        />
        {/* Rich Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/65 to-ink/20" />

        {/* Content Over Overlay */}
        <div className="relative z-10 flex flex-col justify-between p-12 lg:p-16 w-full text-white">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-bronze-200 w-fit">
            <Sparkles className="w-3.5 h-3.5 text-bronze-300" />
            <span>ToyxonaHub • Rasmiy Portal</span>
          </div>

          <div className="space-y-4 max-w-lg">
            <h2 className="font-serif text-3xl xl:text-4xl font-bold leading-tight tracking-tight text-white">
              Toshkentning eng sara to'yxonalari va tantanalar saroylari
            </h2>
            <p className="text-sm xl:text-base text-white/80 leading-relaxed font-light">
              Orzuingizdagi to'yni ortiqcha tashvishlarsiz, shaffof narxlar va 20% avans bilan qulay bron qiling.
            </p>
          </div>

          <div className="pt-6 border-t border-white/10 flex items-center justify-between text-xs text-white/60">
            <span>© 2026 ToyxonaHub. Barcha huquqlar himoyalangan.</span>
            <span>Xavfsiz va ishonchli</span>
          </div>
        </div>
      </div>

      {/* Right Column: Form Container Surface */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-4 sm:px-8 lg:px-12 py-8 sm:py-12 bg-canvas overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          {/* Pending Booking Context Banner if active */}
          {pendingDraft && (
            <div
              role="status"
              className="p-4 rounded-2xl bg-bronze-50 border border-bronze-200 text-ink shadow-xs animate-in fade-in duration-ui"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-bronze/15 text-bronze flex items-center justify-center shrink-0 mt-0.5">
                  <Calendar className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-bronze uppercase tracking-wider">
                    Siz bronni davom ettiryapsiz
                  </p>
                  {displayHallName && (
                    <p className="text-sm font-bold text-ink truncate mt-0.5">
                      {displayHallName}
                    </p>
                  )}
                  <p className="text-xs text-muted mt-0.5">
                    {pendingDraft.selectedDate ? `${formatDate(pendingDraft.selectedDate)}` : ''}
                    {pendingDraft.selectedDate && pendingDraft.guestCount ? ' • ' : ''}
                    {pendingDraft.guestCount ? `${pendingDraft.guestCount} mehmon` : ''}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Render Active Route Child or Passed Children */}
          {children || <Outlet />}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
