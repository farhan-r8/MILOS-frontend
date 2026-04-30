import { ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { 
  LayoutDashboard, 
  Trash2, 
  History, 
  Coins, 
  Calendar, 
  FileText,
  CheckCircle,
  Users,
  Menu,
  X
} from "lucide-react";
import { Navbar } from "./Navbar";
import { useState } from "react";

interface MenuItem {
  path: string;
  label: string;
  icon: ReactNode;
}

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: 'nasabah' | 'admin';
  userName?: string;
}

export function DashboardLayout({ children, userRole, userName }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const nasabahMenuItems: MenuItem[] = [
    { path: '/nasabah', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/nasabah/pickup', label: 'Ajukan Pickup', icon: <Trash2 className="w-5 h-5" /> },
    { path: '/nasabah/history', label: 'Riwayat', icon: <History className="w-5 h-5" /> },
    { path: '/nasabah/points', label: 'Info Poin', icon: <Coins className="w-5 h-5" /> },
  ];

  const adminMenuItems: MenuItem[] = [
    { path: '/admin', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { path: '/admin/schedule', label: 'Kelola Jadwal', icon: <Calendar className="w-5 h-5" /> },
    { path: '/admin/waste-types', label: 'Jenis Sampah', icon: <FileText className="w-5 h-5" /> },
    { path: '/admin/verify', label: 'Verifikasi', icon: <CheckCircle className="w-5 h-5" /> },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : nasabahMenuItems;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userRole={userRole} userName={userName} />
      
      <div className="flex">
        {/* Mobile Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden fixed bottom-4 right-4 z-50 bg-green-600 text-white p-3 rounded-full shadow-lg"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Sidebar */}
        <aside className={`
          fixed lg:sticky top-16 left-0 h-[calc(100vh-4rem)] w-64 bg-white shadow-md z-40
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          <div className="p-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">
              {userRole === 'admin' ? 'Menu Admin' : 'Menu Nasabah'}
            </h2>
            <nav className="space-y-2">
              {menuItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      ${isActive 
                        ? 'bg-green-50 text-green-600 font-medium' 
                        : 'text-gray-700 hover:bg-gray-50'
                      }
                    `}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30 top-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
