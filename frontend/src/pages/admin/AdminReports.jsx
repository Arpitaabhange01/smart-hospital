import { useState, useEffect } from 'react';
import { Stethoscope, Users, CalendarCheck } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import API from '../../utils/api';

const COLORS = ['#f59e0b', '#10b981', '#ef4444', '#3b82f6'];

export default function AdminReports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/admin/reports').then((res) => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-gray-400 text-sm">Loading...</p>;
  if (!data) return <p className="text-gray-400 text-sm">No data available</p>;

  const { stats, appointmentsByStatus, appointmentsByMonth } = data;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900">Reports & Analytics</h1>
        <p className="text-gray-500 mt-1">Overview of hospital statistics and trends.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-5 rounded-xl shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600"><Stethoscope className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDoctors}</p>
              <p className="text-sm text-gray-500">Total Doctors</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600"><Users className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              <p className="text-sm text-gray-500">Total Patients</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl shadow-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600"><CalendarCheck className="w-5 h-5" /></div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAppointments}</p>
              <p className="text-sm text-gray-500">Total Appointments</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-card">
          <h3 className="font-display text-lg font-bold text-gray-900 mb-4">Appointments by Status</h3>
          {appointmentsByStatus?.length === 0 ? (
            <p className="text-gray-400 text-sm">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={appointmentsByStatus} cx="50%" cy="50%" outerRadius={100} dataKey="count" nameKey="_id"
                  label={({ _id, count }) => `${_id}: ${count}`}>
                  {appointmentsByStatus?.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-xl shadow-card">
          <h3 className="font-display text-lg font-bold text-gray-900 mb-4">Monthly Trend</h3>
          {appointmentsByMonth?.length === 0 ? (
            <p className="text-gray-400 text-sm">No data</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={appointmentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="_id" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} dot={{ fill: '#7c3aed', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-card">
        <h3 className="font-display text-lg font-bold text-gray-900 mb-4">Monthly Bar Chart</h3>
        {appointmentsByMonth?.length === 0 ? (
          <p className="text-gray-400 text-sm">No data</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
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
  );
}
