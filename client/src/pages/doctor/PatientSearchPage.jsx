import React from 'react';
import { PatientSearchBar } from '../../components/doctor/PatientSearchBar';
import { Search, ShieldAlert, KeyRound, CheckCircle2 } from 'lucide-react';

export const PatientSearchPage = () => {
  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Search className="w-5 h-5 text-teal-600" />
          Zero-Trust Patient Lookup & Consent Requester
        </h2>
        <p className="text-xs text-slate-500">
          Identify citizens via unique Digital Health ID or QR code. Patient consent is strictly enforced before medical records can be decrypted.
        </p>
      </div>

      <PatientSearchBar />
    </div>
  );
};
