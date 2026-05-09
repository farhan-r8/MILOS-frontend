import { Link, useNavigate, useLocation } from 'react-router';
import { Button } from './ui/button';
import { Leaf, LogOut, Menu, X, User } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function DashboardNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  const navLinkClass = (path: string) => {
    const isActive = location.pathname === path;
    return `rounded-full px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700 ${
      isActive ? 'bg-green-50 text-green-700 shadow-sm ring-1 ring-green-100' : ''
    }`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/60 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="group flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 shadow-[0_12px_25px_rgba(16,185,129,0.28)] transition-transform duration-200 group-hover:scale-[1.03]">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-extrabold tracking-tight text-green-700 sm:text-xl">MILOS</div>
              <div className="hidden text-xs text-gray-500 sm:block">
                {isAdmin ? 'Panel Pengurus' : 'Portal Nasabah'}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-3 md:flex">
            <div className="flex items-center gap-1 rounded-full border border-gray-100 bg-white/80 p-1 shadow-sm">
            {isAdmin ? (
              <>
                <Link to="/admin" className={navLinkClass('/admin')}>
                  Dashboard
                </Link>
                <Link to="/admin/schedules" className={navLinkClass('/admin/schedules')}>
                  Jadwal
                </Link>
                <Link to="/admin/waste-types" className={navLinkClass('/admin/waste-types')}>
                  Jenis Sampah
                </Link>
                <Link to="/admin/transactions" className={navLinkClass('/admin/transactions')}>
                  Transaksi
                </Link>
                <Link to="/admin/rewards" className={navLinkClass('/admin/rewards')}>
                  Barang
                </Link>
                <Link to="/admin/redemptions" className={navLinkClass('/admin/redemptions')}>
                  Penukaran
                </Link>
              </>
            ) : (
              <>
                <Link to="/dashboard" className={navLinkClass('/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/sell" className={navLinkClass('/sell')}>
                  Jual Sampah
                </Link>
                <Link to="/pickup" className={navLinkClass('/pickup')}>
                  Pickup
                </Link>
                <Link to="/history" className={navLinkClass('/history')}>
                  Riwayat
                </Link>
                <Link to="/points" className={navLinkClass('/points')}>
                  Poin
                </Link>
                <Link to="/rewards" className={navLinkClass('/rewards')}>
                  Hadiah
                </Link>
              </>
            )}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto rounded-full border border-gray-100 bg-white/80 px-2 py-1.5 shadow-sm hover:bg-green-50">
                  <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-100">
                    <User className="h-4 w-4 text-green-700" />
                  </div>
                  <div className="hidden min-w-0 text-left lg:block">
                    <div className="max-w-[10rem] truncate text-sm font-semibold text-gray-800">{user?.name}</div>
                    <div className="text-xs text-gray-500">{isAdmin ? 'Admin' : 'Nasabah'}</div>
                  </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>{user?.name}</div>
                  <div className="text-xs font-normal text-gray-500">{user?.email}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="rounded-xl border border-gray-100 bg-white/80 p-2 shadow-sm transition hover:bg-green-50 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-gray-100 py-4 md:hidden">
            <div className="max-h-[calc(100vh-5rem)] overflow-y-auto rounded-3xl border border-gray-100 bg-white/95 p-4 shadow-xl">
            <div className="mb-4 flex items-center gap-3 rounded-2xl bg-green-50/80 px-3 py-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <User className="h-4 w-4 text-green-700" />
              </div>
              <div className="min-w-0">
                <div className="truncate text-sm font-semibold text-gray-900">{user?.name}</div>
                <div className="truncate text-xs text-gray-500">{user?.email}</div>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className={navLinkClass('/admin')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/schedules"
                    className={navLinkClass('/admin/schedules')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Jadwal
                  </Link>
                  <Link
                    to="/admin/waste-types"
                    className={navLinkClass('/admin/waste-types')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Jenis Sampah
                  </Link>
                  <Link
                    to="/admin/transactions"
                    className={navLinkClass('/admin/transactions')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Transaksi
                  </Link>
                  <Link
                    to="/admin/rewards"
                    className={navLinkClass('/admin/rewards')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Barang
                  </Link>
                  <Link
                    to="/admin/redemptions"
                    className={navLinkClass('/admin/redemptions')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Penukaran
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className={navLinkClass('/dashboard')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/sell"
                    className={navLinkClass('/sell')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Jual Sampah
                  </Link>
                  <Link
                    to="/pickup"
                    className={navLinkClass('/pickup')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pickup
                  </Link>
                  <Link
                    to="/history"
                    className={navLinkClass('/history')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Riwayat
                  </Link>
                  <Link
                    to="/points"
                    className={navLinkClass('/points')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Poin
                  </Link>
                  <Link
                    to="/rewards"
                    className={navLinkClass('/rewards')}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Hadiah
                  </Link>
                </>
              )}
              <div className="pt-4 mt-2 border-t border-gray-100">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Keluar
                </Button>
              </div>
            </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
