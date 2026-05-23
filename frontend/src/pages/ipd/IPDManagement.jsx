import { useState, useEffect } from 'react';
import { Building2, Plus, LogOut, User } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

export default function IPDManagement() {
  const [wards, setWards] = useState([]);
  const [admissions, setAdmissions] = useState([]);
  const [tab, setTab] = useState('admissions');
  const [showAdmit, setShowAdmit] = useState(false);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [form, setForm] = useState({ patientId: '', doctorId: '', wardId: '', diagnosis: '', expectedDischargeDate: '', notes: '' });
  const [wardForm, setWardForm] = useState({ name: '', type: 'General', totalBeds: '', availableBeds: '', pricePerDay: '', floor: '' });
  const [showWardModal, setShowWardModal] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [wardRes, admRes, patRes, docRes] = await Promise.all([
          API.get('/ipd/wards'),
          API.get('/ipd/admissions'),
          API.get('/admin/patients'),
          API.get('/admin/doctors'),
        ]);
        setWards(wardRes.data.wards);
        setAdmissions(admRes.data.admissions);
        setPatients(patRes.data.patients || []);
        setDoctors(docRes.data.doctors || []);
      } catch {} 
    };
    fetch();
  }, []);

  const handleAdmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/ipd/admit', form);
      toast.success('Patient admitted');
      setShowAdmit(false);
      setForm({ patientId: '', doctorId: '', wardId: '', diagnosis: '', expectedDischargeDate: '', notes: '' });
      const [wardRes, admRes] = await Promise.all([API.get('/ipd/wards'), API.get('/ipd/admissions')]);
      setWards(wardRes.data.wards);
      setAdmissions(admRes.data.admissions);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleDischarge = async (id) => {
    if (!window.confirm('Discharge this patient?')) return;
    try {
      await API.put(`/ipd/discharge/${id}`);
      toast.success('Patient discharged');
      const [wardRes, admRes] = await Promise.all([API.get('/ipd/wards'), API.get('/ipd/admissions')]);
      setWards(wardRes.data.wards);
      setAdmissions(admRes.data.admissions);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleAddWard = async (e) => {
    e.preventDefault();
    try {
      await API.post('/ipd/wards', wardForm);
      toast.success('Ward added');
      setShowWardModal(false);
      setWardForm({ name: '', type: 'General', totalBeds: '', availableBeds: '', pricePerDay: '', floor: '' });
      const res = await API.get('/ipd/wards');
      setWards(res.data.wards);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const statusBadge = (s) => {
    const m = { admitted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', discharged: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400', transferred: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' };
    return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m[s] || ''}`}>{s}</span>;
  };

  const admitted = admissions.filter((a) => a.status === 'admitted');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">IPD / Ward Management</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage wards, admissions, and discharges.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowWardModal(true)} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-sm">
            <Building2 className="w-4 h-4" /> Add Ward
          </button>
          <button onClick={() => setShowAdmit(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary-700 text-white rounded-xl hover:bg-primary-800 transition-colors font-medium text-sm">
            <Plus className="w-4 h-4" /> Admit Patient
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {wards.map((w) => (
          <div key={w._id} className="bg-white dark:bg-gray-800 rounded-xl shadow-card p-4">
            <p className="font-semibold text-gray-900 dark:text-white">{w.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{w.type} · Floor {w.floor || 'N/A'}</p>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{w.availableBeds}</p>
                <p className="text-xs text-gray-400">Available</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{w.pricePerDay}</p>
                <p className="text-xs text-gray-400">/day</p>
              </div>
            </div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div className="bg-primary-500 h-1.5 rounded-full" style={{ width: `${((w.totalBeds - w.availableBeds) / w.totalBeds) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card">
        <div className="flex items-center border-b border-gray-100 dark:border-gray-700">
          <button onClick={() => setTab('admissions')} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'admissions' ? 'border-primary-600 text-primary-700 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            Active Admissions ({admitted.length})
          </button>
          <button onClick={() => setTab('history')} className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${tab === 'history' ? 'border-primary-600 text-primary-700 dark:text-primary-400' : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            All Admissions ({admissions.length})
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3">Patient</th>
                <th className="px-4 py-3">Ward / Bed</th>
                <th className="px-4 py-3">Doctor</th>
                <th className="px-4 py-3">Admitted</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {(tab === 'admissions' ? admitted : admissions).map((a) => (
                <tr key={a._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">{a.patient?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{a.ward?.name || '-'} / {a.bedNumber}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Dr. {a.doctor?.name || '-'}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs">{new Date(a.admissionDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{statusBadge(a.status)}</td>
                  <td className="px-4 py-3">
                    {a.status === 'admitted' && (
                      <button onClick={() => handleDischarge(a._id)} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <LogOut className="w-3.5 h-3.5" /> Discharge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(tab === 'admissions' ? admitted : admissions).length === 0 && (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">No admissions found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAdmit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowAdmit(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-4">Admit Patient</h2>
            <form onSubmit={handleAdmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Patient *</label>
                <select required value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                  <option value="">Select patient</option>
                  {patients.map((p) => <option key={p._id} value={p._id}>{p.name} ({p.email})</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Doctor *</label>
                  <select required value={form.doctorId} onChange={(e) => setForm({ ...form, doctorId: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">Select doctor</option>
                    {doctors.map((d) => <option key={d._id} value={d.user?._id}>{d.user?.name} ({d.specialization})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Ward *</label>
                  <select required value={form.wardId} onChange={(e) => setForm({ ...form, wardId: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                    <option value="">Select ward</option>
                    {wards.filter((w) => w.availableBeds > 0).map((w) => <option key={w._id} value={w._id}>{w.name} ({w.availableBeds} beds available)</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Diagnosis</label>
                <textarea value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} rows="2" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Expected Discharge Date</label>
                  <input type="date" value={form.expectedDischargeDate} onChange={(e) => setForm({ ...form, expectedDischargeDate: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Notes</label>
                  <input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAdmit(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary-700 text-white rounded-xl hover:bg-primary-800">Admit Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showWardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowWardModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-4">Add Ward</h2>
            <form onSubmit={handleAddWard} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Name *</label>
                  <input required value={wardForm.name} onChange={(e) => setWardForm({ ...wardForm, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Type</label>
                  <select value={wardForm.type} onChange={(e) => setWardForm({ ...wardForm, type: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                    {['General', 'Semi-Private', 'Private', 'ICU', 'NICU', 'Emergency'].map((t) => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Beds *</label>
                  <input required type="number" min="1" value={wardForm.totalBeds} onChange={(e) => setWardForm({ ...wardForm, totalBeds: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Available Beds *</label>
                  <input required type="number" min="0" value={wardForm.availableBeds} onChange={(e) => setWardForm({ ...wardForm, availableBeds: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Price Per Day (₹) *</label>
                  <input required type="number" min="0" value={wardForm.pricePerDay} onChange={(e) => setWardForm({ ...wardForm, pricePerDay: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Floor</label>
                  <input value={wardForm.floor} onChange={(e) => setWardForm({ ...wardForm, floor: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowWardModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary-700 text-white rounded-xl hover:bg-primary-800">Add Ward</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
