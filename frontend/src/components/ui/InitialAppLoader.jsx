import React from 'react';
import { Building2 } from 'lucide-react';

export function InitialAppLoader() {
  return (
    <div
      role="status"
      aria-label="Ilova yuklanmoqda"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas transition-opacity duration-ui"
    >
      <div className="flex flex-col items-center space-y-4 animate-in fade-in duration-ui">
        {/* Brand Icon */}
        <div className="w-14 h-14 rounded-2xl bg-bronze flex items-center justify-center text-white shadow-md">
          <Building2 className="w-7 h-7" />
        </div>

        {/* Brand Title */}
        <div className="text-center">
          <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">
            Toyxona<span className="text-bronze">Hub</span>
          </h1>
          <p className="text-xs text-muted mt-0.5 tracking-wider uppercase">
            Toshkent to'yxonalari
          </p>
        </div>

        {/* Subtle Bronze Shimmer Line */}
        <div className="w-32 h-[2px] bg-border rounded-full overflow-hidden relative mt-2">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-bronze to-transparent animate-[top-progress-indeterminate_1.5s_infinite_linear]" />
        </div>
      </div>
    </div>
  );
}

export default InitialAppLoader;
