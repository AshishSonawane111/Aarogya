import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ShieldCheck, UserCheck, Mail, Lock, Phone, KeyRound, ArrowRight, Sparkles } from 'lucide-react';

export const PatientAuth = () => {
  const [authMode, setAuthMode] = useState('password'); // 'password' or 'otp'
  const [identifier, setIdentifier] = useState('rajesh.kumar@healthpassport.in');
  const [password, setPassword] = useState('Password123!');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const { login, personas, switchPersona } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (authMode === 'otp' && !otpSent) {
        setOtpSent(true);
        setOtp('748921'); // Pre-fill mock OTP
        addToast({
          title: 'OTP Dispatched',
          message: '6-digit OTP sent to your registered mobile number.',
          type: 'info'
        });
        setLoading(false);
        return;
      }

      await login({
        identifier,
        password: authMode === 'password' ? password : null,
        isOtp: authMode === 'otp',
        role: 'patient'
      });

      addToast({
        title: 'Welcome Back',
        message: 'Authenticated securely to Patient Portal.',
        type: 'success'
      });

      navigate('/patient/dashboard');
    } catch (err) {
      addToast({
        title: 'Authentication Error',
        message: err.response?.data?.error || 'Invalid credentials',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (userId) => {
    await switchPersona(userId);
    navigate('/patient/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 gradient-mesh">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">HEALTH PASSPORT</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900">Patient Portal Login</h2>
        <p className="mt-1 text-xs text-slate-500">
          Your Health. Your Records. Your Control.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200">
          
          {/* Method Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-bold mb-6">
            <button
              type="button"
              onClick={() => {
                setAuthMode('password');
                setOtpSent(false);
              }}
              className={`flex-1 py-2 rounded-lg transition ${
                authMode === 'password' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Password Login
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('otp')}
              className={`flex-1 py-2 rounded-lg transition ${
                authMode === 'otp' ? 'bg-white text-sky-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Mobile OTP Login
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {authMode === 'password' ? 'Email Address or Phone Number' : 'Registered Mobile Number'}
              </label>
              <div className="relative">
                <input
                  type={authMode === 'password' ? 'text' : 'tel'}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={authMode === 'password' ? 'rajesh.kumar@healthpassport.in' : '+91 98201 11001'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                  required
                />
                {authMode === 'password' ? (
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                ) : (
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                )}
              </div>
            </div>

            {authMode === 'password' ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">Password</label>
                  <Link to="/auth/forgot-password" className="text-[11px] font-semibold text-sky-600 hover:text-sky-800">
                    Forgot Password?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none font-mono"
                    required
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>
            ) : (
              otpSent && (
                <div className="animate-in fade-in-50">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enter 6-Digit OTP Received
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="748921"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-center tracking-widest focus:ring-2 focus:ring-sky-500 focus:outline-none"
                      required
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  </div>
                </div>
              )
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 transition mt-2"
            >
              {loading ? (
                'Authenticating...'
              ) : authMode === 'otp' && !otpSent ? (
                'Request OTP'
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  <span>Sign In as Patient</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Patients */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              1-Click Demo Patients
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {personas.patients?.slice(0, 4).map((p) => (
                <button
                  key={p.userId}
                  type="button"
                  onClick={() => handleDemoLogin(p.userId)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 text-left transition text-[11px]"
                >
                  <div className="font-bold text-slate-800 truncate">{p.name}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{p.healthId}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link to="/auth/doctor" className="text-xs text-slate-500 hover:text-indigo-600 font-medium">
              Are you a doctor or hospital admin? <strong className="text-indigo-600">Provider Login</strong>
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};
