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
    return `text-gray-700 hover:text-green-600 transition relative pb-1 ${
      isActive ? 'text-green-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-green-600' : ''
    }`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link to={isAdmin ? '/admin' : '/dashboard'} className="flex min-w-0 items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="truncate font-bold text-lg text-green-700 sm:text-xl">MILOS</div>
              <div className="text-xs text-gray-600 hidden sm:block">
                {isAdmin ? 'Panel Pengurus' : 'Portal Nasabah'}
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4 lg:gap-6">
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

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-2 lg:px-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-green-700" />
                  </div>
                  <span className="hidden lg:inline">{user?.name}</span>
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
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="max-h-[calc(100vh-4rem)] overflow-y-auto border-t py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {isAdmin ? (
                <>
                  <Link
                    to="/admin"
                    className={`${navLinkClass('/admin')} w-fit`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/admin/schedules"
                    className={`${navLinkClass('/admin/schedules')} w-fit`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Jadwal
                  </Link>
                  <Link
                    to="/admin/waste-types"
                    className={`${navLinkClass('/admin/waste-types')} w-fit`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Jenis Sampah
                  </Link>
                  <Link
                    to="/admin/transactions"
                    className={`${navLinkClass('/admin/transactions')} w-fit`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Transaksi
                  </Link>
                  <Link
                    to="/admin/rewards"
                    className={`${navLinkClass('/admin/rewards')} w-fit`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Barang
                  </Link>
                  <Link
                    to="/admin/redemptions"
                    className={`${navLinkClass('/admin/redemptions')} w-fit`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Penukaran
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/dashboard"
                    className={`${navLinkClass('/dashboard')} w-fit`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/sell"
                    className={`${navLinkClass('/sell')} w-fit`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Jual Sampah
                  </Link>
                  <Link
                    to="/pickup"
                    className={`${navLinkClass('/pickup')} w-fit`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Pickup
                  </Link>
                  <Link
                    to="/history"
                    className={`${navLinkClass('/history')} w-fit`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Riwayat
                  </Link>
                  <Link
                    to="/points"
                    className={`${navLinkClass('/points')} w-fit`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Poin
                  </Link>
                  <Link
                    to="/rewards"
                    className={`${navLinkClass('/rewards')} w-fit`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Hadiah
                  </Link>
                </>
              )}
              <div className="pt-4 border-t">
                <div className="text-sm text-gray-600 mb-2">{user?.name}</div>
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
        )}
      </div>
    </nav>
  );
}
