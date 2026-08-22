import React, { useState, useEffect } from 'react';
import { consentAPI } from '../../services/api';
import { Link } from 'react-router-dom';
import { KeyRound, ShieldCheck, Clock, ArrowRight, UserCheck, Search } from 'lucide-react';
import { StatusBadge } from '../../components/common/StatusBadge';
import { formatDate, formatDateTime, getCategoryLabel } from '../../utils/helpers';

export const ConsentsPage = () => {
  const [consents, setConsents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    consentAPI.listConsents().then((res) => {
      setConsents(res.data?.consents || []);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-indigo-600" />
            Medical Access Consent Requests
          </h2>
          <p className="text-xs text-slate-500">
            Track authorization requests sent to patients, approved categories, and access validity windows.
          </p>
        </div>

        <Link
          to="/doctor/patients"
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-indigo-600/20 transition"
        >
          <Search className="w-4 h-4" />
          Request New Patient Access
        </Link>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-4">Patient</th>
              <th className="p-4">Requested Categories</th>
              <th className="p-4">Status & Validity</th>
              <th className="p-4">Clinical Purpose</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">Loading requests...</td>
              </tr>
            ) : consents.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">No consent requests dispatched yet.</td>
              </tr>
            ) : (
              consents.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 transition">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{c.patient_name}</div>
                    <div className="text-[10px] text-teal-700 font-mono">{c.health_id_number}</div>
                  </td>

                  <td className="p-4">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {(c.approved_categories?.length > 0 ? c.approved_categories : c.requested_categories)?.map((cat) => (
                        <span key={cat} className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[10px] font-semibold">
                          {getCategoryLabel(cat)}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="p-4">
                    <div className="space-y-1">
                      <StatusBadge status={c.status} />
                      {c.valid_until && (
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-teal-600" />
                          Exp: {formatDateTime(c.valid_until)}
                        </div>
                      )}
                    </div>
                  </td>

                  <td className="p-4 max-w-xs truncate text-slate-600">
                    "{c.reason}"
                  </td>

                  <td className="p-4 text-right">
                    {c.status === 'approved' && new Date(c.valid_until) > new Date() ? (
                      <Link
                        to={`/doctor/authorized-patients?patientId=${c.patient_id}`}
                        className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs inline-flex items-center gap-1 transition shadow-xs"
                      >
                        <span>Open Records</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">Locked</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
};
