import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatPrice } from '../../utils/formatters';
import { Check, X, Building2, MapPin, Users, Phone, CheckCircle2 } from 'lucide-react';

export function AdminApprovalsPage() {
  const toast = useToast();
  const queryClient = useQueryClient();
  const [rejectingHallId, setRejectingHallId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-pending-halls'],
    queryFn: () => hallsApi.getHalls({ status: 'PENDING', limit: 100 }),
  });

  const pendingHalls = data?.data?.items || data?.data || [];

  // Update status mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => hallsApi.updateHallStatus(id, { status }),
    onSuccess: (_, variables) => {
      if (variables.status === 'APPROVED') {
        toast.success("To'yxona tasdiqlandi va katalogda e'lon qilindi!");
      } else {
        toast.info("To'yxona arizasi rad etildi.");
      }
      setRejectingHallId(null);
      queryClient.invalidateQueries({ queryKey: ['admin-pending-halls'] });
      queryClient.invalidateQueries({ queryKey: ['admin-halls-count'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Holatni yangilashda xatolik yuz berdi.');
    },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
          Tasdiqlash navbati
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Mulkdorlar tomonidan qo'shilgan va tasdiq kutilayotgan to'yxonalar
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
          ))}
        </div>
      ) : pendingHalls.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12">
          <EmptyState
            icon={CheckCircle2}
            title="Tasdiqlash navbati bo'sh"
            description="Barcha kiritilgan to'yxonalar ko'rib chiqilgan. Yangi arizalar paydo bo'lganda bu yerda ko'rinadi."
          />
        </div>
      ) : (
        <div className="space-y-5">
          {pendingHalls.map((hall) => {
            const primaryImage = hall.images?.find((i) => i.isPrimary) || hall.images?.[0];

            return (
              <div
                key={hall.id}
                className="bg-white rounded-2xl border border-border p-6 shadow-card hover:border-border-dark transition-all flex flex-col lg:flex-row justify-between items-start gap-6"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-24 h-24 rounded-xl bg-zinc-100 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={hall.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-muted/40" />
                    )}
                  </div>

                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-serif font-bold text-lg text-ink">{hall.name}</h3>
                      <span className="text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                        Kutilmoqda
                      </span>
                    </div>

                    <p className="text-xs text-muted flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-bronze shrink-0" />
                      {hall.district} tumani • {hall.address}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-bronze" />
                        {hall.capacity} kishi
                      </span>
                      <span>•</span>
                      <span className="font-bold text-ink">
                        {formatPrice(hall.pricePerSeat)} / kishi
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-bronze" />
                        {hall.contactPhone}
                      </span>
                    </div>

                    {hall.description && (
                      <p className="text-xs text-muted mt-2 line-clamp-2 bg-canvas p-2.5 rounded-xl border border-border/60">
                        {hall.description}
                      </p>
                    )}
                  </div>
                </div>

                {/* Approve / Reject Actions */}
                <div className="flex items-center gap-2 self-stretch lg:self-center justify-end border-t lg:border-t-0 pt-4 lg:pt-0 border-border/80">
                  <Button
                    variant="dangerOutline"
                    size="md"
                    onClick={() => setRejectingHallId(hall.id)}
                    disabled={statusMutation.isPending}
                  >
                    <X className="w-4 h-4" />
                    Rad etish
                  </Button>

                  <Button
                    variant="success"
                    size="md"
                    onClick={() => statusMutation.mutate({ id: hall.id, status: 'APPROVED' })}
                    isLoading={statusMutation.isPending}
                  >
                    <Check className="w-4 h-4" />
                    Tasdiqlash
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!rejectingHallId}
        onClose={() => setRejectingHallId(null)}
        onConfirm={() =>
          statusMutation.mutate({ id: rejectingHallId, status: 'REJECTED' })
        }
        isLoading={statusMutation.isPending}
        title="To'yxona arizasini rad etish"
        message="Haqiqatan ham ushbu to'yxonani rad etmoqchimisiz? To'yxona umumiy katalogda chop etilmaydi."
        confirmLabel="Ha, rad etilsin"
        cancelLabel="Bekor qilish"
        variant="danger"
      />
    </div>
  );
}

export default AdminApprovalsPage;
