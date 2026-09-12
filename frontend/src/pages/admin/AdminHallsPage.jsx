import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { useToast } from '../../context/ToastContext';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatPrice } from '../../utils/formatters';
import { HALL_STATUS_CONFIG } from '../../utils/status';
import { TASHKENT_DISTRICTS } from '../../constants/districts';
import { Building2, Search, Trash2, ExternalLink, Check } from 'lucide-react';

export function AdminHallsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [district, setDistrict] = useState('');
  const [status, setStatus] = useState('');
  const [deletingHallId, setDeletingHallId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-halls', search, district, status],
    queryFn: () =>
      hallsApi.getHalls({
        search: search || undefined,
        district: district || undefined,
        status: status || undefined,
        limit: 100,
      }),
  });

  const halls = data?.data?.items || data?.data || [];

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => hallsApi.deleteHall(id),
    onSuccess: () => {
      toast.success("To'yxona o'chirildi.");
      setDeletingHallId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-all-halls'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "To'yxonani o'chirishda xatolik yuz berdi.");
    },
  });

  // Status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, newStatus }) => hallsApi.updateHallStatus(id, { status: newStatus }),
    onSuccess: () => {
      toast.success('Holat yangilandi!');
      queryClient.invalidateQueries({ queryKey: ['admin-all-halls'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Holatni o\'zgartirishda xatolik.');
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
          Barcha to'yxonalar
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Tizimdagi to'yxonalar ro'yxati, filtrlar va o'chirish
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          placeholder="To'yxona nomi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={Search}
        />

        <Select
          value={district}
          onChange={(e) => setDistrict(e.target.value)}
          placeholder="Barcha tumanlar"
          options={TASHKENT_DISTRICTS.map((d) => ({ value: d, label: `${d} tumani` }))}
        />

        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          placeholder="Barcha holatlar"
          options={[
            { value: 'PENDING', label: 'Kutilmoqda (Pending)' },
            { value: 'APPROVED', label: 'Tasdiqlangan (Approved)' },
            { value: 'REJECTED', label: 'Rad etilgan (Rejected)' },
          ]}
        />
      </div>

      {/* Halls List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full rounded-2xl" />
          ))}
        </div>
      ) : halls.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12">
          <EmptyState
            icon={Building2}
            title="To'yxonalar topilmadi"
            description="Kiritilgan parametrlar bo'yicha hech qanday to'yxona topilmadi."
          />
        </div>
      ) : (
        <div className="space-y-3">
          {halls.map((hall) => {
            const statusConfig = HALL_STATUS_CONFIG[hall.status] || {
              label: hall.status,
              bg: 'bg-zinc-100',
            };

            return (
              <div
                key={hall.id}
                className="bg-white rounded-2xl border border-border p-5 shadow-card hover:border-border-dark transition-all flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-ink">{hall.name}</h3>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig.bg}`}>
                      {statusConfig.label}
                    </span>
                  </div>
                  <p className="text-xs text-muted">
                    {hall.district} tumani • {hall.capacity} kishi • {formatPrice(hall.pricePerSeat)}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-border/80">
                  <Link
                    to={`/halls/${hall.id}`}
                    target="_blank"
                    className="p-2 rounded-xl border border-border text-muted hover:text-ink hover:bg-canvas transition-colors text-xs font-medium"
                    title="Saytda ko'rish"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  {hall.status === 'PENDING' && (
                    <button
                      type="button"
                      onClick={() =>
                        statusMutation.mutate({ id: hall.id, newStatus: 'APPROVED' })
                      }
                      className="p-2 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 text-xs font-medium"
                      title="Tasdiqlash"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setDeletingHallId(hall.id)}
                    className="p-2 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium"
                    title="O'chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deletingHallId}
        onClose={() => setDeletingHallId(null)}
        onConfirm={() => deleteMutation.mutate(deletingHallId)}
        isLoading={deleteMutation.isPending}
        title="To'yxonani o'chirish"
        message="Haqiqatan ham ushbu to'yxonani o'chirmoqchimisiz? Ushbu amal to'yxona va uning barcha bog'liq ma'lumotlarini o'chiradi."
        confirmLabel="Ha, o'chirilsin"
        cancelLabel="Bekor qilish"
        variant="danger"
      />
    </div>
  );
}

export default AdminHallsPage;
