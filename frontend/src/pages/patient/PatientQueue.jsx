import { useState, useEffect, useCallback } from 'react';
import { Clock, User, CheckCircle, MapPin, AlertTriangle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../utils/api';
import { useSocket } from '../../context/SocketContext';
import DoctorsList from './DoctorsList';

export default function PatientQueue() {
  const [activeQueue, setActiveQueue] = useState(null);
  const [position, setPosition] = useState(null);
  const [totalWaiting, setTotalWaiting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCheckin, setShowCheckin] = useState(false);
  const { socket } = useSocket();

  const fetchStatus = useCallback(async () => {
    try {
      const res = await API.get('/queue/my-status');
      if (res.data.queue) {
        setActiveQueue(res.data.queue);
        setPosition(res.data.position);
        setTotalWaiting(res.data.totalWaiting);
      } else {
        setActiveQueue(null);
        setPosition(null);
        setTotalWaiting(null);
      }
    } catch {} finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchStatus(); }, [fetchStatus]);
  useEffect(() => {
    if (!socket) return;
    const handler = (data) => {
      if (data?.myEntry) {
        setActiveQueue(data.myEntry);
        setPosition(data.position);
        setTotalWaiting(data.totalWaiting);
      }
    };
    const calledHandler = (data) => {
      setActiveQueue((prev) => prev ? { ...prev, status: 'called' } : prev);
    };
    socket.on('queue:update', handler);
    socket.on('queue:called', calledHandler);
    return () => { socket.off('queue:update', handler); socket.off('queue:called', calledHandler); };
  }, [socket]);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader className="w-6 h-6 text-primary-500 animate-spin" /></div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">OPD Queue</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Check in and track your position in the queue.</p>
      </div>

      <AnimatePresence mode="wait">
        {activeQueue && activeQueue.status !== 'completed' && activeQueue.status !== 'no-show' && activeQueue.status !== 'cancelled' ? (
          <motion.div key="active" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Your Token</p>
                  <p className="text-5xl font-bold text-primary-700 dark:text-primary-400">#{activeQueue.tokenNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    activeQueue.status === 'waiting' ? 'bg-amber-100 text-amber-700' :
                    activeQueue.status === 'called' ? 'bg-green-100 text-green-700 animate-pulse' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {activeQueue.status === 'called' ? '🔵 Please Proceed to Cabin!' : activeQueue.status.charAt(0).toUpperCase() + activeQueue.status.slice(1)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Position</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{position} <span className="text-sm font-normal text-gray-400">of {totalWaiting}</span></p>
                </div>
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Est. Wait Time</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{activeQueue.estimatedWaitMinutes || '—'} <span className="text-sm font-normal text-gray-400">min</span></p>
                </div>
              </div>

              {activeQueue.status === 'called' && (
                <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-ping" />
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400 text-sm">Doctor is ready!</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Please proceed to the doctor's cabin immediately.</p>
                  </div>
                </motion.div>
              )}

              <button onClick={() => setShowCheckin(false)}
                className="mt-4 w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium">
                ← Back to Doctors
              </button>
            </div>
          </motion.div>
        ) : activeQueue?.status === 'completed' ? (
          <motion.div key="completed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-8 text-center mb-6">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Consultation Completed</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Your consultation with the doctor is complete.</p>
            <button onClick={() => setActiveQueue(null)}
              className="px-5 py-2.5 bg-primary-700 text-white rounded-xl hover:bg-primary-800 transition-colors text-sm font-medium">
              Check In Again
            </button>
          </motion.div>
        ) : (
          <motion.div key="checkin" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <DoctorsList onCheckin={() => { fetchStatus(); setShowCheckin(false); }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
