import { useState, useEffect } from 'react';
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

interface RewardItem {
  id: number;
  name: string;
  description: string;
  pointsRequired: number;
  stock: number;
  category: string;
}

type FormData = Omit<RewardItem, 'id'>;

export default function AdminRewardsPage() {
  const [rewards, setRewards] = useState<RewardItem[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    pointsRequired: 0,
    stock: 0,
    category: 'Peralatan',
  });

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

  const handleDeleteClick = (reward: RewardItem) => {
    if (confirm(`Yakin ingin menghapus ${reward.name}?`)) {
      setRewards(rewards.filter((r) => r.id !== reward.id));
      toast.success('Barang berhasil dihapus');
    }
  };

  const handleSubmit = () => {
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

    if (editingReward) {
      // Update existing reward
      setRewards(
        rewards.map((r) =>
          r.id === editingReward.id ? { ...formData, id: r.id } : r
        )
      );
      toast.success('Barang berhasil diperbarui');
    } else {
      // Add new reward
      const newReward: RewardItem = {
        ...formData,
        id: Math.max(0, ...rewards.map((r) => r.id)) + 1,
      };
      setRewards([...rewards, newReward]);
      toast.success('Barang berhasil ditambahkan');
    }

    setIsDialogOpen(false);
  };

  const categories = ['Peralatan', 'Voucher', 'Tanaman', 'Pupuk', 'Lainnya'];

  const totalItems = rewards.length;
  const totalStock = rewards.reduce((sum, r) => sum + r.stock, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Gift className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Kelola Barang Hadiah</h1>
                  <p className="text-gray-600">Atur katalog barang yang dapat ditukar dengan poin</p>
                </div>
              </div>
              <Button onClick={handleAddClick}>
                <Plus className="w-4 h-4 mr-2" />
                Tambah Barang
              </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Jenis Barang</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Gift className="w-5 h-5 text-green-600" />
                    <p className="text-3xl font-bold text-gray-900">{totalItems}</p>
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
                    <p className="text-3xl font-bold text-gray-900">{totalStock}</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-600">Kategori</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold text-gray-900">
                    {new Set(rewards.map((r) => r.category)).size}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Rewards Table */}
          <Card>
            <CardContent className="p-0">
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
                  {rewards.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                        Belum ada barang. Klik tombol "Tambah Barang" untuk menambahkan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    rewards.map((reward) => (
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
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingReward ? 'Edit Barang' : 'Tambah Barang Baru'}</DialogTitle>
            <DialogDescription>
              {editingReward ? 'Perbarui informasi barang' : 'Tambahkan barang baru ke katalog'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div>
              <Label htmlFor="name">Nama Barang *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Contoh: Tumbler Stainless"
              />
            </div>

            {/* Category */}
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
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Points Required */}
            <div>
              <Label htmlFor="points">Poin yang Dibutuhkan *</Label>
              <Input
                id="points"
                type="number"
                min={0}
                value={formData.pointsRequired}
                onChange={(e) =>
                  setFormData({ ...formData, pointsRequired: parseInt(e.target.value) || 0 })
                }
                placeholder="50000"
              />
            </div>

            {/* Stock */}
            <div>
              <Label htmlFor="stock">Stok *</Label>
              <Input
                id="stock"
                type="number"
                min={0}
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                }
                placeholder="15"
              />
            </div>

            {/* Description */}
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleSubmit}>
              {editingReward ? 'Perbarui' : 'Tambah'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
