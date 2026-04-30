import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, Leaf, Mail, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { requestPasswordReset } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    setLoading(true);
    try {
      const success = await requestPasswordReset(email);
      if (success) {
        setSuccessMessage('Tautan reset password sudah dikirim. Silakan cek email Anda.');
        setEmail('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset password gagal.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.18),_transparent_35%),linear-gradient(135deg,#f4fbf6_0%,#ebf7ee_45%,#f8fffb_100%)] flex items-center justify-center p-4">
      <Link
        to="/login"
        className="fixed top-6 left-6 flex items-center gap-2 rounded-full border border-emerald-100 bg-white/90 px-4 py-2 text-gray-700 shadow-sm transition hover:border-emerald-200 hover:text-green-700"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="font-medium">Kembali ke login</span>
      </Link>

      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-200/70">
            <Leaf className="w-7 h-7 text-white" />
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-800">MILOS</div>
            <div className="text-xs uppercase tracking-[0.22em] text-emerald-600">Reset Password</div>
          </div>
        </div>

        <Card className="overflow-hidden rounded-[28px] border-emerald-100/80 bg-white/95 shadow-[0_24px_80px_-32px_rgba(16,185,129,0.55)]">
          <div className="h-2 bg-gradient-to-r from-emerald-500 via-lime-400 to-teal-500" />
          <CardHeader className="space-y-2 pb-4">
            <CardTitle className="text-3xl text-slate-900">Lupa Password Nasabah</CardTitle>
            <CardDescription>
              Masukkan email nasabah yang terdaftar. Kami akan mengirimkan tautan reset password ke email tersebut.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {successMessage && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                  <AlertDescription>{successMessage}</AlertDescription>
                </Alert>
              )}
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Terdaftar</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="email.nasabah@gmail.com"
                    className="h-14 rounded-2xl border-slate-200 pl-11"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="h-14 w-full rounded-2xl bg-emerald-600 text-base font-semibold shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
                disabled={loading}
              >
                {loading ? 'Mengirim tautan reset...' : 'Kirim Tautan Reset'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
