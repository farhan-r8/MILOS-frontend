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
import { Package, Award, CheckCircle2, Info } from 'lucide-react';
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

    loadWasteTypes();
    return () => {
      isMounted = false;
    };
  }, []);

  const selectedWaste = useMemo(
    () => wasteTypes.find((item) => item.id === formData.wasteType),
    [formData.wasteType, wasteTypes]
  );

  const estimatedPoints = selectedWaste && formData.weight
    ? selectedWaste.pointsPerKg * Number(formData.weight)
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token || !user) {
      toast.error('Sesi login tidak ditemukan. Silakan masuk ulang.');
      return;
    }

    if (!formData.wasteType || !formData.weight) {
      toast.error('Lengkapi jenis sampah dan berat terlebih dahulu.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await createSellTransaction({
        token,
        userId: user.id,
        wasteTypeId: formData.wasteType,
        weight: Number(formData.weight),
        notes: formData.notes.trim(),
      });

      setSuccessData({
        wasteType: result.wasteType,
        weight: Number(formData.weight),
        points: result.points,
        pointsPerKg: result.pointsPerKg,
      });
      setSubmitted(true);
      toast.success('Transaksi berhasil diajukan! Menunggu verifikasi pengurus.');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal mengajukan transaksi.');
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

  if (submitted && successData) {
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
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl mb-4">
                  Transaksi Berhasil Diajukan
                </h2>
                <p className="text-gray-600 mb-6">
                  Transaksi penjualan sampah Anda sudah tercatat dan sedang menunggu verifikasi admin.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6 text-left max-w-md mx-auto">
                  <h3 className="font-semibold text-gray-900 mb-4">Detail Transaksi</h3>
                  <div className="space-y-3 text-sm text-gray-600">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>Jenis Sampah:</span>
                      <span className="font-medium text-gray-900">{successData.wasteType}</span>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>Berat:</span>
                      <span className="font-medium text-gray-900">{successData.weight} kg</span>
                    </div>
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span>Harga/kg:</span>
                      <span className="font-medium text-gray-900">
                        {successData.pointsPerKg.toLocaleString()} poin
                      </span>
                    </div>
                    <div className="pt-3 border-t flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                      <span className="font-semibold">Total Poin:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {successData.points.toLocaleString()} poin
                      </span>
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">Jual Sampah</h1>
            <p className="text-gray-600 mt-2">
              Catat transaksi penjualan sampah Anda dan dapatkan poin.
            </p>
            <div className="mt-3 inline-flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg px-4 py-2 text-sm text-green-800">
              <Award className="w-4 h-4" />
              <span className="font-semibold">1.000 poin = Rp 1.000</span>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Form Penjualan Sampah</CardTitle>
                <CardDescription>Isi data sampah yang akan Anda jual hari ini.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Info Nasabah:</p>
                      <p>Nama: <span className="font-medium">{user?.name}</span></p>
                      <p>Alamat: <span className="font-medium">{user?.address || '-'}</span></p>
                    </div>
                  </div>

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
                            {type.label} - {type.pointsPerKg.toLocaleString()} poin/{type.unit}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="weight">Berat Sampah (kg) *</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      min="0.1"
                      placeholder="Contoh: 2.5"
                      value={formData.weight}
                      onChange={(e) => handleChange('weight', e.target.value)}
                      required
                    />
                  </div>

                  {selectedWaste && formData.weight && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                      <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <span className="text-sm text-gray-600">Estimasi Poin yang Didapat</span>
                        <Award className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="text-3xl font-bold text-green-600">
                        {estimatedPoints.toLocaleString()} poin
                      </div>
                      <div className="text-xs text-gray-600 mt-2">
                        {formData.weight} kg x {selectedWaste.pointsPerKg.toLocaleString()} poin/kg
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="notes">Catatan (Opsional)</Label>
                    <Textarea
                      id="notes"
                      className="min-h-20"
                      placeholder="Informasi tambahan tentang kondisi sampah..."
                      value={formData.notes}
                      onChange={(e) => handleChange('notes', e.target.value)}
                    />
                  </div>

                  <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                    <Button type="submit" className="flex-1 bg-green-600 hover:bg-green-700" disabled={submitting}>
                      <Package className="w-4 h-4 mr-2" />
                      {submitting ? 'Mengirim...' : 'Ajukan Transaksi'}
                    </Button>
                    <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => navigate('/dashboard')}>
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daftar Harga</CardTitle>
                  <CardDescription>Poin per kilogram dari database</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {wasteTypes.map((type) => (
                    <div key={type.id} className="flex justify-between items-center text-sm">
                      <span className="text-gray-700">{type.label}</span>
                      <span className="font-semibold text-green-600">
                        {type.pointsPerKg.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-lg text-green-900">Syarat & Ketentuan</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-green-800 space-y-2">
                  <p>Sampah harus dalam kondisi bersih dan kering.</p>
                  <p>Pisahkan sampah berdasarkan jenisnya.</p>
                  <p>Poin masuk setelah verifikasi admin.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
