import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { Menu, X, User, LogOut, Calendar, Building2, ShieldCheck, ChevronDown } from 'lucide-react';

export function Navbar() {
  const { user, isAuthenticated, logout, isAdmin, isOwner, isUser, isLoading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isTransparent = location.pathname === '/' && !isScrolled && !mobileMenuOpen;

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors px-3 py-2 rounded-lg ${
      isTransparent
        ? isActive
          ? 'text-white font-semibold bg-white/20'
          : 'text-white/80 hover:text-white hover:bg-white/10'
        : isActive
        ? 'text-bronze font-semibold bg-bronze-50/70'
        : 'text-muted hover:text-ink hover:bg-canvas'
    }`;

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isTransparent
          ? 'bg-ink/50 backdrop-blur-md border-b border-white/10 text-white'
          : 'bg-white/95 backdrop-blur-md border-b border-border/80 shadow-xs text-ink'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-bronze flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <span
              className={`text-xl font-bold font-serif tracking-tight block leading-none transition-colors ${
                isTransparent ? 'text-white' : 'text-ink'
              }`}
            >
              Toyxona<span className="text-bronze-400">Hub</span>
            </span>
            <span
              className={`text-[11px] font-medium tracking-wider uppercase block mt-1 transition-colors ${
                isTransparent ? 'text-white/70' : 'text-muted'
              }`}
            >
              Toshkent to'yxonalari
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={navLinkClass}>
            Bosh sahifa
          </NavLink>
          <NavLink to="/catalog" className={navLinkClass}>
            To'yxonalar katalogi
          </NavLink>

          {isAuthenticated && isUser && (
            <NavLink to="/my-bookings" className={navLinkClass}>
              Mening buyurtmalarim
            </NavLink>
          )}

          {isAuthenticated && isOwner && (
            <NavLink to="/owner/dashboard" className={navLinkClass}>
              To'yxona kabineti
            </NavLink>
          )}

          {isAuthenticated && isAdmin && (
            <NavLink to="/admin/dashboard" className={navLinkClass}>
              Admin paneli
            </NavLink>
          )}

          {!isAuthenticated && (
            <Link
              to="/login?role=OWNER"
              state={{ role: 'OWNER', message: "To'yxona boshqaruv kabinetiga kirish" }}
              className={navLinkClass({ isActive: false })}
            >
              Mulkdorlar uchun
            </Link>
          )}
        </nav>

        {/* User Auth Buttons / Dropdown */}
        <div className="hidden md:flex items-center gap-3 transition-opacity duration-ui min-h-[40px]">
          {isLoading ? (
            <div className="w-24 h-9 bg-zinc-200/50 animate-pulse rounded-full" />
          ) : isAuthenticated ? (
            <div className="relative animate-in fade-in duration-ui">
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={`flex items-center gap-2.5 p-1.5 pr-3 rounded-full border transition-colors ${
                  isTransparent
                    ? 'border-white/20 bg-white/10 hover:border-white/40 text-white backdrop-blur-xs'
                    : 'border-border hover:border-border-dark bg-white shadow-xs'
                }`}
                aria-expanded={dropdownOpen}
              >
                <div className="w-8 h-8 rounded-full bg-bronze-100 text-bronze flex items-center justify-center font-bold text-xs">
                  {user?.firstName ? user.firstName[0].toUpperCase() : 'U'}
                </div>
                <div className="text-left leading-tight hidden lg:block">
                  <div className={`text-xs font-semibold ${isTransparent ? 'text-white' : 'text-ink'}`}>
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className={`text-[10px] capitalize ${isTransparent ? 'text-white/75' : 'text-muted'}`}>
                    {user?.role === 'ADMIN' ? 'Administrator' : user?.role === 'OWNER' ? 'Mulkdor' : 'Mijoz'}
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 ${isTransparent ? 'text-white/80' : 'text-muted'}`} />
              </button>

              {dropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-border shadow-dropdown py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-border/60">
                      <p className="text-xs text-muted">Tizimga kirilgan:</p>
                      <p className="text-xs font-semibold text-ink truncate mt-0.5">{user?.email}</p>
                    </div>

                    <Link
                      to="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-canvas transition-colors"
                    >
                      <User className="w-4 h-4 text-muted" />
                      Profil ma'lumotlari
                    </Link>

                    {isUser && (
                      <Link
                        to="/my-bookings"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-canvas transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-muted" />
                        Mening buyurtmalarim
                      </Link>
                    )}

                    {isOwner && (
                      <Link
                        to="/owner/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-canvas transition-colors"
                      >
                        <Building2 className="w-4 h-4 text-muted" />
                        Boshqaruv paneli
                      </Link>
                    )}

                    {isAdmin && (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-ink hover:bg-canvas transition-colors"
                      >
                        <ShieldCheck className="w-4 h-4 text-muted" />
                        Admin paneli
                      </Link>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Chiqish
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 animate-in fade-in duration-ui">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/login')}
                className={isTransparent ? 'text-white hover:text-white hover:bg-white/15' : ''}
              >
                Kirish
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/register')}
              >
                Ro'yxatdan o'tish
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`p-2 rounded-xl border transition-colors focus-visible:ring-2 focus-visible:ring-bronze focus:outline-none ${
              isTransparent
                ? 'border-white/20 text-white hover:bg-white/10'
                : 'border-border text-ink hover:bg-canvas'
            }`}
            aria-label="Menyu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-white px-4 pt-3 pb-6 space-y-3">
          <div className="flex flex-col space-y-1">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-canvas"
            >
              Bosh sahifa
            </Link>
            <Link
              to="/catalog"
              onClick={() => setMobileMenuOpen(false)}
              className="px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-canvas"
            >
              To'yxonalar katalogi
            </Link>

            {isAuthenticated && isUser && (
              <Link
                to="/my-bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-canvas"
              >
                Mening buyurtmalarim
              </Link>
            )}

            {isAuthenticated && isOwner && (
              <Link
                to="/owner/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-canvas"
              >
                To'yxona kabineti
              </Link>
            )}

            {isAuthenticated && isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-canvas"
              >
                Admin paneli
              </Link>
            )}

            {isAuthenticated && (
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-canvas"
              >
                Profil ma'lumotlari
              </Link>
            )}

            {!isAuthenticated && (
              <Link
                to="/login?role=OWNER"
                state={{ role: 'OWNER', message: "To'yxona boshqaruv kabinetiga kirish" }}
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2.5 rounded-xl text-sm font-medium text-ink hover:bg-canvas"
              >
                Mulkdorlar uchun
              </Link>
            )}
          </div>

          <div className="pt-3 border-t border-border/80">
            {isAuthenticated ? (
              <div className="space-y-3">
                <div className="px-3 text-xs text-muted">
                  Kirilgan foydalanuvchi: <span className="font-semibold text-ink">{user?.email}</span>
                </div>
                <Button
                  variant="dangerOutline"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Chiqish
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={() => {
                    navigate('/login');
                    setMobileMenuOpen(false);
                  }}
                >
                  Kirish
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => {
                    navigate('/register');
                    setMobileMenuOpen(false);
                  }}
                >
                  Ro'yxatdan o'tish
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

export default Navbar;
