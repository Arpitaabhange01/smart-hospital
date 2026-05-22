import { useState, useEffect } from 'react';
import { Calendar, FileText, Pill } from 'lucide-react';
import API from '../../utils/api';

export default function PatientHistory() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientData, setPatientData] = useState(null);

  useEffect(() => {
    API.get('/doctor/appointments').then((res) => { setAppointments(res.data.appointments); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const uniquePatients = [...new Map(appointments.filter(a => a.patient).map(a => [a.patient._id, a.patient])).values()];

  const viewPatient = async (id) => {
    try {
      const res = await API.get(`/doctor/patients/${id}`);
      setPatientData(res.data);
      setSelectedPatient(id);
    } catch (err) {}
  };

  const statusBadge = (s) => {
    const m = { pending: 'bg-amber-50 text-amber-600', confirmed: 'bg-green-50 text-green-600', cancelled: 'bg-red-50 text-red-500', completed: 'bg-blue-50 text-blue-600' };
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${m[s] || ''}`}>{s}</span>;
  };

  if (selectedPatient && patientData) {
    return (
      <div className="max-w-5xl mx-auto">
        <button onClick={() => { setSelectedPatient(null); setPatientData(null); }} className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-1">&larr; Back to Patients</button>
        
        <div className="bg-white p-6 rounded-xl shadow-card mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xl">
              {patientData.patient?.name?.charAt(0)}
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-gray-900">{patientData.patient?.name}</h2>
              <p className="text-sm text-gray-400">{patientData.patient?.email} · {patientData.patient?.phone}</p>
              {patientData.patient?.gender && <p className="text-xs text-gray-400">{patientData.patient.gender} · {patientData.patient.dateOfBirth ? new Date(patientData.patient.dateOfBirth).toLocaleDateString() : '—'}</p>}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-card">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Calendar className="w-5 h-5" /> Appointments</h3>
            {patientData.appointments?.length === 0 ? (<p className="text-gray-400 text-sm">No appointments</p>) : (
              <div className="space-y-2">
                {patientData.appointments?.map((a) => (
                  <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-800">{new Date(a.date).toLocaleDateString()} at {a.timeSlot}</p>
                      {a.reason && <p className="text-xs text-gray-400">{a.reason}</p>}
                    </div>
                    {statusBadge(a.status)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-card">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><Pill className="w-5 h-5" /> Prescriptions</h3>
            {patientData.prescriptions?.length === 0 ? (<p className="text-gray-400 text-sm">No prescriptions</p>) : (
              <div className="space-y-2">
                {patientData.prescriptions?.map((p) => (
                  <div key={p._id} className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-400 mb-1">{new Date(p.createdAt).toLocaleDateString()} · {p.medicines?.length} medicines</p>
                    {p.medicines?.map((m, i) => (
                      <p key={i} className="text-sm text-gray-700">{m.name} — {m.dosage}, {m.frequency}, {m.duration}</p>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white p-6 rounded-xl shadow-card lg:col-span-2">
            <h3 className="font-display text-lg font-bold text-gray-900 mb-4 flex items-center gap-2"><FileText className="w-5 h-5" /> Reports</h3>
            {patientData.reports?.length === 0 ? (<p className="text-gray-400 text-sm">No reports</p>) : (
              <div className="space-y-2">
                {patientData.reports?.map((r) => (
                  <div key={r._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div>
                      <p className="text-sm font-medium text-gray-800">{r.title}</p>
                      <p className="text-xs text-gray-400">{r.reportType} · {new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    {r.fileUrl && <a href={r.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:underline">View</a>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Patients</h1>
        <p className="text-gray-500 mt-1">View patient history, prescriptions, and reports.</p>
      </div>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : uniquePatients.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-card">
          <UsersIcon className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No patients yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {uniquePatients.map((p) => (
            <div key={p._id} onClick={() => viewPatient(p._id)}
              className="bg-white p-5 rounded-xl shadow-card hover:shadow-card-hover transition-shadow cursor-pointer flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold">
                  {p.name?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{p.name}</p>
                  <p className="text-sm text-gray-400">{p.email}</p>
                </div>
              </div>
              <span className="text-sm text-emerald-600 font-medium">View History →</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UsersIcon(props) {
  return (
    <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
