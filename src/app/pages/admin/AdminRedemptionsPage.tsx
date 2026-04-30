import { useState, useEffect } from 'react';
import { DashboardNavbar } from '../../components/DashboardNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

interface Redemption {
  id: number;
  userId: number;
  userName: string;
  userKos: string;
  rewardName: string;
  pointsUsed: number;
  quantity: number;
  address: string;
  notes?: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  requestDate: string;
  processedDate?: string;
}

export default function AdminRedemptionsPage() {
  const [redemptions, setRedemptions] = useState<Redemption[]>([]);
  const [selectedRedemption, setSelectedRedemption] = useState<Redemption | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Mock data for redemptions
  useEffect(() => {
    const mockRedemptions: Redemption[] = [
      {
        id: 1,
        userId: 1,
        userName: 'Budi Santoso',
        userKos: 'Melati',
        rewardName: 'Tumbler Stainless',
        pointsUsed: 50000,
        quantity: 1,
        address: 'Kos Melati No. 12, Desa Sukamakmur',
        notes: 'Tolong kirim sore hari',
        status: 'pending',
        requestDate: '2026-04-20 10:30',
      },
      {
        id: 2,
        userId: 2,
        userName: 'Siti Nurhaliza',
        userKos: 'Mawar',
        rewardName: 'Tas Belanja Kanvas',
        pointsUsed: 60000,
        quantity: 2,
        address: 'Kos Mawar No. 5, Desa Sukamakmur',
        status: 'approved',
        requestDate: '2026-04-19 14:15',
        processedDate: '2026-04-19 15:00',
      },
      {
        id: 3,
        userId: 3,
        userName: 'Ahmad Fauzi',
        userKos: 'Anggrek',
        rewardName: 'Voucher Pulsa 50K',
        pointsUsed: 52000,
        quantity: 1,
        address: 'Kos Anggrek No. 8, Desa Sukamakmur',
        status: 'completed',
        requestDate: '2026-04-18 09:00',
        processedDate: '2026-04-18 10:00',
      },
      {
        id: 4,
        userId: 4,
        userName: 'Dewi Lestari',
        userKos: 'Kenanga',
        rewardName: 'Bibit Tanaman Hias',
        pointsUsed: 25000,
        quantity: 1,
        address: 'Kos Kenanga No. 3, Desa Sukamakmur',
        notes: 'Stok habis',
        status: 'rejected',
        requestDate: '2026-04-17 16:20',
        processedDate: '2026-04-17 17:00',
      },
      {
        id: 5,
        userId: 1,
        userName: 'Budi Santoso',
        userKos: 'Melati',
        rewardName: 'Sedotan Stainless (Set)',
        pointsUsed: 30000,
        quantity: 2,
        address: 'Kos Melati No. 12, Desa Sukamakmur',
        status: 'pending',
        requestDate: '2026-04-21 11:45',
      },
    ];
    setRedemptions(mockRedemptions);
  }, []);

  const handleViewDetails = (redemption: Redemption) => {
    setSelectedRedemption(redemption);
    setIsDialogOpen(true);
  };

  const handleApprove = (redemption: Redemption) => {
    setRedemptions(
      redemptions.map((r) =>
        r.id === redemption.id
          ? { ...r, status: 'approved', processedDate: new Date().toISOString() }
          : r
      )
    );
    toast.success(`Permintaan penukaran ${redemption.rewardName} disetujui`);
    setIsDialogOpen(false);
  };

  const handleReject = (redemption: Redemption) => {
    if (confirm('Yakin ingin menolak permintaan penukaran ini?')) {
      setRedemptions(
        redemptions.map((r) =>
          r.id === redemption.id
            ? { ...r, status: 'rejected', processedDate: new Date().toISOString() }
            : r
        )
      );
      toast.success('Permintaan penukaran ditolak');
      setIsDialogOpen(false);
    }
  };

  const handleComplete = (redemption: Redemption) => {
    setRedemptions(
      redemptions.map((r) =>
        r.id === redemption.id
          ? { ...r, status: 'completed', processedDate: new Date().toISOString() }
          : r
      )
    );
    toast.success('Penukaran ditandai sebagai selesai');
    setIsDialogOpen(false);
  };

  const filteredRedemptions =
    filterStatus === 'all'
      ? redemptions
      : redemptions.filter((r) => r.status === filterStatus);

  const pendingCount = redemptions.filter((r) => r.status === 'pending').length;
  const approvedCount = redemptions.filter((r) => r.status === 'approved').length;
  const completedCount = redemptions.filter((r) => r.status === 'completed').length;
  const rejectedCount = redemptions.filter((r) => r.status === 'rejected').length;

  const getStatusBadge = (status: string) => {
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

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Permintaan Penukaran</h1>
                <p className="text-gray-600">Kelola permintaan penukaran poin dengan barang</p>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Menunggu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-yellow-600" />
                    <p className="text-3xl font-bold text-gray-900">{pendingCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Disetujui</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <p className="text-3xl font-bold text-gray-900">{approvedCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Selesai</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <p className="text-3xl font-bold text-gray-900">{completedCount}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Ditolak</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <p className="text-3xl font-bold text-gray-900">{rejectedCount}</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="all" className="mb-6">
            <TabsList>
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

          {/* Redemptions Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tanggal</TableHead>
                    <TableHead>Nasabah</TableHead>
                    <TableHead>Kos</TableHead>
                    <TableHead>Barang</TableHead>
                    <TableHead>Jumlah</TableHead>
                    <TableHead>Poin</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRedemptions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
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
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </TableCell>
                        <TableCell className="font-medium">{redemption.userName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{redemption.userKos}</Badge>
                        </TableCell>
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detail Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detail Permintaan Penukaran</DialogTitle>
            <DialogDescription>
              ID: #{selectedRedemption?.id} - {selectedRedemption?.userName}
            </DialogDescription>
          </DialogHeader>

          {selectedRedemption && (
            <div className="space-y-4 py-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 w-32">Status:</span>
                {getStatusBadge(selectedRedemption.status)}
              </div>

              {/* User Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Nama Nasabah</p>
                  <p className="font-medium">{selectedRedemption.userName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Kos</p>
                  <Badge variant="outline">{selectedRedemption.userKos}</Badge>
                </div>
              </div>

              {/* Reward Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Barang</p>
                  <p className="font-medium">{selectedRedemption.rewardName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Jumlah</p>
                  <p className="font-medium">{selectedRedemption.quantity} unit</p>
                </div>
              </div>

              {/* Points */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Poin</p>
                <p className="text-2xl font-bold text-green-700">
                  {selectedRedemption.pointsUsed.toLocaleString('id-ID')} poin
                </p>
              </div>

              {/* Address */}
              <div>
                <p className="text-sm text-gray-600 mb-1">Alamat Pengiriman</p>
                <p className="font-medium bg-gray-50 p-3 rounded-lg">
                  {selectedRedemption.address}
                </p>
              </div>

              {/* Notes */}
              {selectedRedemption.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">Catatan</p>
                  <p className="bg-yellow-50 p-3 rounded-lg text-sm">
                    {selectedRedemption.notes}
                  </p>
                </div>
              )}

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4 text-sm">
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

          <DialogFooter>
            {selectedRedemption?.status === 'pending' && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleReject(selectedRedemption)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Tolak
                </Button>
                <Button onClick={() => handleApprove(selectedRedemption)}>
                  <Check className="w-4 h-4 mr-2" />
                  Setujui
                </Button>
              </>
            )}
            {selectedRedemption?.status === 'approved' && (
              <Button onClick={() => handleComplete(selectedRedemption)}>
                <CheckCircle className="w-4 h-4 mr-2" />
                Tandai Selesai
              </Button>
            )}
            {(selectedRedemption?.status === 'completed' ||
              selectedRedemption?.status === 'rejected') && (
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Tutup
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
