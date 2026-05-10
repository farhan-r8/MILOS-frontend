import { useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../../components/DashboardNavbar';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Gift, Plus, Pencil, Trash2, Package, Coins } from 'lucide-react';
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
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { useAuth } from '../../context/AuthContext';
import {
  createReward,
  deleteReward,
  fetchAdminRewards,
  updateReward,
  type RewardItem,
} from '../../lib/milosApi';

type FormData = Omit<RewardItem, 'id' | 'isActive'>;

export default function AdminRewardsPage() {
  const { token } = useAuth();
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    pointsRequired: 0,
    stock: 0,
    category: 'Peralatan',
  });

  const loadRewards = async () => {
    if (!token) return;
    try {
      const data = await fetchAdminRewards(token);
      setRewards(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat hadiah admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRewards();
  }, [token]);

  const handleAddClick = () => {
    setEditingReward(null);
    setFormData({
      name: '',
      description: '',
      pointsRequired: 0,
      stock: 0,
      category: 'Peralatan',
    });
    setIsDialogOpen(true);
  };

  const handleEditClick = (reward: RewardItem) => {
    setEditingReward(reward);
    setFormData({
      name: reward.name,
      description: reward.description,
      pointsRequired: reward.pointsRequired,
      stock: reward.stock,
      category: reward.category,
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = async (reward: RewardItem) => {
    if (!token) return;
    if (!confirm(`Yakin ingin menonaktifkan ${reward.name}?`)) return;

    try {
      await deleteReward(token, reward.id);
      toast.success('Barang berhasil dinonaktifkan');
      await loadRewards();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus barang.');
    }
  };

  const handleSubmit = async () => {
    if (!token) return;

    if (!formData.name.trim()) {
      toast.error('Nama barang harus diisi');
      return;
    }
    if (formData.pointsRequired <= 0) {
      toast.error('Poin harus lebih dari 0');
      return;
    }
    if (formData.stock < 0) {
      toast.error('Stok tidak boleh negatif');
      return;
    }

    setSubmitting(true);
    try {
      if (editingReward) {
        await updateReward(token, editingReward.id, formData);
        toast.success('Barang berhasil diperbarui');
      } else {
        await createReward(token, formData);
        toast.success('Barang berhasil ditambahkan');
      }

      setIsDialogOpen(false);
      await loadRewards();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan barang.');
    } finally {
      setSubmitting(false);
    }
  };

  const categories = ['Peralatan', 'Voucher', 'Tanaman', 'Pupuk', 'Lainnya'];

  const activeRewards = useMemo(
    () => rewards.filter((reward) => reward.isActive !== false),
    [rewards]
  );

  const totalItems = activeRewards.length;
  const totalStock = activeRewards.reduce((sum, reward) => sum + reward.stock, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-24 pb-12 container mx-auto px-4 md:px-0">
        <div className="max-w-7xl mx-auto px-4 md:px-0">
          <div className="mb-8 text-center md:text-left">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Kelola Barang Hadiah</h1>
                  <p className="text-gray-600">Atur katalog barang yang dapat ditukar dengan poin</p>
                </div>
              </div>
              <Button className="w-full sm:w-auto" onClick={handleAddClick}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Barang
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Jenis Barang</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{totalItems}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Stok</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-blue-600" />
                    <p className="text-2xl font-bold text-gray-900 sm:text-3xl">{totalStock}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-gray-900 sm:text-3xl">
                    {new Set(activeRewards.map((reward) => reward.category)).size}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="hidden md:block overflow-x-auto">
                <div className="min-w-[800px]">
                  <Table>
                    <TableHeader>
                  <TableRow>
                    <TableHead>Nama Barang</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Poin</TableHead>
                    <TableHead>Stok</TableHead>
                    <TableHead>Deskripsi</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Memuat katalog hadiah...
                      </TableCell>
                    </TableRow>
                  ) : activeRewards.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Belum ada barang.
                      </TableCell>
                    </TableRow>
                  ) : (
                    activeRewards.map((reward) => (
                      <TableRow key={reward.id}>
                        <TableCell className="font-medium">{reward.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{reward.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Coins className="w-4 h-4 text-yellow-500" />
                            <span className="font-semibold">{reward.pointsRequired.toLocaleString('id-ID')}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={reward.stock < 10 ? 'destructive' : 'default'}>
                            {reward.stock}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{reward.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditClick(reward)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteClick(reward)}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                </Table>
                </div>
                </div>              <div className="space-y-4 p-4 md:hidden">
                {loading ? (
                  <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                    Memuat katalog hadiah...
                  </div>
                ) : activeRewards.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                    Belum ada barang.
                  </div>
                ) : (
                  activeRewards.map((reward) => (
                    <div key={reward.id} className="rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900">{reward.name}</div>
                          <div className="mt-1">
                            <Badge variant="outline">{reward.category}</Badge>
                          </div>
                        </div>
                        <Badge variant={reward.stock < 10 ? 'destructive' : 'default'}>
                          Stok {reward.stock}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-yellow-500" />
                          <span className="font-semibold text-gray-900">{reward.pointsRequired.toLocaleString('id-ID')} poin</span>
                        </div>
                        <p>{reward.description || 'Tidak ada deskripsi.'}</p>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEditClick(reward)}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDeleteClick(reward)}>
                          <Trash2 className="mr-2 h-4 w-4 text-red-600" />
                          Hapus
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingReward ? 'Edit Barang' : 'Tambah Barang Baru'}</DialogTitle>
            <DialogDescription>
              {editingReward ? 'Perbarui informasi barang' : 'Tambahkan barang baru ke katalog'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Nama Barang *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Tumbler Stainless"
              />
            </div>

            <div>
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="points">Poin yang Dibutuhkan *</Label>
              <Input
                id="points"
                type="number"
                min={0}
                value={formData.pointsRequired}
                onChange={(e) =>
                  setFormData({ ...formData, pointsRequired: parseInt(e.target.value, 10) || 0 })
                }
                placeholder="50000"
              />
            </div>

            <div>
              <Label htmlFor="stock">Stok *</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value, 10) || 0 })
                }
                placeholder="15"
              />
            </div>

            <div>
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Deskripsi singkat tentang barang"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter className="flex-col gap-3 sm:flex-row">
            <Button variant="outline" className="w-full sm:w-auto" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button className="w-full sm:w-auto" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Menyimpan...' : editingReward ? 'Perbarui' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
