import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Mail, ArrowLeft, Eye, EyeOff, CheckCircle, Lock } from 'lucide-react';
import { useAuth } from "../context/AuthContext";
import toast from 'react-hot-toast';

const STEPS = { EMAIL: 1, OTP: 2, NEW_PASSWORD: 3, SUCCESS: 4 };

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(STEPS.EMAIL);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState('');
  const [passwords, setPasswords] = useState({ password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { forgotPassword, verifyForgotOTP, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await forgotPassword(email);
      toast.success('OTP sent to your email');
      setStep(STEPS.OTP);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleOtpChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) document.getElementById(`fotp-${idx + 1}`)?.focus();
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpStr = otp.join('');
    if (otpStr.length !== 6) return toast.error('Enter all 6 digits');
    setLoading(true);
    try {
      const data = await verifyForgotOTP(email, otpStr);
      setResetToken(data.resetToken);
      setStep(STEPS.NEW_PASSWORD);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally { setLoading(false); }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (passwords.password !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await resetPassword(email, resetToken, passwords.password);
      setStep(STEPS.SUCCESS);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally { setLoading(false); }
  };

  const stepTitles = { [STEPS.EMAIL]: 'Forgot Password', [STEPS.OTP]: 'Verify OTP', [STEPS.NEW_PASSWORD]: 'Set New Password', [STEPS.SUCCESS]: 'All Done!' };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <div className="w-10 h-10 bg-hero-gradient rounded-xl flex items-center justify-center shadow-glow">
            <Heart className="w-5 h-5 text-white" fill="white" />
          </div>
          <span className="font-display font-bold text-xl text-primary-900">Smart<span className="text-accent">Hospital</span></span>
        </Link>

        <div className="bg-white rounded-2xl p-8 shadow-card border border-gray-100">
          {/* Back link */}
          {step !== STEPS.SUCCESS && (
            <Link to="/login" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
              <ArrowLeft className="w-4 h-4" /> Back to Login
            </Link>
          )}

          <h1 className="font-display text-2xl font-bold text-gray-900 mb-2">{stepTitles[step]}</h1>

          {/* STEP 1 */}
          {step === STEPS.EMAIL && (
            <>
              <p className="text-gray-500 text-sm mb-6">Enter your registered email and we'll send you an OTP to reset your password.</p>
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="email" required placeholder="your@email.com" value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-xl transition-all disabled:opacity-70">
                  {loading ? 'Sending OTP...' : 'Send OTP'}
                </button>
              </form>
            </>
          )}

          {/* STEP 2 */}
          {step === STEPS.OTP && (
            <>
              <p className="text-gray-500 text-sm mb-6">
                Enter the 6-digit OTP sent to <strong className="text-gray-800">{email}</strong>
              </p>
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div className="flex gap-2 justify-center">
                  {otp.map((digit, i) => (
                    <input key={i} id={`fotp-${i}`} type="text" maxLength={1} value={digit}
                      onChange={(e) => handleOtpChange(e.target.value, i)}
                      onKeyDown={(e) => { if (e.key === 'Backspace' && !otp[i] && i > 0) document.getElementById(`fotp-${i - 1}`)?.focus(); }}
                      className="w-11 h-13 text-center text-xl font-bold border-2 border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-100 outline-none transition bg-gray-50 py-3" />
                  ))}
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-xl transition-all disabled:opacity-70">
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </form>
              <p className="text-center text-sm text-gray-500 mt-4">
                Didn't receive?{' '}
                <button onClick={handleSendOTP} className="text-primary-600 font-semibold hover:underline">Resend</button>
              </p>
            </>
          )}

          {/* STEP 3 */}
          {step === STEPS.NEW_PASSWORD && (
            <>
              <p className="text-gray-500 text-sm mb-6">Create a strong new password for your account.</p>
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type={showPass ? 'text' : 'password'} required placeholder="New Password" value={passwords.password}
                    onChange={(e) => setPasswords({ ...passwords, password: e.target.value })}
                    className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="password" required placeholder="Confirm New Password" value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 outline-none transition text-sm" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full py-3.5 bg-primary-700 hover:bg-primary-800 text-white font-semibold rounded-xl transition-all disabled:opacity-70">
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>
            </>
          )}

          {/* STEP 4 — Success */}
          {step === STEPS.SUCCESS && (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <p className="text-gray-600 mb-2">Password reset successfully!</p>
              <p className="text-gray-400 text-sm">Redirecting to login...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
