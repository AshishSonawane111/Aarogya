import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { ShieldCheck, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToast } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSubmitted(true);
      addToast({
        title: 'Reset Link Sent',
        message: `Password reset instructions dispatched to ${email}.`,
        type: 'success'
      });
    } catch (err) {
      addToast({
        title: 'Error',
        message: err.response?.data?.error || 'Email not found',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 gradient-mesh">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-3">
          <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">HEALTH PASSPORT</span>
        </Link>
        <h2 className="text-2xl font-extrabold text-slate-900">Reset Password</h2>
        <p className="mt-1 text-xs text-slate-500">
          Enter your registered email to receive secure recovery instructions.
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-slate-200">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Recovery Email Dispatched</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                We've sent password reset instructions to <strong>{email}</strong>. Please check your inbox and follow the secure link.
              </p>
              <Link
                to="/auth/patient"
                className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 hover:text-sky-800 pt-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Registered Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="rajesh.kumar@healthpassport.in"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                    required
                  />
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition"
              >
                {loading ? 'Sending Instructions...' : 'Send Recovery Instructions'}
              </button>

              <div className="text-center pt-2">
                <Link
                  to="/auth/patient"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
