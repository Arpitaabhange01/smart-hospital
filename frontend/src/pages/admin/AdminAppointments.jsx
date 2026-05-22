import { useState, useEffect } from 'react';
import { CalendarCheck } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetch = async (status) => {
    setLoading(true);
    try {
      const url = status ? `/admin/appointments?status=${status}` : '/admin/appointments';
      const res = await API.get(url);
      setAppointments(res.data.appointments);
    } catch (err) {} finally { setLoading(false); }
  };
  useEffect(() => { fetch(filter); }, [filter]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this appointment?')) return;
    try {
      await API.put(`/receptionist/appointments/${id}`, { status: 'cancelled' });
      toast.success('Appointment cancelled');
      fetch(filter);
    } catch (err) { toast.error('Failed to cancel'); }
  };

  const statusBadge = (s) => {
    const m = { pending: 'bg-amber-50 text-amber-600', confirmed: 'bg-green-50 text-green-600', cancelled: 'bg-red-50 text-red-500', completed: 'bg-blue-50 text-blue-600' };
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${m[s] || ''}`}>{s}</span>;
  };

  const filters = [
    { value: '', label: 'All' }, { value: 'pending', label: 'Pending' }, { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' }, { value: 'cancelled', label: 'Cancelled' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">All Appointments</h1>
        <p className="text-gray-500 mt-1">View and manage all appointments in the system.</p>
      </div>

      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              filter === f.value ? 'bg-violet-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}>{f.label}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-card">
          <CalendarCheck className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No appointments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 font-medium">Patient</th>
                <th className="px-6 py-3 font-medium">Doctor</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Time</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map((a) => (
                <tr key={a._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="font-medium text-gray-800">{a.patient?.name}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">Dr. {a.doctor?.name}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(a.date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-gray-600">{a.timeSlot}</td>
                  <td className="px-6 py-4">{statusBadge(a.status)}</td>
                  <td className="px-6 py-4">
                    {a.status !== 'cancelled' && a.status !== 'completed' && (
                      <button onClick={() => handleCancel(a._id)}
                        className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors font-medium">Cancel</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
