import { useState } from 'react';
import { Activity, Brain, Stethoscope, AlertTriangle, RefreshCw } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

const commonSymptoms = ['Fever', 'Headache', 'Cough', 'Sore Throat', 'Chest Pain', 'Back Pain', 'Joint Pain', 'Skin Rash', 'Nausea', 'Dizziness', 'Fatigue', 'Shortness of Breath', 'Abdominal Pain', 'Blurred Vision'];

export default function AISymptomChecker() {
  const [selected, setSelected] = useState([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);

  const toggleSymptom = (s) => {
    setSelected((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  };

  const addCustom = () => {
    if (!customSymptom.trim()) return;
    if (!selected.includes(customSymptom.trim())) {
      setSelected([...selected, customSymptom.trim()]);
    }
    setCustomSymptom('');
  };

  const handleCheck = async () => {
    if (selected.length === 0) { toast.error('Please select at least one symptom'); return; }
    setLoading(true);
    setShowForm(false);
    try {
      const res = await API.post('/ai/symptom-checker', { symptoms: selected.join(', ') });
      setResult(res.data);
    } catch (err) {
      toast.error('Failed to analyze symptoms');
      setShowForm(true);
    } finally { setLoading(false); }
  };

  const reset = () => { setSelected([]); setResult(null); setShowForm(true); setCustomSymptom(''); };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">AI Symptom Checker</h1>
        <p className="text-gray-500 mt-1">Select your symptoms and get AI-powered insights on possible conditions.</p>
      </div>

      {showForm && !loading && (
        <div className="bg-white p-6 rounded-xl shadow-card">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">What symptoms are you experiencing?</h2>
              <p className="text-xs text-gray-400">Select all that apply</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {commonSymptoms.map((s) => (
              <button key={s} onClick={() => toggleSymptom(s)}
                className={`px-3 py-2 text-sm rounded-lg border font-medium transition-all ${
                  selected.includes(s) ? 'bg-purple-600 text-white border-purple-600' : 'border-gray-200 text-gray-600 hover:border-purple-300 bg-white'
                }`}>{s}</button>
            ))}
          </div>

          <div className="flex gap-2 mb-6">
            <input type="text" value={customSymptom} onChange={(e) => setCustomSymptom(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
              placeholder="Type a symptom not listed..." className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm" />
            <button onClick={addCustom} className="px-4 py-2.5 bg-gray-100 text-gray-600 rounded-xl hover:bg-gray-200 text-sm font-medium transition-colors">Add</button>
          </div>

          {selected.length > 0 && (
            <div className="mb-4 p-3 bg-purple-50 rounded-xl">
              <p className="text-sm font-medium text-purple-700 mb-1">Selected Symptoms ({selected.length}):</p>
              <div className="flex flex-wrap gap-1.5">
                {selected.map((s) => (
                  <span key={s} className="inline-flex items-center gap-1 px-2.5 py-1 bg-white rounded-lg text-xs font-medium text-purple-600 border border-purple-200">
                    {s}
                    <button onClick={() => toggleSymptom(s)} className="text-purple-400 hover:text-purple-600">&times;</button>
                  </span>
                ))}
              </div>
            </div>
          )}

          <button onClick={handleCheck} disabled={selected.length === 0}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-70 flex items-center justify-center gap-2">
            <Brain className="w-4 h-4" /> Analyze Symptoms
          </button>
        </div>
      )}

      {loading && (
        <div className="bg-white p-12 rounded-xl shadow-card text-center">
          <div className="animate-spin w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full mx-auto mb-4" />
          <p className="text-gray-500">AI is analyzing your symptoms...</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-lg font-bold text-gray-900 flex items-center gap-2"><Brain className="w-5 h-5 text-purple-600" /> Analysis Results</h2>
              <button onClick={reset} className="flex items-center gap-1.5 text-sm text-purple-600 hover:underline font-medium">
                <RefreshCw className="w-4 h-4" /> Try Again
              </button>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> Possible Conditions</h3>
              <div className="space-y-2">
                {result.possibleConditions?.map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-purple-50 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-purple-200 flex items-center justify-center text-purple-700 font-bold text-xs">{i + 1}</div>
                    <span className="text-sm font-medium text-gray-800">{c}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl mb-4">
              <Stethoscope className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="text-xs text-blue-500 font-medium">Recommended Department</p>
                <p className="text-sm font-semibold text-blue-700">{result.recommendedDepartment}</p>
              </div>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl">
              <p className="text-xs text-amber-600 flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                {result.disclaimer || 'This is an AI-assisted analysis. Please consult a doctor for accurate diagnosis.'}
              </p>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 rounded-xl text-center">
            <p className="text-white font-semibold mb-2">Want to see a doctor?</p>
            <a href="/patient/book-appointment"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-purple-700 rounded-xl font-medium hover:bg-purple-50 transition-colors text-sm">
              <Stethoscope className="w-4 h-4" /> Book an Appointment
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
