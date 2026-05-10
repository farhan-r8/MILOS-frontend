import { useEffect, useState } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Bell, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Info,
  Package,
  Award,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router';

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type?: 'info' | 'success' | 'error';
  entity?: 'pickup' | 'transaction' | 'redemption' | 'general';
  createdAt: string;
  read: boolean;
};

const STORAGE_KEY = 'milos_notifications_history';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load history from local storage
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse notifications', e);
      }
    }

    const handleRealtime = (event: Event) => {
      const customEvent = event as CustomEvent<any>;
      const detail = customEvent.detail;
      
      const newNotif: NotificationItem = {
        id: detail.id || Date.now().toString(),
        title: detail.title || 'Notifikasi Baru',
        message: detail.message || '',
        type: detail.type || 'info',
        entity: detail.entity || 'general',
        createdAt: new Date().toISOString(),
        read: false
      };

      setNotifications(prev => {
        const updated = [newNotif, ...prev].slice(0, 50); // Keep last 50
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    };

    window.addEventListener('milos:realtime', handleRealtime);
    return () => window.removeEventListener('milos:realtime', handleRealtime);
  }, []);

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  const getIcon = (entity?: string, type?: string) => {
    if (type === 'error') return <XCircle className="w-5 h-5 text-red-500" />;
    
    switch (entity) {
      case 'transaction': return <Award className="w-5 h-5 text-green-500" />;
      case 'pickup': return <Package className="w-5 h-5 text-blue-500" />;
      case 'redemption': return <CheckCircle2 className="w-5 h-5 text-purple-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />
      
      <div className="pt-24 pb-12 container mx-auto px-4 md:px-6">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Bell className="w-6 h-6 text-green-600" />
                Notifikasi
              </h1>
              <p className="text-sm text-gray-500 mt-1">Pantau aktivitas akun Anda secara real-time.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={notifications.length === 0}>
                Tandai Dibaca
              </Button>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700" onClick={clearAll} disabled={notifications.length === 0}>
                <Trash2 className="w-4 h-4 mr-2" />
                Hapus Semua
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            {notifications.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Bell className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900">Belum ada notifikasi</h3>
                  <p className="text-gray-500 max-w-xs mt-1">
                    Semua pemberitahuan aktivitas transaksi dan pickup Anda akan muncul di sini.
                  </p>
                </CardContent>
              </Card>
            ) : (
              notifications.map((notif) => (
                <Card key={notif.id} className={`transition-all duration-200 ${!notif.read ? 'border-l-4 border-l-green-500 bg-green-50/30' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <div className="mt-1 shrink-0">
                        {getIcon(notif.entity, notif.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className={`text-sm font-semibold truncate ${!notif.read ? 'text-green-900' : 'text-gray-900'}`}>
                            {notif.title}
                          </h4>
                          <span className="text-[10px] text-gray-400 flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3" />
                            {new Date(notif.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                          {notif.message}
                        </p>
                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-[10px] text-gray-400 uppercase tracking-wider">
                            {notif.entity || 'Umum'}
                          </span>
                          {notif.entity === 'transaction' && (
                            <Button variant="link" className="h-auto p-0 text-xs text-green-600" onClick={() => navigate('/history')}>
                              Lihat Riwayat <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                          {notif.entity === 'pickup' && (
                            <Button variant="link" className="h-auto p-0 text-xs text-blue-600" onClick={() => navigate('/history')}>
                              Cek Status Pickup <ArrowRight className="w-3 h-3 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
