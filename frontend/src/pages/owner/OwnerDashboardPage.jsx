import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { bookingsApi } from '../../api/bookings.api';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, formatFriendlyDate } from '../../utils/formatters';
import Button from '../../components/ui/Button';
import Skeleton from '../../components/ui/Skeleton';
import {
  Building2,
  CalendarCheck,
  CreditCard,
  PlusCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

export function OwnerDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // 1. Fetch owner's halls
  const { data: hallsData, isLoading: hallsLoading } = useQuery({
    queryKey: ['owner-halls'],
    queryFn: () => hallsApi.getHalls({ limit: 100 }), // Filtered or own halls
  });

  const allHalls = hallsData?.data?.items || hallsData?.data || [];
  const myHalls = allHalls.filter((h) => h.ownerId === user?.id || !h.ownerId);

  // 2. Fetch bookings for the first hall or aggregate
  const primaryHallId = myHalls[0]?.id;

  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['owner-bookings', primaryHallId],
    queryFn: () => (primaryHallId ? bookingsApi.getHallBookings(primaryHallId) : Promise.resolve({ data: [] })),
    enabled: !!primaryHallId,
  });

  const bookings = bookingsData?.data?.items || bookingsData?.data || [];

  // Compute real metrics
  const totalHallsCount = myHalls.length;
  const totalBookingsCount = bookings.length;
  const upcomingBookings = bookings.filter((b) => b.timeStatus === 'UPCOMING' && b.status === 'ACTIVE');
  const paidAdvancesTotal = bookings
    .filter((b) => b.paymentStatus === 'ADVANCE_PAID' || b.paymentStatus === 'FULLY_PAID')
    .reduce((sum, b) => sum + (Number(b.advancePayment) || 0), 0);

  const isLoading = hallsLoading || bookingsLoading;

  return (
    <div className="space-y-8">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
            Xush kelibsiz, {user?.firstName}!
          </h1>
          <p className="text-xs sm:text-sm text-muted mt-1">
            To'yxonangiz buyurtmalari va bo'sh sanalar boshqaruvi
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

      {/* Real Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">To'yxonalarim</span>
            <Building2 className="w-5 h-5 text-bronze" />
          </div>
          <div className="text-2xl font-bold text-ink">
            {isLoading ? <Skeleton className="h-8 w-16" /> : totalHallsCount}
          </div>
          <span className="text-[11px] text-muted block">Faol boshqaruvdagi to'yxonalar</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Jami buyurtmalar</span>
            <CalendarCheck className="w-5 h-5 text-bronze" />
          </div>
          <div className="text-2xl font-bold text-ink">
            {isLoading ? <Skeleton className="h-8 w-16" /> : totalBookingsCount}
          </div>
          <span className="text-[11px] text-muted block">Qabul qilingan barcha arizalar</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Kelgusi to'ylar</span>
            <Clock className="w-5 h-5 text-bronze" />
          </div>
          <div className="text-2xl font-bold text-ink">
            {isLoading ? <Skeleton className="h-8 w-16" /> : upcomingBookings.length}
          </div>
          <span className="text-[11px] text-muted block">Rejalashtirilgan to'ylar</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Tushgan avanslar</span>
            <CreditCard className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-700">
            {isLoading ? <Skeleton className="h-8 w-24" /> : formatPrice(paidAdvancesTotal)}
          </div>
          <span className="text-[11px] text-muted block">To'langan 20% avans summasi</span>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg text-ink">Mening to'yxonalarim</h2>
            <Link
              to="/owner/halls"
              className="text-xs font-semibold text-bronze hover:underline flex items-center gap-1"
            >
              Barchasi
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {myHalls.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted">
              Sizda hali to'yxona qo'shilmagan.
            </div>
          ) : (
            <div className="space-y-3">
              {myHalls.slice(0, 3).map((hall) => (
                <div
                  key={hall.id}
                  className="p-3 rounded-xl bg-canvas border border-border/80 flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-sm font-bold text-ink">{hall.name}</h4>
                    <span className="text-xs text-muted">
                      {hall.district} • {hall.capacity} kishi
                    </span>
                  </div>
                  <Link
                    to={`/owner/halls/${hall.id}/edit`}
                    className="text-xs font-semibold text-bronze hover:underline"
                  >
                    Boshqarish
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Bookings Overview */}
        <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif font-bold text-lg text-ink">So'nggi buyurtmalar</h2>
            <Link
              to="/owner/bookings"
              className="text-xs font-semibold text-bronze hover:underline flex items-center gap-1"
            >
              Barchasi
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-6 text-xs text-muted">
              Hozircha buyurtmalar yo'q.
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 3).map((b) => (
                <div
                  key={b.id}
                  className="p-3 rounded-xl bg-canvas border border-border/80 flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-bold text-ink">
                      {b.firstName} {b.lastName} ({b.phone})
                    </div>
                    <span className="text-[11px] text-muted">
                      Sana: {formatFriendlyDate(b.bookingDate)} • {b.guestCount} kishi
                    </span>
                  </div>
                  <span className="text-xs font-bold text-bronze">
                    {formatPrice(b.totalPrice)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default OwnerDashboardPage;
