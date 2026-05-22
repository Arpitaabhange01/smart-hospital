import { useState, useEffect } from 'react';
import { Users, Eye, Calendar, FileText, Pill } from 'lucide-react';
import API from '../../utils/api';

export default function ManagePatients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    API.get('/admin/patients').then((res) => { setPatients(res.data.patients); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const viewPatient = async (id) => {
    try {
      const res = await API.get(`/admin/patients/${id}`);
      setPatientData(res.data);
      setSelected(id);
    } catch (err) {}
  };

  const statusBadge = (s) => {
    const m = { pending: 'bg-amber-50 text-amber-600', confirmed: 'bg-green-50 text-green-600', cancelled: 'bg-red-50 text-red-500', completed: 'bg-blue-50 text-blue-600' };
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${m[s] || ''}`}>{s}</span>;
  };

  if (selected && patientData) {
    return (
      <div className="max-w-5xl mx-auto">
        <button onClick={() => { setSelected(null); setPatientData(null); }} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">&larr; Back to Patients</button>
        <div className="bg-white p-6 rounded-xl shadow-card mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
              {patientData.patient?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">{patientData.patient?.name}</h2>
              <p className="text-sm text-gray-400">{patientData.patient?.email} · {patientData.patient?.phone}</p>
              <p className="text-xs text-gray-400">{patientData.patient?.gender} · {patientData.patient?.dateOfBirth ? new Date(patientData.patient.dateOfBirth).toLocaleDateString() : '—'}</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-card">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Appointments ({patientData.appointments?.length})</h3>
            {patientData.appointments?.length === 0 ? <p className="text-gray-400 text-sm">No appointments</p> : (
              <div className="space-y-2">{patientData.appointments?.map((a) => (
                <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-800">{new Date(a.date).toLocaleDateString()} at {a.timeSlot}</p>
                    <p className="text-xs text-gray-400">Dr. {a.doctor?.name}</p>
                  </div>
                  {statusBadge(a.status)}
                </div>
              ))}</div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-card">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Pill className="w-5 h-5" /> Prescriptions ({patientData.prescriptions?.length})</h3>
            {patientData.prescriptions?.length === 0 ? <p className="text-gray-400 text-sm">No prescriptions</p> : (
              <div className="space-y-2">{patientData.prescriptions?.map((p) => (
                <div key={p._id} className="p-3 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-400">Dr. {p.doctor?.name} · {new Date(p.createdAt).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-700 mt-1">{p.medicines?.map((m) => m.name).join(', ')}</p>
                </div>
              ))}</div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-card lg:col-span-2">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> Reports ({patientData.reports?.length})</h3>
            {patientData.reports?.length === 0 ? <p className="text-gray-400 text-sm">No reports</p> : (
              <div className="space-y-2">{patientData.reports?.map((r) => (
                <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{r.title}</p>
                    <p className="text-xs text-gray-400">{r.reportType} · {new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  {r.fileUrl && <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">View</a>}
                </div>
              ))}</div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Manage Patients</h1>
        <p className="text-gray-500 mt-1">View and manage all registered patients.</p>
      </div>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : patients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-card">
          <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No patients registered</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-400 text-xs border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 font-medium">Patient</th>
                <th className="px-6 py-3 font-medium">Email</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Gender</th>
                <th className="px-6 py-3 font-medium">Joined</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((p) => (
                <tr key={p._id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">{p.name?.charAt(0)}</div>
                      <span className="font-medium text-gray-800">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{p.email}</td>
                  <td className="px-6 py-4 text-gray-600">{p.phone || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{p.gender || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{new Date(p.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => viewPatient(p._id)} className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium">
                      <Eye className="w-4 h-4" /> View
                    </button>
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
