import { useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Calendar, Clock, Package, CheckCircle2, Info, ListChecks, HelpCircle } from 'lucide-react';
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
import { SERVICE_CAMPAIGNS, SERVICE_COVERAGE_LABEL } from '../lib/serviceArea';

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
    condition: 'Bersih & Kering (Poin 100%)',
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
  const isSundaySelection = pickupDayName === 'minggu';

  const scheduleOptions = useMemo(() => {
    if (!pickupDayName) return [];
    return schedules.filter((schedule) => normalizeDayName(schedule.hari) === pickupDayName);
  }, [pickupDayName, schedules]);

  const availableDaySummaries = useMemo(() => {
    const grouped = new Map<string, Set<string>>();

    schedules.forEach((schedule) => {
      const day = schedule.hari;
      if (!grouped.has(day)) {
        grouped.set(day, new Set());
      }
      grouped.get(day)?.add(schedule.wilayah);
    });

    return Array.from(grouped.entries()).map(([day, areas]) => ({
      day,
      areas: Array.from(areas),
    }));
  }, [schedules]);

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

    if (wasteTypes.length === 0) {
      toast.error('Belum ada jenis sampah yang tersedia. Silakan hubungi admin.');
      return;
    }

    if (Number(formData.estimatedWeight) < 2) {
      toast.error('Minimum berat pickup adalah 2 kg.');
      return;
    }

    if (isSundaySelection) {
      toast.error('Hari Minggu tidak melayani pickup.');
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
        notes: `Kondisi: ${formData.condition}`,
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
      <div className="min-h-screen bg-white">
        <DashboardNavbar />
        <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl mx-auto">
            <Card className="border-none shadow-none text-center">
              <CardContent className="pt-12">
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 className="w-10 h-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Berhasil Terkirim</h2>
                <p className="text-gray-500 mb-10">
                  Permintaan pickup Anda sedang dalam antrean verifikasi admin.
                </p>
                <div className="bg-gray-50 rounded-3xl p-6 mb-10 text-left">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1 uppercase text-[10px] font-bold tracking-wider">Jenis</p>
                      <p className="font-semibold text-gray-900">{selectedWaste?.label}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1 uppercase text-[10px] font-bold tracking-wider">Waktu</p>
                      <p className="font-semibold text-gray-900">{selectedSchedule ? String(selectedSchedule.jam).slice(0, 5) : '-'} WIB</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-400 mb-1 uppercase text-[10px] font-bold tracking-wider">Tanggal</p>
                      <p className="font-semibold text-gray-900">
                        {new Date(formData.pickupDate).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </div>
                <Button className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl font-bold" onClick={() => navigate('/dashboard')}>
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
    <div className="min-h-screen bg-[#F9FAFB]">
      <DashboardNavbar />

      <div className="pt-24 pb-12 container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold text-gray-900">Permintaan Pickup</h1>
            <p className="text-gray-500 mt-2">Atur waktu pengambilan sampah Anda dengan mudah.</p>
          </div>

          <Tabs defaultValue="form" className="w-full">
            <div className="flex justify-center mb-8">
              <TabsList className="bg-white p-1 rounded-2xl border-none shadow-sm">
                <TabsTrigger value="form" className="rounded-xl px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                  <ListChecks className="w-4 h-4 mr-2" />
                  Isi Formulir
                </TabsTrigger>
                <TabsTrigger value="info" className="rounded-xl px-6 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                  <Info className="w-4 h-4 mr-2" />
                  Panduan & Jadwal
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="form">
              <Card className="border-none shadow-sm rounded-3xl bg-white p-2 sm:p-6">
                <CardContent className="pt-4">
                  <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Left Column: Waste Info */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="wasteType" className="text-gray-600 font-semibold">Apa jenis sampahnya?</Label>
                          <Select
                            value={formData.wasteType}
                            onValueChange={(value) => handleChange('wasteType', value)}
                            disabled={loadingWasteTypes || wasteTypes.length === 0}
                          >
                            <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50">
                              <SelectValue placeholder="Pilih jenis sampah" />
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
                          <Label htmlFor="estimatedWeight" className="text-gray-600 font-semibold">Estimasi Berat (kg)</Label>
                          <Input
                            id="estimatedWeight"
                            type="number"
                            step="0.1"
                            min="2"
                            className="h-12 rounded-xl border-gray-100 bg-gray-50/50"
                            placeholder="Min. 2kg"
                            value={formData.estimatedWeight}
                            onChange={(e) => handleChange('estimatedWeight', e.target.value)}
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="condition" className="text-gray-600 font-semibold">Kondisi Sampah</Label>
                          <Select
                            value={formData.condition}
                            onValueChange={(value) => handleChange('condition', value)}
                          >
                            <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Bersih & Kering (Poin 100%)">Bersih & Kering (Poin 100%)</SelectItem>
                              <SelectItem value="Kotor/Basah (Potongan Poin 40%)">Kotor/Basah (40% Off)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Right Column: Schedule & Location */}
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <Label htmlFor="pickupDate" className="text-gray-600 font-semibold">Kapan mau dijemput?</Label>
                          <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                            <Input
                              id="pickupDate"
                              type="date"
                              className="h-12 pl-10 rounded-xl border-gray-100 bg-gray-50/50"
                              min={new Date().toISOString().split('T')[0]}
                              value={formData.pickupDate}
                              onChange={(e) => handleChange('pickupDate', e.target.value)}
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="scheduleId" className="text-gray-600 font-semibold">Pilih Jam Tersedia</Label>
                          <Select
                            value={formData.scheduleId}
                            onValueChange={(value) => handleChange('scheduleId', value)}
                            disabled={loadingSchedules || !formData.pickupDate || isSundaySelection}
                          >
                            <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50">
                              <SelectValue placeholder={!formData.pickupDate ? 'Pilih tanggal dulu' : 'Pilih jadwal'} />
                            </SelectTrigger>
                            <SelectContent>
                              {scheduleOptions.map((schedule) => (
                                <SelectItem key={schedule.id_jadwal} value={String(schedule.id_jadwal)}>
                                  {schedule.wilayah} • {String(schedule.jam).slice(0, 5)} WIB
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50 flex flex-col sm:flex-row gap-3">
                      <Button
                        type="submit"
                        className="flex-1 h-12 bg-green-600 hover:bg-green-700 rounded-xl font-bold shadow-lg shadow-green-100"
                        disabled={submitting || wasteTypes.length === 0}
                      >
                        {submitting ? 'Mengirim...' : 'Kirim Permintaan'}
                      </Button>
                      <Button type="button" variant="ghost" className="h-12 rounded-xl text-gray-400" onClick={() => navigate('/dashboard')}>
                        Batal
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="info">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                  <CardHeader className="bg-green-50/50 border-b border-green-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <HelpCircle className="w-5 h-5 text-green-600" />
                      Informasi Layanan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-5 text-sm">
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Cakupan Area</h4>
                      <p className="text-gray-500 leading-relaxed">Saat ini hanya melayani wilayah {SERVICE_COVERAGE_LABEL}.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Potongan Poin</h4>
                      <p className="text-gray-500 leading-relaxed">Sampah kotor atau basah akan dikenakan potongan 40% dari total poin akhir.</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 mb-1">Minimal Berat</h4>
                      <p className="text-gray-500 leading-relaxed">Layanan pickup gratis tersedia untuk penjemputan minimal 2 kg sampah.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                  <CardHeader className="bg-blue-50/50 border-b border-blue-50">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      Jadwal Tersedia
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-gray-50">
                      {availableDaySummaries.map((item) => (
                        <div key={item.day} className="p-4 flex items-center justify-between">
                          <div>
                            <p className="font-bold text-gray-900">{item.day}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{item.areas.join(', ')}</p>
                          </div>
                          <Clock className="w-4 h-4 text-gray-200" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
