import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useRealtimeRefresh } from '../../hooks/useRealtimeRefresh';

const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });

const pickupStatusLabels: Record<string, string> = {
  pending: 'Menunggu Tinjauan',
  scheduled: 'Dijadwalkan',
  approved: 'Disetujui',
  done: 'Selesai',
  rejected: 'Ditolak',
};

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

  const loadData = useCallback(async () => {
    if (!token) return;
    try {
      const [summaryData, userData, transactionData, pickupData] = await Promise.all([
        fetchAdminSummary(token),
        fetchUsers(token),
        fetchTransactions(),
        fetchPickups(token),
      ]);

      setSummary(summaryData);
      setUsers(userData);
      setTransactions(transactionData);
      setPickups(pickupData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat dashboard admin.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useRealtimeRefresh(Boolean(token), loadData, ['pickup', 'transaction', 'redemption']);

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

    const result = Array.from(grouped.entries()).map(([month, value], index) => ({
      id: `stat-${index + 1}`,
      month,
      transactions: value.transactions,
      weight: Number(value.weight.toFixed(1)),
    }));

    // Fallback data if empty
    if (result.length === 0) {
      return [{
        id: 'stat-fallback',
        month: monthFormatter.format(new Date()),
        transactions: 0,
        weight: 0,
      }];
    }

    return result;
  }, [transactions]);

  const recentTransactions = transactions.slice(0, 5);
  const pendingPickups = pickups.filter((pickup) => pickup.status === 'pending');

  const handleAcceptPickup = async (pickup: PickupItem) => {
    if (!token) return;
    try {
      await updatePickupStatus(token, pickup.rawId, 'scheduled');
      setPickups((prev) =>
        prev.map((item) =>
          item.rawId === pickup.rawId ? { ...item, status: 'scheduled' } : item
        )
      );
      setSelectedPickup((current) =>
        current?.rawId === pickup.rawId ? { ...current, status: 'scheduled' } : current
      );
      toast.success('Permintaan pickup berhasil dijadwalkan.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui pickup.');
    }
  };

  const handleRejectPickup = async (pickup: PickupItem) => {
    if (!token) return;
    try {
      await updatePickupStatus(token, pickup.rawId, 'rejected');
      setPickups((prev) =>
        prev.map((item) =>
          item.rawId === pickup.rawId ? { ...item, status: 'rejected' } : item
        )
      );
      setSelectedPickup((current) =>
        current?.rawId === pickup.rawId ? { ...current, status: 'rejected' } : current
      );
      toast.success('Permintaan pickup berhasil ditolak.');
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

      <div className="pt-24 pb-12 container mx-auto px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Dashboard Admin</h1>
            <p className="text-gray-600 mt-2">Ringkasan dan statistik Bank Sampah MILOS.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription>Total Nasabah</CardDescription>
                    <CardTitle className="mt-2 text-2xl sm:text-3xl">
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
                    <CardTitle className="mt-2 text-2xl sm:text-3xl">{summary?.total_transaksi ?? 0}</CardTitle>
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
                    <CardTitle className="mt-2 text-2xl sm:text-3xl">
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
                    <CardTitle className="mt-2 text-2xl text-orange-600 sm:text-3xl">{pendingPickups.length}</CardTitle>
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
                <div className="h-[300px] w-full">
                  <DualBarChart data={chartData} />
                </div>
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
                        <div key={pickup.id} className="rounded-lg bg-gray-50 p-4 transition hover:bg-gray-100">
                          <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900">{pickup.id}</div>
                              <div className="text-sm text-gray-600">{pickup.customer}</div>
                            </div>
                            <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                              {pickupStatusLabels[pickup.status] ?? pickup.status}
                            </Badge>
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
                        <div className="mt-3 flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleShowDetail(pickup)}>
                            Tinjau & Proses
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
                    <div key={transaction.id} className="flex flex-col gap-4 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                          <Recycle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="min-w-0">
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
          <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl">
            <DialogHeader>
            <DialogTitle>Tinjau Permintaan Pickup</DialogTitle>
              <DialogDescription>Periksa detail nasabah lalu setujui atau tolak pickup sesuai kondisi operasional.</DialogDescription>
            </DialogHeader>
          {selectedPickup && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="text-sm">{selectedPickup.address || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600 flex items-center gap-1">
                  <Phone className="w-4 h-4" />
                  Telepon
                </div>
                <div className="text-sm">{selectedPickup.phone || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Tanggal</div>
                <div className="text-sm">
                  {new Date(selectedPickup.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Waktu</div>
                <div className="text-sm">{selectedPickup.time || '-'}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Jenis Sampah</div>
                <div className="font-semibold">{selectedPickup.wasteType}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Estimasi Berat</div>
                <div className="font-semibold">~{selectedPickup.estimatedWeight} kg</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-sm text-gray-600 mb-1">Catatan</div>
                <div className="text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                  "{selectedPickup.notes || 'Tidak ada catatan'}"
                </div>
              </div>
              <div className="sm:col-span-2 rounded-lg border border-orange-200 bg-orange-50 p-3 text-xs text-orange-800">
                Gunakan <span className="font-semibold">Setujui Pickup</span> jika permintaan sesuai jadwal dan area layanan. Gunakan
                <span className="font-semibold"> Tolak Pickup</span> jika tanggal, area, atau kapasitas tidak memungkinkan.
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 flex-col sm:flex-row mt-6">
            <Button className="w-full sm:w-auto" variant="ghost" onClick={() => setShowDetailDialog(false)}>
              Tutup
            </Button>
            <div className="flex flex-1 gap-2">
              {selectedPickup && selectedPickup.status === 'pending' && (
                <Button
                  className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  variant="outline"
                  onClick={async () => {
                    await handleRejectPickup(selectedPickup);
                    setShowDetailDialog(false);
                  }}
                >
                  Tolak Pickup
                </Button>
              )}
              {selectedPickup && (
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-100"
                  disabled={selectedPickup.status !== 'pending'}
                  onClick={async () => {
                    await handleAcceptPickup(selectedPickup);
                    setShowDetailDialog(false);
                  }}
                >
                  {selectedPickup.status === 'pending' ? 'Setujui Pickup' : 'Sudah Diproses'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
Sudah Diproses'}
                </Button>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
