import { useState, useEffect } from 'react';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import API from '../../utils/api';
import toast from 'react-hot-toast';

export default function Billing() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => { fetchInvoices(); }, []);

  const fetchInvoices = async () => {
    try {
      const res = await API.get('/billing/my-invoices');
      setInvoices(res.data.invoices);
    } catch (err) {} finally { setLoading(false); }
  };

  const handlePay = async (id) => {
    try {
      await API.put(`/billing/pay/${id}`, { paymentMethod: 'Razorpay' });
      toast.success('Payment successful!');
      fetchInvoices();
      setSelected(null);
    } catch (err) { toast.error('Payment failed'); }
  };

  const statusBadge = (s) => {
    const m = { pending: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400', paid: 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400', cancelled: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400' };
    return <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${m[s] || ''}`}>{s}</span>;
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">Billing & Invoices</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">View and pay your invoices.</p>
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : invoices.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl shadow-card">
          <CreditCard className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <p className="text-gray-500 dark:text-gray-400">No invoices yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {invoices.map((inv) => (
            <motion.div key={inv._id} layout className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden border border-gray-100 dark:border-gray-700">
              <button onClick={() => setSelected(selected === inv._id ? null : inv._id)}
                className="w-full p-5 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${inv.status === 'paid' ? 'bg-green-50 text-green-600 dark:bg-green-900/20' : 'bg-amber-50 text-amber-600 dark:bg-amber-900/20'}`}>
                    {inv.status === 'paid' ? <CheckCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{inv.invoiceNumber}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(inv.createdAt).toLocaleDateString()} · {inv.items?.length} item(s)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 dark:text-white">₹{inv.total}</span>
                  {statusBadge(inv.status)}
                  <span className="text-gray-400 dark:text-gray-500 text-lg">{selected === inv._id ? '−' : '+'}</span>
                </div>
              </button>
              {selected === inv._id && (
                <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-700 pt-4">
                  <div className="space-y-2 mb-4">
                    {inv.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm py-1.5">
                        <span className="text-gray-600 dark:text-gray-400">{item.description}</span>
                        <span className="font-medium text-gray-800 dark:text-gray-200">₹{item.amount}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500 dark:text-gray-400">Subtotal</span>
                        <span className="text-gray-700 dark:text-gray-300">₹{inv.subtotal}</span>
                      </div>
                      {inv.tax > 0 && (
                        <div className="flex justify-between text-sm mt-1">
                          <span className="text-gray-500 dark:text-gray-400">Tax</span>
                          <span className="text-gray-700 dark:text-gray-300">₹{inv.tax}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-gray-900 dark:text-white mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                        <span>Total</span><span>₹{inv.total}</span>
                      </div>
                    </div>
                  </div>
                  {inv.status === 'pending' && (
                    <button onClick={() => handlePay(inv._id)}
                      className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                      <CreditCard className="w-4 h-4" /> Pay ₹{inv.total}
                    </button>
                  )}
                  {inv.status === 'paid' && (
                    <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-xl text-sm text-green-600 dark:text-green-400">
                      <CheckCircle className="w-4 h-4" /> Paid via {inv.paymentMethod} on {new Date(inv.paidAt).toLocaleDateString()}
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
