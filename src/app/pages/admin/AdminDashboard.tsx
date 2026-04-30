import { useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Users,
  Package,
  TrendingUp,
  Clock,
  Calendar,
  Recycle,
  ArrowRight,
  MapPin,
  Phone,
} from 'lucide-react';
import { DualBarChart } from '../../components/DualBarChart';
import { useNavigate } from 'react-router';
import { useState as useReactState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import { toast } from 'sonner';
import {
  fetchAdminSummary,
  fetchPickups,
  fetchTransactions,
  fetchUsers,
  updatePickupStatus,
  type PickupItem,
  type SummaryResponse,
  type TransactionItem,
  type UserListItem,
} from '../../lib/milosApi';
import { useAuth } from '../../context/AuthContext';

const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });

export default function AdminDashboard() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [summary, setSummary] = useState<SummaryResponse | null>(null);
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [pickups, setPickups] = useState<PickupItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPickup, setSelectedPickup] = useReactState<PickupItem | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useReactState(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!token) return;
      try {
        const [summaryData, userData, transactionData, pickupData] = await Promise.all([
          fetchAdminSummary(token),
          fetchUsers(token),
          fetchTransactions(),
          fetchPickups(token),
        ]);

        if (isMounted) {
          setSummary(summaryData);
          setUsers(userData);
          setTransactions(transactionData);
          setPickups(pickupData);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat dashboard admin.');
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
  }, [token]);

  const chartData = useMemo(() => {
    const grouped = new Map<string, { transactions: number; weight: number }>();
    transactions.forEach((transaction) => {
      const month = monthFormatter.format(new Date(transaction.date));
      const current = grouped.get(month) || { transactions: 0, weight: 0 };
      grouped.set(month, {
        transactions: current.transactions + 1,
        weight: current.weight + transaction.weight,
      });
    });

    return Array.from(grouped.entries()).map(([month, value], index) => ({
      id: `stat-${index + 1}`,
      month,
      transactions: value.transactions,
      weight: Number(value.weight.toFixed(1)),
    }));
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 5);
  const pendingPickups = pickups.filter((pickup) => pickup.status === 'pending');

  const handleAcceptPickup = async (pickup: PickupItem) => {
    if (!token) return;
    try {
      await updatePickupStatus(token, pickup.rawId, 'scheduled');
      setPickups((prev) => prev.filter((item) => item.rawId !== pickup.rawId));
      toast.success('Permintaan pickup berhasil diterima.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui pickup.');
    }
  };

  const handleShowDetail = (pickup: PickupItem) => {
    setSelectedPickup(pickup);
    setShowDetailDialog(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-gray-600 mt-2">Ringkasan dan statistik Bank Sampah MILOS.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription>Total Nasabah</CardDescription>
                    <CardTitle className="text-3xl mt-2">
                      {users.filter((item) => item.role === 'nasabah').length}
                    </CardTitle>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription>Total Transaksi</CardDescription>
                    <CardTitle className="text-3xl mt-2">{summary?.total_transaksi ?? 0}</CardTitle>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription>Sampah Terkumpul</CardDescription>
                    <CardTitle className="text-3xl mt-2">
                      {(summary?.total_berat ?? 0).toLocaleString()} kg
                    </CardTitle>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Recycle className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription className="text-orange-700">Pickup Pending</CardDescription>
                    <CardTitle className="text-3xl mt-2 text-orange-600">{pendingPickups.length}</CardTitle>
                  </div>
                  <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center">
                    <Clock className="w-6 h-6 text-orange-700" />
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Statistik Bulanan</CardTitle>
                <CardDescription>Transaksi dan berat sampah berdasarkan data backend.</CardDescription>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <DualBarChart data={chartData} />
                ) : (
                  <div className="text-sm text-gray-500 py-8 text-center">Belum ada data transaksi.</div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Aksi Cepat</CardTitle>
                <CardDescription>Shortcut fitur admin</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full bg-green-600 hover:bg-green-700 justify-start" onClick={() => navigate('/admin/transactions')}>
                  <Package className="w-4 h-4 mr-2" />
                  Verifikasi Transaksi
                </Button>
                <Button className="w-full bg-blue-600 hover:bg-blue-700 justify-start" onClick={() => navigate('/admin/schedules')}>
                  <Calendar className="w-4 h-4 mr-2" />
                  Kelola Jadwal
                </Button>
                <Button className="w-full bg-purple-600 hover:bg-purple-700 justify-start" onClick={() => navigate('/admin/waste-types')}>
                  <Recycle className="w-4 h-4 mr-2" />
                  Kelola Jenis Sampah
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Permintaan Pickup Terbaru</CardTitle>
                    <CardDescription>Data nyata dari backend.</CardDescription>
                  </div>
                  <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                    {pendingPickups.length} Pending
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-center py-8 text-gray-500">Memuat pickup...</div>
                  ) : pendingPickups.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">Tidak ada permintaan pickup pending.</div>
                  ) : (
                    pendingPickups.map((pickup) => (
                      <div key={pickup.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <div className="font-semibold text-gray-900">{pickup.id}</div>
                            <div className="text-sm text-gray-600">{pickup.customer}</div>
                          </div>
                          <Badge className="bg-orange-100 text-orange-700 border-orange-200">Pending</Badge>
                        </div>
                        <div className="space-y-1 text-sm text-gray-600">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {new Date(pickup.date).toLocaleDateString('id-ID', {
                              day: 'numeric',
                              month: 'long',
                              year: 'numeric',
                            })}{' '}
                            - {pickup.time || '-'}
                          </div>
                          <div className="flex items-center gap-2">
                            <Package className="w-4 h-4" />
                            {pickup.wasteType} - ~{pickup.estimatedWeight} kg
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700" onClick={() => handleAcceptPickup(pickup)}>
                            Terima
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleShowDetail(pickup)}>
                            Detail
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Transaksi Terbaru</CardTitle>
                    <CardDescription>Aktivitas terakhir dari backend.</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate('/admin/transactions')}>
                    Lihat Semua
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentTransactions.slice(0, 5).map((transaction) => (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Recycle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{transaction.id}</div>
                          <div className="text-sm text-gray-600">
                            {transaction.customerName} - {transaction.wasteType}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.weight} kg - {transaction.totalPoints.toLocaleString()} poin
                          </div>
                        </div>
                      </div>
                      <Badge
                        className={
                          transaction.status === 'verified'
                            ? 'bg-green-100 text-green-700 border-green-200'
                            : transaction.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                            : 'bg-red-100 text-red-700 border-red-200'
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Permintaan Pickup</DialogTitle>
            <DialogDescription>Informasi lengkap pickup dari data backend.</DialogDescription>
          </DialogHeader>
          {selectedPickup && (
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-600">ID Pickup</div>
                <div className="font-semibold">{selectedPickup.id}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Nasabah</div>
                <div className="font-semibold">{selectedPickup.customer}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  Alamat
                </div>
                <div>{selectedPickup.address || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Telepon
                </div>
                <div>{selectedPickup.phone || '-'}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Tanggal</div>
                  <div>
                    {new Date(selectedPickup.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Waktu</div>
                  <div>{selectedPickup.time || '-'}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Jenis Sampah</div>
                <div className="font-semibold">{selectedPickup.wasteType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Estimasi Berat</div>
                <div className="font-semibold">~{selectedPickup.estimatedWeight} kg</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Catatan</div>
                <div className="text-sm bg-gray-50 p-3 rounded-lg">{selectedPickup.notes || '-'}</div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
              Tutup
            </Button>
            {selectedPickup && (
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={async () => {
                  await handleAcceptPickup(selectedPickup);
                  setShowDetailDialog(false);
                }}
              >
                Terima Pickup
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
