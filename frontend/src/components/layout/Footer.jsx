import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Phone, MapPin } from 'lucide-react';
import { TASHKENT_DISTRICTS, getDistrictLabel } from '../../constants/districts';
import { SITE_CONFIG } from '../../config/site';

export function Footer() {
  return (
    <footer className="bg-white border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Col 1: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-bronze flex items-center justify-center text-white shadow-sm">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-serif text-ink tracking-tight">
                Toyxona<span className="text-bronze">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-muted max-w-sm leading-relaxed">
              Toshkent shahridagi eng nufuzli to'yxonalar va tantanalar saroylarini
              onlayn qidiring, bo'sh sanalarni tekshiring va rasmiy kafolatlangan
              bron qiling.
            </p>
            <div className="flex items-center gap-4 text-xs text-muted pt-2">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-bronze shrink-0" />
                <span>{SITE_CONFIG.address}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-bronze shrink-0" />
                <span>{SITE_CONFIG.supportPhone}</span>
              </div>
            </div>
          </div>

          {/* Col 2: Districts */}
          <div>
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-4">
              Tumanlar bo'yicha
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              {TASHKENT_DISTRICTS.slice(0, 6).map((dist) => (
                <li key={dist}>
                  <Link
                    to={`/catalog?district=${encodeURIComponent(dist)}`}
                    className="hover:text-bronze transition-colors"
                  >
                    {getDistrictLabel(dist)} tumani
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: More Districts */}
          <div>
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-4">
              Ko'proq tumanlar
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              {TASHKENT_DISTRICTS.slice(6, 12).map((dist) => (
                <li key={dist}>
                  <Link
                    to={`/catalog?district=${encodeURIComponent(dist)}`}
                    className="hover:text-bronze transition-colors"
                  >
                    {getDistrictLabel(dist)} tumani
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Platform */}
          <div>
            <h4 className="text-xs font-bold text-ink uppercase tracking-wider mb-4">
              Platforma
            </h4>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link to="/catalog" className="hover:text-bronze transition-colors">
                  To'yxonalar katalogi
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="hover:text-bronze transition-colors">
                  Qanday ishlaydi?
                </a>
              </li>
              <li>
                <Link
                  to="/login?role=OWNER"
                  state={{ role: 'OWNER', message: "To'yxona boshqaruv kabinetiga kirish" }}
                  className="hover:text-bronze transition-colors"
                >
                  Mulkdorlar kabineti
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-bronze transition-colors">
                  Tizimga kirish
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted">
          <p>© {new Date().getFullYear()} ToyxonaHub. Barcha huquqlar himoyalangan.</p>
          <p>Online Wedding Hall Booking System — Tashkent</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
