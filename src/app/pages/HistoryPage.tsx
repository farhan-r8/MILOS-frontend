import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { Search, Filter, Calendar, Package, Activity, Recycle, Award, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { fetchTransactions, type TransactionItem } from '../lib/milosApi';
import { toast } from 'sonner';
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh';

export default function HistoryPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');

  const loadTransactions = useCallback(async () => {
    if (!user?.id) return;
    try {
      const data = await fetchTransactions(user.id);
      setTransactions(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat riwayat transaksi.');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  useRealtimeRefresh(Boolean(user?.id), loadTransactions, ['transaction']);

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

  const verifiedFilteredTransactions = useMemo(
    () => filteredTransactions.filter((transaction) => transaction.status === 'verified'),
    [filteredTransactions]
  );

  const totalWeight = filteredTransactions.reduce((sum, item) => sum + item.weight, 0);
  const totalPoints = verifiedFilteredTransactions.reduce((sum, item) => sum + item.totalPoints, 0);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <DashboardNavbar />

      <div className="pt-24 pb-12 container mx-auto px-4 md:px-0">
        <div className="max-w-7xl mx-auto px-4 md:px-0">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-bold text-gray-900">Riwayat Transaksi</h1>
            <p className="text-gray-500 mt-2">Daftar lengkap penyerahan sampah dan perolehan poin Anda.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            <Card className="border-none bg-white shadow-sm rounded-3xl">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Transaksi</span>
                  <Activity className="w-5 h-5 text-purple-500" />
                </div>
                <CardTitle className="text-3xl pt-2">{filteredTransactions.length}</CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-none bg-white shadow-sm rounded-3xl">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Berat</span>
                  <Recycle className="w-5 h-5 text-blue-500" />
                </div>
                <CardTitle className="text-3xl pt-2">{totalWeight.toFixed(1)} <span className="text-lg font-normal text-gray-400">kg</span></CardTitle>
              </CardHeader>
            </Card>

            <Card className="border-none bg-green-600 text-white shadow-xl shadow-green-100 rounded-3xl sm:col-span-2">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <span className="text-green-100 text-sm font-medium uppercase tracking-wider">Total Perolehan Poin</span>
                  <Award className="w-5 h-5 text-green-200" />
                </div>
                <CardTitle className="text-3xl pt-2">{totalPoints.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-green-50/70 text-xs italic">*Hanya poin dari transaksi yang sudah diverifikasi</p>
              </CardContent>
            </Card>
          </div>

          <Card className="border-none shadow-sm rounded-3xl bg-white mb-8">
            <CardContent className="p-4 sm:p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cari ID atau jenis sampah..."
                    className="h-11 pl-10 rounded-xl border-gray-100 bg-gray-50/50"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Select value={filterType} onValueChange={setFilterType}>
                    <SelectTrigger className="h-11 w-full sm:w-[200px] rounded-xl border-gray-100 bg-gray-50/50">
                      <Filter className="w-4 h-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Semua Jenis" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Jenis</SelectItem>
                      {wasteTypeOptions.map((wasteType) => (
                        <SelectItem key={wasteType} value={wasteType}>{wasteType}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={filterMethod} onValueChange={setFilterMethod}>
                    <SelectTrigger className="h-11 w-full sm:w-[160px] rounded-xl border-gray-100 bg-gray-50/50">
                      <Package className="w-4 h-4 mr-2 text-gray-400" />
                      <SelectValue placeholder="Metode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Metode</SelectItem>
                      <SelectItem value="Drop-off">Drop-off</SelectItem>
                      <SelectItem value="Pickup">Pickup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
            <CardContent className="p-0">
              {/* Mobile List View */}
              <div className="divide-y divide-gray-50 md:hidden">
                {loading ? (
                  <div className="py-20 text-center text-gray-400">Memuat data...</div>
                ) : filteredTransactions.length === 0 ? (
                  <div className="py-20 text-center text-gray-400">Tidak ada riwayat.</div>
                ) : (
                  filteredTransactions.map((transaction) => (
                    <div key={transaction.id} className="p-5 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{transaction.id}</p>
                          <p className="font-bold text-gray-900 mt-0.5">{transaction.wasteType}</p>
                        </div>
                        <Badge className={`rounded-full px-2 py-0 text-[10px] font-bold uppercase ${
                          transaction.status === 'verified' ? 'bg-green-100 text-green-700' :
                          transaction.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-gray-400 mb-0.5">Tanggal</p>
                          <p className="font-medium">{new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-0.5">Berat</p>
                          <p className="font-medium">{transaction.weight.toFixed(1)} kg</p>
                        </div>
                        <div>
                          <p className="text-gray-400 mb-0.5">Metode</p>
                          <p className="font-medium">{transaction.method}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-gray-400 mb-0.5">Poin</p>
                          <p className="font-bold text-green-600">+{transaction.totalPoints}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Desktop Table View */}
              <div className="hidden md:block">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-gray-50/50">
                    <TableRow>
                      <TableHead className="font-bold text-gray-400 text-[10px] uppercase">ID</TableHead>
                      <TableHead className="font-bold text-gray-400 text-[10px] uppercase">Tanggal</TableHead>
                      <TableHead className="font-bold text-gray-400 text-[10px] uppercase">Jenis</TableHead>
                      <TableHead className="font-bold text-gray-400 text-[10px] uppercase">Berat</TableHead>
                      <TableHead className="font-bold text-gray-400 text-[10px] uppercase">Poin</TableHead>
                      <TableHead className="font-bold text-gray-400 text-[10px] uppercase">Metode</TableHead>
                      <TableHead className="font-bold text-gray-400 text-[10px] uppercase text-right">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={7} className="h-40 text-center text-gray-400">Memuat riwayat...</TableCell></TableRow>
                    ) : filteredTransactions.length === 0 ? (
                      <TableRow><TableCell colSpan={7} className="h-40 text-center text-gray-400">Belum ada riwayat transaksi.</TableCell></TableRow>
                    ) : (
                      filteredTransactions.map((transaction) => (
                        <TableRow key={transaction.id} className="hover:bg-gray-50/50 transition-colors">
                          <TableCell className="font-mono text-[10px] text-gray-400">{transaction.id}</TableCell>
                          <TableCell className="text-sm font-medium">
                            {new Date(transaction.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </TableCell>
                          <TableCell className="font-bold text-gray-900">{transaction.wasteType}</TableCell>
                          <TableCell className="text-sm">{transaction.weight.toFixed(1)} kg</TableCell>
                          <TableCell className="font-bold text-green-600">+{transaction.totalPoints}</TableCell>
                          <TableCell>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${transaction.method === 'Pickup' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                              {transaction.method}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Badge className={`rounded-full px-3 py-0.5 text-[10px] font-bold uppercase ${
                              transaction.status === 'verified' ? 'bg-green-100 text-green-700' :
                              transaction.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-red-100 text-red-700'
                            }`}>
                              {transaction.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                  </Table>
                  </div>
                  </div>            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
