import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { ShieldCheck, Stethoscope, Mail, Lock, KeyRound, Building2, User } from 'lucide-react';

export const DoctorAuth = () => {
  const [identifier, setIdentifier] = useState('dr.anjali.mehta@healthpassport.in');
  const [password, setPassword] = useState('Password123!');
  const [loading, setLoading] = useState(false);

  const { login, personas, switchPersona } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login({
        identifier,
        password,
        role: 'doctor'
      });

      addToast({
        title: 'Doctor Portal Authenticated',
        message: 'Welcome to your clinical dashboard.',
        type: 'success'
      });

      navigate('/doctor/dashboard');
    } catch (err) {
      addToast({
        title: 'Authentication Failed',
        message: err.response?.data?.error || 'Invalid doctor credentials',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (userId) => {
    await switchPersona(userId);
    navigate('/doctor/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 gradient-mesh">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Stethoscope className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">HEALTH PASSPORT</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900">Healthcare Provider Portal</h2>
        <p className="mt-1 text-xs text-slate-500">
          Doctor & Hospital Administration Login
        </p>
      </div>

      {/* Main Login Card */}
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200">
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Doctor Email, Doctor ID or Reg. Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="dr.anjali.mehta@healthpassport.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <Link to="/auth/forgot-password" className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  required
                />
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition mt-2"
            >
              {loading ? (
                'Authenticating Provider...'
              ) : (
                <>
                  <Stethoscope className="w-4 h-4" />
                  <span>Sign In as Healthcare Provider</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Doctors */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2 text-center">
              1-Click Demo Doctors
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {personas.doctors?.slice(0, 4).map((d) => (
                <button
                  key={d.userId}
                  type="button"
                  onClick={() => handleDemoLogin(d.userId)}
                  className="p-2 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 text-left transition text-[11px]"
                >
                  <div className="font-bold text-slate-800 truncate">{d.name}</div>
                  <div className="text-[10px] text-indigo-600 truncate">{d.specialization}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 text-center">
            <Link to="/auth/patient" className="text-xs text-slate-500 hover:text-sky-600 font-medium">
              Are you a patient? <strong className="text-sky-600">Patient Portal Login</strong>
            </Link>
          </div>

        </div>
      </div>

    </div>
  );
};
