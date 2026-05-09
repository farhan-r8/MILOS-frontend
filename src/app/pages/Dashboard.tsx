import { useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { SimpleBarChart } from '../components/SimpleBarChart';
import {
  TrendingUp,
  Package,
  Clock,
  Award,
  ArrowRight,
  Recycle,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { fetchPickups, fetchTransactions, fetchUserPoints, type PickupItem, type TransactionItem } from '../lib/milosApi';
import { toast } from 'sonner';

const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });

export default function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [pickups, setPickups] = useState<PickupItem[]>([]);
  const [totalPoints, setTotalPoints] = useState<number>(user?.points || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!user?.id || !token) return;

      try {
        const [transactionResult, pickupResult, pointsResult] = await Promise.allSettled([
          fetchTransactions(user.id),
          fetchPickups(token),
          fetchUserPoints(user.id, token),
        ]);

        if (isMounted) {
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
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [token, user?.id]);

  const chartData = useMemo(() => {
    const grouped = new Map<string, number>();
    transactions
      .filter((transaction) => transaction.status === 'verified')
      .forEach((transaction) => {
      const key = monthFormatter.format(new Date(transaction.date));
      grouped.set(key, (grouped.get(key) || 0) + transaction.totalPoints);
      });

    return Array.from(grouped.entries()).map(([month, points]) => ({ month, points }));
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 5);
  const totalWeight = transactions.reduce((sum, transaction) => sum + transaction.weight, 0);
  const pendingTransactions = transactions.filter((transaction) => transaction.status === 'pending').length;
  const verifiedTransactions = transactions.filter((transaction) => transaction.status === 'verified');
  const activePickup = pickups.find((pickup) => ['pending', 'approved', 'scheduled'].includes(pickup.status));

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Selamat Datang, {user?.name}</h1>
            <p className="text-gray-600 mt-2">
              Lihat ringkasan aktivitas dan poin Anda di Bank Sampah MILOS.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="text-green-50">Total Poin</CardDescription>
                    <CardTitle className="mt-2 text-2xl sm:text-3xl">{totalPoints.toLocaleString()}</CardTitle>
                  </div>
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-green-50">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm">{verifiedTransactions.length} transaksi terverifikasi</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Transaksi</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl">{transactions.length}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Sampah</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl">{totalWeight.toFixed(1)} kg</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Transaksi Pending</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl">{pendingTransactions}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>Perkembangan Poin</CardTitle>
                    <CardDescription>Ringkasan poin berdasarkan transaksi nyata.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate('/history')}>
                    Detail
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <SimpleBarChart data={chartData} />
                ) : (
                  <div className="text-sm text-gray-500 py-8 text-center">
                    Belum ada data transaksi untuk ditampilkan.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>Transaksi dan pickup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Pickup Aktif</h3>
                  {activePickup ? (
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-600" />
                        <span className="text-gray-600">
                          {new Date(activePickup.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="text-green-700 font-medium">
                        {activePickup.wasteType} - {activePickup.status}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-600">Belum ada pickup aktif.</p>
                  )}
                </div>

                <Button className="w-full bg-green-600 hover:bg-green-700" onClick={() => navigate('/sell')}>
                  <Package className="w-4 h-4 mr-2" />
                  Jual Sampah
                </Button>
                <Button variant="outline" className="w-full" onClick={() => navigate('/pickup')}>
                  Ajukan Pickup
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <CardTitle>Transaksi Terakhir</CardTitle>
                    <CardDescription>Riwayat penyerahan sampah terbaru Anda.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => navigate('/history')}>
                    Lihat Semua
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-sm text-gray-500 py-8 text-center">Memuat transaksi...</div>
                ) : recentTransactions.length === 0 ? (
                  <div className="text-sm text-gray-500 py-8 text-center">Belum ada transaksi.</div>
                ) : (
                  <div className="space-y-4">
                    {recentTransactions.map((transaction) => (
                      <div
                        key={transaction.id}
                        className="flex flex-col gap-4 rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <Recycle className="w-6 h-6 text-green-600" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900">{transaction.wasteType}</div>
                            <div className="text-sm text-gray-600">
                              {transaction.weight} kg - {new Date(transaction.date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <div className="font-bold text-green-600">
                            +{transaction.totalPoints.toLocaleString()} poin
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              transaction.status === 'verified'
                                ? 'bg-green-50 text-green-700 border-green-200'
                                : transaction.status === 'pending'
                                ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                : 'bg-red-50 text-red-700 border-red-200'
                            }
                          >
                            {transaction.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
