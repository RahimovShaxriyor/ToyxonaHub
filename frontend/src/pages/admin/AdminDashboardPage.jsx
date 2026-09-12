import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { hallsApi } from '../../api/halls.api';
import { ownersApi } from '../../api/owners.api';
import { bookingsApi } from '../../api/bookings.api';
import Skeleton from '../../components/ui/Skeleton';
import Button from '../../components/ui/Button';
import {
  Building2,
  CheckSquare,
  Users,
  CalendarCheck,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';

export function AdminDashboardPage() {
  const navigate = useNavigate();

  // 1. Fetch halls
  const { data: hallsData, isLoading: hallsLoading } = useQuery({
    queryKey: ['admin-halls-count'],
    queryFn: () => hallsApi.getHalls({ limit: 100 }),
  });

  // 2. Fetch owners
  const { data: ownersData, isLoading: ownersLoading } = useQuery({
    queryKey: ['admin-owners-count'],
    queryFn: () => ownersApi.getOwners({ limit: 100 }),
  });

  // 3. Fetch bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useQuery({
    queryKey: ['admin-bookings-count'],
    queryFn: () => bookingsApi.getAllBookings({ limit: 100 }),
  });

  const halls = hallsData?.data?.items || hallsData?.data || [];
  const owners = ownersData?.data?.items || ownersData?.data || [];
  const bookings = bookingsData?.data?.items || bookingsData?.data || [];

  const pendingHalls = halls.filter((h) => h.status === 'PENDING');
  const approvedHalls = halls.filter((h) => h.status === 'APPROVED');
  const isLoading = hallsLoading || ownersLoading || bookingsLoading;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-ink">
          Administrator Boshqaruv Markazi
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1">
          ToyxonaHub tizimi holati, tasdiqlash navbati va statistika
        </p>
      </div>

      {/* Pending Alert Banner if any pending halls */}
      {pendingHalls.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div className="text-xs text-amber-950">
              <span className="font-bold">Tasdiqlash navbatida {pendingHalls.length} ta to'yxona bor!</span>{' '}
              Mulkdorlar tomonidan yangi to'yxonalar kiritilgan.
            </div>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate('/admin/approvals')}
            className="shrink-0"
          >
            Ko'rib chiqish
          </Button>
        </div>
      )}

      {/* Real Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Tasdiqlash navbati</span>
            <CheckSquare className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-ink">
            {isLoading ? <Skeleton className="h-8 w-16" /> : pendingHalls.length}
          </div>
          <span className="text-[11px] text-muted block">Ko'rib chiqilishi kutilmoqda</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Tasdiqlangan zallar</span>
            <Building2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-ink">
            {isLoading ? <Skeleton className="h-8 w-16" /> : approvedHalls.length}
          </div>
          <span className="text-[11px] text-muted block">Katalogda faol ko'rinayotgan</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Mulkdorlar</span>
            <Users className="w-5 h-5 text-bronze" />
          </div>
          <div className="text-2xl font-bold text-ink">
            {isLoading ? <Skeleton className="h-8 w-16" /> : owners.length}
          </div>
          <span className="text-[11px] text-muted block">Tizimda ro'yxatdan o'tgan</span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-border shadow-card space-y-2">
          <div className="flex items-center justify-between text-muted">
            <span className="text-xs font-semibold uppercase tracking-wider">Barcha buyurtmalar</span>
            <CalendarCheck className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-ink">
            {isLoading ? <Skeleton className="h-8 w-16" /> : bookings.length}
          </div>
          <span className="text-[11px] text-muted block">Umumiy tizimdagi buyurtmalar</span>
        </div>
      </div>

      {/* Quick Access Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-ink">Tasdiqlash navbati</h3>
            <p className="text-xs text-muted mt-1">
              Yangi to'yxonalarni tekshiring, tasdiqlang yoki sabab bilan rad eting.
            </p>
          </div>
          <Link
            to="/admin/approvals"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-bronze hover:underline pt-2"
          >
            Navbatga o'tish
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-ink">Mulkdorlar boshqaruvi</h3>
            <p className="text-xs text-muted mt-1">
              Yangi mulkdorlarni ro'yxatdan o'tkazing va to'yxonalarni ularga biriktiring.
            </p>
          </div>
          <Link
            to="/admin/owners"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-bronze hover:underline pt-2"
          >
            Mulkdorlar ro'yxati
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-2xl border border-border p-6 shadow-card space-y-3 flex flex-col justify-between">
          <div>
            <h3 className="font-serif font-bold text-lg text-ink">Buyurtmalar auditi</h3>
            <p className="text-xs text-muted mt-1">
              Barcha mijozlar, to'yxonalar va to'lovlar monitoringini olib boring.
            </p>
          </div>
          <Link
            to="/admin/bookings"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-bronze hover:underline pt-2"
          >
            Buyurtmalar nazorati
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardPage;
