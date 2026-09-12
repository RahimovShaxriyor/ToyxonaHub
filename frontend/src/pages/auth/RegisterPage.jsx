import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AuthLayout from '../../components/layout/AuthLayout';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { User, Mail, Lock, Phone } from 'lucide-react';

export function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password.length < 6) {
      toast.error('Parol kamida 6 ta belgidan iborat bo\'lishi lozim.');
      return;
    }

    setIsLoading(true);
    try {
      await register(formData);
      toast.success('Hisob muvaffaqiyatli yaratildi!');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ro\'yxatdan o\'tishda xatolik yuz berdi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Ro'yxatdan o'tish"
      subtitle="To'yxonalarni onlayn bron qilish uchun shaxsiy hisobingizni yarating"
      step={1}
    >

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ism"
              name="firstName"
              placeholder="Ali"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <Input
              label="Familiya"
              name="lastName"
              placeholder="Valiyev"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>

          <Input
            label="Foydalanuvchi nomi"
            name="username"
            placeholder="alivaliyev"
            value={formData.username}
            onChange={handleChange}
            leftIcon={User}
            required
          />

          <Input
            label="Elektron pochta"
            type="email"
            name="email"
            placeholder="ali@example.com"
            value={formData.email}
            onChange={handleChange}
            leftIcon={Mail}
            required
          />

          <Input
            label="Telefon raqami"
            name="phone"
            placeholder="+998 90 123 45 67"
            value={formData.phone}
            onChange={handleChange}
            leftIcon={Phone}
            required
          />

          <Input
            label="Parol"
            type="password"
            name="password"
            placeholder="Kamida 6 belgi"
            value={formData.password}
            onChange={handleChange}
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
            Ro'yxatdan o'tish
          </Button>
      </form>

      <div className="mt-8 pt-6 border-t border-border/80 text-center text-xs text-muted">
        <span>Allaqachon hisobingiz bormi? </span>
        <Link
          to="/login"
          state={{ from: location.state?.from }}
          className="font-bold text-bronze hover:underline"
        >
          Kirish
        </Link>
      </div>
    </AuthLayout>
  );
}

export default RegisterPage;
