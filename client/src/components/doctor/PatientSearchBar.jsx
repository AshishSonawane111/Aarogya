import React, { useState } from 'react';
import { Search, QrCode, ShieldAlert, CheckCircle2, User, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { doctorAPI } from '../../services/api';
import { ConsentRequestModal } from './ConsentRequestModal';

export const PatientSearchBar = ({ onPatientFound }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchResult, setSearchResult] = useState(null);
  const [error, setError] = useState('');
  const [showConsentModal, setShowConsentModal] = useState(false);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError('');
    setSearchResult(null);

    try {
      const res = await doctorAPI.searchPatient(query);
      setSearchResult(res.data);
      if (onPatientFound) onPatientFound(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'No patient record found for this identifier.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (healthId) => {
    setQuery(healthId);
    // Auto trigger search
    setTimeout(() => {
      doctorAPI.searchPatient(healthId).then(res => {
        setSearchResult(res.data);
        if (onPatientFound) onPatientFound(res.data);
      }).catch(err => {
        setError(err.response?.data?.error || 'Search error');
      });
    }, 100);
  };

  return (
    <div className="space-y-4">
      
      {/* Search Input Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Search className="w-4 h-4 text-sky-600" />
            Patient Lookup (Digital Health ID or QR Code)
          </h3>
          <span className="text-[10px] uppercase font-bold text-slate-400">Zero-Trust Protected</span>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Health ID e.g. HP-2026-1001 or scan QR data..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-sky-500 focus:outline-none"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-600/20 transition shrink-0"
          >
            {loading ? 'Searching...' : 'Identify Patient'}
          </button>
        </form>

        {/* Quick Sample IDs */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-xs text-slate-500">
          <span className="text-[11px] font-medium">Quick Demo Samples:</span>
          {['HP-2026-1001', 'HP-2026-1002', 'HP-2026-1003', 'HP-2026-1004', 'HP-2026-1005'].map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => handleQuickDemoSelect(id)}
              className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-sky-50 hover:text-sky-700 font-mono text-[11px] border border-slate-200 transition"
            >
              {id}
            </button>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-in fade-in-50">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Patient Found Zero-Trust Result Card */}
      {searchResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-lg overflow-hidden animate-in fade-in-50">
          
          {/* Header Status Bar */}
          <div className={`px-6 py-3 flex items-center justify-between text-xs font-semibold ${
            searchResult.has_active_consent
              ? 'bg-emerald-50 text-emerald-800 border-b border-emerald-200'
              : 'bg-amber-50 text-amber-900 border-b border-amber-200'
          }`}>
            <div className="flex items-center gap-2">
              {searchResult.has_active_consent ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-4 h-4 text-amber-600" />
              )}
              <span>{searchResult.security_message}</span>
            </div>
            <span className="font-mono text-[11px] uppercase tracking-wider">
              Audit Record Logged
            </span>
          </div>

          {/* Patient Card */}
          <div className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <img
                src={searchResult.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face'}
                alt="Patient"
                className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-sm"
              />

              <div className="flex-1 text-center sm:text-left space-y-1">
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <h4 className="text-lg font-bold text-slate-900">
                    {searchResult.first_name} {searchResult.last_name}
                  </h4>
                  <span className="text-xs font-mono font-bold bg-sky-50 text-sky-700 px-2 py-0.5 rounded-lg border border-sky-200">
                    {searchResult.health_id_number}
                  </span>
                </div>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 pt-1">
                  <span>Gender: <strong className="capitalize">{searchResult.gender}</strong></span>
                  <span>DOB: <strong>{searchResult.dob}</strong></span>
                  <span>Blood Group: <strong className="text-rose-600">{searchResult.blood_group}</strong></span>
                  <span>Location: <strong>{searchResult.city}</strong></span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
                {searchResult.has_active_consent ? (
                  <a
                    href={`/doctor/authorized-patients?patientId=${searchResult.patient_id}`}
                    className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition w-full sm:w-auto"
                  >
                    <span>View Permitted Records</span>
                    <ArrowRight className="w-4 h-4" />
                  </a>
                ) : (
                  <button
                    onClick={() => setShowConsentModal(true)}
                    className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition w-full sm:w-auto"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>Request Medical Access</span>
                  </button>
                )}
              </div>
            </div>

            {/* Zero-Trust Notice when unauthorized */}
            {!searchResult.has_active_consent && (
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <div className="font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600" />
                  Zero-Trust Protection Active
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Medical history, lab reports, prescriptions, and scans are completely hidden. Click <strong>"Request Medical Access"</strong> to specify the categories and duration required for clinical care.
                </p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Consent Request Modal */}
      {searchResult && (
        <ConsentRequestModal
          isOpen={showConsentModal}
          onClose={() => setShowConsentModal(false)}
          patient={searchResult}
          onSuccess={() => {
            setShowConsentModal(false);
            handleSearch();
          }}
        />
      )}

    </div>
  );
};
