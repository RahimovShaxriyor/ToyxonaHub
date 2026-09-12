import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { formatPrice } from '../../utils/formatters';
import { HALL_STATUS_CONFIG } from '../../utils/status';
import {
  Building2,
  PlusCircle,
  Edit,
  Image as ImageIcon,
  Sparkles,
  Trash2,
  ExternalLink,
  MapPin,
  Users,
} from 'lucide-react';

export function OwnerHallsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const queryClient = useQueryClient();

  const [deletingHallId, setDeletingHallId] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['owner-halls-list'],
    queryFn: () => hallsApi.getHalls({ limit: 100 }),
  });

  const allHalls = data?.data?.items || data?.data || [];
  const myHalls = allHalls.filter((h) => h.ownerId === user?.id || !h.ownerId);

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id) => hallsApi.deleteHall(id),
    onSuccess: () => {
      toast.success("To'yxona muvaffaqiyatli o'chirildi.");
      setDeletingHallId(null);
      queryClient.invalidateQueries({ queryKey: ['owner-halls-list'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "To'yxonani o'chirishda xatolik yuz berdi.");
    },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            Mening to'yxonalarim
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            Barcha qo'shilgan to'yxonalarni tahrirlang, suratlar va xizmatlarni boshqaring
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => navigate('/owner/halls/new')}
          className="shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          Yangi to'yxona qo'shish
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : myHalls.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12">
          <EmptyState
            icon={Building2}
            title="Hali to'yxona qo'shilmagan"
            description="To'yxonangizni platformaga qo'shing, suratlar va narxlarni kiriting va mijozlardan buyurtmalarni qabul qiling."
            actionLabel="To'yxona qo'shish"
            onAction={() => navigate('/owner/halls/new')}
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myHalls.map((hall) => {
            const statusConfig = HALL_STATUS_CONFIG[hall.status] || {
              label: hall.status,
              bg: 'bg-zinc-100',
            };
            const primaryImage = hall.images?.find((i) => i.isPrimary) || hall.images?.[0];

            return (
              <div
                key={hall.id}
                className="bg-white rounded-2xl border border-border p-5 sm:p-6 shadow-card hover:border-border-dark transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left: Thumbnail & Details */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-zinc-100 border border-border overflow-hidden shrink-0 flex items-center justify-center">
                    {primaryImage ? (
                      <img
                        src={primaryImage.url}
                        alt={hall.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Building2 className="w-8 h-8 text-muted/50" />
                    )}
                  </div>

                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-serif font-bold text-lg text-ink truncate">
                        {hall.name}
                      </h3>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig.bg}`}>
                        {statusConfig.label}
                      </span>
                    </div>

                    <p className="text-xs text-muted flex items-center gap-1.5 truncate">
                      <MapPin className="w-3.5 h-3.5 text-bronze shrink-0" />
                      {hall.district} tumani • {hall.address}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted pt-1">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-bronze" />
                        {hall.capacity} kishi
                      </span>
                      <span>•</span>
                      <span className="font-bold text-ink">
                        {formatPrice(hall.pricePerSeat)} / kishi
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex flex-wrap items-center gap-2 self-stretch md:self-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-border/80">
                  <Link
                    to={`/halls/${hall.id}`}
                    target="_blank"
                    className="p-2.5 rounded-xl border border-border text-muted hover:text-ink hover:bg-canvas transition-colors text-xs font-medium inline-flex items-center gap-1.5"
                    title="Mijoz ko'rinishida ochish"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span className="hidden sm:inline">Saytda</span>
                  </Link>

                  <Link
                    to={`/owner/halls/${hall.id}/images`}
                    className="p-2.5 rounded-xl border border-border text-ink hover:border-bronze hover:bg-bronze-50/50 transition-colors text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <ImageIcon className="w-4 h-4 text-bronze" />
                    Rasmlar ({hall.images?.length || 0})
                  </Link>

                  <Link
                    to={`/owner/halls/${hall.id}/services`}
                    className="p-2.5 rounded-xl border border-border text-ink hover:border-bronze hover:bg-bronze-50/50 transition-colors text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-bronze" />
                    Xizmatlar
                  </Link>

                  <Link
                    to={`/owner/halls/${hall.id}/edit`}
                    className="p-2.5 rounded-xl border border-border text-ink hover:border-bronze hover:bg-canvas transition-colors text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <Edit className="w-4 h-4" />
                    Tahrirlash
                  </Link>

                  <button
                    type="button"
                    onClick={() => setDeletingHallId(hall.id)}
                    className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors text-xs font-medium inline-flex items-center gap-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Dialog for Destructive Action (Delete Hall) */}
      <ConfirmDialog
        isOpen={!!deletingHallId}
        onClose={() => setDeletingHallId(null)}
        onConfirm={() => deleteMutation.mutate(deletingHallId)}
        isLoading={deleteMutation.isPending}
        title="To'yxonani o'chirish"
        message="Haqiqatan ham ushbu to'yxonani o'chirib tashlamoqchimisiz? To'yxona bilan birga uning barcha rasmlari va xizmatlari o'chiriladi."
        confirmLabel="Ha, o'chirilsin"
        cancelLabel="Bekor qilish"
        variant="danger"
      />
    </div>
  );
}

export default OwnerHallsPage;
