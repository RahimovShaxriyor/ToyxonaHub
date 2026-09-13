import React, { useState } from 'react';
import { useSearchParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import OtpInput from '../../components/ui/OtpInput';
import { Building2, Mail, CheckCircle2 } from 'lucide-react';

export function OtpVerificationPage() {
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [hasError, setHasError] = useState(false);

  const { verifyOtp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleCodeChange = (newCode) => {
    setCode(newCode);
    if (hasError) setHasError(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || code.length < 6) {
      toast.error('Iltimos, 6 xonali tasdiqlash kodini to\'liq kiriting.');
      setHasError(true);
      return;
    }

    setIsLoading(true);
    setHasError(false);
    try {
      const result = await verifyOtp(email, code.trim());
      setIsSuccess(true);
      toast.success('Pochta muvaffaqiyatli tasdiqlandi!');

      // Short check animation ~220ms then redirect immediately
      setTimeout(() => {
        if (result.user?.role === 'OWNER') {
          navigate('/owner/dashboard', { replace: true });
        } else if (result.user?.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
        } else {
          const from = location.state?.from?.pathname || '/';
          navigate(from, { replace: true });
        }
      }, 240);
    } catch (err) {
      setHasError(true);
      toast.error(err.response?.data?.message || 'Kod noto\'g\'ri yoki muddati o\'tgan.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 auth-enter-neutral">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-bronze flex items-center justify-center text-white shadow-md transition-transform duration-fast group-hover:scale-105">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="text-2xl font-bold font-serif tracking-tight text-ink">
            Toyxona<span className="text-bronze">Hub</span>
          </span>
        </Link>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink tracking-tight">
          Pochtani tasdiqlash
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-xs mx-auto">
          {email
            ? `${email} manziliga yuborilgan 6 xonali kodni kiriting`
            : 'Elektron pochtangizga yuborilgan kodni kiriting'}
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 py-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-emerald-600 text-white shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </span>
          <span>Ro'yxatdan o'tish</span>
        </div>
        <div className="w-8 h-0.5 bg-emerald-600 transition-colors duration-ui" />
        <div className="flex items-center gap-1.5 text-xs font-semibold text-bronze">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-bronze text-white shadow-xs">
            2
          </span>
          <span>Tasdiqlash</span>
        </div>
      </div>

      {/* Form Card Container */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-border shadow-card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {!emailFromQuery && (
            <Input
              label="Elektron pochta"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@mail.uz"
              leftIcon={Mail}
              required
            />
          )}

          <div className="space-y-2">
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider text-center">
              Tasdiqlash kodi
            </label>
            <OtpInput
              value={code}
              onChange={handleCodeChange}
              length={6}
              disabled={isLoading || isSuccess}
              error={hasError}
              autoFocus={true}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center mt-2 shadow-sm"
            isLoading={isLoading}
            loadingText="Tekshirilmoqda..."
            isSuccess={isSuccess}
          >
            {isSuccess ? 'Tasdiqlandi!' : 'Kodni tasdiqlash'}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/80 text-center text-xs text-muted">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="font-bold text-bronze hover:underline transition-colors duration-fast"
          >
            Kirish sahifasiga qaytish
          </button>
        </div>
      </div>
    </div>
  );
}

export default OtpVerificationPage;
