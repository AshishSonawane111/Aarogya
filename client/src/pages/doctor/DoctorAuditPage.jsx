import React from 'react';
import { SecurityAuditViewer } from '../../components/shared/SecurityAuditViewer';
import { History } from 'lucide-react';

export const DoctorAuditPage = () => {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          Clinical Access & Audit Logging Trail
        </h2>
        <p className="text-xs text-slate-500">
          Immutable ledger of all patient queries, consent authorizations, and medical file access sessions performed by your account.
        </p>
      </div>

      <SecurityAuditViewer />
    </div>
  );
};
