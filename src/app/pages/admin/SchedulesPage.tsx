import { useEffect, useState } from 'react';
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
import { Calendar, Clock, MapPin, Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import {
  createSchedule,
  deleteSchedule,
  fetchSchedules,
  updateSchedule,
  type ScheduleItem,
} from '../../lib/milosApi';

const daysOfWeek = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

export default function SchedulesPage() {
  const { token } = useAuth();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [formData, setFormData] = useState({
    wilayah: '',
    hari: '',
    jam: '',
    keterangan: '',
  });

  const loadSchedules = async () => {
    try {
      const data = await fetchSchedules();
      setSchedules(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memuat jadwal.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSchedules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      if (editingSchedule) {
        await updateSchedule(token, editingSchedule.id_jadwal, formData);
        toast.success('Jadwal berhasil diperbarui.');
      } else {
        await createSchedule(token, formData);
        toast.success('Jadwal berhasil ditambahkan.');
      }

      setIsDialogOpen(false);
      resetForm();
      loadSchedules();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menyimpan jadwal.');
    }
  };

  const handleEdit = (schedule: ScheduleItem) => {
    setEditingSchedule(schedule);
    setFormData({
      wilayah: schedule.wilayah,
      hari: schedule.hari,
      jam: String(schedule.jam).slice(0, 5),
      keterangan: schedule.keterangan || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (!token || !confirm('Apakah Anda yakin ingin menghapus jadwal ini?')) return;
    try {
      await deleteSchedule(token, id);
      toast.success('Jadwal berhasil dihapus.');
      loadSchedules();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus jadwal.');
    }
  };

  const resetForm = () => {
    setFormData({
      wilayah: '',
      hari: '',
      jam: '',
      keterangan: '',
    });
    setEditingSchedule(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Kelola Jadwal Pengambilan</h1>
            <p className="text-gray-600 mt-2">Atur jadwal pengambilan sampah per wilayah.</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Jadwal</CardDescription>
                <CardTitle className="text-3xl">{schedules.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Jadwal Aktif</CardDescription>
                <CardTitle className="text-3xl text-green-600">
                  {schedules.filter((item) => item.is_aktif === 1).length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Wilayah Terlayani</CardDescription>
                <CardTitle className="text-3xl">{new Set(schedules.map((item) => item.wilayah)).size}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardDescription className="text-green-700">Hari Tersedia</CardDescription>
                <CardTitle className="text-3xl text-green-600">{daysOfWeek.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>Daftar Jadwal</CardTitle>
                  <CardDescription>Data jadwal pengambilan dari backend.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700" onClick={resetForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Jadwal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <form onSubmit={handleSubmit}>
                      <DialogHeader>
                        <DialogTitle>{editingSchedule ? 'Edit Jadwal' : 'Tambah Jadwal Baru'}</DialogTitle>
                        <DialogDescription>Isi wilayah, hari, jam, dan keterangan.</DialogDescription>
                      </DialogHeader>

                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="wilayah">Wilayah</Label>
                          <Input
                            id="wilayah"
                            value={formData.wilayah}
                            onChange={(e) => setFormData((prev) => ({ ...prev, wilayah: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="hari">Hari</Label>
                          <select
                            id="hari"
                            className="w-full h-10 px-3 rounded-md border border-gray-200 bg-white"
                            value={formData.hari}
                            onChange={(e) => setFormData((prev) => ({ ...prev, hari: e.target.value }))}
                            required
                          >
                            <option value="">Pilih hari</option>
                            {daysOfWeek.map((day) => (
                              <option key={day} value={day}>
                                {day}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="jam">Jam</Label>
                          <Input
                            id="jam"
                            type="time"
                            value={formData.jam}
                            onChange={(e) => setFormData((prev) => ({ ...prev, jam: e.target.value }))}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="keterangan">Keterangan</Label>
                          <Input
                            id="keterangan"
                            value={formData.keterangan}
                            onChange={(e) => setFormData((prev) => ({ ...prev, keterangan: e.target.value }))}
                          />
                        </div>
                      </div>

                      <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                          Batal
                        </Button>
                        <Button type="submit" className="bg-green-600 hover:bg-green-700">
                          {editingSchedule ? 'Simpan Perubahan' : 'Tambah Jadwal'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Wilayah</TableHead>
                      <TableHead>Hari</TableHead>
                      <TableHead>Jam</TableHead>
                      <TableHead>Keterangan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                          Memuat jadwal...
                        </TableCell>
                      </TableRow>
                    ) : schedules.map((schedule) => (
                      <TableRow key={schedule.id_jadwal}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{schedule.wilayah}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {schedule.hari}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {String(schedule.jam).slice(0, 5)} WIB
                          </div>
                        </TableCell>
                        <TableCell>{schedule.keterangan || '-'}</TableCell>
                        <TableCell>
                          <Badge className={schedule.is_aktif === 1 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                            {schedule.is_aktif === 1 ? 'Aktif' : 'Nonaktif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => handleEdit(schedule)}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleDelete(schedule.id_jadwal)}>
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
