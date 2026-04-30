import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Leaf, Mail, Lock, AlertCircle, UserCog, ArrowLeft, Eye, EyeOff, Recycle, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { GoogleIdentityButton } from '../components/GoogleIdentityButton';
import { ApiError } from '../lib/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'nasabah' | 'admin'>('nasabah');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, loginWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await login(email, password, role);
      if (success) {
        navigate(role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (credential: string) => {
    setError('');
    try {
      const success = await loginWithGoogle(credential);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        const details = (err.details ?? {}) as { email?: string; name?: string };
        navigate('/register', {
          state: {
            fromGoogleLogin: true,
            email: details.email || '',
            name: details.name || '',
          },
        });
        return;
      }
      setError(err instanceof Error ? err.message : 'Login Google gagal.');
      throw err;
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.22),_transparent_35%),linear-gradient(135deg,#f4fbf6_0%,#ebf7ee_45%,#f8fffb_100%)] flex items-center justify-center p-4">
      <Link
        to="/"
        className="fixed top-6 left-6 flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-4 py-2 text-gray-700 shadow-sm transition hover:border-emerald-200 hover:text-green-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Beranda</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-200/70">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-800">MILOS</div>
            <div className="text-xs uppercase tracking-[0.22em] text-emerald-600">Bank Sampah Digital</div>
          </div>
        </div>

        <Card className="overflow-hidden rounded-[28px] border-emerald-100/80 bg-white/95 shadow-[0_24px_80px_-32px_rgba(16,185,129,0.55)]">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-lime-400 to-teal-500" />
          <CardHeader className="space-y-3 pb-4">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              <span>Sign In</span>
              <span>{role === 'admin' ? 'Admin' : 'Nasabah'}</span>
            </div>
            <CardTitle className="text-3xl text-slate-900">Masuk ke MILOS</CardTitle>
            <CardDescription>
              Nasabah mendaftar dengan email dan password. Setelah akun terdaftar, Google bisa dipakai sebagai alternatif login untuk email yang sama.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-900">
              <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
                <Recycle className="mb-2 h-4 w-4 text-emerald-600" />
                <div className="font-semibold">Nasabah</div>
                <div className="mt-1 text-xs text-emerald-700">Setor sampah, cek poin, dan tukar reward.</div>
              </div>
              <div className="rounded-2xl bg-white/80 p-3 shadow-sm">
                <ShieldCheck className="mb-2 h-4 w-4 text-emerald-600" />
                <div className="font-semibold">Admin</div>
                <div className="mt-1 text-xs text-emerald-700">Kelola transaksi, pickup, dan dashboard.</div>
              </div>
            </div>

            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="role">Masuk Sebagai</Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as 'nasabah' | 'admin')}
                >
                  <SelectTrigger className="h-12 w-full rounded-2xl border-emerald-100">
                    <div className="flex items-center gap-2">
                      <UserCog className="h-4 w-4" />
                      <SelectValue placeholder="Pilih role">
                        {role === 'admin' ? 'Pengurus/Admin' : 'Nasabah'}
                      </SelectValue>
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nasabah">Nasabah</SelectItem>
                    <SelectItem value="admin">Pengurus/Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Alamat Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder={role === 'admin' ? 'admin@milos.id' : 'akun.google.aktif@gmail.com'}
                      className="h-14 rounded-2xl border-slate-200 pl-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    {role === 'admin' ? (
                      <span className="text-xs font-medium text-emerald-600">Akses pengurus</span>
                    ) : (
                      <Link to="/forgot-password" className="text-xs font-medium text-emerald-600 hover:text-emerald-700">
                        Lupa password?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Masukkan password Anda"
                      className="h-14 rounded-2xl border-slate-200 pl-11 pr-12"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
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

                <Button
                  type="submit"
                  className="h-14 w-full rounded-2xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
                  disabled={loading}
                >
                  {loading ? 'Memproses...' : `Masuk sebagai ${role === 'admin' ? 'Admin' : 'Nasabah'}`}
                </Button>
              </form>

              {role === 'nasabah' && (
                <>
                  <div className="relative py-2 text-center text-sm text-slate-400">
                    <span className="relative z-10 bg-white px-3">Atau login dengan</span>
                    <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-slate-200" />
                  </div>
                  <GoogleIdentityButton text="signin_with" onCredential={handleGoogleLogin} />
                </>
              )}

              {role === 'admin' && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-900">
                  Akun pengurus tidak didaftarkan dari halaman publik dan wajib memakai email aktif yang valid. Admin dibuat secara internal oleh pengurus atau langsung dari database.
                </div>
              )}
            </div>

            <div className="text-center text-sm text-gray-600">
              Belum punya akun nasabah?{' '}
              <Link to="/register" className="text-green-600 hover:text-green-700 font-semibold">
                Create an account
              </Link>
            </div>

            <div className="text-center">
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
