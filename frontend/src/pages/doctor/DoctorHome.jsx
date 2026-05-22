import { useState, useEffect } from 'react';
import { CalendarCheck, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';
import { Link } from 'react-router-dom';

export default function DoctorHome() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ pending: 0, confirmed: 0, completed: 0, total: 0 });
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/doctor/appointments');
        const apps = res.data.appointments;
        setStats({
          pending: apps.filter((a) => a.status === 'pending').length,
          confirmed: apps.filter((a) => a.status === 'confirmed').length,
          completed: apps.filter((a) => a.status === 'completed').length,
          total: apps.length,
        });
        setRecent(apps.slice(0, 5));
      } catch (err) {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const cards = [
    { icon: CalendarCheck, label: 'Pending', value: stats.pending, color: 'bg-amber-50 text-amber-600' },
    { icon: CalendarCheck, label: 'Confirmed', value: stats.confirmed, color: 'bg-green-50 text-green-600' },
    { icon: CalendarCheck, label: 'Completed', value: stats.completed, color: 'bg-blue-50 text-blue-600' },
    { icon: Users, label: 'Total Appointments', value: stats.total, color: 'bg-purple-50 text-purple-600' },
  ];

  const statusBadge = (s) => {
    const m = { pending: 'bg-amber-50 text-amber-600', confirmed: 'bg-green-50 text-green-600', cancelled: 'bg-red-50 text-red-500', completed: 'bg-blue-50 text-blue-600' };
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${m[s] || ''}`}>{s}</span>;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Welcome, Dr. {user?.name?.split(' ')[0]}!</h1>
        <p className="text-gray-500 mt-1">Manage your appointments, patients, and prescriptions.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white p-5 rounded-xl shadow-card">
            <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-gray-900">Recent Appointments</h2>
          <Link to="/doctor/appointments" className="text-sm text-emerald-600 hover:underline font-medium">View All</Link>
        </div>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : recent.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <CalendarCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No appointments yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recent.map((a) => (
              <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xs">
                    {a.patient?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 text-sm">{a.patient?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(a.date).toLocaleDateString()} at {a.timeSlot}</p>
                  </div>
                </div>
                {statusBadge(a.status)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
