import { useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Calendar, Clock, MapPin, Package, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import {
  createPickupRequest,
  fetchSchedules,
  fetchWasteTypes,
  type ScheduleItem,
  type WasteTypeOption,
} from '../lib/milosApi';

const dayNameFormatter = new Intl.DateTimeFormat('id-ID', { weekday: 'long' });

const normalizeDayName = (value: string) => {
  const normalized = value.toLowerCase();
  const mapping: Record<string, string> = {
    minggu: 'minggu',
    senin: 'senin',
    selasa: 'selasa',
    rabu: 'rabu',
    kamis: 'kamis',
    jumat: 'jumat',
    "jum'at": 'jumat',
    sabtu: 'sabtu',
  };

  return mapping[normalized] || normalized;
};

export default function PickupPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loadingWasteTypes, setLoadingWasteTypes] = useState(true);
  const [loadingSchedules, setLoadingSchedules] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [wasteTypes, setWasteTypes] = useState<WasteTypeOption[]>([]);
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [formData, setFormData] = useState({
    wasteType: '',
    estimatedWeight: '',
    pickupDate: '',
    scheduleId: '',
    address: user?.address || '',
    notes: '',
  });

  useEffect(() => {
    let isMounted = true;

    const loadWasteTypes = async () => {
      try {
        const data = await fetchWasteTypes();
        if (isMounted) {
          setWasteTypes(data);
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat jenis sampah.');
      } finally {
        if (isMounted) {
          setLoadingWasteTypes(false);
        }
      }
    };

    const loadSchedules = async () => {
      try {
        const data = await fetchSchedules();
        if (isMounted) {
          setSchedules(data.filter((schedule) => schedule.is_aktif === 1));
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat jadwal pickup.');
      } finally {
        if (isMounted) {
          setLoadingSchedules(false);
        }
      }
    };

    loadWasteTypes();
    loadSchedules();

    return () => {
      isMounted = false;
    };
  }, []);

  const selectedSchedule = useMemo(
    () => schedules.find((schedule) => String(schedule.id_jadwal) === formData.scheduleId) || null,
    [formData.scheduleId, schedules]
  );

  const selectedWaste = useMemo(
    () => wasteTypes.find((item) => item.id === formData.wasteType) || null,
    [formData.wasteType, wasteTypes]
  );

  const pickupDayName = useMemo(() => {
    if (!formData.pickupDate) return '';
    return normalizeDayName(dayNameFormatter.format(new Date(formData.pickupDate)));
  }, [formData.pickupDate]);

  const scheduleOptions = useMemo(() => {
    if (!pickupDayName) return [];
    return schedules.filter((schedule) => normalizeDayName(schedule.hari) === pickupDayName);
  }, [pickupDayName, schedules]);

  useEffect(() => {
    if (!formData.scheduleId) return;

    const isStillValid = scheduleOptions.some(
      (schedule) => String(schedule.id_jadwal) === formData.scheduleId
    );

    if (!isStillValid) {
      setFormData((prev) => ({
        ...prev,
        scheduleId: '',
      }));
    }
  }, [formData.scheduleId, scheduleOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user) {
      toast.error('Sesi login tidak ditemukan. Silakan masuk ulang.');
      return;
    }

    if (Number(formData.estimatedWeight) < 2) {
      toast.error('Minimum berat pickup adalah 2 kg.');
      return;
    }

    if (!formData.scheduleId || !selectedSchedule) {
      toast.error('Pilih jadwal pickup yang tersedia.');
      return;
    }

    if (pickupDayName !== normalizeDayName(selectedSchedule.hari)) {
      toast.error('Tanggal pickup harus sesuai dengan hari jadwal yang dipilih.');
      return;
    }

    setSubmitting(true);
    try {
      await createPickupRequest({
        token,
        userId: user.id,
        scheduleId: formData.scheduleId,
        wasteType: selectedWaste?.label || formData.wasteType,
        estimatedWeight: Number(formData.estimatedWeight),
        pickupDate: formData.pickupDate,
        timeSlot: String(selectedSchedule.jam).slice(0, 5),
        address: formData.address,
        notes: formData.notes,
      });

      setSubmitted(true);
      toast.success('Permintaan pickup berhasil diajukan.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengajukan pickup.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardNavbar />
        <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-12 pb-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Permintaan Pickup Berhasil</h2>
                <p className="text-gray-600 mb-6">
                  Permintaan pickup Anda telah dikirim dan akan diproses admin.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 text-left">
                  <h3 className="font-semibold text-gray-900 mb-3">Detail Pickup</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex gap-2">
                      <Package className="w-4 h-4 mt-0.5" />
                      <span>Jenis: {selectedWaste?.label}</span>
                    </div>
                    <div className="flex gap-2">
                      <Calendar className="w-4 h-4 mt-0.5" />
                      <span>
                        Tanggal: {new Date(formData.pickupDate).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Clock className="w-4 h-4 mt-0.5" />
                      <span>Waktu: {selectedSchedule ? String(selectedSchedule.jam).slice(0, 5) : '-'} WIB</span>
                    </div>
                    <div className="flex gap-2">
                      <MapPin className="w-4 h-4 mt-0.5" />
                      <span>Wilayah jadwal: {selectedSchedule?.wilayah || '-'}</span>
                    </div>
                  </div>
                </div>
                <Button className="bg-green-600 hover:bg-green-700" onClick={() => navigate('/dashboard')}>
                  Kembali ke Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNavbar />

      <div className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Ajukan Pickup</h1>
            <p className="text-gray-600 mt-2">
              Pilih tanggal sesuai hari layanan dan gunakan jadwal pickup yang sudah diatur admin.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Formulir Pickup</CardTitle>
                <CardDescription>Pastikan tanggal pickup sesuai jadwal admin yang tersedia.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="wasteType">Jenis Sampah *</Label>
                    <Select
                      value={formData.wasteType}
                      onValueChange={(value) => handleChange('wasteType', value)}
                      disabled={loadingWasteTypes}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={loadingWasteTypes ? 'Memuat jenis sampah...' : 'Pilih jenis sampah'} />
                      </SelectTrigger>
                      <SelectContent>
                        {wasteTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estimatedWeight">Estimasi Berat (kg) *</Label>
                      <Input
                        id="estimatedWeight"
                        type="number"
                        step="0.1"
                        min="2"
                        placeholder="Contoh: 5.5"
                        value={formData.estimatedWeight}
                        onChange={(e) => handleChange('estimatedWeight', e.target.value)}
                        required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="pickupDate">Tanggal Pickup *</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="pickupDate"
                        type="date"
                        className="pl-10"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.pickupDate}
                        onChange={(e) => handleChange('pickupDate', e.target.value)}
                        required
                      />
                    </div>
                    {formData.pickupDate && (
                      <p className="text-xs text-gray-500">
                        Hari terpilih: <span className="font-medium capitalize">{dayNameFormatter.format(new Date(formData.pickupDate))}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="scheduleId">Jadwal Admin *</Label>
                    <Select
                      value={formData.scheduleId}
                      onValueChange={(value) => handleChange('scheduleId', value)}
                      disabled={loadingSchedules || !formData.pickupDate}
                    >
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            !formData.pickupDate
                              ? 'Pilih tanggal dulu'
                              : loadingSchedules
                              ? 'Memuat jadwal...'
                              : scheduleOptions.length === 0
                              ? 'Tidak ada jadwal aktif untuk hari ini'
                              : 'Pilih jadwal pickup'
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {scheduleOptions.map((schedule) => (
                          <SelectItem key={schedule.id_jadwal} value={String(schedule.id_jadwal)}>
                            {schedule.wilayah} - {schedule.hari} - {String(schedule.jam).slice(0, 5)} WIB
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedSchedule && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-900">
                      <div className="font-semibold mb-2">Jadwal yang dipilih</div>
                      <div>Wilayah: {selectedSchedule.wilayah}</div>
                      <div>Hari: {selectedSchedule.hari}</div>
                      <div>Jam: {String(selectedSchedule.jam).slice(0, 5)} WIB</div>
                      {selectedSchedule.keterangan && (
                        <div>Keterangan: {selectedSchedule.keterangan}</div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="address">Alamat Pickup *</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Textarea
                        id="address"
                        className="pl-10 min-h-24"
                        placeholder="Alamat lengkap untuk pickup"
                        value={formData.address}
                        onChange={(e) => handleChange('address', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan Tambahan (Opsional)</Label>
                    <Textarea
                      id="notes"
                      className="min-h-20"
                      placeholder="Informasi tambahan seperti patokan lokasi atau kondisi sampah"
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={submitting}>
                      {submitting ? 'Mengirim...' : 'Ajukan Pickup'}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informasi Penting</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Sumber Jadwal</h4>
                    <p className="text-gray-600">Jadwal pickup mengikuti data aktif yang diatur pengurus di sistem.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Pilih Tanggal Dulu</h4>
                    <p className="text-gray-600">Setelah memilih tanggal, sistem hanya menampilkan jadwal dengan hari yang cocok.</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Minimum Berat</h4>
                    <p className="text-gray-600">Minimum 2 kg untuk layanan pickup gratis.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
