import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, QrCode, Phone, Droplet, AlertTriangle, Eye, Printer } from 'lucide-react';
import { QRModal } from '../common/QRModal';

export const HealthIDCard = ({ patient, healthId, emergencyProfile }) => {
  const [showQRModal, setShowQRModal] = useState(false);
  const healthIdNumber = healthId?.health_id_number || 'HP-2026-1001';

  return (
    <>
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-900 via-sky-800 to-slate-900 text-white p-6 shadow-xl border border-sky-700/40">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        {/* Card Header */}
        <div className="flex items-center justify-between border-b border-sky-700/50 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs uppercase font-bold tracking-wider text-sky-300">
                DIGITAL HEALTH PASSPORT
              </div>
              <div className="text-[10px] text-slate-300">Government of India Standard (ABDM Aligned)</div>
            </div>
          </div>

          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Verified Profile
          </span>
        </div>

        {/* Card Body */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar and QR button */}
          <div className="flex flex-col items-center gap-2">
            <div className="relative">
              <img
                src={patient?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=face'}
                alt="Patient Profile"
                className="w-20 h-20 rounded-2xl object-cover border-2 border-sky-400/40 shadow-md"
              />
              <div className="absolute -bottom-1 -right-1 p-1 bg-sky-600 rounded-lg text-white shadow">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
            </div>

            <button
              onClick={() => setShowQRModal(true)}
              className="flex items-center gap-1.5 text-[11px] font-medium bg-sky-800/80 hover:bg-sky-700 text-sky-200 px-3 py-1 rounded-lg border border-sky-600/40 transition"
            >
              <QrCode className="w-3.5 h-3.5" />
              View QR
            </button>
          </div>

          {/* Core Info */}
          <div className="flex-1 text-center sm:text-left space-y-2">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                {patient?.first_name} {patient?.last_name}
              </h2>
              <div className="font-mono text-sm font-semibold text-sky-300 flex items-center justify-center sm:justify-start gap-2">
                <span>{healthIdNumber}</span>
              </div>
            </div>

            {/* Badges Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 text-xs">
              <div className="bg-slate-900/60 p-2 rounded-xl border border-sky-800/40">
                <span className="text-[10px] uppercase text-sky-400 block font-semibold">Blood Group</span>
                <span className="font-bold text-white flex items-center gap-1 mt-0.5">
                  <Droplet className="w-3.5 h-3.5 text-rose-400" />
                  {patient?.blood_group || 'O+'} (Verified)
                </span>
              </div>

              <div className="bg-slate-900/60 p-2 rounded-xl border border-sky-800/40">
                <span className="text-[10px] uppercase text-sky-400 block font-semibold">Emergency Contact</span>
                <span className="font-medium text-slate-200 flex items-center gap-1 mt-0.5 text-[11px]">
                  <Phone className="w-3 h-3 text-emerald-400" />
                  {emergencyProfile?.emergency_contact_phone || '+91 98201 99001'}
                </span>
              </div>

              <div className="bg-slate-900/60 p-2 rounded-xl border border-sky-800/40 col-span-2 sm:col-span-1">
                <span className="text-[10px] uppercase text-sky-400 block font-semibold">Known Allergies</span>
                <span className="font-medium text-amber-300 flex items-center gap-1 mt-0.5 text-[11px]">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  {emergencyProfile?.allergies?.join(', ') || 'Penicillin'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick QR Mini */}
          <div
            onClick={() => setShowQRModal(true)}
            className="hidden md:flex flex-col items-center justify-center bg-white p-2 rounded-xl cursor-pointer hover:scale-105 transition shadow-lg shrink-0"
            title="Click to expand QR"
          >
            <QRCodeSVG
              value={`${window.location.origin}/emergency/${emergencyProfile?.qr_token || 'emg_7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c'}`}
              size={68}
              level="M"
            />
            <span className="text-[9px] text-slate-700 font-bold mt-1">Scan ID</span>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-4 pt-3 border-t border-sky-700/40 flex flex-col sm:flex-row items-center justify-between text-[11px] text-sky-200/80 gap-2">
          <span>Protected by Multi-Factor Row-Level Security</span>
          <button
            onClick={() => setShowQRModal(true)}
            className="text-white hover:text-sky-300 font-semibold underline flex items-center gap-1"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Digital Health Card
          </button>
        </div>

      </div>

      <QRModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        patient={patient}
        healthId={healthIdNumber}
        qrToken={emergencyProfile?.qr_token}
      />
    </>
  );
};
