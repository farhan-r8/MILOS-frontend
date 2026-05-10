import { useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../components/ui/dialog';
import { Recycle, Plus, Edit, Trash2, Award } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import {
  createAdminWasteType,
  deleteAdminWasteType,
  fetchAdminWasteTypes,
  updateAdminWasteType,
  type AdminWasteTypeItem,
} from '../../lib/milosApi';

export default function WasteTypesPage() {
  const { token } = useAuth();
  const [wasteTypes, setWasteTypes] = useState<AdminWasteTypeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWasteType, setEditingWasteType] = useState<AdminWasteTypeItem | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    satuan: 'kg',
    poinPerSatuan: '',
  });

  const loadWasteTypes = async () => {
    if (!token) return;
    try {
      const data = await fetchAdminWasteTypes(token);
      setWasteTypes(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat jenis sampah.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWasteTypes();
  }, [token]);

  const stats = useMemo(() => ({
    total: wasteTypes.length,
    active: wasteTypes.filter((item) => item.isAktif).length,
    average: wasteTypes.length > 0
      ? Math.round(wasteTypes.reduce((sum, item) => sum + item.poinPerSatuan, 0) / wasteTypes.length)
      : 0,
  }), [wasteTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingWasteType) {
        await updateAdminWasteType(token, editingWasteType.id, {
          nama: formData.nama,
          satuan: formData.satuan,
          poinPerSatuan: Number(formData.poinPerSatuan),
        });
        toast.success('Jenis sampah berhasil diperbarui.');
      } else {
        await createAdminWasteType(token, {
          nama: formData.nama,
          satuan: formData.satuan,
          poinPerSatuan: Number(formData.poinPerSatuan),
        });
        toast.success('Jenis sampah berhasil ditambahkan.');
      }

      setIsDialogOpen(false);
      resetForm();
      loadWasteTypes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan jenis sampah.');
    }
  };

  const handleEdit = (wasteType: AdminWasteTypeItem) => {
    setEditingWasteType(wasteType);
    setFormData({
      nama: wasteType.nama,
      satuan: wasteType.satuan,
      poinPerSatuan: String(wasteType.poinPerSatuan),
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Apakah Anda yakin ingin menghapus jenis sampah ini?')) return;
    try {
      await deleteAdminWasteType(token, id);
      toast.success('Jenis sampah berhasil dihapus.');
      loadWasteTypes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus jenis sampah.');
    }
  };

  const toggleStatus = async (wasteType: AdminWasteTypeItem) => {
    if (!token) return;
    try {
      await updateAdminWasteType(token, wasteType.id, {
        isAktif: !wasteType.isAktif,
      });
      toast.success('Status jenis sampah berhasil diubah.');
      loadWasteTypes();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengubah status.');
    }
  };

  const resetForm = () => {
    setFormData({
      nama: '',
      satuan: 'kg',
      poinPerSatuan: '',
    });
    setEditingWasteType(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-24 pb-12 container mx-auto px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center md:text-left">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Kelola Jenis Sampah</h1>
            <p className="text-gray-600 mt-2">Atur jenis sampah dan poin per satuan dari backend.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Jenis</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl">{stats.total}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Jenis Aktif</CardDescription>
                <CardTitle className="text-2xl text-green-600 sm:text-3xl">{stats.active}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Jenis Nonaktif</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl">{stats.total - stats.active}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardDescription className="text-green-700">Rata-rata Poin</CardDescription>
                <CardTitle className="text-2xl text-green-600 sm:text-3xl">{stats.average.toLocaleString()}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Daftar Jenis Sampah</CardTitle>
                  <CardDescription>Data asli jenis sampah yang tersimpan.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-green-600 hover:bg-green-700 sm:w-auto" onClick={resetForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Jenis Sampah
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
                    <form onSubmit={handleSubmit}>
                      <DialogHeader>
                        <DialogTitle>{editingWasteType ? 'Edit Jenis Sampah' : 'Tambah Jenis Sampah Baru'}</DialogTitle>
                        <DialogDescription>Isi nama, satuan, dan poin per satuan.</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="nama">Nama Jenis Sampah</Label>
                          <Input
                            id="nama"
                            value={formData.nama}
                            onChange={(e) => setFormData((prev) => ({ ...prev, nama: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="satuan">Satuan</Label>
                          <Input
                            id="satuan"
                            value={formData.satuan}
                            onChange={(e) => setFormData((prev) => ({ ...prev, satuan: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="poinPerSatuan">Poin per Satuan</Label>
                          <Input
                            id="poinPerSatuan"
                            type="number"
                            min="0"
                            value={formData.poinPerSatuan}
                            onChange={(e) => setFormData((prev) => ({ ...prev, poinPerSatuan: e.target.value }))}
                            required
                          />
                        </div>
                      </div>

                      <DialogFooter className="flex-col gap-3 sm:flex-row">
                        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setIsDialogOpen(false)}>
                          Batal
                        </Button>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 sm:w-auto">
                          {editingWasteType ? 'Simpan Perubahan' : 'Tambah Jenis Sampah'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nama</TableHead>
                      <TableHead>Satuan</TableHead>
                      <TableHead>Poin</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                          Memuat jenis sampah...
                        </TableCell>
                      </TableRow>
                    ) : wasteTypes.map((wasteType) => (
                      <TableRow key={wasteType.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Recycle className="w-4 h-4 text-green-600" />
                            <span className="font-medium">{wasteType.nama}</span>
                          </div>
                        </TableCell>
                        <TableCell>{wasteType.satuan}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Award className="w-4 h-4 text-green-600" />
                            <span className="font-semibold text-green-600">
                              {wasteType.poinPerSatuan.toLocaleString()}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={
                              wasteType.isAktif
                                ? 'bg-green-100 text-green-700 border-green-200 cursor-pointer'
                                : 'bg-gray-100 text-gray-700 border-gray-200 cursor-pointer'
                            }
                            onClick={() => toggleStatus(wasteType)}
                          >
                            {wasteType.isAktif ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(wasteType)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(wasteType.id)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-4 p-4 md:hidden">
                {loading ? (
                  <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                    Memuat jenis sampah...
                  </div>
                ) : wasteTypes.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                    Belum ada jenis sampah.
                  </div>
                ) : (
                  wasteTypes.map((wasteType) => (
                    <div key={wasteType.id} className="rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 font-semibold text-gray-900">
                            <Recycle className="h-4 w-4 shrink-0 text-green-600" />
                            <span className="truncate">{wasteType.nama}</span>
                          </div>
                          <div className="mt-1 text-sm text-gray-600">Satuan: {wasteType.satuan}</div>
                        </div>
                        <Badge
                          className={
                            wasteType.isAktif
                              ? 'bg-green-100 text-green-700 border-green-200 cursor-pointer'
                              : 'bg-gray-100 text-gray-700 border-gray-200 cursor-pointer'
                          }
                          onClick={() => toggleStatus(wasteType)}
                        >
                          {wasteType.isAktif ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Award className="h-4 w-4 text-green-600" />
                        <span className="font-semibold text-green-600">{wasteType.poinPerSatuan.toLocaleString()} poin/{wasteType.satuan}</span>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Button variant="ghost" size="sm" className="flex-1 border" onClick={() => handleEdit(wasteType)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="flex-1 border" onClick={() => handleDelete(wasteType.id)}>
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
    </div>
  );
}
