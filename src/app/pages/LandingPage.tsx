import { PublicNavbar } from '../components/PublicNavbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import {
  Recycle,
  TrendingUp,
  Users,
  Leaf,
  Award,
  Shield,
  Home,
  MapPin,
} from 'lucide-react';
import { useNavigate } from 'react-router';

const features = [
  {
    icon: Recycle,
    title: 'Pengambilan Rutin',
    description: 'Sampah diambil sesuai jadwal kos masing-masing untuk menjaga kebersihan lingkungan',
  },
  {
    icon: Award,
    title: 'Sistem Poin Menguntungkan',
    description: 'Jual sampah pilah dan dapatkan poin yang bisa ditukar dengan hadiah menarik',
  },
  {
    icon: Shield,
    title: 'Lingkungan Bersih',
    description: 'Minimalisir pembuangan sampah sembarangan dengan pengelolaan yang teratur',
  },
  {
    icon: Users,
    title: 'Komunitas Peduli',
    description: 'Gotong royong menjaga kebersihan dan kenyamanan lingkungan kos bersama',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <PublicNavbar />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-green-100 rounded-full text-green-700 font-medium mb-6">
                🌱 Program Kerja Desa Sukamakmur
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Lingkungan Bersih,<br />
                Warga <span className="text-green-600">Sejahtera</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                MILOS adalah program desa untuk meminimalisir pembuangan sampah sembarangan di kos-kosan.
                Dengan jadwal pengambilan rutin dan sistem poin, mari jaga kebersihan bersama!
              </p>
              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => navigate('/register')}
                >
                  Daftar Sekarang
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => navigate('/login')}
                >
                  Masuk
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t">
                <div>
                  <div className="text-3xl font-bold text-green-600">150+</div>
                  <div className="text-sm text-gray-600">Penghuni Kos</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">2.5 Ton</div>
                  <div className="text-sm text-gray-600">Sampah Terkumpul</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">4 Kos</div>
                  <div className="text-sm text-gray-600">Area Layanan</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 rounded-3xl p-8 shadow-2xl">
                <div className="bg-white rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Leaf className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <div className="font-bold text-gray-900">Dashboard Nasabah</div>
                      <div className="text-sm text-gray-600">Kos Melati #12</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Total Poin Saya</div>
                      <div className="text-3xl font-bold text-green-600">12,500 Poin</div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600">Transaksi</div>
                        <div className="text-xl font-bold">18</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600">Bulan Ini</div>
                        <div className="text-xl font-bold">+2.5kg</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mengapa Bergabung dengan MILOS?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sistem bank sampah yang mudah, menguntungkan, dan ramah lingkungan
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-green-500 transition">
                <CardHeader className="pb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-6 lg:px-8 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cara Kerja Program MILOS
            </h2>
            <p className="text-gray-600">
              Program desa untuk lingkungan bersih dan warga sejahtera
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-2 border-green-200 bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Recycle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-center">Pengambilan Rutin</CardTitle>
                <CardDescription className="text-center">
                  Petugas mengambil sampah sesuai jadwal kos masing-masing secara berkala
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-blue-200 bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-center">Jual Sampah Pilah</CardTitle>
                <CardDescription className="text-center">
                  Sampah yang sudah dipilah bisa dijual untuk mendapat poin yang dapat ditukar hadiah
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-purple-200 bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-center">Lingkungan Bersih</CardTitle>
                <CardDescription className="text-center">
                  Mengurangi pembuangan sampah sembarangan dan menjaga kebersihan lingkungan kos
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Biaya Section */}
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Biaya Fasilitas</h3>
                  <p className="text-blue-50 mb-4">
                    Untuk mendukung operasional pengambilan sampah rutin dan kebersihan lingkungan
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold">Rp 10.000</span>
                    <span className="text-xl text-blue-100">/bulan</span>
                  </div>
                  <p className="text-sm text-blue-100 mt-2">
                    *Biaya pengelolaan untuk petugas dan operasional
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="font-semibold mb-4 text-lg">Fasilitas yang Didapat:</h4>
                  <ul className="space-y-3 text-blue-50">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">✓</span>
                      Pengambilan sampah rutin sesuai jadwal
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">✓</span>
                      Sistem poin untuk sampah yang dipilah
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">✓</span>
                      Dashboard online untuk tracking
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">✓</span>
                      Lingkungan kos yang bersih dan nyaman
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Schedule Section */}
      <section id="jadwal" className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Jadwal Pengambilan Sampah Rutin
            </h2>
            <p className="text-gray-600">
              Petugas akan mengambil sampah sesuai jadwal kos masing-masing
            </p>
          </div>

          <ScheduleCalendar />

          <div className="mt-8 grid md:grid-cols-4 gap-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-green-700">
                  <MapPin className="w-5 h-5" />
                  <CardTitle className="text-lg">Kos Melati</CardTitle>
                </div>
                <CardDescription className="text-green-600">
                  Setiap tanggal 1, 8, 15, 22, 29
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-blue-700">
                  <MapPin className="w-5 h-5" />
                  <CardTitle className="text-lg">Kos Mawar</CardTitle>
                </div>
                <CardDescription className="text-blue-600">
                  Setiap tanggal 3, 10, 17, 24
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-purple-200 bg-purple-50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-purple-700">
                  <MapPin className="w-5 h-5" />
                  <CardTitle className="text-lg">Kos Anggrek</CardTitle>
                </div>
                <CardDescription className="text-purple-600">
                  Setiap tanggal 5, 12, 19, 26
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2 text-orange-700">
                  <MapPin className="w-5 h-5" />
                  <CardTitle className="text-lg">Kos Kenanga</CardTitle>
                </div>
                <CardDescription className="text-orange-600">
                  Setiap tanggal 7, 14, 21, 28
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="tentang" className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Tentang Program MILOS
              </h2>
              <p className="text-gray-600 mb-6">
                MILOS (Management Information for Local Organic & Plastic Waste System) adalah
                program kerja Desa Sukamakmur untuk meminimalisir pembuangan sampah sembarangan
                di area kos-kosan.
              </p>
              <p className="text-gray-600 mb-6">
                Dengan sistem pengambilan sampah rutin dan reward poin untuk sampah yang dipilah,
                program ini bertujuan menciptakan lingkungan kos yang bersih, sehat, dan nyaman
                untuk semua penghuni.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Sistem Poin Transparan</div>
                    <div className="text-sm text-gray-600">
                      Setiap kg sampah dikonversi menjadi poin sesuai jenis dan harga pasar
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Komunitas Peduli Lingkungan</div>
                    <div className="text-sm text-gray-600">
                      Bersama-sama menjaga kebersihan dan kelestarian lingkungan desa
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl p-8">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <Recycle className="w-8 h-8 text-green-600 mb-2" />
                    <CardTitle className="text-2xl">12+</CardTitle>
                    <CardDescription>Jenis Sampah</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <MapPin className="w-8 h-8 text-blue-600 mb-2" />
                    <CardTitle className="text-2xl">4</CardTitle>
                    <CardDescription>Kos Terlayani</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <Users className="w-8 h-8 text-purple-600 mb-2" />
                    <CardTitle className="text-2xl">150+</CardTitle>
                    <CardDescription>Penghuni Aktif</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <Award className="w-8 h-8 text-orange-600 mb-2" />
                    <CardTitle className="text-2xl">95%</CardTitle>
                    <CardDescription>Kepuasan</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl mb-4">
                Mulai Jual Sampah Anda Hari Ini!
              </CardTitle>
              <CardDescription className="text-green-50 text-lg">
                Daftar gratis dan dapatkan bonus 100 poin untuk transaksi pertama!
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                size="lg"
                className="bg-white text-green-600 hover:bg-green-50"
                onClick={() => navigate('/register')}
              >
                Daftar Gratis Sekarang
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer id="kontak" className="bg-gray-900 text-white py-12 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-white" />
                </div>
                <div className="font-bold text-xl">MILOS</div>
              </div>
              <p className="text-gray-400 mb-4">
                Bank Sampah Digital Desa Sukamakmur
              </p>
              <p className="text-gray-400">
                Sistem bank sampah untuk penghuni kos-kosan di Desa Sukamakmur.
                Jual sampah, dapat poin, bantu lingkungan!
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Tautan Cepat</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition">Tentang Kami</a></li>
                <li><a href="#jadwal" className="hover:text-white transition">Jadwal</a></li>
                <li><a href="/login" className="hover:text-white transition">Login</a></li>
                <li><a href="/register" className="hover:text-white transition">Daftar</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Kontak</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Email: info@milos.id</li>
                <li>Telepon: 0812-3456-7890</li>
                <li>Lokasi: Desa Sukamakmur</li>
                <li>Jam: Senin-Sabtu, 08:00-16:00</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 MILOS - Bank Sampah Desa Sukamakmur. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
