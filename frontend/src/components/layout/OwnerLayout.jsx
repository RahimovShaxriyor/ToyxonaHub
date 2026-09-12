import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Building2,
  CalendarDays,
  User,
  LogOut,
  Menu,
  X,
  ArrowUpRight,
} from 'lucide-react';

export function OwnerLayout() {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
      isActive
        ? 'bg-bronze text-white shadow-sm'
        : 'text-muted hover:text-ink hover:bg-canvas'
    }`;

  return (
    <div className="min-h-screen bg-canvas flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-ink/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border transform transition-transform duration-200 lg:translate-x-0 lg:static lg:block ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-full flex flex-col">
          {/* Brand */}
          <div className="h-20 px-6 flex items-center justify-between border-b border-border/80">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-bronze flex items-center justify-center text-white">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="font-serif font-bold text-lg text-ink">
                Toyxona<span className="text-bronze">Hub</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg text-muted hover:text-ink lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role badge */}
          <div className="px-6 py-3 bg-canvas/60 border-b border-border/80 flex items-center justify-between">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-muted">
              Mulkdor Kabineti
            </span>
            <Link
              to="/catalog"
              className="text-xs text-bronze hover:underline flex items-center gap-0.5"
            >
              Katalog
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            <NavLink
              to="/owner/dashboard"
              end
              onClick={() => setSidebarOpen(false)}
              className={navItemClass}
            >
              <LayoutDashboard className="w-4 h-4 shrink-0" />
              Umumiy holat
            </NavLink>

            <NavLink
              to="/owner/halls"
              onClick={() => setSidebarOpen(false)}
              className={navItemClass}
            >
              <Building2 className="w-4 h-4 shrink-0" />
              To'yxonalarim
            </NavLink>

            <NavLink
              to="/owner/bookings"
              onClick={() => setSidebarOpen(false)}
              className={navItemClass}
            >
              <CalendarDays className="w-4 h-4 shrink-0" />
              Kelgan buyurtmalar
            </NavLink>

            <NavLink
              to="/profile"
              onClick={() => setSidebarOpen(false)}
              className={navItemClass}
            >
              <User className="w-4 h-4 shrink-0" />
              Profil ma'lumotlari
            </NavLink>
          </nav>

          {/* User profile card & Logout */}
          <div className="p-4 border-t border-border/80 bg-canvas/30">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-bronze-100 text-bronze flex items-center justify-center font-bold text-sm">
                {user?.firstName ? user.firstName[0].toUpperCase() : 'O'}
              </div>
              <div className="overflow-hidden">
                <div className="text-xs font-semibold text-ink truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-[11px] text-muted truncate">{user?.email}</div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Tizimdan chiqish
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for mobile */}
        <header className="h-16 bg-white border-b border-border px-4 flex items-center justify-between lg:hidden">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl border border-border text-ink"
            aria-label="Menyu ochish"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif font-bold text-ink">Mulkdor Kabineti</span>
          <div className="w-8" />
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default OwnerLayout;
