import { Link, useNavigate, useLocation } from 'react-router';
import { Button } from './ui/button';
import { Leaf, Menu, X, User, LayoutDashboard, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

export function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const navbarOffset = 96;

    const scrollToHashSection = () => {
      if (location.pathname !== '/' || !location.hash) return;

      const sectionId = location.hash.replace('#', '');
      const element = document.getElementById(sectionId);
      if (!element) return;

      const top = Math.max(0, element.offsetTop - navbarOffset);
      window.scrollTo({ top, behavior: 'auto' });
    };

    const handleScroll = () => {
      if (location.pathname !== '/') {
        setActiveSection('');
        return;
      }

      const sections = ['jadwal', 'tentang', 'kontak'];
      const markerLine = Math.max(navbarOffset + 24, window.innerHeight * 0.35);

      const firstSection = document.getElementById(sections[0]);
      if (firstSection) {
        const firstRect = firstSection.getBoundingClientRect();
        if (firstRect.top > markerLine) {
          setActiveSection('beranda');
          return;
        }
      }

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= markerLine && rect.bottom >= markerLine) {
            setActiveSection(section);
            return;
          }
        }
      }

      const lastSection = document.getElementById(sections[sections.length - 1]);
      if (lastSection && lastSection.getBoundingClientRect().top <= markerLine) {
        setActiveSection('kontak');
        return;
      }

      setActiveSection('beranda');
    };

    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    if (savedScrollPosition && location.pathname === '/' && !location.hash) {
      window.scrollTo(0, parseInt(savedScrollPosition));
    }

    scrollToHashSection();
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    const handleBeforeUnload = () => {
      if (location.pathname === '/') {
        sessionStorage.setItem('scrollPosition', window.scrollY.toString());
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [location.pathname, location.hash]);

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
    setActiveSection('beranda');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, section: string) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate(`/#${section}`);
      return;
    }

    const element = document.getElementById(section);
    if (!element) return;

    setActiveSection(section);
    const top = Math.max(0, element.offsetTop - 80);
    window.scrollTo({ top, behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const navLinkClass = (section: string) => {
    const isActive = activeSection === section;
    return `rounded-full px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-green-50 hover:text-green-700 ${
      isActive ? 'bg-green-50 text-green-700 shadow-sm ring-1 ring-green-100' : ''
    }`;
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user?.role === 'admin';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/60 bg-white/90 backdrop-blur-md shadow-[0_8px_30px_rgba(15,23,42,0.06)]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3">
          {/* Logo */}
          <Link to="/" onClick={scrollToTop} className="group flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 shadow-[0_12px_25px_rgba(16,185,129,0.28)] transition-transform duration-200 group-hover:scale-[1.03]">
              <Leaf className="h-6 w-6 text-white" />
            </div>
            <div className="min-w-0">
              <div className="truncate text-lg font-extrabold tracking-tight text-green-700 sm:text-xl">MILOS</div>
              <div className="hidden text-xs text-gray-500 sm:block">Bank Sampah Digital</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden items-center gap-4 md:flex">
            <div className="flex items-center gap-1 rounded-full border border-gray-100 bg-white/80 p-1 shadow-sm">
              <a href="/" onClick={scrollToTop} className={navLinkClass('beranda')}>
                Beranda
              </a>
              <a href="#jadwal" onClick={(e) => scrollToSection(e, 'jadwal')} className={navLinkClass('jadwal')}>
                Jadwal
              </a>
              <a href="#tentang" onClick={(e) => scrollToSection(e, 'tentang')} className={navLinkClass('tentang')}>
                Tentang
              </a>
              <a href="#kontak" onClick={(e) => scrollToSection(e, 'kontak')} className={navLinkClass('kontak')}>
                Kontak
              </a>
            </div>

            {isAuthenticated ? (
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
                  <DropdownMenuItem onClick={() => navigate(isAdmin ? '/admin' : '/dashboard')}>
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Keluar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login" className="hidden lg:block">
                  <Button variant="ghost" className="rounded-full text-gray-700 hover:bg-green-50 hover:text-green-700">
                    Masuk
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="rounded-full bg-green-600 px-6 font-semibold shadow-lg shadow-green-200 hover:bg-green-700">
                    Daftar Sekarang
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              className="rounded-xl border border-gray-100 bg-white/80 p-2 shadow-sm transition hover:bg-green-50"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="border-t border-gray-100 py-4 md:hidden">
            <div className="max-h-[calc(100vh-5rem)] overflow-y-auto rounded-3xl border border-gray-100 bg-white/95 p-4 shadow-xl">
              {isAuthenticated && (
                <div className="mb-4 flex items-center gap-3 rounded-2xl bg-green-50/80 px-3 py-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <User className="h-4 w-4 text-green-700" />
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-semibold text-gray-900">{user?.name}</div>
                    <div className="truncate text-xs text-gray-500">{user?.email}</div>
                  </div>
                </div>
              )}
              <div className="flex flex-col gap-2">
                <a href="/" onClick={scrollToTop} className={navLinkClass('beranda')}>
                  Beranda
                </a>
                <a href="#jadwal" onClick={(e) => scrollToSection(e, 'jadwal')} className={navLinkClass('jadwal')}>
                  Jadwal
                </a>
                <a href="#tentang" onClick={(e) => scrollToSection(e, 'tentang')} className={navLinkClass('tentang')}>
                  Tentang
                </a>
                <a href="#kontak" onClick={(e) => scrollToSection(e, 'kontak')} className={navLinkClass('kontak')}>
                  Kontak
                </a>
                
                {isAuthenticated ? (
                  <>
                    <Link to={isAdmin ? '/admin' : '/dashboard'} className={navLinkClass(isAdmin ? '/admin' : '/dashboard')}>
                      Dashboard
                    </Link>
                    <div className="pt-4 mt-2 border-t border-gray-100">
                      <Button
                        variant="outline"
                        className="w-full text-red-600 border-red-100 hover:bg-red-50 hover:text-red-700"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Keluar
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <Link to="/login" className={navLinkClass('/login')}>
                      Masuk
                    </Link>
                    <div className="pt-4 mt-2 border-t border-gray-100">
                      <Link to="/register">
                        <Button className="w-full bg-green-600 font-semibold shadow-lg shadow-green-200">
                          Daftar Sekarang
                        </Button>
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
