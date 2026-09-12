import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '../../api/bookings.api';
import Select from '../../components/ui/Select';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatPrice, formatFriendlyDate } from '../../utils/formatters';
import { BOOKING_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '../../utils/status';
import { Calendar, Users, Phone, Building2, CalendarDays } from 'lucide-react';

export function AdminBookingsPage() {
  const [statusFilter, setStatusFilter] = useState('');
  const [timeStatusFilter, setTimeStatusFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin-all-bookings', statusFilter, timeStatusFilter],
    queryFn: () =>
      bookingsApi.getAllBookings({
        status: statusFilter || undefined,
        timeStatus: timeStatusFilter || undefined,
        limit: 100,
      }),
  });

  const bookings = data?.data?.items || data?.data || [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
          Barcha buyurtmalar auditi
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          Tizimdagi barcha to'yxonalar bo'yicha mijozlar arizalari, shaxsiy ma'lumotlari va to'lovlar monitoringi
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-card grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-xl">
        <Select
          label="Vaqt holati"
          value={timeStatusFilter}
          onChange={(e) => setTimeStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'Barcha sanalar' },
            { value: 'UPCOMING', label: 'Kelgusi to\'ylar (UPCOMING)' },
            { value: 'PAST', label: 'O\'tgan to\'ylar (PAST)' },
          ]}
        />

        <Select
          label="Buyurtma holati"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'Barcha holatlar' },
            { value: 'ACTIVE', label: 'Faol (ACTIVE)' },
            { value: 'COMPLETED', label: 'Tugallangan (COMPLETED)' },
            { value: 'CANCELLED', label: 'Bekor qilingan (CANCELLED)' },
          ]}
        />
      </div>

      {/* Audit List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12">
          <EmptyState
            icon={CalendarDays}
            title="Buyurtmalar topilmadi"
            description="Tanlangan filtrlar bo'yicha buyurtmalar mavjud emas."
          />
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b) => {
            const statusConfig = BOOKING_STATUS_CONFIG[b.status] || {
              label: b.status,
              bg: 'bg-zinc-100',
            };
            const paymentConfig = PAYMENT_STATUS_CONFIG[b.paymentStatus] || {
              label: b.paymentStatus,
              bg: 'bg-zinc-100',
            };

            return (
              <div
                key={b.id}
                className="bg-white rounded-2xl border border-border p-5 shadow-card hover:border-border-dark transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${statusConfig.bg}`}>
                      {statusConfig.label}
                    </span>
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${paymentConfig.bg}`}>
                      {paymentConfig.label}
                    </span>
                    {b.timeStatus && (
                      <span className="text-[11px] font-medium text-muted bg-canvas border border-border/80 px-2 py-0.5 rounded-full">
                        {b.timeStatus === 'UPCOMING' ? 'Kelgusi' : 'O\'tgan'}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-base text-ink">
                      {b.firstName} {b.lastName}
                    </h3>
                    <span className="text-xs text-muted">ID: {b.id.slice(0, 8)}...</span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
                    <span className="flex items-center gap-1 font-medium text-ink">
                      <Building2 className="w-3.5 h-3.5 text-bronze" />
                      {b.weddingHall?.name || "To'yxona"} ({b.weddingHall?.district})
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1 font-medium text-ink">
                      <Phone className="w-3.5 h-3.5 text-bronze" />
                      {b.phone}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-bronze" />
                      {formatFriendlyDate(b.bookingDate)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-bronze" />
                      {b.guestCount} kishi
                    </span>
                  </div>
                </div>

                <div className="text-right border-t md:border-t-0 pt-3 md:pt-0 border-border/80 w-full md:w-auto">
                  <div className="text-xs text-muted">Jami:</div>
                  <div className="text-base font-bold text-ink">{formatPrice(b.totalPrice)}</div>
                  <div className="text-xs font-semibold text-emerald-700 mt-0.5">
                    Avans: {formatPrice(b.advancePayment)}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminBookingsPage;
