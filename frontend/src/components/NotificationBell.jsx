import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, CheckCheck, CalendarClock, CreditCard, Pill, FileText, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../utils/api';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';

const iconMap = {
  appointment_reminder: CalendarClock,
  payment: CreditCard,
  prescription: Pill,
  report: FileText,
  general: Bell,
};

const colorMap = {
  appointment_reminder: 'text-blue-500 bg-blue-50',
  payment: 'text-green-500 bg-green-50',
  prescription: 'text-purple-500 bg-purple-50',
  report: 'text-amber-500 bg-amber-50',
  general: 'text-gray-500 bg-gray-50',
};

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef();
  const { socket } = useSocket();

  const fetchNotifs = useCallback(async () => {
    try {
      const res = await API.get('/notifications');
      setNotifs(res.data.notifications);
      setUnread(res.data.unreadCount);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifs();
    if (socket) {
      socket.on('notification', (data) => {
        setNotifs((prev) => [data, ...prev]);
        if (!data.isRead) setUnread((u) => u + 1);
      });
      return () => { socket.off('notification'); };
    }
  }, [socket, fetchNotifs]);

  useEffect(() => { const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }; document.addEventListener('mousedown', handler); return () => document.removeEventListener('mousedown', handler); }, []);

  const markAll = async () => {
    try { await API.put('/notifications/read-all'); setUnread(0); setNotifs((p) => p.map((n) => ({ ...n, isRead: true }))); } catch {}
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(!open)} className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        {unread > 0 && (
          <motion.span key={unread} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">{unread > 9 ? '9+' : unread}</motion.span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
              <span className="font-semibold text-sm text-gray-800 dark:text-gray-200">Notifications</span>
              {unread > 0 && (
                <button onClick={markAll} className="flex items-center gap-1 text-xs text-primary-600 hover:underline font-medium">
                  <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>
            <div className="overflow-y-auto max-h-72">
              {notifs.length === 0 ? (
                <div className="text-center py-8 text-gray-400 text-sm">No notifications</div>
              ) : (
                notifs.map((n) => {
                  const Icon = iconMap[n.type] || Bell;
                  const color = colorMap[n.type] || 'text-gray-500 bg-gray-50';
                  return (
                    <Link key={n._id} to={n.link || '#'} onClick={() => setOpen(false)}
                      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${!n.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}>
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{n.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{new Date(n.createdAt).toLocaleDateString()}</p>
                      </div>
                      {!n.isRead && <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />}
                    </Link>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
