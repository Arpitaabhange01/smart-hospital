import { useState, useEffect } from 'react';
import { Pill, Plus, Search, AlertTriangle, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

export default function PharmacyDashboard() {
  const [medicines, setMedicines] = useState([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', genericName: '', category: 'Tablet', strength: '', manufacturer: '', price: '', stock: '', minStock: '10', unit: 'strip', requiresPrescription: true });

  useEffect(() => {
    const fetch = async () => {
      try { const res = await API.get('/pharmacy/medicines'); setMedicines(res.data.medicines); } catch {}
    };
    fetch();
  }, []);

  const filtered = medicines.filter((m) =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase()) || m.genericName?.toLowerCase().includes(search.toLowerCase())
  );

  const lowStock = medicines.filter((m) => m.stock <= (m.minStock || 10));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await API.put(`/pharmacy/medicines/${editing}`, form);
        toast.success('Medicine updated');
      } else {
        await API.post('/pharmacy/medicines', form);
        toast.success('Medicine added');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ name: '', genericName: '', category: 'Tablet', strength: '', manufacturer: '', price: '', stock: '', minStock: '10', unit: 'strip', requiresPrescription: true });
      const res = await API.get('/pharmacy/medicines');
      setMedicines(res.data.medicines);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const handleEdit = (m) => {
    setEditing(m._id);
    setForm({ name: m.name, genericName: m.genericName || '', category: m.category, strength: m.strength || '', manufacturer: m.manufacturer || '', price: m.price, stock: m.stock, minStock: m.minStock || '10', unit: m.unit, requiresPrescription: m.requiresPrescription });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this medicine?')) return;
    try { await API.delete(`/pharmacy/medicines/${id}`); toast.success('Removed'); setMedicines((p) => p.filter((m) => m._id !== id)); } catch (err) { toast.error('Error'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Pharmacy</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage medicine inventory and dispense.</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: '', genericName: '', category: 'Tablet', strength: '', manufacturer: '', price: '', stock: '', minStock: '10', unit: 'strip', requiresPrescription: true }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-700 text-white rounded-xl hover:bg-primary-800 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" /> Add Medicine
        </button>
      </div>

      {lowStock.length > 0 && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-sm text-red-700 dark:text-red-400">{lowStock.length} medicine{lowStock.length > 1 ? 's' : ''} low in stock</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">{lowStock.map((m) => `${m.name} (${m.stock} left)`).join(', ')}</p>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card">
        <div className="p-4 border-b border-gray-100 dark:border-gray-700">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicines..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="px-4 py-3">Medicine</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Stock</th>
                <th className="px-4 py-3">Min Stock</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((m) => (
                <tr key={m._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Pill className="w-4 h-4 text-primary-500" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{m.name}</p>
                        {m.genericName && <p className="text-xs text-gray-400">{m.genericName}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">{m.category}</td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">₹{m.price}</td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${m.stock <= (m.minStock || 10) ? 'text-red-500' : 'text-green-600 dark:text-green-400'}`}>{m.stock}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{m.minStock || 10}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleEdit(m)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-primary-600"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => handleDelete(m._id)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">No medicines found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-display text-lg font-bold text-gray-900 dark:text-white mb-4">{editing ? 'Edit Medicine' : 'Add Medicine'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Medicine Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Generic Name</label>
                  <input value={form.genericName} onChange={(e) => setForm({ ...form, genericName: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {['Tablet', 'Capsule', 'Syrup', 'Injection', 'Cream', 'Drops', 'Inhaler', 'Other'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Strength</label>
                  <input value={form.strength} onChange={(e) => setForm({ ...form, strength: e.target.value })} placeholder="e.g. 500mg" className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Price (₹) *</label>
                  <input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Stock *</label>
                  <input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Min Stock Alert</label>
                  <input type="number" min="0" value={form.minStock} onChange={(e) => setForm({ ...form, minStock: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Unit</label>
                  <select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} className="w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500">
                    {['strip', 'bottle', 'box', 'vial', 'tube', 'unit'].map((u) => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="rx" checked={form.requiresPrescription} onChange={(e) => setForm({ ...form, requiresPrescription: e.target.checked })} className="rounded border-gray-300" />
                <label htmlFor="rx" className="text-sm text-gray-600 dark:text-gray-400">Requires Prescription</label>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm font-medium bg-primary-700 text-white rounded-xl hover:bg-primary-800">{editing ? 'Update' : 'Add'} Medicine</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
