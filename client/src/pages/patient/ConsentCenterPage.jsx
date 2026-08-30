import React, { useState, useEffect } from 'react';
import { consentAPI, auditAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { ConsentApprovalModal } from '../../components/patient/ConsentApprovalModal';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SecurityAuditViewer } from '../../components/shared/SecurityAuditViewer';
import { 
  KeyRound, 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  CheckCircle2, 
  X, 
  Trash2, 
  History, 
  Lock,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import { formatDate, formatDateTime, getCategoryLabel } from '../../utils/helpers';

export const ConsentCenterPage = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' or 'audit'
  const [selectedConsent, setSelectedConsent] = useState(null);
  const { addToast } = useNotification();

  const fetchConsents = async () => {
    setLoading(true);
    try {
      const res = await consentAPI.listConsents();
      setConsents(res.data?.consents || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsents();
  }, []);

  const handleRevoke = async (consentId, doctorName) => {
    if (!window.confirm(`Are you sure you want to revoke access for ${doctorName} immediately?`)) return;
    try {
      await consentAPI.revokeConsent(consentId);
      addToast({
        title: 'Authorization Revoked',
        message: `Medical access for ${doctorName} has been terminated immediately.`,
        type: 'info'
      });
      fetchConsents();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDenyRequest = async (consentId, doctorName) => {
    if (!window.confirm(`Are you sure you want to reject the access request from ${doctorName}?`)) return;
    try {
      await consentAPI.denyConsent(consentId);
      addToast({
        title: 'Request Rejected',
        message: `Access request from ${doctorName} has been rejected.`,
        type: 'info'
      });
      fetchConsents();
    } catch (err) {
      console.error(err);
    }
  };

  const categoryIcons = {
    medical_history: '🩺',
    lab_reports: '🧪',
    prescriptions: '💊',
    diagnoses: '📋',
    hospital_records: '🏥',
    consultations: '📅',
    scans: '🔬',
    ayurveda: '🌿',
    complete_record: '🗂️'
  };

  const getCategoryWithIcon = (catId) => {
    const icon = categoryIcons[catId] || '📄';
    return `${icon} ${getCategoryLabel(catId)}`;
  };

  const pending = consents.filter((c) => c.status === 'pending');
  const active = consents.filter(
    (c) => c.status === 'approved' && new Date(c.valid_until) > new Date()
  );
  const historical = consents.filter(
    (c) => c.status !== 'pending' && (!active.some((a) => a.id === c.id))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-sky-600" />
            Patient Consent & Privacy Management Center
          </h2>
          <p className="text-xs text-slate-500">
            You own your records. Grant, modify, or revoke category-specific doctor access at any time.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center p-1 bg-white rounded-xl border border-slate-200 text-xs font-bold shadow-xs">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === 'requests'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Consent Permissions ({consents.length})
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-4 py-1.5 rounded-lg transition ${
              activeTab === 'audit'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Access Audit Logs
          </button>
        </div>
      </div>

      {activeTab === 'audit' ? (
        <SecurityAuditViewer />
      ) : (
        <div className="space-y-8">
          
          {/* 1. Pending Requests Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Pending Access Requests Awaiting Your Approval ({pending.length})
              </h3>
            </div>

            {pending.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No pending doctor consent requests.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pending.map((req) => (
                  <div
                    key={req.id}
                    className="bg-amber-50/50 p-5 rounded-2xl border-2 border-amber-300 shadow-sm space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-amber-200 pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={req.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face'}
                          alt="Doctor"
                          className="w-12 h-12 rounded-xl object-cover border border-amber-300"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{req.doctor_name}</h4>
                          <div className="text-xs text-amber-900 font-semibold">{req.specialization}</div>
                          <div className="text-[11px] text-slate-500">{req.hospital_name}</div>
                        </div>
                      </div>
                      <StatusBadge status="pending" />
                    </div>

                    <div className="text-xs space-y-2">
                      <div className="text-slate-700">
                        <strong>Reason:</strong> "{req.reason}"
                      </div>
                      <div className="text-slate-700">
                        <strong>Requested Information:</strong>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {req.requested_categories?.map((cat) => (
                            <span key={cat} className="px-2 py-0.5 rounded bg-white text-slate-700 text-[10px] font-semibold border border-slate-200">
                              {getCategoryWithIcon(cat)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={() => handleDenyRequest(req.id, req.doctor_name)}
                        className="flex-1 py-2.5 px-4 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center justify-center gap-1.5 transition"
                      >
                        <X className="w-4 h-4" />
                        Reject
                      </button>
                      <button
                        onClick={() => setSelectedConsent(req)}
                        className="flex-1 py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md shadow-sky-600/20 transition flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        Review & Approve
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Active Authorized Doctor Permissions */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Active Medical Access Permissions ({active.length})
            </h3>

            {active.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 text-center text-xs text-slate-400">
                No active external permissions granted. Your records are completely private.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {active.map((act) => (
                  <div
                    key={act.id}
                    className="bg-white p-5 rounded-2xl border border-emerald-300 shadow-sm hover:shadow-md transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={act.avatar_url || 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face'}
                          alt="Doctor"
                          className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-slate-900">{act.doctor_name}</h4>
                          <div className="text-xs text-sky-700 font-semibold">{act.specialization}</div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shrink-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                        Active Access — {act.approved_categories?.length || 0} {act.approved_categories?.length === 1 ? 'category' : 'categories'}
                      </span>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2">
                      <span className="text-[10px] text-slate-400 uppercase font-semibold block">Permitted Categories</span>
                      <div className="flex flex-wrap gap-2 pt-0.5">
                        {act.approved_categories?.map((cat) => (
                          <span key={cat} className="px-3 py-1 rounded-xl bg-white text-slate-800 text-[11px] font-semibold border border-slate-200 shadow-2xs">
                            {getCategoryWithIcon(cat)}
                          </span>
                        ))}
                      </div>
                      <span className="text-[10px] text-slate-400 italic block pt-1 border-t border-slate-100 mt-1">
                        Access is limited to the categories you approved.
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1 flex-wrap gap-2">
                      <div className="space-y-0.5">
                        <span className="text-slate-400 block text-[10px]">
                          Approved on: <strong className="text-slate-600 font-semibold">{formatDate(act.valid_from || act.updated_at)}</strong>
                        </span>
                        <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                          <Clock className="w-3.5 h-3.5 text-sky-600" />
                          Expires: {formatDateTime(act.valid_until)}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRevoke(act.id, act.doctor_name)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 hover:underline ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Revoke Access Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 3. Consent History Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-500" />
              Past & Historical Consent Requests ({historical.length})
            </h3>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Doctor</th>
                    <th className="p-3">Hospital</th>
                    <th className="p-3">Purpose</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {historical.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-400">
                        No previous consent history.
                      </td>
                    </tr>
                  ) : (
                    historical.map((h) => (
                      <tr key={h.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-800">{h.doctor_name}</td>
                        <td className="p-3 text-slate-500">{h.hospital_name}</td>
                        <td className="p-3 max-w-[200px] truncate">{h.reason}</td>
                        <td className="p-3">
                          <StatusBadge status={h.status} />
                        </td>
                        <td className="p-3 font-mono text-[11px] text-slate-400">
                          {formatDate(h.created_at)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Consent Approval Modal */}
      {selectedConsent && (
        <ConsentApprovalModal
          isOpen={!!selectedConsent}
          onClose={() => setSelectedConsent(null)}
          consent={selectedConsent}
          onApprove={async (id, data) => {
            try {
              await consentAPI.approveConsent(id, data);
              addToast({
                title: 'Consent Granted',
                message: 'Records access has been approved successfully.',
                type: 'success'
              });
              await fetchConsents();
            } catch (err) {
              console.error(err);
            }
          }}
          onDeny={async (id) => {
            try {
              await consentAPI.denyConsent(id);
              addToast({
                title: 'Consent Rejected',
                message: 'Access request has been rejected.',
                type: 'info'
              });
              await fetchConsents();
            } catch (err) {
              console.error(err);
            }
          }}
        />
      )}

    </div>
  );
};
