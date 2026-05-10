import { useEffect, useMemo, useState } from 'react';
import { DashboardNavbar } from '../components/DashboardNavbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Package, Award, CheckCircle2, Info, HelpCircle, ListChecks } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { createSellTransaction, fetchWasteTypes, type WasteTypeOption } from '../lib/milosApi';

export default function SellTransactionPage() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [loadingWasteTypes, setLoadingWasteTypes] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [wasteTypes, setWasteTypes] = useState<WasteTypeOption[]>([]);
  const [successData, setSuccessData] = useState<{
    wasteType: string;
    weight: number;
    points: number;
    pointsPerKg: number;
  } | null>(null);
  const [formData, setFormData] = useState({
    wasteType: '',
    weight: '',
    condition: 'Bersih & Kering (Poin 100%)',
  });

  useEffect(() => {
    let isMounted = true;
    const loadWasteTypes = async () => {
      try {
        const data = await fetchWasteTypes();
        if (isMounted) setWasteTypes(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Gagal memuat jenis sampah.');
      } finally {
        if (isMounted) setLoadingWasteTypes(false);
      }
    };
    loadWasteTypes();
    return () => { isMounted = false; };
  }, []);

  const selectedWaste = useMemo(
    () => wasteTypes.find((item) => item.id === formData.wasteType),
    [formData.wasteType, wasteTypes]
  );

  const estimatedPoints = useMemo(() => {
    if (!selectedWaste || !formData.weight) return 0;
    const basePoints = selectedWaste.pointsPerKg * Number(formData.weight);
    return formData.condition.includes('40%') ? basePoints * 0.6 : basePoints;
  }, [selectedWaste, formData.weight, formData.condition]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) {
      toast.error('Sesi login tidak ditemukan. Silakan masuk ulang.');
      return;
    }
    if (wasteTypes.length === 0) {
      toast.error('Belum ada jenis sampah yang tersedia.');
      return;
    }
    if (!formData.wasteType || !formData.weight) {
      toast.error('Lengkapi data terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createSellTransaction({
        token,
        userId: user.id,
        wasteTypeId: formData.wasteType,
        weight: Number(formData.weight),
        notes: `Kondisi: ${formData.condition}`,
      });

      setSuccessData({
        wasteType: result.wasteType,
        weight: Number(formData.weight),
        points: result.points,
        pointsPerKg: result.pointsPerKg,
      });
      setSubmitted(true);
      toast.success('Berhasil diajukan!');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengajukan transaksi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (submitted && successData) {
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
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Pencatatan Berhasil</h2>
                <p className="text-gray-500 mb-10">Data Anda sedang menunggu verifikasi admin.</p>
                
                <div className="bg-gray-50 rounded-3xl p-6 mb-10 text-left">
                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div>
                      <p className="text-gray-400 mb-1 uppercase text-[10px] font-bold tracking-wider">Jenis</p>
                      <p className="font-semibold text-gray-900">{successData.wasteType}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1 uppercase text-[10px] font-bold tracking-wider">Berat</p>
                      <p className="font-semibold text-gray-900">{successData.weight} kg</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1 uppercase text-[10px] font-bold tracking-wider">Poin/kg</p>
                      <p className="font-semibold text-gray-900">{successData.pointsPerKg.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 mb-1 uppercase text-[10px] font-bold tracking-wider">Estimasi Total</p>
                      <p className="font-bold text-green-600">{successData.points.toLocaleString()} Poin</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Jual Sampah</h1>
            <p className="text-gray-500 mt-2">Dapatkan poin dari setiap sampah yang Anda tabung.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-none shadow-sm rounded-3xl bg-white p-2 sm:p-6">
                <CardContent className="pt-4">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="wasteType" className="text-gray-600 font-semibold">Jenis Sampah</Label>
                      <Select
                        value={formData.wasteType}
                        onValueChange={(value) => handleChange('wasteType', value)}
                        disabled={loadingWasteTypes || wasteTypes.length === 0}
                      >
                        <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50">
                          <SelectValue placeholder={loadingWasteTypes ? 'Memuat...' : 'Pilih jenis sampah'} />
                        </SelectTrigger>
                        <SelectContent>
                          {wasteTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id}>
                              {type.label} • {type.pointsPerKg.toLocaleString()} poin/{type.unit}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="weight" className="text-gray-600 font-semibold">Berat (kg)</Label>
                        <Input
                          id="weight"
                          type="number"
                          step="0.1"
                          min="0.1"
                          className="h-12 rounded-xl border-gray-100 bg-gray-50/50"
                          placeholder="0.0"
                          value={formData.weight}
                          onChange={(e) => handleChange('weight', e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="condition" className="text-gray-600 font-semibold">Kondisi</Label>
                        <Select
                          value={formData.condition}
                          onValueChange={(value) => handleChange('condition', value)}
                        >
                          <SelectTrigger className="h-12 rounded-xl border-gray-100 bg-gray-50/50">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Bersih & Kering (Poin 100%)">Bersih (100%)</SelectItem>
                            <SelectItem value="Kotor/Basah (Potongan Poin 40%)">Basah (-40%)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {selectedWaste && formData.weight && (
                      <div className="bg-green-50/50 border border-green-100 rounded-2xl p-6 text-center">
                        <p className="text-xs text-green-600 uppercase font-bold tracking-widest mb-1">Estimasi Perolehan</p>
                        <p className="text-4xl font-black text-green-700">{estimatedPoints.toLocaleString()}</p>
                        <p className="text-xs text-green-600/70 mt-1">POIN</p>
                      </div>
                    )}

                    <div className="pt-6 border-t border-gray-50">
                      <Button
                        type="submit"
                        className="w-full h-12 bg-green-600 hover:bg-green-700 rounded-xl font-bold shadow-lg shadow-green-100"
                        disabled={submitting || wasteTypes.length === 0}
                      >
                        <Package className="w-4 h-4 mr-2" />
                        {submitting ? 'Memproses...' : 'Ajukan Transaksi'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              <div className="bg-white rounded-3xl p-6 shadow-sm flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
                  <Info className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900">Petunjuk Setor</h4>
                  <p className="text-sm text-gray-500 leading-relaxed mt-1">
                    Pastikan sampah sudah dipilah dan dalam kondisi layak. Petugas akan memverifikasi berat dan kondisi saat penyerahan fisik.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                <CardHeader className="bg-gray-50/50 border-b border-gray-50">
                  <CardTitle className="text-lg">Daftar Harga</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-50">
                    {wasteTypes.map((type) => (
                      <div key={type.id} className="p-4 flex items-center justify-between">
                        <span className="text-sm text-gray-600">{type.label}</span>
                        <span className="font-bold text-green-600">{type.pointsPerKg.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">pts</span></span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-3xl bg-white overflow-hidden">
                <CardHeader className="bg-emerald-50 border-b border-emerald-100">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-emerald-600" />
                    Ketentuan
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs text-gray-500">
                  <div>
                    <p className="font-bold text-gray-700 mb-1">Cakupan Area</p>
                    <p>Hanya melayani wilayah Desa Sidamulih.</p>
                  </div>
                  <div>
                    <p className="font-bold text-gray-700 mb-1">Verifikasi Poin</p>
                    <p>Poin otomatis masuk ke saldo setelah diverifikasi oleh petugas Bank Sampah.</p>
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
