import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Stethoscope, Users, CalendarCheck, BarChart3, DollarSign, Shield, Moon, Sun, LogOut, Heart, Pill, Building2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useDarkMode } from '../context/DarkModeContext';
import NotificationBell from './NotificationBell';
import toast from 'react-hot-toast';

const links = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/doctors', icon: Stethoscope, label: 'Manage Doctors' },
  { to: '/admin/patients', icon: Users, label: 'Manage Patients' },
  { to: '/admin/appointments', icon: CalendarCheck, label: 'Appointments' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/revenue', icon: DollarSign, label: 'Revenue' },
  { to: '/admin/audit-logs', icon: Shield, label: 'Audit Logs' },
  { to: '/admin/pharmacy', icon: Pill, label: 'Pharmacy' },
  { to: '/admin/pharmacy/dispense', icon: Pill, label: 'Dispense' },
  { to: '/admin/ipd', icon: Building2, label: 'IPD / Wards' },
];

export default function AdminSidebar() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useDarkMode();
  const handleLogout = async () => { await logout(); toast.success('Logged out'); };
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 min-h-screen flex flex-col shrink-0">
      <div className="p-5 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-violet-600 rounded-xl flex items-center justify-center">
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
                isActive ? 'bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 hover:text-gray-700 dark:hover:text-gray-200'
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
          <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-700 dark:text-violet-400 font-semibold text-xs">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{user?.name}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Admin</p>
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
