import { useEffect, useMemo, useState } from 'react';
import { PublicNavbar } from '../components/PublicNavbar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { ScheduleCalendar } from '../components/ScheduleCalendar';
import { MapPreviewCard } from '../components/MapPreviewCard';
import {
  Recycle,
  Users,
  Leaf,
  Award,
  Shield,
  MapPin,
  CalendarDays,
  Package,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { fetchSchedules, fetchWasteTypes, type ScheduleItem, type WasteTypeOption } from '../lib/milosApi';

const features = [
  {
    icon: Recycle,
    title: 'Pengambilan Terjadwal',
    description: 'Nasabah memilih pickup mengikuti jadwal yang benar-benar diatur pengurus di sistem.',
  },
  {
    icon: Award,
    title: 'Sistem Poin Nyata',
    description: 'Setiap transaksi terverifikasi dikonversi menjadi poin yang bisa dipantau langsung di dashboard.',
  },
  {
    icon: Shield,
    title: 'Data Tersimpan Rapi',
    description: 'Riwayat transaksi, pickup, dan penukaran hadiah tercatat di satu sistem terpadu.',
  },
  {
    icon: Users,
    title: 'Alur Nasabah dan Pengurus',
    description: 'Pengurus mengelola jadwal, jenis sampah, hadiah, dan verifikasi langsung dari panel admin.',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [wasteTypes, setWasteTypes] = useState<WasteTypeOption[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadPublicData = async () => {
      try {
        const [scheduleData, wasteTypeData] = await Promise.all([
          fetchSchedules(),
          fetchWasteTypes(),
        ]);

        if (isMounted) {
          setSchedules(scheduleData.filter((schedule) => schedule.is_aktif === 1));
          setWasteTypes(wasteTypeData);
        }
      } catch (_error) {
        if (isMounted) {
          setSchedules([]);
          setWasteTypes([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadPublicData();
    return () => {
      isMounted = false;
    };
  }, []);

  const wilayahAktif = useMemo(
    () => Array.from(new Set(schedules.map((schedule) => schedule.wilayah))),
    [schedules]
  );

  const hariAktif = useMemo(
    () => Array.from(new Set(schedules.map((schedule) => schedule.hari))),
    [schedules]
  );

  const previewSchedules = schedules.slice(0, 4);
  const landingMapQuery = useMemo(() => {
    const primaryArea = previewSchedules[0]?.wilayah?.trim();
    return primaryArea ? `${primaryArea}, Indonesia` : 'Rajapolah, Tasikmalaya, Indonesia';
  }, [previewSchedules]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <PublicNavbar />

      <section className="pt-24 pb-16 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block px-4 py-2 bg-green-100 rounded-full text-green-700 font-medium mb-6">
                Sistem pengelolaan sampah untuk nasabah dan pengurus
              </div>
              <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                Pantau Sampah,<br />
                Pickup, dan <span className="text-green-600">Poin</span> dalam Satu Sistem
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                MILOS membantu proses jual sampah, pengajuan pickup, penukaran hadiah, dan pengelolaan jadwal
                secara digital agar alur nasabah dan pengurus lebih tertata.
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

              <div className="grid grid-cols-3 gap-6 mt-12 pt-8 border-t">
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {loading ? '...' : wilayahAktif.length}
                  </div>
                  <div className="text-sm text-gray-600">Wilayah Aktif</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {loading ? '...' : schedules.length}
                  </div>
                  <div className="text-sm text-gray-600">Jadwal Pickup</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    {loading ? '...' : wasteTypes.length}
                  </div>
                  <div className="text-sm text-gray-600">Jenis Sampah</div>
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
                      <div className="font-bold text-gray-900">Portal Nasabah MILOS</div>
                      <div className="text-sm text-gray-600">Data ditarik dari sistem yang aktif</div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-sm text-gray-600 mb-1">Jadwal Aktif Saat Ini</div>
                      <div className="text-3xl font-bold text-green-600">
                        {loading ? '...' : schedules.length}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600">Hari Layanan</div>
                        <div className="text-xl font-bold">{loading ? '...' : hariAktif.length}</div>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="text-xs text-gray-600">Wilayah</div>
                        <div className="text-xl font-bold">{loading ? '...' : wilayahAktif.length}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600">
                      Jadwal, jenis sampah, dan katalog hadiah dikelola langsung dari panel admin.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Mengapa Bergabung dengan MILOS?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Sistem bank sampah digital yang lebih rapi, terukur, dan mudah dipantau.
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

      <section className="py-16 px-6 lg:px-8 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cara Kerja Program MILOS
            </h2>
            <p className="text-gray-600">
              Alur digital yang menghubungkan nasabah dan pengurus.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="border-2 border-green-200 bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Recycle className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle className="text-center">Pilih Jenis Sampah</CardTitle>
                <CardDescription className="text-center">
                  Nasabah mengajukan transaksi berdasarkan jenis sampah yang aktif di database.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-blue-200 bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarDays className="w-8 h-8 text-blue-600" />
                </div>
                <CardTitle className="text-center">Ikuti Jadwal Admin</CardTitle>
                <CardDescription className="text-center">
                  Pengajuan pickup mengikuti hari dan jam yang sudah diatur pengurus.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-purple-200 bg-white">
              <CardHeader>
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Award className="w-8 h-8 text-purple-600" />
                </div>
                <CardTitle className="text-center">Pantau dan Tukar Poin</CardTitle>
                <CardDescription className="text-center">
                  Poin dari transaksi terverifikasi bisa dipantau dan ditukar dengan hadiah.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 border-0 text-white">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">Ringkasan Sistem Saat Ini</h3>
                  <p className="text-blue-50 mb-4">
                    Informasi berikut dibaca dari data aktif di backend yang sedang berjalan.
                  </p>
                  <div className="space-y-3 text-blue-50">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span>{loading ? '...' : wilayahAktif.length} wilayah dengan jadwal aktif</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5" />
                      <span>{loading ? '...' : schedules.length} entri jadwal pickup</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5" />
                      <span>{loading ? '...' : wasteTypes.length} jenis sampah tersedia</span>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
                  <h4 className="font-semibold mb-4 text-lg">Manfaat Operasional:</h4>
                  <ul className="space-y-3 text-blue-50">
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">1</span>
                      Jadwal pickup tidak perlu ditebak atau diinput manual oleh nasabah.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">2</span>
                      Jenis sampah dan poin mengikuti data admin yang aktif.
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-5 h-5 bg-white/20 rounded-full flex items-center justify-center">3</span>
                      Hadiah dan penukaran bisa dipantau di satu alur yang sama.
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section id="jadwal" className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Jadwal Pengambilan Sampah
            </h2>
            <p className="text-gray-600">
              Kalender ini membaca jadwal aktif yang diatur pengurus dari dashboard admin.
            </p>
          </div>

          <ScheduleCalendar />

          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              <div className="col-span-full text-sm text-gray-500 text-center py-6">
                Memuat ringkasan wilayah...
              </div>
            ) : previewSchedules.length === 0 ? (
              <div className="col-span-full text-sm text-gray-500 text-center py-6">
                Belum ada jadwal aktif untuk ditampilkan.
              </div>
            ) : (
              previewSchedules.map((schedule) => (
                <Card key={schedule.id_jadwal} className="border-green-200 bg-green-50">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 text-green-700">
                      <MapPin className="w-5 h-5" />
                      <CardTitle className="text-lg">{schedule.wilayah}</CardTitle>
                    </div>
                    <CardDescription className="text-green-700">
                      {schedule.hari}, {String(schedule.jam).slice(0, 5)} WIB
                    </CardDescription>
                    <div className="text-xs text-green-700">
                      {schedule.keterangan || 'Jadwal aktif dari pengurus'}
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>

          <div className="mt-8">
            <MapPreviewCard
              title="Peta Wilayah Layanan"
              description="Pratinjau area layanan berdasarkan wilayah pickup aktif yang saat ini tersedia."
              query={landingMapQuery}
            />
          </div>
        </div>
      </section>

      <section id="tentang" className="py-16 px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Tentang Program MILOS
              </h2>
              <p className="text-gray-600 mb-6">
                MILOS adalah sistem pengelolaan sampah yang membantu nasabah mencatat transaksi,
                mengajukan pickup, memantau poin, dan menukar hadiah secara digital.
              </p>
              <p className="text-gray-600 mb-6">
                Fokus utamanya adalah menyatukan alur kerja nasabah dan pengurus agar pengelolaan
                sampah lebih tertib, data lebih rapi, dan proses verifikasi lebih jelas.
              </p>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Award className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Poin Berdasarkan Verifikasi</div>
                    <div className="text-sm text-gray-600">
                      Poin nasabah mengikuti transaksi yang benar-benar sudah diverifikasi pengurus.
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Alur Admin dan Nasabah Tersambung</div>
                    <div className="text-sm text-gray-600">
                      Jadwal, jenis sampah, hadiah, dan penukaran saling terhubung dalam satu sistem.
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
                    <CardTitle className="text-2xl">{loading ? '...' : wasteTypes.length}</CardTitle>
                    <CardDescription>Jenis Sampah Aktif</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <MapPin className="w-8 h-8 text-blue-600 mb-2" />
                    <CardTitle className="text-2xl">{loading ? '...' : wilayahAktif.length}</CardTitle>
                    <CardDescription>Wilayah Aktif</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CalendarDays className="w-8 h-8 text-purple-600 mb-2" />
                    <CardTitle className="text-2xl">{loading ? '...' : hariAktif.length}</CardTitle>
                    <CardDescription>Hari Layanan</CardDescription>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <Award className="w-8 h-8 text-orange-600 mb-2" />
                    <CardTitle className="text-2xl">{loading ? '...' : schedules.length}</CardTitle>
                    <CardDescription>Jadwal Tersedia</CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 border-0 text-white">
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-3xl mb-4">
                Mulai Gunakan MILOS Hari Ini
              </CardTitle>
              <CardDescription className="text-green-50 text-lg">
                Daftar sebagai nasabah dan pantau jadwal, transaksi, pickup, poin, dan hadiah langsung dari satu portal.
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
                Platform pengelolaan sampah digital untuk nasabah dan pengurus.
              </p>
              <p className="text-gray-400">
                Kelola transaksi, pickup, poin, dan hadiah dengan alur yang lebih tertata dan transparan.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Tautan Cepat</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#tentang" className="hover:text-white transition">Tentang Kami</a></li>
                <li><a href="#jadwal" className="hover:text-white transition">Jadwal</a></li>
                <li><a href="/login" className="hover:text-white transition">Login</a></li>
                <li><a href="/register" className="hover:text-white transition">Daftar</a></li>
              </ul>
            </div>
              <div>
                <h3 className="font-semibold mb-4">Kontak</h3>
                <ul className="space-y-2 text-gray-400">
                  <li>
                    Email:{' '}
                    <a
                      href="mailto:frhnrmdhn6@gmail.com"
                      className="hover:text-white transition underline underline-offset-4"
                    >
                      frhnrmdhn6@gmail.com
                    </a>
                  </li>
                  <li>
                    WhatsApp:{' '}
                    <a
                      href="https://wa.me/6283101095706"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white transition underline underline-offset-4"
                    >
                      083101095706
                    </a>
                  </li>
                  <li>Lokasi: Desa Sukamakmur</li>
                  <li>Jam: Senin-Sabtu, 08:00-16:00</li>
                </ul>
              </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 MILOS - Sistem Pengelolaan Sampah Digital. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
