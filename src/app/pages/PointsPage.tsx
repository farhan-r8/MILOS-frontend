import { useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import {
  Award,
  TrendingUp,
  Gift,
  Star,
  Trophy,
  Target,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SimpleLineChart } from '../components/SimpleLineChart';
import { SimplePieChart } from '../components/SimplePieChart';
import { fetchTransactions, fetchUserPoints, type TransactionItem } from '../lib/milosApi';
import { toast } from 'sonner';

const monthFormatter = new Intl.DateTimeFormat('id-ID', { month: 'short' });

type AchievementItem = {
  id: number;
  title: string;
  description: string;
  icon: typeof Star;
  progress: number;
  unlocked: boolean;
};

const rewards = [
  {
    id: 1,
    name: 'Voucher Belanja Rp 50.000',
    points: 50000,
    available: true,
    stock: 15,
  },
  {
    id: 2,
    name: 'Tas Belanja Ramah Lingkungan',
    points: 30000,
    available: true,
    stock: 25,
  },
  {
    id: 3,
    name: 'Tumbler Stainless',
    points: 80000,
    available: true,
    stock: 10,
  },
  {
    id: 4,
    name: 'Voucher Belanja Rp 100.000',
    points: 100000,
    available: true,
    stock: 8,
  },
  {
    id: 5,
    name: 'Paket Starter Kit Zero Waste',
    points: 150000,
    available: false,
    stock: 0,
  },
  {
    id: 6,
    name: 'Donasi Pohon (1 bibit)',
    points: 25000,
    available: true,
    stock: 50,
  },
];

const getLevelConfig = (points: number) => {
  if (points >= 50000) {
    return { label: 'Platinum', progress: 100, remaining: 0, next: null as string | null };
  }

  if (points >= 10000) {
    return {
      label: 'Gold',
      progress: Math.min(100, Math.round(((points - 10000) / 40000) * 100)),
      remaining: Math.max(0, 50000 - points),
      next: 'Platinum',
    };
  }

  if (points >= 5000) {
    return {
      label: 'Silver',
      progress: Math.min(100, Math.round(((points - 5000) / 5000) * 100)),
      remaining: Math.max(0, 10000 - points),
      next: 'Gold',
    };
  }

  return {
    label: 'Bronze',
    progress: Math.min(100, Math.round((points / 5000) * 100)),
    remaining: Math.max(0, 5000 - points),
    next: 'Silver',
  };
};

export default function PointsPage() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<TransactionItem[]>([]);
  const [currentPoints, setCurrentPoints] = useState<number>(user?.points || 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }

      try {
        const [transactionData, pointsData] = await Promise.all([
          fetchTransactions(user.id),
          fetchUserPoints(user.id),
        ]);

        if (isMounted) {
          setTransactions(transactionData);
          setCurrentPoints(pointsData.totalPoints);
        }
      } catch (error) {
        if (isMounted) {
          toast.error(error instanceof Error ? error.message : 'Gagal memuat data poin.');
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
  }, [user?.id]);

  const currentMonthPoints = useMemo(() => {
    const now = new Date();
    return transactions
      .filter((transaction) => {
        const date = new Date(transaction.date);
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      })
      .reduce((sum, transaction) => sum + transaction.totalPoints, 0);
  }, [transactions]);

  const monthlyData = useMemo(() => {
    const grouped = new Map<string, number>();
    transactions.forEach((transaction) => {
      const key = monthFormatter.format(new Date(transaction.date));
      grouped.set(key, (grouped.get(key) || 0) + transaction.totalPoints);
    });

    return Array.from(grouped.entries()).map(([month, points]) => ({ month, points }));
  }, [transactions]);

  const wasteTypeData = useMemo(() => {
    if (transactions.length === 0) {
      return [];
    }

    const grouped = new Map<string, number>();
    const palette = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#6b7280', '#ef4444'];
    const totalWeight = transactions.reduce((sum, transaction) => sum + transaction.weight, 0);

    transactions.forEach((transaction) => {
      grouped.set(transaction.wasteType, (grouped.get(transaction.wasteType) || 0) + transaction.weight);
    });

    return Array.from(grouped.entries()).map(([name, weight], index) => ({
      name,
      value: totalWeight > 0 ? Math.round((weight / totalWeight) * 100) : 0,
      color: palette[index % palette.length],
    }));
  }, [transactions]);

  const achievements = useMemo<AchievementItem[]>(() => {
    const totalTransactions = transactions.length;
    const plasticWeight = transactions
      .filter((transaction) => /plastik/i.test(transaction.wasteType))
      .reduce((sum, transaction) => sum + transaction.weight, 0);
    const uniqueMonths = new Set(
      transactions.map((transaction) => {
        const date = new Date(transaction.date);
        return `${date.getFullYear()}-${date.getMonth()}`;
      })
    ).size;

    return [
      {
        id: 1,
        title: 'Pemula Hijau',
        description: 'Selesaikan 5 transaksi pertama',
        icon: Star,
        progress: Math.min(100, Math.round((totalTransactions / 5) * 100)),
        unlocked: totalTransactions >= 5,
      },
      {
        id: 2,
        title: 'Pengumpul Plastik',
        description: 'Kumpulkan 50 kg plastik',
        icon: Trophy,
        progress: Math.min(100, Math.round((plasticWeight / 50) * 100)),
        unlocked: plasticWeight >= 50,
      },
      {
        id: 3,
        title: 'Pejuang Lingkungan',
        description: 'Raih 10,000 poin',
        icon: Award,
        progress: Math.min(100, Math.round((currentPoints / 10000) * 100)),
        unlocked: currentPoints >= 10000,
      },
      {
        id: 4,
        title: 'Konsisten',
        description: 'Transaksi 6 bulan berturut-turut',
        icon: Calendar,
        progress: Math.min(100, Math.round((uniqueMonths / 6) * 100)),
        unlocked: uniqueMonths >= 6,
      },
      {
        id: 5,
        title: 'Master Recycler',
        description: 'Raih 50,000 poin',
        icon: Target,
        progress: Math.min(100, Math.round((currentPoints / 50000) * 100)),
        unlocked: currentPoints >= 50000,
      },
    ];
  }, [currentPoints, transactions]);

  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length;
  const level = getLevelConfig(currentPoints);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Poin & Reward</h1>
            <p className="text-gray-600 mt-2">
              Pantau perkembangan poin dan tukarkan dengan hadiah menarik
            </p>
            <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-800">
              <Award className="w-4 h-4" />
              <span className="font-semibold">1.000 poin = Rp 1.000</span>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="md:col-span-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardHeader>
                <CardDescription className="text-green-50">Poin Anda Saat Ini</CardDescription>
                <CardTitle className="text-5xl">{currentPoints.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-green-50">
                  <TrendingUp className="w-5 h-5" />
                  <span>
                    {loading
                      ? 'Memuat ringkasan poin...'
                      : `+${currentMonthPoints.toLocaleString()} poin bulan ini`}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription>Level Anda</CardDescription>
                    <CardTitle className="text-3xl mt-2">{level.label}</CardTitle>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      {level.next ? `Progress ke ${level.next}` : 'Level tertinggi tercapai'}
                    </span>
                    <span className="font-medium">{level.progress}%</span>
                  </div>
                  <Progress value={level.progress} className="h-2" />
                  <p className="text-xs text-gray-500">
                    {level.next ? `${level.remaining.toLocaleString()} poin lagi untuk naik level` : 'Tidak ada level berikutnya'}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription>Achievement</CardDescription>
                    <CardTitle className="text-3xl mt-2">
                      {unlockedAchievements}/{achievements.length}
                    </CardTitle>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {achievements.length - unlockedAchievements > 0
                    ? `${achievements.length - unlockedAchievements} achievement lagi untuk bonus poin`
                    : 'Semua achievement sudah terbuka'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Perkembangan Poin</CardTitle>
                <CardDescription>Grafik perolehan poin berdasarkan transaksi nyata</CardDescription>
              </CardHeader>
              <CardContent>
                {monthlyData.length > 0 ? (
                  <SimpleLineChart data={monthlyData} />
                ) : (
                  <div className="py-8 text-center text-sm text-gray-500">
                    Belum ada transaksi untuk menampilkan perkembangan poin.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribusi Sampah</CardTitle>
                <CardDescription>Berdasarkan jenis sampah dari transaksi Anda</CardDescription>
              </CardHeader>
              <CardContent>
                {wasteTypeData.length > 0 ? (
                  <SimplePieChart data={wasteTypeData} />
                ) : (
                  <div className="py-8 text-center text-sm text-gray-500">
                    Belum ada data sampah untuk ditampilkan.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Pencapaian</CardTitle>
                  <CardDescription>Raih achievement untuk mendapatkan bonus poin</CardDescription>
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  {unlockedAchievements} Terbuka
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-lg border-2 ${
                      achievement.unlocked
                        ? 'bg-green-50 border-green-200'
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          achievement.unlocked
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                        }`}
                      >
                        <achievement.icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{achievement.title}</h3>
                        <p className="text-sm text-gray-600">{achievement.description}</p>
                      </div>
                      {achievement.unlocked && (
                        <Badge className="bg-green-600 text-white">OK</Badge>
                      )}
                    </div>
                    {!achievement.unlocked && (
                      <>
                        <Progress value={achievement.progress} className="h-2 mb-2" />
                        <p className="text-xs text-gray-600">{achievement.progress}% selesai</p>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Katalog Reward</CardTitle>
              <CardDescription>
                Tukarkan poin Anda dengan hadiah menarik berikut
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rewards.map((reward) => (
                  <div
                    key={reward.id}
                    className={`border-2 rounded-lg p-4 ${
                      reward.available ? 'border-gray-200 hover:border-green-500' : 'border-gray-100 bg-gray-50'
                    } transition`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-1">{reward.name}</h3>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-green-600" />
                          <span className="text-lg font-bold text-green-600">
                            {reward.points.toLocaleString()}
                          </span>
                          <span className="text-sm text-gray-600">poin</span>
                        </div>
                      </div>
                      <Gift className={`w-8 h-8 ${reward.available ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        Stok: {reward.stock > 0 ? reward.stock : 'Habis'}
                      </span>
                      <Button
                        size="sm"
                        disabled={!reward.available || currentPoints < reward.points}
                        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300"
                      >
                        {!reward.available
                          ? 'Habis'
                          : currentPoints < reward.points
                          ? 'Poin Kurang'
                          : 'Tukar'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
