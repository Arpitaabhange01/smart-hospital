import { useState, useEffect } from 'react';
import { Calendar, Clock, Search } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function ReceptionistBookAppointment() {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchDoc, setSearchDoc] = useState('');
  const [searchPat, setSearchPat] = useState('');
  const [form, setForm] = useState({ patientId: '', doctorId: '', date: '', timeSlot: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);

  const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

  useEffect(() => {
    Promise.all([
      API.get('/receptionist/doctors'),
      API.get('/receptionist/patients').catch(() => ({ data: { patients: [] } })),
    ]).then(([docRes, patRes]) => {
      setDoctors(docRes.data.doctors);
      setPatients(patRes.data.patients || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.doctorId || !form.date || !form.timeSlot) {
      toast.error('All fields are required'); return;
    }
    setSubmitting(true);
    try {
      await API.post('/receptionist/appointments', form);
      toast.success('Appointment booked successfully');
      setForm({ patientId: '', doctorId: '', date: '', timeSlot: '', reason: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Booking failed'); } finally { setSubmitting(false); }
  };

  const filteredDocs = doctors.filter((d) =>
    d.user?.name?.toLowerCase().includes(searchDoc.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(searchDoc.toLowerCase())
  );

  const filteredPats = patients.filter((p) =>
    p.name?.toLowerCase().includes(searchPat.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchPat.toLowerCase()) ||
    p.phone?.includes(searchPat)
  );

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-500 mt-1">Schedule an appointment for a walk-in patient.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Patient</label>
          <input type="text" placeholder="Search patient by name, email or phone..." value={searchPat} onChange={(e) => setSearchPat(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm mb-2" />
          <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl">
            {filteredPats.length === 0 ? (
              <p className="p-3 text-sm text-gray-400">No patients found. Register one first.</p>
            ) : (
              filteredPats.map((p) => (
                <button key={p._id} type="button" onClick={() => { setForm({ ...form, patientId: p._id }); setSearchPat(`${p.name} (${p.email})`); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${form.patientId === p._id ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700'}`}>
                  {p.name} — {p.email}
                </button>
              ))
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Doctor</label>
          <div className="relative mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search doctor..." value={searchDoc} onChange={(e) => setSearchDoc(e.target.value)}
              className="w-full pl-9 pr-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm" />
          </div>
          <div className="max-h-40 overflow-y-auto border border-gray-100 rounded-xl">
            {filteredDocs.map((d) => (
              <button key={d._id} type="button" onClick={() => { setForm({ ...form, doctorId: d._id }); setSearchDoc(`Dr. ${d.user?.name} (${d.specialization})`); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${form.doctorId === d._id ? 'bg-amber-50 text-amber-700 font-medium' : 'text-gray-700'}`}>
                Dr. {d.user?.name} — {d.specialization} (₹{d.fees})
              </button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date</label>
            <input type="date" required value={form.date} min={tomorrow.toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Time Slot</label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((s) => (
                <button key={s} type="button" onClick={() => setForm({ ...form, timeSlot: s })}
                  className={`px-2 py-2 text-xs rounded-lg border font-medium transition-all ${
                    form.timeSlot === s ? 'bg-amber-600 text-white border-amber-600' : 'border-gray-200 text-gray-600 hover:border-amber-300'
                  }`}>{s}</button>
              ))}
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason (optional)</label>
          <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm resize-none" />
        </div>

        <button type="submit" disabled={submitting || !form.patientId || !form.doctorId || !form.timeSlot}
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70">
          {submitting ? 'Booking...' : 'Confirm Appointment'}
        </button>
      </form>
    </div>
  );
}
