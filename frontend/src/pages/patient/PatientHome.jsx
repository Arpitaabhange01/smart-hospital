import { useState, useEffect } from 'react';
import { CalendarClock, FileText, Pill, Stethoscope } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { Link } from 'react-router-dom';

export default function PatientHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ appointments: 0, prescriptions: 0, reports: 0 });
  const [upcoming, setUpcoming] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [appRes, preRes, repRes, upRes] = await Promise.all([
          API.get('/patient/appointments'),
          API.get('/patient/prescriptions'),
          API.get('/patient/reports'),
          API.get('/patient/appointments/upcoming'),
        ]);
        setStats({
          appointments: appRes.data.count,
          prescriptions: preRes.data.count,
          reports: repRes.data.count,
        });
        setUpcoming(upRes.data.appointments);
      } catch (err) {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const cards = [
    { icon: CalendarClock, label: 'Appointments', value: stats.appointments, color: 'bg-blue-50 text-blue-600', to: '/patient/my-appointments' },
    { icon: Pill, label: 'Prescriptions', value: stats.prescriptions, color: 'bg-purple-50 text-purple-600', to: '/patient/my-prescriptions' },
    { icon: FileText, label: 'Reports', value: stats.reports, color: 'bg-amber-50 text-amber-600', to: '/patient/my-reports' },
    { icon: Stethoscope, label: 'Doctors', color: 'bg-green-50 text-green-600', to: '/patient/book-appointment' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Welcome back, {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">Here's an overview of your health journey.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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
          <h2 className="font-display text-lg font-bold text-gray-900">Upcoming Appointments</h2>
          <Link to="/patient/book-appointment" className="text-sm text-primary-600 hover:underline font-medium">Book New</Link>
        </div>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : upcoming.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CalendarClock className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No upcoming appointments</p>
            <Link to="/patient/book-appointment" className="text-primary-600 hover:underline text-sm font-medium mt-2 inline-block">Book one now</Link>
          </div>
        ) : (
          <div className="space-y-3">
            {upcoming.map((a) => (
              <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-800 text-sm">{a.doctor?.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(a.date).toLocaleDateString()} at {a.timeSlot}</p>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  a.status === 'confirmed' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                }`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
