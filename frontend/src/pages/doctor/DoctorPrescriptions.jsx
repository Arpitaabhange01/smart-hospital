import { useState, useEffect, useRef, useCallback } from 'react';
import { Plus, Trash2, Pill, Mic, MicOff, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../utils/api';
import { checkInteractions, checkAllInteractions, severityColors } from '../../utils/drugInteractions';

export default function DoctorPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [patients, setPatients] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [form, setForm] = useState({
    patientId: '', appointmentId: '', diagnosis: '', notes: '',
    medicines: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }],
  });
  const [interactionWarnings, setInteractionWarnings] = useState([]);
  const [recording, setRecording] = useState(false);
  const [recordingField, setRecordingField] = useState(null);
  const recognitionRef = useRef(null);
  const [existingPatientMeds, setExistingPatientMeds] = useState([]);

  const fetchPrescriptions = useCallback(async () => {
    try { const res = await API.get('/doctor/prescriptions'); setPrescriptions(res.data.prescriptions); } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPrescriptions(); API.get('/doctor/appointments').then((res) => {
    const unique = [...new Map(res.data.appointments.filter(a => a.patient).map(a => [a.patient._id, a.patient])).values()];
    setPatients(unique);
  }).catch(() => {}); }, [fetchPrescriptions]);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  const startRecording = useCallback((field) => {
    if (!SpeechRecognition) { toast.error('Voice input not supported in this browser.'); return; }
    if (recording) return;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;
    setRecording(true);
    setRecordingField(field);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results).map((r) => r[0].transcript).join('');
      if (field === 'diagnosis') setForm((prev) => ({ ...prev, diagnosis: transcript }));
      else if (field === 'notes') setForm((prev) => ({ ...prev, notes: transcript }));
      else if (field.startsWith('medicine-')) {
        const idx = parseInt(field.split('-')[1]);
        setForm((prev) => {
          const meds = [...prev.medicines];
          if (meds[idx]) meds[idx].name = transcript;
          return { ...prev, medicines: meds };
        });
      }
    };
    recognition.onerror = () => { setRecording(false); setRecordingField(null); toast.error('Voice input error'); };
    recognition.onend = () => { setRecording(false); setRecordingField(null); };
    recognition.start();
  }, [recording, SpeechRecognition]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
    setRecording(false); setRecordingField(null);
  }, []);

  useEffect(() => {
    return () => { if (recognitionRef.current) recognitionRef.current.stop(); };
  }, []);

  const addMedicine = () => {
    setForm({ ...form, medicines: [...form.medicines, { name: '', dosage: '', frequency: '', duration: '', notes: '' }] });
  };

  const removeMedicine = (i) => {
    const meds = form.medicines.filter((_, idx) => idx !== i);
    setForm({ ...form, medicines: meds });
  };

  const updateMedicine = (i, field, value) => {
    const meds = [...form.medicines];
    meds[i][field] = value;
    setForm({ ...form, medicines: meds });

    if (field === 'name' && value.trim()) {
      const allNames = meds.filter((m, idx) => idx !== i).map((m) => m.name).filter(Boolean);
      const warnings = checkInteractions(value, [...existingPatientMeds, ...allNames]);
      setInteractionWarnings((prev) => {
        const filtered = prev.filter((w) => !w.between || !w.between.includes(value));
        return [...filtered, ...warnings.map((w) => ({ ...w, between: [value, w.drugs.find((d) => allNames.some((n) => n.toLowerCase().includes(d.toLowerCase()) || d.toLowerCase().includes(n.toLowerCase())))] }))];
      });
    }
  };

  useEffect(() => {
    if (form.medicines.length > 0) {
      const names = form.medicines.map((m) => m.name).filter(Boolean);
      const allWarnings = checkAllInteractions(names);
      setInteractionWarnings(allWarnings);
    }
  }, [form.medicines]);

  const loadPatientMeds = async (patientId) => {
    if (!patientId) return;
    try {
      const res = await API.get(`/doctor/prescriptions`);
      const patientPrescs = res.data.prescriptions.filter((p) => p.patient?._id === patientId || p.patient === patientId);
      const meds = patientPrescs.flatMap((p) => p.medicines.map((m) => m.name)).filter(Boolean);
      setExistingPatientMeds([...new Set(meds)]);
    } catch {}
  };

  const handlePatientSelect = (patientId) => {
    setForm({ ...form, patientId, medicines: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }] });
    setInteractionWarnings([]);
    if (patientId) loadPatientMeds(patientId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId) { toast.error('Select a patient'); return; }
    if (!form.medicines.length || !form.medicines[0].name) { toast.error('Add at least one medicine'); return; }
    try {
      await API.post('/doctor/prescriptions', form);
      toast.success('Prescription created');
      setShowForm(false);
      setForm({ patientId: '', appointmentId: '', diagnosis: '', notes: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '', notes: '' }] });
      setInteractionWarnings([]);
      setExistingPatientMeds([]);
      fetchPrescriptions();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to create'); }
  };

  const MicButton = ({ field, size = 'sm' }) => (
    <button type="button" onClick={() => recording && recordingField === field ? stopRecording() : startRecording(field)}
      className={`p-1.5 rounded-lg transition-colors ${
        recording && recordingField === field ? 'bg-red-100 text-red-600 animate-pulse' : 'text-gray-400 hover:bg-gray-100 hover:text-primary-600'
      }`} title={recording && recordingField === field ? 'Stop recording' : 'Voice input'}>
      {recording && recordingField === field ? <MicOff className={`w-${size === 'sm' ? 3.5 : 4} h-${size === 'sm' ? 3.5 : 4}`} /> : <Mic className={`w-${size === 'sm' ? 3.5 : 4} h-${size === 'sm' ? 3.5 : 4}`} />}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Prescriptions</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Create and manage patient prescriptions.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium text-sm">
          <Plus className="w-4 h-4" /> New Prescription
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-card mb-8 space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Patient</label>
              <select value={form.patientId} onChange={(e) => handlePatientSelect(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm">
                <option value="">Select patient</option>
                {patients.map((p) => (<option key={p._id} value={p._id}>{p.name} ({p.email})</option>))}
              </select>
            </div>
          </div>

          {existingPatientMeds.length > 0 && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Patient's Current Medications</p>
              <p className="text-xs text-blue-600 dark:text-blue-300">{existingPatientMeds.join(', ')}</p>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Diagnosis</label>
              <MicButton field="diagnosis" />
            </div>
            <input type="text" value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm" placeholder="Enter diagnosis or use voice input..." />
          </div>

          {interactionWarnings.length > 0 && (
            <div className="space-y-2">
              {interactionWarnings.map((w, idx) => {
                const colors = severityColors[w.severity] || severityColors.moderate;
                return (
                  <div key={idx} className={`p-3 rounded-xl border ${colors.bg} ${colors.border}`}>
                    <div className="flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold uppercase">{colors.label}</span>
                          <span className="text-xs font-semibold text-gray-700">Interaction: {w.between?.join(' + ') || w.drugs.join(' + ')}</span>
                        </div>
                        <p className="text-xs text-gray-600 mt-0.5">{w.effect}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Medicines</label>
              <button type="button" onClick={addMedicine} className="text-xs text-emerald-600 hover:underline font-medium">+ Add Medicine</button>
            </div>
            {form.medicines.map((m, i) => (
              <div key={i} className="flex gap-2 items-start mb-2 p-3 bg-gray-50 dark:bg-gray-700/30 rounded-xl">
                <div className="grid grid-cols-4 gap-2 flex-1">
                  <div className="relative">
                    <input placeholder="Name" value={m.name} onChange={(e) => updateMedicine(i, 'name', e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-400 pr-8" />
                    <div className="absolute right-1 top-1/2 -translate-y-1/2">
                      <MicButton field={`medicine-${i}`} />
                    </div>
                  </div>
                  <input placeholder="Dosage" value={m.dosage} onChange={(e) => updateMedicine(i, 'dosage', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-400" />
                  <input placeholder="Frequency" value={m.frequency} onChange={(e) => updateMedicine(i, 'frequency', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-400" />
                  <input placeholder="Duration" value={m.duration} onChange={(e) => updateMedicine(i, 'duration', e.target.value)}
                    className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:border-emerald-400" />
                </div>
                {form.medicines.length > 1 && (
                  <button type="button" onClick={() => removeMedicine(i)} className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                )}
              </div>
            ))}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Additional Notes</label>
              <MicButton field="notes" size="sm" />
            </div>
            <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm resize-none" />
          </div>

          <button type="submit" className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors">Save Prescription</button>
        </form>
      )}

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : prescriptions.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-card">
          <Pill className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No prescriptions yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((p) => (
            <div key={p._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
              <button onClick={() => setExpanded(expanded === p._id ? null : p._id)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                    <Pill className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{p.patient?.name}</p>
                    <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()} · {p.medicines?.length} medicine(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {p._id && <a href={`/api/pdf/prescription/${p._id}`} target="_blank" rel="noopener noreferrer"
                    className="text-xs text-primary-600 hover:underline font-medium" onClick={(e) => e.stopPropagation()}>PDF ↓</a>}
                  <span className="text-gray-400 text-lg">{expanded === p._id ? '−' : '+'}</span>
                </div>
              </button>
              {expanded === p._id && (
                <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-3">
                  {p.diagnosis && <p className="text-sm text-gray-600 dark:text-gray-300 mb-3"><strong>Diagnosis:</strong> {p.diagnosis}</p>}
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-gray-400 dark:text-gray-500 text-xs border-b border-gray-100 dark:border-gray-700">
                        <th className="pb-2 font-medium">Medicine</th><th className="pb-2 font-medium">Dosage</th><th className="pb-2 font-medium">Frequency</th><th className="pb-2 font-medium">Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {p.medicines.map((m, i) => (
                        <tr key={i} className="border-b border-gray-50 dark:border-gray-700/50">
                          <td className="py-2 font-medium text-gray-800 dark:text-gray-200">{m.name}</td>
                          <td className="py-2 text-gray-500 dark:text-gray-400">{m.dosage}</td>
                          <td className="py-2 text-gray-500 dark:text-gray-400">{m.frequency}</td>
                          <td className="py-2 text-gray-500 dark:text-gray-400">{m.duration}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {p.notes && <p className="text-sm text-gray-500 dark:text-gray-400 mt-3"><strong>Notes:</strong> {p.notes}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
