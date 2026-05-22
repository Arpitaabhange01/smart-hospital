import { useState, useEffect } from 'react';
import { Upload, FileText } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function DoctorUploadReport() {
  const [patients, setPatients] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ patientId: '', title: '', description: '', reportType: 'general' });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get('/doctor/appointments').then((res) => {
      const unique = [...new Map(res.data.appointments.filter(a => a.patient).map(a => [a.patient._id, a.patient])).values()];
      setPatients(unique);
    }).catch(() => {});
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await API.get('/doctor/reports');
      setReports(res.data.reports || []);
    } catch (err) {} finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientId || !form.title || !file) {
      toast.error('Patient, title, and file are required');
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append('patientId', form.patientId);
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('reportType', form.reportType);
      fd.append('file', file);
      await API.post('/doctor/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Report uploaded successfully');
      setForm({ patientId: '', title: '', description: '', reportType: 'general' });
      setFile(null);
      fetchReports();
    } catch (err) { toast.error(err.response?.data?.message || 'Upload failed'); } finally { setSubmitting(false); }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Upload Report</h1>
        <p className="text-gray-500 mt-1">Upload medical reports for your patients.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-card mb-8 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Patient</label>
            <select value={form.patientId} onChange={(e) => setForm({ ...form, patientId: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm">
              <option value="">Select patient</option>
              {patients.map((p) => (<option key={p._id} value={p._id}>{p.name}</option>))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Report Type</label>
            <select value={form.reportType} onChange={(e) => setForm({ ...form, reportType: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm">
              <option value="general">General</option>
              <option value="blood-test">Blood Test</option>
              <option value="x-ray">X-Ray</option>
              <option value="mri">MRI</option>
              <option value="ct-scan">CT Scan</option>
              <option value="ultrasound">Ultrasound</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Title</label>
          <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm" placeholder="e.g., Blood Report - May 2026" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Description (optional)</label>
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none text-sm resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">File (PDF, Image, DOC)</label>
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-emerald-300 transition-colors cursor-pointer"
            onClick={() => document.getElementById('file-input').click()}>
            <Upload className="w-8 h-8 mx-auto text-gray-300 mb-2" />
            <p className="text-sm text-gray-500">{file ? file.name : 'Click to upload a file'}</p>
            <p className="text-xs text-gray-400 mt-1">Max 10MB</p>
          </div>
          <input id="file-input" type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        <button type="submit" disabled={submitting}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition-colors disabled:opacity-70">
          {submitting ? 'Uploading...' : 'Upload Report'}
        </button>
      </form>

      <div className="bg-white p-6 rounded-xl shadow-card">
        <h2 className="font-display text-lg font-bold text-gray-900 mb-4">Recent Uploads</h2>
        {loading ? (
          <p className="text-gray-400 text-sm">Loading...</p>
        ) : reports.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No reports uploaded yet</p>
          </div>
        ) : (
          <p className="text-gray-500 text-sm">Reports you've uploaded will appear here.</p>
        )}
      </div>
    </div>
  );
}
