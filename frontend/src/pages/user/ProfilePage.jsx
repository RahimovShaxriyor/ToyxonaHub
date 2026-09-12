import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import { Mail, Phone, ShieldCheck, Calendar } from 'lucide-react';

export function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const toast = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setPhone(user.phone || '');
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone) {
      toast.error('Barcha maydonlarni to\'ldiring.');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile({ firstName, lastName, phone });
      toast.success('Profil ma\'lumotlari muvaffaqiyatli saqlandi!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Ma\'lumotlarni yangilashda xatolik yuz berdi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleLabel =
    user?.role === 'ADMIN'
      ? 'Administrator'
      : user?.role === 'OWNER'
      ? 'To\'yxona mulkdori'
      : 'Mijoz';

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-ink">Profil ma'lumotlari</h1>
        <p className="text-sm text-muted mt-1">
          Shaxsiy hisobingiz ma'lumotlarini ko'ring va yangilang
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-card flex flex-col items-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-bronze-100 text-bronze flex items-center justify-center font-serif font-bold text-3xl shadow-sm">
            {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
          </div>

          <div>
            <h3 className="font-bold text-lg text-ink">
              {user?.firstName} {user?.lastName}
            </h3>
            <p className="text-xs text-muted mt-0.5">@{user?.username}</p>
          </div>

          <Badge variant={user?.role === 'ADMIN' ? 'default' : user?.role === 'OWNER' ? 'bronze' : 'info'} size="md">
            <ShieldCheck className="w-3.5 h-3.5" />
            {roleLabel}
          </Badge>

          <div className="w-full pt-4 border-t border-border/80 text-left space-y-2.5 text-xs text-muted">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-bronze shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-bronze shrink-0" />
              <span>{user?.phone}</span>
            </div>
            {user?.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-bronze shrink-0" />
                <span>Ro'yxatdan o'tgan: {new Date(user.createdAt).toLocaleDateString('uz-UZ')}</span>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-card">
          <h2 className="font-serif font-bold text-lg text-ink mb-6">
            Ma'lumotlarni tahrirlash
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ism"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
              <Input
                label="Familiya"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            <Input
              label="Telefon raqami"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+998 90 123 45 67"
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Foydalanuvchi nomi"
                value={user?.username || ''}
                disabled
                helperText="Foydalanuvchi nomini o'zgartirib bo'lmaydi"
              />
              <Input
                label="Elektron pochta"
                value={user?.email || ''}
                disabled
                helperText="Elektron pochtani o'zgartirib bo'lmaydi"
              />
            </div>

            <div className="pt-4 border-t border-border/80 flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
              >
                O'zgarishlarni saqlash
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
