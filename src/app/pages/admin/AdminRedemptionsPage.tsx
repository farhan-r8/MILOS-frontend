import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../../components/DashboardNavbar';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ShoppingCart, Check, X, Eye, Clock, CheckCircle, XCircle, Package } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../../components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '../../components/ui/tabs';
import { useAuth } from '../../context/AuthContext';
import {
  fetchAdminRedemptions,
  updateRedemptionStatus,
  type RedemptionItem,
} from '../../lib/milosApi';
import { useRealtimeRefresh } from '../../hooks/useRealtimeRefresh';

export default function AdminRedemptionsPage() {
  const { token } = useAuth();
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);
  const [selectedRedemption, setSelectedRedemption] = useState<RedemptionItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const loadRedemptions = useCallback(async () => {
    if (!token) return;
    try {
      const data = await fetchAdminRedemptions(token);
      setRedemptions(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat penukaran hadiah.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadRedemptions();
  }, [loadRedemptions]);

  useRealtimeRefresh(Boolean(token), loadRedemptions, ['redemption']);

  const handleViewDetails = (redemption: RedemptionItem) => {
    setSelectedRedemption(redemption);
    setIsDialogOpen(true);
  };

  const handleStatusUpdate = async (status: 'approved' | 'rejected' | 'completed') => {
    if (!token || !selectedRedemption) return;

    setSubmitting(true);
    try {
      await updateRedemptionStatus(token, selectedRedemption.id, status);
      toast.success('Status penukaran berhasil diperbarui');
      setIsDialogOpen(false);
      setSelectedRedemption(null);
      await loadRedemptions();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui status penukaran.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRedemptions = useMemo(
    () =>
      filterStatus === 'all'
        ? redemptions
        : redemptions.filter((item) => item.status === filterStatus),
    [filterStatus, redemptions]
  );

  const pendingCount = redemptions.filter((item) => item.status === 'pending').length;
  const approvedCount = redemptions.filter((item) => item.status === 'approved').length;
  const completedCount = redemptions.filter((item) => item.status === 'completed').length;
  const rejectedCount = redemptions.filter((item) => item.status === 'rejected').length;

  const getStatusBadge = (status: RedemptionItem['status']) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
            <Clock className="w-3 h-3 mr-1" />
            Menunggu
          </Badge>
        );
      case 'approved':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-300">
            <Package className="w-3 h-3 mr-1" />
            Disetujui
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
            <CheckCircle className="w-3 h-3 mr-1" />
            Selesai
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
            <XCircle className="w-3 h-3 mr-1" />
            Ditolak
          </Badge>
        );
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-24 pb-12 container mx-auto px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center md:text-left">
            <div className="mb-4 flex flex-col items-center md:items-start md:flex-row gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Permintaan Penukaran</h1>
                <p className="text-gray-600">Kelola permintaan penukaran poin dengan barang</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <div>
                      <p className="text-sm text-gray-600">Menunggu</p>
                      <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{pendingCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="text-sm text-gray-600">Disetujui</p>
                      <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{approvedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="text-sm text-gray-600">Selesai</p>
                      <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{completedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <div>
                      <p className="text-sm text-gray-600">Ditolak</p>
                      <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{rejectedCount}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Tabs defaultValue="all" className="mb-6">
            <TabsList className="h-auto w-full flex-wrap justify-start">
              <TabsTrigger value="all" onClick={() => setFilterStatus('all')}>
                Semua ({redemptions.length})
              </TabsTrigger>
              <TabsTrigger value="pending" onClick={() => setFilterStatus('pending')}>
                Menunggu ({pendingCount})
              </TabsTrigger>
              <TabsTrigger value="approved" onClick={() => setFilterStatus('approved')}>
                Disetujui ({approvedCount})
              </TabsTrigger>
              <TabsTrigger value="completed" onClick={() => setFilterStatus('completed')}>
                Selesai ({completedCount})
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Card>
            <CardContent className="p-0">
              <div className="hidden md:block overflow-x-auto">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nasabah</TableHead>
                    <TableHead>Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Poin</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Memuat penukaran hadiah...
                      </TableCell>
                    </TableRow>
                  ) : filteredRedemptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                        Tidak ada permintaan penukaran
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRedemptions.map((redemption) => (
                      <TableRow key={redemption.id}>
                        <TableCell className="text-sm">
                          {new Date(redemption.requestDate).toLocaleDateString('id-ID', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell className="font-medium">{redemption.userName}</TableCell>
                        <TableCell>{redemption.rewardName}</TableCell>
                        <TableCell className="text-center">{redemption.quantity}x</TableCell>
                        <TableCell className="font-semibold text-green-700">
                          {redemption.pointsUsed.toLocaleString('id-ID')}
                        </TableCell>
                        <TableCell>{getStatusBadge(redemption.status)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(redemption)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                </Table>
                </div>
                </div>              <div className="space-y-4 p-4 md:hidden">
                {loading ? (
                  <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                    Memuat penukaran hadiah...
                  </div>
                ) : filteredRedemptions.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                    Tidak ada permintaan penukaran.
                  </div>
                ) : (
                  filteredRedemptions.map((redemption) => (
                    <div key={redemption.id} className="rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900">{redemption.rewardName}</div>
                          <div className="mt-1 text-sm text-gray-600">{redemption.userName}</div>
                        </div>
                        {getStatusBadge(redemption.status)}
                      </div>
                      <div className="grid gap-2 text-sm text-gray-600">
                        <div className="flex items-start justify-between gap-3">
                          <span>Tanggal</span>
                          <span className="text-right">
                            {new Date(redemption.requestDate).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <span>Jumlah</span>
                          <span>{redemption.quantity}x</span>
                        </div>
                        <div className="flex items-start justify-between gap-3">
                          <span>Poin</span>
                          <span className="font-semibold text-green-700">
                            {redemption.pointsUsed.toLocaleString('id-ID')}
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="mt-4 w-full" onClick={() => handleViewDetails(redemption)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Permintaan Penukaran</DialogTitle>
            <DialogDescription>
              ID: #{selectedRedemption?.id} - {selectedRedemption?.userName}
            </DialogDescription>
          </DialogHeader>

          {selectedRedemption && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 w-32">Status:</span>
                {getStatusBadge(selectedRedemption.status)}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nama Nasabah</p>
                  <p className="font-medium">{selectedRedemption.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Email</p>
                  <p className="font-medium">{selectedRedemption.userEmail || '-'}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Barang</p>
                  <p className="font-medium">{selectedRedemption.rewardName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Jumlah</p>
                  <p className="font-medium">{selectedRedemption.quantity} unit</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Total Poin</p>
                <p className="text-2xl font-bold text-green-700">
                  {selectedRedemption.pointsUsed.toLocaleString('id-ID')} poin
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Alamat Pengiriman</p>
                <p className="font-medium bg-gray-50 p-3 rounded-lg">
                  {selectedRedemption.address}
                </p>
              </div>

              {selectedRedemption.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Catatan</p>
                  <p className="bg-yellow-50 p-3 rounded-lg text-sm">
                    {selectedRedemption.notes}
                  </p>
                </div>
              )}

              <div className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-gray-600 mb-1">Tanggal Permintaan</p>
                  <p className="font-medium">
                    {new Date(selectedRedemption.requestDate).toLocaleString('id-ID')}
                  </p>
                </div>
                {selectedRedemption.processedDate && (
                  <div>
                    <p className="text-gray-600 mb-1">Tanggal Diproses</p>
                    <p className="font-medium">
                      {new Date(selectedRedemption.processedDate).toLocaleString('id-ID')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex-col gap-3 sm:flex-row">
            {selectedRedemption?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => handleStatusUpdate('rejected')}
                  disabled={submitting}
                >
                  <X className="w-4 h-4 mr-2" />
                  Tolak
                </Button>
                <Button className="w-full sm:w-auto" onClick={() => handleStatusUpdate('approved')} disabled={submitting}>
                  <Check className="w-4 h-4 mr-2" />
                  Setujui
                </Button>
              </>
            )}
            {selectedRedemption?.status === 'approved' && (
              <Button className="w-full sm:w-auto" onClick={() => handleStatusUpdate('completed')} disabled={submitting}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Tandai Selesai
              </Button>
            )}
            {(selectedRedemption?.status === 'completed' ||
              selectedRedemption?.status === 'rejected') && (
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsDialogOpen(false)}>
                Tutup
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
