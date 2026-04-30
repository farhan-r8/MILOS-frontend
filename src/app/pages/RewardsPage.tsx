import { useState, useEffect } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Gift, Coins, Package, ShoppingCart, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';

interface RewardItem {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
  category: string;
  image?: string;
}

export default function RewardsPage() {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  // Mock data for rewards
  useEffect(() => {
    const mockRewards: RewardItem[] = [
      {
        id: 1,
        name: 'Tumbler Stainless',
        description: 'Tumbler ramah lingkungan kapasitas 500ml',
        pointsRequired: 50000,
        stock: 15,
        category: 'Peralatan',
      },
      {
        id: 2,
        name: 'Tas Belanja Kanvas',
        description: 'Tas belanja kuat dan tahan lama',
        pointsRequired: 30000,
        stock: 25,
        category: 'Peralatan',
      },
      {
        id: 3,
        name: 'Voucher Pulsa 50K',
        description: 'Voucher pulsa semua operator',
        pointsRequired: 52000,
        stock: 50,
        category: 'Voucher',
      },
      {
        id: 4,
        name: 'Bibit Tanaman Hias',
        description: 'Paket 3 bibit tanaman hias',
        pointsRequired: 25000,
        stock: 20,
        category: 'Tanaman',
      },
      {
        id: 5,
        name: 'Sedotan Stainless (Set)',
        description: 'Set sedotan stainless dengan sikat pembersih',
        pointsRequired: 15000,
        stock: 30,
        category: 'Peralatan',
      },
      {
        id: 6,
        name: 'Kompos Organik 5kg',
        description: 'Kompos organik berkualitas untuk tanaman',
        pointsRequired: 20000,
        stock: 40,
        category: 'Pupuk',
      },
    ];
    setRewards(mockRewards);
  }, []);

  const handleRedeemClick = (reward: RewardItem) => {
    if (!user?.points || user.points < reward.pointsRequired) {
      toast.error('Poin Anda tidak mencukupi');
      return;
    }
    if (reward.stock < 1) {
      toast.error('Stok barang habis');
      return;
    }
    setSelectedReward(reward);
    setQuantity(1);
    setAddress('');
    setNotes('');
    setIsDialogOpen(true);
  };

  const handleConfirmRedeem = () => {
    if (!selectedReward || !user) return;

    const totalPoints = selectedReward.pointsRequired * quantity;

    if (user.points < totalPoints) {
      toast.error('Poin Anda tidak mencukupi');
      return;
    }

    if (selectedReward.stock < quantity) {
      toast.error('Stok tidak mencukupi');
      return;
    }

    if (!address.trim()) {
      toast.error('Alamat pengiriman harus diisi');
      return;
    }

    // Simulate API call to redeem reward
    toast.success(`Permintaan penukaran ${selectedReward.name} berhasil! Menunggu konfirmasi admin.`);
    setIsDialogOpen(false);
    setSelectedReward(null);
  };

  const userPoints = user?.points || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                <Gift className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Katalog Hadiah</h1>
                <p className="text-gray-600">Tukarkan poin Anda dengan berbagai hadiah menarik</p>
              </div>
            </div>

            {/* User Points Card */}
            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100 text-sm mb-1">Poin Anda Saat Ini</p>
                    <div className="flex items-center gap-2">
                      <Coins className="w-8 h-8" />
                      <p className="text-4xl font-bold">{userPoints.toLocaleString('id-ID')}</p>
                    </div>
                    <p className="text-green-100 text-sm mt-2">
                      ≈ Rp {(userPoints / 1000).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-green-100 text-sm">Catatan:</p>
                    <p className="text-xs text-green-100 mt-1">
                      Penukaran uang tunai<br />dilakukan secara offline
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rewards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rewards.map((reward) => {
              const canAfford = userPoints >= reward.pointsRequired;
              const isOutOfStock = reward.stock < 1;

              return (
                <Card key={reward.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-br from-gray-50 to-gray-100 pb-4">
                    <div className="flex justify-between items-start mb-2">
                      <Badge variant={isOutOfStock ? 'secondary' : 'default'} className="mb-2">
                        {reward.category}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Package className="w-4 h-4" />
                        <span>{reward.stock} tersedia</span>
                      </div>
                    </div>
                    <CardTitle className="text-xl">{reward.name}</CardTitle>
                    <CardDescription className="text-gray-600">
                      {reward.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Coins className="w-5 h-5 text-yellow-500" />
                      <span className="text-2xl font-bold text-green-700">
                        {reward.pointsRequired.toLocaleString('id-ID')}
                      </span>
                      <span className="text-gray-500">poin</span>
                    </div>
                    {!canAfford && (
                      <p className="text-sm text-amber-600 mb-2">
                        Kurang {(reward.pointsRequired - userPoints).toLocaleString('id-ID')} poin
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      className="w-full"
                      disabled={!canAfford || isOutOfStock}
                      onClick={() => handleRedeemClick(reward)}
                    >
                      {isOutOfStock ? (
                        'Stok Habis'
                      ) : canAfford ? (
                        <>
                          <ShoppingCart className="w-4 h-4 mr-2" />
                          Tukar Sekarang
                        </>
                      ) : (
                        'Poin Tidak Cukup'
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>

          {/* Info Card */}
          <Card className="mt-8 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h3 className="font-semibold text-blue-900 mb-2">Informasi Penukaran:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Barang akan dikirim setelah konfirmasi dari admin</li>
                <li>• Pengiriman dilakukan ke alamat yang Anda daftarkan</li>
                <li>• Proses penukaran membutuhkan waktu 3-7 hari kerja</li>
                <li>• Untuk penukaran poin ke uang tunai, silakan hubungi kepengurusan secara offline</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Redeem Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penukaran</DialogTitle>
            <DialogDescription>
              Lengkapi informasi di bawah untuk menukar poin dengan {selectedReward?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Jumlah</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={selectedReward?.stock || 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maksimal: {selectedReward?.stock} unit
              </p>
            </div>

            {/* Total Points */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Total Poin:</span>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-green-700">
                    {((selectedReward?.pointsRequired || 0) * quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Sisa Poin:</span>
                <span className="font-semibold">
                  {(userPoints - (selectedReward?.pointsRequired || 0) * quantity).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Alamat Pengiriman *</Label>
              <Textarea
                id="address"
                placeholder="Masukkan alamat lengkap untuk pengiriman"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={3}
              />
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="notes">Catatan (Opsional)</Label>
              <Textarea
                id="notes"
                placeholder="Tambahkan catatan jika ada"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleConfirmRedeem}>
              <Check className="w-4 h-4 mr-2" />
              Konfirmasi Penukaran
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
