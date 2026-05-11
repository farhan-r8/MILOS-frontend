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
import { SERVICE_CAMPAIGNS, SERVICE_COVERAGE_LABEL, SERVICE_VILLAGE } from '../../lib/serviceArea';

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

    // Frontend Validation: check duplicates in local state
    const isDuplicate = schedules.some((s) => {
      // If editing, skip the current record
      if (editingSchedule && s.id_jadwal === editingSchedule.id_jadwal) return false;

      // Check for same wilayah, hari, and jam (ignoring seconds if present)
      const existingJam = String(s.jam).slice(0, 5);
      const inputJam = String(formData.jam).slice(0, 5);

      return (
        s.wilayah.toLowerCase() === formData.wilayah.toLowerCase() &&
        s.hari === formData.hari &&
        existingJam === inputJam
      );
    });

    if (isDuplicate) {
      toast.error('Jadwal di wilayah ini pada jam tersebut sudah ada');
      return;
    }

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

      <div className="pt-24 pb-12 container mx-auto px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center md:text-left">
            <div className="flex flex-col items-center md:items-start md:flex-row gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Kelola Jadwal Pengambilan</h1>
                <p className="text-gray-600 mt-2">Atur jadwal pengambilan sampah per wilayah untuk area {SERVICE_COVERAGE_LABEL}.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Total Jadwal</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl">{schedules.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Jadwal Aktif</CardDescription>
                <CardTitle className="text-2xl text-green-600 sm:text-3xl">
                  {schedules.filter((item) => item.is_aktif === 1).length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardDescription>Wilayah Terlayani</CardDescription>
                <CardTitle className="text-2xl sm:text-3xl">{new Set(schedules.map((item) => item.wilayah)).size}</CardTitle>
              </CardHeader>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="pb-3">
                <CardDescription className="text-green-700">Hari Tersedia</CardDescription>
                <CardTitle className="text-2xl text-green-600 sm:text-3xl">{daysOfWeek.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <CardTitle>Daftar Jadwal</CardTitle>
                  <CardDescription>Data jadwal pengambilan dari backend.</CardDescription>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full bg-green-600 hover:bg-green-700 sm:w-auto" onClick={resetForm}>
                      <Plus className="w-4 h-4 mr-2" />
                      Tambah Jadwal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
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

                      <DialogFooter className="flex-col gap-3 sm:flex-row">
                        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setIsDialogOpen(false)}>
                          Batal
                        </Button>
                        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700 sm:w-auto">
                          {editingSchedule ? 'Simpan Perubahan' : 'Tambah Jadwal'}
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
              <div className="space-y-4 p-4 md:hidden">
                {loading ? (
                  <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                    Memuat jadwal...
                  </div>
                ) : schedules.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                    Belum ada jadwal.
                  </div>
                ) : (
                  schedules.map((schedule) => (
                    <div key={schedule.id_jadwal} className="rounded-xl border border-gray-200 p-4 shadow-sm">
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 font-semibold text-gray-900">
                            <MapPin className="h-4 w-4 shrink-0 text-gray-400" />
                            <span className="truncate">{schedule.wilayah}</span>
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-gray-600">
                            <span className="inline-flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {schedule.hari}
                            </span>
                            <span className="inline-flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {String(schedule.jam).slice(0, 5)} WIB
                            </span>
                          </div>
                        </div>
                        <Badge className={schedule.is_aktif === 1 ? 'bg-green-100 text-green-700 border-green-200' : 'bg-gray-100 text-gray-700 border-gray-200'}>
                          {schedule.is_aktif === 1 ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">{schedule.keterangan || 'Tidak ada keterangan.'}</p>
                      <div className="mt-4 flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleEdit(schedule)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => handleDelete(schedule.id_jadwal)}>
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
