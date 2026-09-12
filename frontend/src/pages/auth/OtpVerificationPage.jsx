import React, { useState } from 'react';
import { useSearchParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

export function OtpVerificationPage() {
  const [searchParams] = useSearchParams();
  const emailFromQuery = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailFromQuery);
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { verifyOtp } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !code) {
      toast.error('Elektron pochta va tasdiqlash kodini kiriting.');
      return;
    }

    setIsLoading(true);
    try {
      const result = await verifyOtp(email, code.trim());
      toast.success('Pochta muvaffaqiyatli tasdiqlandi!');

      if (result.user?.role === 'OWNER') {
        navigate('/owner/dashboard', { replace: true });
      } else if (result.user?.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        const from = location.state?.from?.pathname || '/';
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Kod noto\'g\'ri yoki muddati o\'tgan.');
    } finally {
      setIsLoading(false);
    }
  };

  const subtitle = email
    ? `${email} manziliga yuborilgan 6 xonali tasdiqlash kodini kiriting`
    : 'Elektron pochtangizga yuborilgan tasdiqlash kodini kiriting';

  return (
    <AuthLayout
      title="Pochtani tasdiqlash"
      subtitle={subtitle}
      step={2}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!emailFromQuery && (
          <Input
            label="Elektron pochta"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.uz"
            required
          />
        )}

        <Input
          label="Tasdiqlash kodi"
          type="text"
          placeholder="123456"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="text-center tracking-widest text-lg font-mono"
          required
          autoFocus
        />

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full justify-center mt-2 shadow-sm"
          isLoading={isLoading}
        >
          Kodni tasdiqlash
        </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-border/80 text-center text-xs text-muted">
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="font-semibold text-bronze hover:underline"
        >
          Kirish sahifasiga qaytish
        </button>
      </div>
    </AuthLayout>
  );
}

export default OtpVerificationPage;
