import { Link, useNavigate } from "react-router";
import { Leaf, User, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";

interface NavbarProps {
  userRole?: 'nasabah' | 'admin' | null;
  userName?: string;
}

export function Navbar({ userRole, userName }: NavbarProps) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    // Mock logout - in real app would clear auth state
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="bg-gradient-to-br from-green-500 to-green-600 p-2 rounded-lg">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent">
              MILOS
            </span>
          </Link>

          <div className="flex items-center gap-6">
            {!userRole ? (
              <>
                <Link 
                  to="/#jadwal" 
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Jadwal
                </Link>
                <Link 
                  to="/#tentang" 
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Tentang
                </Link>
                <Link 
                  to="/login" 
                  className="text-gray-700 hover:text-green-600 transition-colors"
                >
                  Masuk
                </Link>
                <Link 
                  to="/register" 
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Daftar
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <User className="w-5 h-5 text-green-600" />
                  <span className="text-gray-700">{userName || 'User'}</span>
                </button>
                
                {showDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
                    <Link
                      to={userRole === 'admin' ? '/admin' : '/nasabah'}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <LayoutDashboard className="w-4 h-4 text-gray-600" />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors w-full text-left border-t border-gray-100"
                    >
                      <LogOut className="w-4 h-4 text-red-600" />
                      <span className="text-red-600">Keluar</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
