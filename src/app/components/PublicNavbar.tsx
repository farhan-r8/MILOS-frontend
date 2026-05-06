import { Link, useNavigate, useLocation } from 'react-router';
import { Button } from './ui/button';
import { Leaf, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

export function PublicNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

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

      const scrollPosition = window.scrollY + navbarOffset;
      const sections = ['jadwal', 'tentang', 'kontak'];
      let nextActiveSection = 'beranda';

      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          if (scrollPosition >= element.offsetTop) {
            nextActiveSection = section;
          } else {
            break;
          }
        }
      }

      setActiveSection(nextActiveSection);
    };

    // Restore scroll position on mount
    const savedScrollPosition = sessionStorage.getItem('scrollPosition');
    if (savedScrollPosition && location.pathname === '/' && !location.hash) {
      window.scrollTo(0, parseInt(savedScrollPosition));
    }

    scrollToHashSection();
    handleScroll();
    window.addEventListener('scroll', handleScroll);

    // Save scroll position before unload
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

  const handleGetStarted = () => {
    if (isAuthenticated) {
      if (user?.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
    setActiveSection('beranda');
    window.scrollTo({ top: 0, behavior: 'auto' });
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
    const top = Math.max(0, element.offsetTop - 96);
    window.scrollTo({ top, behavior: 'smooth' });
  };

  const navLinkClass = (section: string) => {
    const isActive = activeSection === section;
    return `text-gray-700 hover:text-green-600 transition relative pb-1 ${
      isActive ? 'text-green-600 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-green-600' : ''
    }`;
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" onClick={scrollToTop} className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="font-bold text-xl text-green-700">MILOS</div>
              <div className="text-xs text-gray-600 hidden sm:block">Waste Management System</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <a href="/" onClick={scrollToTop} className={navLinkClass('beranda')}>
              Beranda
            </a>
            <a href="#jadwal" onClick={(e) => scrollToSection(e, 'jadwal')} className={navLinkClass('jadwal')}>
              Jadwal Pengambilan
            </a>
            <a href="#tentang" onClick={(e) => scrollToSection(e, 'tentang')} className={navLinkClass('tentang')}>
              Tentang
            </a>
            <a href="#kontak" onClick={(e) => scrollToSection(e, 'kontak')} className={navLinkClass('kontak')}>
              Kontak
            </a>
            {!isAuthenticated && (
              <Button
                variant="outline"
                onClick={() => navigate('/register')}
                className="border-green-600 text-green-600 hover:bg-green-50"
              >
                Daftar Nasabah
              </Button>
            )}
            <Button onClick={handleGetStarted} className="bg-green-600 hover:bg-green-700">
              {isAuthenticated ? (user?.role === 'admin' ? 'Panel Pengurus' : 'Portal Nasabah') : 'Masuk'}
            </Button>
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
          <div className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-4">
              <a
                href="/"
                onClick={(e) => {
                  scrollToTop(e);
                  setIsMenuOpen(false);
                }}
                className={`${navLinkClass('beranda')} w-fit`}
              >
                Beranda
              </a>
              <a
                href="#jadwal"
                className={`${navLinkClass('jadwal')} w-fit`}
                onClick={(e) => {
                  scrollToSection(e, 'jadwal');
                  setIsMenuOpen(false);
                }}
              >
                Jadwal Pengambilan
              </a>
              <a
                href="#tentang"
                className={`${navLinkClass('tentang')} w-fit`}
                onClick={(e) => {
                  scrollToSection(e, 'tentang');
                  setIsMenuOpen(false);
                }}
              >
                Tentang
              </a>
              <a
                href="#kontak"
                className={`${navLinkClass('kontak')} w-fit`}
                onClick={(e) => {
                  scrollToSection(e, 'kontak');
                  setIsMenuOpen(false);
                }}
              >
                Kontak
              </a>
              {!isAuthenticated && (
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate('/register');
                    setIsMenuOpen(false);
                  }}
                  className="border-green-600 text-green-600 hover:bg-green-50"
                >
                  Daftar Nasabah
                </Button>
              )}
              <Button
                onClick={() => {
                  handleGetStarted();
                  setIsMenuOpen(false);
                }}
                className="bg-green-600 hover:bg-green-700"
              >
                {isAuthenticated ? (user?.role === 'admin' ? 'Panel Pengurus' : 'Portal Nasabah') : 'Masuk'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
