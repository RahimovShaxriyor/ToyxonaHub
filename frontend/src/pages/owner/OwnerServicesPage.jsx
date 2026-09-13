import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { servicesApi } from '../../api/services.api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Skeleton from '../../components/ui/Skeleton';
import { formatPrice } from '../../utils/formatters';
import { SERVICE_TYPE_CONFIG } from '../../utils/status';
import { normalizeApiError } from '../../utils/error';
import { ArrowLeft, Sparkles, Trash2, PlusCircle, Music, Car, Utensils, Volume2 } from 'lucide-react';

export function OwnerServicesPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [deletingService, setDeletingService] = useState(null);

  // Form state
  const [serviceType, setServiceType] = useState('SINGER');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');

  const { data: hall } = useQuery({
    queryKey: ['hall-for-services', id],
    queryFn: () => hallsApi.getHallById(id),
  });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ['hall-services-list', id],
    queryFn: () => servicesApi.getHallServices(id),
  });

  // Add service mutation
  const addMutation = useMutation({
    mutationFn: (payload) => servicesApi.addHallService(id, payload),
    onSuccess: () => {
      toast.success("Xizmat muvaffaqiyatli qo'shildi!");
      setName('');
      setPrice('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['hall-services-list', id] });
      queryClient.invalidateQueries({ queryKey: ['hall-for-services', id] });
    },
    onError: (err) => {
      const normalized = normalizeApiError(err, "Xizmatni qo'shishda xatolik yuz berdi.");
      toast.error(normalized.message);
    },
  });

  // Delete service mutation
  const deleteMutation = useMutation({
    mutationFn: ({ serviceId, serviceType }) =>
      servicesApi.deleteHallService(id, serviceId, serviceType),
    onSuccess: () => {
      toast.success("Xizmat o'chirildi!");
      setDeletingService(null);
      queryClient.invalidateQueries({ queryKey: ['hall-services-list', id] });
      queryClient.invalidateQueries({ queryKey: ['hall-for-services', id] });
    },
    onError: (err) => {
      const normalized = normalizeApiError(err, "Xizmatni o'chirishda xatolik yuz berdi.");
      toast.error(normalized.message);
    },
  });

  const handleAddService = (e) => {
    e.preventDefault();
    if (!name || !price) {
      toast.error('Xizmat nomi va narxini kiriting.');
      return;
    }

    addMutation.mutate({
      serviceType,
      name,
      price: Number(price),
      description: description || undefined,
    });
  };

  const getIcon = (type) => {
    switch (type) {
      case 'SINGER':
        return Music;
      case 'CAR':
        return Car;
      case 'MENU':
        return Utensils;
      case 'KARNAY_SURNAY':
        return Volume2;
      default:
        return Sparkles;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
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
            {hall?.name} — Xizmatlar boshqaruvi
          </h1>
          <p className="text-xs text-muted mt-0.5">
            Xonandalar, kortej mashinalari, to'y menyulari va karnay-surnay xizmatlarini boshqaring
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Add Service Form */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-border p-6 shadow-card space-y-4">
          <h3 className="font-serif font-bold text-base text-ink">Yangi xizmat qo'shish</h3>

          <form onSubmit={handleAddService} className="space-y-3.5">
            <Select
              label="Xizmat turi"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              options={[
                { value: 'SINGER', label: "Xonanda / San'atkor" },
                { value: 'CAR', label: 'Kortej avtomobili' },
                { value: 'MENU', label: 'Taomnoma toifasi' },
                { value: 'KARNAY_SURNAY', label: 'Karnay-surnay guruhi' },
              ]}
            />

            <Input
              label="Nomi"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masalan: Yulduz Usmonova"
              required
            />

            <Input
              label="Narxi (so'm)"
              type="number"
              min="0"
              step="50000"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="1000000"
              required
            />

            <div className="space-y-1">
              <label className="block text-xs font-semibold text-ink uppercase tracking-wider">
                Qisqacha tavsif
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Xizmat haqida qo'shimcha ma'lumot..."
                className="w-full rounded-xl border border-border px-3 py-2 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-bronze/20 focus:border-bronze"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full justify-center"
              isLoading={addMutation.isPending}
            >
              <PlusCircle className="w-4 h-4" />
              Xizmatni saqlash
            </Button>
          </form>
        </div>

        {/* Existing Services List */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-border p-6 shadow-card space-y-4">
          <h3 className="font-serif font-bold text-base text-ink">
            Mavjud xizmatlar ({services.length})
          </h3>

          {services.length === 0 ? (
            <div className="text-center py-10 text-muted text-xs">
              Ushbu to'yxona uchun hali qo'shimcha xizmatlar kiritilmagan.
            </div>
          ) : (
            <div className="space-y-3">
              {services.map((srv) => {
                const Icon = getIcon(srv.serviceType);
                const typeConfig = SERVICE_TYPE_CONFIG[srv.serviceType] || {
                  label: srv.serviceType,
                  color: 'text-zinc-600',
                };

                return (
                  <div
                    key={srv.id}
                    className="p-4 rounded-xl bg-canvas border border-border/80 flex items-start justify-between gap-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-white border border-border shrink-0 mt-0.5">
                        <Icon className={`w-4 h-4 ${typeConfig.color}`} />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-muted uppercase tracking-wider">
                          {typeConfig.label}
                        </div>
                        <h4 className="text-sm font-bold text-ink mt-0.5">{srv.name}</h4>
                        <div className="text-xs font-bold text-bronze mt-1">
                          {formatPrice(srv.price)}
                        </div>
                        {srv.description && (
                          <p className="text-xs text-muted mt-1">{srv.description}</p>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setDeletingService(srv)}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deletingService}
        onClose={() => setDeletingService(null)}
        onConfirm={() =>
          deleteMutation.mutate({
            serviceId: deletingService.id,
            serviceType: deletingService.serviceType,
          })
        }
        isLoading={deleteMutation.isPending}
        title="Xizmatni o'chirish"
        message="Haqiqatan ham bu xizmatni to'yxonadan olib tashlamoqchimisiz?"
        confirmLabel="Ha, o'chirilsin"
        cancelLabel="Bekor qilish"
        variant="danger"
      />
    </div>
  );
}

export default OwnerServicesPage;
