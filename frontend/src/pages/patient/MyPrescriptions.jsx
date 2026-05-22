import { useState, useEffect } from 'react';
import { Pill } from 'lucide-react';
import API from '../../utils/api';

export default function MyPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    API.get('/patient/prescriptions').then((res) => { setPrescriptions(res.data.prescriptions); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-gray-500 mt-1">View all prescriptions given by your doctors.</p>
      </div>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-card">
          <Pill className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No prescriptions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => (
            <div key={p._id} className="bg-white rounded-xl shadow-card overflow-hidden">
              <button onClick={() => setExpanded(expanded === p._id ? null : p._id)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Dr. {p.doctor?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()} · {p.medicines?.length} medicine(s)</p>
                  </div>
                </div>
                <span className="text-gray-400 text-lg">{expanded === p._id ? '−' : '+'}</span>
              </button>
              {expanded === p._id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-3">
                  {p.diagnosis && <p className="text-sm text-gray-600 mb-3"><strong>Diagnosis:</strong> {p.diagnosis}</p>}
                  {p.notes && <p className="text-sm text-gray-500 mb-3"><strong>Notes:</strong> {p.notes}</p>}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 text-xs border-b border-gray-100">
                        <th className="pb-2 font-medium">Medicine</th>
                        <th className="pb-2 font-medium">Dosage</th>
                        <th className="pb-2 font-medium">Frequency</th>
                        <th className="pb-2 font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.medicines.map((m, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          <td className="py-2 font-medium text-gray-800">{m.name}</td>
                          <td className="py-2 text-gray-500">{m.dosage}</td>
                          <td className="py-2 text-gray-500">{m.frequency}</td>
                          <td className="py-2 text-gray-500">{m.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </div>
          ))}
        </div>
      )}
    </div>
  );
}
