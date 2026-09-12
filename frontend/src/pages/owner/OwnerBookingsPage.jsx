import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { bookingsApi } from '../../api/bookings.api';
import { useAuth } from '../../context/AuthContext';
import Select from '../../components/ui/Select';
import Skeleton from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatPrice, formatFriendlyDate } from '../../utils/formatters';
import { BOOKING_STATUS_CONFIG, PAYMENT_STATUS_CONFIG } from '../../utils/status';
import { Calendar, Users, Phone, CalendarDays } from 'lucide-react';

export function OwnerBookingsPage() {
  const { user } = useAuth();
  const [selectedHallId, setSelectedHallId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [timeStatusFilter, setTimeStatusFilter] = useState('');

  // 1. Fetch owner's halls
  const { data: hallsData } = useQuery({
    queryKey: ['owner-halls-for-bookings'],
    queryFn: () => hallsApi.getHalls({ limit: 100 }),
  });

  const allHalls = hallsData?.data?.items || hallsData?.data || [];
  const myHalls = allHalls.filter((h) => h.ownerId === user?.id || !h.ownerId);

  // Default to first hall if not set
  const activeHallId = selectedHallId || myHalls[0]?.id;

  // 2. Fetch bookings for chosen hall
  const { data: bookingsData, isLoading } = useQuery({
    queryKey: ['owner-hall-bookings', activeHallId, statusFilter, timeStatusFilter],
    queryFn: () =>
      activeHallId
        ? bookingsApi.getHallBookings(activeHallId, {
            status: statusFilter || undefined,
            timeStatus: timeStatusFilter || undefined,
          })
        : Promise.resolve({ data: [] }),
    enabled: !!activeHallId,
  });

  const bookings = bookingsData?.data?.items || bookingsData?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
          Kelgan buyurtmalar
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          To'yxonangizga kelib tushgan mijozlar arizalari va to'lovlar
        </p>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-border p-4 sm:p-5 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Select
          label="To'yxonani tanlang"
          value={activeHallId || ''}
          onChange={(e) => setSelectedHallId(e.target.value)}
          options={myHalls.map((h) => ({ value: h.id, label: h.name }))}
        />

        <Select
          label="Vaqt holati"
          value={timeStatusFilter}
          onChange={(e) => setTimeStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'Barcha sanalar' },
            { value: 'UPCOMING', label: 'Kelgusi to\'ylar' },
            { value: 'PAST', label: 'O\'tgan to\'ylar' },
          ]}
        />

        <Select
          label="Buyurtma holati"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          options={[
            { value: '', label: 'Barcha holatlar' },
            { value: 'ACTIVE', label: 'Faol' },
            { value: 'COMPLETED', label: 'Tugallangan' },
            { value: 'CANCELLED', label: 'Bekor qilingan' },
          ]}
        />
      </div>

      {/* Bookings Table / Cards */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28 w-full rounded-2xl" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12">
          <EmptyState
            icon={CalendarDays}
            title="Buyurtmalar topilmadi"
            description="Tanlangan to'yxona yoki filtrlar bo'yicha hech qanday buyurtma mavjud emas."
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

                  <h3 className="font-serif font-bold text-base text-ink">
                    {b.firstName} {b.lastName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-bronze" />
                      {b.phone}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-bronze" />
                      Sana: {formatFriendlyDate(b.bookingDate)}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-bronze" />
                      {b.guestCount} mehmon
                    </span>
                  </div>
                </div>

                <div className="text-right border-t md:border-t-0 pt-3 md:pt-0 border-border/80 w-full md:w-auto">
                  <div className="text-xs text-muted">Jami hisoblangan:</div>
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

export default OwnerBookingsPage;
