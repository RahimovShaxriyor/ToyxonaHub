import React from 'react';
import { Link } from 'react-router-dom';
import { Building2 } from 'lucide-react';

export function AuthLayout({
  children,
  title,
  subtitle,
  step, // 1 for register, 2 for OTP, undefined for login
  bannerMessage,
}) {
  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-canvas">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-bronze flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold font-serif tracking-tight text-ink">
              Toyxona<span className="text-bronze">Hub</span>
            </span>
          </Link>
          <h1 className="font-serif text-2xl font-bold text-ink tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted max-w-xs mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {/* Optional Owner / Redirect Banner */}
        {bannerMessage && (
          <div className="p-3.5 rounded-xl bg-bronze-50 border border-bronze-200 text-bronze-800 text-xs font-medium text-center animate-in fade-in duration-ui">
            {bannerMessage}
          </div>
        )}

        {/* Step Indicator for Register -> OTP flow */}
        {step && (
          <div className="flex items-center justify-center gap-2 py-1">
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                step >= 1 ? 'text-bronze' : 'text-muted'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step >= 1
                    ? 'bg-bronze text-white shadow-xs'
                    : 'bg-canvas border border-border text-muted'
                }`}
              >
                1
              </span>
              <span>Ro'yxatdan o'tish</span>
            </div>
            <div
              className={`w-8 h-0.5 transition-colors duration-ui ${
                step >= 2 ? 'bg-bronze' : 'bg-border'
              }`}
            />
            <div
              className={`flex items-center gap-1.5 text-xs font-semibold ${
                step >= 2 ? 'text-bronze' : 'text-muted'
              }`}
            >
              <span
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                  step >= 2
                    ? 'bg-bronze text-white shadow-xs'
                    : 'bg-canvas border border-border text-muted'
                }`}
              >
                2
              </span>
              <span>Tasdiqlash</span>
            </div>
          </div>
        )}

        {/* Card Container with smooth inner form animation */}
        <div className="bg-white p-7 sm:p-8 rounded-3xl border border-border shadow-card animate-in fade-in slide-in-from-bottom-2 duration-form ease-spring-smooth">
          {children}
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
