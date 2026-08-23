import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Modal } from './Modal';
import { ShieldCheck, Download, Printer, AlertCircle } from 'lucide-react';

export const QRModal = ({ isOpen, onClose, patient, healthId, qrToken }) => {
  if (!patient) return null;

  const activeToken = qrToken || patient.qr_token || 'emg_7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c';
  const emergencyUrl = `${window.location.origin}/emergency/${activeToken}`;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('emergency-qr-code-svg');
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      if (ctx) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 20, 20);
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `Aarogya_Emergency_QR_${patient.first_name || 'Patient'}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Digital Health ID & Emergency QR" maxWidth="max-w-md">
      <div className="flex flex-col items-center text-center space-y-4">
        
        {/* Printable Card Area */}
        <div className="printable-health-card w-full bg-gradient-to-br from-sky-900 via-sky-800 to-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-sky-600/30">
          
          <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header */}
          <div className="flex items-center justify-between border-b border-sky-700/50 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-sky-400" />
              <span className="font-bold text-sm tracking-wide">HEALTH PASSPORT</span>
            </div>
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              EMERGENCY QR
            </span>
          </div>

          {/* QR Code */}
          <div className="bg-white p-3 rounded-2xl shadow-inner inline-block my-2">
            <QRCodeSVG id="emergency-qr-code-svg" value={emergencyUrl} size={160} level="H" includeMargin={false} />
          </div>

          {/* Scan Explanation */}
          <div className="text-[11px] font-bold text-sky-200 uppercase tracking-wider mt-1">
            Scan to view Emergency Profile
          </div>

          {/* Details */}
          <div className="mt-3 space-y-1">
            <div className="text-base font-bold tracking-tight">
              {patient.first_name} {patient.last_name}
            </div>
            <div className="font-mono text-sm text-sky-300 font-bold">
              {healthId || 'HP-2026-1001'}
            </div>
            <div className="flex justify-center items-center gap-4 text-xs text-slate-300 pt-2 border-t border-sky-700/40 mt-3">
              <div>
                <span className="text-sky-400 block text-[10px] uppercase font-semibold">Blood Group</span>
                <span className="font-bold text-white">{patient.blood_group || 'O+'}</span>
              </div>
              <div>
                <span className="text-sky-400 block text-[10px] uppercase font-semibold">Gender</span>
                <span className="font-semibold capitalize">{patient.gender || 'Male'}</span>
              </div>
              <div>
                <span className="text-sky-400 block text-[10px] uppercase font-semibold">Location</span>
                <span className="font-semibold">{patient.city || 'India'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="bg-sky-50 border border-sky-200 text-sky-950 rounded-xl p-3 text-xs flex items-start gap-2 text-left">
          <AlertCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            Scanning this QR opens the patient's public Emergency Profile (blood group, allergies, emergency contacts) on any smartphone without exposing passwords or private medical history.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full pt-2 no-print">
          <button
            onClick={handleDownloadQR}
            className="flex-1 py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
          >
            <Download className="w-4 h-4" />
            Download QR
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
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
