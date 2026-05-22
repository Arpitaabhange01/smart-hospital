import { useState, useEffect, useCallback } from 'react';
import { Users, SkipForward, Play, CheckCircle, XCircle, Clock, User, AlertTriangle } from 'lucide-react';
import API from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';

export default function DoctorQueue() {
  const [queue, setQueue] = useState([]);
  const [todayCount, setTodayCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [calling, setCalling] = useState(false);
  const { socket } = useSocket();

  const fetchQueue = useCallback(async () => {
    try {
      const res = await API.get('/queue/doctor');
      setQueue(res.data.queue);
      setTodayCount(res.data.todayCount);
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchQueue(); }, [fetchQueue]);
  useEffect(() => {
    if (!socket) return;
    socket.on('queue:update', (data) => {
      if (Array.isArray(data)) { setQueue(data); }
    });
    return () => { socket.off('queue:update'); };
  }, [socket]);

  const handleCallNext = async () => {
    setCalling(true);
    try {
      const res = await API.post('/queue/call-next');
      toast.success(res.data.message);
      fetchQueue();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); } finally { setCalling(false); }
  };

  const handleAction = async (id, action, msg) => {
    try {
      const endpoints = { start: `/queue/start/${id}`, complete: `/queue/complete/${id}`, noshow: `/queue/no-show/${id}` };
      await API.put(endpoints[action]);
      toast.success(msg);
      fetchQueue();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const waiting = queue.filter((e) => e.status === 'waiting');
  const called = queue.filter((e) => e.status === 'called');
  const inProgress = queue.filter((e) => e.status === 'in-progress');

  const statusBadge = (s) => {
    const m = { waiting: 'bg-amber-100 text-amber-700', called: 'bg-blue-100 text-blue-700', 'in-progress': 'bg-green-100 text-green-700', completed: 'bg-gray-100 text-gray-600', 'no-show': 'bg-red-100 text-red-600' };
    return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m[s] || ''}`}>{s}</span>;
  };

  const priorityIcon = (p) => {
    if (p === 'emergency') return <AlertTriangle className="w-3.5 h-3.5 text-red-500" />;
    if (p === 'urgent') return <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />;
    return null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Patient Queue</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your OPD queue in real-time.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayCount}</p>
            <p className="text-xs text-gray-400">Today's patients</p>
          </div>
          <button onClick={handleCallNext} disabled={calling || waiting.length === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm">
            <SkipForward className="w-4 h-4" /> {calling ? 'Calling...' : waiting.length > 0 ? 'Call Next' : 'No Patients'}
          </button>
        </div>
      </div>

      {inProgress.length > 0 && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="font-semibold text-green-700 dark:text-green-400 text-sm">In Consultation</span>
            </div>
            <button onClick={() => handleAction(inProgress[0]._id, 'complete', 'Consultation completed')}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700">
              <CheckCircle className="w-3.5 h-3.5" /> Complete
            </button>
          </div>
          <div className="mt-2 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-700 dark:text-green-400 font-semibold text-sm">
              {inProgress[0].patient?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white text-sm">Token #{inProgress[0].tokenNumber} — {inProgress[0].patient?.name}</p>
              <p className="text-xs text-gray-500">{inProgress[0].patient?.phone}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900 dark:text-white">Waiting Room ({waiting.length})</h2>
            {called.length > 0 && (
              <span className="text-xs text-blue-600 bg-blue-50 dark:bg-blue-900/20 px-2.5 py-1 rounded-full font-medium">{called.length} called</span>
            )}
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {waiting.length === 0 && called.length === 0 ? (
              <div className="text-center py-10">
                <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400 dark:text-gray-500 text-sm">Queue is empty.</p>
              </div>
            ) : (
              [...waiting, ...called].map((entry) => (
                <div key={entry._id} className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                  entry.status === 'called' ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-700' : 'border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                      entry.priority === 'emergency' ? 'bg-red-100 text-red-600' :
                      entry.priority === 'urgent' ? 'bg-amber-100 text-amber-600' :
                      'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}>
                      {entry.tokenNumber}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-medium text-sm text-gray-900 dark:text-white">{entry.patient?.name || 'Unknown'}</span>
                        {priorityIcon(entry.priority)}
                        {statusBadge(entry.status)}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                        <Clock className="w-3 h-3" />
                        <span>{entry.estimatedWaitMinutes} min est.</span>
                        <span>·</span>
                        <span>{new Date(entry.checkedInAt).toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {entry.status === 'called' && (
                      <button onClick={() => handleAction(entry._id, 'start', 'Consultation started')}
                        className="p-1.5 rounded-lg bg-green-100 text-green-600 hover:bg-green-200">
                        <Play className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => handleAction(entry._id, 'noshow', 'Marked as no-show')}
                      className="p-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100">
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Completed Today</h2>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            <p className="text-xs text-gray-400 mb-2">{todayCount} total patients checked in today</p>
            <p className="text-center py-8 text-gray-400 text-sm">View completed patients from the Appointments page.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
