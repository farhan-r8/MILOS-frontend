import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Leaf, Phone, MapPin, AlertCircle, ArrowLeft, Mail, Lock, User2, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function RegisterPage() {
  const location = useLocation();
  const googlePrefill = (location.state ?? {}) as {
    fromGoogleLogin?: boolean;
    email?: string;
    name?: string;
  };
  const [formData, setFormData] = useState({
    name: googlePrefill.name || '',
    email: googlePrefill.email || '',
    password: '',
    phone: '',
    address: '',
    role: 'nasabah' as const,
  });
  const [isSidamulih, setIsSidamulih] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsSidamulih(checked);
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        address: 'Desa Sidamulih, Kab. Tasikmalaya',
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        address: '',
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await register(formData);
      if (success) {
        navigate('/login');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registrasi gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.24),_transparent_35%),linear-gradient(135deg,#f4fbf6_0%,#ebf7ee_45%,#f8fffb_100%)] flex items-center justify-center p-4 py-12">
      <Link
        to="/"
        className="fixed top-6 left-6 hidden md:flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-4 py-2 text-gray-700 shadow-sm transition hover:border-emerald-200 hover:text-green-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Beranda</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="md:hidden mb-6 flex justify-start">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:border-emerald-200 hover:text-green-700"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Beranda</span>
          </Link>
        </div>

        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-200/70">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-800">MILOS</div>
            <div className="text-xs uppercase tracking-[0.22em] text-emerald-600">Nasabah Baru</div>
          </div>
        </div>

        <Card className="overflow-hidden rounded-[28px] border-emerald-100/80 bg-white/95 shadow-[0_24px_80px_-32px_rgba(16,185,129,0.55)]">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-lime-400 to-teal-500" />
          <CardHeader className="space-y-2 pb-4">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              Create account
            </div>
            <CardTitle className="text-3xl text-slate-900">Daftar Nasabah MILOS</CardTitle>
            <CardDescription>
              Buat akun nasabah dengan email dan password. Setelah terdaftar, email Google yang sama bisa dipakai sebagai alternatif login.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {googlePrefill.fromGoogleLogin && (
                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3 text-sm text-sky-800">
                  Akun Google ini belum terdaftar di MILOS. Lengkapi data berikut untuk membuat akun nasabah baru.
                </div>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                <div className="relative">
                  <User2 className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Nama lengkap nasabah"
                    className="h-14 rounded-2xl border-slate-200 pl-11"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Akun Google Asli</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="namaaktif@gmail.com"
                    className="h-14 rounded-2xl border-slate-200 pl-11"
                    value={formData.email}
                    onChange={handleChange}
                    readOnly={!!googlePrefill.email}
                    required
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Gunakan email aktif yang sama dengan akun Google Anda jika nanti ingin memakai login Google.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Buat password nasabah"
                    className="h-14 rounded-2xl border-slate-200 pl-11 pr-12"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="08123456789"
                    className="h-14 rounded-2xl border-slate-200 pl-11"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 py-2">
                <input
                  type="checkbox"
                  id="domisili"
                  className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                  checked={isSidamulih}
                  onChange={handleCheckboxChange}
                />
                <label
                  htmlFor="domisili"
                  className="text-sm font-medium leading-none text-slate-700 cursor-pointer"
                >
                  Saya tinggal di wilayah Desa Sidamulih
                </label>
              </div>

              {!isSidamulih ? (
                <div className="space-y-2">
                  <Label htmlFor="address">Lokasi / Alamat Lengkap</Label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-4 w-4 text-slate-400" />
                    <Textarea
                      id="address"
                      name="address"
                      placeholder="Jalan, nomor, kelurahan, kecamatan, kota"
                      className="min-h-24 rounded-2xl border-slate-200 pl-11"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 italic">
                    Layanan pickup hanya tersedia untuk warga Desa Sidamulih
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl bg-emerald-50 p-4 border border-emerald-100">
                   <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-emerald-600 shrink-0" />
                      <div className="text-sm text-emerald-800">
                        <p className="font-semibold">Alamat Terdeteksi:</p>
                        <p>{formData.address}</p>
                      </div>
                   </div>
                </div>
              )}

              <Button
                type="submit"
                className="h-14 w-full rounded-2xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? 'Mendaftarkan akun...' : 'Create an account'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Sudah punya akun nasabah?{' '}
              <Link to="/login" className="text-green-600 hover:text-green-700 font-semibold">
                Sign in
              </Link>
            </div>

            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-gray-500 hover:text-gray-700">
                Kembali ke beranda
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
