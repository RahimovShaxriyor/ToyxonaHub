import React, { useState } from 'react';
import { Link, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Lock, User } from 'lucide-react';

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

      // If user had a role and target is default, redirect to role workspace
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
    <AuthLayout
      title="Tizimga kirish"
      subtitle="Mijoz, mulkdor yoki administrator profilingizga kiring"
      bannerMessage={bannerMessage}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Email yoki Foydalanuvchi nomi"
          placeholder="masalan: user@toyxonahub.uz yoki username"
          value={loginField}
          onChange={(e) => setLoginField(e.target.value)}
          leftIcon={User}
          required
        />

        <Input
          label="Parol"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={Lock}
          required
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full justify-center mt-2 shadow-sm"
          isLoading={isLoading}
        >
          Kirish
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-border/80 text-center text-xs text-muted">
        <span>Hisobingiz yo'qmi? </span>
        <Link
          to="/register"
          state={{ from: location.state?.from }}
          className="font-bold text-bronze hover:underline"
        >
          Ro'yxatdan o'tish
        </Link>
      </div>
    </AuthLayout>
  );
}

export default LoginPage;
