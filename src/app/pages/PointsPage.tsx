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
  ArrowUpRight,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { SimpleLineChart } from '../components/SimpleLineChart';
import { SimplePieChart } from '../components/SimplePieChart';

const monthlyData = [
  { month: 'Jan', points: 2400, transactions: 3 },
  { month: 'Feb', points: 3800, transactions: 5 },
  { month: 'Mar', points: 5200, transactions: 4 },
  { month: 'Apr', points: 7100, transactions: 6 },
  { month: 'Mei', points: 9500, transactions: 4 },
  { month: 'Jun', points: 12500, transactions: 8 },
];

const wasteTypeData = [
  { name: 'Plastik PET', value: 35, color: '#10b981' },
  { name: 'Kardus', value: 25, color: '#3b82f6' },
  { name: 'Botol Plastik', value: 15, color: '#8b5cf6' },
  { name: 'Kertas', value: 12, color: '#f59e0b' },
  { name: 'Lainnya', value: 13, color: '#6b7280' },
];

const achievements = [
  {
    id: 1,
    title: 'Pemula Hijau',
    description: 'Selesaikan 5 transaksi pertama',
    icon: Star,
    progress: 100,
    unlocked: true,
  },
  {
    id: 2,
    title: 'Pengumpul Plastik',
    description: 'Kumpulkan 50 kg plastik',
    icon: Trophy,
    progress: 100,
    unlocked: true,
  },
  {
    id: 3,
    title: 'Pejuang Lingkungan',
    description: 'Raih 10,000 poin',
    icon: Award,
    progress: 100,
    unlocked: true,
  },
  {
    id: 4,
    title: 'Konsisten',
    description: 'Transaksi 6 bulan berturut-turut',
    icon: Calendar,
    progress: 100,
    unlocked: true,
  },
  {
    id: 5,
    title: 'Master Recycler',
    description: 'Raih 50,000 poin',
    icon: Target,
    progress: 25,
    unlocked: false,
  },
];

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

export default function PointsPage() {
  const { user } = useAuth();
  const currentPoints = user?.points || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
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

          {/* Points Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card className="md:col-span-2 bg-gradient-to-br from-green-500 to-emerald-600 text-white">
              <CardHeader>
                <CardDescription className="text-green-50">Poin Anda Saat Ini</CardDescription>
                <CardTitle className="text-5xl">{currentPoints.toLocaleString()}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-green-50">
                  <TrendingUp className="w-5 h-5" />
                  <span>+2,100 poin bulan ini</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription>Level Anda</CardDescription>
                    <CardTitle className="text-3xl mt-2">Gold</CardTitle>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Trophy className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Progress ke Platinum</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  <p className="text-xs text-gray-500">
                    37,500 poin lagi untuk naik level
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardDescription>Achievement</CardDescription>
                    <CardTitle className="text-3xl mt-2">4/5</CardTitle>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Award className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  1 achievement lagi untuk bonus poin
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 mb-8">
            {/* Points Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Perkembangan Poin</CardTitle>
                <CardDescription>Grafik perolehan poin 6 bulan terakhir</CardDescription>
              </CardHeader>
              <CardContent>
                <SimpleLineChart data={monthlyData} />
              </CardContent>
            </Card>

            {/* Waste Type Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Sampah</CardTitle>
                <CardDescription>Berdasarkan jenis sampah</CardDescription>
              </CardHeader>
              <CardContent>
                <SimplePieChart data={wasteTypeData} />
              </CardContent>
            </Card>
          </div>

          {/* Achievements */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Pencapaian</CardTitle>
                  <CardDescription>Raih achievement untuk mendapatkan bonus poin</CardDescription>
                </div>
                <Badge className="bg-purple-100 text-purple-700 border-purple-200">
                  4 Terbuka
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
                        <Badge className="bg-green-600">✓</Badge>
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

          {/* Rewards */}
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