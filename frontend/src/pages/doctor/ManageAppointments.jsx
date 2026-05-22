import { useState, useEffect } from 'react';
import { Check, X, Eye } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function ManageAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [selected, setSelected] = useState(null);
  const [notes, setNotes] = useState('');

  const fetch = async (status) => {
    setLoading(true);
    try {
      const url = status ? `/doctor/appointments?status=${status}` : '/doctor/appointments';
      const res = await API.get(url);
      setAppointments(res.data.appointments);
    } catch (err) {} finally { setLoading(false); }
  };
  useEffect(() => { fetch(filter); }, [filter]);

  const handleStatus = async (id, status) => {
    try {
      await API.put(`/doctor/appointments/${id}/status`, { status });
      toast.success(`Appointment ${status}`);
      fetch(filter);
    } catch (err) { toast.error('Failed to update'); }
  };

  const handleSaveNotes = async (id) => {
    try {
      await API.put(`/doctor/appointments/${id}/notes`, { notes });
      toast.success('Notes saved');
      setSelected(null);
      setNotes('');
    } catch (err) { toast.error('Failed to save notes'); }
  };

  const statusBadge = (s) => {
    const m = { pending: 'bg-amber-50 text-amber-600', confirmed: 'bg-green-50 text-green-600', cancelled: 'bg-red-50 text-red-500', completed: 'bg-blue-50 text-blue-600' };
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${m[s] || ''}`}>{s}</span>;
  };

  const filters = [
    { value: '', label: 'All' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Appointments</h1>
        <p className="text-gray-500 mt-1">Accept, reject, or manage patient appointments.</p>
      </div>

      <div className="flex gap-2 mb-6">
        {filters.map((f) => (
          <button key={f.value} onClick={() => setFilter(f.value)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-colors ${
              filter === f.value ? 'bg-emerald-600 text-white' : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50'
            }`}>{f.label}</button>
        ))}
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : appointments.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-card">
          <p className="text-gray-500">No appointments found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a._id} className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                    {a.patient?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{a.patient?.name}</p>
                    <p className="text-sm text-gray-400">{new Date(a.date).toLocaleDateString()} at {a.timeSlot}</p>
                    {a.reason && <p className="text-xs text-gray-400 mt-0.5">{a.reason}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {statusBadge(a.status)}
                  {a.status === 'pending' && (
                    <>
                      <button onClick={() => handleStatus(a._id, 'confirmed')}
                        className="p-2 text-green-500 hover:bg-green-50 rounded-lg transition-colors"><Check className="w-4 h-4" /></button>
                      <button onClick={() => handleStatus(a._id, 'cancelled')}
                        className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><X className="w-4 h-4" /></button>
                    </>
                  )}
                  {a.status === 'confirmed' && (
                    <button onClick={() => handleStatus(a._id, 'completed')}
                      className="px-3 py-1.5 text-xs font-medium bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">Mark Completed</button>
                  )}
                  <button onClick={() => { setSelected(selected === a._id ? null : a._id); setNotes(a.notes || ''); }}
                    className="p-2 text-gray-400 hover:bg-gray-50 rounded-lg transition-colors"><Eye className="w-4 h-4" /></button>
                </div>
              </div>
              {selected === a._id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Appointment Notes</label>
                  <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm resize-none"
                    placeholder="Add notes about this appointment..." />
                  <button onClick={() => handleSaveNotes(a._id)}
                    className="mt-2 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-700 transition-colors font-medium">Save Notes</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
