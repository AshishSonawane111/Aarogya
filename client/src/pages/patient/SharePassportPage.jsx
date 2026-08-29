import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI } from '../../services/api';
import { QRModal } from '../../components/common/QRModal';
import { useNotification } from '../../context/NotificationContext';
import {
  Share2, QrCode, Shield, Clock, Key, Eye, EyeOff,
  UserCheck, AlertCircle, ArrowRight, Copy, CheckCircle2, Sparkles
} from 'lucide-react';

const SHARE_SCOPES = [
  { id: 'emergency_profile', label: 'Emergency Profile', desc: 'Blood group, allergies, emergency contacts', emoji: '🚨', always: true },
  { id: 'health_id',         label: 'Health ID',         desc: 'Your digital health ID card', emoji: '🪪', default: true },
  { id: 'recent_records',    label: 'Recent Records',    desc: 'Last 3 medical documents', emoji: '📄', default: false },
  { id: 'current_medicines', label: 'Current Medicines', desc: 'Active prescription list', emoji: '💊', default: false },
  { id: 'conditions',        label: 'Known Conditions',  desc: 'Diagnosed conditions', emoji: '🩺', default: false },
];

export const SharePassportPage = () => {
  const { addToast } = useNotification();
  const [healthId, setHealthId] = useState(null);
  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [selectedScopes, setSelectedScopes] = useState(
    SHARE_SCOPES.filter(s => s.always || s.default).map(s => s.id)
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    patientAPI.getDashboard()
      .then(res => {
        setHealthId(res.data?.health_id);
        setPatient(res.data?.patient);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const toggleScope = (id) => {
    const scope = SHARE_SCOPES.find(s => s.id === id);
    if (scope?.always) return; // Cannot remove always-included scopes
    setSelectedScopes(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const shareUrl = healthId
    ? `${window.location.origin}/emergency/${healthId.qr_code_data || healthId.health_id_number}`
    : null;

  const handleCopy = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        addToast({ title: 'Link Copied', message: 'Health passport link copied to clipboard', type: 'success' });
      });
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">🔗 Share Health Passport</h1>
        <p className="text-sm text-slate-500 mt-0.5">Securely share your medical records with doctors and hospitals</p>
      </div>

      {/* Security Callout */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl border border-indigo-800/30 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl" aria-hidden="true" />
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="font-bold text-base">Zero-Trust Secure Sharing</h2>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-md">
                You choose exactly what to share. Doctors can only see the sections you explicitly allow.
                No data is shared without your active consent.
              </p>
            </div>
          </div>
          {healthId && (
            <button
              onClick={() => setShowQR(true)}
              className="flex items-center gap-2 px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold text-sm rounded-xl shadow-lg shadow-emerald-500/20 transition shrink-0"
            >
              <QrCode className="w-5 h-5" /> Show My QR
            </button>
          )}
        </div>
      </div>

      {/* Consent Scope Selector */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2">
          <Eye className="w-4 h-4 text-sky-600" />
          <h2 className="font-bold text-sm text-slate-800">What to Share</h2>
          <span className="ml-auto text-xs text-slate-400">Select data sections to include</span>
        </div>
        <div className="p-4 space-y-2">
          {SHARE_SCOPES.map(scope => {
            const selected = selectedScopes.includes(scope.id);
            return (
              <button
                key={scope.id}
                onClick={() => toggleScope(scope.id)}
                disabled={scope.always}
                className={`w-full flex items-center gap-3 p-3.5 rounded-xl border transition text-left ${
                  selected
                    ? scope.always
                      ? 'bg-emerald-50 border-emerald-200'
                      : 'bg-sky-50 border-sky-200'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                } ${scope.always ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="text-xl shrink-0">{scope.emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`font-bold text-xs ${selected ? 'text-slate-800' : 'text-slate-500'}`}>
                      {scope.label}
                    </span>
                    {scope.always && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-200">
                        Always included
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">{scope.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                  selected ? 'bg-sky-600 border-sky-600' : 'border-slate-300'
                } ${scope.always ? 'bg-emerald-500 border-emerald-500' : ''}`}>
                  {selected && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Share Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* QR Code Share */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <QrCode className="w-4 h-4 text-sky-600" />
            <h3 className="font-bold text-sm text-slate-800">QR Code</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Show this QR code to any doctor or hospital reception. They can scan it to view your selected health information instantly.
          </p>
          {loading ? (
            <div className="h-10 bg-slate-200 rounded-xl animate-pulse" />
          ) : healthId ? (
            <button
              onClick={() => setShowQR(true)}
              className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-2"
            >
              <QrCode className="w-4 h-4" /> Generate QR Code
            </button>
          ) : (
            <Link
              to="/patient/health-id"
              className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-sm transition flex items-center justify-center gap-2"
            >
              Set up Health ID first
            </Link>
          )}
        </div>

        {/* Link Share */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-3">
            <Share2 className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-sm text-slate-800">Emergency Link</h3>
          </div>
          <p className="text-xs text-slate-500 mb-4 leading-relaxed">
            Copy your emergency profile link to share with family or save in your emergency contacts. Always accessible without login.
          </p>
          {shareUrl ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <span className="text-xs text-slate-500 truncate flex-1 font-mono">{shareUrl}</span>
                <button
                  onClick={handleCopy}
                  className="shrink-0 btn-inline"
                  aria-label="Copy link"
                >
                  {copied
                    ? <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    : <Copy className="w-4 h-4 text-slate-400 hover:text-slate-600" />}
                </button>
              </div>
            </div>
          ) : (
            <div className="h-10 bg-slate-100 rounded-xl animate-pulse" />
          )}
        </div>
      </div>

      {/* Consent Center Link */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
        <Key className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <div className="font-bold text-sm text-amber-800">Doctor Access Consent</div>
          <p className="text-xs text-amber-700 mt-0.5">
            To grant a specific doctor ongoing access to your records (rather than a one-time QR scan), use the Consent Center.
          </p>
        </div>
        <Link
          to="/patient/consent"
          className="px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shrink-0"
        >
          Open Consent Center
        </Link>
      </div>

      {/* Phase 9 Notice */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
        <div>
          <div className="font-bold text-sm text-indigo-800">Tokenized Secure Sharing — Phase 9</div>
          <p className="text-xs text-indigo-600 mt-0.5">
            Phase 9 will introduce time-limited, scope-scoped cryptographic tokens. You'll be able to set expiry times (e.g., "valid for 1 hour") and automatically revoke access after a doctor visit.
          </p>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && healthId && patient && (
        <QRModal
          isOpen={showQR}
          onClose={() => setShowQR(false)}
          healthId={healthId.health_id_number}
          patientName={`${patient.first_name} ${patient.last_name}`}
          qrData={healthId.qr_code_data || healthId.health_id_number}
        />
      )}
    </div>
  );
};
