import { useState, useEffect } from 'react';
import { FileText, Download, Brain, Sparkles, AlertTriangle, X } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function MyReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [summarizing, setSummarizing] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  useEffect(() => {
    API.get('/patient/reports').then((res) => { setReports(res.data.reports); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const handleSummarize = async (report) => {
    setSummaryLoading(true);
    setSummarizing(report._id);
    try {
      const text = `${report.title}. ${report.description || ''} ${report.reportType || 'General'}`;
      const res = await API.post('/ai/summarize-report', { reportText: text });
      setSummary({ reportId: report._id, ...res.data });
    } catch (err) {
      toast.error('Failed to summarize report');
    } finally { setSummaryLoading(false); setSummarizing(null); }
  };

  const closeSummary = () => setSummary(null);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Medical Reports</h1>
        <p className="text-gray-500 mt-1">View, download, and get AI summaries of your medical reports.</p>
      </div>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-card">
          <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No reports uploaded yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r._id} className="bg-white rounded-xl shadow-card overflow-hidden">
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{r.title}</p>
                    <p className="text-xs text-gray-400">{r.doctor ? `Dr. ${r.doctor.name}` : 'Self'} · {new Date(r.createdAt).toLocaleDateString()}</p>
                    {r.description && <p className="text-sm text-gray-500 mt-0.5">{r.description}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleSummarize(r)} disabled={summaryLoading && summarizing === r._id}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors font-medium disabled:opacity-50">
                    <Brain className="w-4 h-4" /> {summaryLoading && summarizing === r._id ? '...' : 'Summarize'}
                  </button>
                  {r.fileUrl && (
                    <a href={r.fileUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 rounded-lg transition-colors font-medium">
                      <Download className="w-4 h-4" /> View
                    </a>
                  )}
                </div>
              </div>
              {summary?.reportId === r._id && (
                <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-500" /> AI Summary
                    </h4>
                    <button onClick={closeSummary} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{summary.summary}</p>
                  <div className="mb-3">
                    <p className="text-xs font-medium text-gray-500 mb-1.5">Key Findings:</p>
                    <ul className="space-y-1">
                      {summary.keyFindings?.map((f, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 shrink-0" /> {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {summary.recommendation && (
                    <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">{summary.recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
