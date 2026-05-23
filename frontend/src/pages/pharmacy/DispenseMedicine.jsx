import { useState, useEffect } from 'react';
import { Search, Pill, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/api';

export default function DispenseMedicine() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [selectedPresc, setSelectedPresc] = useState(null);
  const [dispenseItems, setDispenseItems] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetch = async () => {
      try {
        const [prescRes, medRes] = await Promise.all([
          API.get('/doctor/prescriptions'),
          API.get('/pharmacy/medicines'),
        ]);
        setPrescriptions(prescRes.data.prescriptions || []);
        setMedicines(medRes.data.medicines);
      } catch {}
    };
    fetch();
  }, []);

  const handleSelectPresc = (p) => {
    setSelectedPresc(p);
    setDispenseItems(p.medicines.map((m) => ({
      medicineId: '',
      medicineName: m.name,
      quantity: 1,
      instructions: m.notes || '',
    })));
  };

  const handleDispense = async () => {
    if (!selectedPresc) return;
    const items = dispenseItems.filter((i) => i.medicineId);
    if (!items.length) return toast.error('Select at least one medicine');
    try {
      await API.post('/pharmacy/dispense', {
        prescriptionId: selectedPresc._id,
        items: items.map((i) => ({ medicineId: i.medicineId, quantity: i.quantity, instructions: i.instructions })),
      });
      toast.success('Medicines dispensed successfully');
      setSelectedPresc(null);
      setDispenseItems([]);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const filteredMeds = medicines.filter((m) =>
    !search || m.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Dispense Medicine</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Select a prescription and dispense medicines from inventory.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Prescriptions</h2>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {prescriptions.map((p) => (
              <button key={p._id} onClick={() => handleSelectPresc(p)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedPresc?._id === p._id ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}>
                <p className="font-medium text-sm text-gray-900 dark:text-white">{p.patient?.name || 'Unknown'}</p>
                <p className="text-xs text-gray-500 mt-0.5">{p.diagnosis || 'No diagnosis'}</p>
                <p className="text-xs text-gray-400 mt-1">{p.medicines?.length} medicine{p.medicines?.length !== 1 ? 's' : ''}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
          {!selectedPresc ? (
            <div className="text-center py-10">
              <Pill className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400 dark:text-gray-500 text-sm">Select a prescription to dispense medicines.</p>
            </div>
          ) : (
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Dispensing for {selectedPresc.patient?.name}</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{selectedPresc.diagnosis}</p>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search medicine..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>

              <div className="space-y-3 max-h-60 overflow-y-auto mb-4">
                {dispenseItems.map((item, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{item.medicineName}</p>
                    <div className="flex items-center gap-2">
                      <select value={item.medicineId} onChange={(e) => {
                        const newItems = [...dispenseItems];
                        newItems[idx].medicineId = e.target.value;
                        setDispenseItems(newItems);
                      }} className="flex-1 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                        <option value="">Select medicine</option>
                        {filteredMeds.map((m) => (
                          <option key={m._id} value={m._id} disabled={m.stock <= 0}>{m.name} (₹{m.price}, Stock: {m.stock})</option>
                        ))}
                      </select>
                      <input type="number" min="1" max="10" value={item.quantity} onChange={(e) => {
                        const newItems = [...dispenseItems];
                        newItems[idx].quantity = Number(e.target.value);
                        setDispenseItems(newItems);
                      }} className="w-16 px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={handleDispense} className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm">
                <CheckCircle className="w-4 h-4" /> Dispense Medicines
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
