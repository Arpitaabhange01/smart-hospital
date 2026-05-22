import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Calendar, Clock, Search } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function BookAppointment() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [search, setSearch] = useState('');
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ date: '', timeSlot: '', reason: '' });
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const timeSlots = ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM'];

  useEffect(() => {
    API.get('/patient/doctors').then((res) => { setDoctors(res.data.doctors); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedDoctor) return;
    setSubmitting(true);
    try {
      await API.post('/patient/appointments', {
        doctorId: selectedDoctor._id,
        date: form.date,
        timeSlot: form.timeSlot,
        reason: form.reason,
      });
      toast.success('Appointment booked successfully!');
      navigate('/patient/my-appointments');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally { setSubmitting(false); }
  };

  const filtered = doctors.filter((d) =>
    d.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
    d.specialization?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Book Appointment</h1>
        <p className="text-gray-500 mt-1">Select a doctor and choose your preferred date & time.</p>
      </div>

      {/* Step 1: Select Doctor */}
      {step === 1 && (
        <div>
          <div className="relative mb-4">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search by doctor name or specialization..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
          </div>
          {loading ? (
            <p className="text-gray-400 text-sm">Loading doctors...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-sm">No doctors found.</p>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {filtered.map((d) => (
                <div key={d._id} onClick={() => { setSelectedDoctor(d); setStep(2); }}
                  className={`bg-white p-5 rounded-xl shadow-card hover:shadow-card-hover transition-all cursor-pointer border-2 ${
                    selectedDoctor?._id === d._id ? 'border-primary-400' : 'border-transparent'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center shrink-0">
                      <Stethoscope className="w-6 h-6 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">Dr. {d.user?.name}</h3>
                      <p className="text-sm text-primary-600">{d.specialization}</p>
                      <p className="text-xs text-gray-400 mt-1">{d.experience} yrs exp · ₹{d.fees}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Step 2: Date & Time */}
      {step === 2 && selectedDoctor && (
        <div>
          <button onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">&larr; Change Doctor</button>
          <div className="bg-white p-6 rounded-xl shadow-card mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Stethoscope className="w-5 h-5 text-primary-600" />
              <div>
                <p className="font-semibold text-gray-900">Dr. {selectedDoctor.user?.name}</p>
                <p className="text-sm text-gray-400">{selectedDoctor.specialization} · ₹{selectedDoctor.fees}</p>
              </div>
            </div>
          </div>
          <form onSubmit={handleBook} className="bg-white p-6 rounded-xl shadow-card space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Date</label>
              <input type="date" required value={form.date} min={tomorrow.toISOString().split('T')[0]} onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5"><Clock className="w-4 h-4" /> Time Slot</label>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {timeSlots.map((s) => (
                  <button key={s} type="button" onClick={() => setForm({ ...form, timeSlot: s })}
                    className={`px-3 py-2 text-sm rounded-lg border font-medium transition-all ${
                      form.timeSlot === s ? 'bg-primary-700 text-white border-primary-700' : 'border-gray-200 text-gray-600 hover:border-primary-300'
                    }`}>{s}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Reason (optional)</label>
              <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none text-sm resize-none"
                placeholder="Brief description of your visit..." />
            </div>
            <button type="submit" disabled={submitting || !form.timeSlot}
              className="w-full py-3 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-70">
              {submitting ? 'Booking...' : 'Confirm Appointment'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
