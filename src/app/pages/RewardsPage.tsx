import { useCallback, useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Gift, Coins, Package, ShoppingCart, Check, Clock, Award, History, Activity, Info } from 'lucide-react';
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
import { useRealtimeRefresh } from '../hooks/useRealtimeRefresh';

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

  const loadData = useCallback(async () => {
    if (!user?.id || !token) return;
    try {
      const [rewardResult, pointsResult, redemptionResult] = await Promise.allSettled([
        fetchRewards(),
        fetchUserPoints(user.id, token),
        fetchMyRedemptions(token),
      ]);
      if (rewardResult.status === 'fulfilled') setRewards(rewardResult.value);
      if (pointsResult.status === 'fulfilled') setCurrentPoints(pointsResult.value.totalPoints);
      if (redemptionResult.status === 'fulfilled') setRedemptions(redemptionResult.value);
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => { loadData(); }, [loadData]);
  useRealtimeRefresh(Boolean(token && user?.id), loadData, ['redemption', 'transaction']);

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
    const target = rewards.find((r) => String(r.id) === redeemId);
    if (target && (!isDialogOpen || selectedReward?.id !== target.id)) {
      handleRedeemClick(target);
      setSearchParams({});
    }
  }, [rewards, searchParams]);

  const handleConfirmRedeem = async () => {
    if (!selectedReward || !token) return;
    const totalNeeded = selectedReward.pointsRequired * quantity;
    if (currentPoints < totalNeeded) { toast.error('Poin tidak mencukupi'); return; }
    if (selectedReward.stock < quantity) { toast.error('Stok tidak mencukupi'); return; }
    if (!address.trim()) { toast.error('Alamat harus diisi'); return; }

    setSubmitting(true);
    try {
      await createRewardRedemption(token, selectedReward.id, {
        quantity,
        address: address.trim(),
        notes: notes.trim(),
      });
      toast.success(`Permintaan penukaran berhasil.`);
      setIsDialogOpen(false);
      setSelectedReward(null);
      await loadData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menukar hadiah.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <DashboardNavbar />

      <div className="pt-24 pb-12 container mx-auto px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Katalog Hadiah</h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">Gunakan poin tabungan sampah Anda untuk mendapatkan hadiah menarik.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
            <Card className="border-none bg-green-600 text-white shadow-xl shadow-green-100 rounded-3xl md:col-span-2">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                  <div className="text-center sm:text-left">
                    <p className="text-green-100 text-[10px] uppercase font-bold tracking-wider">Saldo Poin Anda</p>
                    <div className="flex items-center gap-2 mt-1 justify-center sm:justify-start">
                      <Coins className="w-6 h-6 md:w-8 md:h-8 text-green-200" />
                      <p className="text-3xl md:text-4xl font-black">{currentPoints.toLocaleString()}</p>
                    </div>
                    <p className="text-green-100/70 text-[10px] md:text-xs mt-1">Setara Rp {(currentPoints / POINTS_TO_RUPIAH_DIVISOR).toLocaleString('id-ID')}</p>
                  </div>
                  <div className="h-12 w-px bg-green-500 hidden sm:block opacity-30" />
                  <div className="text-center sm:text-right">
                    <p className="text-green-100 text-[10px] uppercase font-bold tracking-wider">Permintaan Aktif</p>
                    <p className="text-2xl md:text-3xl font-bold mt-1">{pendingRedemptions.length}</p>
                    <p className="text-green-100/70 text-[10px] md:text-xs mt-1">Dalam proses pengiriman</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none bg-white shadow-sm rounded-3xl flex items-center p-4 md:p-6">
               <div className="flex items-center gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                    <Info className="w-5 h-5 md:w-6 md:h-6 text-blue-500" />
                  </div>
                  <div className="text-[10px] md:text-xs">
                    <p className="font-bold text-gray-900 uppercase tracking-tighter">Info Pengiriman</p>
                    <p className="text-gray-500 mt-0.5">Hadiah akan dikirim ke alamat terdaftar atau sesuai input form.</p>
                  </div>
               </div>
            </Card>
          </div>

          <Tabs defaultValue="catalog" className="space-y-8">
            <div className="flex justify-center overflow-x-auto pb-2 scrollbar-hide">
              <TabsList className="bg-white p-1 rounded-full shadow-sm min-w-max border border-gray-100">
                <TabsTrigger value="catalog" className="rounded-full px-4 md:px-6 text-xs md:text-sm data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:shadow-none transition-all">
                  <Gift className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                  Katalog Hadiah
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-full px-4 md:px-6 text-xs md:text-sm data-[state=active]:bg-green-100 data-[state=active]:text-green-700 data-[state=active]:shadow-none transition-all">
                  <History className="w-3.5 h-3.5 md:w-4 md:h-4 mr-2" />
                  Riwayat Tukar
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="catalog">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full py-20 text-center text-gray-400">Memuat katalog...</div>
                ) : rewards.length === 0 ? (
                  <div className="col-span-full py-20 text-center text-gray-400">Belum ada hadiah tersedia.</div>
                ) : (
                  rewards.map((reward) => {
                    const canAfford = currentPoints >= reward.pointsRequired;
                    const isOutOfStock = reward.stock < 1;
                    return (
                      <Card key={reward.id} className="border-none shadow-sm rounded-3xl bg-white overflow-hidden flex flex-col group transition-all hover:shadow-md">
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
                          <div className="mb-6 text-center">
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Harga Tukar</p>
                            <div className="flex items-center justify-center gap-1.5 mt-1 text-green-600">
                              <Award className="w-5 h-5" />
                              <span className="text-3xl font-black">{reward.pointsRequired.toLocaleString()}</span>
                            </div>
                            {!canAfford && (
                              <p className="text-[10px] text-amber-600 mt-1">Kurang {(reward.pointsRequired - currentPoints).toLocaleString()} poin</p>
                            )}
                          </div>
                          <Button
                            className="w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 font-bold shadow-lg shadow-green-100 disabled:bg-gray-100 disabled:text-gray-400"
                            disabled={!canAfford || isOutOfStock}
                            onClick={() => handleRedeemClick(reward)}
                          >
                            {isOutOfStock ? 'Stok Habis' : canAfford ? <><ShoppingCart className="w-4 h-4 mr-2" /> Tukar Sekarang</> : 'Poin Kurang'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                <CardContent className="p-0">
                  {redemptions.length === 0 ? (
                    <div className="py-20 text-center text-gray-400">Belum ada riwayat penukaran.</div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {redemptions.map((item) => (
                        <div key={item.id} className="flex items-center justify-between p-5 hover:bg-gray-50/50 transition-colors">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 flex items-center justify-center shrink-0">
                              <Gift className="w-5 h-5 text-purple-600" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-gray-900 truncate">{item.rewardName}</p>
                              <p className="text-xs text-gray-500">
                                {item.quantity} unit • {item.pointsUsed.toLocaleString()} poin
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <Badge variant="outline" className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                              item.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                              item.status === 'approved' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              item.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                              'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {item.status}
                            </Badge>
                            <p className="text-[10px] text-gray-400 mt-1">
                              {new Date(item.requestDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg rounded-[2rem] border-none">
          <DialogHeader>
            <DialogTitle className="text-2xl">Konfirmasi Penukaran</DialogTitle>
            <DialogDescription>Selesaikan data berikut untuk memproses hadiah.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label className="text-gray-500 font-semibold">Jumlah yang ditukar</Label>
              <Input
                type="number"
                min={1}
                max={selectedReward?.stock}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="h-12 rounded-xl border-gray-100 bg-gray-50/50"
              />
            </div>

            <div className="bg-green-50/50 rounded-2xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Biaya:</span>
                <span className="font-bold text-green-700">{( (selectedReward?.pointsRequired || 0) * quantity ).toLocaleString()} Poin</span>
              </div>
              <div className="flex justify-between border-t border-green-100 pt-2">
                <span className="text-gray-500">Saldo Poin Akhir:</span>
                <span className="font-semibold text-gray-900">{( currentPoints - (selectedReward?.pointsRequired || 0) * quantity ).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-500 font-semibold">Alamat Pengiriman</Label>
              <Textarea
                placeholder="Alamat lengkap..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="rounded-xl border-gray-100 bg-gray-50/50"
              />
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-3">
            <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Batal</Button>
            <Button onClick={handleConfirmRedeem} disabled={submitting} className="h-12 rounded-xl bg-green-600 hover:bg-green-700 font-bold px-8">
              {submitting ? 'Memproses...' : 'Tukar Poin Sekarang'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
