import { useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Calendar,
  Package,
  User,
  Award,
  Eye,
} from 'lucide-react';
import { Input } from '../../components/ui/input';
import { toast } from 'sonner';
import { fetchTransactions, verifyTransaction, type TransactionItem } from '../../lib/milosApi';
import { useAuth } from '../../context/AuthContext';

export default function TransactionsPage() {
  const { token } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionItem | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      try {
        const data = await fetchTransactions();
        if (isMounted) {
          setTransactions(data);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat transaksi admin.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTransactions();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleStatusUpdate = async (transaction: TransactionItem, status: 'verified' | 'rejected') => {
    if (!token) return;
    try {
      await verifyTransaction(token, transaction.rawId, status);
      setTransactions((prev) =>
        prev.map((item) =>
          item.rawId === transaction.rawId
            ? { ...item, status }
            : item
        )
      );
      toast.success(status === 'verified' ? 'Transaksi berhasil diverifikasi.' : 'Transaksi ditolak.');
      setDialogOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui transaksi.');
    }
  };

  const filteredTransactions = useMemo(() => {
    return (status?: string) =>
      transactions.filter((transaction) => {
        const matchesSearch =
          transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          transaction.wasteType.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = !status || transaction.status === status;
        return matchesSearch && matchesStatus;
      });
  }, [searchQuery, transactions]);

  const stats = useMemo(
    () => ({
      pending: transactions.filter((item) => item.status === 'pending').length,
      verified: transactions.filter((item) => item.status === 'verified').length,
      rejected: transactions.filter((item) => item.status === 'rejected').length,
      total: transactions.length,
    }),
    [transactions]
  );

  const getStatusBadge = (status: TransactionItem['status']) => {
    if (status === 'pending') {
      return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">Pending</Badge>;
    }
    if (status === 'verified') {
      return <Badge className="bg-green-100 text-green-700 border-green-200">Terverifikasi</Badge>;
    }
    return <Badge className="bg-red-100 text-red-700 border-red-200">Ditolak</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Kelola Transaksi</h1>
            <p className="text-gray-600 mt-2">Verifikasi dan kelola semua transaksi nasabah.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Transaksi</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-yellow-200 bg-yellow-50">
              <CardHeader className="pb-3">
                <CardDescription className="text-yellow-700">Pending</CardDescription>
                <CardTitle className="text-2xl text-yellow-600 sm:text-3xl">{stats.pending}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <CardDescription className="text-green-700">Terverifikasi</CardDescription>
                <CardTitle className="text-2xl text-green-600 sm:text-3xl">{stats.verified}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <CardDescription className="text-red-700">Ditolak</CardDescription>
                <CardTitle className="text-2xl text-red-600 sm:text-3xl">{stats.rejected}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Semua Transaksi</CardTitle>
                  <CardDescription>Data nyata transaksi nasabah.</CardDescription>
                </div>
                <div className="relative w-full md:w-96">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari berdasarkan ID, nasabah, atau jenis sampah..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList className="h-auto w-full flex-wrap justify-start">
                  <TabsTrigger value="all">Semua ({stats.total})</TabsTrigger>
                  <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                  <TabsTrigger value="verified">Terverifikasi ({stats.verified})</TabsTrigger>
                  <TabsTrigger value="rejected">Ditolak ({stats.rejected})</TabsTrigger>
                </TabsList>

                {['all', 'pending', 'verified', 'rejected'].map((tab) => (
                  <TabsContent key={tab} value={tab} className="mt-6">
                    <TransactionTable
                      loading={loading}
                      transactions={tab === 'all' ? filteredTransactions() : filteredTransactions(tab)}
                      onOpenDetail={(transaction) => {
                        setSelectedTransaction(transaction);
                        setDialogOpen(true);
                      }}
                      getStatusBadge={getStatusBadge}
                    />
                  </TabsContent>
                ))}
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Detail Transaksi</DialogTitle>
            <DialogDescription>Tinjau transaksi sebelum memverifikasi.</DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-3 text-sm">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-600">ID</span>
                <span className="font-semibold">{selectedTransaction.id}</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-600">Nasabah</span>
                <span className="font-semibold">{selectedTransaction.customerName}</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-600">Jenis Sampah</span>
                <span>{selectedTransaction.wasteType}</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-600">Berat</span>
                <span>{selectedTransaction.weight.toFixed(1)} kg</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-600">Poin/kg</span>
                <span>{selectedTransaction.pointsPerKg.toLocaleString()}</span>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-gray-600">Total Poin</span>
                <span className="font-semibold text-green-600">
                  {selectedTransaction.totalPoints.toLocaleString()}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setDialogOpen(false)}>
              Tutup
            </Button>
            {selectedTransaction?.status === 'pending' && (
              <>
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => selectedTransaction && handleStatusUpdate(selectedTransaction, 'rejected')}>
                  Tolak
                </Button>
                <Button className="w-full bg-green-600 hover:bg-green-700 sm:w-auto" onClick={() => selectedTransaction && handleStatusUpdate(selectedTransaction, 'verified')}>
                  Verifikasi
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function TransactionTable({
  loading,
  transactions,
  onOpenDetail,
  getStatusBadge,
}: {
  loading: boolean;
  transactions: TransactionItem[];
  onOpenDetail: (transaction: TransactionItem) => void;
  getStatusBadge: (status: TransactionItem['status']) => JSX.Element;
}) {
  return (
    <>
      <div className="hidden md:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Nasabah</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead>Jenis Sampah</TableHead>
            <TableHead>Berat</TableHead>
            <TableHead>Poin</TableHead>
            <TableHead>Metode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                Memuat transaksi...
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                Tidak ada transaksi yang ditemukan.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.id}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">{transaction.customerName}</div>
                      <div className="text-xs text-gray-500">{transaction.customerId}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {new Date(transaction.date).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-gray-400" />
                    {transaction.wasteType}
                  </div>
                </TableCell>
                <TableCell>{transaction.weight.toFixed(1)} kg</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 text-green-600 font-semibold">
                    <Award className="w-4 h-4" />
                    {transaction.totalPoints.toLocaleString()}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      transaction.method === 'Pickup'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-purple-50 text-purple-700 border-purple-200'
                    }
                  >
                    {transaction.method}
                  </Badge>
                </TableCell>
                <TableCell>{getStatusBadge(transaction.status)}</TableCell>
                <TableCell className="text-right">
                  <Button size="sm" variant="ghost" onClick={() => onOpenDetail(transaction)}>
                    {transaction.status === 'pending' ? <CheckCircle2 className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
    <div className="space-y-4 md:hidden">
      {loading ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
          Memuat transaksi...
        </div>
      ) : transactions.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
          Tidak ada transaksi yang ditemukan.
        </div>
      ) : (
        transactions.map((transaction) => (
          <div key={transaction.id} className="rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-semibold text-gray-900">{transaction.id}</div>
                <div className="mt-1 flex items-center gap-2 text-sm text-gray-600">
                  <User className="h-4 w-4 shrink-0 text-gray-400" />
                  <span className="truncate">{transaction.customerName}</span>
                </div>
              </div>
              {getStatusBadge(transaction.status)}
            </div>
            <div className="grid gap-3 text-sm text-gray-600">
              <div className="flex items-start justify-between gap-3">
                <span>Tanggal</span>
                <span className="text-right">
                  {new Date(transaction.date).toLocaleDateString('id-ID', {
                    day: 'numeric',
                    month: 'short',
                  })}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span>Jenis Sampah</span>
                <span className="text-right">{transaction.wasteType}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span>Berat</span>
                <span>{transaction.weight.toFixed(1)} kg</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span>Poin</span>
                <span className="font-semibold text-green-600">{transaction.totalPoints.toLocaleString()}</span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <span>Metode</span>
                <Badge
                  variant="outline"
                  className={
                    transaction.method === 'Pickup'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-purple-50 text-purple-700 border-purple-200'
                  }
                >
                  {transaction.method}
                </Badge>
              </div>
            </div>
            <Button size="sm" variant="outline" className="mt-4 w-full" onClick={() => onOpenDetail(transaction)}>
              {transaction.status === 'pending' ? <CheckCircle2 className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
              {transaction.status === 'pending' ? 'Tinjau Transaksi' : 'Lihat Detail'}
            </Button>
          </div>
        ))
      )}
    </div>
    </>
  );
}
