import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { useToast } from '../../context/ToastContext';
import { DISTRICT_OPTIONS } from '../../constants/districts';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Skeleton from '../../components/ui/Skeleton';
import { ArrowLeft } from 'lucide-react';
import { cleanPhoneNumber } from '../../utils/phone';
import { normalizeApiError } from '../../utils/error';

export function OwnerHallFormPage() {
  const { id } = useParams();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();
  const isSubmittingRef = useRef(false);

  const [formData, setFormData] = useState({
    name: '',
    district: 'CHILONZOR',
    address: '',
    capacity: '',
    pricePerSeat: '',
    phone: '',
    description: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

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
        district: existingHall.district || 'CHILONZOR',
        address: existingHall.address || '',
        capacity: existingHall.capacity || 300,
        pricePerSeat: existingHall.pricePerSeat || 150000,
        phone: existingHall.phone || '',
        description: existingHall.description || '',
      });
    }
  }, [existingHall]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : Number(value)) : value,
    }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: '' }));
    }
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
      queryClient.invalidateQueries({ queryKey: ['admin-pending-halls'] });
      queryClient.invalidateQueries({ queryKey: ['hall-detail', id] });
      navigate('/owner/halls');
    },
    onError: (err) => {
      const normalized = normalizeApiError(err, 'Xatolik yuz berdi. Maydonlarni tekshiring.');
      if (Object.keys(normalized.fieldErrors).length > 0) {
        setFieldErrors(normalized.fieldErrors);
      }
      toast.error(normalized.message);
    },
    onSettled: () => {
      isSubmittingRef.current = false;
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSubmittingRef.current || mutation.isPending) return;

    setFieldErrors({});

    const errors = {};
    if (!formData.name || formData.name.trim().length < 2) {
      errors.name = "To'yxona nomi kamida 2 ta belgidan iborat bo'lishi lozim.";
    }
    if (!formData.address || formData.address.trim().length < 3) {
      errors.address = "Manzil kamida 3 ta belgidan iborat bo'lishi lozim.";
    }
    if (!formData.capacity || Number(formData.capacity) < 10) {
      errors.capacity = "Sig'im kamida 10 kishi bo'lishi lozim.";
    }
    if (!formData.pricePerSeat || Number(formData.pricePerSeat) <= 0) {
      errors.pricePerSeat = "O'rindiq narxi musbat son bo'lishi lozim.";
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

    const payload = {
      name: formData.name.trim(),
      district: formData.district,
      address: formData.address.trim(),
      capacity: Number(formData.capacity),
      pricePerSeat: Number(formData.pricePerSeat),
      phone: cleanedPhone,
    };

    mutation.mutate(payload);
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

      <form noValidate onSubmit={handleSubmit} className="bg-white rounded-2xl border border-border p-6 sm:p-8 shadow-card space-y-6">
        {/* Basic info */}
        <div className="space-y-4">
          <Input
            label="To'yxona nomi"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={fieldErrors.name}
            placeholder="Masalan: 'Versal' tantanalar saroyi"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Tuman"
              name="district"
              value={formData.district}
              onChange={handleChange}
              options={DISTRICT_OPTIONS}
              error={fieldErrors.district}
              required
            />
            <Input
              label="Manzil"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={fieldErrors.address}
              placeholder="Ko'cha va mo'ljal"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Sig'im (kishi)"
              type="number"
              name="capacity"
              min="10"
              max="10000"
              value={formData.capacity}
              onChange={handleChange}
              error={fieldErrors.capacity}
              required
            />
            <Input
              label="O'rindiq narxi (so'm)"
              type="number"
              name="pricePerSeat"
              min="1000"
              step="5000"
              value={formData.pricePerSeat}
              onChange={handleChange}
              error={fieldErrors.pricePerSeat}
              required
            />
            <Input
              label="Aloqa telefoni"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              error={fieldErrors.phone}
              placeholder="+998 90 123 45 67"
              helperText="Format: +998XXXXXXXXX"
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
            disabled={mutation.isPending}
          >
            {isEditing ? "O'zgarishlarni saqlash" : "To'yxonani yaratish"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default OwnerHallFormPage;
