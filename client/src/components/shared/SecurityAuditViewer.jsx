import React, { useState, useEffect } from 'react';
import { auditAPI } from '../../services/api';
import { ShieldCheck, ShieldAlert, Clock, Search, Filter, Eye, User, Laptop } from 'lucide-react';
import { formatDateTime, getCategoryLabel } from '../../utils/helpers';
import { StatusBadge } from '../common/StatusBadge';

export const SecurityAuditViewer = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    auditAPI.listAuditLogs().then((res) => {
      setLogs(res.data?.logs || []);
      setLoading(false);
    }).catch((err) => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.actor_name?.toLowerCase().includes(search.toLowerCase()) ||
      log.action?.toLowerCase().includes(search.toLowerCase()) ||
      log.ip_address?.includes(search);

    const matchesAction = actionFilter === 'all' || log.action.includes(actionFilter);
    return matchesSearch && matchesAction;
  });

  const getActionLabel = (action) => {
    switch (action) {
      case 'search_patient': return 'Searched Patient (Zero-Trust ID)';
      case 'request_consent': return 'Requested Record Access';
      case 'approve_consent': return 'Granted Consent Authorization';
      case 'deny_consent': return 'Denied Consent Request';
      case 'revoke_consent': return 'Revoked Medical Access';
      case 'view_medical_records': return 'Accessed Medical Records';
      case 'view_medical_records_denied': return 'Blocked Unauthorized Record Access';
      case 'view_lab_report': return 'Reviewed Lab Report';
      case 'create_prescription': return 'Issued Digital Prescription';
      case 'record_consultation': return 'Recorded Clinical Notes';
      case 'view_emergency_profile': return 'Emergency Profile Override View';
      default: return action.replace(/_/g, ' ');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600" />
            Immutable Medical Access Audit Trail
          </h3>
          <p className="text-xs text-slate-500">
            Every query, emergency view, consent grant, and record access is permanently recorded.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl border border-slate-200">
            {logs.length} Total Audit Records
          </span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search by actor, action, or IP address..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-none"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="p-2 rounded-xl border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-teal-500 focus:outline-none"
        >
          <option value="all">All Actions</option>
          <option value="search">Patient Search</option>
          <option value="consent">Consent Events</option>
          <option value="view">Record Access</option>
          <option value="prescription">Prescriptions</option>
          <option value="emergency">Emergency Overrides</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
            <tr>
              <th className="p-3">Timestamp</th>
              <th className="p-3">Actor / Role</th>
              <th className="p-3">Action Performed</th>
              <th className="p-3">Categories / Details</th>
              <th className="p-3">Consent Status</th>
              <th className="p-3">Client Info</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">
                  Loading secure audit records...
                </td>
              </tr>
            ) : filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-slate-400">
                  No audit log entries matching your criteria.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition">
                  <td className="p-3 whitespace-nowrap font-mono text-[11px] text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {formatDateTime(log.created_at)}
                    </span>
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    <div className="font-bold text-slate-800 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-teal-600" />
                      {log.actor_name || 'System User'}
                    </div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">
                      {log.actor_role}
                    </span>
                  </td>

                  <td className="p-3">
                    <span className="font-semibold text-slate-900">
                      {getActionLabel(log.action)}
                    </span>
                  </td>

                  <td className="p-3">
                    {log.category_accessed ? (
                      <span className="px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 font-mono text-[10px]">
                        {getCategoryLabel(log.category_accessed)}
                      </span>
                    ) : (
                      <span className="text-slate-400 text-[11px]">—</span>
                    )}
                  </td>

                  <td className="p-3 whitespace-nowrap">
                    <StatusBadge status={log.consent_status || 'authorized'} />
                  </td>

                  <td className="p-3 whitespace-nowrap text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center gap-1">
                      <Laptop className="w-3 h-3 text-slate-400" />
                      {log.ip_address || '127.0.0.1'}
                    </div>
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
