import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { Button } from './ui/button';
import { fetchSchedules, type ScheduleItem } from '../lib/milosApi';

const monthNames = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

const weekdayIndexMap: Record<string, number> = {
  minggu: 0,
  senin: 1,
  selasa: 2,
  rabu: 3,
  kamis: 4,
  jumat: 5,
  "jum'at": 5,
  sabtu: 6,
};

const scheduleColors = [
  'bg-green-500',
  'bg-blue-500',
  'bg-purple-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-emerald-500',
  'bg-yellow-500',
];

export function ScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  useEffect(() => {
    let isMounted = true;

    const loadSchedules = async () => {
      try {
        const data = await fetchSchedules();
        if (isMounted) {
          setSchedules(data.filter((schedule) => schedule.is_aktif === 1));
        }
      } catch (_error) {
        if (isMounted) {
          setSchedules([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadSchedules();
    return () => {
      isMounted = false;
    };
  }, []);

  const scheduleLegend = useMemo(() => {
    const areas = Array.from(new Set(schedules.map((schedule) => schedule.wilayah)));
    return areas.map((area, index) => ({
      name: area,
      color: scheduleColors[index % scheduleColors.length],
    }));
  }, [schedules]);

  const scheduleColorMap = useMemo(
    () =>
      new Map(
        scheduleLegend.map((item) => [item.name, item.color])
      ),
    [scheduleLegend]
  );

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getSchedulesForDate = (date: number) => {
    const dayOfWeek = new Date(year, month, date).getDay();
    return schedules.filter((schedule) => weekdayIndexMap[schedule.hari.toLowerCase()] === dayOfWeek);
  };

  const renderCalendarDays = () => {
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    for (let date = 1; date <= daysInMonth; date++) {
      const isToday =
        date === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      const daySchedules = getSchedulesForDate(date);

      days.push(
        <div
          key={date}
          className={`
            min-h-20 p-2 border border-gray-200 rounded-lg
            ${isToday ? 'ring-2 ring-green-500 bg-green-50' : 'bg-white'}
            ${daySchedules.length > 0 ? 'hover:shadow-md transition-shadow' : ''}
          `}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-green-700' : 'text-gray-700'}`}>
            {date}
          </div>
          <div className="space-y-1">
            {daySchedules.slice(0, 2).map((schedule) => (
              <div
                key={`${schedule.id_jadwal}-${date}`}
                className={`${scheduleColorMap.get(schedule.wilayah) || 'bg-gray-500'} text-white text-xs rounded px-2 py-1 font-medium truncate`}
                title={`${schedule.wilayah} - ${String(schedule.jam).slice(0, 5)} WIB`}
              >
                {schedule.wilayah}
              </div>
            ))}
            {daySchedules.length > 2 && (
              <div className="text-xs text-gray-500">+{daySchedules.length - 2} jadwal</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Kalender Jadwal Pengambilan</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={previousMonth}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <div className="text-sm font-semibold min-w-32 text-center">
              {monthNames[month]} {year}
            </div>
            <Button variant="outline" size="sm" onClick={nextMonth}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-gray-500 py-8 text-center">Memuat jadwal...</div>
        ) : scheduleLegend.length === 0 ? (
          <div className="text-sm text-gray-500 py-8 text-center">Belum ada jadwal aktif dari pengurus.</div>
        ) : (
          <>
            <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b">
              {scheduleLegend.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className={`w-4 h-4 ${item.color} rounded`} />
                  <span className="text-sm text-gray-700">{item.name}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 p-2">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {renderCalendarDays()}
            </div>
          </>
        )}

        <div className="mt-6 pt-4 border-t">
          <p className="text-sm text-gray-600 flex items-center gap-2">
            <span className="w-3 h-3 bg-green-100 border-2 border-green-500 rounded" />
            Hari ini
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
