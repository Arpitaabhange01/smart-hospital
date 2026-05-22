import { useState, useEffect, useMemo } from 'react';
import { ChevronLeft, ChevronRight, CalendarDays, Clock, User, MapPin } from 'lucide-react';
import API from '../../utils/api';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, parseISO, addMonths, subMonths } from 'date-fns';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/doctor/appointments');
        setAppointments(res.data.appointments);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const calStart = startOfWeek(monthStart);
    const calEnd = endOfWeek(monthEnd);
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentDate]);

  const getApptsForDay = (day) => appointments.filter((a) => {
    const d = typeof a.date === 'string' ? parseISO(a.date) : new Date(a.date);
    return isSameDay(d, day);
  });

  const selectedAppts = getApptsForDay(selectedDate);

  const getDayColor = (day) => {
    const appts = getApptsForDay(day);
    if (appts.length === 0) return null;
    const hasPending = appts.some(a => a.status === 'pending');
    const hasConfirmed = appts.some(a => a.status === 'confirmed');
    if (hasPending) return 'bg-amber-100 text-amber-700 border-amber-200';
    if (hasConfirmed) return 'bg-green-100 text-green-700 border-green-200';
    return 'bg-blue-100 text-blue-700 border-blue-200';
  };

  const statusBadge = (s) => {
    const m = { pending: 'bg-amber-100 text-amber-700', confirmed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-600', completed: 'bg-blue-100 text-blue-700' };
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m[s] || ''}`}>{s}</span>;
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View and manage appointments by date.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" /></button>
            <h2 className="font-semibold text-gray-900 dark:text-white">{months[currentDate.getMonth()]} {currentDate.getFullYear()}</h2>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700"><ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" /></button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs font-semibold text-gray-400 dark:text-gray-500 py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {days.map((day, i) => {
              const appts = getApptsForDay(day);
              const color = getDayColor(day);
              const isSelected = isSameDay(day, selectedDate);
              const isCurrent = isSameMonth(day, currentDate);
              return (
                <button key={i} onClick={() => setSelectedDate(day)}
                  className={`relative p-2 rounded-xl text-sm transition-all min-h-[3rem] ${!isCurrent ? 'opacity-30' : ''} ${isSelected ? 'ring-2 ring-primary-500' : ''} ${color || 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'} border border-transparent`}>
                  <span className="font-medium">{format(day, 'd')}</span>
                  {appts.length > 0 && <span className="block text-[10px] font-semibold mt-0.5">{appts.length} appt{appts.length > 1 ? 's' : ''}</span>}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <CalendarDays className="w-5 h-5 text-primary-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">{format(selectedDate, 'MMMM d, yyyy')}</h2>
          </div>

          {selectedAppts.length === 0 ? (
            <div className="text-center py-10">
              <Clock className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-gray-500 text-sm">No appointments for this day.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedAppts.map((a) => (
                <div key={a._id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-sm text-gray-900 dark:text-white">{a.patient?.name || 'Unknown'}</span>
                    </div>
                    {statusBadge(a.status)}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{a.timeSlot}</span>
                  </div>
                  {a.reason && (
                    <div className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="w-3.5 h-3.5 mt-0.5" />
                      <span>{a.reason}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
