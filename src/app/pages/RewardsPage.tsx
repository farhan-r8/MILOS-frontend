import { useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Gift, Coins, Package, ShoppingCart, Check, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router';
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
import {
  createRewardRedemption,
  fetchMyRedemptions,
  fetchRewards,
  fetchUserPoints,
  type RedemptionItem,
  type RewardItem,
} from '../lib/milosApi';
import { POINTS_TO_RUPIAH_DIVISOR } from '../lib/pointsProgram';

export default function RewardsPage() {
  const { user, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [redemptions, setRedemptions] = useState<RedemptionItem[]>([]);
  const [selectedReward, setSelectedReward] = useState<RewardItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentPoints, setCurrentPoints] = useState<number>(user?.points || 0);
  const [quantity, setQuantity] = useState(1);
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const loadData = async () => {
    if (!user?.id || !token) return;

    try {
      const [rewardResult, pointsResult, redemptionResult] = await Promise.allSettled([
        fetchRewards(),
        fetchUserPoints(user.id, token),
        fetchMyRedemptions(token),
      ]);

      if (rewardResult.status === 'fulfilled') {
        setRewards(rewardResult.value);
      }

      if (pointsResult.status === 'fulfilled') {
        setCurrentPoints(pointsResult.value.totalPoints);
      }

      if (redemptionResult.status === 'fulfilled') {
        setRedemptions(redemptionResult.value);
      }

      if (
        rewardResult.status === 'rejected' &&
        pointsResult.status === 'rejected' &&
        redemptionResult.status === 'rejected'
      ) {
        toast.error('Gagal memuat seluruh data hadiah.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, user?.id]);

  const pendingRedemptions = useMemo(
    () => redemptions.filter((item) => ['pending', 'approved'].includes(item.status)),
    [redemptions]
  );

  const handleRedeemClick = (reward: RewardItem) => {
    if (currentPoints < reward.pointsRequired) {
      toast.error('Poin Anda tidak mencukupi');
      return;
    }
    if (reward.stock < 1) {
      toast.error('Stok barang habis');
      return;
    }

    setSelectedReward(reward);
    setQuantity(1);
    setAddress(user?.address || '');
    setNotes('');
    setIsDialogOpen(true);
  };

  useEffect(() => {
    const redeemId = searchParams.get('redeem');
    if (!redeemId || rewards.length === 0) return;

    const targetReward = rewards.find((reward) => String(reward.id) === redeemId);
    if (!targetReward) {
      toast.error('Hadiah yang dipilih tidak ditemukan.');
      setSearchParams({});
      return;
    }

    if (isDialogOpen && selectedReward?.id === targetReward.id) {
      return;
    }

    handleRedeemClick(targetReward);
    setSearchParams({});
  }, [isDialogOpen, rewards, searchParams, selectedReward?.id, setSearchParams]);

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !token) return;

    const totalPoints = selectedReward.pointsRequired * quantity;

    if (currentPoints < totalPoints) {
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

    setSubmitting(true);
    try {
      await createRewardRedemption(token, selectedReward.id, {
        quantity,
        address: address.trim(),
        notes: notes.trim(),
      });
      toast.success(`Permintaan penukaran ${selectedReward.name} berhasil dibuat.`);
      setIsDialogOpen(false);
      setSelectedReward(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal membuat penukaran hadiah.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
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

            <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-green-100 text-sm mb-1">Poin Anda Saat Ini</p>
                    <div className="flex items-center gap-2">
                      <Coins className="w-8 h-8" />
                      <p className="text-3xl font-bold sm:text-4xl">{currentPoints.toLocaleString('id-ID')}</p>
                    </div>
                    <p className="text-green-100 text-sm mt-2">
                      Sekitar Rp {(currentPoints / POINTS_TO_RUPIAH_DIVISOR).toLocaleString('id-ID')}
                    </p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-green-100 text-sm">Permintaan Aktif</p>
                    <p className="text-2xl font-bold sm:text-3xl">{pendingRedemptions.length}</p>
                    <p className="text-green-100 text-xs mt-1">
                      Pending atau sudah disetujui admin
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                Memuat katalog hadiah...
              </div>
            ) : rewards.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500">
                Belum ada hadiah yang tersedia.
              </div>
            ) : (
              rewards.map((reward) => {
                const canAfford = currentPoints >= reward.pointsRequired;
                const isOutOfStock = reward.stock < 1;

                return (
                  <Card key={reward.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <CardHeader className="bg-gradient-to-br from-gray-50 to-gray-100 pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <Badge variant="outline" className="mb-2">
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
                          Kurang {(reward.pointsRequired - currentPoints).toLocaleString('id-ID')} poin
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
              })
            )}
          </div>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Riwayat Penukaran Saya</CardTitle>
              <CardDescription>Status permintaan hadiah yang sudah Anda ajukan</CardDescription>
            </CardHeader>
            <CardContent>
              {redemptions.length === 0 ? (
                <div className="text-sm text-gray-500 py-4">
                  Belum ada riwayat penukaran.
                </div>
              ) : (
                <div className="space-y-3">
                  {redemptions.slice(0, 5).map((redemption) => (
                    <div key={redemption.id} className="flex flex-col gap-3 rounded-lg bg-gray-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900">{redemption.rewardName}</div>
                        <div className="text-sm text-gray-600">
                          {redemption.quantity}x - {redemption.pointsUsed.toLocaleString('id-ID')} poin
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={
                          redemption.status === 'completed'
                            ? 'bg-green-50 text-green-700 border-green-300'
                            : redemption.status === 'approved'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : redemption.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700 border-yellow-300'
                            : 'bg-red-50 text-red-700 border-red-300'
                        }
                      >
                        {redemption.status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
                        {redemption.status === 'completed' && <Check className="w-3 h-3 mr-1" />}
                        {redemption.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Konfirmasi Penukaran</DialogTitle>
            <DialogDescription>
              Lengkapi informasi di bawah untuk menukar poin dengan {selectedReward?.name}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="quantity">Jumlah</Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={selectedReward?.stock || 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              />
              <p className="text-xs text-gray-500 mt-1">
                Maksimal: {selectedReward?.stock} unit
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-600">Total Poin:</span>
                <div className="flex items-center gap-1">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  <span className="font-bold text-green-700">
                    {((selectedReward?.pointsRequired || 0) * quantity).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm text-gray-600">Sisa Poin:</span>
                <span className="font-semibold">
                  {(currentPoints - (selectedReward?.pointsRequired || 0) * quantity).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

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

          <DialogFooter className="gap-2">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleConfirmRedeem} disabled={submitting}>
              <Check className="w-4 h-4 mr-2" />
              {submitting ? 'Mengirim...' : 'Konfirmasi Penukaran'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
