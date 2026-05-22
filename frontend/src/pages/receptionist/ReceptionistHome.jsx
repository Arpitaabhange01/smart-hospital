import { useState, useEffect } from 'react';
import { CalendarCheck, UserPlus, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { Link } from 'react-router-dom';

export default function ReceptionistHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ appointments: 0, doctors: 0 });
  const [todayApps, setTodayApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [appRes, docRes] = await Promise.all([
          API.get('/receptionist/appointments'),
          API.get('/receptionist/doctors'),
        ]);
        setStats({ appointments: appRes.data.count, doctors: docRes.data.count });
        const today = new Date().toISOString().split('T')[0];
        const todayRes = await API.get(`/receptionist/appointments?date=${today}`);
        setTodayApps(todayRes.data.appointments);
      } catch (err) {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const cards = [
    { icon: CalendarCheck, label: 'Total Appointments', value: stats.appointments, color: 'bg-blue-50 text-blue-600', to: '#' },
    { icon: Stethoscope, label: 'Active Doctors', value: stats.doctors, color: 'bg-green-50 text-green-600', to: '/receptionist/doctor-availability' },
    { icon: UserPlus, label: 'Register Patient', color: 'bg-amber-50 text-amber-600', to: '/receptionist/register-patient' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Welcome, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">Manage patient registrations and appointments.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="bg-white p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow">
            <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value ?? '—'}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-gray-900">Today's Appointments</h2>
          <Link to="/receptionist/book-appointment" className="text-sm text-amber-600 hover:underline font-medium">Book New</Link>
        </div>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : todayApps.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No appointments today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {todayApps.map((a) => (
              <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xs">
                    {a.patient?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{a.patient?.name}</p>
                    <p className="text-xs text-gray-400">Dr. {a.doctor?.name} · {a.timeSlot}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  a.status === 'confirmed' ? 'bg-green-50 text-green-600' : a.status === 'completed' ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'
                }`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
