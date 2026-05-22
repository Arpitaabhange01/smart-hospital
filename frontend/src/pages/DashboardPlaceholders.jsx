import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Heart, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

const DashboardPlaceholder = ({ role, color }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const handleLogout = async () => { await logout(); toast.success('Logged out'); navigate('/'); };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center bg-white p-12 rounded-2xl shadow-card max-w-md w-full">
        <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
          <Heart className="w-8 h-8 text-white" fill="white" />
        </div>
        <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">
          Welcome, {user?.name?.split(' ')[0]}!
        </h1>
        <p className="text-gray-500 mb-2 capitalize">{role} Dashboard</p>
        <p className="text-gray-400 text-sm mb-8">Phase 2 will build the full dashboard. ✅ Auth is working!</p>
        <button onClick={handleLogout}
          className="flex items-center gap-2 mx-auto px-6 py-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors font-medium text-sm">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );
};

export const PatientDashboard = () => <DashboardPlaceholder role="Patient" color="bg-primary-700" />;
export const DoctorDashboard = () => <DashboardPlaceholder role="Doctor" color="bg-emerald-600" />;
export const AdminDashboard = () => <DashboardPlaceholder role="Admin" color="bg-violet-600" />;
export const ReceptionistDashboard = () => <DashboardPlaceholder role="Receptionist" color="bg-amber-600" />;
