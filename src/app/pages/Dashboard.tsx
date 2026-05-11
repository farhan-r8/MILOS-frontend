import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { SimpleBarChart } from '../components/SimpleBarChart';
import {
  TrendingUp,
  Package,
  Clock,
  Award,
  ArrowRight,
  Recycle,
  Calendar,
  LayoutDashboard,
  History,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { fetchPickups, fetchTransactions, fetchUserPoints, type PickupItem, type TransactionItem } from '../lib/milosApi';
import { toast } from 'sonner';
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh';

const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [pickups, setPickups] = useState<PickupItem[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(user?.points || 0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id || !token) return;

    try {
      const [transactionResult, pickupResult, pointsResult] = await Promise.allSettled([
        fetchTransactions(user.id),
        fetchPickups(token),
        fetchUserPoints(user.id, token),
      ]);

      if (transactionResult.status === 'fulfilled') {
        setTransactions(transactionResult.value);
      }

      if (pickupResult.status === 'fulfilled') {
        setPickups(pickupResult.value);
      }

      if (pointsResult.status === 'fulfilled') {
        setTotalPoints(pointsResult.value.totalPoints);
      }

      if (
        transactionResult.status === 'rejected' &&
        pickupResult.status === 'rejected' &&
        pointsResult.status === 'rejected'
      ) {
        toast.error('Gagal memuat seluruh data dashboard.');
      }
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useRealtimeRefresh(Boolean(token && user?.id), loadData, ['pickup', 'transaction', 'redemption']);

  const chartData = useMemo(() => {
    const grouped = new Map<string, number>();
    transactions
      .filter((transaction) => transaction.status === 'verified')
      .forEach((transaction) => {
        const key = monthFormatter.format(new Date(transaction.date));
        grouped.set(key, (grouped.get(key) || 0) + transaction.totalPoints);
      });

    const result = Array.from(grouped.entries()).map(([month, points]) => ({ month, points }));
    
    // Fallback data if empty
    if (result.length === 0) {
      return [{ month: monthFormatter.format(new Date()), points: 0 }];
    }
    
    return result;
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 5);
  const totalWeight = transactions.reduce((sum, transaction) => sum + transaction.weight, 0);
  const pendingTransactions = transactions.filter((transaction) => transaction.status === 'pending').length;
  const verifiedTransactions = transactions.filter((transaction) => transaction.status === 'verified');
  const activePickup = pickups.find((pickup) => ['pending', 'approved', 'scheduled'].includes(pickup.status));

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <DashboardNavbar />

      <div className="pt-24 pb-12 container mx-auto px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <div className="flex flex-col items-center md:items-start md:flex-row gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div className="text-center md:text-left">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Halo, {user?.name.split(' ')[0]}!</h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">Berikut adalah ringkasan aktivitas tabungan sampah Anda.</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:flex sm:items-center gap-3">
              <Button onClick={() => navigate('/sell')} className="w-full sm:w-auto bg-green-600 hover:bg-green-700 rounded-xl shadow-lg shadow-green-200/50 h-11 md:h-12 text-sm">
                <Package className="w-4 h-4 mr-2" />
                Jual Sampah
              </Button>
              <Button variant="outline" onClick={() => navigate('/pickup')} className="w-full sm:w-auto rounded-xl bg-white border-gray-200 h-11 md:h-12 text-sm">
                Ajukan Pickup
              </Button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <Card className="border-none bg-green-600 text-white shadow-xl shadow-green-100 rounded-3xl">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-green-100 text-[10px] md:text-xs font-medium uppercase tracking-wider">Total Poin</span>
                  <Award className="w-4 h-4 md:w-5 md:h-5 text-green-200" />
                </div>
                <CardTitle className="text-2xl md:text-3xl pt-2">{totalPoints.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-green-50 text-[10px] md:text-xs">
                  <TrendingUp className="w-3 h-3 md:w-3.5 md:h-3.5" />
                  <span>{verifiedTransactions.length} transaksi sukses</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm rounded-3xl">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider">Total Sampah</span>
                  <Recycle className="w-4 h-4 md:w-5 md:h-5 text-blue-500" />
                </div>
                <CardTitle className="text-2xl md:text-3xl pt-2">{totalWeight.toFixed(1)} <span className="text-sm md:text-lg font-normal text-gray-400">kg</span></CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-none bg-white shadow-sm rounded-3xl">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider">Transaksi</span>
                  <Activity className="w-4 h-4 md:w-5 md:h-5 text-purple-500" />
                </div>
                <CardTitle className="text-2xl md:text-3xl pt-2">{transactions.length}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-none bg-white shadow-sm rounded-3xl">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-[10px] md:text-xs font-medium uppercase tracking-wider">Pending</span>
                  <Clock className="w-4 h-4 md:w-5 md:h-5 text-amber-500" />
                </div>
                <CardTitle className="text-2xl md:text-3xl pt-2 text-amber-600">{pendingTransactions}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Tabs Content */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="chart" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <TabsList className="bg-white p-1 rounded-2xl border-none shadow-sm">
                    <TabsTrigger value="chart" className="rounded-xl data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Grafik Poin
                    </TabsTrigger>
                    <TabsTrigger value="history" className="rounded-xl data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                      <History className="w-4 h-4 mr-2" />
                      Terakhir
                    </TabsTrigger>
                  </TabsList>
                  <Button variant="ghost" size="sm" className="text-gray-500 hover:text-green-600" onClick={() => navigate('/history')}>
                    Lihat Semua
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <TabsContent value="chart">
                  <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                    <CardHeader className="px-0 pt-0">
                      <CardTitle className="text-lg">Akumulasi Poin</CardTitle>
                      <CardDescription>Poin yang Anda kumpulkan tiap bulannya.</CardDescription>
                    </CardHeader>
                    <CardContent className="px-0 pb-0">
                      <div className="h-[300px] w-full">
                        <SimpleBarChart data={chartData} />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="history">
                  <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                    <CardContent className="p-0">
                      {loading ? (
                        <div className="py-20 text-center text-gray-400">Memuat transaksi...</div>
                      ) : recentTransactions.length === 0 ? (
                        <div className="py-20 text-center text-gray-400">Belum ada riwayat transaksi.</div>
                      ) : (
                        <div className="divide-y divide-gray-50">
                          {recentTransactions.map((transaction) => (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <div className="w-10 h-10 rounded-2xl bg-green-50 flex items-center justify-center shrink-0">
                                  <Recycle className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 truncate">{transaction.wasteType}</p>
                                  <p className="text-xs text-gray-500">
                                    {transaction.weight} kg • {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-bold text-green-600 text-sm">+{transaction.totalPoints}</p>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  transaction.status === 'verified' ? 'bg-green-100 text-green-700' :
                                  transaction.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                  'bg-red-100 text-red-700'
                                }`}>
                                  {transaction.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Side Info */}
            <div className="space-y-6">
              <Card className="border-none shadow-sm rounded-3xl bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Pickup Aktif</CardTitle>
                </CardHeader>
                <CardContent>
                  {activePickup ? (
                    <div className="bg-green-50/50 border border-green-100 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                          <Calendar className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-gray-900">
                            {new Date(activePickup.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}
                          </p>
                          <p className="text-xs text-green-700 mt-0.5">
                            {activePickup.wasteType} • <span className="capitalize">{activePickup.status}</span>
                          </p>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="w-full mt-4 text-xs h-8 text-green-700 hover:bg-green-100" onClick={() => navigate('/history')}>
                        Cek Detail Pickup
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-2xl">
                      <Package className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Tidak ada pickup terjadwal.</p>
                      <Button variant="link" size="sm" className="text-green-600 text-xs mt-1" onClick={() => navigate('/pickup')}>
                        Ajukan Sekarang
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg shadow-green-100/50 rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 text-white overflow-hidden relative">
                <div className="absolute -right-4 -bottom-4 opacity-10">
                  <Award className="w-32 h-32" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">Tukar Poin</CardTitle>
                  <CardDescription className="text-green-100">Dapatkan hadiah menarik dari tabungan sampah Anda.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full bg-white text-green-700 hover:bg-green-50 rounded-xl font-bold" onClick={() => navigate('/rewards')}>
                    Lihat Katalog Hadiah
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
