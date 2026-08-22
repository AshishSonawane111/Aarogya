import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from './Modal';
import { ShieldCheck, Download, Printer, AlertCircle } from 'lucide-react';

export const QRModal = ({ isOpen, onClose, patient, healthId }) => {
  if (!patient) return null;

  const qrValue = `HP:${patient.first_name?.toUpperCase()}_${patient.last_name?.toUpperCase()}:${healthId || 'HP-2026-1001'}:${patient.blood_group || 'UNKNOWN'}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Health ID & QR Scanner" maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center space-y-4">
        
        {/* Printable Card Area */}
        <div className="printable-health-card w-full bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-teal-600/30">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-teal-700/50 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-teal-400" />
              <span className="font-bold text-sm tracking-wide">HEALTH PASSPORT</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Verified ID
            </span>
          </div>

          {/* QR Code */}
          <div className="bg-white p-3 rounded-xl shadow-inner inline-block my-2">
            <QRCodeSVG value={qrValue} size={150} level="H" includeMargin={false} />
          </div>

          {/* Details */}
          <div className="mt-3 space-y-1">
            <div className="text-base font-bold tracking-tight">
              {patient.first_name} {patient.last_name}
            </div>
            <div className="font-mono text-sm text-teal-300 font-bold">
              {healthId || 'HP-2026-1001'}
            </div>
            <div className="flex justify-center items-center gap-4 text-xs text-slate-300 pt-2 border-t border-teal-700/40 mt-3">
              <div>
                <span className="text-teal-400 block text-[10px] uppercase">Blood Group</span>
                <span className="font-bold text-white">{patient.blood_group || 'O+'}</span>
              </div>
              <div>
                <span className="text-teal-400 block text-[10px] uppercase">Gender</span>
                <span className="font-semibold capitalize">{patient.gender || 'Male'}</span>
              </div>
              <div>
                <span className="text-teal-400 block text-[10px] uppercase">Location</span>
                <span className="font-semibold">{patient.city || 'India'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-start gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Scanning this QR code identifies the patient only. Medical records remain encrypted and require patient approval before access is granted.
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 w-full pt-2 no-print">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-4 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Card
          </button>
          <button
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            Close
          </button>
        </div>

      </div>
    </Modal>
  );
};
