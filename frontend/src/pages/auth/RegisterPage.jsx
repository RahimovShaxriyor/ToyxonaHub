import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { User, Mail, Lock, Phone, Building2 } from 'lucide-react';
import { cleanPhoneNumber } from '../../utils/phone';
import { normalizeApiError } from '../../utils/error';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';
  const fromAuth = location.state?.fromAuth;

  // Directional enter based on source
  const transitionClass =
    fromAuth === 'login' ? 'auth-slide-from-right' : 'auth-enter-neutral';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prevent double submission synchronously
    if (isSubmittingRef.current || isLoading) return;

    setFieldErrors({});

    // Client-side quick checks
    const errors = {};
    if (formData.password.length < 6) {
      errors.password = "Parol kamida 6 ta belgidan iborat bo'lishi lozim.";
    }

    const cleanedPhone = cleanPhoneNumber(formData.phone);
    if (!cleanedPhone || !/^\+998\d{9}$/.test(cleanedPhone)) {
      errors.phone = "Telefon raqamini to'g'ri formatda kiriting (masalan: +998901234567).";
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      const firstError = Object.values(errors)[0];
      toast.error(firstError);
      return;
    }

    isSubmittingRef.current = true;
    setIsLoading(true);

    try {
      const payload = {
        ...formData,
        phone: cleanedPhone,
      };
      await register(payload);
      toast.success('Hisob muvaffaqiyatli yaratildi!');
      navigate(from, { replace: true });
    } catch (err) {
      const normalized = normalizeApiError(err, "Ro'yxatdan o'tishda xatolik yuz berdi.");
      if (Object.keys(normalized.fieldErrors).length > 0) {
        setFieldErrors(normalized.fieldErrors);
      }
      toast.error(normalized.message);
    } finally {
      setIsLoading(false);
      isSubmittingRef.current = false;
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
          Ro'yxatdan o'tish
        </h1>
        <p className="text-xs sm:text-sm text-muted max-w-xs mx-auto">
          To'yxonalarni onlayn bron qilish uchun shaxsiy hisobingizni yarating
        </p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 py-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-bronze">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-bronze text-white shadow-xs">
            1
          </span>
          <span>Ro'yxatdan o'tish</span>
        </div>
        <div className="w-8 h-0.5 bg-border transition-colors duration-ui" />
        <div className="flex items-center gap-1.5 text-xs font-semibold text-muted">
          <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] bg-canvas border border-border text-muted">
            2
          </span>
          <span>Tasdiqlash</span>
        </div>
      </div>

      {/* Form Card Container */}
      <div className="bg-white p-7 sm:p-8 rounded-3xl border border-border shadow-card">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ism"
              name="firstName"
              placeholder="Ali"
              value={formData.firstName}
              onChange={handleChange}
              error={fieldErrors.firstName}
              required
              autoComplete="given-name"
            />
            <Input
              label="Familiya"
              name="lastName"
              placeholder="Valiyev"
              value={formData.lastName}
              onChange={handleChange}
              error={fieldErrors.lastName}
              required
              autoComplete="family-name"
            />
          </div>

          <Input
            label="Foydalanuvchi nomi"
            name="username"
            placeholder="alivaliyev"
            value={formData.username}
            onChange={handleChange}
            leftIcon={User}
            error={fieldErrors.username}
            required
            autoComplete="username"
          />

          <Input
            label="Elektron pochta"
            type="email"
            name="email"
            placeholder="ali@example.com"
            value={formData.email}
            onChange={handleChange}
            leftIcon={Mail}
            error={fieldErrors.email}
            required
            autoComplete="email"
          />

          <Input
            label="Telefon raqami"
            name="phone"
            placeholder="+998 90 123 45 67"
            helperText="Format: +998XXXXXXXXX"
            value={formData.phone}
            onChange={handleChange}
            leftIcon={Phone}
            error={fieldErrors.phone}
            required
            autoComplete="tel"
          />

          <Input
            label="Parol"
            type="password"
            name="password"
            placeholder="Kamida 6 belgi"
            value={formData.password}
            onChange={handleChange}
            leftIcon={Lock}
            allowPasswordToggle={true}
            error={fieldErrors.password}
            required
            autoComplete="new-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full justify-center mt-2 shadow-sm"
            isLoading={isLoading}
            loadingText="Ro'yxatdan o'tilmoqda..."
          >
            Ro'yxatdan o'tish
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-border/80 text-center text-xs text-muted">
          <span>Allaqachon hisobingiz bormi? </span>
          <Link
            to="/login"
            state={{ from: location.state?.from, fromAuth: 'register' }}
            className="font-bold text-bronze hover:underline transition-colors duration-fast"
          >
            Kirish
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
