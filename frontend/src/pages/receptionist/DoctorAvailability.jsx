import { useState, useEffect } from 'react';
import { Stethoscope, Clock, Calendar } from 'lucide-react';
import API from '../../utils/api';

export default function DoctorAvailability() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/receptionist/doctors').then((res) => { setDoctors(res.data.doctors); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Doctor Availability</h1>
        <p className="text-gray-500 mt-1">View all doctors and their schedules.</p>
      </div>
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : doctors.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl shadow-card">
          <Stethoscope className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500">No doctors available</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {doctors.map((d) => (
            <div key={d._id} className="bg-white p-5 rounded-xl shadow-card">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dr. {d.user?.name}</h3>
                  <p className="text-sm text-green-600">{d.specialization}</p>
                  <p className="text-xs text-gray-400">{d.experience} yrs exp · ₹{d.fees}</p>
                </div>
              </div>
              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-medium text-gray-500 mb-2 flex items-center gap-1"><Calendar className="w-3 h-3" /> Availability</p>
                {d.availability && d.availability.length > 0 ? (
                  <div className="space-y-1">
                    {d.availability.map((av, i) => (
                      <div key={i} className="flex items-center justify-between text-xs">
                        <span className="text-gray-600 font-medium">{av.day}</span>
                        <span className="text-gray-400">{av.slots?.join(', ')}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">No schedule set</p>
                )}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 flex items-center gap-1.5 text-xs text-gray-400">
                <Clock className="w-3 h-3" /> Department: {d.department}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
