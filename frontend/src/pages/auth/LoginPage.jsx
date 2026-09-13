import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Lock, User, Building2 } from 'lucide-react';

export function LoginPage() {
  const [loginField, setLoginField] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isOwnerIntent =
    searchParams.get('role') === 'OWNER' || location.state?.role === 'OWNER';

  const bannerMessage =
    location.state?.message ||
    (isOwnerIntent ? "Mulkdor kabinetiga kirish — to'yxonangizni boshqarish uchun tizimga kiring" : undefined);

  const from = location.state?.from?.pathname || '/';
  const fromAuth = location.state?.fromAuth;

  // Choose transition class based on source
  const transitionClass =
    fromAuth === 'register' ? 'auth-slide-from-left' : 'auth-enter-neutral';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!loginField || !password) {
      toast.error('Login va parolni kiriting.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await login({ login: loginField, password });

      if (result.requireOtp) {
        toast.info(result.message);
        navigate(`/verify-otp?email=${encodeURIComponent(result.email)}`, {
          state: { from: location.state?.from },
        });
        return;
      }

      toast.success('Tizimga muvaffaqiyatli kirdingiz!');

      // Immediate redirect without fake delay
      if (from === '/') {
        if (result.user.role === 'ADMIN') {
          navigate('/admin/dashboard', { replace: true });
          return;
        }
        if (result.user.role === 'OWNER') {
          navigate('/owner/dashboard', { replace: true });
          return;
        }
      }

      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kirishda xatolik yuz berdi. Parol yoki login noto\'g\'ri.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`space-y-6 ${transitionClass}`}>
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
          Tizimga kirish
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-xs mx-auto">
          Mijoz, mulkdor yoki administrator profilingizga kiring
        </p>
      </div>

      {/* Optional Owner / Redirect Banner */}
      {bannerMessage && (
        <div className="p-3.5 rounded-xl bg-bronze-50 border border-bronze-200 text-bronze-800 text-xs font-medium text-center animate-in fade-in duration-ui">
          {bannerMessage}
        </div>
      )}

      {/* Form Card Container */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-border shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email yoki Foydalanuvchi nomi"
            placeholder="masalan: user@toyxonahub.uz yoki username"
            value={loginField}
            onChange={(e) => setLoginField(e.target.value)}
            leftIcon={User}
            required
            autoComplete="username"
          />

          <Input
            label="Parol"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            leftIcon={Lock}
            allowPasswordToggle={true}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center mt-2 shadow-sm"
            isLoading={isLoading}
            loadingText="Kirilmoqda..."
          >
            Kirish
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/80 text-center text-xs text-muted">
          <span>Hisobingiz yo'qmi? </span>
          <Link
            to="/register"
            state={{ from: location.state?.from, fromAuth: 'login' }}
            className="font-bold text-bronze hover:underline transition-colors duration-fast"
          >
            Ro'yxatdan o'tish
          </Link>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
