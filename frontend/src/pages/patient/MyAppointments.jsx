import { useState, useEffect } from 'react';
import { CalendarClock, XCircle } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetch = async () => {
    try {
      const res = await API.get('/patient/appointments');
      setAppointments(res.data.appointments);
    } catch (err) {} finally { setLoading(false); }
  };
  useEffect(() => { fetch(); }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await API.put(`/patient/appointments/${id}/cancel`);
      toast.success('Appointment cancelled');
      fetch();
    } catch (err) { toast.error('Failed to cancel'); }
  };

  const statusBadge = (s) => {
    const m = { pending: 'bg-amber-50 text-amber-600', confirmed: 'bg-green-50 text-green-600', cancelled: 'bg-red-50 text-red-500', completed: 'bg-blue-50 text-blue-600' };
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${m[s] || 'bg-gray-50 text-gray-500'}`}>{s}</span>;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">My Appointments</h1>
        <p className="text-gray-500 mt-1">View and manage your appointments.</p>
      </div>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-card">
          <CalendarClock className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No appointments yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a._id} className="bg-white p-5 rounded-xl shadow-card flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold text-sm">
                  {a.doctor?.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Dr. {a.doctor?.name}</p>
                  <p className="text-sm text-gray-400">{new Date(a.date).toLocaleDateString()} at {a.timeSlot}</p>
                  {a.reason && <p className="text-xs text-gray-400 mt-0.5">{a.reason}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge(a.status)}
                {(a.status === 'pending' || a.status === 'confirmed') && (
                  <button onClick={() => handleCancel(a._id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                    <XCircle className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
