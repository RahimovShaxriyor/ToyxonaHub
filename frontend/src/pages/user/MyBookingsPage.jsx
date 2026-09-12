import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../../api/bookings.api';
import { useToast } from '../../context/ToastContext';
import Button from '../../components/ui/Button';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import EmptyState from '../../components/ui/EmptyState';
import Skeleton from '../../components/ui/Skeleton';
import { formatPrice, formatFriendlyDate } from '../../utils/formatters';
import { BOOKING_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '../../utils/status';
import {
  Calendar,
  Users,
  CreditCard,
  Ban,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

export function MyBookingsPage() {
  const queryClient = useQueryClient();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('ALL'); // ALL, UPCOMING, PAST, ACTIVE, CANCELLED
  const [cancellingBookingId, setCancellingBookingId] = useState(null);

  // Compute query params based on selected tab
  const params = {};
  if (activeTab === 'UPCOMING') params.timeStatus = 'UPCOMING';
  if (activeTab === 'PAST') params.timeStatus = 'PAST';
  if (activeTab === 'ACTIVE') params.status = 'ACTIVE';
  if (activeTab === 'CANCELLED') params.status = 'CANCELLED';

  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings', params],
    queryFn: () => bookingsApi.getMyBookings(params),
  });

  const bookings = data?.data?.items || data?.data || [];

  // Pay mutation
  const payMutation = useMutation({
    mutationFn: (id) => bookingsApi.payBooking(id),
    onSuccess: (res) => {
      toast.success(res.message || "Muvaffaqiyatli to'landi");
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "To'lovda xatolik yuz berdi.");
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: (id) => bookingsApi.cancelBooking(id),
    onSuccess: () => {
      toast.success('Buyurtma bekor qilindi.');
      setCancellingBookingId(null);
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Buyurtmani bekor qilishda xatolik yuz berdi.');
    },
  });

  const tabs = [
    { key: 'ALL', label: 'Barchasi' },
    { key: 'UPCOMING', label: 'Kelgusi to\'ylar' },
    { key: 'PAST', label: 'O\'tgan' },
    { key: 'ACTIVE', label: 'Faol' },
    { key: 'CANCELLED', label: 'Bekor qilingan' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-ink">Mening buyurtmalarim</h1>
        <p className="text-sm text-muted mt-1">
          To'yxona bronlaringiz, to'lov holati va xizmatlar tafsiloti
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/80 mb-8">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-ui shrink-0 ${
              activeTab === t.key
                ? 'bg-bronze text-white shadow-xs font-semibold'
                : 'text-muted hover:text-ink hover:bg-canvas'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      <div key={activeTab} className="animate-in fade-in duration-ui ease-spring-smooth">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-2xl" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12">
          <EmptyState
            icon={Calendar}
            title="Buyurtmalar mavjud emas"
            description="Siz hali hech qanday to'yxonani bron qilmagansiz yoki ushbu filtr bo'yicha buyurtmalar topilmadi."
            actionLabel="To'yxonalar katalogini ko'rish"
            onAction={() => window.location.assign('/catalog')}
          />
        </div>
      ) : (
        <div className="space-y-5">
          {bookings.map((booking) => {
            const hall = booking.weddingHall;
            const statusConfig = BOOKING_STATUS_CONFIG[booking.status] || { label: booking.status, bg: 'bg-zinc-100' };
            const paymentConfig = PAYMENT_STATUS_CONFIG[booking.paymentStatus] || { label: booking.paymentStatus, bg: 'bg-zinc-100' };

            return (
              <div
                key={booking.id}
                className="bg-white rounded-2xl border border-border p-6 shadow-card hover:border-border-dark transition-all flex flex-col lg:flex-row justify-between gap-6"
              >
                {/* Left: Hall info & Booking metadata */}
                <div className="space-y-4 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig.bg}`}>
                      {statusConfig.label}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${paymentConfig.bg}`}>
                      {paymentConfig.label}
                    </span>
                    {booking.timeStatus && (
                      <span className="text-[11px] font-medium text-muted bg-canvas border border-border/80 px-2 py-0.5 rounded-full">
                        {booking.timeStatus === 'UPCOMING' ? 'Kelgusi' : 'O\'tgan'}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-xl text-ink">
                      {hall?.name || "Noma'lum to'yxona"}
                    </h3>
                    <p className="text-xs text-muted mt-0.5">
                      {hall?.district} tumani • {hall?.address}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-canvas border border-border/60">
                      <span className="text-muted block flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-bronze" />
                        To'y sanasi:
                      </span>
                      <span className="font-bold text-ink mt-1 block">
                        {formatFriendlyDate(booking.bookingDate)}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-canvas border border-border/60">
                      <span className="text-muted block flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-bronze" />
                        Mehmonlar:
                      </span>
                      <span className="font-bold text-ink mt-1 block">
                        {booking.guestCount} kishi
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-canvas border border-border/60 col-span-2 sm:col-span-1">
                      <span className="text-muted block flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-bronze" />
                        Bron qilingan:
                      </span>
                      <span className="font-medium text-ink mt-1 block">
                        {new Date(booking.createdAt).toLocaleDateString('uz-UZ')}
                      </span>
                    </div>
                  </div>

                  {/* Selected Services snapshot */}
                  {booking.selectedServices && booking.selectedServices.length > 0 && (
                    <div className="pt-2">
                      <span className="text-[11px] font-semibold text-muted block uppercase tracking-wider mb-1.5">
                        Qo'shilgan xizmatlar:
                      </span>
                      <div className="flex flex-wrap gap-2">
                        {booking.selectedServices.map((srv, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-xs bg-canvas border border-border px-2.5 py-1 rounded-lg text-ink"
                          >
                            <Sparkles className="w-3 h-3 text-bronze" />
                            {srv.nameSnapshot} ({formatPrice(srv.priceSnapshot)})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right: Pricing summary & actions */}
                <div className="lg:w-72 lg:border-l lg:border-border/80 lg:pl-6 flex flex-col justify-between pt-4 lg:pt-0 border-t lg:border-t-0 border-border/80">
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-muted">
                      <span>Jami summa:</span>
                      <span className="font-bold text-sm text-ink">{formatPrice(booking.totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-emerald-800 bg-emerald-50/80 p-2.5 rounded-xl border border-emerald-200">
                      <span className="font-medium">20% avans summasi:</span>
                      <span className="font-bold">{formatPrice(booking.advancePayment)}</span>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="mt-5 space-y-2">
                    {booking.status === 'ACTIVE' && booking.paymentStatus === 'UNPAID' && (
                      <Button
                        variant="success"
                        size="md"
                        className="w-full justify-center"
                        isLoading={payMutation.isPending}
                        onClick={() => payMutation.mutate(booking.id)}
                      >
                        <CreditCard className="w-4 h-4" />
                        20% avansni to'lash
                      </Button>
                    )}

                    {booking.status === 'ACTIVE' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-center text-rose-600 hover:text-rose-700 hover:border-rose-300"
                        onClick={() => setCancellingBookingId(booking.id)}
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Bronni bekor qilish
                      </Button>
                    )}

                    {hall && (
                      <Link
                        to={`/halls/${hall.id}`}
                        className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-bronze hover:underline w-full py-1.5"
                      >
                        To'yxona sahifasini ko'rish
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      </div>

      {/* Confirmation Dialog for Destructive Action (Cancel Booking) */}
      <ConfirmDialog
        isOpen={!!cancellingBookingId}
        onClose={() => setCancellingBookingId(null)}
        onConfirm={() => cancelMutation.mutate(cancellingBookingId)}
        isLoading={cancelMutation.isPending}
        title="Buyurtmani bekor qilish"
        message="Haqiqatan ham ushbu to'yxona bronini bekor qilmoqchimisiz? Bekor qilingandan so'ng sana boshqa mijozlar uchun ochiq bo'ladi."
        confirmLabel="Ha, bekor qilinsin"
        cancelLabel="Qaytish"
        variant="danger"
      />
    </div>
  );
}

export default MyBookingsPage;
