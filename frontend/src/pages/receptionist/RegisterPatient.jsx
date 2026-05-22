import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function RegisterPatient() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: 'password123', gender: '', dateOfBirth: '', address: { street: '', city: '', state: '', pincode: '' } });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm({ ...form, address: { ...form.address, [field]: value } });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.phone) { toast.error('Name, email, and phone are required'); return; }
    setLoading(true);
    try {
      await API.post('/receptionist/patients', form);
      toast.success('Patient registered successfully!');
      navigate('/receptionist/dashboard');
    } catch (err) { toast.error(err.response?.data?.message || 'Registration failed'); } finally { setLoading(false); }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Register Walk-in Patient</h1>
        <p className="text-gray-500 mt-1">Create a new patient account for walk-in visits.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-card space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name *</label>
            <input name="name" value={form.name} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone *</label>
            <input name="phone" value={form.phone} onChange={handleChange} required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm">
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Date of Birth</label>
            <input name="dateOfBirth" type="date" value={form.dateOfBirth} onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm" />
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Address</p>
          <div className="grid md:grid-cols-2 gap-3">
            <input name="address.street" placeholder="Street" value={form.address.street} onChange={handleChange}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm" />
            <input name="address.city" placeholder="City" value={form.address.city} onChange={handleChange}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm" />
            <input name="address.state" placeholder="State" value={form.address.state} onChange={handleChange}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm" />
            <input name="address.pincode" placeholder="Pincode" value={form.address.pincode} onChange={handleChange}
              className="px-4 py-3 rounded-xl border border-gray-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-sm" />
          </div>
        </div>

        <button type="submit" disabled={loading}
          className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
          <UserPlus className="w-4 h-4" /> {loading ? 'Registering...' : 'Register Patient'}
        </button>
      </form>
    </div>
  );
}
