import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, CalendarDays } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import API from '../../utils/api';

const COLORS = ['#0f4c81', '#00c9a7', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function AdminRevenue() {
  const [stats, setStats] = useState({ totalRevenue: 0, paidInvoices: 0, pendingInvoices: 0, totalInvoices: 0 });
  const [monthlyData, setMonthlyData] = useState([]);
  const [statusData, setStatusData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await API.get('/billing');
        const invoices = res.data.invoices || [];

        const totalRevenue = invoices.filter((i) => i.status === 'paid').reduce((sum, i) => sum + i.total, 0);
        setStats({
          totalRevenue,
          paidInvoices: invoices.filter((i) => i.status === 'paid').length,
          pendingInvoices: invoices.filter((i) => i.status === 'pending').length,
          totalInvoices: invoices.length,
        });

        const monthlyMap = {};
        const statusCounts = { paid: 0, pending: 0, cancelled: 0 };
        invoices.forEach((inv) => {
          const d = new Date(inv.createdAt);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          if (!monthlyMap[key]) monthlyMap[key] = { month: key, revenue: 0, count: 0 };
          if (inv.status === 'paid') monthlyMap[key].revenue += inv.total;
          monthlyMap[key].count += 1;
          statusCounts[inv.status] = (statusCounts[inv.status] || 0) + 1;
        });
        setMonthlyData(Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month)));
        setStatusData(Object.entries(statusCounts).map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value })));
      } catch {} finally { setLoading(false); }
    };
    fetch();
  }, []);

  const cards = [
    { icon: DollarSign, label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, color: 'bg-green-50 text-green-600' },
    { icon: TrendingUp, label: 'Paid Invoices', value: stats.paidInvoices, color: 'bg-blue-50 text-blue-600' },
    { icon: TrendingDown, label: 'Pending', value: stats.pendingInvoices, color: 'bg-amber-50 text-amber-600' },
    { icon: CalendarDays, label: 'Total Invoices', value: stats.totalInvoices, color: 'bg-purple-50 text-purple-600' },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Revenue Dashboard</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track earnings, invoices, and payment trends.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((c) => (
          <div key={c.label} className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-card">
            <div className={`w-10 h-10 ${c.color} rounded-xl flex items-center justify-center mb-3`}>
              <c.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{c.value}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Monthly Revenue</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} />
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
              <Bar dataKey="revenue" fill="#0f4c81" radius={[6, 6, 0, 0]} name="Revenue (₹)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card p-5">
          <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Invoice Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                {statusData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e5e7eb' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
