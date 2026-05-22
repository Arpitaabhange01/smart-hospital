import { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, Stethoscope } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: 'doctor123', specialization: '', department: '', experience: '', fees: '', gender: '' });

  const fetchDoctors = async () => {
    try { const res = await API.get('/admin/doctors'); setDoctors(res.data.doctors); } catch (err) {} finally { setLoading(false); }
  };
  useEffect(() => { fetchDoctors(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/admin/doctors/${editing}`, form);
        toast.success('Doctor updated');
      } else {
        await API.post('/admin/doctors', form);
        toast.success('Doctor added');
      }
      setShowForm(false); setEditing(null); resetForm(); fetchDoctors();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const handleEdit = (d) => {
    setEditing(d._id);
    setForm({ name: d.user?.name || '', email: d.user?.email || '', phone: d.user?.phone || '', password: '', specialization: d.specialization, department: d.department, experience: d.experience?.toString() || '', fees: d.fees?.toString() || '', gender: d.user?.gender || '' });
    setShowForm(true);
  };

  const handleRemove = async (id) => {
    if (!window.confirm('Remove this doctor?')) return;
    try { await API.delete(`/admin/doctors/${id}`); toast.success('Doctor removed'); fetchDoctors(); } catch (err) { toast.error('Failed to remove'); }
  };

  const resetForm = () => setForm({ name: '', email: '', phone: '', password: 'doctor123', specialization: '', department: '', experience: '', fees: '', gender: '' });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">Manage Doctors</h1>
          <p className="text-gray-500 mt-1">Add, update, or remove doctors.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditing(null); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" /> {showForm ? 'Cancel' : 'Add Doctor'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-card mb-8 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
              <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm">
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            {!editing && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password (default: doctor123)</label>
                <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm" />
              </div>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Specialization *</label>
              <input value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm" placeholder="e.g., Cardiologist" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Department *</label>
              <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm" placeholder="e.g., Cardiology" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Experience (years)</label>
              <input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Consultation Fees (₹) *</label>
              <input type="number" value={form.fees} onChange={(e) => setForm({ ...form, fees: e.target.value })} required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-violet-400 focus:ring-2 focus:ring-violet-100 outline-none text-sm" />
            </div>
          </div>
          <button type="submit" className="px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 font-medium transition-colors">
            {editing ? 'Update Doctor' : 'Add Doctor'}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-card">
          <Stethoscope className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No doctors added yet</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 font-medium">Doctor</th>
                <th className="px-6 py-3 font-medium">Specialization</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Experience</th>
                <th className="px-6 py-3 font-medium">Fees</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {doctors.map((d) => (
                <tr key={d._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-semibold text-xs">
                        {d.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800">Dr. {d.user?.name}</p>
                        <p className="text-xs text-gray-400">{d.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{d.specialization}</td>
                  <td className="px-6 py-4 text-gray-600">{d.department}</td>
                  <td className="px-6 py-4 text-gray-600">{d.experience} yrs</td>
                  <td className="px-6 py-4 text-gray-600">₹{d.fees}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(d)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleRemove(d._id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
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
