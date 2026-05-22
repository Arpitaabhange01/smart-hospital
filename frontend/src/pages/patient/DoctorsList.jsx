import { useState, useEffect } from 'react';
import { Stethoscope, MapPin, Clock, DollarSign, ChevronRight, Loader } from 'lucide-react';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function DoctorsList({ onCheckin }) {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingIn, setCheckingIn] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      try { const res = await API.get('/patient/doctors'); setDoctors(res.data.doctors); } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleCheckin = async (doctor) => {
    setCheckingIn(doctor._id);
    try {
      const res = await API.post('/queue/checkin', { doctorId: doctor.user?._id || doctor._id, priority: 'normal' });
      toast.success(res.data.message);
      if (onCheckin) onCheckin();
    } catch (err) { toast.error(err.response?.data?.message || 'Check-in failed'); } finally { setCheckingIn(null); }
  };

  if (loading) return <div className="flex justify-center py-16"><Loader className="w-6 h-6 text-primary-500 animate-spin" /></div>;

  return (
    <div>
      <h2 className="font-display text-xl font-bold text-gray-900 dark:text-white mb-1">Select a Doctor</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Choose a doctor to check in for your consultation.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {doctors.map((doc) => (
          <div key={doc._id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-lg">
                  {doc.user?.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">Dr. {doc.user?.name}</h3>
                  <p className="text-xs text-primary-600 dark:text-primary-400 font-medium">{doc.specialization}</p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400">{doc.department}</span>
            </div>
            <div className="space-y-1.5 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <MapPin className="w-3.5 h-3.5" />
                <span>{doc.experience} years experience</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <DollarSign className="w-3.5 h-3.5" />
                <span>₹{doc.fees} consultation fee</span>
              </div>
              {doc.about && <p className="text-xs text-gray-400 dark:text-gray-500 line-clamp-2 mt-1">{doc.about}</p>}
            </div>
            <button onClick={() => handleCheckin(doc)} disabled={checkingIn === doc._id}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-700 text-white rounded-xl hover:bg-primary-800 disabled:opacity-50 transition-colors text-sm font-medium">
              {checkingIn === doc._id ? 'Checking in...' : 'Check In'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
