import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Calendar, CalendarCheck, Users, Pill, Upload, ListOrdered, Moon, Sun, LogOut, Heart } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';

const links = [
  { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/doctor/appointments', icon: CalendarCheck, label: 'Appointments' },
  { to: '/doctor/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/doctor/queue', icon: ListOrdered, label: 'Queue' },
  { to: '/doctor/patients', icon: Users, label: 'Patients' },
  { to: '/doctor/prescriptions', icon: Pill, label: 'Prescriptions' },
  { to: '/doctor/upload-report', icon: Upload, label: 'Upload Report' },
];

export default function DoctorSidebar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useDarkMode();
  const handleLogout = async () => { await logout(); toast.success('Logged out'); };
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 min-h-screen flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-600 rounded-xl flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" fill="white" />
            </div>
            <span className="font-display font-bold text-lg text-primary-900 dark:text-white">Smart<span className="text-accent">Hospital</span></span>
          </div>
          <NotificationBell />
        </div>
      </div>
      <div className="flex-1 py-4 px-3 space-y-1">
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200'
              }`
            }>
            <l.icon className="w-4 h-4" /> {l.label}
          </NavLink>
        ))}
      </div>
      <div className="p-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
        <button onClick={toggle}
          className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-colors font-medium">
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {dark ? 'Light Mode' : 'Dark Mode'}
        </button>
        <div className="flex items-center gap-3 px-1">
          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-semibold text-xs">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">Dr. {user?.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Doctor</p>
          </div>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors font-medium">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
