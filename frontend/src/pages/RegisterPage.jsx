import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Heart, User, Mail, Lock, Phone, CheckCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';

const STEPS = { REGISTER: 1, VERIFY: 2, SUCCESS: 3 };

export default function RegisterPage() {
  const [step, setStep] = useState(STEPS.REGISTER);
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '', role: 'patient' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, verifyOTP } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleRegister = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone, role: form.role });
      toast.success(`OTP sent to ${form.email}`);
      setStep(STEPS.VERIFY);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) document.getElementById(`otp-${idx + 1}`)?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      document.getElementById(`otp-${idx - 1}`)?.focus();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) return toast.error('Enter all 6 digits');
    setLoading(true);
    try {
      const data = await verifyOTP(form.email, otpStr);
      setStep(STEPS.SUCCESS);
      const paths = { patient: '/patient/dashboard', doctor: '/doctor/dashboard', admin: '/admin/dashboard', receptionist: '/receptionist/dashboard' };
      setTimeout(() => navigate(paths[data.user?.role] || '/patient/dashboard'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 bg-hero-gradient p-12">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-white text-xl">Smart<span className="text-accent">Hospital</span></span>
        </Link>
        <div>
          <h2 className="font-display text-4xl font-bold text-white mb-4 leading-tight">
            Join Our Healthcare Community
          </h2>
          <p className="text-white/70 leading-relaxed mb-8">
            Access AI-powered health tools, book appointments, and manage your health records all in one place.
          </p>
          <div className="space-y-3">
            {['AI Symptom Checker', 'Digital Health Records', 'Online Prescriptions', '24/7 Health Support'].map((f) => (
              <div key={f} className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-accent flex-shrink-0" />
                <span className="text-white/80 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-white/40 text-sm">© {new Date().getFullYear()} Smart Hospital</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-primary-700 text-white' : 'bg-gray-200 text-gray-500'}`}>{s}</div>
                {s < 2 && <div className={`w-12 h-0.5 ${step > s ? 'bg-primary-700' : 'bg-gray-200'} transition-all`} />}
              </div>
            ))}
            <span className="text-sm text-gray-500 ml-2">{step === STEPS.REGISTER ? 'Create Account' : 'Verify Email'}</span>
          </div>

          {/* STEP 1 — Register */}
          {step === STEPS.REGISTER && (
            <>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
              <p className="text-gray-500 mb-8">Fill in your details to get started.</p>
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="name" type="text" required placeholder="Full Name" value={form.name} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm" />
                </div>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="email" type="email" required placeholder="Email Address" value={form.email} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm" />
                </div>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="phone" type="tel" placeholder="Phone Number (optional)" value={form.phone} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm" />
                </div>
                <div className="relative">
                  <select name="role" value={form.role} onChange={handleChange}
                    className="w-full pl-4 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm bg-white appearance-none cursor-pointer">
                    <option value="patient">Patient</option>
                    <option value="doctor">Doctor</option>
                    <option value="receptionist">Receptionist</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="password" type={showPass ? 'text' : 'password'} required placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange}
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input name="confirmPassword" type="password" required placeholder="Confirm Password" value={form.confirmPassword} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-70 mt-2">
                  {loading ? 'Sending OTP...' : 'Create Account'}
                </button>
              </form>
              <p className="text-center text-gray-500 text-sm mt-6">
                Already have an account?{' '}
                <Link to="/login" className="text-primary-700 font-semibold hover:underline">Login</Link>
              </p>
            </>
          )}

          {/* STEP 2 — Verify OTP */}
          {step === STEPS.VERIFY && (
            <>
              <button onClick={() => setStep(STEPS.REGISTER)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
              <p className="text-gray-500 mb-8">
                We sent a 6-digit OTP to <strong className="text-gray-800">{form.email}</strong>
              </p>
              <form onSubmit={handleVerify} className="space-y-6">
                <div className="flex gap-3 justify-center">
                  {otp.map((digit, i) => (
                    <input key={i} id={`otp-${i}`} type="text" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => handleOtpKeyDown(e, i)}
                      className="w-12 h-14 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition bg-gray-50" />
                  ))}
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-xl transition-all disabled:opacity-70">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
              <p className="text-center text-gray-500 text-sm mt-4">
                Didn't receive?{' '}
                <button onClick={handleRegister} className="text-primary-700 font-semibold hover:underline">Resend OTP</button>
              </p>
            </>
          )}

          {/* STEP 3 — Success */}
          {step === STEPS.SUCCESS && (
            <div className="text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h1 className="font-display text-3xl font-bold text-gray-900 mb-2">Account Created!</h1>
              <p className="text-gray-500">Redirecting to your dashboard...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
