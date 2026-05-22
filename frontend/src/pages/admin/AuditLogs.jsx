import { useState, useEffect } from 'react';
import { Search, Shield, Filter } from 'lucide-react';
import API from '../../utils/api';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const params = {};
        if (actionFilter) params.action = actionFilter;
        const res = await API.get('/audit', { params });
        setLogs(res.data.logs);
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, [actionFilter]);

  const filtered = logs.filter((l) =>
    !search || l.user?.name?.toLowerCase().includes(search.toLowerCase()) || l.resource?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase())
  );

  const actionBadge = (a) => {
    const m = { create: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', delete: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400', login: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', logout: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400' };
    return <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${m[a] || 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>{a}</span>;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Track all sensitive actions performed in the system.</p>
        </div>
        <div className="flex items-center gap-3">
          <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)} className="px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
            <option value="">All Actions</option>
            <option value="create">Create</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
            <option value="login">Login</option>
            <option value="logout">Logout</option>
          </select>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search user or resource..." className="pl-9 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 w-64" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-700">
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Resource</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filtered.map((l) => (
                <tr key={l._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">{new Date(l.timestamp).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">{l.user?.name || 'System'}</span>
                    </div>
                    <span className="text-xs text-gray-400">{l.user?.email}</span>
                  </td>
                  <td className="px-4 py-3">{actionBadge(l.action)}</td>
                  <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                    <span className="font-medium">{l.resource}</span>
                    {l.resourceId && <span className="text-xs text-gray-400 ml-1">#{l.resourceId.slice(-6)}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 max-w-xs truncate">{l.details ? JSON.stringify(l.details).slice(0, 60) : '-'}</td>
                  <td className="px-4 py-3 text-xs text-gray-400 font-mono">{l.ip || '-'}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="text-center py-8 text-gray-400">No audit logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
