import { useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Search, Filter, Download, Calendar, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchTransactions, type TransactionItem } from '../lib/milosApi';
import { toast } from 'sonner';

export default function HistoryPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');

  useEffect(() => {
    let isMounted = true;

    const loadTransactions = async () => {
      if (!user?.id) return;
      try {
        const data = await fetchTransactions(user.id);
        if (isMounted) {
          setTransactions(data);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat riwayat transaksi.');
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
  }, [user?.id]);

  const wasteTypeOptions = useMemo(
    () => Array.from(new Set(transactions.map((transaction) => transaction.wasteType))),
    [transactions]
  );

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const matchesSearch =
        transaction.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transaction.wasteType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || transaction.wasteType === filterType;
      const matchesMethod = filterMethod === 'all' || transaction.method === filterMethod;

      return matchesSearch && matchesType && matchesMethod;
    });
  }, [transactions, searchQuery, filterType, filterMethod]);

  const totalWeight = filteredTransactions.reduce((sum, item) => sum + item.weight, 0);
  const totalPoints = filteredTransactions.reduce((sum, item) => sum + item.totalPoints, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Riwayat Transaksi</h1>
            <p className="text-gray-600 mt-2">
              Lihat semua riwayat penyerahan sampah dan perolehan poin Anda.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Transaksi</CardDescription>
                <CardTitle className="text-3xl">{filteredTransactions.length}</CardTitle>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Berat</CardDescription>
                <CardTitle className="text-3xl">{totalWeight.toFixed(1)} kg</CardTitle>
              </CardHeader>
            </Card>

            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardDescription className="text-green-700">Total Poin</CardDescription>
                <CardTitle className="text-3xl text-green-600">{totalPoints.toLocaleString()}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <CardTitle>Semua Transaksi</CardTitle>
                  <CardDescription>Filter dan cari transaksi Anda.</CardDescription>
                </div>
                <Button variant="outline" className="md:w-auto" disabled>
                  <Download className="w-4 h-4 mr-2" />
                  Ekspor Data
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari berdasarkan ID atau jenis sampah..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="md:w-[220px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Jenis Sampah" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Jenis</SelectItem>
                    {wasteTypeOptions.map((wasteType) => (
                      <SelectItem key={wasteType} value={wasteType}>
                        {wasteType}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterMethod} onValueChange={setFilterMethod}>
                  <SelectTrigger className="md:w-[180px]">
                    <Package className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Metode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Semua Metode</SelectItem>
                    <SelectItem value="Drop-off">Drop-off</SelectItem>
                    <SelectItem value="Pickup">Pickup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID Transaksi</TableHead>
                      <TableHead>Tanggal</TableHead>
                      <TableHead>Jenis Sampah</TableHead>
                      <TableHead>Berat (kg)</TableHead>
                      <TableHead>Harga/kg</TableHead>
                      <TableHead>Poin</TableHead>
                      <TableHead>Metode</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          Memuat riwayat transaksi...
                        </TableCell>
                      </TableRow>
                    ) : filteredTransactions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                          Tidak ada transaksi yang ditemukan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell className="font-medium">{transaction.id}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              {new Date(transaction.date).toLocaleDateString('id-ID', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </div>
                          </TableCell>
                          <TableCell>{transaction.wasteType}</TableCell>
                          <TableCell>{transaction.weight.toFixed(1)} kg</TableCell>
                          <TableCell>{transaction.pointsPerKg.toLocaleString()} poin</TableCell>
                          <TableCell className="font-semibold text-green-600">
                            +{transaction.totalPoints.toLocaleString()}
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
                          <TableCell>
                            <Badge
                              className={
                                transaction.status === 'verified'
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : transaction.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-700 border-yellow-200'
                                  : 'bg-red-100 text-red-700 border-red-200'
                              }
                            >
                              {transaction.status === 'verified'
                                ? 'Terverifikasi'
                                : transaction.status === 'pending'
                                ? 'Pending'
                                : 'Ditolak'}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
