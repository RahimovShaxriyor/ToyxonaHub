import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { useToast } from '../../context/ToastContext';
import { TASHKENT_DISTRICTS } from '../../constants/districts';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Skeleton from '../../components/ui/Skeleton';
import { ArrowLeft } from 'lucide-react';

export function OwnerHallFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: '',
    district: 'Chilonzor',
    address: '',
    capacity: 300,
    pricePerSeat: 150000,
    contactPhone: '+998 90 123 45 67',
    description: '',
  });

  // Fetch hall data if editing
  const { data: existingHall, isLoading } = useQuery({
    queryKey: ['hall-edit', id],
    queryFn: () => hallsApi.getHallById(id),
    enabled: isEditing,
  });

  useEffect(() => {
    if (existingHall) {
      setFormData({
        name: existingHall.name || '',
        district: existingHall.district || 'Chilonzor',
        address: existingHall.address || '',
        capacity: existingHall.capacity || 300,
        pricePerSeat: existingHall.pricePerSeat || 150000,
        contactPhone: existingHall.contactPhone || '',
        description: existingHall.description || '',
      });
    }
  }, [existingHall]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  };

  // Submit mutation
  const mutation = useMutation({
    mutationFn: (payload) =>
      isEditing ? hallsApi.updateHall(id, payload) : hallsApi.createHall(payload),
    onSuccess: (_res) => {
      toast.success(
        isEditing
          ? "To'yxona muvaffaqiyatli yangilandi!"
          : "To'yxona qo'shildi va tasdiqlash uchun adminga yuborildi!"
      );
      queryClient.invalidateQueries({ queryKey: ['owner-halls-list'] });
      navigate('/owner/halls');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Xatolik yuz berdi. Maydonlarni tekshiring.');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  if (isEditing && isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/owner/halls')}
          className="p-2 rounded-xl border border-border text-muted hover:text-ink hover:bg-canvas transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-serif text-2xl font-bold text-ink">
            {isEditing ? "To'yxonani tahrirlash" : "Yangi to'yxona qo'shish"}
          </h1>
          <p className="text-xs text-muted mt-0.5">
            {isEditing
              ? "To'yxona parametrlarini o'zgartiring"
              : "To'yxona ma'lumotlarini to'ldiring"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-card space-y-6">
        {/* Basic info */}
        <div className="space-y-4">
          <Input
            label="To'yxona nomi"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Masalan: 'Versal' tantanalar saroyi"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Tuman"
              name="district"
              value={formData.district}
              onChange={handleChange}
              options={TASHKENT_DISTRICTS.map((d) => ({ value: d, label: `${d} tumani` }))}
              required
            />
            <Input
              label="Manzil"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Ko'cha va mo'ljal"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Sig'im (kishi)"
              type="number"
              name="capacity"
              min="50"
              max="3000"
              value={formData.capacity}
              onChange={handleChange}
              required
            />
            <Input
              label="O'rindiq narxi (so'm)"
              type="number"
              name="pricePerSeat"
              min="10000"
              step="5000"
              value={formData.pricePerSeat}
              onChange={handleChange}
              required
            />
            <Input
              label="Aloqa telefoni"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleChange}
              placeholder="+998 90 123 45 67"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
              Tavsif va qulayliklar
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="To'yxona zali, akustika, avtoturargoh va boshqa qulayliklar haqida batafsil..."
              className="w-full rounded-xl border border-border px-3.5 py-2.5 text-sm bg-white placeholder:text-muted/60 focus:outline-none focus:ring-2 focus:ring-bronze/20 focus:border-bronze"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-border/80 flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => navigate('/owner/halls')}
          >
            Bekor qilish
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={mutation.isPending}
          >
            {isEditing ? "O'zgarishlarni saqlash" : "To'yxonani yaratish"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default OwnerHallFormPage;
