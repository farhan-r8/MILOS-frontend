import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Button } from './ui/button';

interface ScheduleDay {
  date: number;
  month: number;
  year: number;
  area?: string;
  time?: string;
  isToday?: boolean;
  isScheduled?: boolean;
}

const kosAreas = [
  { name: 'Kos Melati', color: 'bg-green-500', days: [1, 8, 15, 22, 29] },
  { name: 'Kos Mawar', color: 'bg-blue-500', days: [3, 10, 17, 24] },
  { name: 'Kos Anggrek', color: 'bg-purple-500', days: [5, 12, 19, 26] },
  { name: 'Kos Kenanga', color: 'bg-orange-500', days: [7, 14, 21, 28] },
];

export function ScheduleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();
  
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];
  
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  
  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  
  const getScheduleForDate = (date: number) => {
    for (const kos of kosAreas) {
      if (kos.days.includes(date)) {
        return { area: kos.name, color: kos.color };
      }
    }
    return null;
  };
  
  const renderCalendarDays = () => {
    const days = [];
    
    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }
    
    // Days of the month
    for (let date = 1; date <= daysInMonth; date++) {
      const isToday = 
        date === today.getDate() && 
        month === today.getMonth() && 
        year === today.getFullYear();
      
      const schedule = getScheduleForDate(date);
      
      days.push(
        <div
          key={date}
          className={`
            min-h-20 p-2 border border-gray-200 rounded-lg
            ${isToday ? 'ring-2 ring-green-500 bg-green-50' : 'bg-white'}
            ${schedule ? 'hover:shadow-md transition-shadow' : ''}
          `}
        >
          <div className={`text-sm font-semibold mb-1 ${isToday ? 'text-green-700' : 'text-gray-700'}`}>
            {date}
          </div>
          {schedule && (
            <div className={`${schedule.color} text-white text-xs rounded px-2 py-1 font-medium`}>
              {schedule.area}
            </div>
          )}
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
        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-6 pb-4 border-b">
          {kosAreas.map((kos) => (
            <div key={kos.name} className="flex items-center gap-2">
              <div className={`w-4 h-4 ${kos.color} rounded`} />
              <span className="text-sm text-gray-700">{kos.name}</span>
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
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
        
        {/* Info */}
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
