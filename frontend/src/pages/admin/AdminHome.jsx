import { useState, useEffect } from 'react';
import { Stethoscope, Users, CalendarCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import API from '../../utils/api';

const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

export default function AdminHome() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/reports').then((res) => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;
  if (!data) return <p className="text-gray-400 text-sm">Failed to load data</p>;

  const { stats, appointmentsByStatus, appointmentsByMonth, recentAppointments } = data;

  const statCards = [
    { icon: Stethoscope, label: 'Total Doctors', value: stats.totalDoctors, color: 'bg-purple-50 text-purple-600' },
    { icon: Users, label: 'Total Patients', value: stats.totalPatients, color: 'bg-blue-50 text-blue-600' },
    { icon: CalendarCheck, label: 'Total Appointments', value: stats.totalAppointments, color: 'bg-green-50 text-green-600' },
  ];

  const statusData = appointmentsByStatus?.map((s) => ({ name: s._id, value: s.count })) || [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-1">Overview of the hospital system.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {statCards.map((c) => (
          <div key={c.label} className="bg-white p-5 rounded-xl shadow-card">
            <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{c.value}</p>
            <p className="text-sm text-gray-500">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-card">
          <h3 className="font-display text-lg font-bold text-gray-900 mb-4">Appointments by Status</h3>
          {statusData.length === 0 ? (
            <p className="text-gray-400 text-sm">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <h3 className="font-display text-lg font-bold text-gray-900 mb-4">Appointments per Month</h3>
          {appointmentsByMonth?.length === 0 ? (
            <p className="text-gray-400 text-sm">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={appointmentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-gray-900">Recent Appointments</h3>
          <Link to="/admin/appointments" className="text-sm text-violet-600 hover:underline font-medium">View All</Link>
        </div>
        {recentAppointments?.length === 0 ? (
          <p className="text-gray-400 text-sm">No appointments</p>
        ) : (
          <div className="space-y-3">
            {recentAppointments?.map((a) => (
              <div key={a._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-xs">
                    {a.patient?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{a.patient?.name}</p>
                    <p className="text-xs text-gray-400">Dr. {a.doctor?.name} · {new Date(a.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                  a.status === 'confirmed' ? 'bg-green-50 text-green-600' : a.status === 'completed' ? 'bg-blue-50 text-blue-600' : a.status === 'cancelled' ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-600'
                }`}>{a.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
