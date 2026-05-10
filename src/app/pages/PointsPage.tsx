import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Award, Gift, TrendingUp, Trophy, PieChart, Star, LayoutGrid, Info, Activity, CheckCircle2, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { SimpleLineChart } from '../components/SimpleLineChart';
import { SimplePieChart } from '../components/SimplePieChart';
import { fetchRewards, fetchTransactions, fetchUserPoints, type RewardItem, type TransactionItem } from '../lib/milosApi';
import { toast } from 'sonner';
import { buildAchievements, getLevelConfig, type AchievementItem } from '../lib/pointsProgram';
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh';

const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });

export default function PointsPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [currentPoints, setCurrentPoints] = useState<number>(user?.points || 0);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const [transactionResult, pointsResult, rewardResult] = await Promise.allSettled([
        fetchTransactions(user.id),
        fetchUserPoints(user.id, token),
        fetchRewards(),
      ]);
      if (transactionResult.status === 'fulfilled') setTransactions(transactionResult.value);
      if (pointsResult.status === 'fulfilled') setCurrentPoints(pointsResult.value.totalPoints);
      if (rewardResult.status === 'fulfilled') setRewards(rewardResult.value);
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => { loadData(); }, [loadData]);
  useRealtimeRefresh(Boolean(user?.id), loadData, ['transaction', 'redemption']);

  const currentMonthPoints = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((t) => {
        const date = new Date(t.date);
        return t.status === 'verified' && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, t) => sum + t.totalPoints, 0);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const grouped = new Map<string, number>();
    transactions
      .filter((t) => t.status === 'verified')
      .forEach((t) => {
        const key = monthFormatter.format(new Date(t.date));
        grouped.set(key, (grouped.get(key) || 0) + t.totalPoints);
      });
    return Array.from(grouped.entries()).map(([month, points]) => ({ month, points }));
  }, [transactions]);

  const wasteTypeData = useMemo(() => {
    const verified = transactions.filter((t) => t.status === 'verified');
    if (verified.length === 0) return [];
    const grouped = new Map<string, number>();
    const palette = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#6b7280', '#ef4444'];
    const totalWeight = verified.reduce((sum, t) => sum + t.weight, 0);
    verified.forEach((t) => { grouped.set(t.wasteType, (grouped.get(t.wasteType) || 0) + t.weight); });
    return Array.from(grouped.entries()).map(([name, weight], i) => ({
      name,
      value: totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0,
      color: palette[i % palette.length],
    }));
  }, [transactions]);

  const achievements = useMemo<AchievementItem[]>(
    () => buildAchievements(transactions.filter(t => t.status === 'verified'), currentPoints),
    [currentPoints, transactions]
  );

  const unlockedAchievements = achievements.filter((a) => a.unlocked).length;
  const level = getLevelConfig(currentPoints);

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <DashboardNavbar />

      <div className="pt-24 pb-12 container mx-auto px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Poin & Hadiah</h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">Dapatkan berbagai keuntungan dari tabungan sampah Anda.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-10">
            <Card className="border-none bg-green-600 text-white shadow-xl shadow-green-100 rounded-3xl">
              <CardHeader className="pb-2">
                <span className="text-green-100 text-[10px] md:text-xs font-medium uppercase tracking-wider">Saldo Poin</span>
                <CardTitle className="text-3xl md:text-4xl pt-2">{currentPoints.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-1.5 text-green-50 text-[10px] md:text-xs">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>+{currentMonthPoints.toLocaleString()} poin bulan ini</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm rounded-3xl sm:col-span-2">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-center gap-4 md:gap-6">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-yellow-50 flex items-center justify-center bg-yellow-100">
                      <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-600" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-white shadow-sm rounded-full p-1 border border-yellow-100">
                      <Star className="w-3.5 h-3.5 md:w-4 md:h-4 text-yellow-500 fill-yellow-500" />
                    </div>
                  </div>
                  <div className="flex-1 w-full space-y-3 text-center sm:text-left">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">Level Saat Ini</p>
                        <p className="text-lg md:text-xl font-bold text-gray-900">{level.label}</p>
                      </div>
                      <p className="text-[10px] md:text-xs font-bold text-yellow-600">{level.progress}%</p>
                    </div>
                    <Progress value={level.progress} className="h-1.5 md:h-2 bg-yellow-50" />
                    <p className="text-[10px] md:text-xs text-gray-500">
                      {level.next ? `Butuh ${level.remaining.toLocaleString()} poin lagi untuk naik ke ${level.next}` : 'Anda telah mencapai level tertinggi!'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="stats" className="space-y-8">
            <div className="flex justify-center overflow-x-auto pb-2 scrollbar-hide">
              <TabsList className="bg-white p-1 rounded-full shadow-sm min-w-max border border-gray-100">
                <TabsTrigger value="stats" className="rounded-full px-4 md:px-6 text-xs md:text-sm data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:shadow-none transition-all">
                  <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                  Statistik
                </TabsTrigger>
                <TabsTrigger value="badges" className="rounded-full px-4 md:px-6 text-xs md:text-sm data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:shadow-none transition-all">
                  <Star className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                  Pencapaian
                  {unlockedAchievements > 0 && (
                    <Badge className="ml-2 bg-yellow-500 text-[10px] px-1.5 h-4 min-w-[16px] flex items-center justify-center border-none text-white">
                      {unlockedAchievements}
                    </Badge>
                  )}
                </TabsTrigger>
                <TabsTrigger value="catalog" className="rounded-full px-4 md:px-6 text-xs md:text-sm data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:shadow-none transition-all">
                  <Gift className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                  Katalog
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="stats" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="w-5 h-5 text-green-600" />
                      Grafik Poin
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    {monthlyData.length > 0 ? (
                      <SimpleLineChart data={monthlyData} />
                    ) : (
                      <div className="py-20 text-center text-gray-400">Belum ada riwayat poin.</div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChart className="w-5 h-5 text-blue-600" />
                      Komposisi Sampah
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 pb-0">
                    {wasteTypeData.length > 0 ? (
                      <SimplePieChart data={wasteTypeData} />
                    ) : (
                      <div className="py-20 text-center text-gray-400">Belum ada data sampah.</div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="badges">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((a) => (
                  <Card key={a.id} className={`border-none rounded-3xl shadow-sm transition-all ${a.unlocked ? 'bg-white' : 'bg-gray-100/50 grayscale'}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${a.unlocked ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-400'}`}>
                          <a.icon className="w-7 h-7" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-gray-900 truncate">{a.title}</p>
                          <p className="text-xs text-gray-500 line-clamp-2 mt-1">{a.description}</p>
                        </div>
                      </div>
                      {!a.unlocked && (
                        <div className="mt-4 space-y-1.5">
                          <div className="flex justify-between text-[10px] font-bold text-gray-400">
                            <span>PROGRESS</span>
                            <span>{a.progress}%</span>
                          </div>
                          <Progress value={a.progress} className="h-1" />
                        </div>
                      )}
                      {a.unlocked && (
                        <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-green-600 uppercase tracking-widest">
                          <CheckCircle2 className="w-3 h-3" /> Terbuka
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="catalog">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {rewards.map((reward) => (
                  <Card key={reward.id} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden flex flex-col">
                    <CardHeader className="bg-gray-50/50 p-6">
                      <div className="flex justify-between items-start mb-4">
                        <Badge variant="outline" className="bg-white border-gray-100 text-gray-500 rounded-lg">{reward.category}</Badge>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400 uppercase">
                          <Package className="w-3 h-3" /> {reward.stock} Tersedia
                        </div>
                      </div>
                      <CardTitle className="text-xl text-gray-900">{reward.name}</CardTitle>
                      <CardDescription className="line-clamp-2 text-xs">{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 flex-1 flex flex-col justify-between">
                      <div className="mb-6">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Harga Tukar</p>
                        <div className="flex items-center gap-1.5 mt-1 text-green-600">
                          <Award className="w-5 h-5" />
                          <span className="text-3xl font-black">{reward.pointsRequired.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button
                        className="w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 font-bold shadow-lg shadow-green-100 disabled:bg-gray-100 disabled:text-gray-400"
                        disabled={reward.stock < 1 || currentPoints < reward.pointsRequired}
                        onClick={() => navigate(`/rewards?redeem=${reward.id}`)}
                      >
                        {reward.stock < 1 ? 'Stok Habis' : currentPoints < reward.pointsRequired ? 'Poin Kurang' : 'Tukar Sekarang'}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer Info */}
          <div className="mt-16 p-6 rounded-3xl bg-blue-50/50 border border-blue-100 flex items-start gap-4">
            <Info className="w-6 h-6 text-blue-500 shrink-0" />
            <div className="text-sm">
              <p className="font-bold text-blue-900">Nilai Tukar Poin</p>
              <p className="text-blue-700/70 mt-1 leading-relaxed">
                Setiap 1.000 poin bernilai setara dengan Rp 1.000. Poin dapat ditukarkan melalui katalog hadiah di atas atau dikonversi menjadi saldo digital melalui petugas di kantor Bank Sampah MILOS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
